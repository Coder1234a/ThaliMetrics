# Competitive Analysis — What We Looked At, What We Took

Quick reference for the pitch: "how is this different from X" answers, and an honest account of which ideas were borrowed from where.

## Apps/systems reviewed

### HealthifyMe (India, nutrition tracking)
- Built its core value around a curated Indian food nutrition database (co-developed with National Institute of Nutrition) — validates that a India-specific food database is the right foundation, not a generic Western calorie counter.
- "Snap" feature: photo-based food recognition trained on ~150,000 Indian food items, explicitly built to handle thali-style plates with multiple items and portions in one image.
- **Gap we fill that they don't**: HealthifyMe is purely individual/consumer-facing — it has no concept of a shared mess, a kitchen-side dashboard, or waste at all. It solves "what did I eat," not "what did the kitchen over-cook."

### Leanpath / Winnow (commercial kitchen food-waste tracking, global)
- Industry-standard systems for restaurants, hospitals, and university kitchens. Core workflow: **Track → Discover → Drive** — log waste, find patterns, act on them.
- Critically, they don't just log *how much* is wasted — they capture **why** (kitchen error, customer leftover, over-prep) via a quick-select reason at the point of logging.
- Report average 50% waste reduction and 2–6% purchase-cost reduction once kitchens can see patterns by reason, not just by volume.
- **Gap we fill that they don't**: these are B2B kitchen-side tools only — no student-facing nutrition layer at all. A hostel mess can't justify a Leanpath-grade hardware+camera install; needs something built for a phone.

## What we decided to steal — and why it's feasible right now

| Idea | Source | Why it's in scope | Where it landed |
|---|---|---|---|
| **Reason tag on waste** ("too much served," "didn't like taste," "not hungry," "ran out of time") | Leanpath's Track-Discover-Drive model | Zero extra hardware, just 4 buttons — but turns a raw waste % into an actionable "is this a portion-size problem or a recipe problem" signal for the mess | Waste-logging session, feeds into dashboard swap suggestions |
| **India-specific food/nutrient database as the foundation, not a generic one** | HealthifyMe | Already our approach, but this confirmed it's the right one — an Indian mess app copying a Western calorie-counter's food list would be useless day one | `DISH_LIBRARY` in mockData.js |
| **Lightweight streak/engagement badge** | General pattern from consumer health apps (HealthifyMe, Duolingo-style engagement loops) | Costs nothing to compute from data we already have; cheap motivation without turning into a full gamification system we don't have time to build | "🔥 N meals in a row with low waste" badge on the Log Meal page |

## What we looked at but deliberately did NOT copy (out of scope for a hackathon)

- **Photo-based food recognition** (HealthifyMe's Snap) — needs a trained vision model and a large labelled dataset; explicitly a "future roadmap" item, not something to fake for a demo.
- **Camera + smart-scale hardware** (Leanpath/Winnow's core product) — solves the same problem we solve in software, at a hardware cost no student hackathon team should try to match. Our bet is that manual tap-logging is "good enough" data at zero hardware cost, which is a genuinely different (not worse) approach for our context, not a lesser version of theirs.
- **Full gamification systems** (leaderboards, points, redeemable rewards) — noted in `IDEA.md` as future roadmap; the one-line streak badge is the only piece that made it into the current build.

## The pitch-ready differentiation line

"HealthifyMe tracks what *you* eat. Leanpath tracks what a *kitchen* wastes. Nobody connects the two for a hostel mess — that's the gap ThaliMetrics sits in."
