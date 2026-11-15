// ===== room.js — room calculator (needs common.js; jsPDF optional) =====

// ---------- data ----------

// Absorption coefficients 125 / 250 / 500 / 1000 / 2000 / 4000 Hz
const MAT = {
  concrete: [0.01, 0.01, 0.02, 0.02, 0.02, 0.03],
  gypsum: [0.29, 0.1, 0.05, 0.04, 0.07, 0.09],
  wood: [0.15, 0.11, 0.1, 0.07, 0.06, 0.07],
  carpet: [0.02, 0.06, 0.14, 0.37, 0.6, 0.65],
  linoleum: [0.02, 0.03, 0.03, 0.03, 0.03, 0.02],
  window: [0.35, 0.25, 0.18, 0.12, 0.07, 0.04],
};

// From the Fiberlux material model: Miki, diffuse field, 70 kg/m³, on rigid backing
const PANELS = [
  {
    name: "Basic",
    mm: 25,
    a: [0.05, 0.14, 0.32, 0.57, 0.81, 0.92],
    color: "--muted",
    dash: [2, 3],
  },
  {
    name: "Design",
    mm: 40,
    a: [0.1, 0.26, 0.53, 0.8, 0.93, 0.95],
    color: "--accent",
    dash: [6, 4],
  },
  {
    name: "Premium",
    mm: 60,
    a: [0.2, 0.45, 0.76, 0.92, 0.94, 0.95],
    color: "--warn-ink",
    dash: [],
  },
];

const DENSITY = 70; // kg/m³, same as material calculator default
const SABINE = 0.161; // s/m
const RED = "#c0392b";

// ---------- physics ----------

const tmid = (T) => (T[2] + T[3]) / 2; // mean of 500 and 1000 Hz

// Panel absorption gain over a surface; a panel never makes a surface less absorbent
// (e.g. gypsum board keeps its low-frequency absorption behind the felt).
const gain = (panel, surface, i) => Math.max(0, panel[i] - MAT[surface][i]);

function room({ L, W, H, floor, walls, ceiling, win, target }) {
  const V = L * W * H;
  const Af = L * W,
    Ac = L * W;
  const Aw = Math.max(0, 2 * (L + W) * H - win); // net wall area, windows subtracted
  const A0 = BANDS.map(
    (_, i) => Af * MAT[floor][i] + Ac * MAT[ceiling][i] + Aw * MAT[walls][i] + win * MAT.window[i],
  );
  const T0 = A0.map((a) => (SABINE * V) / a);
  const Aneed = (SABINE * V) / target;

  const variants = PANELS.map((p) => {
    // panel area needed in band i: ceiling first, then walls
    const areaFor = (i) => {
      const dA = Aneed - A0[i];
      if (dA <= 0) return 0;
      const gc = gain(p.a, ceiling, i),
        gw = gain(p.a, walls, i);
      if (gc > 0 && dA <= Ac * gc) return dA / gc;
      const rest = dA - Ac * gc;
      return gw > 0 ? Ac + rest / gw : Infinity;
    };
    const needed = Math.max(...[2, 3, 4].map(areaFor)); // 500, 1000, 2000 Hz
    const maxArea = Ac + Aw;
    const S = Math.min(needed, maxArea);
    const onCeil = Math.min(S, Ac),
      onWall = S - onCeil;
    const A1 = A0.map((a, i) => a + onCeil * gain(p.a, ceiling, i) + onWall * gain(p.a, walls, i));
    const T1 = A1.map((a) => (SABINE * V) / a);
    return {
      ...p,
      S,
      onCeil,
      onWall,
      T1,
      feasible: needed <= maxArea,
      bass: T1[0] > 1.5 * target || T1[1] > 1.5 * target,
      kg: S * (p.mm / 1000) * DENSITY,
    };
  });
  return { V, T0, variants };
}

// ---------- user interface ----------

let winEdited = false; // stop auto-filling windows once the user types a value
let last = null;

