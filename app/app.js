/**
 * app.js  (v2)
 * ------------------------------------------------------------
 * ThaliMetrics logic. Still plain JS, no framework, no build step.
 *
 * DATA MODEL
 * ----------
 * Today's menu (admin-set):      localStorage "thalimetrics_menu"
 *   -> array of dish objects (copied from DISH_LIBRARY or custom)
 *
 * Active (in-progress) meal:     localStorage "thalimetrics_activeMeal"
 *   -> { date, mealSlot, entries: { [dishId]: { takenUnits, wasteUnits } } }
 *   "units" = whole servings, e.g. 1.75 bowls. A student can add to
 *   takenUnits multiple times (second helpings) before finishing the
 *   meal; wasteUnits is set once, during the "leaving" session, on a
 *   scale from 0 to that dish's own takenUnits (never 0-100% generic).
 *
 * Finished meal history:         localStorage "thalimetrics_logs"
 *   -> array of { date, mealSlot, dishId, takenUnits, wasteUnits }
 *   One entry is written per dish when "Finish meal & log it" is
 *   pressed; the active meal is then cleared.
 * ------------------------------------------------------------
 */

const MENU_KEY = "thalimetrics_menu";
const ACTIVE_MEAL_KEY = "thalimetrics_activeMeal";
const LOGS_KEY = "thalimetrics_logs";

const DISH_LIBRARY = window.THALIMETRICS_DISH_LIBRARY;
const RDA_TABLE = window.THALIMETRICS_RDA_TABLE;
const NUTRIENT_META = window.THALIMETRICS_NUTRIENT_META;
const LOCAL_SWAPS = window.THALIMETRICS_LOCAL_SWAPS;

// in-memory scratch state for whatever the student is currently
// dialing in on the "taking food" card, BEFORE they hit "Add".
// keyed by dishId -> { whole: int, partial: 0..1 }
let takeScratch = {};

// ---------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getMenu() {
  return loadJSON(MENU_KEY, []);
}
function setMenu(menu) {
  saveJSON(MENU_KEY, menu);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getActiveMeal() {
  const meal = loadJSON(ACTIVE_MEAL_KEY, null);
  const slot = document.getElementById("meal-slot-select").value;
  const date = todayStr();
  // start a fresh active meal if none exists yet, or if the date/slot changed
  if (!meal || meal.date !== date || meal.mealSlot !== slot) {
    const fresh = { date, mealSlot: slot, entries: {} };
    saveJSON(ACTIVE_MEAL_KEY, fresh);
    return fresh;
  }
  return meal;
}
function saveActiveMeal(meal) {
  saveJSON(ACTIVE_MEAL_KEY, meal);
}
function clearActiveMeal() {
  localStorage.removeItem(ACTIVE_MEAL_KEY);
}

function getLogs() {
  return loadJSON(LOGS_KEY, []);
}
function appendLogs(entries) {
  const logs = getLogs();
  logs.push(...entries);
  saveJSON(LOGS_KEY, logs);
}

// ---------------------------------------------------------------
// Seed a default menu the first time the app ever runs, so the
// Log Meal tab isn't empty before any admin has touched it.
// ---------------------------------------------------------------
function ensureDefaultMenu() {
  const menu = getMenu();
  if (menu.length === 0) {
    const defaults = ["dal", "sambar", "poriyal", "rice", "roti", "curd"];
    setMenu(DISH_LIBRARY.filter(d => defaults.includes(d.id)));
  }
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

    if (btn.dataset.tab === "menu") renderAdminMenu();
    if (btn.dataset.tab === "dashboard") renderDashboard();
    if (btn.dataset.tab === "digest") renderDigest();
    if (btn.dataset.tab === "log") renderLogTab();
  });
});

// session sub-toggle (taking vs leaving)
document.querySelectorAll(".session-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".session-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".session-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("session-" + btn.dataset.session).classList.add("active");
    if (btn.dataset.session === "leaving") renderWasteList();
  });
});

document.getElementById("meal-slot-select").addEventListener("change", renderLogTab);

