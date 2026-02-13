import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RSS_FEEDS = [
  { url: "https://www.publico.pt/rss/politica", source: "Público" },
  { url: "https://www.rtp.pt/noticias/rss/politica", source: "RTP" },
];

function extractCDATA(text: string): string {
  const match = text.match(/<!\[CDATA\[(.*?)\]\]>/s);
  return match ? match[1].trim() : text.trim();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
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
