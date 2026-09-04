/**
 * app.js
 * ------------------------------------------------------------
 * ThaliMetrics MVP logic. No frameworks, no build step — this is
 * intentional so any teammate can open index.html directly (or
 * via GitHub Pages / Live Server) and see it work immediately.
 *
 * Data model per logged meal entry:
 * {
 *   date: "2026-09-04",
 *   dishId: "dal",
 *   takenQuarters: 0-4,   // how much of a full portion was taken
 *   wastedQuarters: 0-4   // how much of what was taken was wasted
 * }
 *
 * Stored in localStorage under "thalimetrics_logs" as a JSON array.
 * Swap this for a real backend/DB once the team has one running —
 * search for STORAGE_KEY below, that's the one place to change.
 * ------------------------------------------------------------
 */

const STORAGE_KEY = "thalimetrics_logs";
const DISHES = window.THALIMETRICS_DISHES;
const TARGETS = window.THALIMETRICS_TARGETS;

// in-memory state for the CURRENT (not-yet-logged) meal being built
let currentEntry = {}; // dishId -> { taken: 0-4, wasted: 0-4 }

// ---------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------
function getLogs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveLog(entry) {
  const logs = getLogs();
  logs.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");

    if (btn.dataset.tab === "dashboard") renderDashboard();
    if (btn.dataset.tab === "digest") renderDigest();
  });
});

// ---------------------------------------------------------------
// LOG MEAL TAB — render dish cards
// ---------------------------------------------------------------
function renderDishList() {
  const container = document.getElementById("dish-list");
  container.innerHTML = "";

  DISHES.forEach(dish => {
    currentEntry[dish.id] = { taken: 0, wasted: 0 };

    const card = document.createElement("div");
    card.className = "dish-card";

    if (dish.type === "bowl") {
      card.innerHTML = `
        <h3>${dish.name}</h3>
        <div class="slider-row">
          <label>How much did you take? (<span id="${dish.id}-taken-label">0/4</span> bowl)</label>
          <input type="range" min="0" max="4" step="1" value="0" id="${dish.id}-taken" />
        </div>
        <div class="slider-row">
          <label>How much are you leaving? (<span id="${dish.id}-wasted-label">0/4</span> bowl)</label>
          <input type="range" min="0" max="4" step="1" value="0" id="${dish.id}-wasted" />
        </div>
      `;
    } else {
      // "flat" type: quarter-tap grid for roti/paratha
      card.innerHTML = `
        <h3>${dish.name}</h3>
        <span class="qlabel">Taken (tap quarters):</span>
        <div class="quarter-row" id="${dish.id}-taken-row">
          ${[1,2,3,4].map(i => `<button class="quarter-btn" data-dish="${dish.id}" data-kind="taken" data-q="${i}">¼</button>`).join("")}
        </div>
        <span class="qlabel">Wasted (tap quarters):</span>
        <div class="quarter-row" id="${dish.id}-wasted-row">
          ${[1,2,3,4].map(i => `<button class="quarter-btn" data-dish="${dish.id}" data-kind="wasted" data-q="${i}">¼</button>`).join("")}
        </div>
      `;
    }

    container.appendChild(card);
  });

  // wire up bowl sliders
  DISHES.filter(d => d.type === "bowl").forEach(dish => {
    const takenSlider = document.getElementById(`${dish.id}-taken`);
    const wastedSlider = document.getElementById(`${dish.id}-wasted`);

    takenSlider.addEventListener("input", () => {
      currentEntry[dish.id].taken = parseInt(takenSlider.value, 10);
      document.getElementById(`${dish.id}-taken-label`).textContent = `${takenSlider.value}/4`;
      // wasted can't exceed taken
      if (parseInt(wastedSlider.value, 10) > currentEntry[dish.id].taken) {
        wastedSlider.value = currentEntry[dish.id].taken;
        currentEntry[dish.id].wasted = currentEntry[dish.id].taken;
        document.getElementById(`${dish.id}-wasted-label`).textContent = `${wastedSlider.value}/4`;
      }
      wastedSlider.max = currentEntry[dish.id].taken;
    });

    wastedSlider.addEventListener("input", () => {
      currentEntry[dish.id].wasted = parseInt(wastedSlider.value, 10);
      document.getElementById(`${dish.id}-wasted-label`).textContent = `${wastedSlider.value}/4`;
    });
  });

  // wire up quarter-tap buttons (flat dishes)
  container.querySelectorAll(".quarter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const dishId = btn.dataset.dish;
      const kind = btn.dataset.kind; // "taken" or "wasted"
      const q = parseInt(btn.dataset.q, 10);

      // tapping quarter N sets the count to N (tap the same one again to reset to N-1)
      const current = currentEntry[dishId][kind];
      const newVal = current === q ? q - 1 : q;
      currentEntry[dishId][kind] = kind === "wasted"
        ? Math.min(newVal, currentEntry[dishId].taken) // wasted can't exceed taken
        : newVal;

      // if taken just got reduced below wasted, pull wasted down too
      if (kind === "taken" && currentEntry[dishId].wasted > currentEntry[dishId].taken) {
        currentEntry[dishId].wasted = currentEntry[dishId].taken;
      }

      refreshQuarterButtons(dishId);
    });
  });
}

