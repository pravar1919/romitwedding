/* eslint-disable */
// @ts-nocheck
/* Client-side behaviour for the invitation, ported verbatim from the original royal.html. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { WeddingConfig } from './config';

export function initInvite(CONFIG: WeddingConfig) {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const useGsap = !reduce;
if (useGsap) { gsap.registerPlugin(ScrollTrigger); ScrollTrigger.config({ ignoreMobileResize: true }); }
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store = { get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }, set(k,v){ try { localStorage.setItem(k,v); } catch(e){} } };

/* ---------------- Visit counter (worker/index.js); a device that has opened /stats is never counted ---------------- */
const track = (() => {
  const sent = new Set();
  let vid = store.get('rohi-vid');
  if (!vid) { vid = Math.random().toString(36).slice(2, 12) + Date.now().toString(36); store.set('rohi-vid', vid); }
  return e => {
    if (sent.has(e) || store.get('rohi-notrack') || /^(localhost|127\.)/.test(location.hostname)) return;
    sent.add(e);
    try { fetch('/api/hit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ e, v: vid }), keepalive: true }).catch(() => {}); } catch(err){}
  };
})();
track('view');

/* ---------------- Dates & text bindings ---------------- */
const TZ = CONFIG.timezone;
const fmt = (d, o) => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, ...o }).format(d);
const D = s => new Date(s);
const ceremony = D(CONFIG.ceremony);
const weddingDay = D(CONFIG.weddingDay || CONFIG.ceremony);
const starts = CONFIG.events.map(e => D(e.start));
const first = new Date(Math.min(...starts)), last = new Date(Math.max(...starts));
const time = d => fmt(d, { hour: 'numeric', minute: '2-digit', hour12: true }).replace(':00', '').toUpperCase();
const toRoman = n => { const m = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]; let s = ''; for (const [v,r] of m) while (n >= v) { s += r; n -= v; } return s; };
const num = (d, k) => +fmt(d, { [k]: 'numeric' });
const { a: A, b: B } = CONFIG.couple;
const binds = {
  nameA: A, nameB: B, initialA: A[0], initialB: B[0],
  familyNameA: CONFIG.families.a.name, familyParentsA: CONFIG.families.a.parents,
  familyNameB: CONFIG.families.b.name, familyParentsB: CONFIG.families.b.parents,
  dateLong: fmt(weddingDay, { day: 'numeric', month: 'long', year: 'numeric' }),
  dateRangeCaps: `${fmt(first, { day: 'numeric', month: 'short' })} – ${fmt(last, { day: 'numeric', month: 'short', year: 'numeric' })}`,
  cityCaps: CONFIG.city, heroLine: CONFIG.heroLine, tagline: CONFIG.tagline, farewell: CONFIG.farewell, hashtag: CONFIG.hashtag,
  roman: `${toRoman(num(weddingDay,'day'))} · ${toRoman(num(weddingDay,'month'))} · ${toRoman(num(weddingDay,'year'))}`,
  ceremonyLabel: `Until the pheras · ${fmt(ceremony, { weekday: 'long', day: 'numeric', month: 'long' })}, ${time(ceremony).toLowerCase()} ${CONFIG.tzLabel}`,
};
$$('[data-bind]').forEach(el => { const v = binds[el.dataset.bind]; if (v != null) el.textContent = v; });
$$('[data-bind="nameA"], [data-bind="nameB"], [data-bind="initialA"], [data-bind="initialB"]').forEach(el => {
  const t = el.textContent; if (t[0] === 'A') el.innerHTML = `<span class="cap-a">A</span>${esc(t.slice(1))}`;
});
const maps = q => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
const venueById = Object.fromEntries(CONFIG.venues.map(v => [v.id, v]));

/* ---------------- Illustration helpers ---------------- */
const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const f = n => Math.round(n * 10) / 10;
let uid = 0;
function dome(cx, y, r){ return `<path d="M${f(cx-r)} ${f(y)}C${f(cx-r)} ${f(y-r*1.1)} ${f(cx-r*.22)} ${f(y-r*1.25)} ${f(cx)} ${f(y-r*1.8)}C${f(cx+r*.22)} ${f(y-r*1.25)} ${f(cx+r)} ${f(y-r*1.1)} ${f(cx+r)} ${f(y)}Z"/><rect x="${f(cx-.8)}" y="${f(y-r*2.2)}" width="1.6" height="${f(r*.5)}"/>`; }
function win(x, y, w, h, op, cls){ const r = w/2; return `<path${cls ? ` class="tw" style="--d:${f(-op*9)}s;--t:${f(3+op*4)}s"` : ''} opacity="${op}" d="M${f(x)} ${f(y+h)}V${f(y+r)}A${f(r)} ${f(r)} 0 0 1 ${f(x+w)} ${f(y+r)}V${f(y+h)}Z"/>`; }
function palace(r, x, base, pw, ph, fill, lit, twinkle){
  let s = `<g fill="${fill}">`;
  const bh = ph*.44, y0 = base-bh, uw = pw*.62, ux = x+(pw-uw)/2, uh = ph*.2, uy = y0-uh;
  s += `<rect x="${f(x)}" y="${f(y0)}" width="${f(pw)}" height="${f(bh+2)}"/><rect x="${f(ux)}" y="${f(uy)}" width="${f(uw)}" height="${f(uh+1)}"/>`;
  s += dome(x+pw/2, uy, uw*.15);
  const tw = pw*.085, th = ph*.68;
  [x, x+pw-tw].forEach(tx => { s += `<rect x="${f(tx)}" y="${f(base-th)}" width="${f(tw)}" height="${f(th)}"/>` + dome(tx+tw/2, base-th, tw*.62); });
  [ux+uw*.14, ux+uw*.86].forEach(cx => { const cw = uw*.09; s += `<rect x="${f(cx-cw/2)}" y="${f(uy-cw*.9)}" width="${f(cw)}" height="${f(cw*.9)}"/>` + dome(cx, uy-cw*.9, cw*.62); });
  for (let cx = x+tw; cx < x+pw-tw-4; cx += 9) s += `<rect x="${f(cx)}" y="${f(y0-4)}" width="4.5" height="4.5"/>`;
  s += `</g><g fill="${lit}">`;
  const n = Math.max(4, Math.floor((pw-tw*2)/20)), ww = (pw-tw*2)/n;
  for (let row = 0; row < 2; row++) for (let i = 0; i < n; i++) { const o = r() > .4 ? f(.7 + r()*.3) : .2; s += win(x+tw+i*ww+ww*.28, y0+bh*(.16+row*.44), ww*.44, bh*.28, o, twinkle && o > .5 && r() > .5); }
  const un = Math.max(3, Math.floor(uw/22)), uww = uw/un;
  for (let i = 0; i < un; i++) s += win(ux+i*uww+uww*.3, uy+uh*.25, uww*.4, uh*.55, r() > .5 ? .85 : .2, twinkle && r() > .6);
  return s + '</g>';
}
function hills(r, w, base, amp, n, fill){
  let d = `M0 ${base+200}L0 ${f(base - amp*r())}`;
  for (let i = 1; i <= n; i++) { const x = w*i/n, y = base - amp*(.3 + .7*r()); d += `Q${f(x - w/n/2)} ${f(y - amp*.4)} ${f(x)} ${f(y)}`; }
  return `<path fill="${fill}" d="${d}L${w} ${base+200}Z"/>`;
}
function town(r, x0, x1, base, fill, lit){
  let s = `<g fill="${fill}">`, l = '';
  for (let x = x0; x < x1;) { const w = 14 + r()*26, h = 14 + r()*34; s += `<rect x="${f(x)}" y="${f(base-h)}" width="${f(w)}" height="${f(h+4)}"/>`; if (r() > .55) s += dome(x+w/2, base-h, w*.25); if (r() > .35) l += `<rect x="${f(x+w*.35)}" y="${f(base-h*.6)}" width="3" height="4" opacity="${f(.5+r()*.5)}"/>`; x += w - 2; }
  return s + `</g><g fill="${lit}">${l}</g>`;
}
function rosesCluster(x, y, s){ return `<g transform="translate(${x} ${y}) scale(${s})"><use href="#sprig" x="-112" y="-128" width="50" height="76" transform="rotate(-28 -87 -90)"/><use href="#sprig" x="52" y="-124" width="50" height="76" transform="rotate(24 77 -86)"/><use href="#leaf" x="-84" y="-16" width="70" height="36" transform="rotate(-20)"/><use href="#leaf" x="22" y="-30" width="70" height="36" transform="rotate(14)"/><use href="#leaf" x="-104" y="-56" width="58" height="30" transform="rotate(-40)"/><use href="#leaf" x="40" y="-70" width="52" height="27" transform="rotate(-50)"/><use href="#lotus" x="-34" y="-128" width="84" height="84"/><use href="#peony" x="-108" y="-34" width="58" height="58"/><use href="#roseBlush" x="6" y="-50" width="70" height="70"/><use href="#roseDeep" x="-70" y="-72" width="108" height="108"/><use href="#roseCrimson" x="36" y="-4" width="46" height="46"/><use href="#bud" x="-44" y="-104" width="22" height="34" transform="rotate(-24 -33 -87)"/><use href="#blossom" x="42" y="14" width="22" height="22"/><use href="#blossom" x="-84" y="22" width="16" height="16" style="--bl:#FBE3D6"/></g>`; }
function skyLanterns(r, w, h, n){ let s = ''; for (let i = 0; i < n; i++) { const x = r()*w, y = h*(.45 + r()*.4), sc = .5 + r()*.8; s += `<g><g transform="translate(${f(x)} ${f(y)}) scale(${f(sc)})"><circle r="16" fill="#FFB24A" opacity=".25"/><path d="M-6-9H6L8 7H-8Z" fill="#FFC86A"/><path d="M-8 7H8" stroke="#E07A20" stroke-width="2"/></g></g>`; } return s; }

