import {useRef,useState} from 'react';
import {PromotionAward,usePromotionRewards} from '../context/PromotionRewards';
export function usePromotionCampaign(){
 const rewards=usePromotionRewards(),id=useRef<string|null>(null),lock=useRef(false);
 const [award,setAward]=useState<PromotionAward|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function start(profile:string,product:string){
  if(lock.current)return false;
  if(id.current){setError('Confirme o registro anterior antes de iniciar outra divulgação.');return false;}
  if(rewards?.loading||rewards?.error){setError('Aguarde a consulta das comissões ou atualize a página.');return false;}
  setAward(null);setError('');id.current=null;
  if(!rewards?.wallet.enabled)return true;
  lock.current=true;setBusy(true);
  try{id.current=await rewards.begin(profile,product);return true;}catch(e){setError((e as Error).message);return false;}finally{lock.current=false;setBusy(false);}
 }
 async function complete(){
  if(!id.current||!rewards||lock.current)return;
  lock.current=true;setBusy(true);setError('');
  try{setAward(await rewards.complete(id.current));id.current=null;}catch(e){setError((e as Error).message);}finally{lock.current=false;setBusy(false);}
 }
 return {start,complete,award,error,busy,enabled:!!rewards?.wallet.enabled,unconfirmed:!!id.current};
}
