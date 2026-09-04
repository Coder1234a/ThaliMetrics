/**
 * app.js  (v3)
 * ------------------------------------------------------------
 * Plain JS, no framework, no build step.
 *
 * STORAGE KEYS
 * ------------
 * thalimetrics_menuBySlot   { breakfast:[dishIds], lunch:[...], snacks:[...], dinner:[...] }
 * thalimetrics_activeMeal   { date, mealSlot, entries: { [dishId]: {takenUnits, wasteUnits, reason} } }
 * thalimetrics_logs         [ {date, mealSlot, dishId, takenUnits, wasteUnits, reason} ]
 * thalimetrics_profile      { weight, gender }  — shared by the digest tab and the catch-up panel
 * ------------------------------------------------------------
 */

const MENU_KEY = "thalimetrics_menuBySlot";
const ACTIVE_MEAL_KEY = "thalimetrics_activeMeal";
const LOGS_KEY = "thalimetrics_logs";
const PROFILE_KEY = "thalimetrics_profile";

const DISH_LIBRARY = window.THALIMETRICS_DISH_LIBRARY;
const SAMPLE_MENU_BY_SLOT = window.THALIMETRICS_SAMPLE_MENU_BY_SLOT;
const RDA_TABLE = window.THALIMETRICS_RDA_TABLE;
const NUTRIENT_META = window.THALIMETRICS_NUTRIENT_META;
const LOCAL_SWAPS = window.THALIMETRICS_LOCAL_SWAPS;
const WASTE_REASONS = window.THALIMETRICS_WASTE_REASONS;

const MEAL_SLOTS = ["breakfast", "lunch", "snacks", "dinner"];

// scratch state for whatever's being dialled in before "Add" is pressed
let takeScratch = {};   // dishId -> { whole, partial }
let wasteScratch = {};  // dishId -> { whole, partial, reason }

// ---------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------
function loadJSON(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch (e) { return fallback; }
}
function saveJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function findDish(id) { return DISH_LIBRARY.find(d => d.id === id); }

function getMenuBySlot() {
  let menu = loadJSON(MENU_KEY, null);
  if (!menu) {
    menu = JSON.parse(JSON.stringify(SAMPLE_MENU_BY_SLOT));
    saveJSON(MENU_KEY, menu);
  }
  return menu;
}
function setMenuForSlot(slot, dishIds) {
  const menu = getMenuBySlot();
  menu[slot] = dishIds;
  saveJSON(MENU_KEY, menu);
}

function currentSlot() { return document.getElementById("meal-slot-select").value; }

function getActiveMeal() {
  const meal = loadJSON(ACTIVE_MEAL_KEY, null);
  const slot = currentSlot();
  const date = todayStr();
  if (!meal || meal.date !== date || meal.mealSlot !== slot) {
    const fresh = { date, mealSlot: slot, entries: {} };
    saveJSON(ACTIVE_MEAL_KEY, fresh);
    return fresh;
  }
  return meal;
}
function saveActiveMeal(meal) { saveJSON(ACTIVE_MEAL_KEY, meal); }
function clearActiveMeal() { localStorage.removeItem(ACTIVE_MEAL_KEY); }

function getLogs() { return loadJSON(LOGS_KEY, []); }
function appendLogs(entries) { const logs = getLogs(); logs.push(...entries); saveJSON(LOGS_KEY, logs); }

function getProfile() { return loadJSON(PROFILE_KEY, { weight: 60, gender: "male" }); }
function saveProfile(p) { saveJSON(PROFILE_KEY, p); }

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
    if (btn.dataset.tab === "log") renderLogTab();
  });
});

document.querySelectorAll(".session-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".session-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".session-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("session-" + btn.dataset.session).classList.add("active");
    if (btn.dataset.session === "leaving") renderWasteList();
  });
});

document.getElementById("meal-slot-select").addEventListener("change", () => {
  renderLogTab();
  renderAdminPanel();
});

