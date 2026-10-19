import React, {useEffect, useRef} from 'react';
import {X, Sparkles, Infinity as InfinityIcon, Zap} from 'lucide-react';

export const CREDIT_PLANS = [
  {id: 'unlimited', name: 'Créditos ilimitados', price: '64,90', description: 'Divulgue sem limite de créditos.', env: 'VITE_CHECKOUT_CREDITS_UNLIMITED'},
  {id: '35', name: '35 créditos', price: '34,90', description: 'Renove com 35 créditos para suas divulgações.', env: 'VITE_CHECKOUT_CREDITS_35'},
] as const;

function checkoutUrl(value?: string): string | null {
  try {
    const url = new URL(value || '');
    return url.protocol === 'https:' && !url.username && !url.password ? url.toString() : null;
  } catch {return null;}
}

export const CreditRenewalModal: React.FC<{onClose: () => void}> = ({onClose}) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => previous?.focus();
  }, []);
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4" onClick={e => {if(e.target === e.currentTarget) onClose();}}>
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="credit-renewal-title" aria-describedby="credit-renewal-description"
      onKeyDown={e => {
        if(e.key === 'Escape') {e.stopPropagation(); onClose();}
        if(e.key === 'Tab') {
          const items = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]');
          if (!items?.length) return;
          const first = items[0], last = items[items.length - 1];
          if(e.shiftKey && document.activeElement === first) {e.preventDefault(); last.focus();}
          else if(!e.shiftKey && document.activeElement === last) {e.preventDefault(); first.focus();}
        }
      }} className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-5">
      <button ref={closeRef} onClick={onClose} aria-label="Fechar renovação de créditos" className="absolute top-4 right-4 p-2 rounded-lg text-slate-500 hover:bg-slate-100"><X className="w-5 h-5"/></button>
      <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center"><Sparkles className="w-6 h-6"/></div>
      <div><h2 id="credit-renewal-title" className="text-2xl font-bold text-slate-900 pr-6">Renove seus créditos</h2>
        <p id="credit-renewal-description" className="text-sm text-slate-600 mt-2">Seus créditos de divulgação acabaram. Escolha uma opção para continuar.</p></div>
      <div className="grid sm:grid-cols-2 gap-4">{CREDIT_PLANS.map(plan => {
        const url = checkoutUrl(import.meta.env?.[plan.env]);
        return <div key={plan.id} className={`rounded-2xl border p-5 flex flex-col gap-3 ${plan.id === 'unlimited' ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-white'}`}>
          {plan.id === 'unlimited' ? <InfinityIcon className="text-orange-600 w-7 h-7"/> : <Zap className="text-orange-600 w-7 h-7"/>}
          <h3 className="font-bold text-slate-900">{plan.name}</h3>
          <p className="text-3xl font-bold text-slate-900"><span className="text-sm">R$ </span>{plan.price}</p>
          <p className="text-xs text-slate-600 flex-1">{plan.description}</p>
          {url ? <a href={url} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm px-3 py-3 text-center">{plan.id === 'unlimited' ? 'Quero ilimitados' : 'Renovar 35 créditos'}</a>
            : <button disabled className="rounded-xl bg-slate-100 text-slate-500 font-semibold text-xs px-3 py-3">Pagamento em breve</button>}
        </div>;
      })}</div>
      <p className="text-xs text-slate-500">A seleção do plano não libera créditos. A renovação depende da confirmação do pagamento.</p>
      <button onClick={onClose} className="w-full text-sm font-semibold text-slate-600 py-2">Agora não</button>
    </div>
  </div>;
};
