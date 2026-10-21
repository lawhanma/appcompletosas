import {useEffect,useRef,useState} from 'react';
import {supabase} from '../lib/supabase';
import {useCloudAccount} from '../context/CloudAccount';
export type ChannelType='shopee'|'tiktok'|'mercadolivre';
type Connection={isConnected:boolean;name:string;email:string};
export type Connections=Record<ChannelType,Connection>;
const empty=():Connections=>({shopee:{isConnected:false,name:'',email:''},tiktok:{isConnected:false,name:'',email:''},mercadolivre:{isConnected:false,name:'',email:''}});
export interface ConnectionsStore {connections:Connections;loading:boolean;error:string;reload:()=>Promise<void>;save:(channel:ChannelType,name:string,email:string)=>Promise<void>;disconnect:(channel:ChannelType)=>Promise<void>}
export function useChannelConnections():ConnectionsStore {
  const owner=useCloudAccount()?.profile.id;
  const [connections,setConnections]=useState(empty),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const version=useRef(0);
  async function reload(){
    const request=++version.current;setLoading(true);setError('');
    if(!owner||!supabase){setConnections(empty());setLoading(false);setError('Entre na sua conta para salvar as configurações.');return;}
    try{
      const result=await supabase.from('channel_connections').select('channel,name,email,enabled').eq('user_id',owner);
      if(result.error)throw result.error;
      const next=empty();for(const row of result.data){if(row.channel in next)next[row.channel as ChannelType]={isConnected:row.enabled,name:row.name,email:row.email};}
      if(request===version.current)setConnections(next);
    }catch{if(request===version.current)setError('Não foi possível carregar suas configurações. Tente novamente.');}
    finally{if(request===version.current)setLoading(false);}
  }
  useEffect(()=>{setConnections(empty());void reload();return()=>{version.current++;};},[owner]);
  async function save(channel:ChannelType,name:string,email:string){
    name=name.trim();email=email.trim();
    if(!owner||!supabase)throw new Error('Entre na sua conta para salvar.');
    if(!name||name.length>100||email.length>254||!/^\S+@\S+\.\S+$/.test(email))throw new Error('Confira o nome e o e-mail informados.');
    const request=version.current;
    const result=await supabase.from('channel_connections').upsert({user_id:owner,channel,name,email,enabled:true},{onConflict:'user_id,channel'}).select('channel').single();
    if(result.error)throw new Error('Não foi possível salvar. Confira sua conexão e tente novamente.');
    if(request===version.current)setConnections(prev=>({...prev,[channel]:{isConnected:true,name,email}}));
  }
  async function disconnect(channel:ChannelType){
    if(!owner||!supabase)throw new Error('Entre na sua conta para alterar.');
    const request=version.current;
    const result=await supabase.from('channel_connections').update({enabled:false}).eq('user_id',owner).eq('channel',channel).select('channel').single();
    if(result.error)throw new Error('Não foi possível desconectar. Tente novamente.');
    if(request===version.current)setConnections(prev=>({...prev,[channel]:{...prev[channel],isConnected:false}}));
  }
  return {connections,loading,error,reload,save,disconnect};
}
