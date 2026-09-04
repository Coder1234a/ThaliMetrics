/**
 * mockData.js  (v3)
 * ------------------------------------------------------------
 * SOURCING NOTE:
 * Nutrient values are standard Indian food-composition estimates for
 * common mess portions, not lab-measured for VIT's specific kitchen.
 * The per-meal-slot sample menu below is a REPRESENTATIVE menu
 * inspired by VIT Vellore's typical rotating multi-cuisine mess
 * structure (South Indian breakfast, North/South Indian lunch,
 * evening tea/snacks, roti-rice dinner) as described in public
 * student write-ups — it is NOT the literal official VIT mess
 * calendar, which changes monthly and isn't published in a form
 * this app could pull from. Mess admins should edit the "today's
 * menu" picks in-app to match the real posted menu.
 * RDA targets are ICMR-NIN 2020 reference intakes for adults
 * (19-39y). See /docs/RESEARCH_REFERENCE.pdf for full citations.
 * ------------------------------------------------------------
 */

// ---------------------------------------------------------------
// DISH LIBRARY — nutrients are per ONE FULL unit (one bowl, one
// glass, one roti, one idli/dosa, one fruit). "color" tints that
// dish's vessel fill so different items are visually distinct at
// a glance, not just by label.
// ---------------------------------------------------------------
const MOCK_DISH_LIBRARY = [
  { id: "dal", name: "Dal", category: "gravy", visual: "bowl", color: "#c99a3f",
    nutrients: { calories: 150, protein_g: 9, carbs_g: 20, fats_g: 4, iron_mg: 2.5, calcium_mg: 40, vitaminA_mcg: 8, vitaminC_mg: 2, folate_mcg: 100, vitaminB12_mcg: 0, zinc_mg: 1.3, fiber_g: 5 } },
  { id: "sambar", name: "Sambar", category: "gravy", visual: "bowl", color: "#d9832b",
    nutrients: { calories: 120, protein_g: 5, carbs_g: 18, fats_g: 3, iron_mg: 1.8, calcium_mg: 35, vitaminA_mcg: 60, vitaminC_mg: 6, folate_mcg: 60, vitaminB12_mcg: 0, zinc_mg: 0.7, fiber_g: 4 } },
  { id: "rasam", name: "Rasam", category: "gravy", visual: "bowl", color: "#c85a3d",
    nutrients: { calories: 60, protein_g: 2, carbs_g: 10, fats_g: 1, iron_mg: 0.8, calcium_mg: 15, vitaminA_mcg: 10, vitaminC_mg: 8, folate_mcg: 20, vitaminB12_mcg: 0, zinc_mg: 0.3, fiber_g: 1.5 } },
  { id: "mixed_veg_gravy", name: "Mixed Veg Gravy", category: "gravy", visual: "bowl", color: "#b5501f",
    nutrients: { calories: 130, protein_g: 3, carbs_g: 15, fats_g: 6, iron_mg: 1.2, calcium_mg: 45, vitaminA_mcg: 180, vitaminC_mg: 12, folate_mcg: 40, vitaminB12_mcg: 0, zinc_mg: 0.5, fiber_g: 3.5 } },
  { id: "chutney", name: "Chutney", category: "gravy", visual: "bowl", color: "#6f9c3f",
    nutrients: { calories: 45, protein_g: 1, carbs_g: 3, fats_g: 3.5, iron_mg: 0.4, calcium_mg: 20, vitaminA_mcg: 5, vitaminC_mg: 4, folate_mcg: 10, vitaminB12_mcg: 0, zinc_mg: 0.2, fiber_g: 1.5 } },
  { id: "poriyal", name: "Poriyal (Dry Sabzi)", category: "dry", visual: "bowl", color: "#e0a83c",
    nutrients: { calories: 90, protein_g: 2.5, carbs_g: 10, fats_g: 4, iron_mg: 1.0, calcium_mg: 50, vitaminA_mcg: 150, vitaminC_mg: 15, folate_mcg: 35, vitaminB12_mcg: 0, zinc_mg: 0.4, fiber_g: 3 } },
  { id: "keerai", name: "Keerai (Greens Poriyal)", category: "dry", visual: "bowl", color: "#4f8a3d",
    nutrients: { calories: 70, protein_g: 3, carbs_g: 7, fats_g: 3, iron_mg: 2.8, calcium_mg: 90, vitaminA_mcg: 300, vitaminC_mg: 20, folate_mcg: 80, vitaminB12_mcg: 0, zinc_mg: 0.5, fiber_g: 3.5 } },
  { id: "curd", name: "Curd", category: "dry", visual: "bowl", color: "#f2f0e6",
    nutrients: { calories: 60, protein_g: 3.5, carbs_g: 4, fats_g: 3, iron_mg: 0.1, calcium_mg: 120, vitaminA_mcg: 15, vitaminC_mg: 0.5, folate_mcg: 5, vitaminB12_mcg: 0.4, zinc_mg: 0.4, fiber_g: 0 } },
  { id: "upma", name: "Upma", category: "dry", visual: "bowl", color: "#d4b25a",
    nutrients: { calories: 180, protein_g: 4, carbs_g: 28, fats_g: 6, iron_mg: 1.0, calcium_mg: 20, vitaminA_mcg: 20, vitaminC_mg: 3, folate_mcg: 15, vitaminB12_mcg: 0, zinc_mg: 0.6, fiber_g: 2.5 } },
  { id: "rice", name: "Rice", category: "gravy", visual: "bowl", color: "#f5f2e6",
    nutrients: { calories: 200, protein_g: 2.5, carbs_g: 45, fats_g: 0.5, iron_mg: 0.3, calcium_mg: 5, vitaminA_mcg: 0, vitaminC_mg: 0, folate_mcg: 10, vitaminB12_mcg: 0, zinc_mg: 0.5, fiber_g: 0.5 } },
  { id: "roti", name: "Roti", category: "flat", visual: "roti", color: "#c9a876",
    nutrients: { calories: 80, protein_g: 3, carbs_g: 15, fats_g: 1, iron_mg: 0.8, calcium_mg: 10, vitaminA_mcg: 0, vitaminC_mg: 0, folate_mcg: 8, vitaminB12_mcg: 0, zinc_mg: 0.4, fiber_g: 1.5 } },
  { id: "dosa", name: "Dosa", category: "flat", visual: "roti", color: "#d9c48a",
    nutrients: { calories: 133, protein_g: 3.5, carbs_g: 22, fats_g: 3.5, iron_mg: 0.9, calcium_mg: 12, vitaminA_mcg: 0, vitaminC_mg: 0, folate_mcg: 12, vitaminB12_mcg: 0, zinc_mg: 0.4, fiber_g: 1 } },
  { id: "idli", name: "Idli (2 pcs)", category: "flat", visual: "roti", color: "#f2ede1",
    nutrients: { calories: 78, protein_g: 2.5, carbs_g: 16, fats_g: 0.3, iron_mg: 0.5, calcium_mg: 10, vitaminA_mcg: 0, vitaminC_mg: 0, folate_mcg: 10, vitaminB12_mcg: 0, zinc_mg: 0.3, fiber_g: 0.8 } },
  { id: "samosa", name: "Samosa", category: "flat", visual: "roti", color: "#c98a3d",
    nutrients: { calories: 260, protein_g: 4, carbs_g: 30, fats_g: 14, iron_mg: 1.0, calcium_mg: 15, vitaminA_mcg: 10, vitaminC_mg: 2, folate_mcg: 12, vitaminB12_mcg: 0, zinc_mg: 0.4, fiber_g: 2 } },
  { id: "buttermilk", name: "Buttermilk (Moru)", category: "liquid", visual: "glass", color: "#f2ecc9",
    nutrients: { calories: 40, protein_g: 2, carbs_g: 3, fats_g: 1.5, iron_mg: 0.1, calcium_mg: 80, vitaminA_mcg: 10, vitaminC_mg: 0.5, folate_mcg: 3, vitaminB12_mcg: 0.2, zinc_mg: 0.2, fiber_g: 0 } },
  { id: "tea", name: "Tea / Coffee", category: "liquid", visual: "glass", color: "#8a5a2f",
    nutrients: { calories: 55, protein_g: 1.5, carbs_g: 8, fats_g: 2, iron_mg: 0.1, calcium_mg: 40, vitaminA_mcg: 5, vitaminC_mg: 0, folate_mcg: 2, vitaminB12_mcg: 0.1, zinc_mg: 0.1, fiber_g: 0 } },
  { id: "juice", name: "Fruit Juice", category: "liquid", visual: "glass", color: "#e08a2e",
    nutrients: { calories: 90, protein_g: 0.5, carbs_g: 22, fats_g: 0.1, iron_mg: 0.2, calcium_mg: 10, vitaminA_mcg: 20, vitaminC_mg: 25, folate_mcg: 15, vitaminB12_mcg: 0, zinc_mg: 0.1, fiber_g: 0.5 } },
  { id: "banana", name: "Banana", category: "fruit", visual: "fruit", color: "#e8d24a",
    nutrients: { calories: 105, protein_g: 1.3, carbs_g: 27, fats_g: 0.4, iron_mg: 0.3, calcium_mg: 6, vitaminA_mcg: 4, vitaminC_mg: 10, folate_mcg: 24, vitaminB12_mcg: 0, zinc_mg: 0.2, fiber_g: 3.1 } }
];

