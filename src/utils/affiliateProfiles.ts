export const PLATFORMS = ['instagram','tiktok','facebook','whatsapp','telegram','kwai','youtube'] as const;
export type Platform = typeof PLATFORMS[number];
export const PLATFORM_NAMES: Record<Platform,string> = {instagram:'Instagram',tiktok:'TikTok',facebook:'Facebook',whatsapp:'WhatsApp',telegram:'Telegram',kwai:'Kwai',youtube:'YouTube'};
export const COLORS = ['orange','slate','rose','blue','green','violet'] as const;
export type ProfileColor = typeof COLORS[number];
export interface AffiliateProfile {id:string;user_id:string;name:string;platform:Platform;handle:string;url:string;color:ProfileColor;archived:boolean;created_at:string}
export type ProfileInput = Pick<AffiliateProfile,'name'|'platform'|'handle'|'url'|'color'|'archived'>;
export interface ProfileSale {id:string;user_id:string;profile_id:string;product:string;sold_on:string;gross:number;commission:number;order_ref:string;voided:boolean;source:'manual';created_at:string}
export type SaleInput = Pick<ProfileSale,'profile_id'|'product'|'sold_on'|'gross'|'commission'|'order_ref'>;
export function brDay(now = new Date()) {return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
export function periodStart(period:'month'|'30'|'all', today=brDay()) {
  if(period==='all') return '';
  if(period==='month') return `${today.slice(0,7)}-01`;
  const d=new Date(`${today}T12:00:00Z`);d.setUTCDate(d.getUTCDate()-29);return d.toISOString().slice(0,10);
}
export function profileMetrics(sales:ProfileSale[], profileId?:string, start='', end=brDay()) {
  const rows=sales.filter(s=>!s.voided && (!profileId||s.profile_id===profileId) && s.sold_on>=start && s.sold_on<=end);
  const gross=rows.reduce((n,s)=>n+Math.round(Number(s.gross)*100),0)/100;
  const commission=rows.reduce((n,s)=>n+Math.round(Number(s.commission)*100),0)/100;
  return {gross,commission,count:rows.length,ticket:rows.length?gross/rows.length:0,rows};
}
export function parseMoney(value:string):number|null {
  const v=value.trim(); if(!/^\d+(?:[.,]\d{1,2})?$/.test(v)) return null;
  const n=Number(v.replace(',','.'));return Number.isFinite(n)&&n<1e10?n:null;
}
export function validateProfile(input:ProfileInput):ProfileInput {
  const name=input.name.trim(), handle=input.handle.trim().replace(/^@+/,''), url=input.url.trim();
  if(!name||name.length>60||handle.length>100||!PLATFORMS.includes(input.platform)||!COLORS.includes(input.color)) throw new Error('Confira o nome e a plataforma do perfil.');
  if(!handle) throw new Error('Informe o @ ou a identificação do perfil.');
  if(url) {try {const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password)throw 0;}catch{throw new Error('Use um link válido começando com https://.');}}
  return {...input,name,handle,url};
}
export function validateSale(input:SaleInput):SaleInput {
  if(!input.product.trim()||input.product.trim().length>120||!/^\d{4}-\d{2}-\d{2}$/.test(input.sold_on)||(Number.isNaN(Date.parse(input.sold_on)) || new Date(input.sold_on).toISOString().slice(0,10)!==input.sold_on)||input.sold_on>brDay()||!Number.isFinite(input.gross)||input.gross<=0||!Number.isFinite(input.commission)||input.commission<0||input.commission>input.gross||input.order_ref.length>100) throw new Error('Confira a data e os valores. A comissão deve ficar entre zero e o valor da venda.');
  return {...input,product:input.product.trim(),order_ref:input.order_ref.trim()};
}
