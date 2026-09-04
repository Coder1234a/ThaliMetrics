# IDEA.md — ThaliMetrics

## Official challenge (from NUTRITION_WEEK_HACKATHON_2026.pdf)

> How might we develop an innovative, affordable, accessible, and sustainable solution that improves nutrition and overall health while reducing the environmental impact of food choices?

ThaliMetrics addresses three of the official "possible areas of exploration" directly:
- **Campus nutrition** — improving food choices in hostels, messes, cafeterias
- **Food waste & sustainability** — reducing waste while promoting nutritious consumption
- **Micronutrient gaps** — identifying deficiencies and suggesting affordable dietary solutions

## Problem statement

Hostel messes waste large amounts of food every day, while the students eating in those same messes commonly fall short of basic nutrients — and neither side can see the other's part of the story. NFHS-5 shows anaemia among young Indian women (15–19 yrs) at 59.1%; ICMR-NIN sets protein RDA at 0.83 g/kg/day, a bar many students don't reliably clear. Meanwhile hostel mess waste audits have recorded 3–6 kg of leftover food per meal slot in a single block. The two problems are connected but tracked separately, if at all — and existing nutrition-tracking tools don't account for how Indian students actually eat: refills, shared serving bowls, and second helpings that a simple "log your plate once" model misses entirely.

## Solution statement

ThaliMetrics is a tap-and-log app used at the tray-return point, built around two realistic sessions per meal: **"I'm taking food"** (log each serving as you take it — including seconds) and **"I'm leaving / logging waste"** (show exactly how much of what you took is left, on a scale that matches your own portion, not a generic 0–100%). The same data stream does two jobs: gives each student a weekly digest covering every tracked nutrient (not just protein and iron), and gives the mess a per-dish, per-day waste dashboard with locally-relevant swap suggestions.

## Who it's for (three audiences)

1. **Students** — log meals across sessions/refills, see a full weekly nutrient digest segmented by their own gender and weight, get a generic nudge to the campus health centre if a gap persists (never a diagnosis, never a named supplement).
2. **Mess in-charge / chefs** — set today's menu, see daily/weekly/monthly waste by dish, get simple swap suggestions using locally available Tamil Nadu produce.
3. **Parents (opt-in, future)** — weekly summary email, not real-time tracking.

## What's on the demo path (build this)

- [x] Session-based logging: take → (repeat for refills) → leave/waste, with absolute (not relative) waste scaling
- [x] Vessel fill-slider (bowl/glass) and illustrated quarter-tap roti control as the input controls
- [x] Menu editing merged into the Log Meal page, scoped per meal-slot (breakfast/lunch/snacks/dinner)
- [x] Mess Dashboard: Today/Week/Month toggle, per-dish waste %, top-3-wasted-per-category, daily categorized breakdown, local swap suggestion
- [x] Weekly Digest: full nutrient panel (protein, carbs, fat, iron, calcium, vitamin A, vitamin C, folate, B12, zinc, fiber), gender + weight segmented
- [x] Live nutrient readout per dish, updating with the slider/stepper
- [x] Optional waste-reason tagging
- [x] Meal-level catch-up tracking (protein/iron only, flagged before later meals)
- [x] Low-waste streak badge
- [ ] Seed a full mock "week" of data so the dashboard/digest look populated at demo time, not empty
- [ ] Real, properly licensed food photos in place of the current CSS/SVG illustrations (deliberately not scraped from the web — see README)

## What's explicitly OFF the demo path (future roadmap)

- Apple Health / Samsung Health integration
- Exercise suggestions
- Voice-to-text menu planning for chefs
- Live vendor/backend integration — mock data is enough for the demo
- Named doctor/dietitian contacts or specific supplement suggestions — **stays generic permanently**, this is a real liability/safety line, not a time-saving cut

## Grounding data (cite these in the pitch)

| Data point | Source |
|---|---|
| 59.1% of young Indian women (15–19) are anaemic | NFHS-5 |
| ICMR-NIN protein RDA: 0.83 g/kg/day (both sexes) | ICMR-NIN RDA-2020 |
| Iron RDA: 19 mg/day (men), 29 mg/day (women) | ICMR-NIN RDA-2020 |
| 3–6 kg leftover food per meal slot recorded in hostel audits | Hostel mess waste-audit study, Rajasthan University |
| 17% of food wasted at consumer level in India | UNEP/WRAP Food Waste Index Report, 2021 |
| Eat Right Campus certifies on food safety, healthy diets, waste management, local food | FSSAI, Eat Right India |

Full sourcing detail: `docs/RESEARCH_REFERENCE.pdf`.

## Real-world destination

Designed to double as VIT's practical toolkit toward FSSAI's "Eat Right Campus" certification (IIT Gandhinagar was one of the first Indian institutes certified, in 2019) — a real destination beyond the hackathon, not just a demo.
