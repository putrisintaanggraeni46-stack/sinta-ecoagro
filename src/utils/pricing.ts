/**
 * Utility functions for pricing, cost price (harga beli), selling price (harga jual),
 * and auto profit ratio calculations for EcoAgro Point of Sale (POS) and Inventory.
 */

export interface ProfitMetrics {
  costPrice: number;
  sellingPrice: number;
  profitNominal: number; // Nominal Keuntungan (Rp) = Harga Jual - Harga Beli
  markupRatio: number;   // Rasio Profit dari Harga Beli (%) = (Jual - Beli) / Beli * 100%
  marginRatio: number;   // Margin Profit dari Harga Jual (%) = (Jual - Beli) / Jual * 100%
}

/**
 * Quick preset percentage options for retail agricultural pricing
 */
export const PROFIT_RATIO_PRESETS = [10, 15, 20, 25, 30, 35, 40, 50, 75, 100];

/**
 * Standard rounding options to facilitate easy cashier change (uang kembalian)
 */
export const ROUNDING_OPTIONS = [
  { label: 'Tanpa Pembulatan', value: 1 },
  { label: 'Bulatkan ke Rp 100', value: 100 },
  { label: 'Bulatkan ke Rp 500', value: 500 },
  { label: 'Bulatkan ke Rp 1.000', value: 1000 },
];

/**
 * Calculate selling price automatically given cost price and target profit ratio (%)
 * Formula: Harga Jual = Harga Beli * (1 + ratio / 100) rounded to nearest step
 */
export function calculateSellingPrice(
  costPrice: number,
  ratioPercent: number,
  roundingStep = 500
): number {
  if (costPrice <= 0) return 0;
  const rawPrice = costPrice * (1 + ratioPercent / 100);
  if (roundingStep <= 1) {
    return Math.round(rawPrice);
  }
  return Math.ceil(rawPrice / roundingStep) * roundingStep;
}

/**
 * Calculate comprehensive profit metrics given cost and selling price
 */
export function calculateProfitMetrics(
  costPrice: number,
  sellingPrice: number
): ProfitMetrics {
  const safeCost = Math.max(0, costPrice || 0);
  const safeSelling = Math.max(0, sellingPrice || 0);
  const profitNominal = safeSelling - safeCost;

  const markupRatio = safeCost > 0 
    ? ((safeSelling - safeCost) / safeCost) * 100 
    : 0;

  const marginRatio = safeSelling > 0 
    ? ((safeSelling - safeCost) / safeSelling) * 100 
    : 0;

  return {
    costPrice: safeCost,
    sellingPrice: safeSelling,
    profitNominal,
    markupRatio: Math.round(markupRatio * 10) / 10,
    marginRatio: Math.round(marginRatio * 10) / 10,
  };
}

/**
 * Determine default cost price if undefined (defaults to ~75% of selling price)
 */
export function getDefaultCostPrice(sellingPrice: number): number {
  if (!sellingPrice || sellingPrice <= 0) return 0;
  // Retail agriculture typical HPP is 70-80% of retail price
  return Math.round((sellingPrice * 0.75) / 500) * 500;
}