document.getElementById("menu-admin-toggle-btn").addEventListener("click", () => {
  const panel = document.getElementById("menu-admin-panel");
  panel.classList.toggle("open");
  if (panel.classList.contains("open")) renderAdminPanel();
});

// ---------------------------------------------------------------
// Reusable vessel (bowl/glass) fill-slider control, with a live
// percentage readout directly above it.
// ---------------------------------------------------------------
function createVesselControl({ shape, min, max, step, value, color, fillClass, onChange }) {
  const wrap = document.createElement("div");
  wrap.className = "controls-col";

  const pctLabel = document.createElement("div");
  pctLabel.className = "vessel-pct-label";

  const vessel = document.createElement("div");
  vessel.className = "vessel" + (shape === "glass" ? " glass" : "");

  const shapeDiv = document.createElement("div");
  shapeDiv.className = "vessel-shape " + shape;

  const fillDiv = document.createElement("div");
  fillDiv.className = "vessel-fill" + (fillClass ? " " + fillClass : "");
  fillDiv.style.background = color || "rgba(31,122,76,0.55)";

  const range = document.createElement("input");
  range.type = "range";
  range.min = min; range.max = max; range.step = step; range.value = value;
  range.className = "vessel-range";

  function updateFill() {
    const pct = max > min ? ((parseFloat(range.value) - min) / (max - min)) * 100 : 0;
    fillDiv.style.height = pct + "%";
    pctLabel.textContent = Math.round(pct) + "%";
  }
  updateFill();

  range.addEventListener("input", () => {
    updateFill();
    onChange(parseFloat(range.value));
  });

  shapeDiv.appendChild(fillDiv);
  vessel.appendChild(shapeDiv);
  vessel.appendChild(range);
  wrap.appendChild(pctLabel);
  wrap.appendChild(vessel);
  wrap.__range = range;
  return wrap;
}

// ---------------------------------------------------------------
// Reusable roti illustration with 4 tappable pie-slice quadrants.
// ---------------------------------------------------------------
function createRotiControl({ value, color, onChange }) {
  const wrap = document.createElement("div");
  wrap.className = "controls-col";

  const pctLabel = document.createElement("div");
  pctLabel.className = "vessel-pct-label";

  const illo = document.createElement("div");
  illo.className = "roti-illustration";

  let currentQuarters = Math.round(value * 4);

  const quads = ["q1", "q2", "q3", "q4"].map((cls, i) => {
    const btn = document.createElement("button");
    btn.className = "roti-quad-btn " + cls;
    btn.dataset.q = i + 1;
    btn.addEventListener("click", () => {
      const q = i + 1;
      currentQuarters = currentQuarters === q ? q - 1 : q;
      refresh();
      onChange(currentQuarters / 4);
    });
    illo.appendChild(btn);
    return btn;
  });

  function refresh() {
    quads.forEach(b => {
      const filled = parseInt(b.dataset.q, 10) <= currentQuarters;
      b.classList.toggle("eaten", filled);
      b.style.background = filled ? (color ? hexToRgba(color, 0.55) : "rgba(90,50,15,0.4)") : "transparent";
    });
    pctLabel.textContent = Math.round((currentQuarters / 4) * 100) + "%";
  }
  refresh();

  wrap.appendChild(pctLabel);
  wrap.appendChild(illo);
  return wrap;
}

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function buildStepper(value, min, max, onChange) {
  const col = document.createElement("div");
  col.className = "stepper-row";
  const minus = document.createElement("button");
  minus.className = "stepper-btn"; minus.textContent = "−";
  const valueSpan = document.createElement("span");
  valueSpan.className = "stepper-value";
  valueSpan.textContent = value + " whole";
  const plus = document.createElement("button");
  plus.className = "stepper-btn"; plus.textContent = "+";

  let current = value;
  minus.addEventListener("click", () => {
    current = Math.max(min, current - 1);
    valueSpan.textContent = current + " whole";
    onChange(current);
  });
  plus.addEventListener("click", () => {
    current = Math.min(max, current + 1);
    valueSpan.textContent = current + " whole";
    onChange(current);
  });
  col.appendChild(minus); col.appendChild(valueSpan); col.appendChild(plus);
  return col;
}

