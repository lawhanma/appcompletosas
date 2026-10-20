import React,{useState,useEffect} from 'react';
import {ImagePlus,X} from 'lucide-react';
import {checkImageFile} from '../utils/profileMedia';

export const ProfileImageField:React.FC<{kind:'avatar'|'banner';url?:string;disabled:boolean}>=({kind,url,disabled})=>{
  const [file,setFile]=useState<File|null>(null),[removed,setRemoved]=useState(false),[error,setError]=useState(''),[preview,setPreview]=useState(''),[checking,setChecking]=useState(false);
  useEffect(()=>{if(!file){setPreview('');return;}const u=URL.createObjectURL(file);setPreview(u);return()=>URL.revokeObjectURL(u);},[file]);
  const shown=preview||(!removed?url:'');const title=kind==='avatar'?'Foto de perfil':'Banner do perfil';
  return <div className="space-y-2" data-checking={checking?'true':undefined}><p className="text-xs font-medium">{title}</p><div className={`relative overflow-hidden border border-dashed border-slate-300 bg-slate-50 ${kind==='avatar'?'w-24 h-24 rounded-2xl':'w-full h-24 rounded-xl'}`}>
    {shown?<img src={shown} alt={`Prévia: ${title}`} className="w-full h-full object-cover"/>:<div className="h-full flex items-center justify-center text-slate-300"><ImagePlus className="w-6 h-6"/></div>}
  </div><label className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 cursor-pointer hover:bg-slate-50 focus-within:ring-2 focus-within:ring-orange-100">{checking?'Conferindo imagem…':shown?'Trocar imagem':'Escolher imagem'}<input type="file" name={`${kind}File`} accept="image/jpeg,image/png,image/webp" disabled={disabled||checking} aria-label={`Selecionar ${title.toLowerCase()}`} className="sr-only" onChange={async e=>{
    const input=e.currentTarget,next=input.files?.[0];setError('');if(!next)return;setChecking(true);
    try{await checkImageFile(next);setFile(next);setRemoved(false);}catch(err){input.value='';setFile(null);setError(err instanceof Error?err.message:'Arquivo inválido.');}finally{setChecking(false);}
  }}/></label>
  {shown&&<button type="button" disabled={disabled||checking} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-rose-600" onClick={e=>{setFile(null);setRemoved(true);setError('');const f=e.currentTarget.closest('div.space-y-2')?.querySelector('input[type=file]') as HTMLInputElement | null;if(f)f.value='';}}><X className="w-3 h-3"/>Remover imagem</button>}
  <input type="hidden" name={kind==='avatar'?'removeAvatar':'removeBanner'} value={removed?'yes':''}/>
  {error&&<p role="alert" className="text-xs text-rose-600">{error}</p>}
  <p className="text-[10px] text-slate-400">JPG, PNG ou WebP · até 5 MB{kind==='banner'?' · recomendado 1200 × 400 px':' · recomendado 400 × 400 px'}</p>
  </div>;
};