/* scenes: palace | night | dawn | lanterns | roses | mandap */
function scene(kind, seed = 1, w = 600, h = 450){
  const r = rng(seed), id = 'sc' + (++uid);
  const skies = {
    palace: ['#F2B9A0', '#F3A27E', '#FFD79C'], dawn: ['#F7D5C4', '#F9C6A6', '#FFF0D2'],
    night: ['#1E0A1E', '#43122E', '#7A2A44'], lanterns: ['#240A1A', '#4E1530', '#8A3A3A'],
    roses: ['#2A0208', '#4E0915', '#7A1626'], mandap: ['#7A1E26', '#C0603A', '#F2B46A'],
  }[kind] || ['#F2B9A0', '#F3A27E', '#FFD79C'];
  const dark = kind === 'night' || kind === 'lanterns';
  let s = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skies[0]}"/><stop offset=".6" stop-color="${skies[1]}"/><stop offset="1" stop-color="${skies[2]}"/></linearGradient><radialGradient id="${id}g"><stop offset="0" stop-color="#FFF4D0" stop-opacity=".95"/><stop offset="1" stop-color="#FFD08A" stop-opacity="0"/></radialGradient><linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skies[2]}" stop-opacity=".9"/><stop offset="1" stop-color="${skies[0]}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${id}s)"/>`;
  const hz = h*.66;
  if (kind === 'roses') {
    s += `<circle cx="${w*.7}" cy="${h*.3}" r="${h*.6}" fill="url(#${id}g)" opacity=".35"/>`;
    for (let i = 0; i < 16; i++) { const z = f(60+r()*100); s += `<use href="#leaf" x="${f(r()*w-30)}" y="${f(r()*h)}" width="${f(z*.7)}" height="${f(z*.36)}" transform="rotate(${f(r()*360)} ${f(w/2)} ${f(h/2)})" opacity=".9"/>`; }
    for (let i = 0; i < 14; i++) { const z = f(70+r()*100); s += `<use href="#${['roseDeep','roseBlush','roseCrimson','peony','roseDeep'][i%5]}" x="${f(r()*w-z/2)}" y="${f(r()*h-z/2)}" width="${z}" height="${z}"/>`; }
    for (let i = 0; i < 30; i++) s += `<circle cx="${f(r()*w)}" cy="${f(r()*h)}" r="${f(1+r()*2.4)}" fill="#FFE2A0" opacity="${f(.3+r()*.6)}"/>`;
    return s + '</svg>';
  }
  if (kind === 'mandap') {
    s += `<circle cx="${w/2}" cy="${h*.62}" r="${h*.55}" fill="url(#${id}g)"/>`;
    s += `<g fill="#5A1220"><rect x="${w*.18}" y="${h*.28}" width="${w*.035}" height="${h*.6}"/><rect x="${w*.785}" y="${h*.28}" width="${w*.035}" height="${h*.6}"/><rect x="${w*.14}" y="${h*.24}" width="${w*.72}" height="${h*.05}"/>${dome(w/2, h*.24, w*.12)}${dome(w*.2, h*.24, w*.04)}${dome(w*.8, h*.24, w*.04)}</g>`;
    for (let i = 0; i <= 16; i++) { const t = i/16, x = w*.18 + w*.64*t, y = h*.3 + h*.08*(1-Math.pow(2*t-1,2)); s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(w*.014)}" fill="${i%2?'#E89A2E':'#F2C14E'}"/>`; if (i % 4 === 2) for (let k = 1; k < 5; k++) s += `<circle cx="${f(x)}" cy="${f(y+k*h*.035)}" r="${f(w*.009)}" fill="#E89A2E"/>`; }
    s += `<rect x="0" y="${h*.86}" width="${w}" height="${h*.14}" fill="#33040C"/><path d="M${w*.46} ${h*.86}L${w/2} ${h*.74}L${w*.54} ${h*.86}Z" fill="#FFB347"/><path d="M${w*.48} ${h*.86}L${w/2} ${h*.79}L${w*.52} ${h*.86}Z" fill="#FFF1B0"/>`;
    s += rosesCluster(w*.08, h*.92, w/700) + rosesCluster(w*.92, h*.92, w/700);
    return s + '</svg>';
  }
  if (dark) s += Array.from({length: 60}, () => `<circle cx="${f(r()*w)}" cy="${f(r()*h*.6)}" r="${f(.4+r()*1.2)}" fill="#FFF3D6" opacity="${f(.3+r()*.7)}"/>`).join('');
  if (kind === 'night') s += `<circle cx="${w*.75}" cy="${h*.22}" r="${h*.08}" fill="#FFF4DC"/><circle cx="${w*.75}" cy="${h*.22}" r="${h*.25}" fill="url(#${id}g)" opacity=".4"/>`;
  else if (!dark) s += `<circle cx="${w*.5}" cy="${hz-h*.04}" r="${h*.42}" fill="url(#${id}g)"/><circle cx="${w*.5}" cy="${hz-h*.02}" r="${h*.07}" fill="#FFF2CF"/>`;
  const sil = dark ? '#2A0716' : (kind === 'dawn' ? '#B9707A' : '#7A2E3A'), lit = dark ? '#FFD27A' : '#FFE3A6';
  s += hills(r, w, hz - h*.03, h*.1, 6, dark ? '#3A0D22' : (kind === 'dawn' ? '#E3A99C' : '#C9707A')) ;
  s += town(r, 0, w*.3, hz, sil, lit);
  const pw = w*(.42 + r()*.12), px = w*.5 - pw/2 + (r()-.5)*w*.2;
  s += palace(r, px, hz, pw, h*.32, sil, lit, false);
  s += `<rect y="${hz}" width="${w}" height="${h-hz}" fill="url(#${id}w)"/>`;
  s += `<g transform="translate(0 ${hz*2}) scale(1 -1)" opacity=".22">${palace(rng(seed), px, hz, pw, h*.32, sil, lit, false)}</g>`;
  for (let i = 0; i < 8; i++) s += `<line x1="${f(w*.3+r()*w*.4)}" x2="${f(w*.3+r()*w*.4+30)}" y1="${f(hz+8+i*((h-hz)/9))}" y2="${f(hz+8+i*((h-hz)/9))}" stroke="${dark?'#FFD27A':'#FFF4D6'}" stroke-width="1.4" opacity=".5"/>`;
  if (kind === 'lanterns') s += skyLanterns(r, w, h*.7, 14);
  if (kind === 'dawn' || kind === 'palace') s += rosesCluster(w*.06, h*.98, w/800);
  return s + '</svg>';
}
const media = (item, kind) => item.src ? `<img src="${esc(item.src)}" alt="" loading="lazy">` : scene(item.scene || kind, item.seed || 1);