// ---------------------------------------------------------------
// Live nutrient readout — shown beside every vessel/roti control,
// recomputed on every stepper/slider change. Covers macros
// (protein/carbs/fat) prominently plus a compact micronutrient line.
// ---------------------------------------------------------------
function buildNutrientLivePanel(dish) {
  const panel = document.createElement("div");
  panel.className = "nutrient-live-panel";
  panel.innerHTML = renderNutrientPanelHTML(dish, 0);
  return panel;
}

function renderNutrientPanelHTML(dish, amount) {
  const n = dish.nutrients;
  const scale = (v) => (v * amount).toFixed(1);
  return `
    <div class="nutrient-live-macro">
      <span>${(n.calories * amount).toFixed(0)} kcal</span>
      <span>P: ${scale(n.protein_g)}g</span>
      <span>C: ${scale(n.carbs_g)}g</span>
      <span>F: ${scale(n.fats_g)}g</span>
    </div>
    <div class="nutrient-live-micro">
      Iron ${scale(n.iron_mg)}mg &middot; Calcium ${scale(n.calcium_mg)}mg &middot; Vit A ${scale(n.vitaminA_mcg)}mcg &middot; Vit C ${scale(n.vitaminC_mg)}mg &middot; Folate ${scale(n.folate_mcg)}mcg &middot; Zinc ${scale(n.zinc_mg)}mg &middot; Fiber ${scale(n.fiber_g)}g
    </div>
    <div class="nutrient-approx-note">*Approximate, scales with your current portion.</div>
  `;
}

// ---------------------------------------------------------------
// LOG MEAL TAB (merged with menu)
// ---------------------------------------------------------------
function renderLogTab() {
  getActiveMeal();
  renderStreakBadge();
  renderTakeList();
  renderWasteList();
  renderMealSummary();
  renderCatchupPanel();
}

function renderTakeList() {
  const slot = currentSlot();
  const menu = getMenuBySlot()[slot] || [];
  const container = document.getElementById("take-dish-list");
  container.innerHTML = "";

  if (menu.length === 0) {
    container.innerHTML = `<p class="hint">No dishes set for ${slot} yet — use "Edit today's menu" above to add some.</p>`;
    return;
  }

  menu.forEach(dishId => {
    const dish = findDish(dishId);
    if (!dish) return;
    takeScratch[dish.id] = takeScratch[dish.id] || { whole: 0, partial: 0 };

    const card = document.createElement("div");
    card.className = "dish-card";
    card.innerHTML = `<h4>${dish.name}</h4>`;

    const body = document.createElement("div");
    body.className = "take-card-body";

    const nutrientPanel = buildNutrientLivePanel(dish);
    function refreshNutrients() {
      const amount = takeScratch[dish.id].whole + takeScratch[dish.id].partial;
      nutrientPanel.innerHTML = renderNutrientPanelHTML(dish, amount);
    }

    if (dish.visual === "fruit") {
      body.appendChild(buildStepper(takeScratch[dish.id].whole, 0, 6, (v) => { takeScratch[dish.id].whole = v; refreshNutrients(); }));
    } else if (dish.visual === "roti") {
      const stepperCol = buildStepper(takeScratch[dish.id].whole, 0, 6, (v) => { takeScratch[dish.id].whole = v; refreshNutrients(); });
      const rotiCol = createRotiControl({
        value: takeScratch[dish.id].partial, color: dish.color,
        onChange: (v) => { takeScratch[dish.id].partial = v; refreshNutrients(); }
      });
      body.appendChild(stepperCol);
      body.appendChild(rotiCol);
    } else {
      const stepperCol = buildStepper(takeScratch[dish.id].whole, 0, 6, (v) => { takeScratch[dish.id].whole = v; refreshNutrients(); });
      const vesselCol = createVesselControl({
        shape: dish.visual === "glass" ? "glass" : "bowl", min: 0, max: 1, step: 0.25,
        value: takeScratch[dish.id].partial, color: hexToRgba(dish.color, 0.65),
        onChange: (v) => { takeScratch[dish.id].partial = v; refreshNutrients(); }
      });
      body.appendChild(stepperCol);
      body.appendChild(vesselCol);
    }

    body.appendChild(nutrientPanel);
    card.appendChild(body);

    const addBtn = document.createElement("button");
    addBtn.className = "add-serving-btn";
    addBtn.textContent = "Add this to my meal";
    addBtn.addEventListener("click", () => addServing(dish.id));
    card.appendChild(addBtn);

    container.appendChild(card);
  });
}

