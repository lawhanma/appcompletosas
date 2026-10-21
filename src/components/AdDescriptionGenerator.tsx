import React,{useId,useState} from 'react';
import {Copy,Check,Sparkles} from 'lucide-react';
import {Product} from '../types';
import {generateAdDescription} from '../utils/adDescription';

export const AdDescriptionGenerator:React.FC<{product:Product}>=({product})=>{
  const id=useId();
  const [text,setText]=useState(''),[copied,setCopied]=useState(false),[message,setMessage]=useState('');
  async function copy(){try{await navigator.clipboard.writeText(text);setCopied(true);setMessage('Descrição copiada!');}catch{setMessage('Não foi possível copiar. Selecione o texto e copie manualmente.');}}
  return <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3" aria-label="Descrição para anúncio">
    <div><h3 className="text-sm font-semibold text-slate-900">Uma descrição pronta para divulgar</h3><p className="text-xs text-slate-500 mt-1">{product.name}</p></div>
    <button type="button" onClick={()=>{setText(generateAdDescription(product));setCopied(false);setMessage('Descrição gerada. Você pode editar antes de copiar.');}} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white w-full sm:w-auto"><Sparkles className="w-4 h-4"/>Gerar descrição para anúncio</button>
    {text&&<div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-medium text-slate-700">Descrição do anúncio</label>
      <textarea id={id} value={text} onChange={e=>{setText(e.target.value);setCopied(false);setMessage('');}} rows={12} className="w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 focus:outline-none focus:border-orange-500"/>
      <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-slate-500">Edite o texto como preferir e adicione seu link de afiliado.</p><button type="button" onClick={copy} className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-700 hover:text-orange-800">{copied?<Check className="w-4 h-4"/>:<Copy className="w-4 h-4"/>}{copied?'Copiado':'Copiar descrição'}</button></div>
    </div>}
    <p role="status" className="text-xs text-slate-600">{message}</p>
  </section>;
}