/* ---------------- Hero scene ---------------- */
function heroScene(){
  const w = 1600, h = 900, hz = 660, r = rng(7);
  let s = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><defs>
  <linearGradient id="hs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9A5A0"/><stop offset=".35" stop-color="#F4BB9C"/><stop offset=".62" stop-color="#FAC98F"/><stop offset=".68" stop-color="#FFE1A8"/></linearGradient>
  <radialGradient id="hsun"><stop offset="0" stop-color="#FFFBE6"/><stop offset=".25" stop-color="#FFE6A8" stop-opacity=".9"/><stop offset="1" stop-color="#FFC27A" stop-opacity="0"/></radialGradient>
  <linearGradient id="hw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7BE8E"/><stop offset=".5" stop-color="#D98476"/><stop offset="1" stop-color="#8A3A48"/></linearGradient>
  <linearGradient id="harch" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C79C70"/><stop offset=".5" stop-color="#F1DCBC"/><stop offset="1" stop-color="#C79C70"/></linearGradient>
  <linearGradient id="hrail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EBD3B0"/><stop offset="1" stop-color="#A97F57"/></linearGradient>
  <filter id="hblur"><feGaussianBlur stdDeviation="3"/></filter>
  </defs><rect width="${w}" height="${h}" fill="url(#hs)"/>`;
  s += `<circle cx="1180" cy="${hz-60}" r="380" fill="url(#hsun)"/><circle cx="1180" cy="${hz-60}" r="50" fill="#FFF6DA" opacity=".95"/>`;
  s += hills(r, w, hz-70, 90, 7, '#D89A9A') + hills(r, w, hz-30, 70, 9, '#C67B84');
  s += `<g transform="translate(140 ${hz-140})" fill="#B66470">${palace(rng(3), 0, 40, 160, 90, '#B66470', '#FFE3A6', false)}</g>`;
  s += town(r, 0, 560, hz, '#9C4A58', '#FFE0A0');
  s += town(r, 1240, 1600, hz, '#9C4A58', '#FFE0A0');
  const pal = palace(rng(21), 560, hz, 480, 220, '#7E2E3E', '#FFDB8E', false);
  s += pal;
  s += `<rect y="${hz}" width="${w}" height="${h-hz}" fill="url(#hw)"/>`;
  s += `<g transform="translate(0 ${hz*2}) scale(1 -1)" opacity=".28" filter="url(#hblur)">${palace(rng(21), 560, hz, 480, 220, '#7E2E3E', '#FFDB8E', false)}</g>`;
  s += `<ellipse cx="1180" cy="${hz+60}" rx="40" ry="100" fill="#FFF0C0" opacity=".35" filter="url(#hblur)"/>`;
  for (let i = 0; i < 11; i++) { const y = hz + 12 + i*14, x = 700 + r()*600; s += `<line x1="${f(x)}" x2="${f(x+60+r()*80)}" y1="${y}" y2="${y}" stroke="#FFF4D6" stroke-width="${f(1+r()*1.5)}" opacity="${f(.35+r()*.4)}" style="animation-delay:${f(-r()*6)}s"/>`; }
  // balcony railing
  s += `<rect y="820" width="${w}" height="80" fill="url(#hrail)"/><rect y="812" width="${w}" height="12" fill="#F2DFC2"/>`;
  for (let x = 20; x < w; x += 34) s += `<path d="M${x} 824h14v6c-6 6-6 14 0 20v6c-6 6-6 14 0 20v24h-14v-24c6-6 6-14 0-20v-6c6-6 6-14 0-20z" fill="#D9BC92" opacity=".8"/>`;
  // carved arch frame
  s += `<path fill-rule="evenodd" fill="url(#harch)" d="M0 0H${w}V${h}H0Z M150 ${h}V380C150 230 430 170 610 130C705 108 770 70 800 20C830 70 895 108 990 130C1170 170 1450 230 1450 380V${h}Z"/>`;
  s += `<g fill="none" stroke="#B4884F" stroke-width="3"><path d="M150 ${h}V380C150 230 430 170 610 130C705 108 770 70 800 20C830 70 895 108 990 130C1170 170 1450 230 1450 380V${h}"/></g><g fill="none" stroke="#9C7330" stroke-width="1.4" opacity=".7"><path d="M120 ${h}V372C120 210 420 148 600 106C695 84 765 44 800 -10C835 44 905 84 1000 106C1180 148 1480 210 1480 372V${h}"/></g>`;
  for (let y = 420; y < h; y += 60) s += `<g fill="#B4884F" opacity=".55"><circle cx="75" cy="${y}" r="8"/><circle cx="${w-75}" cy="${y}" r="8"/><path d="M75 ${y+14}l8 14l-8 14l-8-14z M${w-75} ${y+14}l8 14l-8 14l-8-14z"/></g>`;
  s += rosesCluster(120, 830, 1.5) + rosesCluster(1480, 830, 1.5) + rosesCluster(330, 870, .9) + rosesCluster(1270, 870, .9);
  return s + '</svg>';
}

/* ---------------- Event icons ---------------- */
const ICONS = {
  mehendi: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M26 70V44c0-3 4-3 4 0v-18c0-3 4-3 4 0v-6c0-3 4-3 4 0v6-10c0-3 4-3 4 0v14-8c0-3 4-3 4 0v22l4-6c2-3 6-1 5 2l-7 14c-3 6-6 9-6 15"/><circle cx="40" cy="48" r="5"/><circle cx="40" cy="48" r="9" stroke-dasharray="2 3"/><path d="M36 30h0M44 28h0M32 58h0M48 58h0" stroke-width="3" stroke="#B3263A"/></svg>`,
  haldi: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 42h56c-2 14-14 24-28 24S14 56 12 42Z" fill="#F6E1B8"/><path d="M22 42c4-10 12-14 18-14s14 4 18 14" fill="#E9B23A" stroke="#C8901C"/><path d="M30 66l-4 6h28l-4-6"/><g fill="#E89A2E" stroke="none"><circle cx="24" cy="20" r="6"/><circle cx="40" cy="14" r="7"/><circle cx="56" cy="20" r="6"/></g><g fill="#B5651D" stroke="none"><circle cx="24" cy="20" r="2.2"/><circle cx="40" cy="14" r="2.6"/><circle cx="56" cy="20" r="2.2"/></g><path d="M18 50h44" stroke-dasharray="1 4"/></svg>`,
  sangeet: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><ellipse cx="18" cy="44" rx="7" ry="16"/><ellipse cx="62" cy="44" rx="7" ry="16"/><path d="M18 28h44M18 60h44" /><path d="M62 28C54 34 54 54 62 60" stroke-dasharray="2 3"/><path d="M22 30l8 28 8-28 8 28 8-28 6 22" stroke="#B3263A"/><path d="M58 12c4 2 6 6 6 10M64 8c5 3 8 8 8 14" opacity=".6"/><circle cx="12" cy="14" r="2.4" fill="currentColor"/><path d="M14.4 14V4l6 2"/></svg>`,
  mandap: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 70V30M66 70V30M10 30h60M14 24h52"/><path d="M28 24c0-8 6-12 12-18c6 6 12 10 12 18"/><path d="M40 6V2"/><path d="M10 24c2-4 4-6 6-6M70 24c-2-4-4-6-6-6"/><path d="M14 34c8 8 18 10 26 10s18-2 26-10" stroke="#E89A2E" stroke-dasharray="1 4" stroke-width="3"/><path d="M34 70l6-12 6 12Z" fill="#F2B04A" stroke="#C8701C"/><path d="M38 70l2-5 2 5" stroke="#FFF1B0"/><path d="M8 70h64"/></svg>`,
  reception: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 22h16l-2 18a6 6 0 0 1-12 0Z" transform="rotate(-12 30 40)"/><path d="M42 22h16l-2 18a6 6 0 0 1-12 0Z" transform="rotate(12 50 40)"/><path d="M34 46l-4 20M46 46l4 20M24 68h12M44 68h12"/><path d="M26 30h10" transform="rotate(-12 30 40)" stroke="#E8B04A"/><path d="M44 30h10" transform="rotate(12 50 40)" stroke="#E8B04A"/><path d="M40 6v8M34 10l12 0M36 4l8 10M44 4l-8 10" stroke="#C59B4E"/></svg>`,
  kalash: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M30 30h20M28 34h24"/><path d="M28 34c-10 6-14 14-12 22c2 8 12 14 24 14s22-6 24-14c2-8-2-16-12-22" fill="#F6E1B8"/><path d="M20 52h40" stroke="#C8901C" stroke-dasharray="1 4" stroke-width="3"/><path d="M40 30c-6-4-14-4-18 0c4 2 10 3 18 0ZM40 30c6-4 14-4 18 0c-4 2-10 3-18 0ZM40 30c-3-6-3-12 0-16c3 4 3 10 0 16Z" fill="#7C9A4A" stroke="#5E7A35"/><circle cx="40" cy="12" r="4" fill="#C2354A" stroke="none"/><path d="M34 72l-4 4h20l-4-4"/></svg>`,
  thali: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="40" cy="54" rx="32" ry="10" fill="#F6E1B8"/><ellipse cx="40" cy="52" rx="24" ry="6" stroke="#C8901C" stroke-dasharray="1 3"/><path d="M26 50V36h16v14" fill="#B3263A" stroke="#8E1E24"/><path d="M24 36h20M34 36v14" stroke="#E9B23A"/><path d="M34 36c-4-6-10-6-10-2s6 4 10 2c4 2 10 2 10-2s-6-4-10 2Z" stroke="#E9B23A"/><path d="M50 50c0-4 3-6 6-6s6 2 6 6" fill="#E89A2E" stroke="#C8901C"/><path d="M56 44v-6" stroke="#C8901C"/><path d="M56 38c-2-3-1-6 0-8c1 2 2 5 0 8Z" fill="#FFC861" stroke="#E89A2E"/><g fill="#E89A2E" stroke="none"><circle cx="14" cy="22" r="3"/><circle cx="66" cy="20" r="3"/><circle cx="58" cy="12" r="2"/></g></svg>`,
  ghodi: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 70l2-20c-6-4-8-10-6-16M58 70l-2-18M30 70l2-16M50 70l-1-16"/><path d="M18 34c4 10 14 14 26 14c8 0 12-2 14-8l6-14c2-4 6-6 8-4l2 4-6 4-4 12"/><path d="M58 26c-2-6-2-12 2-16c2 2 4 4 4 8"/><path d="M64 18c2-2 4-2 6 0"/><circle cx="66" cy="22" r="1" fill="currentColor"/><path d="M28 34c4 6 12 8 20 6l-2-8c-6 2-12 2-18 2Z" fill="#B3263A" stroke="#8E1E24"/><path d="M30 40l2 6M38 41v6M46 40l-1 6" stroke="#E9B23A"/><path d="M60 10c-2-4 0-8 2-8c0 3 2 4 4 4c-1 3-4 4-6 4Z" fill="#E89A2E" stroke="#C8901C"/><path d="M16 32c-4 2-6 8-4 14" stroke-dasharray="2 3"/></svg>`,
};
const TRAVEL_ICONS = {
  plane: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 18l24-8c2-.6 2 1.4.6 2L18 18l-4 9h-2l1-8-6 2-2 3H3l1-5"/></svg>`,
  hotel: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 28V10h24v18M2 28h28M4 10c0-4 6-8 12-8s12 4 12 8"/><path d="M9 15h3v3H9zM20 15h3v3h-3zM9 21h3v3H9zM20 21h3v3h-3zM14 28v-7h4v7"/></svg>`,
  guide: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M16 29s9-8.5 9-15a9 9 0 0 0-18 0c0 6.5 9 15 9 15Z"/><path d="M16 9l1.5 3.2 3.5.4-2.6 2.4.7 3.5L16 16.8l-3.1 1.7.7-3.5-2.6-2.4 3.5-.4Z"/></svg>`,
};

