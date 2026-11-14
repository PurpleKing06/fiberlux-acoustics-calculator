# Fiberlux Acoustics Calculator

**Fibre reborn — acoustic insulation from post-consumer textiles.**

An free, browser-based engineering tool that predicts how well Fiberlux nonwoven felt
absorbs sound. Change the panel thickness, density and mounting, and the tool returns
the absorption curve, the weighted sound absorption coefficient αw, the European
absorption class (A–E) and the NRC — in real time.

> **Estimate, not certification.** Results are calculated from published physical
> models and measured material data. Certified product values require a
> reverberation-room test according to EN ISO 354.

---

## Why this matters

Europe discards millions of tonnes of clothing and household textiles every year.
Extended producer responsibility (EPR), rising incineration costs and landfill
restrictions are turning this stream into a resource that must be processed.

Fiberlux (brand of Clantser OÜ, Estonia) is developing Estonia's first facility for
mechanical recycling of post-consumer textiles into nonwoven felt for acoustic and
thermal insulation, planned in Pärnu County.

This calculator shows three things to partners and investors:

1. **The product works in physics, not only in marketing.** Textile fibre felt is an
   effective sound absorber; the tool shows by how much and under which conditions.
2. **Product design is data-driven.** Thickness and density can be optimised for a
   target class before a single panel is produced, which shortens trials and reduces cost.
3. **The company knows its limits.** Model validity, assumptions and sources are
   documented openly below.

---

## What it calculates

| Output            | Meaning                                                              |
|-------------------|----------------------------------------------------------------------|
| **α (125–4000 Hz)** | Share of sound energy absorbed at each frequency (0 = none, 1 = all) |
| **αw**            | Single-number rating used in EU product data sheets (EN ISO 11654)    |
| **Class A–E**     | EU sound absorption class; A = best (αw ≥ 0.90)                       |
| **NRC**           | Average absorption 250–2000 Hz, common in the US and UK               |

Typical requirements: class A–B for offices, studios and classrooms; C–D for
corridors and living spaces.

---

## How to use

Open `index.html` in any modern browser, or use the GitHub Pages version.
No installation, server or external libraries are needed. Works on desktop and mobile.

1. **Thickness** (10–100 mm) — thicker felt absorbs more low-frequency sound.
2. **Density** (50–140 kg/m³) — too low lets sound pass through, too high reflects it.
3. **Air gap** (0–200 mm) — distance from the wall. 0 = mounted directly on the wall;
   a larger gap improves low-frequency absorption, as in a suspended ceiling.
4. **Model** — Miki (recommended) or Delany–Bazley (for comparison).

**Chart:** the solid line is diffuse sound (sound arriving from all directions, as in a
real room); the class is calculated from it. The dashed line is sound hitting the panel
straight on, as in an impedance-tube test.

---

## How it works

1. **Airflow resistivity** σ — how strongly the felt resists air moving through it —
   is derived from density, fitted to measured airlaid panels made from post-consumer
   textile fibres (Rubino et al., 2023):

   σ ≈ 15 900 · (ρ / 68)^2.5 Pa·s/m²

   | Measured sample | Density   | σ (Pa·s/m²) |
   |-----------------|-----------|-------------|
   | TW-68           | 68 kg/m³  | 17 400      |
   | TW-96           | 96 kg/m³  | 31 700      |
   | TW-134          | 134 kg/m³ | 95 500      |

2. **Felt acoustics** — characteristic impedance and complex wavenumber from the
   Miki (1990) or Delany–Bazley (1970) model.
3. **Mounting** — felt on a rigid wall, or with an air gap behind it
   (transfer-impedance method).
4. **Diffuse field** — absorption averaged over all angles of incidence with the
   Paris integral (0–90°, extended reaction).
5. **Rating** — αw, class and NRC following the EN ISO 11654 method.

| File         | Purpose                                            |
|--------------|----------------------------------------------------|
| `index.html` | Page structure and controls                        |
| `index.js`   | Physics: felt model, absorption, ISO 11654 rating  |
| `chart.js`   | Interface: results, table, chart                   |
| `style.css`  | Layout, light/dark theme, mobile layout            |

---

## Limits and assumptions

- **Model validity.** Delany–Bazley is valid only for 0.01 < ρ₀f/σ < 1. With this
  calibration, 250 Hz falls outside the range above ≈ 88 kg/m³ and 500 Hz above
  ≈ 116 kg/m³. The tool warns the user; Miki is recommended for dense felt.
- **Calibration range.** σ is calibrated on three measured samples (68–134 kg/m³) of
  airlaid felt from published research — not yet on Fiberlux's own production.
  Other fibre blends, binders or needle-punching will change σ.
- **Rating method.** ISO 11654 uses octave values derived from one-third-octave
  measurements; the tool calculates them directly at octave centre frequencies.
- **Lab vs. model.** Deviations of ±0.1 in αw or more from a reverberation-room
  measurement are possible.
- **Scope.** Sound absorption only. Fire class, thermal conductivity and mechanical
  properties are not modelled.

---

## Roadmap

- **Calibration on Fiberlux felt** — replace literature values with airflow
  resistivity measured on samples from Fiberlux line trials.
- **Validation** — compare predictions with impedance-tube and reverberation-room
  measurements; publish the deviation.
- **Product presets** — ready configurations for the standard product range
  (wall panels, ceiling panels, acoustic layers).
- **Thermal module** — estimate thermal conductivity λ alongside acoustics.

---

## Sources

- Rubino, C., Liuzzi, S., Stefanizzi, P., Martellotta, F. (2023). Characterization of
  sustainable building materials obtained from textile waste: From laboratory
  prototypes to real-world manufacturing processes. *Journal of Cleaner Production*,
  390, 136098. https://doi.org/10.1016/j.jclepro.2023.136098
- Rubino, C. et al. (2023). Exploring the potential of recycled textile panels to
  improve sound insulation in buildings. *Forum Acusticum 2023*, Turin.
  (Airflow-resistivity values for TW-68, TW-96 and TW-134.)
- Delany, M. E., Bazley, E. N. (1970). Acoustical properties of fibrous absorbent
  materials. *Applied Acoustics*, 3(2), 105–116.
  https://doi.org/10.1016/0003-682X(70)90031-9
- Miki, Y. (1990). Acoustical properties of porous materials — Modifications of
  Delany–Bazley models. *Journal of the Acoustical Society of Japan (E)*, 11(1), 19–24.
  https://doi.org/10.1250/ast.11.19
- Paris, E. T. (1928). On the coefficient of sound-absorption measured by the
  reverberation method. *Philosophical Magazine*.
- EN ISO 11654:1997 — Sound absorbers for use in buildings — Rating of sound absorption.
- EN ISO 354:2003 — Measurement of sound absorption in a reverberation room.

---

## About

**Fiberlux** is a registered trademark of **Clantser OÜ** (Estonia).
Website: [fiberlux.ee](https://fiberlux.ee)

Version 0.2 — diffuse-field rating, Miki model, validity warning, mobile layout.

© 2026 Clantser OÜ. All rights reserved.