// ---------------------------------------------------------------
// SAMPLE MESS MENU — dish IDs on offer per meal slot. This is what
// seeds each slot's menu the first time the app runs; the mess
// admin can then add/remove per slot from within the app.
// ---------------------------------------------------------------
const MOCK_SAMPLE_MENU_BY_SLOT = {
  breakfast: ["idli", "dosa", "chutney", "sambar", "upma", "tea"],
  lunch: ["rice", "sambar", "rasam", "poriyal", "curd", "roti"],
  snacks: ["samosa", "tea", "banana"],
  dinner: ["roti", "rice", "dal", "keerai", "curd"]
};

// ---------------------------------------------------------------
// ICMR-NIN 2020 reference intakes — adult (19-39y), moderate
// activity. Protein scales with the student's own body weight;
// everything else is a flat daily figure (see app.js for weekly
// and per-meal sub-target math).
// ---------------------------------------------------------------
const MOCK_RDA_TABLE = {
  male: { protein_g_per_kg: 0.83, carbs_g: 300, fats_g: 65, iron_mg: 19, calcium_mg: 1000, vitaminA_mcg: 1000, vitaminC_mg: 80, folate_mcg: 300, vitaminB12_mcg: 2.2, zinc_mg: 17, fiber_g: 30 },
  female: { protein_g_per_kg: 0.83, carbs_g: 250, fats_g: 55, iron_mg: 29, calcium_mg: 1000, vitaminA_mcg: 840, vitaminC_mg: 65, folate_mcg: 220, vitaminB12_mcg: 2.2, zinc_mg: 13.2, fiber_g: 25 }
};