/* ---------------- Render sections ---------------- */
$('#hero-scene').innerHTML = heroScene();
$('#cd-skyline').innerHTML = (() => {
  const w = 1600, h = 420, r = rng(31);
  let s = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="cdsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8EEDF" stop-opacity="0"/><stop offset=".5" stop-color="#F6D6B4"/><stop offset="1" stop-color="#EDB48C"/></linearGradient><linearGradient id="cdw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDB48C"/><stop offset="1" stop-color="#C0757A"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#cdsky)"/>`;
  s += hills(r, w, 330, 60, 8, '#E2A797');
  s += town(r, 0, 520, 340, '#C27F7E', '#FFE6B0') + town(r, 1100, 1600, 340, '#C27F7E', '#FFE6B0');
  s += palace(rng(44), 520, 340, 560, 230, '#B0606A', '#FFE6B0', false);
  s += `<rect y="338" width="${w}" height="${h-338}" fill="url(#cdw)"/>`;
  for (let i = 0; i < 8; i++) s += `<line x1="${f(560+r()*480)}" x2="${f(640+r()*480)}" y1="${350+i*9}" y2="${350+i*9}" stroke="#FFF4D6" stroke-width="1.2" opacity=".5"/>`;
  s += rosesCluster(90, 400, 1.6) + rosesCluster(1510, 400, 1.6) + rosesCluster(300, 420, 1) + rosesCluster(1300, 420, 1);
  return s + '</svg>';
})();
// shimmer animation + twinkle classes inside countdown use the hero keyframes
$('#cd-skyline').classList.add('hero__scene'); $('#cd-skyline').style.position = 'relative';

