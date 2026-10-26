import React from 'react';
import {usePromotionRewards} from '../context/PromotionRewards';

export const ANTICIPATION_CHECKOUT_URL='https://go.ironpayapp.com.br/tgphlqdt9x';
export function WithdrawalAnticipation(){
 const rewards=usePromotionRewards();
 const eligible=!!rewards&&!rewards.loading&&!rewards.error&&rewards.wallet.pending_cents>0;
 return <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3" aria-label="Antecipação opcional">
  <h3 className="text-sm font-semibold text-slate-900">Antecipação opcional</h3>
  <p className="text-xs text-slate-600">A liberação normal das comissões promocionais ocorre após 8 dias, sem contratar antecipação. Para antecipar, consulte os valores e as condições no checkout.</p>
  {eligible?<a href={ANTICIPATION_CHECKOUT_URL} target="_blank" rel="noopener noreferrer" className="inline-flex justify-center rounded-lg bg-orange-600 hover:bg-orange-700 px-4 py-2.5 text-xs font-semibold text-white">Solicitar antecipação</a>:<p className="text-xs text-slate-500">É necessário ter comissão promocional pendente registrada na conta para solicitar antecipação.</p>}
  <p className="text-xs text-slate-500">A liberação antecipada depende da confirmação pela equipe ShopGO. O checkout não confirma uma transferência Pix.</p>
 </section>;
}
