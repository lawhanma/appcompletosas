import React,{createContext,useContext,useEffect,useRef,useState} from 'react';
import {supabase} from '../lib/supabase';
import {useCloudAccount} from './CloudAccount';
export interface PromotionAward {id:string;amount_cents:number;available_at:string|null;completed_at:string}
export interface PromotionItem extends PromotionAward {profile_id:string;profile_name:string;product:string}
export interface PromotionWithdrawal {id:string;amount_cents:number;status:'requested'|'paid'|'rejected';created_at:string;paid_at:string|null}
export interface PromotionWallet {enabled:boolean;server_now:string;campaign_count:number;earned_today_cents:number;pending_cents:number;available_cents:number;requested_cents:number;items:PromotionItem[];withdrawals:PromotionWithdrawal[]}
const empty=():PromotionWallet=>({enabled:false,server_now:'',campaign_count:0,earned_today_cents:0,pending_cents:0,available_cents:0,requested_cents:0,items:[],withdrawals:[]});
interface Rewards {wallet:PromotionWallet;loading:boolean;error:string;reload:()=>Promise<void>;begin:(profile:string,product:string)=>Promise<string>;complete:(id:string)=>Promise<PromotionAward>;withdraw:(id:string,cents:number,pix:string)=>Promise<void>}
const Context=createContext<Rewards|null>(null);
export const usePromotionRewards=()=>useContext(Context);
export function PromotionRewardsProvider({children}:{children:React.ReactNode}){
 const account=useCloudAccount();
 return <AccountRewards key={account?.profile.id||'none'} owner={account?.profile.id} >{children}</AccountRewards>;
}
const AccountRewards:React.FC<{children:React.ReactNode;owner?:string}>=({children,owner})=>{
 const [wallet,setWallet]=useState(empty),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const live=useRef(true),revision=useRef(0);
 async function reload(){const request=++revision.current;if(!owner||!supabase){setLoading(false);return;}
  try{const result=await supabase.rpc('get_promotion_wallet');if(result.error)throw result.error;if(live.current&&request===revision.current){setWallet(result.data);setError('');}}
  catch{if(live.current&&request===revision.current)setError('Não foi possível consultar as comissões promocionais. Tente atualizar.');}
  finally{if(live.current&&request===revision.current)setLoading(false);}
 }
 useEffect(()=>{live.current=true;void reload();const refresh=()=>{if(document.visibilityState==='visible')void reload();};const timer=window.setInterval(refresh,60000);document.addEventListener('visibilitychange',refresh);return()=>{live.current=false;revision.current++;clearInterval(timer);document.removeEventListener('visibilitychange',refresh);};},[owner]);
 function client(){if(!owner||!supabase)throw new Error('Entre na sua conta para continuar.');return supabase;}
 async function begin(profile:string,product:string){const id=crypto.randomUUID();const result=await client().rpc('start_promotion_campaign',{campaign_id:id,profile_id_:profile,product_:product});if(result.error)throw new Error('Não foi possível iniciar o registro da comissão promocional. Tente novamente.');return id;}
 async function complete(id:string){const result=await client().rpc('complete_promotion_campaign',{campaign_id:id});if(result.error)throw new Error('Não foi possível confirmar a comissão. Aguarde alguns segundos e tente novamente.');await reload();return result.data as PromotionAward;}
 async function withdraw(id:string,cents:number,pix:string){const result=await client().rpc('request_promotion_withdrawal',{request_id:id,amount_cents_:cents,pix_key_:pix});if(result.error)throw new Error('Não foi possível solicitar o saque. Atualize o saldo e confira os dados informados.');await reload();}
 return <Context.Provider value={{wallet,loading,error,reload,begin,complete,withdraw}}>{children}</Context.Provider>;
};
