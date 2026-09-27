// Scheduled job: checks official party source pages and updates proposals.
// AI is used ONLY to extract proposals that appear verbatim in the official page text.
// Every extracted proposal must include an excerpt that is found in the page text,
// otherwise it is discarded. Proposals are never deleted; missing ones become "outdated".
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// Categories map 1:1 onto the existing "Explorar Temas" topics (see src/data/topics.ts). No new topics.
const CATEGORIES = ['Habitação', 'Saúde', 'Ambiente', 'Educação', 'Economia', 'Fiscalidade', 'Trabalho', 'Segurança', 'Justiça', 'Infraestruturas', 'Transportes', 'Proteção Social'];

async function pdfToText(buf: ArrayBuffer) {
  const { extractText, getDocumentProxy } = await import('npm:unpdf@0.12.1');
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  const { text } = await extractText(pdf, { mergePages: true });
  return (Array.isArray(text) ? text.join(' ') : text).replace(/\s+/g, ' ').trim();
}
const BANNED = /\b(bom|boa|mau|má|melhor|pior|radical|perigos[oa]|benéfic[oa]|prejudicial|extremista|perfeit[oa]|terrível)\b/i;

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

async function sha256(t: string) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

function htmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(nav|footer|header)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function extractWithAI(text: string, partyName: string) {
  const key = Deno.env.get('LOVABLE_API_KEY');
  if (!key) throw new Error('LOVABLE_API_KEY missing');
  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content:
            `Extrais propostas políticas do texto de uma página oficial do partido ${partyName}. Regras estritas: ` +
            `1) Só incluis propostas escritas explicitamente no texto. Nunca inventes nem infiras. ` +
            `2) "excerpt" tem de ser uma citação LITERAL copiada do texto (20-300 caracteres). ` +
            `3) "neutral_summary" descreve o que o partido propõe, em português de Portugal, sem adjetivos avaliativos. ` +
            `4) "category" tem de ser uma de: ${CATEGORIES.join(', ')}; se nenhuma encaixar, omite a proposta. ` +
            `5) Se não houver propostas claras, devolve lista vazia. Máximo 10 propostas.`,
        },
        { role: 'user', content: text.slice(0, 60000) },
      ],
      tools: [{
        type: 'function',
        function: {
          name: 'save_proposals',
          parameters: {
            type: 'object',
            properties: {
              proposals: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    neutral_summary: { type: 'string' },
                    category: { type: 'string', enum: CATEGORIES },
                    excerpt: { type: 'string' },
                  },
                  required: ['title', 'neutral_summary', 'category', 'excerpt'],
                },
              },
            },
            required: ['proposals'],
          },
        },
      }],
      tool_choice: { type: 'function', function: { name: 'save_proposals' } },
    }),
  });
  if (!res.ok) throw new Error(`AI ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  return (args ? JSON.parse(args).proposals : []) as { title: string; neutral_summary: string; category: string; excerpt: string }[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const now = new Date().toISOString();
  const report: Record<string, unknown>[] = [];

  const { data: pages, error } = await sb
    .from('party_source_pages')
    .select('*, parties(name, existing_party_key)')
    .eq('active', true);
  let onlyKey: string | null = null;
  try { const b = await req.json(); if (typeof b?.party_key === 'string') onlyKey = b.party_key; } catch { /* no body */ }
  if (error) return json({ error: error.message }, 500);

  for (const page of (pages ?? []).filter((pg: any) => !onlyKey || pg.parties?.existing_party_key === onlyKey)) {
    const partyName = (page as any).parties?.name ?? '';
    try {
      const r = await fetch(page.url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BePolitic-Verifier/1.0)' }, signal: AbortSignal.timeout(45000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const isPdf = (r.headers.get('content-type') ?? '').includes('pdf') || page.url.toLowerCase().includes('.pdf');
      const text = isPdf ? await pdfToText(await r.arrayBuffer()) : htmlToText(await r.text());
      if (text.length < 200) throw new Error('page content too short');
      const pageHash = await sha256(text);
      const published = r.headers.get('last-modified');

      if (pageHash === page.last_content_hash) {
        // Unchanged: re-confirm existing verified proposals from this page.
        await sb.from('proposals').update({ last_verified_at: now, last_verified_date: now.slice(0, 10) })
          .eq('party_id', page.party_id).eq('official_source_url', page.url).eq('status', 'verified');
        await sb.from('party_source_pages').update({ last_checked_at: now, last_status: 'unchanged', needs_reverification: false }).eq('id', page.id);
        report.push({ url: page.url, result: 'unchanged' });
        continue;
      }

      // Long programmes: analyse up to 4 evenly spaced chunks of ~50k chars.
      const CH = 50000;
      const n = Math.ceil(text.length / CH);
      const idx = n <= 4 ? [...Array(n).keys()] : [0, 1, 2, 3].map((i) => Math.floor((i * n) / 4));
      const extracted: Awaited<ReturnType<typeof extractWithAI>> = [];
      const aiErrors: string[] = [];
      for (const i of idx) {
        try { extracted.push(...(await extractWithAI(text.slice(i * CH, (i + 1) * CH), partyName))); } catch (e) { aiErrors.push((e as Error).message); console.error('AI chunk failed', i, e); }
      }
      const normText = norm(text);
      const seen = new Set<string>();
      let saved = 0;

      for (const p of extracted) {
        // Anti-hallucination: excerpt must exist literally in the page.
        if (!p.excerpt || !normText.includes(norm(p.excerpt))) continue;
        if (!CATEGORIES.includes(p.category)) continue;
        const neutral = !BANNED.test(p.neutral_summary) && !BANNED.test(p.title);
        const hash = await sha256(norm(p.excerpt));
        seen.add(hash);
        const { error: upErr } = await sb.from('proposals').upsert({
          party_id: page.party_id,
          category: p.category,
          title: p.title.slice(0, 200),
          neutral_summary: p.neutral_summary.slice(0, 1000),
          original_excerpt: p.excerpt,
          official_source_url: page.url,
          source_name: page.source_name,
          source_document_name: page.source_document_name,
          source_published_at: published ? new Date(published).toISOString() : null,
          last_verified_at: now,
          last_verified_date: now.slice(0, 10),
          content_hash: hash,
          status: neutral ? 'verified' : 'unverified',
        }, { onConflict: 'party_id,content_hash' });
        if (!upErr) saved++;
      }

      // Previously auto-extracted proposals from this page that are no longer present -> outdated (never deleted).
      const { data: existing } = await sb.from('proposals').select('id, content_hash')
        .eq('party_id', page.party_id).eq('official_source_url', page.url).not('content_hash', 'is', null);
      const stale = (existing ?? []).filter((e) => !seen.has(e.content_hash!)).map((e) => e.id);
      if (stale.length) await sb.from('proposals').update({ status: 'outdated' }).in('id', stale);

      await sb.from('party_source_pages').update({ last_checked_at: now, last_content_hash: pageHash, last_status: `updated:${saved}` }).eq('id', page.id);
      report.push({ url: page.url, result: 'updated', saved, textLength: text.length, extracted: extracted.length, aiErrors, outdated: stale.length });
    } catch (e) {
      // Source unreachable: keep data, but record the failure. Proposals keep their last verification date.
      await sb.from('party_source_pages').update({ last_checked_at: now, last_status: `error: ${(e as Error).message}` }).eq('id', page.id);
      report.push({ url: page.url, result: 'error', error: (e as Error).message });
    }
  }

  return json({ ok: true, checked: report.length, report });
});