function refreshQuarterButtons(dishId) {
  const takenVal = currentEntry[dishId].taken;
  const wastedVal = currentEntry[dishId].wasted;

  document.querySelectorAll(`#${dishId}-taken-row .quarter-btn`).forEach(b => {
    b.classList.toggle("filled-taken", parseInt(b.dataset.q, 10) <= takenVal);
  });
  document.querySelectorAll(`#${dishId}-wasted-row .quarter-btn`).forEach(b => {
    b.classList.toggle("filled-wasted", parseInt(b.dataset.q, 10) <= wastedVal);
  });
}

document.getElementById("log-meal-btn").addEventListener("click", () => {
  const date = todayStr();
  let loggedAny = false;

  DISHES.forEach(dish => {
    const { taken, wasted } = currentEntry[dish.id];
    if (taken > 0) {
      saveLog({ date, dishId: dish.id, takenQuarters: taken, wastedQuarters: wasted });
      loggedAny = true;
    }
  });

  const msg = document.getElementById("log-confirm");
  msg.textContent = loggedAny
    ? "Logged! Thanks — check the Weekly Digest tab to see your running nutrient picture."
    : "Nothing logged — move a slider or tap a quarter to record what you took.";

  if (loggedAny) renderDishList(); // reset the form
});

// ---------------------------------------------------------------
// MESS DASHBOARD TAB
// ---------------------------------------------------------------
function renderDashboard() {
  const logs = getLogs();
  const chart = document.getElementById("dashboard-chart");
  const swapBox = document.getElementById("swap-suggestions");
  chart.innerHTML = "";
  swapBox.innerHTML = "";

  if (logs.length === 0) {
    chart.innerHTML = `<p class="hint">No meals logged yet — log a meal in the "Log My Meal" tab first (or plug in real mess data here).</p>`;
    return;
  }

  // aggregate taken/wasted quarters per dish across all logs
  const totals = {}; // dishId -> { taken: n, wasted: n }
  logs.forEach(entry => {
    if (!totals[entry.dishId]) totals[entry.dishId] = { taken: 0, wasted: 0 };
    totals[entry.dishId].taken += entry.takenQuarters;
    totals[entry.dishId].wasted += entry.wastedQuarters;
  });

  // sort dishes by waste % descending, so the worst offender is on top
  const rows = Object.keys(totals).map(dishId => {
    const dish = DISHES.find(d => d.id === dishId);
    const { taken, wasted } = totals[dishId];
    const pct = taken > 0 ? Math.round((wasted / taken) * 100) : 0;
    return { dish, pct };
  }).sort((a, b) => b.pct - a.pct);

  rows.forEach(row => {
    const barRow = document.createElement("div");
    barRow.className = "bar-row";
    barRow.innerHTML = `
      <div class="bar-label">${row.dish.name}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${row.pct}%"></div></div>
      <div class="bar-pct">${row.pct}%</div>
    `;
    chart.appendChild(barRow);
  });

  // flag the single highest-waste dish with a swap suggestion, if one exists
  const worst = rows[0];
  if (worst && worst.pct >= 30) {
    swapBox.innerHTML = `
      <p><strong>${worst.dish.name}</strong> is running at ${worst.pct}% waste — the highest this week.</p>
      <p>${worst.dish.swapSuggestion || "Consider a smaller default serving size for this dish, or check seasonal/local alternatives per FSSAI Eat Right Campus guidance."}</p>
    `;
  }
}

// ---------------------------------------------------------------
// WEEKLY DIGEST TAB
// ---------------------------------------------------------------
function renderDigest() {
  const logs = getLogs();
  const weightInput = document.getElementById("weight-input");
  const weight = parseFloat(weightInput.value) || TARGETS.weight_kg;

  const proteinTarget = weight * TARGETS.protein_g_per_kg * 7; // weekly target
  const ironTarget = TARGETS.iron_mg_target * 7;

  // only count entries from the last 7 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const weekLogs = logs.filter(l => new Date(l.date) >= cutoff);

  let proteinConsumed = 0;
  let ironConsumed = 0;

  weekLogs.forEach(entry => {
    const dish = DISHES.find(d => d.id === entry.dishId);
    const eatenQuarters = entry.takenQuarters - entry.wastedQuarters;
    const fraction = eatenQuarters / 4; // quarters out of a full portion
    proteinConsumed += dish.protein_g * fraction;
    ironConsumed += dish.iron_mg * fraction;
  });

  const summary = document.getElementById("digest-summary");
  summary.innerHTML = "";
  summary.appendChild(buildNutrientCard("Protein", proteinConsumed, proteinTarget, "g",
    "ICMR-NIN reference: 0.83 g per kg body weight per day."));
  summary.appendChild(buildNutrientCard("Iron", ironConsumed, ironTarget, "mg",
    "Demo target — a real version should vary this by age and sex per ICMR-NIN tables."));

  if (weekLogs.length === 0) {
    summary.innerHTML += `<p class="hint">No meals logged in the last 7 days yet — log a few meals to see this fill in.</p>`;
  }
}

function buildNutrientCard(label, consumed, target, unit, note) {
  const pct = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;
  const low = pct < 70;

  const card = document.createElement("div");
  card.className = "nutrient-card";
  card.innerHTML = `
    <h4>${label}: ${consumed.toFixed(1)}${unit} of ${target.toFixed(0)}${unit} target (${pct}%)</h4>
    <div class="progress-track"><div class="progress-fill ${low ? "low" : ""}" style="width:${pct}%"></div></div>
    <p class="nutrient-note">${note}${low ? " — you're tracking below target this week." : ""}</p>
  `;
  return card;
}

// ---------------------------------------------------------------
// Boot
// ---------------------------------------------------------------
renderDishList();
document.getElementById("weight-input").addEventListener("change", renderDigest);