function addServing(dishId) {
  const scratch = takeScratch[dishId];
  const amount = scratch.whole + scratch.partial;
  if (amount <= 0) return;

  const meal = getActiveMeal();
  if (!meal.entries[dishId]) meal.entries[dishId] = { takenUnits: 0, wasteUnits: 0, reason: null };
  meal.entries[dishId].takenUnits += amount;
  saveActiveMeal(meal);

  takeScratch[dishId] = { whole: 0, partial: 0 };
  renderTakeList();
  renderMealSummary();
}

// ---------------------------------------------------------------
// LEAVING MESS session — mirrors the "taking" control exactly
// (whole-unit stepper + partial vessel/roti), but bounded so the
// total can never exceed what was actually taken for that dish.
// ---------------------------------------------------------------
function renderWasteList() {
  const meal = getActiveMeal();
  const container = document.getElementById("waste-dish-list");
  container.innerHTML = "";

  const dishIds = Object.keys(meal.entries).filter(id => meal.entries[id].takenUnits > 0);
  if (dishIds.length === 0) {
    container.innerHTML = `<p class="hint">You haven't logged taking anything yet this meal — switch to "I'm taking food" first.</p>`;
    return;
  }

  dishIds.forEach(dishId => {
    const dish = findDish(dishId);
    const entry = meal.entries[dishId];
    const takenUnits = entry.takenUnits;
    const maxWhole = Math.floor(takenUnits + 1e-9);
    const maxPartialAtFullWhole = +(takenUnits - maxWhole).toFixed(2); // remainder when whole is maxed

    wasteScratch[dishId] = wasteScratch[dishId] || { whole: 0, partial: 0, reason: entry.reason || null };

    const card = document.createElement("div");
    card.className = "dish-card";
    card.innerHTML = `<h4>${dish.name} — you took ${takenUnits.toFixed(2)} ${unitWord(dish)}</h4>`;

    const body = document.createElement("div");
    body.className = "take-card-body";

    const readout = document.createElement("div");
    readout.className = "vessel-label";
    function updateReadout() {
      const total = Math.min(takenUnits, wasteScratch[dishId].whole + wasteScratch[dishId].partial);
      readout.textContent = `Wasting ${total.toFixed(2)} of ${takenUnits.toFixed(2)}`;
      entry.wasteUnits = total;
      entry.reason = wasteScratch[dishId].reason;
      saveActiveMeal(meal);
    }

    // whole-unit stepper, capped at maxWhole (can't waste more whole units than were taken)
    const stepperCol = buildStepper(wasteScratch[dishId].whole, 0, maxWhole, (v) => {
      wasteScratch[dishId].whole = v;
      // if whole is now at the cap, partial can't exceed the remainder
      const partialCap = v >= maxWhole ? maxPartialAtFullWhole : 1;
      if (wasteScratch[dishId].partial > partialCap) wasteScratch[dishId].partial = partialCap;
      updateReadout();
    });
    body.appendChild(stepperCol);

    if (dish.visual === "roti") {
      const rotiCol = createRotiControl({
        value: wasteScratch[dishId].partial, color: dish.color,
        onChange: (v) => { wasteScratch[dishId].partial = v; updateReadout(); }
      });
      body.appendChild(rotiCol);
    } else if (dish.visual !== "fruit") {
      const vesselCol = createVesselControl({
        shape: dish.visual === "glass" ? "glass" : "bowl", min: 0, max: 1, step: 0.25,
        value: wasteScratch[dishId].partial, color: hexToRgba(dish.color, 0.65), fillClass: "waste-fill",
        onChange: (v) => { wasteScratch[dishId].partial = v; updateReadout(); }
      });
      body.appendChild(vesselCol);
    }

    body.appendChild(readout);
    card.appendChild(body);

    // optional "why" tag, borrowed from commercial kitchen waste-tracking practice
    const reasonRow = document.createElement("div");
    reasonRow.className = "reason-row";
    WASTE_REASONS.forEach(r => {
      const chip = document.createElement("button");
      chip.className = "reason-chip" + (wasteScratch[dishId].reason === r.id ? " selected" : "");
      chip.textContent = r.label;
      chip.addEventListener("click", () => {
        wasteScratch[dishId].reason = wasteScratch[dishId].reason === r.id ? null : r.id;
        entry.reason = wasteScratch[dishId].reason;
        saveActiveMeal(meal);
        reasonRow.querySelectorAll(".reason-chip").forEach(c => c.classList.remove("selected"));
        if (wasteScratch[dishId].reason === r.id) chip.classList.add("selected");
      });
      reasonRow.appendChild(chip);
    });
    card.appendChild(reasonRow);

    updateReadout();
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
      date: meal.date, mealSlot: meal.mealSlot, dishId: id,
      takenUnits: meal.entries[id].takenUnits,
      wasteUnits: meal.entries[id].wasteUnits,
      reason: meal.entries[id].reason || null
    }));

  const msg = document.getElementById("log-confirm");
  if (entries.length === 0) {
    msg.textContent = "Nothing to log yet — add food in the 'taking food' tab first.";
    return;
  }

  appendLogs(entries);
  clearActiveMeal();
  wasteScratch = {};
  msg.textContent = "Meal logged! Check the Mess Dashboard and Weekly Digest tabs to see it reflected.";
  renderLogTab();
});

