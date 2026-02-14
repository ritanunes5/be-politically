import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RSS_FEEDS = [
  { url: "https://feeds.feedburner.com/PublicoPolitica", source: "Público" },
  { url: "https://www.rtp.pt/noticias/rss/politica", source: "RTP" },
];

function extractCDATA(text: string): string {
  const match = text.match(/<!\[CDATA\[(.*?)\]\]>/s);
  return match ? match[1].trim() : text.trim();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

const TOPIC_KEYWORDS: Record<string, string[]> = {
  "Habitação": ["habitação", "habitacao", "arrendamento", "renda", "rendas", "casa", "casas", "imobiliário", "imobiliario", "alojamento", "despejos", "despejo", "inquilinos", "senhorio", "hipoteca"],
  "Ambiente": ["ambiente", "clima", "climática", "climatica", "carbono", "emissões", "emissoes", "poluição", "poluicao", "sustentável", "sustentavel", "energias renováveis", "renovaveis", "biodiversidade", "reciclagem", "lixo", "resíduos", "residuos"],
  "Saúde": ["saúde", "saude", "sns", "hospital", "hospitais", "médico", "medico", "médicos", "medicos", "enfermeiro", "vacina", "pandemia", "farmácia", "farmacia", "urgências", "urgencias", "doença", "doenca"],
  "Educação": ["educação", "educacao", "escola", "escolas", "professor", "professores", "ensino", "universidade", "alunos", "estudantes", "propinas", "creche", "creches", "infantário", "infantario"],
  "Economia": ["economia", "económica", "economica", "orçamento", "orcamento", "impostos", "imposto", "iva", "irs", "irc", "dívida", "divida", "défice", "defice", "deficit", "inflação", "inflacao", "pib", "salário", "salario", "salários", "salarios", "emprego", "desemprego"],
  "Infraestruturas": ["infraestrutura", "infraestruturas", "ferrovia", "comboio", "comboios", "autoestrada", "metro", "aeroporto", "ponte", "estrada", "obras", "transportes", "ferrovia", "cp", "tap"],
  "Segurança": ["segurança", "seguranca", "polícia", "policia", "crime", "criminalidade", "psp", "gnr", "prisão", "prisao", "terrorismo", "defesa", "forças armadas", "forcas armadas", "militar"],
  "Proteção Social": ["proteção social", "protecao social", "pensões", "pensoes", "reforma", "reformas", "subsídio", "subsidio", "pobreza", "exclusão", "exclusao", "rsi", "abono", "segurança social", "seguranca social"],
};

function classifyTopic(title: string, summary: string | null): string | null {
  const text = `${title} ${summary || ""}`.toLowerCase();
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) return topic;
    }
  }
  return null;
}

async function parseRSSFeed(
  feedUrl: string,
  source: string
): Promise<
  Array<{
    title: string;
    summary: string | null;
    url: string;
    published_at: string | null;
    source: string;
    category: string;
  }>
> {
  console.log(`Fetching RSS feed: ${feedUrl}`);
  const response = await fetch(feedUrl, {
    headers: { "User-Agent": "BePolitic/1.0" },
  });

  if (!response.ok) {
    console.error(`Failed to fetch ${feedUrl}: ${response.status}`);
    return [];
  }

  const xml = await response.text();
  const articles: Array<{
    title: string;
    summary: string | null;
    url: string;
    published_at: string | null;
    source: string;
    category: string;
  }> = [];

  // Simple XML parsing for RSS <item> elements
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];

    const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
    const descMatch = item.match(/<description>([\s\S]*?)<\/description>/);
    const pubDateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

    const title = titleMatch ? stripHtml(extractCDATA(titleMatch[1])) : null;
    const link = linkMatch ? extractCDATA(linkMatch[1]) : null;

    if (!title || !link) continue;

    const description = descMatch
      ? stripHtml(extractCDATA(descMatch[1])).substring(0, 500)
      : null;

    let publishedAt: string | null = null;
    if (pubDateMatch) {
      try {
        publishedAt = new Date(extractCDATA(pubDateMatch[1])).toISOString();
      } catch {
        publishedAt = null;
      }
    }

    articles.push({
      title,
      summary: description,
      url: link,
      published_at: publishedAt,
      source,
      category: "Política",
      topic: classifyTopic(title, description),
    });
  }

  console.log(`Parsed ${articles.length} articles from ${source}`);
  return articles;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const allArticles = [];
    for (const feed of RSS_FEEDS) {
      const articles = await parseRSSFeed(feed.url, feed.source);
      allArticles.push(...articles);
    }

    let inserted = 0;
    let skipped = 0;

    for (const article of allArticles) {
      const { error } = await supabase.from("news_articles").upsert(
        {
          title: article.title,
          summary: article.summary,
          url: article.url,
          published_at: article.published_at,
          source: article.source,
          category: article.category,
          topic: article.topic,
        },
        { onConflict: "url" }
      );

      if (error) {
        console.error(`Error inserting article: ${error.message}`);
        skipped++;
      } else {
        inserted++;
      }
    }

    const result = {
      success: true,
      total: allArticles.length,
      inserted,
      skipped,
    };
    console.log("Fetch complete:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
