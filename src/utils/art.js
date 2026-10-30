/**
 * Procedural artwork. Every cover, hero and manga page of the demo is drawn
 * here from a seed, so the project ships with 100% original, copyright-free
 * visuals and zero image files.
 *
 * Functions return SVG *strings* (cheap to build, cheap to inject, easy to test).
 * The art is split in five layers so the hero can move them at different speeds:
 *   sky → far → mid → near → fx
 */
import { createRng } from './random.js';
import { mix, luma } from './color.js';

export const ORIENT = {
  portrait: { w: 400, h: 600 },
  landscape: { w: 1200, h: 675 },
};

export const LAYER_ORDER = ['sky', 'far', 'mid', 'near', 'fx'];

const INK = '#060607';
const MOON = '#efe9dc';
const f = (n) => Math.round(n * 10) / 10;

/** Closed silhouette path along a horizon. */
function ridge(kind, W, H, baseY, amp, rng) {
  const k = W / 400;
  let d = `M0,${f(H)} L0,${f(baseY)} `;
  let x = 0;
  switch (kind) {
    case 'city':
      while (x < W + 20) {
        const w = (14 + rng() * 32) * k * (W > 600 ? 0.75 : 1);
        const y = baseY - amp * (0.2 + rng() * 0.8);
        d += `L${f(x)},${f(y)} L${f(x + w)},${f(y)} `;
        x += w;
      }
      break;
    case 'mountains':
      while (x < W + 60) {
        const w = (50 + rng() * 110) * k * (W > 600 ? 0.85 : 1);
        d += `L${f(x + w / 2)},${f(baseY - amp * (0.35 + rng() * 0.65))} L${f(x + w)},${f(baseY - amp * rng() * 0.25)} `;
        x += w;
      }
      break;
    case 'spires':
      while (x < W + 40) {
        const bw = (18 + rng() * 34) * k;
        const h = amp * (0.25 + rng() * 0.75);
        d += `L${f(x)},${f(baseY)} L${f(x + bw * 0.5)},${f(baseY - h)} L${f(x + bw)},${f(baseY)} `;
        x += bw * (0.55 + rng() * 0.6);
      }
      break;
    case 'forest':
      while (x < W + 40) {
        const bw = (14 + rng() * 20) * k;
        const h = amp * (0.3 + rng() * 0.5);
        d += `L${f(x)},${f(baseY)} L${f(x + bw * 0.5)},${f(baseY - h)} L${f(x + bw)},${f(baseY)} `;
        x += bw * (0.5 + rng() * 0.4);
      }
      break;
    case 'waves': {
      const fr = (0.018 + rng() * 0.01) / k;
      const ph = rng() * 6;
      for (x = 0; x <= W; x += Math.max(6, 6 * k)) {
        const y = baseY - amp * 0.35 + Math.sin(x * fr + ph) * amp * 0.18 + Math.sin(x * fr * 2.3 + ph * 1.7) * amp * 0.07;
        d += `L${f(x)},${f(y)} `;
      }
      break;
    }
    case 'dunes': {
      const seg = W / 3;
      for (let i = 0; i < 3; i++) {
        d += `Q${f(x + seg / 2)},${f(baseY - amp * rng() * 1.1)} ${f(x + seg)},${f(baseY - amp * 0.25 * rng())} `;
        x += seg;
      }
      break;
    }
    default:
      break;
  }
  return d + `L${f(W + 10)},${f(H)} Z`;
}

function sparkle(cx, cy, s, fill) {
  return `<path d="M${f(cx)},${f(cy - s)} Q${f(cx)},${f(cy)} ${f(cx + s)},${f(cy)} Q${f(cx)},${f(cy)} ${f(cx)},${f(cy + s)} Q${f(cx)},${f(cy)} ${f(cx - s)},${f(cy)} Q${f(cx)},${f(cy)} ${f(cx)},${f(cy - s)}Z" fill="${fill}"/>`;
}

function sky(kind, W, H, ac, rng, uid, cx, cy, u) {
  const r = Math.min(W, H) * 0.14;
  let s = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(Math.min(W, H) * 0.85)}" fill="url(#${uid}-glow)"/>`;
  const nStars = kind === 'stars' ? 70 : kind === 'moon' || kind === 'eclipse' ? 26 : 0;
  for (let i = 0; i < nStars; i++) {
    s += `<circle cx="${f(rng() * W)}" cy="${f(rng() * H * 0.62)}" r="${f((0.5 + rng() * 1.3) * u)}" fill="#f3f0ea" opacity="${f(0.35 + rng() * 0.55)}"/>`;
  }
  if (kind === 'sun') {
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 2.3)}" fill="${ac}" opacity=".08"/>`;
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 1.55)}" fill="${ac}" opacity=".15"/>`;
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${ac}"/>`;
  } else if (kind === 'moon') {
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 1.6)}" fill="${MOON}" opacity=".07"/>`;
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${MOON}"/>`;
    s += `<circle cx="${f(cx - r * 0.3)}" cy="${f(cy - r * 0.2)}" r="${f(r * 0.22)}" fill="#cfc7b6" opacity=".55"/>`;
    s += `<circle cx="${f(cx + r * 0.35)}" cy="${f(cy + r * 0.25)}" r="${f(r * 0.3)}" fill="#cfc7b6" opacity=".45"/>`;
    s += `<circle cx="${f(cx + r * 0.1)}" cy="${f(cy - r * 0.5)}" r="${f(r * 0.12)}" fill="#cfc7b6" opacity=".5"/>`;
  } else if (kind === 'eclipse') {
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 1.45)}" fill="${ac}" opacity=".16"/>`;
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="#030304" stroke="${ac}" stroke-width="${f(3 * u)}"/>`;
  } else if (kind === 'stars') {
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.9)}" fill="${ac}" opacity=".13"/>`;
    s += sparkle(cx, cy, r * 0.9, '#f3f0ea');
  }
  return s;
}

