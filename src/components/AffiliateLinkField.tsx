import React, {useId} from 'react';
export function AffiliateLinkField({value,onChange,error,disabled}: {
  value: string; onChange: (value: string) => void; error?: string; disabled?: boolean;
}) {
  const id = useId();
  return <div className="rounded-xl bg-orange-50 border border-orange-100 p-4 space-y-2">
    <label htmlFor={id} className="block text-sm font-semibold text-slate-900">Seu link de afiliado <span className="text-[#EE4D2D]">*</span></label>
    <input id={id} type="url" required maxLength={2048} autoComplete="off" disabled={disabled}
      value={value} onChange={e=>onChange(e.target.value)} placeholder="https://seu-link-de-afiliado..."
      aria-invalid={!!error} aria-describedby={`${id}-help${error?` ${id}-error`:''}`}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#EE4D2D] disabled:opacity-60"/>
    <p id={`${id}-help`} className="text-xs text-slate-600 leading-relaxed">Cole o link deste produto gerado na sua conta de afiliado. Esse endereço será incluído nos textos da campanha.</p>
    {error&&<p id={`${id}-error`} role="alert" className="text-xs font-medium text-red-700">{error}</p>}
  </div>;
}
