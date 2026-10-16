import { useState, useEffect, useCallback } from "react";
import { Product } from "../types";
import { getWorkingShopeeUrl } from "./shopee";
import { useFinancial } from "../context/FinancialContext";
import {useDailyMissions} from '../context/DailyMissions';

const STORAGE_AFFILIATED_PRODUCTS_KEY_101190 = "shopnext_shopee_affiliated_products_101190";
const STORAGE_AFFILIATED_PRODUCTS_KEY_887422 = "shopnext_shopee_affiliated_products_887422";
const STORAGE_HAS_ACCOUNT_KEY = "shopnext_shopee_has_account";
export const SHOPEE_AFFILIATE_PORTAL_URL = "https://affiliate.shopee.com.br";

export const isStandardCode = (code?: string): boolean => {
  const clean = code?.trim();
  return clean === "101190" || clean === "887422";
};

export const getAffiliationStorageKey = (code?: string): string => {
  const clean = code?.trim();
  if (clean === "887422") return STORAGE_AFFILIATED_PRODUCTS_KEY_887422;
  return STORAGE_AFFILIATED_PRODUCTS_KEY_101190;
};

export function getAffiliatedProductIdsFromStorage(userCode?: string): string[] {
  try {
    const key = getAffiliationStorageKey(userCode);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function checkIsProductAffiliated(productId: string, userCode?: string): boolean {
  if (userCode && !isStandardCode(userCode)) {
    return true;
  }
  const affiliated = getAffiliatedProductIdsFromStorage(userCode);
  return affiliated.includes(productId);
}

export function useShopeeAffiliation() {
  const {record} = useDailyMissions();
  const { userCode } = useFinancial();
  const isCode101190 = isStandardCode(userCode);

  const [affiliatedProductIds, setAffiliatedProductIds] = useState<string[]>(() => {
    return getAffiliatedProductIdsFromStorage(userCode);
  });

  const [hasShopeeAccount, setHasShopeeAccountState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_HAS_ACCOUNT_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Keep state synchronized with active userCode
  useEffect(() => {
    setAffiliatedProductIds(getAffiliatedProductIdsFromStorage(userCode));
  }, [userCode]);

  const isAffiliated = useCallback((productId: string): boolean => {
    // For standard codes (101190 and 887422), user must have explicitly gone through the affiliation flow for this product
    if (!isCode101190) return true;
    return affiliatedProductIds.includes(productId);
  }, [isCode101190, affiliatedProductIds]);

  const markProductAsAffiliated = useCallback((productId: string) => {
    setAffiliatedProductIds((prev) => {
      if (prev.includes(productId)) return prev;
      const updated = [...prev, productId];
      try {
        const key = getAffiliationStorageKey(userCode);
        localStorage.setItem(key, JSON.stringify(updated));
        // Dispara evento para sincronizar múltiplos componentes instantaneamente
        window.dispatchEvent(new CustomEvent("shopnext_affiliation_updated", { detail: { productId, userCode } }));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  }, [userCode]);

  // Listen to cross-component affiliation updates
  useEffect(() => {
    const handleUpdate = () => {
      setAffiliatedProductIds(getAffiliatedProductIdsFromStorage(userCode));
    };
    window.addEventListener("shopnext_affiliation_updated", handleUpdate);
    return () => window.removeEventListener("shopnext_affiliation_updated", handleUpdate);
  }, [userCode]);

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
        record('link',product.id);
      }
    } catch (err) {
      console.warn("Clipboard access failed", err);
    }

    const targetUrl = getWorkingShopeeUrl(product);
    window.open(targetUrl, "_blank", "noopener,noreferrer");
    return copied;
  }, [getProductAffiliateLink,record]);

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
