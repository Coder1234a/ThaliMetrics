/**
 * mockData.js
 * ------------------------------------------------------------
 * Stand-in data for the hackathon demo. In a real deployment,
 * DISHES would come from the mess's daily menu (a small admin
 * form or spreadsheet import), not be hardcoded like this.
 *
 * Nutrient values are per ONE FULL portion of that dish, using
 * standard Indian portion-size references (one bowl ~150g cooked
 * dal/sabzi, one roti ~30g). These are demo-accurate, not lab-grade.
 * ------------------------------------------------------------
 */

// "bowl" dishes are logged with a slider (0 to 4 quarter-portions).
// "flat" dishes (roti/paratha) are logged with 4 tap-able quarters.
const MOCK_DISHES = [
  {
    id: "dal",
    name: "Dal",
    type: "bowl",
    protein_g: 9,   // per full bowl
    iron_mg: 2.5,
    calories: 150,
    swapSuggestion: null
  },
  {
    id: "sabzi",
    name: "Mixed Sabzi",
    type: "bowl",
    protein_g: 3,
    iron_mg: 1.2,
    calories: 110,
    swapSuggestion: "Try beetroot sabzi instead of baingan — similar prep, less waste in past logs."
  },
  {
    id: "rice",
    name: "Rice",
    type: "bowl",
    protein_g: 2.5,
    iron_mg: 0.3,
    calories: 200,
    swapSuggestion: null
  },
  {
    id: "roti",
    name: "Roti",
    type: "flat",
    protein_g: 3,
    iron_mg: 0.8,
    calories: 80,
    swapSuggestion: null
  },
  {
    id: "curd",
    name: "Curd",
    type: "bowl",
    protein_g: 3.5,
    iron_mg: 0.1,
    calories: 60,
    swapSuggestion: null
  }
];

// ICMR-NIN reference: ~0.83 g protein per kg body weight per day.
// Iron target simplified for demo purposes (real target differs by
// age/sex per ICMR-NIN tables — flagged in README as a v2 improvement).
const MOCK_TARGETS = {
  weight_kg: 60,
  protein_g_per_kg: 0.83,
  iron_mg_target: 18 // demo default, tune per profile in a future version
};

// Exposed for app.js (no build step / bundler in this MVP on purpose —
// keeps the project runnable by just opening index.html).
window.THALIMETRICS_DISHES = MOCK_DISHES;
window.THALIMETRICS_TARGETS = MOCK_TARGETS;