function renderMealSummary() {
  const meal = getActiveMeal();
  const box = document.getElementById("current-meal-summary");
  const ids = Object.keys(meal.entries).filter(id => meal.entries[id].takenUnits > 0);
  if (ids.length === 0) { box.innerHTML = ""; return; }

  let html = `<strong>Your ${meal.mealSlot} so far:</strong>`;
  ids.forEach(id => {
    const dish = findDish(id);
    const e = meal.entries[id];
    html += `<div class="meal-summary-item"><span>${dish.name}</span><span>${e.takenUnits.toFixed(2)} taken</span></div>`;
  });
  box.innerHTML = html;
}

// ---------------------------------------------------------------
// Inline menu admin panel (edits the CURRENT meal slot's menu)
// ---------------------------------------------------------------
function renderAdminPanel() {
  const slot = currentSlot();
  const menuBySlot = getMenuBySlot();
  const currentIds = menuBySlot[slot] || [];

  const select = document.getElementById("admin-dish-select");
  select.innerHTML = "";
  DISH_LIBRARY.filter(d => !currentIds.includes(d.id)).forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.id; opt.textContent = d.name;
    select.appendChild(opt);
  });

  const list = document.getElementById("admin-menu-list");
  list.innerHTML = "";
  currentIds.forEach(id => {
    const dish = findDish(id);
    if (!dish) return;
    const chip = document.createElement("span");
    chip.className = "admin-menu-chip";
    chip.innerHTML = `${dish.name} `;
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-dish-btn";
    removeBtn.textContent = "✕";
    removeBtn.addEventListener("click", () => {
      setMenuForSlot(slot, currentIds.filter(i => i !== id));
      renderAdminPanel();
      renderTakeList();
    });
    chip.appendChild(removeBtn);
    list.appendChild(chip);
  });
}

document.getElementById("admin-add-btn").addEventListener("click", () => {
  const slot = currentSlot();
  const dishId = document.getElementById("admin-dish-select").value;
  if (!dishId) return;
  const menuBySlot = getMenuBySlot();
  const current = menuBySlot[slot] || [];
  if (!current.includes(dishId)) setMenuForSlot(slot, [...current, dishId]);
  renderAdminPanel();
  renderTakeList();
});

