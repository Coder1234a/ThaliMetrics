/**
 * mockData.js  (v2)
 * ------------------------------------------------------------
 * Reference data for the ThaliMetrics demo.
 *
 * SOURCING NOTE (be upfront about this with judges):
 * Nutrient values per dish are standard Indian food-composition
 * estimates for common mess portions, not lab-measured for VIT's
 * specific kitchen. RDA targets are ICMR-NIN 2020 reference intakes
 * for adults (19-39y) — college students (18-22y) fall at the edge
 * of this bracket, which is the standard simplification used by
 * most Indian nutrition tools. See /docs/RESEARCH_REFERENCE.pdf for
 * full sourcing and citations before using this for anything beyond
 * a hackathon demo.
 * ------------------------------------------------------------
 */

// ---------------------------------------------------------------
// DISH LIBRARY — admin picks from this (or adds a custom dish) when
// setting up today's menu. category drives which visual + logging
// control the student sees. Nutrients are per ONE FULL unit:
// one bowl (gravy/dry/curd), one glass (liquid), one roti, one fruit.
// ---------------------------------------------------------------
const MOCK_DISH_LIBRARY = [
  { id: "dal", name: "Dal", category: "gravy", visual: "bowl",
    nutrients: { calories: 150, protein_g: 9, iron_mg: 2.5, calcium_mg: 40, vitaminA_mcg: 8, vitaminC_mg: 2, folate_mcg: 100, vitaminB12_mcg: 0, zinc_mg: 1.3, fiber_g: 5 } },
  { id: "sambar", name: "Sambar", category: "gravy", visual: "bowl",
    nutrients: { calories: 120, protein_g: 5, iron_mg: 1.8, calcium_mg: 35, vitaminA_mcg: 60, vitaminC_mg: 6, folate_mcg: 60, vitaminB12_mcg: 0, zinc_mg: 0.7, fiber_g: 4 } },
  { id: "rasam", name: "Rasam", category: "gravy", visual: "bowl",
    nutrients: { calories: 60, protein_g: 2, iron_mg: 0.8, calcium_mg: 15, vitaminA_mcg: 10, vitaminC_mg: 8, folate_mcg: 20, vitaminB12_mcg: 0, zinc_mg: 0.3, fiber_g: 1.5 } },
  { id: "mixed_veg_gravy", name: "Mixed Veg Gravy", category: "gravy", visual: "bowl",
    nutrients: { calories: 130, protein_g: 3, iron_mg: 1.2, calcium_mg: 45, vitaminA_mcg: 180, vitaminC_mg: 12, folate_mcg: 40, vitaminB12_mcg: 0, zinc_mg: 0.5, fiber_g: 3.5 } },
  { id: "poriyal", name: "Poriyal (Dry Sabzi)", category: "dry", visual: "bowl",
    nutrients: { calories: 90, protein_g: 2.5, iron_mg: 1.0, calcium_mg: 50, vitaminA_mcg: 150, vitaminC_mg: 15, folate_mcg: 35, vitaminB12_mcg: 0, zinc_mg: 0.4, fiber_g: 3 } },
  { id: "keerai", name: "Keerai (Greens Poriyal)", category: "dry", visual: "bowl",
    nutrients: { calories: 70, protein_g: 3, iron_mg: 2.8, calcium_mg: 90, vitaminA_mcg: 300, vitaminC_mg: 20, folate_mcg: 80, vitaminB12_mcg: 0, zinc_mg: 0.5, fiber_g: 3.5 } },
  { id: "curd", name: "Curd", category: "dry", visual: "bowl",
    nutrients: { calories: 60, protein_g: 3.5, iron_mg: 0.1, calcium_mg: 120, vitaminA_mcg: 15, vitaminC_mg: 0.5, folate_mcg: 5, vitaminB12_mcg: 0.4, zinc_mg: 0.4, fiber_g: 0 } },
  { id: "rice", name: "Rice", category: "gravy", visual: "bowl",
    nutrients: { calories: 200, protein_g: 2.5, iron_mg: 0.3, calcium_mg: 5, vitaminA_mcg: 0, vitaminC_mg: 0, folate_mcg: 10, vitaminB12_mcg: 0, zinc_mg: 0.5, fiber_g: 0.5 } },
  { id: "roti", name: "Roti", category: "flat", visual: "roti",
    nutrients: { calories: 80, protein_g: 3, iron_mg: 0.8, calcium_mg: 10, vitaminA_mcg: 0, vitaminC_mg: 0, folate_mcg: 8, vitaminB12_mcg: 0, zinc_mg: 0.4, fiber_g: 1.5 } },
  { id: "buttermilk", name: "Buttermilk (Moru)", category: "liquid", visual: "glass",
    nutrients: { calories: 40, protein_g: 2, iron_mg: 0.1, calcium_mg: 80, vitaminA_mcg: 10, vitaminC_mg: 0.5, folate_mcg: 3, vitaminB12_mcg: 0.2, zinc_mg: 0.2, fiber_g: 0 } },
  { id: "juice", name: "Fruit Juice", category: "liquid", visual: "glass",
    nutrients: { calories: 90, protein_g: 0.5, iron_mg: 0.2, calcium_mg: 10, vitaminA_mcg: 20, vitaminC_mg: 25, folate_mcg: 15, vitaminB12_mcg: 0, zinc_mg: 0.1, fiber_g: 0.5 } },
  { id: "banana", name: "Banana", category: "fruit", visual: "fruit",
    nutrients: { calories: 105, protein_g: 1.3, iron_mg: 0.3, calcium_mg: 6, vitaminA_mcg: 4, vitaminC_mg: 10, folate_mcg: 24, vitaminB12_mcg: 0, zinc_mg: 0.2, fiber_g: 3.1 } }
];