$('#events-grid').innerHTML = CONFIG.events.map((e, i) => {
  const s = D(e.start), v = venueById[e.venue] || {};
  return `<article class="ev" data-reveal style="--i:${i}">
    <span class="ev__finial" aria-hidden="true"></span>
    <div class="ev__icon" aria-hidden="true">${ICONS[e.icon] || ''}</div>
    <h3>${esc(e.name)}</h3>
    <p class="ev__tag">${esc(e.tagline)}</p>
    <p class="ev__when">${fmt(s, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}<br>${time(s)}${e.end ? ` – ${time(D(e.end))}` : ''}</p>
    <p class="ev__venue">${esc(v.name || '')}</p>
    <div class="ev__actions">
      <a class="btn btn--sm btn--ghost" href="${v.map || maps(`${v.name}, ${v.address}`)}" target="_blank" rel="noopener">Directions</a>
    </div>
  </article>`;
}).join('');

$('#gal').innerHTML = CONFIG.gallery.map((g, i) => `<button type="button" class="${g.span || ''}" data-i="${i}" data-reveal="zoom" style="--i:${i % 4}" aria-label="Open ${esc(g.title)}"><figure style="margin:0"><div class="ph">${media(g, g.scene)}</div><figcaption>${esc(g.title)}</figcaption></figure></button>`).join('');

$('#venues').innerHTML = CONFIG.venues.map((v, i) => {
  const evs = CONFIG.events.filter(e => e.venue === v.id).map(e => e.name).join(' · ');
  return `<article class="venue" data-reveal><div class="venue__pic">${v.mapEmbed ? `<iframe src="${esc(v.mapEmbed)}" title="Map to ${esc(v.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>` : media({ scene: v.scene, seed: 40 + i, src: v.src }, v.scene)}</div><div><h3>${esc(v.name)}</h3><p class="venue__events">${esc(evs)}</p><address>${esc(v.address)}</address><p>${esc(v.note)}</p><a class="btn btn--sm" href="${v.map || maps(`${v.name}, ${v.address}`)}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 21s7-6.6 7-12a7 7 0 0 0-14 0c0 5.4 7 12 7 12Z"/><circle cx="12" cy="9" r="2.4"/></svg>Get Directions</a></div></article>`;
}).join('');

$('#travel-info').innerHTML = CONFIG.travel.map((t, i) => `<div class="travel__col" data-reveal style="--i:${i}"><h3>${TRAVEL_ICONS[t.icon] || ''}${esc(t.title)}</h3><dl>${t.items.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></div>`).join('');


$('#sky-lanterns').innerHTML = (() => { const r = rng(9); return Array.from({ length: innerWidth < 700 ? 5 : 9 }, () => `<i style="left:${f(8 + r()*84)}%;--s:${f(7 + r()*8)}px;--t:${f(18 + r()*14)}s;--d:${f(-r()*30)}s;--dx:${f(-60 + r()*120)}px"></i>`).join(''); })();

/* fairy lights + bokeh */
$$('[data-fairy]').forEach(el => {
  const n = +el.dataset.fairy, pink = el.hasAttribute('data-pink'), r = rng(n * 7);
  el.innerHTML = `<svg viewBox="0 0 1000 110" preserveAspectRatio="none"><path d="M0 8Q125 92 250 30T500 30T750 30T1000 8" fill="none" stroke="#5a4630" stroke-width="1.2" vector-effect="non-scaling-stroke" opacity=".7"/></svg>`;
  // sample the same path for bulb positions
  const P = $('path', el), len = P.getTotalLength();
  let html = '';
  for (let i = 1; i < n; i++) { const p = P.getPointAtLength(len * i / n); html += `<b class="${pink && i % 3 === 0 ? 'pink' : (!pink && i % 4 === 0 ? 'pink' : '')}" style="left:${f(p.x/10)}%;top:${f(p.y)}px;--d:${f(-r()*3)}s;--t:${f(1.6+r()*2.2)}s"></b>`; }
  el.insertAdjacentHTML('beforeend', html);
});
$$('[data-bokeh]').forEach(el => {
  const n = +el.dataset.bokeh, r = rng(n * 13);
  el.innerHTML = Array.from({ length: n }, () => { const s = 20 + r()*90; return `<i style="left:${f(r()*100)}%;top:${f(r()*100)}%;width:${f(s)}px;height:${f(s)}px;--t:${f(10+r()*12)}s;--d:${f(-r()*20)}s;--dx:${f(-40+r()*80)}px;--dy:${f(-30-r()*90)}px;--o:${f(.3+r()*.5)}"></i>`; }).join('');
});

