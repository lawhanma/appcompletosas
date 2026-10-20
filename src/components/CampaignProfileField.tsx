import React, {useId} from 'react';
import {AffiliateProfile, PLATFORM_NAMES} from '../utils/affiliateProfiles';

export function CampaignProfileField({profiles,value,onChange,loading,error,disabled,onReload}: {
  profiles:AffiliateProfile[];value:string;onChange:(id:string)=>void;loading:boolean;
  error?:string;disabled?:boolean;onReload:()=>void;
}) {
  const id=useId(),active=profiles.filter(p=>!p.archived);
  return <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
    <label htmlFor={id} className="block text-sm font-semibold text-slate-900">Perfil da divulgação <span className="text-[#EE4D2D]">*</span></label>
    <select id={id} value={active.some(p=>p.id===value)?value:''} onChange={e=>onChange(e.target.value)} disabled={disabled||loading||!active.length} aria-invalid={!!error} aria-describedby={`${id}-help`} required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#EE4D2D] disabled:opacity-60">
      <option value="">{loading?'Carregando perfis…':'Selecione um perfil'}</option>
      {active.map(p=><option key={p.id} value={p.id}>{p.name} · {PLATFORM_NAMES[p.platform]} · @{p.handle.replace(/^@+/,'')}</option>)}
    </select>
    <p id={`${id}-help`} className="text-xs text-slate-500">{!loading&&!active.length?'Adicione um perfil em Meus Perfis para começar.':'Escolha qual dos seus perfis será identificado nesta campanha.'}</p>
    {error&&<p role="alert" className="text-xs text-red-700">{error}</p>}
    {!disabled&&<button type="button" disabled={loading} onClick={onReload} className="text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50">Atualizar perfis</button>}
  </div>;
}
