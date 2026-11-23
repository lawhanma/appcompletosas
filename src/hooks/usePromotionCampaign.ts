import type { PromotionAward } from '../context/PromotionRewards';

/** Automated disclosure no longer writes to the promotional rewards registry. */
export function usePromotionCampaign() {
  const award: PromotionAward | null = null;

  async function start(_profile: string | null, _product: string) {
    return true;
  }

  async function complete() {
    return;
  }

  return {
    start,
    complete,
    award,
    error: '',
    busy: false,
    enabled: false,
    unconfirmed: false,
  };
}
