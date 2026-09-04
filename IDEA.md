# IDEA.md — ThaliMetrics

## Problem statement

Hostel messes waste large amounts of food every day, while the students eating in those same messes commonly fall short of basic nutrients — and neither side can see the other's part of the story. NFHS-5 shows anaemia among young Indian women (15–19 yrs) at 59.1%; average protein intake commonly trails the ICMR-NIN reference of 0.83 g/kg/day. Meanwhile hostel mess waste audits have recorded 3–6 kg of leftover food per meal slot in a single block. The two problems are connected but tracked separately, if at all.

## Solution statement

ThaliMetrics is a tap-and-log app used at the tray-return point. Students log what they took and wasted with a bowl slider (wet/loose items) or a four-quarter tap grid (roti/flat items) — under five seconds, no typing. The same data stream does two jobs: gives each student a weekly nutrient-gap digest, and gives the mess a per-dish waste chart with swap suggestions.

## Who it's for (three audiences)

1. **Students** — log meals, see a weekly nutrient digest, get a generic nudge to the campus health centre if a gap persists (never a diagnosis, never a named supplement).
2. **Mess in-charge / chefs** — see which dishes are over-prepared, get simple ingredient-swap suggestions.
3. **Parents (opt-in, future)** — weekly summary email, not real-time tracking.

## What's on the demo path (build this)

- [x] Tap-and-log UI (bowl slider + quarter-tap grid)
- [x] Mess dashboard: per-dish waste % chart + top swap suggestion
- [x] Weekly nutrient digest vs ICMR-NIN protein/iron reference
- [ ] Sample data seeded for a full mock "week" so the dashboard/digest look populated at demo time, not empty
- [ ] One polish pass on mobile view (judges may view on a phone)

## What's explicitly OFF the demo path (future roadmap, don't build this now)

- Apple Health / Samsung Health integration
- Exercise suggestions
- Voice-to-text menu planning for chefs
- Live vendor/backend integration — mock data is enough for the demo
- Named doctor/dietitian contacts or specific supplement suggestions — **this stays generic permanently**, not just for the hackathon; it's a real liability/safety line, not a time-saving cut

## Grounding data (cite these in the pitch)

| Data point | Source |
|---|---|
| 59.1% of young Indian women (15–19) are anaemic | NFHS-5 |
| ICMR-NIN protein RDA: 0.83 g/kg/day | ICMR-NIN Dietary Guidelines for Indians, 2024 |
| 3–6 kg leftover food per meal slot recorded in hostel audits | Hostel mess waste-audit study, Rajasthan University |
| 17% of food wasted at consumer level in India | UNEP/WRAP Food Waste Index Report, 2021 |
| Eat Right Campus certifies on food safety, healthy diets, waste management, local food | FSSAI, Eat Right India |

## Real-world destination

Designed to double as VIT's practical toolkit toward FSSAI's "Eat Right Campus" certification (IIT Gandhinagar was one of the first Indian institutes certified, in 2019) — this gives the project a real destination beyond the hackathon, not just a demo.
