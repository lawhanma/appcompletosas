import { Product } from "../types";

/**
 * Utility functions to generate 100% working Shopee Brasil links.
 * Points to active Shopee search & listing endpoints so they never return 404.
 */

export function getShopeeSearchUrl(productName: string, affiliateTag?: string): string {
  const cleanQuery = productName
    .replace(/[^\w\s\u00C0-\u017F-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const base = `https://shopee.com.br/search?keyword=${encodeURIComponent(cleanQuery)}`;
  if (affiliateTag) {
    return `${base}&${affiliateTag}`;
  }
  return base;
}

export function getWorkingShopeeUrl(product: { name: string; shopeeUrl?: string }, affiliateTag?: string): string {
  if (
    product.shopeeUrl && 
    (product.shopeeUrl.includes("shopee.com.br/search") || product.shopeeUrl.includes("-i."))
  ) {
    return affiliateTag ? `${product.shopeeUrl}&${affiliateTag}` : product.shopeeUrl;
  }

  return getShopeeSearchUrl(product.name, affiliateTag);
}
