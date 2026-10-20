import {useEffect,useRef,useState} from 'react';
import {supabase} from '../lib/supabase';
import {useCloudAccount} from '../context/CloudAccount';
import {AffiliateProfile,ProfileSale,ProfileInput,SaleInput,validateProfile,validateSale} from '../utils/affiliateProfiles';

export interface ProfilesStore {profiles:AffiliateProfile[];sales:ProfileSale[];loading:boolean;error:string;reload:()=>Promise<void>;saveProfile:(input:ProfileInput,id?:string)=>Promise<void>;saveSale:(input:SaleInput)=>Promise<void>;voidSale:(id:string)=>Promise<void>}
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
      const all:ProfileSale[]=[];
      for(let offset=0;;offset+=500) {
        const page=await supabase.from('affiliate_profile_sales').select('*').eq('user_id',owner).order('created_at').order('id').range(offset,offset+499);
        if(page.error)throw page.error;all.push(...page.data);
        if(page.data.length<500)break;
      }
      if(request===version.current){setProfiles(p.data);setSales(all);}
    } catch {if(request===version.current)setError('Não foi possível carregar seus perfis. Tente novamente.');}
    finally {if(request===version.current)setLoading(false);}
  }
  useEffect(()=>{setProfiles([]);setSales([]);void reload();return()=>{version.current++;};},[owner]);
  function client(){if(!supabase||!owner)throw new Error('Entre na sua conta para salvar.');return supabase;}
  async function saveProfile(input:ProfileInput,id?:string){
    const value=validateProfile(input),db=client();
    const q=id?db.from('affiliate_profiles').update(value).eq('id',id).eq('user_id',owner):db.from('affiliate_profiles').insert({...value,user_id:owner});
    const result=await q.select('id').single();if(result.error)throw new Error('Não foi possível salvar o perfil. Tente novamente.');await reload();
  }
  async function saveSale(input:SaleInput){
    const value=validateSale(input);if(!profiles.some(p=>p.id===input.profile_id&&!p.archived))throw new Error('Selecione um perfil ativo.');
    const result=await client().from('affiliate_profile_sales').insert({...value,user_id:owner}).select('id').single();
    if(result.error)throw new Error(result.error.code==='23505'?'Este pedido já foi registrado neste perfil.':'Não foi possível salvar a venda. Tente novamente.');await reload();
  }
  async function voidSale(id:string){const r=await client().from('affiliate_profile_sales').update({voided:true}).eq('user_id',owner).eq('id',id).select('id').single();if(r.error)throw new Error('Não foi possível cancelar o registro.');await reload();}
  return {profiles,sales,loading,error,reload,saveProfile,saveSale,voidSale};
}
