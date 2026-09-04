# Team Workflow — Using Claude During the Build

These are shorthand prompts the team can type into a Claude conversation during the hackathon. They only work well if `IDEA.md` and `DECISIONS.md` stay current — Claude is only as useful as those two files are accurate, so update them as you go, not after.

## 1. Quick reference — what each shorthand means

- **`/scope-check`** — "Given IDEA.md and where we are now, is this feature on the demo path? If not, say cut it. If yes, give the smallest version that works and a time estimate."
- **`/explain-mine`** — Paste a file. Claude explains it back in beginner language and generates 5 likely judge questions with answers. Run this on every file before the demo.
- **`/unstick`** — Paste an error. Response format: (1) what the error literally says, (2) most likely cause, (3) the one command to try, (4) if that fails, next thing. No essays.
- **`/git-help`** — Exact git commands for our situation, with a plain-English line per command and a "how to undo this" note.
- **`/ui-polish`** — Look at current HTML/CSS and give the 5 highest-impact visual fixes, ranked, each under 15 minutes.
- **`/demo-script`** — Generate the 90-second demo narration plus the exact click sequence, with a fallback line for anything that might break.
- **`/pitch`** — Turn IDEA.md + DECISIONS.md into a 5-slide outline: problem, why it matters, demo, how it works, what's next.

These aren't built-in Claude commands — they're just a shared shorthand for the team. Typing `/scope-check` won't do anything special on its own; type out the full instruction (or paste this file into the conversation) so Claude knows what you mean.

## 2. Prompting habits to teach the team

- **Paste the error, the command you ran, and the file — all three.** Beginners paste only the error and get generic answers.
- **Say what you already tried.** Prevents Claude looping you back through it.
- **Ask "explain this like I've done one semester of C"** whenever an answer goes over your head. Do not nod along; it costs you in Q&A.
- **One person owns the Claude conversation per subsystem.** Four people prompting on one thread produces four incompatible codebases.
- **Start each session with state:** "Hour 19. Login works, database saves. Next: the results page." Claude's advice quality jumps when it knows the clock.

## 3. Subsystem ownership (fill this in)

| Subsystem | Owner | Claude thread / notes |
|---|---|---|
| Log-meal UI (bowl slider + quarter tap) | | |
| Mess dashboard | | |
| Weekly digest / nutrient math | | |
| Pitch deck + demo script | | |

Fill this in as soon as the team splits up — it's what makes "one person owns the conversation per subsystem" actually happen instead of staying a good intention.
