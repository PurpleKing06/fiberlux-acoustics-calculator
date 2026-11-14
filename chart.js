// ===== Fiberlux Acoustics Calculator — user interface =====

const BANDS = [125, 250, 500, 1000, 2000, 4000];

function update() {
  const t = +$("t").value,
    r = +$("r").value,
    g = +$("g").value,
    m = $("m").value;
  $("vt").textContent = t;
  $("vr").textContent = r;
  $("vg").textContent = g;

  const aD = BANDS.map((f) => alphaDiffuse(f, t, r, g, m));
  const aN = BANDS.map((f) => alphaNormal(f, t, r, g, m));

  // rating uses diffuse-field values (as in a reverberation room), 250…4000 Hz
  const res = rate(aD.slice(1));
  $("cls").textContent = res.cls;
  $("aw").textContent = res.aw.toFixed(2);
  $("nrc").textContent = res.nrc.toFixed(2);

  const w = rangeWarning(r, m);
  $("warn").textContent = w;
  $("warn").hidden = !w;

  const row = (label, arr) =>
    `<tr><td>${label}</td>` + arr.map((x) => `<td>${x.toFixed(2)}</td>`).join("") + "</tr>";
  $("tab").innerHTML =
    "<tr><th>Hz</th>" +
    BANDS.map((f) => `<th>${f}</th>`).join("") +
    "</tr>" +
    row("α diffuse", aD) +
    row("α normal", aN);

  draw(t, r, g, m);
}

function draw(t, r, g, m) {
  const cv = $("c");
  const dpr = window.devicePixelRatio || 1;
  const W = cv.clientWidth,
    H = cv.clientHeight;
  cv.width = Math.round(W * dpr);
  cv.height = Math.round(H * dpr);
  const x = cv.getContext("2d");
  x.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels, sharp on phones

  const narrow = W < 480;
  const L = 34,
    B = 24,
    T = 10,
    Rm = 10;
  const css = getComputedStyle(document.documentElement);
  const muted = css.getPropertyValue("--muted").trim();
  const line = css.getPropertyValue("--line").trim();
  const accent = css.getPropertyValue("--accent").trim();

  x.clearRect(0, 0, W, H);
  x.font = `${narrow ? 11 : 12}px system-ui`;
  x.textBaseline = "middle";

  // y-axis grid
  const fy = (v) => H - B - v * (H - B - T);
  x.strokeStyle = line;
  x.fillStyle = muted;
  x.lineWidth = 1;
  for (let v = 0; v <= 1.0001; v += 0.2) {
    const y = fy(v);
    x.beginPath();
    x.moveTo(L, y);
    x.lineTo(W - Rm, y);
    x.stroke();
    x.textAlign = "right";
    x.fillText(v.toFixed(1), L - 6, y);
  }

  // x-axis labels (fewer on narrow screens)
  const fx = (f) => L + (Math.log(f / 100) / Math.log(5000 / 100)) * (W - L - Rm);
  const ticks = narrow ? [125, 500, 2000] : BANDS;
  const lab = (f) => (f >= 1000 ? f / 1000 + "k" : f);
  x.textAlign = "center";
  ticks.forEach((f) => x.fillText(lab(f), fx(f), H - B / 2));

  // curves
  const curve = (fn, color, width, dash) => {
    x.strokeStyle = color;
    x.lineWidth = width;
    x.setLineDash(dash);
    x.beginPath();
    let first = true;
    for (let f = 100; f <= 5000; f *= 1.04) {
      const y = fy(fn(f));
      first ? x.moveTo(fx(f), y) : x.lineTo(fx(f), y);
      first = false;
    }
    x.stroke();
    x.setLineDash([]);
  };
  curve((f) => alphaNormal(f, t, r, g, m), muted, 1.5, [5, 4]);
  curve((f) => alphaDiffuse(f, t, r, g, m, 30), accent, 3, []);
}

["t", "r", "g", "m"].forEach((id) => $(id).addEventListener("input", update));
new ResizeObserver(() => update()).observe($("c"));
update();
