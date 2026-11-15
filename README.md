# Fiberlux Studio
 
**Fibre reborn — acoustic materials from post-consumer textile fibre.**
 
A free, browser-based engineering tool that predicts how well Fiberlux nonwoven felt absorbs sound. Change the panel thickness, density and mounting, and the tool returns the absorption curve, the weighted sound absorption coefficient αw, the European absorption class (A–E) and NRC — in real time.
 
> **An estimate, not a certificate.** Results are calculated from published physical models and measured material data. Certified product values require a reverberation-room test according to EN ISO 354.
 
## Why it matters
 
Architects usually choose acoustic materials from a catalogue and adapt the room to the material. Fiberlux reverses this: the room's requirements define the material. Recycled textile fibre is an effective sound absorber, and airlay technology lets thickness and density be set on the production line.
 
This calculator shows partners and investors three things:
 
1. **The product works in physics, not only in marketing.** Textile-fibre felt is an effective sound absorber; the tool shows how much and under which conditions.
2. **Product design is data-driven.** Thickness and density can be optimised for a target class before a single panel is produced, which shortens trials and reduces cost.
3. **We know our limits.** Model validity, assumptions and sources are documented openly below.
 
## What it calculates
 
| Output | Meaning |
|---|---|
| α (125–4000 Hz) | Share of sound energy absorbed at each frequency (0 = none, 1 = all) |
| αw | Single-number rating used on EU product sheets (EN ISO 11654) |
| Class A–E | EU sound absorption class; A = best (αw ≥ 0.90) |
| NRC | Average absorption 250–2000 Hz, common in the US and UK |
 
Typical requirements: class A–B for offices, studios and classrooms; C–D for corridors and living spaces.
 
## How to use
 
Open `index.html` in any modern browser, or use the GitHub Pages version. No installation or server needed; the room calculator loads jsPDF for PDF export. Works on desktop and mobile.
 
- **Thickness** (10–100 mm) — thicker felt absorbs more low-frequency sound.
- **Density** (50–140 kg/m³) — too low lets sound pass through, too high reflects it.
- **Air gap** (0–200 mm) — distance from the wall. 0 = mounted directly on the wall; a larger gap improves low-frequency absorption, as with a suspended ceiling.
- **Model** — Miki (recommended) or Delany–Bazley (for comparison).
 
**Chart:** the solid line is diffuse-field sound (sound arriving from all directions, as in a real room); the class is calculated from it. The dashed line is sound hitting the panel head-on, as in an impedance-tube test.
 
## How it works
 
**Airflow resistivity σ** — how strongly the felt resists air movement — is derived from density, fitted to measured airflow resistivity of airlaid panels made from post-consumer textile fibre (Rubino et al., 2023):
 
σ ≈ 15 900 · (ρ / 68)^2.5 Pa·s/m²
 
| Measured sample | Density | σ (Pa·s/m²) |
|---|---|---|
| TW-68 | 68 kg/m³ | 17 400 |
| TW-96 | 96 kg/m³ | 31 700 |
| TW-134 | 134 kg/m³ | 95 500 |
 
**Felt acoustics** — characteristic impedance and complex wavenumber from the Miki (1990) or Delany–Bazley (1970) model.
 
**Mounting** — felt on a rigid wall, or with an air gap behind it (transfer-impedance method).
 
**Diffuse field** — absorption averaged over all angles of incidence with the Paris integral (0–90°, extended reaction).
 
**Rating** — αw, class and NRC following the EN ISO 11654 method.
 
| File | Purpose |
|---|---|
| `index.html` | Material calculator |
| `room.html` | Room calculator: panel area, reverberation time, PDF |
| `scripts/common.js` | Shared helpers: complex maths, constants, chart drawing |
| `scripts/index.js` | Material model, ISO 11654 rating, interface |
| `scripts/room.js` | Room model (Sabine), panel sizing, PDF export |
| `styles/global.css` | Shared layout, colours, light/dark theme, mobile |
| `styles/index.css` | Material calculator styles |
| `styles/room.css` | Room calculator styles |
 
## Limits and assumptions
 
- **Model validity.** Delany–Bazley is valid only for 0.01 < ρ₀f/σ < 1. With this calibration, 250 Hz falls outside the range above ≈ 88 kg/m³ and 500 Hz above ≈ 116 kg/m³. The tool warns the user; Miki is recommended for dense felt.
- **Calibration range.** σ is calibrated on three measured samples (68–134 kg/m³) of airlaid felt from published research — not yet on Fiberlux's own material. Other fibre blends, binders or needle-punching will change σ.
- **Rating method.** ISO 11654 uses octave values derived from one-third-octave measurements; the tool calculates them directly at octave centre frequencies.
- **Lab vs. model.** Deviations of ±0.1 in αw or more from a reverberation-room measurement are possible.
- **Scope.** Sound absorption only. Fire class, thermal conductivity and mechanical properties are not modelled.
 
## Roadmap
 
1. **Calibration on Fiberlux felt** — replace literature values with airflow resistivity measured on Fiberlux samples in laboratory tests during the EIT Spark programme.
2. **Validation** — compare predictions with impedance-tube (ISO 10534-2) and reverberation-room (ISO 354) measurements; publish the deviation.
 
## Sources
 
- Rubino, C., Liuzzi, S., Stefanizzi, P., Martellotta, F. (2023). Characterization of sustainable building materials obtained from textile waste: from laboratory prototypes to real-world manufacturing processes. *Journal of Cleaner Production*, 390, 136098. https://doi.org/10.1016/j.jclepro.2023.136098
- Rubino, C. et al. (2023). Forum Acusticum 2023, Turin. (Airflow resistivity values for TW-68, TW-96 and TW-134.)
- Delany, M. E., Bazley, E. N. (1970). Acoustical properties of fibrous absorbent materials. *Applied Acoustics*, 3(2), 105–116. https://doi.org/10.1016/0003-682X(70)90031-9
- Miki, Y. (1990). Acoustical properties of porous materials — Modifications of Delany–Bazley models. *Journal of the Acoustical Society of Japan (E)*, 11(1), 19–24. https://doi.org/10.1250/ast.11.19
- Paris, E. T. (1928). On the coefficient of sound absorption measured by the reverberation method. *Philosophical Magazine*.
- EN ISO 11654:1997 — Acoustics. Sound absorbers for use in buildings. Rating of sound absorption.
- EN ISO 354:2003 — Acoustics. Measurement of sound absorption in a reverberation room.
 
## About
 
Fiberlux · [fiberlux.ee](https://www.fiberlux.ee)
 
Version 0.2 — diffuse-field estimate, Miki model, validity warning, mobile layout.
 
© 2026 Martin Toom & Kristen Toom. All rights reserved.