/* ---------------- FX canvas: petals, glitter, cursor sparkles ---------------- */
const fx = (() => {
  const cv = $('#fx'), ctx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, raf = 0, last = 0;
  const petals = [], dust = [], sparks = [];
  const PETAL = [['#3E0410','#9E1B30','#E06A7C'], ['#5A0716','#BE2B44','#F28C9B'], ['#7A0E22','#D23A52','#F6A9B4'], ['#A8506A','#EFA3B0','#FFE4E8'], ['#C47A8A','#F8CDD3','#FFF4F5'], ['#B8620F','#EE9A2A','#FFD27A'], ['#D08A1A','#F6C04A','#FFF0B8']];
  const SPRITES = PETAL.map(([d, m, l]) => {
    const c = document.createElement('canvas'), g = c.getContext('2d'); c.width = c.height = 64; g.translate(32, 32);
    const shape = () => { g.beginPath(); g.moveTo(0, 28); g.bezierCurveTo(-26, 16, -30, -18, -11, -27); g.quadraticCurveTo(0, -21, 11, -27); g.bezierCurveTo(30, -18, 26, 16, 0, 28); g.closePath(); };
    const gr = g.createLinearGradient(0, 28, 0, -28); gr.addColorStop(0, d); gr.addColorStop(.45, m); gr.addColorStop(1, l);
    shape(); g.fillStyle = gr; g.fill();
    const sh = g.createRadialGradient(-8, -6, 2, 0, 0, 32); sh.addColorStop(0, 'rgba(255,255,255,.28)'); sh.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sh; g.fill();
    g.save(); shape(); g.clip(); g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = .8;
    [[-14, -20], [-6, -24], [0, -25], [6, -24], [14, -20]].forEach(([x, y]) => { g.beginPath(); g.moveTo(0, 26); g.quadraticCurveTo(x*.4, 0, x, y); g.stroke(); });
    g.strokeStyle = l; g.globalAlpha = .7; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-22, -16); g.quadraticCurveTo(-14, -28, -11, -27); g.quadraticCurveTo(0, -21, 11, -27); g.quadraticCurveTo(14, -28, 22, -16); g.stroke(); g.restore();
    g.globalAlpha = .5; g.strokeStyle = d; g.lineWidth = .6; shape(); g.stroke();
    return c;
  });
  const SPARK = ['#FFF6D0', '#F3DB9C', '#E9CD8E', '#FFD27A', '#FFFFFF'];
  const small = () => W < 700;
  function size(){ dpr = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; cv.width = W*dpr; cv.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }
  const rnd = (a, b) => a + Math.random()*(b-a);
  function petal(burst){
    return { x: burst ? rnd(W*.2, W*.8) : rnd(-40, W+40), y: burst ? rnd(-H*.4, H*.3) : rnd(-H, -20), s: rnd(6, 13), vx: rnd(-.3, .3) + (burst ? rnd(-2.2, 2.2) : 0), vy: burst ? rnd(.8, 3.2) : rnd(.45, 1.15),
      rot: rnd(0, 6.28), vr: rnd(-.03, .03), flip: rnd(0, 6.28), vf: rnd(.02, .06), sway: rnd(.4, 1.2), ph: rnd(0, 6.28), c: SPRITES[Math.random()*(Math.random() < .8 ? 5 : SPRITES.length)|0], burst };
  }
  function seed(){ petals.length = dust.length = 0; const np = small() ? 14 : 26, nd = small() ? 22 : 40; for (let i = 0; i < np; i++) { const p = petal(); p.y = rnd(-H, H); petals.push(p); } for (let i = 0; i < nd; i++) dust.push({ x: rnd(0, W), y: rnd(0, H), r: rnd(.6, 2.2), ph: rnd(0, 6.28), sp: rnd(.6, 2), vy: rnd(-.25, -.05), vx: rnd(-.1, .1) }); }
  function star(x, y, r){ ctx.beginPath(); ctx.moveTo(x, y-r); ctx.quadraticCurveTo(x, y, x+r, y); ctx.quadraticCurveTo(x, y, x, y+r); ctx.quadraticCurveTo(x, y, x-r, y); ctx.quadraticCurveTo(x, y, x, y-r); ctx.fill(); }
  function drawPetal(p){
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.max(.15, Math.abs(Math.cos(p.flip))));
    const s = p.s*1.25; ctx.drawImage(p.c, -s, -s, s*2, s*2);
    ctx.restore();
  }
  function frame(t){
    const dt = Math.min(3, (t - last) / 16.7 || 1); last = t;
    ctx.clearRect(0, 0, W, H);
    // glitter dust
    for (const d of dust) {
      d.y += d.vy*dt; d.x += d.vx*dt; d.ph += .04*d.sp*dt;
      if (d.y < -10) { d.y = H + 10; d.x = rnd(0, W); }
      const a = Math.max(0, Math.sin(d.ph)); if (a < .05) continue;
      ctx.globalAlpha = a*.9; ctx.fillStyle = '#E9C46A'; star(d.x, d.y, d.r*(1.5 + a*2.2));
      ctx.globalAlpha = a; ctx.fillStyle = '#FFF8E0'; ctx.beginPath(); ctx.arc(d.x, d.y, d.r*.55, 0, 6.28); ctx.fill();
    }
    ctx.globalAlpha = .92;
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.ph += .02*dt; p.x += (p.vx + Math.sin(p.ph)*p.sway)*dt; p.y += p.vy*dt; p.rot += p.vr*dt; p.flip += p.vf*dt;
      if (p.burst) { p.vx *= .99; p.vy = Math.max(.9, p.vy*.995); }
      if (p.y > H + 30) { if (p.burst) { petals.splice(i, 1); continue; } Object.assign(p, petal(), { y: -20 }); }
      drawPetal(p);
    }
    // sparkles
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.life -= dt; if (s.life <= 0) { sparks.splice(i, 1); continue; }
      s.x += s.vx*dt; s.y += s.vy*dt; s.vy += .03*dt; s.vx *= .98;
      const k = s.life / s.max; ctx.globalAlpha = k; ctx.fillStyle = s.c;
      star(s.x, s.y, s.r*(.4 + k*.8)*(1 + .3*Math.sin(s.life*.6)));
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }
  function sparkle(x, y, n = 1, power = 1){
    for (let i = 0; i < n && sparks.length < 220; i++) { const a = rnd(0, 6.28), v = rnd(.2, 1.6)*power; const max = rnd(30, 60); sparks.push({ x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v - .4*power, r: rnd(2.5, 6), life: max, max, c: SPARK[Math.random()*SPARK.length|0] }); }
  }
  function shower(n = 60){ for (let i = 0; i < n; i++) petals.push(petal(true)); }
  function start(){ if (reduce || raf) return; last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop(){ cancelAnimationFrame(raf); raf = 0; }
  size(); seed();
  addEventListener('resize', () => { const w0 = W; size(); if (Math.abs(W - w0) > 120) seed(); });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  if (!reduce) {
    let lx = 0, ly = 0;
    if (finePointer) addEventListener('pointermove', e => { const d = Math.hypot(e.clientX - lx, e.clientY - ly); if (d > 14) { lx = e.clientX; ly = e.clientY; sparkle(e.clientX, e.clientY, 2, .6); } }, { passive: true });
    addEventListener('pointerdown', e => sparkle(e.clientX, e.clientY, finePointer ? 16 : 12, 2.2), { passive: true });
  }
  return { start, sparkle, shower };
})();
fx.start();

/* ---------------- Music: the couple's song, through a hidden YouTube player ---------------- */
const music = (() => {
  let player, ready = false, on = false;
  const btn = $('#music-btn');
  const id = CONFIG.song.youtubeId, start = CONFIG.song.start || 0;
  btn.title = CONFIG.song.title;
  /* the player is built ahead of time so the first tap can start it inside the gesture (iOS refuses play() later) */
  function load(){
    const host = document.createElement('div');
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText = 'position:fixed;left:-9999px;top:0;width:200px;height:200px;opacity:0;pointer-events:none';
    host.innerHTML = '<div id="yt-song"></div>';
    document.body.appendChild(host);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev && prev();
      player = new YT.Player('yt-song', {
        host: 'https://www.youtube-nocookie.com', videoId: id, width: 200, height: 200,
        playerVars: { autoplay: 0, controls: 0, start, playsinline: 1, rel: 0 },
        events: {
          onReady: () => { ready = true; player.setVolume(70); if (on) player.playVideo(); },
          onStateChange: e => {
            if (e.data === YT.PlayerState.PLAYING && !on) player.pauseVideo();
            /* loop back to where the singing starts, not the instrumental intro */
            if (e.data === YT.PlayerState.ENDED && on) { player.seekTo(start, true); player.playVideo(); }
          },
        },
      });
    };
    const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; s.async = true;
    document.head.appendChild(s);
  }
  if (document.readyState === 'complete') setTimeout(load, 300); else addEventListener('load', () => setTimeout(load, 300), { once: true });
  function toggle(force){
    on = force ?? !on;
    if (on) track('music');
    btn.setAttribute('aria-pressed', on); btn.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
    if (!ready) return;
    on ? player.playVideo() : player.pauseVideo();
  }
  btn.addEventListener('click', () => toggle());
  return { toggle };
})();

/* ---------------- Ganpati ---------------- */
const ganeshEl = $('#ganesh');
if (CONFIG.ganpati && CONFIG.ganpati.src) ganeshEl.classList.add(CONFIG.ganpati.cutout ? 'cutout' : 'photo');
ganeshEl.innerHTML = CONFIG.ganpati && CONFIG.ganpati.src
  ? `<img src="${esc(CONFIG.ganpati.src)}" alt="Lord Ganesha seated, holding an axe, a lotus and a bowl of modaks">`
  : `<svg viewBox="0 0 120 120" role="img" aria-label="Om"><g fill="none" stroke="url(#goldGrad)"><circle cx="60" cy="60" r="56" stroke-width="1.6"/><circle cx="60" cy="60" r="49" stroke-width=".8"/><circle cx="60" cy="60" r="44" stroke-width="1.4" stroke-dasharray="1 4.6" stroke-linecap="round"/></g>${Array.from({length: 16}, (_, k) => `<path transform="rotate(${k*22.5} 60 60)" d="M60 4c3 3 3 6 0 8c-3-2-3-5 0-8z" fill="url(#goldGrad)"/>`).join('')}<text x="60" y="80" text-anchor="middle" font-family="Tiro Devanagari Hindi, serif" font-size="58" fill="url(#goldGrad)">ॐ</text></svg>`;

/* ---------------- Intro ---------------- */
const intro = $('#intro'), hero = $('.hero');

