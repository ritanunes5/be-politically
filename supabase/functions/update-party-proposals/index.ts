// Scheduled job: reads each party's official electoral programme (PDF or HTML) in small page
// batches across runs, so the WHOLE document is covered within edge CPU limits.
// AI only extracts/summarises/classifies; every proposal must carry a literal excerpt found
// on the cited page, otherwise it is discarded. Topics/categories come from the `topics` table.
// Proposals are never deleted; ones no longer present after a full pass become "outdated".
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const PAGES_PER_RUN = 12;
const LEASE_MS = 5 * 60 * 1000;
const RECHECK_MS = 24 * 60 * 60 * 1000;
const MODEL = 'openai/gpt-6-astra';
const BANNED = /\b(bom|boa|mau|má|melhor|pior|radical|perigos[oa]|benéfic[oa]|prejudicial|extremista|perfeit[oa]|terrível|excelente|desastros[oa])\b/i;

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

async function sha256(data: string | ArrayBuffer) {
  const buf = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const d = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
const norm = (s: string) => s.toLowerCase().replace(/-\s+/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const tokens = (s: string) => new Set(norm(s).split(' ').filter((w) => w.length > 3));
function similarity(a: string, b: string) {
  const A = tokens(a), B = tokens(b);
  if (!A.size || !B.size) return 0;
  let i = 0; for (const t of A) if (B.has(t)) i++;
  return i / (A.size + B.size - i);
}
function htmlToText(html: string) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(nav|footer|header)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ').trim();
}

class AiError extends Error { constructor(public status: number, msg: string) { super(msg); } }

// Streams a Responses API call and returns the final output text.
async function callAI(input: unknown[], schema?: Record<string, unknown>) {
  const key = Deno.env.get('LOVABLE_API_KEY');
  if (!key) throw new AiError(401, 'LOVABLE_API_KEY missing');
  const res = await fetch('https://ai.gateway.lovable.dev/v1/responses', {
    method: 'POST',
    headers: { 'Lovable-API-Key': key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'X-Lovable-AIG-SDK': 'fetch' },
    body: JSON.stringify({
      model: MODEL, stream: true, store: false, input,
      reasoning: { effort: 'low' },
      ...(schema ? { text: { format: { type: 'json_schema', name: 'result', strict: true, schema } } } : {}),
    }),
  });
  if (!res.ok || !res.body) throw new AiError(res.status, `AI ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = '', out = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += value;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line.startsWith('data:')) continue;
      const d = line.slice(5).trim();
      if (!d || d === '[DONE]') continue;
      try {
        const ev = JSON.parse(d);
        if (ev.type === 'response.output_text.delta') out += ev.delta ?? '';
        else if (ev.type === 'error' || ev.type === 'response.failed') throw new AiError(500, JSON.stringify(ev).slice(0, 300));
      } catch (e) { if (e instanceof AiError) throw e; }
    }
  }
  return out;
}

type Topic = { key: string; name: string; categories: string[]; description_hint: string | null };
type Extracted = { page: number; title: string; neutral_summary: string; category: string; excerpt: string };

async function extractProposals(pages: { n: number; text: string }[], partyName: string, topics: Topic[]) {
  const categories = topics.flatMap((t) => t.categories);
  const guide = topics.map((t) => `- Tema "${t.name}" → categorias: ${t.categories.join(', ')}${t.description_hint ? ` (inclui: ${t.description_hint})` : ''}`).join('\n');
  const text = pages.map((p) => `[[PÁGINA ${p.n}]]\n${p.text}`).join('\n\n');
  const schema = {
    type: 'object', additionalProperties: false, required: ['proposals'],
    properties: { proposals: { type: 'array', items: {
      type: 'object', additionalProperties: false, required: ['page', 'title', 'neutral_summary', 'category', 'excerpt'],
      properties: {
        page: { type: 'integer' }, title: { type: 'string' }, neutral_summary: { type: 'string' },
        category: { type: 'string', enum: categories }, excerpt: { type: 'string' },
      },
    } } },
  };
  const out = await callAI([
    { role: 'system', content:
      `Analisas páginas do programa eleitoral oficial do partido ${partyName}. Identifica propostas políticas CONCRETAS (medidas, compromissos, ações) escritas no texto.\n` +
      `Classifica cada uma pelo SIGNIFICADO (não só por palavras exatas) numa das categorias abaixo, apenas quando a relação é clara:\n${guide}\n` +
      `Regras: 1) Nunca inventes, infiras ou completes com informação externa. 2) "excerpt" é uma citação LITERAL copiada do texto (30-300 caracteres). ` +
      `3) "page" é o número indicado em [[PÁGINA N]] onde está o excerto. 4) "neutral_summary": 1-2 frases factuais em português de Portugal, sem avaliar, sem adjetivos valorativos. ` +
      `5) "title": curto e descritivo. 6) Ignora diagnósticos, críticas e intenções vagas sem medida concreta. 7) Se não houver propostas, devolve lista vazia. Máximo 25.` },
    { role: 'user', content: text.slice(0, 90000) },
  ], schema);
  try { return (JSON.parse(out).proposals ?? []) as Extracted[]; } catch { return []; }
}

// OCR fallback for scanned pages: copy just those pages into a small PDF and ask for a literal transcription.
async function ocrPages(pdfBytes: Uint8Array, pageNums: number[]) {
  const { PDFDocument } = await import('npm:pdf-lib@1.17.1');
  const src = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const dst = await PDFDocument.create();
  const copied = await dst.copyPages(src, pageNums.map((n) => n - 1));
  copied.forEach((p) => dst.addPage(p));
  const bytes = await dst.save();
  let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const schema = { type: 'object', additionalProperties: false, required: ['pages'], properties: { pages: { type: 'array', items: {
    type: 'object', additionalProperties: false, required: ['index', 'text'], properties: { index: { type: 'integer' }, text: { type: 'string' } } } } } };
  const out = await callAI([{ role: 'user', content: [
    { type: 'input_text', text: `Transcreve literalmente o texto de cada página deste PDF (índice 1 a ${pageNums.length}). Não resumas nem acrescentes nada.` },
    { type: 'input_file', filename: 'paginas.pdf', file_data: `data:application/pdf;base64,${btoa(bin)}` },
  ] }], schema);
  const parsed = JSON.parse(out).pages as { index: number; text: string }[];
  return pageNums.map((n, i) => ({ n, text: parsed.find((p) => p.index === i + 1)?.text ?? '' }));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: authorized } = await sb.rpc('verify_cron_secret', { p_secret: req.headers.get('x-cron-secret') ?? '' });
  if (authorized !== true) return json({ error: 'Unauthorized' }, 401);

  let onlyKey: string | null = null;
  try { const b = await req.json(); if (typeof b?.party_key === 'string') onlyKey = b.party_key; } catch { /* no body */ }

  const nowD = new Date(), now = nowD.toISOString();
  const { data: all, error } = await sb.from('party_source_pages').select('*, parties(name, existing_party_key)').eq('active', true);
  if (error) return json({ error: error.message }, 500);

  // Workspace-level AI pause (402/403) blocks all runs until an admin clears paused_reason.
  if ((all ?? []).some((p: any) => p.paused_reason?.startsWith('ai_blocked'))) return json({ ok: true, skipped: 'paused', reason: 'ai_blocked' });

  const due = (all ?? []).filter((p: any) => {
    if (onlyKey && p.parties?.existing_party_key !== onlyKey) return false;
    if (p.lease_until && new Date(p.lease_until) > nowD) return false;
    if (onlyKey) return true;
    return p.next_page != null || p.needs_reverification || !p.last_checked_at || nowD.getTime() - new Date(p.last_checked_at).getTime() > RECHECK_MS;
  }).sort((a: any, b: any) => (b.next_page != null ? 1 : 0) - (a.next_page != null ? 1 : 0));
  const page: any = due[0];
  if (!page) return json({ ok: true, idle: true });

  // Single-flight lease.
  const { data: leased } = await sb.from('party_source_pages').update({ lease_until: new Date(nowD.getTime() + LEASE_MS).toISOString() })
    .eq('id', page.id).or(`lease_until.is.null,lease_until.lt.${now}`).select('id');
  if (!leased?.length) return json({ ok: true, skipped: 'locked' });

  const partyName = page.parties?.name ?? '';
  const release = (fields: Record<string, unknown>) =>
    sb.from('party_source_pages').update({ lease_until: null, last_checked_at: now, ...fields }).eq('id', page.id);

  try {
    const { data: topics } = await sb.from('topics').select('key, name, categories, description_hint');
    if (!topics?.length) throw new Error('no topics in database');
    const categories = (topics as Topic[]).flatMap((t) => t.categories);

    const r = await fetch(page.url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BePolitic-Verifier/1.0)' }, signal: AbortSignal.timeout(60000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const raw = await r.arrayBuffer();
    const docHash = await sha256(raw);
    const isPdf = (r.headers.get('content-type') ?? '').includes('pdf') || page.url.toLowerCase().includes('.pdf');
    const published = r.headers.get('last-modified');

    let startPage = page.next_page as number | null;
    let passStarted = page.pass_started_at as string | null;
    if (startPage == null || docHash !== page.last_content_hash && page.next_page == null) {
      if (startPage == null && docHash === page.last_content_hash && !page.needs_reverification && !onlyKey) {
        await sb.from('proposals').update({ last_verified_at: now, last_verified_date: now.slice(0, 10) })
          .eq('party_id', page.party_id).eq('official_source_url', page.url).eq('status', 'verified');
        await release({ last_status: 'unchanged', needs_reverification: false, paused_reason: null });
        return json({ ok: true, url: page.url, result: 'unchanged' });
      }
      startPage = 1; passStarted = now;
    }

    // Collect page texts for this batch.
    let batch: { n: number; text: string }[] = [];
    let total = 1;
    if (isPdf) {
      const { getDocumentProxy } = await import('npm:unpdf@0.12.1');
      const bytes = new Uint8Array(raw);
      const pdf = await getDocumentProxy(bytes.slice());
      total = pdf.numPages;
      const end = Math.min(total, startPage + PAGES_PER_RUN - 1);
      for (let n = startPage; n <= end; n++) {
        const pg = await pdf.getPage(n);
        const tc = await pg.getTextContent();
        batch.push({ n, text: tc.items.map((it: any) => it.str ?? '').join(' ').replace(/\s+/g, ' ').trim() });
        pg.cleanup();
      }
      const scanned = batch.filter((b) => b.text.length < 40).map((b) => b.n);
      if (scanned.length >= Math.ceil(batch.length / 2)) {
        const ocr = await ocrPages(bytes, scanned);
        batch = batch.map((b) => ocr.find((o) => o.n === b.n && o.text.length > b.text.length) ?? b);
      }
    } else {
      batch = [{ n: 1, text: htmlToText(new TextDecoder().decode(raw)) }];
    }
    const lastInBatch = batch.length ? batch[batch.length - 1].n : startPage;

    const usable = batch.filter((b) => b.text.length >= 40);
    const extracted = usable.length ? await extractProposals(usable, partyName, topics as Topic[]) : [];

    const { data: existing } = await sb.from('proposals')
      .select('id, category, title, neutral_summary, content_hash, original_excerpt').eq('party_id', page.party_id);
    let inserted = 0, updated = 0, rejected = 0;
    const seenInRun = new Set<string>();

    for (const p of extracted) {
      if (!categories.includes(p.category) || !p.excerpt) { rejected++; continue; }
      const ne = norm(p.excerpt);
      // Anti-hallucination: locate the excerpt literally; the page where it is found is authoritative.
      const hit = usable.find((b) => norm(b.text).includes(ne));
      if (!hit || ne.length < 20) { rejected++; continue; }
      const hash = await sha256(ne);
      if (seenInRun.has(hash)) continue;
      seenInRun.add(hash);
      const neutral = !BANNED.test(p.neutral_summary) && !BANNED.test(p.title);
      const row = {
        party_id: page.party_id, category: p.category, title: p.title.slice(0, 200), neutral_summary: p.neutral_summary.slice(0, 1000),
        original_excerpt: p.excerpt, official_source_url: page.url, source_name: page.source_name,
        source_document_name: page.source_document_name, source_page: isPdf ? hit.n : null,
        source_published_at: published ? new Date(published).toISOString() : null,
        last_verified_at: now, last_verified_date: now.slice(0, 10), status: neutral ? 'verified' : 'unverified',
      };
      // Dedup: same excerpt hash, or an equivalent proposal for the same party + category.
      const match = (existing ?? []).find((e) => e.content_hash === hash) ??
        (existing ?? []).find((e) => e.category === p.category &&
          (similarity(`${e.title} ${e.neutral_summary}`, `${p.title} ${p.neutral_summary}`) >= 0.5 ||
           (e.original_excerpt && similarity(e.original_excerpt, p.excerpt) >= 0.6)));
      if (match) {
        const upd: Record<string, unknown> = { ...row };
        if (match.content_hash !== hash) upd.content_hash = hash;
        let { error: e1 } = await sb.from('proposals').update(upd).eq('id', match.id);
        if (e1) ({ error: e1 } = await sb.from('proposals').update(row).eq('id', match.id));
        if (!e1) updated++; else console.error('update', e1.message);
      } else {
        const { data: ins, error: e2 } = await sb.from('proposals').insert({ ...row, content_hash: hash }).select('id, category, title, neutral_summary, content_hash, original_excerpt').single();
        if (!e2 && ins) { inserted++; existing?.push(ins); } else console.error('insert', e2?.message);
      }
    }

    const finished = !isPdf || lastInBatch >= total;
    let outdated = 0;
    if (finished && passStarted) {
      const { data: stale } = await sb.from('proposals').select('id').eq('party_id', page.party_id).eq('official_source_url', page.url)
        .eq('status', 'verified').not('content_hash', 'is', null).lt('last_verified_at', passStarted);
      if (stale?.length) { await sb.from('proposals').update({ status: 'outdated' }).in('id', stale.map((s) => s.id)); outdated = stale.length; }
    }

    await release(finished
      ? { next_page: null, total_pages: total, pass_started_at: null, last_content_hash: docHash, needs_reverification: false, paused_reason: null, last_status: `complete: pages ${total}` }
      : { next_page: lastInBatch + 1, total_pages: total, pass_started_at: passStarted, paused_reason: null, last_status: `reading: ${lastInBatch}/${total}` });

    return json({ ok: true, party: page.parties?.existing_party_key, pages: `${startPage}-${lastInBatch}/${total}`, extracted: extracted.length, inserted, updated, rejected, outdated, finished });
  } catch (e) {
    const err = e as Error;
    const status = e instanceof AiError ? e.status : 0;
    // Circuit breaker: 402/403 pause everything; 429 waits for next run. Data is never deleted.
    const paused = status === 402 || status === 403 ? `ai_blocked:${status}` : status === 429 ? 'rate_limited' : null;
    await release({ last_status: `error: ${err.message.slice(0, 300)}`, needs_reverification: true, paused_reason: paused });
    return json({ ok: false, url: page.url, error: err.message }, status === 402 || status === 403 ? status : 200);
  }
});
