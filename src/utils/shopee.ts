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
  if (product.shopeeUrl) {
    try {
      const url = new URL(product.shopeeUrl);
      if (url.protocol === "https:" && !url.username && !url.password &&
          ["shopee.com.br", "www.shopee.com.br"].includes(url.host) &&
          (url.pathname === "/search" || /^\/product\/\d+\/\d+\/?$/.test(url.pathname) || /-i\.\d+\.\d+\/?$/.test(url.pathname))) {
        if (!affiliateTag) return url.href;
        for (const [key, value] of new URLSearchParams(affiliateTag)) url.searchParams.append(key, value);
        return url.href;
      }
    } catch {
      // Fall back to a Shopee search for catalog records with an invalid link.
    }
  }

  return getShopeeSearchUrl(product.name, affiliateTag);
}