// Nutrient display metadata, in the order shown on the digest.
// The first four (protein/carbs/fats/calories-adjacent) are also
// what's shown live on each dish's take-card.
const MOCK_NUTRIENT_META = [
  { key: "protein_g", label: "Protein", unit: "g", group: "macro" },
  { key: "carbs_g", label: "Carbs", unit: "g", group: "macro" },
  { key: "fats_g", label: "Fat", unit: "g", group: "macro" },
  { key: "iron_mg", label: "Iron", unit: "mg", group: "micro" },
  { key: "calcium_mg", label: "Calcium", unit: "mg", group: "micro" },
  { key: "vitaminA_mcg", label: "Vitamin A", unit: "mcg", group: "micro" },
  { key: "vitaminC_mg", label: "Vitamin C", unit: "mg", group: "micro" },
  { key: "folate_mcg", label: "Folate", unit: "mcg", group: "micro" },
  { key: "vitaminB12_mcg", label: "Vitamin B12", unit: "mcg", group: "micro" },
  { key: "zinc_mg", label: "Zinc", unit: "mg", group: "micro" },
  { key: "fiber_g", label: "Fiber", unit: "g", group: "micro" }
];

// Vellore / Tamil Nadu-relevant local & seasonal swap suggestions.
// Not a precise seasonal calendar — confirm current availability
// with the mess vendor/local market.
const MOCK_LOCAL_SWAPS = {
  gravy: "Try a drumstick or ridge-gourd based gravy — both grow locally around Vellore and are cheaper in-season than out-of-season vegetables.",
  dry: "Swap in banana stem or snake gourd poriyal — low-cost, locally available in Tamil Nadu markets.",
  flat: "Consider a smaller default size for this item rather than a substitute.",
  liquid: "Buttermilk (moru) with local curry leaves is a cheaper, locally-sourced swap for packaged drink options.",
  fruit: "Local seasonal fruit (guava, banana) is typically fresher and cheaper than fruit trucked in from other states."
};

// Quick-select reasons a student can (optionally) tag when logging
// waste — borrowed from how commercial kitchen waste-tracking tools
// (e.g. Leanpath) capture *why* food was wasted, not just how much.
// This lets the mess dashboard tell "over-served" apart from
// "recipe needs to change" instead of guessing from raw % alone.
const MOCK_WASTE_REASONS = [
  { id: "too_much", label: "Too much served" },
  { id: "taste", label: "Didn't like taste" },
  { id: "not_hungry", label: "Not hungry" },
  { id: "no_time", label: "Ran out of time" }
];

window.THALIMETRICS_DISH_LIBRARY = MOCK_DISH_LIBRARY;
window.THALIMETRICS_SAMPLE_MENU_BY_SLOT = MOCK_SAMPLE_MENU_BY_SLOT;
window.THALIMETRICS_RDA_TABLE = MOCK_RDA_TABLE;
window.THALIMETRICS_NUTRIENT_META = MOCK_NUTRIENT_META;
window.THALIMETRICS_LOCAL_SWAPS = MOCK_LOCAL_SWAPS;
window.THALIMETRICS_WASTE_REASONS = MOCK_WASTE_REASONS;
