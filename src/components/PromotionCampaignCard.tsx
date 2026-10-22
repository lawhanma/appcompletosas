import React from 'react';
import {usePromotionCampaign} from '../hooks/usePromotionCampaign';
export const rewardMoney=(cents:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100);
export const rewardDate=(value:string)=>new Date(value).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'});
export function PromotionCampaignCard({campaign}:{campaign:ReturnType<typeof usePromotionCampaign>}){
 if(!campaign.enabled&&!campaign.error)return null;
 return <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 space-y-2 text-sm" aria-label="Comissão promocional">
  <h3 className="font-semibold text-slate-900">Comissão promocional ShopGO</h3>
  <p className="text-xs text-slate-600">Paga pela plataforma a partir da segunda divulgação concluída. De R$ 5 a R$ 15 por divulgação, até R$ 30 por dia. Liberação após 8 dias.</p>
  {campaign.award&&<p role="status" className="text-sm font-medium text-slate-900">{campaign.award.amount_cents>0?`${rewardMoney(campaign.award.amount_cents)} registrados no financeiro. Liberação: ${rewardDate(campaign.award.available_at!)}.`:'Divulgação registrada sem comissão: primeira divulgação ou limite diário de remuneração atingido.'}</p>}
  {campaign.busy&&<p role="status" className="text-xs text-slate-600">Consultando registro da comissão…</p>}
  {campaign.error&&<div role="alert" className="text-xs text-rose-700"><p>{campaign.error}</p>{campaign.unconfirmed&&<button disabled={campaign.busy} onClick={()=>{void campaign.complete();}} className="font-semibold underline mt-2">Tentar confirmar novamente</button>}</div>}
  <p className="text-[11px] text-slate-500">Recompensa por atividade registrada no ShopGO. Não é confirmação de venda ou entrega de produto. Este fluxo não verifica postagens externas.</p>
 </div>;
}
