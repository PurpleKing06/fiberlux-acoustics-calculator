// ===== common.js — shared by index.html and room.html =====

// --- DOM helpers ---
const $ = (id) => document.getElementById(id);
const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const f1 = (x) => x.toFixed(1);
const f2 = (x) => x.toFixed(2);

// --- frequencies ---
const BANDS = [125, 250, 500, 1000, 2000, 4000]; // octave bands shown in tables [Hz]
const freqLabel = (f) => (f >= 1000 ? f / 1000 + "k" : String(f));

// --- complex numbers ---
const C = (re, im = 0) => ({ re, im });
const add = (a, b) => C(a.re + b.re, a.im + b.im);
const mul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const div = (a, b) => {
  const d = b.re * b.re + b.im * b.im;
  return C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
};
const tan = (z) => {
  const a = 2 * z.re,
    b = 2 * z.im,
    d = Math.cos(a) + Math.cosh(b);
  return C(Math.sin(a) / d, Math.sinh(b) / d);
};
const abs = (z) => Math.hypot(z.re, z.im);
// complex square root, branch with Im <= 0 when z.im < 0 (decaying wave)
const sqrtC = (z) => {
  const r = abs(z);
  return C(Math.sqrt((r + z.re) / 2), (z.im < 0 ? -1 : 1) * Math.sqrt((r - z.re) / 2));
};

// --- physics constants ---
const RHO0 = 1.21; // air density [kg/m³]
const C0 = 343; // speed of sound [m/s]
const Z0 = RHO0 * C0; // characteristic impedance of air [Pa·s/m]

// --- canvas ---
// Sizes the canvas to its CSS box and the screen's pixel density (sharp on phones).
// Returns the 2D context drawing in CSS pixels, plus width W and height H.
function setupCanvas(cv) {
  const dpr = window.devicePixelRatio || 1;
  const W = cv.clientWidth,
    H = cv.clientHeight;
  cv.width = Math.round(W * dpr);
  cv.height = Math.round(H * dpr);
  const x = cv.getContext("2d");
  x.setTransform(dpr, 0, 0, dpr, 0, 0);
  x.clearRect(0, 0, W, H);
  x.font = `${W < 480 ? 11 : 12}px system-ui`;
  x.textBaseline = "middle";
  return { x, W, H, narrow: W < 480 };
}

// Horizontal grid lines with y-axis labels.
function drawGrid(x, { L, R, W, max, step, fy, digits = 1 }) {
  x.lineWidth = 1;
  x.strokeStyle = cssVar("--line");
  x.fillStyle = cssVar("--muted");
  x.textAlign = "right";
  for (let v = 0; v <= max + 1e-9; v += step) {
    const y = fy(v);
    x.beginPath();
    x.moveTo(L, y);
    x.lineTo(W - R, y);
    x.stroke();
    x.fillText(v.toFixed(digits), L - 6, y);
  }
}

// Polyline through points [[px, py], ...].
function drawLine(x, pts, color, width, dash = []) {
  x.strokeStyle = color;
  x.lineWidth = width;
  x.setLineDash(dash);
  x.beginPath();
  pts.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py)));
  x.stroke();
  x.setLineDash([]);
}

// Redraw on resize (rotation, window change).
const onResize = (el, fn) => new ResizeObserver(fn).observe(el);