// ---------------------------------------------------------------
// Reusable vessel (bowl/glass) fill-slider control.
// Renders a small graphic with a coloured fill div driven by a
// (visually hidden but functional) native range input, so the
// colour always renders consistently regardless of the browser's
// native range-input theming support.
// ---------------------------------------------------------------
function createVesselControl({ shape, min, max, step, value, fillClass, onChange }) {
  const wrap = document.createElement("div");
  wrap.className = "vessel-col";

  const vessel = document.createElement("div");
  vessel.className = "vessel";

  const shapeDiv = document.createElement("div");
  shapeDiv.className = "vessel-shape " + shape;

  const fillDiv = document.createElement("div");
  fillDiv.className = "vessel-fill" + (fillClass ? " " + fillClass : "");

  const range = document.createElement("input");
  range.type = "range";
  range.className = "vessel-range";
  range.min = min;
  range.max = max;
  range.step = step;
  range.value = value;

  function updateFill() {
    const pct = max > min ? ((parseFloat(range.value) - min) / (max - min)) * 100 : 0;
    fillDiv.style.height = pct + "%";
  }
  updateFill();

  range.addEventListener("input", () => {
    updateFill();
    onChange(parseFloat(range.value));
  });

  shapeDiv.appendChild(fillDiv);
  vessel.appendChild(shapeDiv);
  vessel.appendChild(range);
  wrap.appendChild(vessel);

  wrap.__range = range; // expose for programmatic updates (e.g. clamping max)
  wrap.__updateFill = updateFill;
  return wrap;
}

// ---------------------------------------------------------------
// LOG MEAL TAB — "taking food" session
// ---------------------------------------------------------------
function renderLogTab() {
  getActiveMeal(); // ensures a fresh active meal exists for today/slot
  renderTakeList();
  renderWasteList();
  renderMealSummary();
}

function renderTakeList() {
  const menu = getMenu();
  const container = document.getElementById("take-dish-list");
  container.innerHTML = "";

  if (menu.length === 0) {
    container.innerHTML = `<p class="hint">No dishes set for today yet — ask the mess admin to add some in the "Mess Menu" tab.</p>`;
    return;
  }

  menu.forEach(dish => {
    takeScratch[dish.id] = takeScratch[dish.id] || { whole: 0, partial: 0 };

    const card = document.createElement("div");
    card.className = "dish-card";
    card.innerHTML = `<h4>${dish.name}</h4>`;

    const body = document.createElement("div");
    body.className = "take-card-body";

    if (dish.visual === "fruit") {
      // whole units only, no partial control — fractional fruit isn't meaningful
      body.appendChild(buildStepper(dish.id, 0, 6));
    } else if (dish.visual === "roti") {
      // whole-roti stepper + quarter-tap grid for the current partial roti
      const stepperCol = buildStepper(dish.id, 0, 6);
      const quarterCol = buildQuarterGrid(dish.id);
      body.appendChild(stepperCol);
      body.appendChild(quarterCol);
    } else {
      // bowl / glass — whole-unit stepper + vessel slider for the partial unit
      const stepperCol = buildStepper(dish.id, 0, 6);
      const vesselShape = dish.visual === "glass" ? "glass" : "bowl";
      const vesselCol = createVesselControl({
        shape: vesselShape, min: 0, max: 1, step: 0.25,
        value: takeScratch[dish.id].partial,
        onChange: (v) => { takeScratch[dish.id].partial = v; }
      });
      const label = document.createElement("div");
      label.className = "vessel-label";
      label.textContent = "+ partial";
      vesselCol.appendChild(label);
      body.appendChild(stepperCol);
      body.appendChild(vesselCol);
    }

    card.appendChild(body);

    const addBtn = document.createElement("button");
    addBtn.className = "add-serving-btn";
    addBtn.textContent = "Add this to my meal";
    addBtn.addEventListener("click", () => addServing(dish.id));
    card.appendChild(addBtn);

    container.appendChild(card);
  });
}

function buildStepper(dishId, min, max) {
  const col = document.createElement("div");
  col.className = "stepper-row";

  const minus = document.createElement("button");
  minus.className = "stepper-btn";
  minus.textContent = "−";

  const valueSpan = document.createElement("span");
  valueSpan.className = "stepper-value";
  valueSpan.textContent = takeScratch[dishId].whole + " whole";

  const plus = document.createElement("button");
  plus.className = "stepper-btn";
  plus.textContent = "+";

  minus.addEventListener("click", () => {
    takeScratch[dishId].whole = Math.max(min, takeScratch[dishId].whole - 1);
    valueSpan.textContent = takeScratch[dishId].whole + " whole";
  });
  plus.addEventListener("click", () => {
    takeScratch[dishId].whole = Math.min(max, takeScratch[dishId].whole + 1);
    valueSpan.textContent = takeScratch[dishId].whole + " whole";
  });

  col.appendChild(minus);
  col.appendChild(valueSpan);
  col.appendChild(plus);
  return col;
}