/* the arch is redrawn at the real box size so its crown keeps its proportions on tall phones instead of stretching */
const archSvg = $('.intro__arch svg');
function drawArch(){
  const { width: w, height: h } = archSvg.getBoundingClientRect();
  if (!w || !h) return;
  const cap = Math.min(.33 * h, .42 * w);
  const X = x => (x * w / 1000).toFixed(1), Y = y => (y * cap / 330).toFixed(1);
  const arch = (side, sh, c1, c2, c3, c4, c5, top) =>
    `M${X(side)} ${h}V${Y(sh)}C${X(side)} ${Y(c1)} ${X(side + 190)} ${Y(c2)} ${X(380 + (side - 60) / 2)} ${Y(c3)}C${X(440 + (side - 60) / 3)} ${Y(c4)} ${X(480 + (side - 60) / 6)} ${Y(c5)} ${X(500)} ${Y(top)}` +
    `C${X(520 - (side - 60) / 6)} ${Y(c5)} ${X(560 - (side - 60) / 3)} ${Y(c4)} ${X(620 - (side - 60) / 2)} ${Y(c3)}C${X(810 - side)} ${Y(c2)} ${X(1000 - side)} ${Y(c1)} ${X(1000 - side)} ${Y(sh)}V${h}`;
  const [outer, inner] = archSvg.querySelectorAll('path');
  archSvg.setAttribute('viewBox', `0 0 ${w.toFixed(1)} ${h.toFixed(1)}`);
  outer.setAttribute('d', arch(60, 330, 200, 150, 110, 90, 50, 0));
  inner.setAttribute('d', arch(90, 340, 225, 175, 135, 115, 80, 40));
}
drawArch();
new ResizeObserver(drawArch).observe(archSvg);
/* the hashtag is spelled out by "Ro" and "hi" flying down from the names */
const tagEl = $('.intro__tag', intro);
const tagParts = [A.slice(0, 2), B.slice(-2)];
const canMonogram = CONFIG.hashtag.toUpperCase() === ('#' + tagParts.join('')).toUpperCase();
if (canMonogram) tagEl.innerHTML = `#<span class="tag-part">${esc(tagParts[0].toUpperCase())}</span><span class="tag-part">${esc(tagParts[1].toUpperCase())}</span>`;
let monoTl = null, monoTimer = 0;
function monoReset(done){
  clearTimeout(monoTimer); monoTl && monoTl.kill(); monoTl = null;
  $$('.tag-fly', intro).forEach(el => el.remove());
  $$('.tag-part', tagEl).forEach(el => { el.style.opacity = done ? '' : '0'; el.style.transform = ''; });
}
function letterRange(el, fromEnd){
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [];
  while (walker.nextNode()) if (walker.currentNode.length) nodes.push(walker.currentNode);
  const n = fromEnd ? nodes[nodes.length - 1] : nodes[0], r = document.createRange();
  if (!n || n.length < 2) return null;
  fromEnd ? r.setStart(n, n.length - 2) : r.setStart(n, 0); fromEnd ? r.setEnd(n, n.length) : r.setEnd(n, 2);
  return r;
}
function playMonogram(){
  if (!canMonogram) return;
  monoReset(reduce);
  if (reduce) return;
  monoTimer = setTimeout(async () => {
    try { await document.fonts.ready; } catch(e){}
    if (intro.classList.contains('opening')) return monoReset(true);
    const names = $('#intro-names'), fontSize = getComputedStyle(names).fontSize;
    const sources = [letterRange($('[data-bind="nameA"]', names), false), letterRange($('[data-bind="nameB"]', names), true)];
    const targets = $$('.tag-part', tagEl);
    if (sources.some(r => !r)) return monoReset(true);
    const riseY = new DOMMatrix(getComputedStyle(tagEl).transform).m42; // the tag may still be rising into place
    monoTl = gsap.timeline({ onComplete: () => monoReset(true) });
    sources.forEach((range, i) => {
      const s = range.getBoundingClientRect(), r = targets[i].getBoundingClientRect(), t = { left: r.left, width: r.width, height: r.height, top: r.top - riseY };
      const fly = document.createElement('span');
      fly.className = 'tag-fly'; fly.setAttribute('aria-hidden', 'true'); fly.textContent = range.toString();
      Object.assign(fly.style, { left: s.left + 'px', top: s.top + 'px', width: s.width + 'px', height: s.height + 'px', lineHeight: s.height + 'px', fontSize });
      intro.appendChild(fly);
      const dx = (t.left + t.width / 2) - (s.left + s.width / 2), dy = (t.top + t.height / 2) - (s.top + s.height / 2);
      const k = Math.max(.25, Math.min(1, t.height / s.height * 1.15)), at = i * .25;
      monoTl
        .fromTo(fly, { opacity: 0, scale: 1 }, { opacity: 1, scale: 1.18, y: -14, duration: .4, ease: 'power2.out' }, at)
        .to(fly, { keyframes: { x: [0, dx * .35, dx], y: [-14, dy * .35 - 40, dy], scale: [1.18, (1.18 + k) / 2, k], easeEach: 'none' }, duration: .95, ease: 'power2.inOut' }, at + .45)
        .to(fly, { opacity: 0, duration: .25, ease: 'power1.in' }, at + 1.2)
        .fromTo(targets[i], { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: .5, ease: 'back.out(2.2)',
          onStart: () => fx.sparkle(t.left + t.width / 2, t.top + t.height / 2, 14, 1.4) }, at + 1.2);
    });
  }, 1400);
}
playMonogram();
function openInvite(){
  if (intro.classList.contains('opening')) return;
  intro.classList.add('opening');
  track('open');
  monoReset(true);
  if (!useGsap) root.classList.add('reveal-ready');
  const b = $('#open-invite').getBoundingClientRect();
  fx.sparkle(innerWidth/2, innerHeight/2, 60, 3.4);
  fx.sparkle(b.left + b.width/2, b.top + b.height/2, 30, 2.6);
  setTimeout(() => fx.shower(innerWidth < 700 ? 40 : 80), 450);
  setTimeout(() => { root.classList.remove('intro-open'); hero.classList.add('live'); intro.classList.add('gone'); useGsap && ScrollTrigger.refresh(); }, reduce ? 0 : 1300);
  setTimeout(() => { intro.style.display = 'none'; $('#hero-names').focus({ preventScroll: true }); }, reduce ? 0 : 2400);
}
function replay(){
  scrollTo(0, 0);
  hero.classList.remove('live');
  intro.style.display = ''; intro.classList.remove('opening', 'gone'); root.classList.add('intro-open');
  $$('.rise', intro).forEach(el => { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; });
  playMonogram();
  $('#open-invite').focus();
}
$('#open-invite').addEventListener('click', openInvite);
$('#replay').addEventListener('click', replay);
addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('intro-open')) openInvite(); });
$('#open-invite').focus({ preventScroll: true });

/* ---------------- Nav ---------------- */
const nav = $('#nav'), menuBtn = $('#menu-btn');
const onScroll = () => nav.classList.toggle('scrolled', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
menuBtn.addEventListener('click', () => { const o = !nav.classList.contains('open'); nav.classList.toggle('open', o); menuBtn.setAttribute('aria-expanded', o); });
$$('.nav__links a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }));
const links = Object.fromEntries($$('.nav__links a').map(a => [a.hash.slice(1), a]));
const sectionObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && links[e.target.id]) { $$('.nav__links a').forEach(a => a.classList.remove('active')); links[e.target.id].classList.add('active'); } }), { rootMargin: '-45% 0px -50% 0px' });
Object.keys(links).forEach(id => { const el = document.getElementById(id); if (el) sectionObs.observe(el); });

/* pause decorative animation in sections that are off screen */
const offObs = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('offscreen', !e.isIntersecting)), { rootMargin: '120px 0px' });
$$('main > section, footer').forEach(el => offObs.observe(el));

