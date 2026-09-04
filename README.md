# ThaliMetrics

**NutriHack · Nutrition Week 2026 · VIT Vellore**

One tap at the tray return tells you two things at once: what a student's diet is missing, and what the mess is over-cooking.

## What's in this repo

- **`/app`** — the working demo. Plain HTML/CSS/JS, no build step, no dependencies.
- **`IDEA.md`** — the one-page source of truth for what we're building and why.
- **`DECISIONS.md`** — running log of calls we've made and why.
- **`docs/TEAM_WORKFLOW.md`** — Claude prompts/habits for the build.
- **`docs/ThaliMetrics_Brief.pdf`** — problem/solution/features brief for the pitch.
- **`docs/RESEARCH_REFERENCE.pdf`** — FSSAI + ICMR-NIN sourcing notes.
- **`docs/COMPETITIVE_ANALYSIS.md`** — what we looked at (HealthifyMe, Leanpath, Winnow) and what we borrowed.

## Running the demo

```bash
cd app
python3 -m http.server 8000
# then open http://localhost:8000
```

## What's new in v3

1. **Log My Meal and Mess Menu are now one page.** An "Edit today's menu for this meal" toggle sits inline — no separate admin tab to hunt for.
2. **Menus are per meal-slot.** Breakfast, lunch, snacks, and dinner each have their own dish list, seeded from a representative VIT Vellore-style sample menu (see the sourcing note at the top of `mockData.js` — this is a realistic sample, not the literal official monthly menu, since that isn't published anywhere this app could pull from).
3. **Redesigned vessels.** Bowls are now wide and shallow instead of tall and narrow. Glasses taper narrower at the base for a more glass-like silhouette. Both show a live percentage label directly above the slider.
4. **Illustrated roti** — a textured circular illustration (radial gradient + subtle speckling), not a flat button grid, still with 4 tappable quarters. Idli and dosa reuse the same round/quarter control since they're also round, quarter-able items. **Not a real photograph** — see "Known simplifications" below for why.
5. **Live nutrient readout beside every dish's controls** — calories, protein, carbs, and fat prominently, plus a compact iron/calcium/vitamin A/vitamin C/folate/zinc/fiber line underneath, recalculating on every slider or stepper change. Always marked as approximate.
6. **Per-dish colour tinting** — each dish's vessel fill uses its own colour (from `mockData.js`), so bowls are visually distinct at a glance, not just by label.
7. **Waste logging mirrors taking exactly** — same whole-unit stepper + partial slider/quadrant pattern, but bounded so the total can never exceed what was actually taken for that dish (absolute, not relative — confirmed by test: taking 1.5 units caps the waste slider at 1.5, never 4).
8. **Optional "why" tag on waste** — Too much served / Didn't like taste / Not hungry / Ran out of time. Borrowed from how commercial kitchen waste-tracking tools (Leanpath) separate a portion-size problem from a recipe problem instead of guessing from raw percentages. See `docs/COMPETITIVE_ANALYSIS.md`.
9. **Mess Dashboard: top 3 wasted items per category**, ranked by wastage amount with an approximate nutrition-value-lost annotation alongside the existing single worst-offender swap suggestion.
10. **Meal-level catch-up tracking** — before a later meal, if today's protein/iron intake so far is behind the expected pace for that point in the day, a panel flags it with a rough suggestion for the next meal.
11. **Low-waste streak badge** — a small, cheap-to-compute engagement nudge counting consecutive recent meals under 15% waste.

## Known simplifications (be upfront about these with judges)

- **No real food photographs.** The roti/idli/dosa illustration and bowl/glass shapes are original CSS/SVG-style illustrations, not photos. We deliberately did not pull real photos from the web to use in the app — reproducing someone else's copyrighted food photography without a license is a real legal risk for a project going on GitHub Pages, not just a hackathon nicety. Swapping in properly licensed or team-taken photos is a clean v4 upgrade.
- The VIT Vellore sample menu is representative (built from public student write-ups describing the typical rotating structure), not the literal official monthly menu — mess admins should edit the in-app menu to match what's actually posted.
- Nutrient values are standard Indian food-composition estimates, not lab-measured for VIT's kitchen specifically.
- The catch-up tracking panel only covers protein and iron (not all 11 tracked nutrients) to stay readable — full detail is still in the Weekly Digest.
- Doctor/dietitian referral stays generic ("visit the campus health centre") — never a diagnosis or named supplement. Real safety line, not a scope-cut.

## What's new in v4

1. **Real bug fix**: the waste slider could previously be dragged to "full" even after taking only a partial portion (e.g., 3/4). Fixed properly — the slider's own range now shrinks to match what was actually taken, not just a clamped display number. Verified with the exact reported scenario.
2. **Real photo assets** — the roti control now uses an actual photo (team-generated, so no copyright concern), and the ThaliMetrics logo appears in the header and on the pitch deck.
3. **Glassmorphic visual redesign** — new sage/mint/cream palette, Manrope typeface, blurred glass cards, SVG progress rings on the Weekly Digest (replacing flat bars), a mobile bottom nav bar, and a subtle confirmation animation on logging a meal.
4. **Pitch deck** — `docs/ThaliMetrics_Pitch.pptx`, an 11-slide deck following the team's own template agenda, content-aligned to the actual NutriHack judging criteria (pulled from the organizer's own deck).

## Known simplifications carried into v4

- Applied the glassmorphic spec to the existing single-page structure rather than the ~9-file architecture the design spec described — same functionality, far less risk this late in the build. Explicitly permitted by the spec itself ("adjust the structure if a better architecture is appropriate").
- The Team Details slide in the pitch deck has placeholder `[fill in]` fields — team names weren't available to fill in automatically.

## Team workflow

See `docs/TEAM_WORKFLOW.md`.