function buildQuarterGrid(dishId) {
  const col = document.createElement("div");
  col.className = "vessel-col";

  const row = document.createElement("div");
  row.className = "quarter-row";

  for (let i = 1; i <= 4; i++) {
    const btn = document.createElement("button");
    btn.className = "quarter-btn";
    btn.textContent = "¼";
    btn.dataset.q = i;
    btn.addEventListener("click", () => {
      const current = Math.round(takeScratch[dishId].partial * 4);
      const newVal = current === i ? i - 1 : i;
      takeScratch[dishId].partial = newVal / 4;
      refreshQuarterGrid(row, takeScratch[dishId].partial);
    });
    row.appendChild(btn);
  }

  const label = document.createElement("div");
  label.className = "vessel-label";
  label.textContent = "+ partial roti";

  col.appendChild(row);
  col.appendChild(label);
  refreshQuarterGrid(row, takeScratch[dishId].partial);
  return col;
}

function refreshQuarterGrid(row, partialValue) {
  const filledCount = Math.round(partialValue * 4);
  row.querySelectorAll(".quarter-btn").forEach(b => {
    b.classList.toggle("filled", parseInt(b.dataset.q, 10) <= filledCount);
  });
}

function addServing(dishId) {
  const scratch = takeScratch[dishId];
  const amount = scratch.whole + scratch.partial;
  if (amount <= 0) return;

  const meal = getActiveMeal();
  if (!meal.entries[dishId]) meal.entries[dishId] = { takenUnits: 0, wasteUnits: 0 };
  meal.entries[dishId].takenUnits += amount;
  saveActiveMeal(meal);

  // reset scratch for that dish and re-render
  takeScratch[dishId] = { whole: 0, partial: 0 };
  renderTakeList();
  renderMealSummary();
}

// ---------------------------------------------------------------
// LOG MEAL TAB — "leaving mess" session (waste logging)
// ---------------------------------------------------------------
function renderWasteList() {
  const meal = getActiveMeal();
  const menu = getMenu();
  const container = document.getElementById("waste-dish-list");
  container.innerHTML = "";

  const dishIdsWithFood = Object.keys(meal.entries).filter(id => meal.entries[id].takenUnits > 0);

  if (dishIdsWithFood.length === 0) {
    container.innerHTML = `<p class="hint">You haven't logged taking anything yet this meal — switch to "I'm taking food" first.</p>`;
    return;
  }

  dishIdsWithFood.forEach(dishId => {
    const dish = menu.find(d => d.id === dishId) || DISH_LIBRARY.find(d => d.id === dishId);
    const entry = meal.entries[dishId];

    const card = document.createElement("div");
    card.className = "dish-card";
    card.innerHTML = `<h4>${dish.name} — you took ${entry.takenUnits.toFixed(2)} ${unitWord(dish)}</h4>`;

    const body = document.createElement("div");
    body.className = "take-card-body";

    const vesselShape = dish.visual === "glass" ? "glass" : "bowl";
    const vesselCol = createVesselControl({
      shape: vesselShape, min: 0, max: entry.takenUnits, step: 0.25,
      value: entry.wasteUnits,
      fillClass: "waste-fill",
      onChange: (v) => {
        entry.wasteUnits = v;
        saveActiveMeal(meal);
        readout.textContent = `Wasting ${v.toFixed(2)} of ${entry.takenUnits.toFixed(2)}`;
      }
    });

    const readout = document.createElement("div");
    readout.className = "vessel-label";
    readout.textContent = `Wasting ${entry.wasteUnits.toFixed(2)} of ${entry.takenUnits.toFixed(2)}`;
    vesselCol.appendChild(readout);

    body.appendChild(vesselCol);
    card.appendChild(body);
    container.appendChild(card);
  });
}

function unitWord(dish) {
  if (dish.visual === "glass") return "glass(es)";
  if (dish.visual === "roti") return "roti(s)";
  if (dish.visual === "fruit") return "piece(s)";
  return "bowl(s)";
}

document.getElementById("finish-meal-btn").addEventListener("click", () => {
  const meal = getActiveMeal();
  const entries = Object.keys(meal.entries)
    .filter(id => meal.entries[id].takenUnits > 0)
    .map(id => ({
      date: meal.date,
      mealSlot: meal.mealSlot,
      dishId: id,
      takenUnits: meal.entries[id].takenUnits,
      wasteUnits: meal.entries[id].wasteUnits
    }));

  const msg = document.getElementById("log-confirm");
  if (entries.length === 0) {
    msg.textContent = "Nothing to log yet — add food in the 'taking food' tab first.";
    return;
  }

  appendLogs(entries);
  clearActiveMeal();
  msg.textContent = "Meal logged! Check the Mess Dashboard and Weekly Digest tabs to see it reflected.";
  renderLogTab();
});