// ---------------------------------------------------------------
// Streak badge — consecutive most-recent FINISHED meals with waste
// under 15% (a lightweight, cheap-to-compute engagement nudge).
// ---------------------------------------------------------------
function renderStreakBadge() {
  const logs = getLogs();
  const wrap = document.getElementById("streak-badge-wrap");
  if (logs.length === 0) { wrap.innerHTML = ""; return; }

  const mealKeys = [...new Set(logs.map(l => l.date + "|" + l.mealSlot))].sort().reverse();
  let streak = 0;
  for (const key of mealKeys) {
    const mealLogs = logs.filter(l => (l.date + "|" + l.mealSlot) === key);
    const taken = mealLogs.reduce((s, l) => s + l.takenUnits, 0);
    const wasted = mealLogs.reduce((s, l) => s + l.wasteUnits, 0);
    const pct = taken > 0 ? (wasted / taken) * 100 : 0;
    if (pct < 15) streak++; else break;
  }

  wrap.innerHTML = streak > 0
    ? `<div class="streak-badge">🔥 ${streak} meal${streak > 1 ? "s" : ""} in a row with low waste</div>`
    : "";
}

// ---------------------------------------------------------------
// Catch-up tracking — if today's meals so far are behind the
// expected cumulative protein/iron target, flag it before the
// next meal.
// ---------------------------------------------------------------
function renderCatchupPanel() {
  const profile = getProfile();
  const rda = RDA_TABLE[profile.gender] || RDA_TABLE.male;
  const proteinDailyTarget = profile.weight * rda.protein_g_per_kg;
  const ironDailyTarget = rda.iron_mg;

  const slot = currentSlot();
  const slotIndex = MEAL_SLOTS.indexOf(slot);

  const today = todayStr();
  const logs = getLogs().filter(l => l.date === today);

  const priorSlots = MEAL_SLOTS.slice(0, slotIndex);
  const priorLogs = logs.filter(l => priorSlots.includes(l.mealSlot));

  let proteinSoFar = 0, ironSoFar = 0;
  priorLogs.forEach(l => {
    const dish = findDish(l.dishId);
    if (!dish) return;
    const eaten = Math.max(0, l.takenUnits - l.wasteUnits);
    proteinSoFar += dish.nutrients.protein_g * eaten;
    ironSoFar += dish.nutrients.iron_mg * eaten;
  });

  const box = document.getElementById("catchup-panel");

  if (priorSlots.length === 0) {
    box.innerHTML = "";
    return;
  }

  const expectedProteinSoFar = proteinDailyTarget * (priorSlots.length / MEAL_SLOTS.length);
  const expectedIronSoFar = ironDailyTarget * (priorSlots.length / MEAL_SLOTS.length);
  const proteinGap = expectedProteinSoFar - proteinSoFar;
  const ironGap = expectedIronSoFar - ironSoFar;

  const behind = proteinGap > 2 || ironGap > 1;

  if (!behind) {
    box.innerHTML = `<div class="catchup-box ontrack">You're on track on protein and iron heading into ${slot}. Nice.</div>`;
    return;
  }

  let msg = `<div class="catchup-box"><strong>Heads up before ${slot}:</strong>`;
  if (proteinGap > 2) msg += `<p>You're about ${proteinGap.toFixed(0)}g behind on protein for this point in the day — worth adding a protein-heavy item this meal.</p>`;
  if (ironGap > 1) msg += `<p>You're about ${ironGap.toFixed(1)}mg behind on iron — dal, keerai, or sambar can help close that.</p>`;
  msg += `<p class="hint" style="margin-top:6px;">Based on today's meals only, evenly split across ${MEAL_SLOTS.length} meal slots — a rough guide, not a precise deficit.</p></div>`;
  box.innerHTML = msg;
}

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
  if (range === "day") cutoff.setHours(0, 0, 0, 0);
  else if (range === "week") cutoff.setDate(now.getDate() - 7);
  else cutoff.setDate(now.getDate() - 30);
  return logs.filter(l => new Date(l.date) >= cutoff);
}

