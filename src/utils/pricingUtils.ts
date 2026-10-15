import { Product, ProductCategory } from '../types';

export const DEFAULT_STORE_MARKUP_PERCENT = 25; // Default markup 25%

export const CATEGORY_DEFAULT_MARKUP: Record<ProductCategory, number> = {
  'Benih & Bibit Unggul': 20,
  'Pupuk, Nutrisi & Hayati': 15,
  'Pestisida & Proteksi Tanaman': 25,
  'Alat, Mesin & Perlengkapan Tani': 30,
  'Irigasi & Greenhouse': 25,
  'Ternak, Wadah & Pasca Panen': 20,
};

export const CATEGORY_SKU_PREFIX: Record<ProductCategory, string> = {
  'Benih & Bibit Unggul': 'BNH',
  'Pupuk, Nutrisi & Hayati': 'PPK',
  'Pestisida & Proteksi Tanaman': 'PST',
  'Alat, Mesin & Perlengkapan Tani': 'ALT',
  'Irigasi & Greenhouse': 'IRG',
  'Ternak, Wadah & Pasca Panen': 'TRN',
};

/**
 * Menghitung Harga Jual dari Harga Beli & Rasio Markup (%)
 * Contoh: Beli 100.000 dengan markup 25% -> Jual 125.000
 * Dibulatkan ke ratusan terdekat untuk kepraktisan ritel kasir.
 */
export function calculateSellingPriceFromBuyPrice(buyPrice: number, markupPercent: number): number {
  if (buyPrice <= 0) return 0;
  const rawPrice = buyPrice * (1 + markupPercent / 100);
  return Math.round(rawPrice / 100) * 100;
}

/**
 * Menghitung Harga Beli (HPP) dari Harga Jual & Rasio Markup (%)
 */
export function calculateBuyPriceFromSellingPrice(sellingPrice: number, markupPercent: number): number {
  if (sellingPrice <= 0) return 0;
  const rawBuyPrice = sellingPrice / (1 + markupPercent / 100);
  return Math.round(rawBuyPrice / 100) * 100;
}

/**
 * Menghitung metrik profitabilitas:
 * - Nominal Keuntungan (Rp)
 * - Markup Rasio (%) dari Harga Beli
 * - Margin Keuntungan (%) dari Harga Jual
 */
export function calculateProfitMetrics(sellingPrice: number, buyPrice: number) {
  const safeSelling = Number(sellingPrice) || 0;
  const safeBuy = Number(buyPrice) || 0;
  const nominalProfit = safeSelling - safeBuy;
  const markupPercent = safeBuy > 0 ? ((safeSelling - safeBuy) / safeBuy) * 100 : 0;
  const marginPercent = safeSelling > 0 ? ((safeSelling - safeBuy) / safeSelling) * 100 : 0;

  return {
    nominalProfit,
    markupPercent: Math.round(markupPercent * 10) / 10,
    marginPercent: Math.round(marginPercent * 10) / 10,
    isHealthy: markupPercent >= 15,
  };
}

/**
 * Mendapatkan Harga Beli produk (fallback ke estimasi jika belum terdata)
 */
export function getProductBuyPrice(product: Product): number {
  if (product.buyPrice && product.buyPrice > 0) {
    return product.buyPrice;
  }
  const defaultMarkup = CATEGORY_DEFAULT_MARKUP[product.category] || DEFAULT_STORE_MARKUP_PERCENT;
  return calculateBuyPriceFromSellingPrice(product.price, defaultMarkup);
}

/**
 * Mendapatkan Rasio Profit (%) produk
 */
export function getProductProfitRatio(product: Product): number {
  if (product.profitRatio !== undefined && product.profitRatio > 0) {
    return product.profitRatio;
  }
  const buyPrice = getProductBuyPrice(product);
  if (buyPrice > 0) {
    const markup = ((product.price - buyPrice) / buyPrice) * 100;
    return Math.round(markup * 10) / 10;
  }
  return CATEGORY_DEFAULT_MARKUP[product.category] || DEFAULT_STORE_MARKUP_PERCENT;
}

/**
 * Mendapatkan atau membuat SKU kasir produk
 */
export function getProductSku(product: Product, fallbackIndex = 1): string {
  if (product.sku && product.sku.trim()) {
    return product.sku.trim().toUpperCase();
  }
  const prefix = CATEGORY_SKU_PREFIX[product.category] || 'AGR';
  const cleanId = product.id ? product.id.replace(/[^0-9]/g, '') : String(fallbackIndex);
  const padded = cleanId ? cleanId.slice(-3).padStart(3, '0') : String(fallbackIndex).padStart(3, '0');
  return `ECO-${prefix}-${padded}`;
}
