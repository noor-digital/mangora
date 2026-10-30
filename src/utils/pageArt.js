/**
 * Generates the demo manga pages (800 × 1200) as SVG strings: panel layouts,
 * speech bubbles, screentone and a title page — all original and seeded, so a
 * given page always looks the same.
 */
import { createRng, pick } from './random.js';
import { buildLayers, ORIENT } from './art.js';

export const PAGE_W = 800;
export const PAGE_H = 1200;

const PAPER = '#f1ede4';
const INK = '#0e0e10';
const TONE = '#b9b4aa';
const DARK = ['#0e0e10', '#55524d', '#f1ede4'];
const LIGHT = ['#d8d3c8', '#f1ede4', '#0e0e10'];

const LAYOUTS = [
  [[30, 30, 740, 380], [30, 430, 360, 330], [410, 430, 360, 330], [30, 780, 740, 390]],
  [[30, 30, 360, 520], [410, 30, 360, 520], [30, 570, 740, 290], [30, 880, 360, 290], [410, 880, 360, 290]],
  [[30, 30, 740, 250], [30, 300, 740, 300], [30, 620, 360, 550], [410, 620, 360, 260], [410, 900, 360, 270]],
  [[30, 30, 460, 560], [510, 30, 260, 560], [30, 610, 740, 260], [30, 890, 240, 280], [290, 890, 480, 280]],
  [[30, 30, 740, 540], [30, 590, 240, 580], [290, 590, 480, 280], [290, 890, 480, 280]],
  [[30, 30, 360, 360], [410, 30, 360, 360], [30, 410, 740, 460], [30, 890, 740, 280]],
];

const LINES = [
  'Do you hear that?', 'The bells are ringing early.', 'We don’t have much time.', 'Then we go together.',
  'I never asked for this.', 'Keep your eyes on the horizon.', 'It was never about winning.', 'Tell me you’re joking.',
  'Not again…', 'That light, it’s moving!', 'Stay behind me.', 'Some doors are better left closed.',
  'I made a promise.', 'The tide is turning.', 'Hold the line!', 'Are you afraid?', 'No. Not anymore.',
  'Everything was a lie.', 'So this is where it ends.', 'Let’s finish this.', 'Quiet. Someone’s coming.',
  'Look at the sky.', 'I remember this place.', 'It smells like rain.', 'You came back.', 'Of course I did.',
];
const SFX = ['DON', 'ZUUN', 'GUSH', 'SHING', 'RUMBLE', 'TAP', 'WHOOSH', 'KRAAK'];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const f = (n) => Math.round(n * 10) / 10;