function renderDashboard() {
  const logs = logsInRange(currentRange);
  const chart = document.getElementById("dashboard-chart");
  const swapBox = document.getElementById("swap-suggestions");
  const breakdown = document.getElementById("daily-breakdown");
  const top3Box = document.getElementById("top3-by-category");
  chart.innerHTML = ""; swapBox.innerHTML = ""; breakdown.innerHTML = ""; top3Box.innerHTML = "";

  if (logs.length === 0) {
    chart.innerHTML = `<p class="hint">No meals logged in this range yet.</p>`;
    return;
  }

  const totals = {};
  logs.forEach(entry => {
    if (!totals[entry.dishId]) totals[entry.dishId] = { taken: 0, wasted: 0 };
    totals[entry.dishId].taken += entry.takenUnits;
    totals[entry.dishId].wasted += entry.wasteUnits;
  });

  const rows = Object.keys(totals).map(dishId => {
    const dish = findDish(dishId);
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
    const swapText = LOCAL_SWAPS[worst.dish.category] || "Consider a smaller default serving size.";
    swapBox.innerHTML = `
      <p><strong>${worst.dish.name}</strong> is running at ${worst.pct}% waste — the highest overall in this range.</p>
      <p>${swapText}</p>
      <p class="hint">Per FSSAI Eat Right Campus guidance on food waste management and local/seasonal food promotion.</p>
    `;
  }

  const categories = [...new Set(rows.map(r => r.dish.category))];
  categories.forEach(cat => {
    const catRows = rows.filter(r => r.dish.category === cat && r.wasted > 0)
      .sort((a, b) => b.wasted - a.wasted)
      .slice(0, 3);
    if (catRows.length === 0) return;

    const block = document.createElement("div");
    block.className = "category-block";
    const heading = document.createElement("h4");
    heading.textContent = cat;
    block.appendChild(heading);

    catRows.forEach((r, i) => {
      const proteinLost = (r.dish.nutrients.protein_g * r.wasted).toFixed(1);
      const row = document.createElement("div");
      row.className = "top3-row";
      row.innerHTML = `<span class="top3-rank">#${i + 1}</span><span>${r.dish.name}</span><span>${r.wasted.toFixed(2)} wasted &middot; ~${proteinLost}g protein lost</span>`;
      block.appendChild(row);
    });
    top3Box.appendChild(block);
  });

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
      const dish = findDish(dishId);
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
// WEEKLY DIGEST TAB
// ---------------------------------------------------------------
function renderDigest() {
  const logs = getLogs();
  const weight = parseFloat(document.getElementById("weight-input").value) || 60;
  const gender = document.getElementById("gender-select").value;
  saveProfile({ weight, gender });

  const rda = RDA_TABLE[gender];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const weekLogs = logs.filter(l => new Date(l.date) >= cutoff);

  const consumed = {};
  NUTRIENT_META.forEach(n => { consumed[n.key] = 0; });
  weekLogs.forEach(entry => {
    const dish = findDish(entry.dishId);
    if (!dish) return;
    const eatenUnits = Math.max(0, entry.takenUnits - entry.wasteUnits);
    NUTRIENT_META.forEach(n => { consumed[n.key] += (dish.nutrients[n.key] || 0) * eatenUnits; });
  });

  const summary = document.getElementById("digest-summary");
  summary.innerHTML = "";
  NUTRIENT_META.forEach(n => {
    const target = n.key === "protein_g" ? weight * rda.protein_g_per_kg * 7 : (rda[n.key] || 0) * 7;
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
const savedProfile = getProfile();
document.getElementById("weight-input").value = savedProfile.weight;
document.getElementById("gender-select").value = savedProfile.gender;

renderLogTab();
document.getElementById("weight-input").addEventListener("change", () => { renderDigest(); renderCatchupPanel(); });
document.getElementById("gender-select").addEventListener("change", () => { renderDigest(); renderCatchupPanel(); });
