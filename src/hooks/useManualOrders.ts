import {useEffect,useState,useCallback} from 'react';
import {supabase} from '../lib/supabase';
import {useCloudAccount} from '../context/CloudAccount';
export interface ManualOrder {id:string;order_ref:string;product:string;quantity:number;status:'registered'|'dispatched'|'cancelled';created_at:string;customer_email?:string;customer_name?:string}
export function useOrdersAdmin(){
 const owner=useCloudAccount()?.profile.id;const [allowed,setAllowed]=useState(false);
 useEffect(()=>{let live=true;setAllowed(false);if(owner&&supabase)void supabase.rpc('is_shopgo_orders_admin').then(({data,error})=>{if(live)setAllowed(!error&&data===true);});return()=>{live=false;};},[owner]);
 return allowed;
}
export function useManualOrders(){
 const owner=useCloudAccount()?.profile.id;const [data,setData]=useState<{total:number;items:ManualOrder[]}>({total:0,items:[]});const [error,setError]=useState('');
 const reload=useCallback(async()=>{if(!owner||!supabase)return;const result=await supabase.rpc('get_customer_orders');if(result.error){setError('Não foi possível consultar os pedidos.');return;}setData(result.data);setError('');},[owner]);
 useEffect(()=>{setData({total:0,items:[]});void reload();const timer=window.setInterval(()=>{if(document.visibilityState==='visible')void reload();},30000);return()=>clearInterval(timer);},[reload]);
 return {...data,error,reload};
}