function fx(kind, W, H, ac, rng, u) {
  const n = W > 600 ? 70 : 36;
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = rng() * W * 1.1;
    const y = rng() * H;
    if (kind === 'rain') {
      const len = (16 + rng() * 26) * u;
      s += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x - len * 0.28)}" y2="${f(y + len)}" stroke="#f3f0ea" stroke-opacity="${f(0.12 + rng() * 0.2)}" stroke-width="${f(0.9 * u)}"/>`;
    } else if (kind === 'embers') {
      s += `<circle cx="${f(x)}" cy="${f(H * (0.25 + rng() * 0.7))}" r="${f((0.8 + rng() * 2.2) * u)}" fill="${ac}" opacity="${f(0.35 + rng() * 0.55)}"/>`;
    } else if (kind === 'petals') {
      const a = Math.round(rng() * 180);
      s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(4 * u)}" ry="${f(2 * u)}" transform="rotate(${a} ${f(x)} ${f(y)})" fill="${ac}" opacity="${f(0.45 + rng() * 0.4)}"/>`;
    } else if (kind === 'snow') {
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f((1 + rng() * 2) * u)}" fill="#f3f0ea" opacity="${f(0.4 + rng() * 0.5)}"/>`;
    } else {
      break;
    }
  }
  return s;
}

/** Cloaked silhouette standing on (x, baseY), `s` = scale (196 units tall at s=1). */
function figure(x, baseY, s, ink, ac) {
  return `<g transform="translate(${f(x - 50 * s)} ${f(baseY - 196 * s)}) scale(${(Math.round(s * 1000) / 1000)})">`
    + `<path d="M56,50 C86,50 108,38 142,60 C112,54 92,68 62,62 Z" fill="${ac}" opacity=".92"/>`
    + `<path d="M50,44 C30,50 22,92 10,198 L90,198 C78,92 70,50 50,44 Z" fill="${ink}"/>`
    + `<circle cx="50" cy="28" r="14" fill="${ink}"/>`
    + `<path d="M62,46 C74,70 80,120 88,196" stroke="${ac}" stroke-width="1.6" fill="none" opacity=".55"/>`
    + `</g>`;
}

/**
 * @param {object} o
 * @param {{sky:string,ground:string,fx:string}} o.scene
 * @param {string[]} o.palette  [shadow, mid, accent]
 * @param {'portrait'|'landscape'} o.orient
 * @param {string} o.uid        unique prefix for SVG ids
 * @returns {{sky:string,far:string,mid:string,near:string,fx:string}}
 */
export function buildLayers({ scene, palette, orient = 'portrait', uid, seed, figure: withFigure = true, figureScale = 1, figureX, figureY = 0.93 }) {
  const { w: W, h: H } = ORIENT[orient];
  const [c0, c1, ac] = palette;
  const rng = createRng(seed);
  const land = orient === 'landscape';
  const u = land ? 1.6 : 1;
  const cx = W * (land ? 0.68 : 0.62);
  const cy = H * (land ? 0.32 : 0.3);
  const light = luma(c0) > 140;

  const far = mix(c1, '#000000', light ? 0.35 : 0.45);
  const midC = mix(c0, '#000000', light ? 0.62 : 0.35);

  const defs = `<defs>`
    + `<linearGradient id="${uid}-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></linearGradient>`
    + `<radialGradient id="${uid}-glow"><stop offset="0" stop-color="${ac}" stop-opacity=".38"/><stop offset="1" stop-color="${ac}" stop-opacity="0"/></radialGradient>`
    + `</defs>`;

  const layers = {};
  layers.sky = `${defs}<rect width="${W}" height="${H}" fill="url(#${uid}-g)"/>${sky(scene.sky, W, H, ac, rng, uid, cx, cy, u)}`;
  layers.far = `<path d="${ridge(scene.ground, W, H, H * 0.62, H * 0.3, rng)}" fill="${far}"/>`;
  layers.mid = `<path d="${ridge(scene.ground, W, H, H * 0.76, H * 0.22, rng)}" fill="${midC}"/>`;

  let near = '';
  if (withFigure) {
    const fh = (land ? H * 0.46 : H * 0.3) * figureScale;
    const fxPos = W * (figureX ?? (land ? 0.8 : 0.4));
    near += figure(fxPos, H * figureY, fh / 196, INK, ac);
  }
  near += `<path d="${ridge('dunes', W, H, H * 0.9, H * 0.1, rng)}" fill="${INK}"/>`;
  layers.near = near;
  layers.fx = fx(scene.fx, W, H, ac, rng, u);
  return layers;
}

/** The five layers, stacked, as one standalone SVG (used for thumbnails/tests). */
export function buildArtSvg(opts) {
  const { w, h } = ORIENT[opts.orient ?? 'portrait'];
  const L = buildLayers(opts);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${LAYER_ORDER.map((k) => L[k]).join('')}</svg>`;
}
