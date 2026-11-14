// ===== Fiberlux Acoustics Calculator — physics =====

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
const OCTAVES = [250, 500, 1000, 2000, 4000]; // ISO 11654 rating bands [Hz]

// Airflow resistivity [Pa·s/m²], least-squares power fit to Rubino et al. (2023):
// TW-68: 17 400 | TW-96: 31 700 | TW-134: 95 500  (measured, airlaid textile waste)
// Valid only for 68–134 kg/m³; outside this range it is an extrapolation.
const sigma = (rho) => 15900 * Math.pow(rho / 68, 2.5);

// Felt properties: characteristic impedance Zc and complex wavenumber k
// model = 'db' (Delany–Bazley 1970) | 'miki' (Miki 1990)
function porous(f, rho, model) {
  const s = sigma(rho),
    k0 = (2 * Math.PI * f) / C0;
  if (model === "miki") {
    const X = f / s;
    return {
      Zc: C(Z0 * (1 + 0.07 * X ** -0.632), -Z0 * 0.107 * X ** -0.632),
      k: C(k0 * (1 + 0.109 * X ** -0.618), -k0 * 0.16 * X ** -0.618),
    };
  }
  const X = (RHO0 * f) / s; // Delany–Bazley
  return {
    Zc: C(Z0 * (1 + 0.0571 * X ** -0.754), -Z0 * 0.087 * X ** -0.732),
    k: C(k0 * (1 + 0.0978 * X ** -0.7), -k0 * 0.189 * X ** -0.595),
  };
}

// Absorption at incidence angle th [rad] (extended reaction).
// f [Hz], tMM felt thickness [mm], rho [kg/m³], gMM air gap [mm]
function alphaTheta(f, tMM, rho, gMM, th, model) {
  const { Zc, k } = porous(f, rho, model);
  const j = C(0, 1);
  const k0 = (2 * Math.PI * f) / C0,
    kx = k0 * Math.sin(th),
    cos = Math.cos(th);
  const kz = sqrtC(add(mul(k, k), C(-kx * kx))); // wavenumber inside felt, toward wall
  const Zcz = div(mul(Zc, k), kz); // felt impedance in that direction
  const t = tan(mul(kz, C(tMM / 1000)));
  const Z0t = Z0 / cos; // air impedance at angle θ
  let Zs;
  // felt directly on a rigid wall
  if (gMM <= 0) Zs = div(Zcz, mul(j, t));
  // air gap between felt and wall
  else {
    const Zb = div(C(Z0t), mul(j, C(Math.tan((k0 * cos * gMM) / 1000))));
    Zs = mul(Zcz, div(add(Zb, mul(j, mul(Zcz, t))), add(Zcz, mul(j, mul(Zb, t)))));
  }
  const R = div(add(Zs, C(-Z0t)), add(Zs, C(Z0t)));
  return Math.max(0, 1 - abs(R) ** 2);
}

// Normal incidence (θ = 0) — impedance-tube situation
const alphaNormal = (f, tMM, rho, gMM, model) => alphaTheta(f, tMM, rho, gMM, 0, model);

// Diffuse field (Paris formula): α = ∫ α(θ)·sin(2θ) dθ, θ = 0…90°
function alphaDiffuse(f, tMM, rho, gMM, model, N = 45) {
  const d = Math.PI / 2 / N;
  let s = 0;
  for (let i = 0; i < N; i++) {
    const th = (i + 0.5) * d; // midpoint rule: avoids θ = 90°
    s += alphaTheta(f, tMM, rho, gMM, th, model) * Math.sin(2 * th) * d;
  }
  return Math.min(1, s);
}

// Warning when Delany–Bazley is outside 0.01 < X < 1 at any rating band
function rangeWarning(rho, model) {
  if (model === "miki") return "";
  const bad = OCTAVES.filter((f) => {
    const X = (RHO0 * f) / sigma(rho);
    return X < 0.01 || X > 1;
  });
  return bad.length
    ? `Delany–Bazley is outside its valid range at ${bad.join(", ")} Hz — results there are unreliable. Switch to Miki.`
    : "";
}

// ISO 11654: αw, class and NRC from octave values 250…4000 Hz
function rate(p) {
  const ap = p.map((a) => Math.min(1, Math.round(a * 20) / 20)),
    ref = [0.8, 1, 1, 1, 0.9];
  let s = 0;
  for (; s <= 1; s += 0.05) {
    const dev = ap.reduce((acc, a, i) => acc + Math.max(0, ref[i] - s - a), 0);
    if (dev <= 0.1001) break;
  }
  const aw = Math.max(0, Math.round((1 - s) * 20) / 20);
  const cls =
    aw >= 0.9 ? "A" : aw >= 0.8 ? "B" : aw >= 0.6 ? "C" : aw >= 0.3 ? "D" : aw >= 0.15 ? "E" : "–";
  const nrc = Math.round(((ap[0] + ap[1] + ap[2] + ap[3]) / 4) * 20) / 20;
  return { aw, cls, nrc };
}

const $ = (id) => document.getElementById(id);