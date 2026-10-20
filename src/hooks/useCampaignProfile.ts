import {useEffect,useRef,useState} from 'react';
import {supabase} from '../lib/supabase';
import {useCloudAccount} from '../context/CloudAccount';
import {AffiliateProfile} from '../utils/affiliateProfiles';
import {CampaignProfile,resolveCampaignProfile} from '../utils/campaignProfile';
export type {CampaignProfile} from '../utils/campaignProfile';

export function useCampaignProfile() {
  const owner=useCloudAccount()?.profile.id;
  const [profiles,setProfiles]=useState<AffiliateProfile[]>([]),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState('');
  const version=useRef(0);
  async function reload(){
    const request=++version.current;setLoading(true);setLoadError('');
    if(!owner||!supabase){setProfiles([]);setLoading(false);setLoadError('Entre na sua conta para selecionar um perfil.');return;}
    try{
      const result=await supabase.from('affiliate_profiles').select('*').eq('user_id',owner).eq('archived',false).order('name');
      if(result.error)throw result.error;
      if(request===version.current)setProfiles(result.data);
    }catch{if(request===version.current){setProfiles([]);setLoadError('Não foi possível carregar os perfis. Atualize e tente novamente.');}}
    finally{if(request===version.current)setLoading(false);}
  }
  useEffect(()=>{setProfiles([]);onChangeValue('');setError('');void reload();return()=>{version.current++;};},[owner]);
  const [value,onChangeValue]=useState(''),[error,setError]=useState('');
  const select=(id:string)=>{onChangeValue(id);setError('');};
  function requireProfile():CampaignProfile|null {
    try {const profile=resolveCampaignProfile(profiles,value,loading,loadError);setError('');return profile;}
    catch(e){setError(e instanceof Error?e.message:'Não foi possível selecionar o perfil.');return null;}
  }
  return {fieldProps:{profiles,value,onChange:select,loading,error:loadError||error,onReload:()=>{void reload();}},requireProfile};
}
