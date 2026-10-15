import { useState, useEffect, useCallback } from "react";
import { Product } from "../types";
import { getWorkingShopeeUrl } from "./shopee";
import { useFinancial } from "../context/FinancialContext";

const STORAGE_AFFILIATED_PRODUCTS_KEY = "shopnext_shopee_affiliated_products_101190";
const STORAGE_HAS_ACCOUNT_KEY = "shopnext_shopee_has_account_101190";
export const SHOPEE_AFFILIATE_PORTAL_URL = "https://affiliate.shopee.com.br";

export function getAffiliatedProductIdsFromStorage(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_AFFILIATED_PRODUCTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function checkIsProductAffiliated(productId: string, userCode?: string): boolean {
  if (userCode && userCode !== "101190") {
    return true;
  }
  const affiliated = getAffiliatedProductIdsFromStorage();
  return affiliated.includes(productId);
}

export function useShopeeAffiliation() {
  const { userCode } = useFinancial();
  const isCode101190 = userCode === "101190";

  const [affiliatedProductIds, setAffiliatedProductIds] = useState<string[]>(() => {
    return getAffiliatedProductIdsFromStorage();
  });

  const [hasShopeeAccount, setHasShopeeAccountState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_HAS_ACCOUNT_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const isAffiliated = useCallback((productId: string): boolean => {
    // For 101190, user must have explicitly gone through the affiliation flow for this product
    if (!isCode101190) return true;
    return affiliatedProductIds.includes(productId);
  }, [isCode101190, affiliatedProductIds]);

  const markProductAsAffiliated = useCallback((productId: string) => {
    setAffiliatedProductIds((prev) => {
      if (prev.includes(productId)) return prev;
      const updated = [...prev, productId];
      try {
        localStorage.setItem(STORAGE_AFFILIATED_PRODUCTS_KEY, JSON.stringify(updated));
        // Dispara evento para sincronizar múltiplos componentes instantaneamente
        window.dispatchEvent(new CustomEvent("shopnext_affiliation_updated", { detail: { productId } }));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  }, []);

  // Listen to cross-component affiliation updates
  useEffect(() => {
    const handleUpdate = () => {
      setAffiliatedProductIds(getAffiliatedProductIdsFromStorage());
    };
    window.addEventListener("shopnext_affiliation_updated", handleUpdate);
    return () => window.removeEventListener("shopnext_affiliation_updated", handleUpdate);
  }, []);

  const setHasShopeeAccount = useCallback((hasAccount: boolean) => {
    setHasShopeeAccountState(hasAccount);
    try {
      localStorage.setItem(STORAGE_HAS_ACCOUNT_KEY, JSON.stringify(hasAccount));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const getProductAffiliateLink = useCallback((product: Product): string => {
    return `https://shopee.com.br/search?keyword=${encodeURIComponent(product.name)}&af_sub=shopnext_afiliado&utm_source=shopnext_affiliate`;
  }, []);

  /**
   * Action when user chooses "Yes, I have an account"
   * Redirects to the product page on Shopee to get/activate affiliate link
   */
  const handleRedirectToProductAffiliation = useCallback((product: Product) => {
    setHasShopeeAccount(true);
    markProductAsAffiliated(product.id);
    const targetUrl = getWorkingShopeeUrl(product);
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  }, [markProductAsAffiliated, setHasShopeeAccount]);

  /**
   * Action when user chooses "No, I don't have an account"
   * Redirects to official Shopee affiliate registration portal
   */
  const handleRedirectToShopeeRegister = useCallback((product?: Product) => {
    if (product) {
      // Don't mark as affiliated yet, but keep product reference
    }
    window.open(SHOPEE_AFFILIATE_PORTAL_URL, "_blank", "noopener,noreferrer");
  }, []);

  /**
   * Action for subsequent times: "Pegar link de afiliação"
   * Copies the link to clipboard and redirects to the Shopee product
   */
  const handleGetAffiliateLink = useCallback(async (product: Product): Promise<boolean> => {
    const link = getProductAffiliateLink(product);
    let copied = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
        copied = true;
      }
    } catch (err) {
      console.warn("Clipboard access failed", err);
    }

    const targetUrl = getWorkingShopeeUrl(product);
    window.open(targetUrl, "_blank", "noopener,noreferrer");
    return copied;
  }, [getProductAffiliateLink]);

  return {
    isCode101190,
    hasShopeeAccount,
    setHasShopeeAccount,
    isAffiliated,
    markProductAsAffiliated,
    getProductAffiliateLink,
    handleRedirectToProductAffiliation,
    handleRedirectToShopeeRegister,
    handleGetAffiliateLink
  };
}