function renderMealSummary() {
  const meal = getActiveMeal();
  const menu = getMenu();
  const box = document.getElementById("current-meal-summary");
  const ids = Object.keys(meal.entries).filter(id => meal.entries[id].takenUnits > 0);

  if (ids.length === 0) {
    box.innerHTML = "";
    return;
  }

  let html = `<strong>Your ${meal.mealSlot} so far:</strong>`;
  ids.forEach(id => {
    const dish = menu.find(d => d.id === id) || DISH_LIBRARY.find(d => d.id === id);
    const e = meal.entries[id];
    html += `<div class="meal-summary-item"><span>${dish.name}</span><span>${e.takenUnits.toFixed(2)} taken</span></div>`;
  });
  box.innerHTML = html;
}

// ---------------------------------------------------------------
// MESS MENU ADMIN TAB
// ---------------------------------------------------------------
function renderAdminMenu() {
  const select = document.getElementById("admin-dish-select");
  const menu = getMenu();
  const menuIds = menu.map(d => d.id);

  select.innerHTML = "";
  DISH_LIBRARY.filter(d => !menuIds.includes(d.id)).forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.name;
    select.appendChild(opt);
  });

  const list = document.getElementById("admin-menu-list");
  list.innerHTML = "";
  if (menu.length === 0) {
    list.innerHTML = `<p class="hint">No dishes on today's menu yet.</p>`;
    return;
  }
  menu.forEach(dish => {
    const row = document.createElement("div");
    row.className = "admin-menu-item";
    row.innerHTML = `<span>${dish.name} <span class="hint">(${dish.category})</span></span>`;
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-dish-btn";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      setMenu(getMenu().filter(d => d.id !== dish.id));
      renderAdminMenu();
    });
    row.appendChild(removeBtn);
    list.appendChild(row);
  });
}

document.getElementById("admin-add-btn").addEventListener("click", () => {
  const select = document.getElementById("admin-dish-select");
  const dishId = select.value;
  if (!dishId) return;
  const dish = DISH_LIBRARY.find(d => d.id === dishId);
  const menu = getMenu();
  if (!menu.find(d => d.id === dishId)) {
    menu.push(dish);
    setMenu(menu);
  }
  renderAdminMenu();
});

// ---------------------------------------------------------------
// MESS DASHBOARD TAB
// ---------------------------------------------------------------
let currentRange = "day";

document.querySelectorAll(".range-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".range-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentRange = btn.dataset.range;
    renderDashboard();
  });
});

function logsInRange(range) {
  const logs = getLogs();
  const now = new Date();
  let cutoff = new Date();
  if (range === "day") {
    cutoff.setHours(0, 0, 0, 0);
  } else if (range === "week") {
    cutoff.setDate(now.getDate() - 7);
  } else {
    cutoff.setDate(now.getDate() - 30);
  }
  return logs.filter(l => new Date(l.date) >= cutoff);
}