// ---------------------------------------------------------------
// ICMR-NIN 2020 reference intakes — ADULT (19-39y), moderate activity.
// Weekly targets are computed in app.js as (daily x 7), except protein
// which scales with the student's own body weight per ICMR-NIN's
// 0.83 g/kg/day formula rather than a flat number.
// See /docs/RESEARCH_REFERENCE.pdf for citation-by-citation sourcing.
// ---------------------------------------------------------------
const MOCK_RDA_TABLE = {
  male: {
    protein_g_per_kg: 0.83, // same coefficient both sexes
    iron_mg: 19,
    calcium_mg: 1000,
    vitaminA_mcg: 1000,
    vitaminC_mg: 80,
    folate_mcg: 300,
    vitaminB12_mcg: 2.2,
    zinc_mg: 17,
    fiber_g: 30
  },
  female: {
    protein_g_per_kg: 0.83,
    iron_mg: 29, // higher than men — accounts for menstrual iron loss
    calcium_mg: 1000,
    vitaminA_mcg: 840,
    vitaminC_mg: 65,
    folate_mcg: 220,
    vitaminB12_mcg: 2.2,
    zinc_mg: 13.2,
    fiber_g: 25
  }
};

// Nutrient display metadata (label + unit), in the order shown on the digest
const MOCK_NUTRIENT_META = [
  { key: "protein_g", label: "Protein", unit: "g" },
  { key: "iron_mg", label: "Iron", unit: "mg" },
  { key: "calcium_mg", label: "Calcium", unit: "mg" },
  { key: "vitaminA_mcg", label: "Vitamin A", unit: "mcg" },
  { key: "vitaminC_mg", label: "Vitamin C", unit: "mg" },
  { key: "folate_mcg", label: "Folate", unit: "mcg" },
  { key: "vitaminB12_mcg", label: "Vitamin B12", unit: "mcg" },
  { key: "zinc_mg", label: "Zinc", unit: "mg" },
  { key: "fiber_g", label: "Fiber", unit: "g" }
];

// ---------------------------------------------------------------
// Vellore / Tamil Nadu-relevant local & seasonal swap suggestions
// for the mess dashboard's "most wasted dish" flag. These are
// commonly available regional items, not a precise seasonal
// calendar — confirm current-season availability with the mess
// vendor/local market before treating this as authoritative.
// ---------------------------------------------------------------
const MOCK_LOCAL_SWAPS = {
  gravy: "Try a drumstick or ridge-gourd based gravy — both grow locally around Vellore and are cheaper in-season than out-of-season vegetables.",
  dry: "Swap in banana stem or snake gourd poriyal — low-cost, locally available in Tamil Nadu markets, and typically less wasted than leafy greens dishes.",
  flat: "Consider a smaller default roti size for this slot rather than a substitute dish.",
  liquid: "Buttermilk (moru) with local curry leaves is a cheaper, locally-sourced swap for packaged/imported drink options.",
  fruit: "Local seasonal fruit (guava, banana) is typically fresher and cheaper than fruit trucked in from other states."
};

// Exposed globally — no bundler on purpose, keeps the project runnable
// by just opening index.html.
window.THALIMETRICS_DISH_LIBRARY = MOCK_DISH_LIBRARY;
window.THALIMETRICS_RDA_TABLE = MOCK_RDA_TABLE;
window.THALIMETRICS_NUTRIENT_META = MOCK_NUTRIENT_META;
window.THALIMETRICS_LOCAL_SWAPS = MOCK_LOCAL_SWAPS;