/* ---------------- Reveal on scroll ---------------- */
const revealObs = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in'); revealObs.unobserve(e.target);
}), { threshold: .15, rootMargin: '0px 0px -8% 0px' });
if (!useGsap) $$('[data-reveal]').forEach(el => revealObs.observe(el));

/* ---------------- GSAP scroll choreography (the [data-reveal] CSS above is the fallback) ---------------- */
if (useGsap) {
  const CLEAR = 'transform,opacity,visibility,transition,clipPath';
  const st = (trigger, start = 'top 85%') => ({ trigger, start, once: true });
  const handled = new Set();
  const own = els => { els.forEach(el => handled.add(el)); return els; };
  // CSS transitions on transform/opacity would fight GSAP's inline styles, so park them until each tween ends
  gsap.set('[data-reveal], .gal .ph', { transition: 'none' });

  /* section headings: script title rises, ornament unfurls from the centre, caption follows */
  own($$('.sec-head')).forEach(h => gsap.timeline({ scrollTrigger: st(h, 'top 88%'), defaults: { ease: 'expo.out' } })
    .from($('h2', h), { y: 50, opacity: 0, duration: 1.3, clearProps: CLEAR })
    .from($$('.divider', h), { scaleX: 0, opacity: 0, duration: 1.2, ease: 'power3.inOut', clearProps: CLEAR }, '-=1')
    .from($$('p', h), { y: 20, opacity: 0, duration: 1, clearProps: CLEAR }, '-=.8')
    .set(h, { clearProps: CLEAR }));

  /* crest monogram */
  gsap.from(own([$('#crest-logo')]), { scale: .82, rotate: -8, opacity: 0, duration: 1.8, ease: 'expo.out', clearProps: CLEAR, scrollTrigger: st('#crest-logo') });

  /* event cards rise in a tilted wave */
  gsap.set(own($$('.ev')), { y: 80, rotateX: -14, transformPerspective: 900, transformOrigin: '50% 100%', opacity: 0 });
  ScrollTrigger.batch('.ev', { start: 'top 90%', once: true, onEnter: b => gsap.to(b, { y: 0, rotateX: 0, opacity: 1, duration: 1.4, ease: 'expo.out', stagger: .12, clearProps: CLEAR }) });

  /* countdown tiles flip up, skyline drifts */
  own([$('.cd-grid')]);
  gsap.timeline({ scrollTrigger: st('.cd-grid') })
    .from('.cd', { y: 40, rotateX: -80, transformPerspective: 600, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .1, clearProps: CLEAR })
    .set('.cd-grid', { clearProps: CLEAR });
  gsap.fromTo('#cd-skyline', { yPercent: 14 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '#countdown', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  /* gallery tiles wipe open, photos settle */
  const tiles = own($$('.gal button'));
  gsap.set(tiles, { clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.set(tiles.map(t => $('.ph', t)), { scale: 1.3 });
  ScrollTrigger.batch(tiles, { start: 'top 92%', once: true, onEnter: b => {
    gsap.to(b, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut', stagger: .1, clearProps: CLEAR });
    gsap.to(b.map(t => $('.ph', t)), { scale: 1, duration: 1.9, ease: 'expo.out', stagger: .1, clearProps: CLEAR });
  } });

  /* venues: picture slides in from its side, details rise */
  own($$('.venue')).forEach((v, i) => gsap.timeline({ scrollTrigger: st(v), defaults: { ease: 'expo.out' } })
    .from(v, { y: 50, opacity: 0, duration: 1.2, clearProps: CLEAR })
    .from($('.venue__pic', v), { x: i % 2 ? 60 : -60, opacity: 0, duration: 1.3, clearProps: CLEAR }, .15)
    .from($$('.venue__pic + div > *', v), { y: 20, opacity: 0, duration: .9, stagger: .07, clearProps: CLEAR }, .3));

  gsap.from(own($$('.travel__col')), { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .12, clearProps: CLEAR, scrollTrigger: st('#travel-info') });
  gsap.from(own([$('#farewell .logo-card')]), { scale: .85, opacity: 0, duration: 1.6, ease: 'expo.out', clearProps: CLEAR, scrollTrigger: st('#farewell .logo-card') });

  /* anything else marked for reveal gets a plain rise */
  $$('[data-reveal]').filter(el => !handled.has(el)).forEach(el => gsap.from(el, { y: 34, opacity: 0, duration: 1.1, ease: 'expo.out', clearProps: CLEAR, scrollTrigger: st(el, 'top 90%') }));

  /* hero parallax on wider screens: scene sinks, lanterns lift, text drifts up and fades */
  gsap.matchMedia().add('(min-width: 800px)', () => {
    const heroST = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('#hero-scene', { yPercent: 14, ease: 'none', scrollTrigger: heroST });
    gsap.to('#sky-lanterns', { yPercent: -18, ease: 'none', scrollTrigger: heroST });
    gsap.to('.hero__text', { y: -110, opacity: .15, ease: 'none', scrollTrigger: { ...heroST, start: '25% top' } });
    gsap.to('.scroll-cue', { opacity: 0, ease: 'none', scrollTrigger: { ...heroST, end: '20% top' } });
  });
}

/* crest: glitter drifting off the monogram while it is on screen */
const crest = $('#crest-logo'); let crestOn = false;
new IntersectionObserver(es => { crestOn = es[0].isIntersecting; }).observe(crest);
if (!reduce) setInterval(() => { if (!crestOn || document.hidden) return; const b = crest.getBoundingClientRect(); fx.sparkle(b.left + b.width*(.2 + Math.random()*.6), b.top + b.height*(.15 + Math.random()*.6), 3, .5); }, 650);

/* ---------------- Countdown ---------------- */
const cdEls = ['d','h','m','s'].map(k => $('#cd-' + k));
let prev = [];
function cdTick(){
  let ms = Math.max(0, ceremony - Date.now());
  const v = [Math.floor(ms/864e5), Math.floor(ms/36e5) % 24, Math.floor(ms/6e4) % 60, Math.floor(ms/1e3) % 60].map(n => String(n).padStart(2, '0'));
  v.forEach((x, i) => { if (x !== prev[i]) { const el = cdEls[i]; el.textContent = x; if (!reduce) { el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); } } });
  prev = v;
}
cdTick(); setInterval(cdTick, 1000);

/* ---------------- Gallery lightbox ---------------- */
const lb = $('#lightbox'); let lbI = 0, lbReturn = null;
function lbShow(i){ lbI = (i + CONFIG.gallery.length) % CONFIG.gallery.length; const g = CONFIG.gallery[lbI]; $('#lb-img').innerHTML = g.src ? `<img src="${esc(g.src)}" alt="${esc(g.title)}">` : scene(g.scene, g.seed || 1, 900, 600); $('#lb-cap').textContent = g.title; }
function lbOpen(i){ lbReturn = document.activeElement; lbShow(i); lb.hidden = false; requestAnimationFrame(() => lb.classList.add('open')); $('.lb-close', lb).focus(); }
function lbClose(){ lb.classList.remove('open'); setTimeout(() => { lb.hidden = true; }, 500); lbReturn && lbReturn.focus(); }
$('#gal').addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (b) lbOpen(+b.dataset.i); });
$('.lb-close', lb).addEventListener('click', lbClose);
$('.lb-prev', lb).addEventListener('click', () => lbShow(lbI - 1));
$('.lb-next', lb).addEventListener('click', () => lbShow(lbI + 1));
lb.addEventListener('click', e => { if (e.target === lb) lbClose(); });
addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') lbClose(); if (e.key === 'ArrowLeft') lbShow(lbI - 1); if (e.key === 'ArrowRight') lbShow(lbI + 1); });

}