function renderDashboard() {
  const logs = logsInRange(currentRange);
  const chart = document.getElementById("dashboard-chart");
  const swapBox = document.getElementById("swap-suggestions");
  const breakdown = document.getElementById("daily-breakdown");
  chart.innerHTML = "";
  swapBox.innerHTML = "";
  breakdown.innerHTML = "";

  if (logs.length === 0) {
    chart.innerHTML = `<p class="hint">No meals logged in this range yet.</p>`;
    return;
  }

  // aggregate taken/wasted per dish across the selected range
  const totals = {};
  logs.forEach(entry => {
    if (!totals[entry.dishId]) totals[entry.dishId] = { taken: 0, wasted: 0 };
    totals[entry.dishId].taken += entry.takenUnits;
    totals[entry.dishId].wasted += entry.wasteUnits;
  });

  const rows = Object.keys(totals).map(dishId => {
    const dish = DISH_LIBRARY.find(d => d.id === dishId);
    const { taken, wasted } = totals[dishId];
    const pct = taken > 0 ? Math.round((wasted / taken) * 100) : 0;
    return { dish, pct, taken, wasted };
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

  const worst = rows[0];
  if (worst && worst.pct >= 25) {
    const swapText = LOCAL_SWAPS[worst.dish.category] || "Consider a smaller default serving size for this dish.";
    swapBox.innerHTML = `
      <p><strong>${worst.dish.name}</strong> is running at ${worst.pct}% waste — the highest in this range.</p>
      <p>${swapText}</p>
      <p class="hint">Per FSSAI Eat Right Campus guidance on food waste management and promotion of local/seasonal food.</p>
    `;
  }

  // daily categorized breakdown — group logs by date, then by dish
  const byDate = {};
  logs.forEach(entry => {
    if (!byDate[entry.date]) byDate[entry.date] = {};
    if (!byDate[entry.date][entry.dishId]) byDate[entry.date][entry.dishId] = { taken: 0, wasted: 0 };
    byDate[entry.date][entry.dishId].taken += entry.takenUnits;
    byDate[entry.date][entry.dishId].wasted += entry.wasteUnits;
  });

  Object.keys(byDate).sort().reverse().forEach(date => {
    const group = document.createElement("div");
    group.className = "day-group";
    const header = document.createElement("div");
    header.className = "day-group-header";
    header.textContent = date;
    group.appendChild(header);

    Object.keys(byDate[date]).forEach(dishId => {
      const dish = DISH_LIBRARY.find(d => d.id === dishId);
      const d = byDate[date][dishId];
      const row = document.createElement("div");
      row.className = "day-group-row";
      row.innerHTML = `<span>${dish.name}</span><span>${d.wasted.toFixed(2)} wasted of ${d.taken.toFixed(2)}</span>`;
      group.appendChild(row);
    });

    breakdown.appendChild(group);
  });
}

// ---------------------------------------------------------------
// WEEKLY DIGEST TAB — full micronutrient panel, gender-segmented
// ---------------------------------------------------------------
function renderDigest() {
  const logs = getLogs();
  const weight = parseFloat(document.getElementById("weight-input").value) || 60;
  const gender = document.getElementById("gender-select").value;
  const rda = RDA_TABLE[gender];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const weekLogs = logs.filter(l => new Date(l.date) >= cutoff);

  // sum consumed (taken - wasted) nutrients across the week
  const consumed = {};
  NUTRIENT_META.forEach(n => { consumed[n.key] = 0; });

  weekLogs.forEach(entry => {
    const dish = DISH_LIBRARY.find(d => d.id === entry.dishId);
    if (!dish) return;
    const eatenUnits = Math.max(0, entry.takenUnits - entry.wasteUnits);
    NUTRIENT_META.forEach(n => {
      consumed[n.key] += (dish.nutrients[n.key] || 0) * eatenUnits;
    });
  });

  const summary = document.getElementById("digest-summary");
  summary.innerHTML = "";

  NUTRIENT_META.forEach(n => {
    let target;
    if (n.key === "protein_g") {
      target = weight * rda.protein_g_per_kg * 7;
    } else {
      target = (rda[n.key] || 0) * 7;
    }
    const note = n.key === "protein_g"
      ? "ICMR-NIN reference: 0.83 g per kg body weight per day."
      : `ICMR-NIN 2020 reference intake for adults, ${gender === "male" ? "men" : "women"}.`;
    summary.appendChild(buildNutrientCard(n.label, consumed[n.key], target, n.unit, note));
  });

  if (weekLogs.length === 0) {
    summary.innerHTML += `<p class="hint">No meals logged in the last 7 days yet — log a few meals to see this fill in.</p>`;
  }
}

function buildNutrientCard(label, consumedVal, target, unit, note) {
  const pct = target > 0 ? Math.min(100, Math.round((consumedVal / target) * 100)) : 0;
  const low = pct < 70;

  const card = document.createElement("div");
  card.className = "nutrient-card";
  card.innerHTML = `
    <h4>${label}: ${consumedVal.toFixed(1)}${unit} of ${target.toFixed(0)}${unit} target (${pct}%)</h4>
    <div class="progress-track"><div class="progress-fill ${low ? "low" : ""}" style="width:${pct}%"></div></div>
    <p class="nutrient-note">${note}${low ? " — tracking below target this week." : ""}</p>
  `;
  return card;
}

// ---------------------------------------------------------------
// Boot
// ---------------------------------------------------------------
ensureDefaultMenu();
renderLogTab();
document.getElementById("weight-input").addEventListener("change", renderDigest);
document.getElementById("gender-select").addEventListener("change", renderDigest);
