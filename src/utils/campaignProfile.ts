import {AffiliateProfile,PLATFORM_NAMES} from './affiliateProfiles';
export interface CampaignProfile {id:string;name:string;label:string}
export function resolveCampaignProfile(profiles:AffiliateProfile[],id:string,loading:boolean,error:string):CampaignProfile {
  if(loading)throw new Error('Aguarde o carregamento dos perfis.');
  if(error)throw new Error(error);
  const p=profiles.find(p=>p.id===id&&!p.archived);
  if(!p)throw new Error('Selecione um perfil ativo para iniciar a divulgação.');
  return {id:p.id,name:p.name,label:`${p.name} · ${PLATFORM_NAMES[p.platform]} · @${p.handle.replace(/^@+/,'')}`};
}
