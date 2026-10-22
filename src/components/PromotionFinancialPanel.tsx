import React,{useRef,useState} from 'react';
import {PromotionWallet,usePromotionRewards} from '../context/PromotionRewards';
import {useCloudAccount} from '../context/CloudAccount';
import {parseMoney} from '../utils/affiliateProfiles';
import {rewardDate,rewardMoney} from './PromotionCampaignCard';
export function PromotionFinancialPanel(){
 const rewards=usePromotionRewards(),account=useCloudAccount();
 if(!rewards)return null;
 return <PromotionFinancialWorkspace wallet={rewards.wallet} error={rewards.error} reload={rewards.reload} withdraw={rewards.withdraw} defaultPix={account?.profile.pix_key||''}/>;
}
export const PromotionFinancialWorkspace:React.FC<{wallet:PromotionWallet;error:string;reload:()=>Promise<void>;withdraw:(id:string,cents:number,pix:string)=>Promise<void>;defaultPix:string}>=({wallet,error,reload,withdraw,defaultPix})=>{
 const [amount,setAmount]=useState(''),[pix,setPix]=useState(defaultPix),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[failed,setFailed]=useState(false);
 const requestId=useRef<string|null>(null),locked=useRef(false);
 async function submit(e:React.FormEvent){
  e.preventDefault();if(locked.current)return;
  const value=parseMoney(amount),cents=value===null?0:Math.round(value*100);
  if(cents<=0||cents>wallet.available_cents||pix.trim().length<3){setFailed(true);setMessage('Confira o valor disponível e a chave Pix.');return;}
  locked.current=true;setBusy(true);setMessage('');
  requestId.current ||= crypto.randomUUID();
  try{await withdraw(requestId.current,cents,pix.trim());requestId.current=null;setAmount('');setFailed(false);setMessage('Solicitação registrada. O pagamento será realizado pela equipe ShopGO; nenhum Pix foi enviado automaticamente.');}
  catch(e){setFailed(true);setMessage((e as Error).message);}
  finally{locked.current=false;setBusy(false);}
 }
 const now=Date.parse(wallet.server_now);
 return <div className="space-y-6">
  <header className="border-b border-slate-200 pb-4"><h1 className="text-2xl font-semibold tracking-tight text-slate-950">Financeiro e comissões</h1><p className="text-sm text-slate-500 mt-2">Comissões promocionais custeadas pelo ShopGO pelas divulgações registradas na plataforma.</p></header>
  {error&&<div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error} <button onClick={()=>{void reload();}} className="font-semibold underline">Atualizar</button></div>}
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{[
   ['Comissões de hoje',wallet.earned_today_cents,'Limite de R$ 30 por dia · horário de Brasília'],
   ['Aguardando liberação',wallet.pending_cents,'Cada comissão é liberada após 8 dias'],
   ['Disponível para solicitar',wallet.available_cents,'Prazo de liberação cumprido'],
   ['Saques solicitados',wallet.requested_cents,'Aguardando pagamento pela equipe'],
  ].map(([label,cents,detail])=><div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">{label}</p><p className="mt-3 text-2xl font-semibold tabular-nums text-slate-950">{rewardMoney(Number(cents))}</p><p className="text-xs text-slate-400 mt-2">{detail}</p></div>)}</div>
  <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-slate-700">A primeira divulgação concluída não gera comissão. Da segunda em diante, cada divulgação elegível gera de R$ 5 a R$ 15, respeitando o teto diário. Os 8 dias são o prazo de liberação da recompensa, sem confirmação de venda ou entrega de produto.</div>
  <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"><div className="flex items-center justify-between gap-3"><h2 className="font-semibold text-slate-900">Extrato de divulgações</h2><button className="text-xs font-medium text-slate-600" onClick={()=>{void reload();}}>Atualizar saldo</button></div>
   {!wallet.items.length?<p className="text-sm text-slate-500">As divulgações concluídas aparecerão aqui.</p>:<div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-slate-400 border-b border-slate-100"><tr><th className="pb-3 pr-3 font-medium">Produto / perfil</th><th className="pb-3 pr-3 font-medium">Comissão</th><th className="pb-3 font-medium">Liberação</th></tr></thead><tbody>{wallet.items.map(item=><tr key={item.id} className="border-b border-slate-100"><td className="py-3 pr-3"><p className="font-medium text-slate-900">{item.product}</p><p className="text-slate-400 mt-1">{item.profile_name} · {rewardDate(item.completed_at)}</p></td><td className="pr-3 font-semibold whitespace-nowrap">{rewardMoney(item.amount_cents)}</td><td className="text-slate-500">{!item.available_at?'Sem remuneração':Date.parse(item.available_at)>now?`Pendente até ${rewardDate(item.available_at)}`:`Prazo cumprido em ${rewardDate(item.available_at)}`}</td></tr>)}</tbody></table></div>}
  </section>
  <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"><h2 className="font-semibold text-slate-900">Solicitar saque</h2><p className="text-sm text-slate-500">A solicitação reserva o saldo liberado. A equipe ShopGO realiza o pagamento e confirma a transferência.</p>
   <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3"><label className="space-y-2 text-xs font-medium text-slate-700">Valor (R$)<input value={amount} onChange={e=>{setAmount(e.target.value);requestId.current=null;}} disabled={busy||wallet.available_cents<=0||!!error} inputMode="decimal" required placeholder="Ex.: 15,00" className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 disabled:bg-slate-50"/></label><label className="space-y-2 text-xs font-medium text-slate-700">Chave Pix<input value={pix} onChange={e=>{setPix(e.target.value);requestId.current=null;}} disabled={busy} required minLength={3} maxLength={254} className="block w-full rounded-lg border border-slate-200 px-3 py-2.5"/></label><button disabled={busy||wallet.available_cents<=0||!!error} className="sm:col-span-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40">{busy?'Registrando solicitação…':'Solicitar pagamento'}</button></form>
   {message&&<p role={failed?'alert':'status'} className={`text-sm ${failed?'text-rose-700':'text-emerald-700'}`}>{message}</p>}
   {wallet.withdrawals.length>0&&<ul className="space-y-2 border-t border-slate-100 pt-4">{wallet.withdrawals.map(w=><li key={w.id} className="text-xs text-slate-600 flex flex-wrap justify-between gap-2"><span>{rewardDate(w.created_at)} · {rewardMoney(w.amount_cents)}</span><span>{w.status==='paid'?`Pagamento confirmado em ${rewardDate(w.paid_at!)}`:w.status==='requested'?'Solicitado · aguardando pagamento':'Solicitação recusada · saldo devolvido'}</span></li>)}</ul>}
  </section>
 </div>;
};
