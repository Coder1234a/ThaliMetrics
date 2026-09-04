# ThaliMetrics

**NutriHack · Nutrition Week 2026 · VIT Vellore**

One tap at the tray return tells you two things at once: what a student's diet is missing, and what the mess is over-cooking.

## What's in this repo

- **`/app`** — the working demo. Plain HTML/CSS/JS, no build step, no dependencies. Open `app/index.html` in a browser (or serve it, see below) and it runs.
- **`IDEA.md`** — the one-page source of truth for what we're building and why. Read this before adding a feature.
- **`DECISIONS.md`** — running log of calls we've made and why, so we don't re-litigate them at 3 AM.
- **`docs/TEAM_WORKFLOW.md`** — the Claude prompts and habits we're using to build this fast without stepping on each other.

## Running the demo

No install needed for the basic version:

```bash
cd app
python3 -m http.server 8000
# then open http://localhost:8000 in a browser
```

Or just double-click `app/index.html` — it works standalone since there's no bundler.

## What the demo currently does

1. **Log My Meal** — log what you took and wasted per dish. Bowls use a slider (0–4 quarters of a portion); roti uses tap-able quarters. Saved to the browser's local storage for the demo (swap for a real backend later — see `STORAGE_KEY` in `app/app.js`).
2. **Mess Dashboard** — aggregates all logged meals into a per-dish waste percentage, flags the worst offender, and suggests a swap.
3. **Weekly Digest** — computes protein/iron intake over the last 7 days against ICMR-NIN reference intakes and shows the gap.

## Known simplifications (v1 → v2 list)

- Nutrient values in `app/data/mockData.js` are demo-accurate standard portion references, not lab-measured.
- Iron target is a flat demo number — a real version should vary by age/sex per ICMR-NIN tables.
- Dishes are hardcoded — a real version pulls from the day's actual mess menu.
- No backend yet — data lives in `localStorage` per browser, not shared across devices.
- Doctor/dietitian referral is intentionally generic ("visit the campus health centre") — the app never diagnoses or names supplements. Keep it that way; it's a genuine safety line, not a scope-cut we should walk back under time pressure.

## Team workflow

See `docs/TEAM_WORKFLOW.md` for the Claude Code slash-commands and prompting habits we're using during the build.