function readInputs() {
  const L = clampInput("L", 8, "m"),
    W = clampInput("W", 7, "m"),
    H = clampInput("H", 3, "m");
  $("win").max = f1(0.5 * 2 * (L + W) * H); // windows: at most half of the wall area
  if (!winEdited) $("win").value = f1(0.1 * L * W);
  return {
    L,
    W,
    H,
    floor: $("floor").value,
    walls: $("walls").value,
    ceiling: $("ceiling").value,
    win: clampInput("win", 0.1 * L * W, "m²"),
    target: +$("type").value,
    typeName: $("type").selectedOptions[0].text.replace(/ \(.*/, ""),
  };
}

function variantCard(v, target) {
  const t = tmid(v.T1);
  let html = `<div><h3>Fiberlux ${v.name} ${v.mm} mm</h3>`;
  if (v.S === 0) {
    html += `<div class="num ok">0 m²</div><div class="hint">Room already meets the target.</div>`;
  } else {
    html += `<div class="num">${Math.ceil(v.S)} m²</div>`;
    html +=
      `<div class="hint">${f1(v.onCeil)} m² ceiling` +
      (v.onWall > 0 ? ` + ${f1(v.onWall)} m² walls` : "") +
      `</div>`;
    html +=
      `<div class="hint">Result: <b class="${t > target * 1.05 ? "bad" : "ok"}">${f2(t)} s</b>` +
      ` · Secondary fibre: ${Math.round(v.kg)} kg</div>`;
  }
  if (!v.feasible)
    html += `<div class="warnline">Uses all ceiling and wall area; target not reached at every frequency — choose a thicker panel.</div>`;
  if (v.bass) {
    const tip =
      v.name === "Premium"
        ? "Mount the panels with an air gap behind them."
        : "Use Premium or mount with an air gap.";
    html += `<div class="warnline">Bass (125–250 Hz) stays above 1.5 × target. ${tip}</div>`;
  }
  return html + "</div>";
}

function update() {
  const inp = readInputs();
  const r = room(inp);
  last = { inp, r };

  const now = tmid(r.T0);
  $("tnow").textContent = f2(now) + " s";
  $("tnow").className = "big " + (now > inp.target ? "bad" : "ok");
  $("ttarget").textContent = f2(inp.target) + " s";

  $("variants").innerHTML = r.variants.map((v) => variantCard(v, inp.target)).join("");

  const row = (label, T) =>
    `<tr><td>${label}</td>` + T.map((v) => `<td>${f2(v)}</td>`).join("") + "</tr>";
  $("tab").innerHTML =
    "<tr><th>T (s)</th>" +
    BANDS.map((f) => `<th>${f}</th>`).join("") +
    "</tr>" +
    row("Now", r.T0) +
    r.variants.map((v) => row(v.name, v.T1)).join("");

  draw();
}

// hx = pointer x in CSS pixels for the tooltip, or null
function draw(hx = null) {
  if (!last) return;
  const { r, inp } = last;
  const { x, W, H, narrow } = setupCanvas($("c"));
  const L = 36,
    B = 24,
    T = 10,
    R = 10;
  const top = Math.max(1, ...r.T0);
  const step = top <= 2 ? 0.5 : top <= 5 ? 1 : top <= 10 ? 2 : 5; // about 5 grid lines
  const tmax = Math.ceil(top / step) * step;
  const fy = (t) => H - B - (Math.min(t, tmax) / tmax) * (H - B - T);
  const fx = (i) => L + (i / (BANDS.length - 1)) * (W - L - R);

  drawGrid(x, { L, R, W, max: tmax, step, fy });
  x.textAlign = "center";
  BANDS.forEach((f, i) => {
    if (!narrow || i % 2 === 0) x.fillText(freqLabel(f), fx(i), H - B / 2);
  });

  const pts = (Ts) => Ts.map((t, i) => [fx(i), fy(t)]);
  drawLine(
    x,
    [
      [L, fy(inp.target)],
      [W - R, fy(inp.target)],
    ],
    RED,
    1,
    [3, 3],
  );
  drawLine(x, pts(r.T0), cssVar("--ink"), 3);
  r.variants.forEach((v) => drawLine(x, pts(v.T1), cssVar(v.color), 2, v.dash));

  if (hx !== null && hx >= L - 10 && hx <= W - R + 10) {
    // nearest octave band to the pointer
    const i = Math.max(
      0,
      Math.min(BANDS.length - 1, Math.round(((hx - L) / (W - L - R)) * (BANDS.length - 1))),
    );
    drawTooltip(x, {
      px: fx(i),
      W,
      T,
      bottom: H - B,
      lines: [
        `${BANDS[i]} Hz`,
        `Now: ${f2(r.T0[i])} s`,
        ...r.variants.map((v) => `${v.name}: ${f2(v.T1[i])} s`),
        `Target: ${f2(inp.target)} s`,
      ],
      dots: [
        [fy(r.T0[i]), cssVar("--ink")],
        ...r.variants.map((v) => [fy(v.T1[i]), cssVar(v.color)]),
      ],
    });
  }

  $("legend").innerHTML =
    `<span><i class="sw" style="border-top:3px solid var(--ink)"></i>Now</span>` +
    `<span><i class="sw" style="border-top:2px dashed ${RED}"></i>Target</span>` +
    r.variants
      .map(
        (v) =>
          `<span><i class="sw" style="border-top:2px ${v.dash.length ? "dashed" : "solid"} var(${v.color})"></i>${v.name}</span>`,
      )
      .join("");
}

function downloadPdf() {
  if (!window.jspdf) return window.print(); // fallback if the library did not load
  const { inp, r } = last;
  const doc = new window.jspdf.jsPDF();
  const label = (id) => $(id).selectedOptions[0].text; // text as shown on the page
  let y = 20;
  const ln = (text, size = 11, gap = 7) => {
    doc.setFontSize(size);
    doc.text(text, 20, y);
    y += gap;
  };
  ln("Fiberlux Studio — Room acoustics specification", 16, 10);
  ln(`Date: ${new Date().toISOString().slice(0, 10)}`, 10, 10);
  ln(`Room: ${inp.typeName}, ${inp.L} x ${inp.W} x ${inp.H} m (V = ${f1(r.V)} m³)`);
  const limited = ["L", "W", "H", "win"].filter((id) => $(id).classList.contains("out"));
  if (limited.length)
    ln(
      `Note: ${limited.map((id) => $(id).labels[0].textContent).join(", ")} outside the allowed range — limit value used.`,
      9,
      6,
    );
  ln(
    `Floor: ${label("floor")}; walls: ${label("walls")}; ceiling: ${label("ceiling")}; windows: ${f1(inp.win)} m²`,
  );
  ln(
    `Reverberation time now (500–1000 Hz): ${f2(tmid(r.T0))} s; target: ${f2(inp.target)} s`,
    11,
    12,
  );
  r.variants.forEach((v) => {
    ln(`Fiberlux ${v.name} ${v.mm} mm`, 12, 6);
    ln(
      `  Panel area: ${Math.ceil(v.S)} m² (${f1(v.onCeil)} m² ceiling` +
        (v.onWall > 0 ? `, ${f1(v.onWall)} m² walls)` : ")"),
      10,
      5,
    );
    ln(
      `  Result (500–1000 Hz): ${f2(tmid(v.T1))} s; secondary fibre: ${Math.round(v.kg)} kg`,
      10,
      5,
    );
    if (!v.feasible)
      ln("  Uses all ceiling and wall area; target not reached at every frequency.", 10, 5);
    if (v.bass)
      ln(
        v.name === "Premium"
          ? "  Bass stays above 1.5 x target: mount with an air gap."
          : "  Bass stays above 1.5 x target: use Premium or an air gap.",
        10,
        5,
      );
    y += 4;
  });
  ln("CO2 data: to be assessed during the EIT Spark programme.", 10, 8);
  ln("Indicative values. Empty room, Sabine formula; less accurate when absorption", 9, 5);
  ln("is concentrated on one surface. Laboratory validation during the EIT Spark programme.", 9, 5);
  ln("fiberlux.ee", 9, 5);
  doc.save("fiberlux-room-specification.pdf");
}

document.addEventListener("DOMContentLoaded", () => {
  ["type", "L", "W", "H", "floor", "walls", "ceiling", "win"].forEach((id) =>
    $(id).addEventListener("input", () => {
      if (id === "win") winEdited = true;
      update();
    }),
  );
  $("pdf").addEventListener("click", downloadPdf);
  onResize($("c"), () => draw());
  hoverable($("c"), draw);
  update();
});