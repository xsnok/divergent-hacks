export const CARBON_IMPACT = {
  plastic: 0.5, // kg CO2 saved per item
  paper: 0.2,
  metal: 1.2,
  glass: 0.4,
  organic: 0.8,
  compost: 0.8,
  landfill: -0.1, // landfill actually adds footprint
};

export type WasteCategory = keyof typeof CARBON_IMPACT;

export function calculateCarbonSaved(category: string, count: number = 1): number {
  const cat = category.toLowerCase() as WasteCategory;
  return (CARBON_IMPACT[cat] || 0) * count;
}

export function formatTonnes(kg: number): string {
  return (kg / 1000).toFixed(2);
}
