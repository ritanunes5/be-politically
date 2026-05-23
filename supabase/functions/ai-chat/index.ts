import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `És o assistente do Be+Politic, uma plataforma portuguesa de literacia política para jovens.

Regras absolutas:
- Sê estritamente IMPARCIAL. Nunca recomendes votar num partido. Nunca uses linguagem partidária ("nós", "eles").
- Quando comparares posições, apresenta sempre múltiplos lados (PS, PSD, IL, BE, PCP, Chega, PAN, Livre quando aplicável).
- Usa linguagem simples, direta e acessível. Frases curtas. Markdown leve (listas, **negrito** para conceitos).
- Se a pergunta não é sobre política/sociedade portuguesa, redireciona educadamente.
- Se não tens certeza de um facto, di-lo explicitamente. Não inventes dados, datas ou propostas concretas.
- Responde sempre em português europeu.
- Mantém respostas concisas (máx ~250 palavras) salvo se pedirem detalhe.`;

const FREE_DAILY_LIMIT = 1;

// Input validation limits for client-supplied messages
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 2000;
const MAX_TOTAL_CHARS = 20000;
const ALLOWED_ROLES = new Set(["user", "assistant"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Sessão inválida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json();
    const rawMessages = body?.messages;
    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return new Response(JSON.stringify({ error: "Mensagens em falta" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (rawMessages.length > MAX_MESSAGES) {
      return new Response(
        JSON.stringify({ error: `Demasiadas mensagens (máx ${MAX_MESSAGES})` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let totalChars = 0;
    const sanitizedMessages: { role: "user" | "assistant"; content: string }[] = [];
    for (const m of rawMessages) {
      if (!m || typeof m !== "object") continue;
      const role = (m as { role?: unknown }).role;
      const content = (m as { content?: unknown }).content;
      if (typeof role !== "string" || !ALLOWED_ROLES.has(role)) {
        return new Response(
          JSON.stringify({ error: "Função de mensagem inválida" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (typeof content !== "string" || content.length === 0) {
        return new Response(
          JSON.stringify({ error: "Conteúdo de mensagem inválido" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (content.length > MAX_MESSAGE_CHARS) {
        return new Response(
          JSON.stringify({ error: `Mensagem demasiado longa (máx ${MAX_MESSAGE_CHARS} caracteres)` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      totalChars += content.length;
      if (totalChars > MAX_TOTAL_CHARS) {
        return new Response(
          JSON.stringify({ error: "Histórico de conversa demasiado longo" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      sanitizedMessages.push({ role: role as "user" | "assistant", content });
    }

    if (sanitizedMessages.length === 0) {
      return new Response(JSON.stringify({ error: "Mensagens em falta" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Quota check + atomic record. `record_usage` enforces the daily limit
    // server-side inside a single transaction and raises if exceeded, which
    // closes the TOCTOU window between SELECT count and INSERT.
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("user_id", userId)
      .maybeSingle();
    const isPremium = profile?.subscription_tier === "premium";

    if (!isPremium) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("usage_tracking")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("action_type", "ai_chat")
        .gte("used_at", startOfDay.toISOString());
      if ((count ?? 0) >= FREE_DAILY_LIMIT) {
        return new Response(
          JSON.stringify({
            error: "Limite gratuito atingido",
            code: "QUOTA_EXCEEDED",
          }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          stream: true,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map((m: { role: string; content: string }) => ({
              role: m.role,
              content: m.content,
            })),
          ],
        }),
      }
    );

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Demasiados pedidos, tenta daqui a pouco." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "Erro do serviço de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record usage (best effort, don't block the stream)
    supabase.rpc("record_usage", { p_action_type: "ai_chat" }).then(({ error }) => {
      if (error) console.error("record_usage failed", error);
    });

    return new Response(aiResp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (err) {
    console.error("ai-chat error", err);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
