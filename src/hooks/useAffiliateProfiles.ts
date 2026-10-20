import {useEffect,useRef,useState} from 'react';
import {PROFILE_MEDIA_BUCKET,ProfileMediaInput,checkImageFile} from '../utils/profileMedia';
import {supabase} from '../lib/supabase';
import {useCloudAccount} from '../context/CloudAccount';
import {AffiliateProfile,ProfileSale,ProfileInput,SaleInput,validateProfile,validateSale} from '../utils/affiliateProfiles';

export interface ProfilesStore {profiles:AffiliateProfile[];sales:ProfileSale[];loading:boolean;error:string;reload:()=>Promise<void>;saveProfile:(input:ProfileInput,id?:string,media?:ProfileMediaInput)=>Promise<void>;saveSale:(input:SaleInput)=>Promise<void>;voidSale:(id:string)=>Promise<void>}
export function useAffiliateProfiles():ProfilesStore {
  const account=useCloudAccount(); const owner=account?.profile.id;
  const [profiles,setProfiles]=useState<AffiliateProfile[]>([]),[sales,setSales]=useState<ProfileSale[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const version=useRef(0);
  async function reload() {
    const request=++version.current;setError('');setLoading(true);
    if(!owner||!supabase){setProfiles([]);setSales([]);setLoading(false);setError('Entre na sua conta para carregar seus perfis.');return;}
    try {
      const p=await supabase.from('affiliate_profiles').select('*').eq('user_id',owner).order('created_at',{ascending:false});
      if(p.error)throw p.error;
      const paths=[...new Set(p.data.flatMap(row=>[row.avatar_path,row.banner_path]).filter(Boolean))] as string[];
      const signed=paths.length?await supabase.storage.from(PROFILE_MEDIA_BUCKET).createSignedUrls(paths,3600):null;
      if(signed?.error)throw signed.error;
      const urls=new Map((signed?.data||[]).map(item=>[item.path,item.signedUrl]));
      const enriched=p.data.map(row=>({...row,avatar_url:urls.get(row.avatar_path)||'',banner_url:urls.get(row.banner_path)||''}));
      const all:ProfileSale[]=[];
      for(let offset=0;;offset+=500) {
        const page=await supabase.from('affiliate_profile_sales').select('*').eq('user_id',owner).order('created_at').order('id').range(offset,offset+499);
        if(page.error)throw page.error;all.push(...page.data);
        if(page.data.length<500)break;
      }
      if(request===version.current){setProfiles(enriched);setSales(all);}
    } catch {if(request===version.current)setError('Não foi possível carregar seus perfis. Tente novamente.');}
    finally {if(request===version.current)setLoading(false);}
  }
  useEffect(()=>{setProfiles([]);setSales([]);void reload();const refresh=()=>{if(document.visibilityState==='visible')void reload();};const timer=window.setInterval(refresh,45*60*1000);document.addEventListener('visibilitychange',refresh);return()=>{version.current++;window.clearInterval(timer);document.removeEventListener('visibilitychange',refresh);};},[owner]);
  function client(){if(!supabase||!owner)throw new Error('Entre na sua conta para salvar.');return supabase;}
  async function saveProfile(input:ProfileInput,id?:string,media:ProfileMediaInput={}){
    const value=validateProfile(input),db=client(),uploaded:string[]=[];
    const paths:Record<string,string>={};
    try {
      for(const [kind,file] of [['avatar',media.avatar],['banner',media.banner]] as const){
        if(!file)continue;await checkImageFile(file);
        const ext=file.type==='image/jpeg'?'jpg':file.type==='image/png'?'png':'webp';
        const path=`${owner}/${kind}-${crypto.randomUUID()}.${ext}`;
        const up=await db.storage.from(PROFILE_MEDIA_BUCKET).upload(path,file,{contentType:file.type,upsert:false});
        if(up.error)throw new Error('Não foi possível enviar a imagem. Tente novamente.');
        uploaded.push(path);paths[`${kind}_path`]=path;
      }
      if(media.removeAvatar&&!media.avatar)paths.avatar_path='';
      if(media.removeBanner&&!media.banner)paths.banner_path='';
      const row={...value,...paths};
      const q=id?db.from('affiliate_profiles').update(row).eq('id',id).eq('user_id',owner):db.from('affiliate_profiles').insert({...row,user_id:owner});
      const result=await q.select('id').single();if(result.error)throw new Error('Não foi possível salvar o perfil. Tente novamente.');
    }catch(error){if(uploaded.length)await db.storage.from(PROFILE_MEDIA_BUCKET).remove(uploaded);throw error;}
    await reload();
  }
  async function saveSale(input:SaleInput){
    const value=validateSale(input);if(!profiles.some(p=>p.id===input.profile_id&&!p.archived))throw new Error('Selecione um perfil ativo.');
    const result=await client().from('affiliate_profile_sales').insert({...value,user_id:owner}).select('id').single();
    if(result.error)throw new Error(result.error.code==='23505'?'Este pedido já foi registrado neste perfil.':'Não foi possível salvar a venda. Tente novamente.');await reload();
  }
  async function voidSale(id:string){const r=await client().from('affiliate_profile_sales').update({voided:true}).eq('user_id',owner).eq('id',id).select('id').single();if(r.error)throw new Error('Não foi possível cancelar o registro.');await reload();}
  return {profiles,sales,loading,error,reload,saveProfile,saveSale,voidSale};
}
