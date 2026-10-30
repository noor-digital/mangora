const toRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Linear mix of two #rrggbb colours. t=0 → a, t=1 → b. */
export function mix(a, b, t) {
  const A = toRgb(a);
  const B = toRgb(b);
  const out = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return '#' + out.map((v) => v.toString(16).padStart(2, '0')).join('');
}

export function luma(hex) {
  const [r, g, b] = toRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