export function wrapText(text, max) {
  const lines = [];
  let cur = '';
  for (const word of text.split(' ')) {
    const next = cur ? `${cur} ${word}` : word;
    if (next.length > max && cur) {
      lines.push(cur);
      cur = word;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

function bubble(cx, cy, text, maxChars, tail) {
  const lines = wrapText(text.toUpperCase(), maxChars);
  const longest = Math.max(...lines.map((l) => l.length));
  const tw = longest * 16 + 34;
  const th = lines.length * 32 + 18;
  const rx = tw * 0.62;
  const ry = th * 0.78;
  let s = `<path d="M${f(cx - 10)},${f(cy + ry - 6)} L${f(cx + tail * 24)},${f(cy + ry + 30)} L${f(cx + 16)},${f(cy + ry - 8)} Z" fill="${PAPER}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
  s += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${PAPER}" stroke="${INK}" stroke-width="4"/>`;
  s += `<path d="M${f(cx - 8)},${f(cy + ry - 4)} L${f(cx + tail * 20)},${f(cy + ry + 22)} L${f(cx + 13)},${f(cy + ry - 5)} Z" fill="${PAPER}"/>`;
  const y0 = cy - ((lines.length - 1) * 32) / 2 + 9;
  s += `<text text-anchor="middle" font-family="'Hanken Grotesk',sans-serif" font-weight="800" font-size="25" fill="${INK}">`;
  lines.forEach((l, i) => {
    s += `<tspan x="${f(cx)}" y="${f(y0 + i * 32)}">${esc(l)}</tspan>`;
  });
  return { svg: s + '</text>', rx, ry };
}

function sceneSvg(rect, uid, rng, manga, opts = {}) {
  const [x, y, w, h] = rect;
  const orient = h >= w ? 'portrait' : 'landscape';
  const { w: W, h: H } = ORIENT[orient];
  const L = buildLayers({
    scene: manga.scene,
    palette: rng() < 0.55 ? DARK : LIGHT,
    orient,
    uid,
    seed: `${uid}:${Math.floor(rng() * 1e6)}`,
    figure: opts.figure ?? true,
    figureScale: opts.figureScale ?? 1,
    figureX: opts.figureX ?? 0.3 + rng() * 0.4,
    figureY: opts.figureY,
  });
  return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${L.sky}${L.far}${L.mid}${L.near}${L.fx}</svg>`;
}

function speedSvg(rect, rng) {
  const [x, y, w, h] = rect;
  const cx = x + w * (0.35 + rng() * 0.3);
  const cy = y + h * (0.35 + rng() * 0.3);
  const R = Math.hypot(w, h);
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${PAPER}"/>`;
  const n = 48;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rng() * 0.05;
    const da = 0.012 + rng() * 0.035;
    const r0 = Math.min(w, h) * (0.16 + rng() * 0.12);
    s += `<path d="M${f(cx + Math.cos(a) * r0)},${f(cy + Math.sin(a) * r0)} L${f(cx + Math.cos(a - da) * R)},${f(cy + Math.sin(a - da) * R)} L${f(cx + Math.cos(a + da) * R)},${f(cy + Math.sin(a + da) * R)} Z" fill="${INK}"/>`;
  }
  return s;
}

function eyesSvg(rect, uid) {
  const [x, y, w, h] = rect;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const ew = Math.min(w * 0.17, h * 0.3);
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${INK}"/>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${uid}-dots-light)" opacity=".16"/>`;
  for (const dx of [-1, 1]) {
    const ex = cx + dx * w * 0.22;
    s += `<path d="M${f(ex - ew)},${f(cy)} Q${f(ex)},${f(cy - ew * 0.85)} ${f(ex + ew)},${f(cy)} Q${f(ex)},${f(cy + ew * 0.85)} ${f(ex - ew)},${f(cy)} Z" fill="${PAPER}"/>`;
    s += `<circle cx="${f(ex + dx * -ew * 0.08)}" cy="${f(cy)}" r="${f(ew * 0.42)}" fill="${INK}"/>`;
    s += `<circle cx="${f(ex - ew * 0.14)}" cy="${f(cy - ew * 0.14)}" r="${f(ew * 0.1)}" fill="${PAPER}"/>`;
    s += `<path d="M${f(ex - ew * 1.1)},${f(cy - ew * 0.75)} Q${f(ex)},${f(cy - ew * 1.3)} ${f(ex + ew * 1.1)},${f(cy - ew * 0.7)}" stroke="${PAPER}" stroke-width="5" fill="none"/>`;
  }
  return s;
}

function titlePage(manga, chapter, title, uid, rng) {
  const splash = [30, 30, 740, 770];
  let s = `<clipPath id="${uid}-c0"><rect x="30" y="30" width="740" height="770"/></clipPath>`;
  s += `<g clip-path="url(#${uid}-c0)">${sceneSvg(splash, `${uid}t`, rng, manga, { figureScale: 1.15, figureX: 0.5 })}</g>`;
  s += `<rect x="30" y="30" width="740" height="770" fill="none" stroke="${INK}" stroke-width="6"/>`;
  s += `<text x="40" y="858" font-family="'Hanken Grotesk',sans-serif" font-weight="700" font-size="20" letter-spacing="3" fill="${INK}" opacity=".7">${esc(manga.title.toUpperCase())}</text>`;
  s += `<text x="40" y="940" font-family="'Shippori Mincho',serif" font-weight="800" font-size="70" fill="${INK}">Chapter ${chapter}</text>`;
  const lines = wrapText(title, 24);
  lines.slice(0, 2).forEach((l, i) => {
    s += `<text x="40" y="${1000 + i * 52}" font-family="'Shippori Mincho',serif" font-weight="600" font-size="42" fill="${INK}">${esc(l)}</text>`;
  });
  s += `<rect x="40" y="1130" width="90" height="6" fill="#b91c2c"/>`;
  s += `<text x="760" y="1136" text-anchor="end" font-family="'Hanken Grotesk',sans-serif" font-weight="600" font-size="20" fill="${INK}" opacity=".65">${esc(manga.author)}</text>`;
  return s;
}

/**
 * @returns {string} a complete <svg> element for one manga page
 */
export function buildPageSvg({ manga, chapter, title, page, total }) {
  const uid = `${manga.id}-${chapter}-${page}`.replace(/[^a-z0-9-]/gi, '');
  const rng = createRng(`${manga.id}:${chapter}:${page}`);
  let body = `<defs>`
    + `<pattern id="${uid}-dots" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="4.5" cy="4.5" r="1.9" fill="${INK}"/></pattern>`
    + `<pattern id="${uid}-dots-light" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="4.5" cy="4.5" r="1.9" fill="${PAPER}"/></pattern>`
    + `</defs><rect width="${PAGE_W}" height="${PAGE_H}" fill="${PAPER}"/>`;

  if (page === 1) {
    body += titlePage(manga, chapter, title, uid, rng);
  } else {
    const layout = pick(rng, LAYOUTS);
    layout.forEach((rect, i) => {
      const [x, y, w, h] = rect;
      const kind = pick(rng, ['scene', 'scene', 'tone', 'figure', 'speed', 'eyes']);
      let content;
      if (kind === 'speed') content = speedSvg(rect, rng);
      else if (kind === 'eyes') content = eyesSvg(rect, uid);
      else if (kind === 'figure') content = sceneSvg(rect, `${uid}p${i}`, rng, manga, { figureScale: 2.3, figureX: 0.5, figureY: 1.02 });
      else {
        content = sceneSvg(rect, `${uid}p${i}`, rng, manga, { figure: rng() > 0.25 });
        if (kind === 'tone') content += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${uid}-dots)" opacity=".28"/>`;
      }
      body += `<clipPath id="${uid}-c${i}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>`;
      body += `<g clip-path="url(#${uid}-c${i})">${content}`;

      if (rng() < 0.6 && w >= 240 && h >= 200) {
        const maxChars = Math.max(8, Math.min(17, Math.floor((w - 110) / 16)));
        const tail = rng() < 0.5 ? -1 : 1;
        const probe = bubble(0, 0, pick(rng, LINES), maxChars, tail);
        const left = rng() < 0.5;
        const bx = left ? x + probe.rx + 18 : x + w - probe.rx - 18;
        const by = y + probe.ry + 20;
        body += bubble(bx, by, pick(rng, LINES), maxChars, tail).svg;
      } else if (rng() < 0.35 && kind !== 'eyes' && w >= 300) {
        body += `<text x="${x + w * 0.55}" y="${y + h - 36}" transform="rotate(-6 ${x + w * 0.55} ${y + h - 36})" text-anchor="middle" font-family="'Shippori Mincho',serif" font-weight="800" font-size="64" fill="${PAPER}" stroke="${INK}" stroke-width="7" paint-order="stroke">${pick(rng, SFX)}</text>`;
      }
      body += `</g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="6"/>`;
    });
  }

  const isFinalChapter = chapter === manga.chapters;
  body += `<text x="${PAGE_W / 2}" y="1192" text-anchor="middle" font-family="'Hanken Grotesk',sans-serif" font-weight="600" font-size="16" fill="${INK}" opacity=".55">${page}</text>`;
  if (page === total) {
    body += `<text x="770" y="1192" text-anchor="end" font-family="'Shippori Mincho',serif" font-style="italic" font-size="17" fill="${INK}" opacity=".6">${isFinalChapter ? 'End of demo' : 'To be continued'}</text>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PAGE_W} ${PAGE_H}" role="img" aria-label="${esc(`${manga.title}, chapter ${chapter}, page ${page} of ${total}`)}">${body}</svg>`;
}
