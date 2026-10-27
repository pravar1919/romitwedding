/* Tiny visit counter in front of the static site.
   POST /api/hit {e, v}  — the page reports a view, an "Open Your Invitation" tap or a music tap
   GET  /stats?key=…     — private totals page (key is the STATS_KEY secret)
   Everything else falls through to the static assets (see run_worker_first in wrangler.jsonc). */
const EVENTS = { view: 'Opened the link', open: 'Tapped “Open Your Invitation”', music: 'Played the song' };

const istDay = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function hit(request, env) {
  let body;
  try { body = await request.json(); } catch { return new Response(null, { status: 400 }); }
  const { e, v } = body || {};
  if (!EVENTS[e] || typeof v !== 'string' || !/^[a-z0-9]{8,32}$/.test(v)) return new Response(null, { status: 400 });
  const day = istDay();
  await env.DB.batch([
    env.DB.prepare('INSERT INTO hits (day, event, n) VALUES (?1, ?2, 1) ON CONFLICT (day, event) DO UPDATE SET n = n + 1').bind(day, e),
    env.DB.prepare('INSERT OR IGNORE INTO visitors (event, vid, day) VALUES (?1, ?2, ?3)').bind(e, v, day),
  ]);
  return new Response(null, { status: 204 });
}

async function stats(url, env) {
  if (!env.STATS_KEY || url.searchParams.get('key') !== env.STATS_KEY) return new Response('Not found', { status: 404 });
  const [{ results: totals }, { results: people }, { results: days }, { results: newPeople }] = await env.DB.batch([
    env.DB.prepare('SELECT event, SUM(n) AS n FROM hits GROUP BY event'),
    env.DB.prepare('SELECT event, COUNT(*) AS n FROM visitors GROUP BY event'),
    env.DB.prepare('SELECT day, event, n FROM hits ORDER BY day DESC'),
    env.DB.prepare('SELECT day, event, COUNT(*) AS n FROM visitors GROUP BY day, event'),
  ]);
  const get = (rows, e) => rows.find(r => r.event === e)?.n || 0;
  const byDay = {};
  for (const r of days) (byDay[r.day] ??= { hits: {}, people: {} }).hits[r.event] = r.n;
  for (const r of newPeople) (byDay[r.day] ??= { hits: {}, people: {} }).people[r.event] = r.n;
  const keys = Object.keys(EVENTS);
  const cards = keys.map(e => `<div class="card"><b>${get(people, e)}</b><span>${EVENTS[e]}</span><small>${get(totals, e)} ${get(totals, e) === 1 ? 'time' : 'times'} in all</small></div>`).join('');
  const rows = Object.keys(byDay).sort().reverse().map(d => `<tr><td>${esc(new Date(d + 'T12:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' }))}</td>${keys.map(e => `<td>${byDay[d].people[e] || 0} <small>(${byDay[d].hits[e] || 0})</small></td>`).join('')}</tr>`).join('');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>#ROHI · Visits</title>
<style>
:root{--bg:#3d0f1a;--card:#521a27;--ink:#f6e7c8;--muted:#cdb38a;--gold:#e0b45c}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.45 system-ui,-apple-system,sans-serif;padding:24px 16px 48px}
main{max-width:720px;margin:0 auto}h1{font-weight:500;color:var(--gold);margin:0 0 4px;font-size:24px}p{color:var(--muted);margin:0 0 20px;font-size:14px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:28px}
.card{background:var(--card);border:1px solid #6b2a37;border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:2px}
.card b{font-size:36px;font-weight:600;color:var(--gold);font-variant-numeric:tabular-nums}.card small,td small{color:var(--muted)}
table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums;font-size:14px}th,td{text-align:left;padding:8px 6px;border-bottom:1px solid #6b2a37}th{color:var(--muted);font-weight:500}
</style></head><body><main><h1>#ROHI · Who’s seen the invitation</h1>
<p>Big numbers are different phones and computers. “Times in all” counts repeat visits too. Days are in IST; link-preview bots aren’t counted.</p>
<div class="cards">${cards}</div>
<table><thead><tr><th>Day</th>${keys.map(e => `<th>${EVENTS[e]}</th>`).join('')}</tr></thead><tbody>${rows || `<tr><td colspan="${keys.length + 1}">No visits yet.</td></tr>`}</tbody></table>
<p style="margin-top:12px">New devices that day, with total times in brackets.</p></main>
<script>try{localStorage.setItem('rohi-notrack','1')}catch(e){}</script></body></html>`;
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/hit' && request.method === 'POST') return hit(request, env);
    if (url.pathname === '/stats') return stats(url, env);
    return env.ASSETS.fetch(request);
  },
};
