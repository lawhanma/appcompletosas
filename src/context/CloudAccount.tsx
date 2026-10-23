import React, {createContext, useContext, useEffect, useState} from 'react';
import type {Session} from '@supabase/supabase-js';
import {supabase} from '../lib/supabase';
import {internalDb} from '../utils/internalDb';
import {AuthScreen} from '../components/AuthScreen';
import {getPresentationCode} from '../utils/presentationAccount';

export interface CloudProfile { id: string; full_name: string; phone: string; pix_key: string }
interface Membership { plan: 'standard' | 'vip'; active: boolean }
interface Account { unlimitedAiCredits: boolean; profile: CloudProfile; membership: Membership; updateProfile: (value: CloudProfile) => void; signOut: () => Promise<void> }
const AccountContext = createContext<Account | null>(null);
export const useCloudAccount = () => useContext(AccountContext);

export function CloudAccountGate({children}: {children: React.ReactNode}) {
  const [session, setSession] = useState<Session | null>(null);
  const [booting, setBooting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<CloudProfile | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [revision, setRevision] = useState(0);
  const [unlimitedAiCredits,setUnlimitedAiCredits]=useState(false);
  const [code, setCode] = useState('');
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let live = true;
    const {data} = supabase.auth.onAuthStateChange((_event, value) => {
      if (live) { setSession(value); setBooting(false); }
    });
    supabase.auth.getSession().then(({data, error}) => {
      if (!live) return;
      if (error) setError('Não foi possível recuperar sua sessão. Tente novamente.');
      setSession(data.session); setBooting(false);
    });
    return () => { live = false; data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let live = true;
    setProfile(null); setMembership(null); setUnlimitedAiCredits(false); setError('');
    if (!session) { setLoading(false); return; }
    setLoading(true);
    async function load() {
      const {data: identity, error: identityError} = await supabase!.auth.getUser();
      if (!live) return;
      if (identityError || !identity.user || identity.user.id !== session!.user.id) {
        setError('Não foi possível validar sua sessão. Entre novamente.'); setLoading(false); return;
      }
      const [p, m, credits] = await Promise.all([
        supabase!.from('profiles').select('id,full_name,phone,pix_key').eq('id', identity.user.id).single(),
        supabase!.from('memberships').select('plan,active').eq('user_id', identity.user.id).maybeSingle(),
        supabase!.from('ai_credit_entitlements').select('unlimited').eq('user_id',identity.user.id).maybeSingle(),
      ]);
      if (!live) return;
      if (p.error || m.error || credits.error) {
        setError('Não foi possível carregar sua conta. Tente novamente em instantes.');
      } else {
        setProfile(p.data); setMembership(m.data); setUnlimitedAiCredits(credits.data?.unlimited===true);
        if (m.data?.active) {
          // Cache de apresentação para telas existentes; não concede autorização.
          internalDb.clearSession();
          internalDb.saveSession({userEmail: identity.user.email || '', name: p.data.full_name,
            phone: p.data.phone, pixKey: p.data.pix_key, authenticated: true,
            isVip: m.data.plan === 'vip', purchaseCode: getPresentationCode(m.data.plan, identity.user.email)});
          localStorage.setItem('shopnext_profile_custom', JSON.stringify({name:p.data.full_name,phone:p.data.phone,pixKey:p.data.pix_key}));
        }
      }
      setLoading(false);
    }
    load().catch(() => { if (live) {setError('Falha de conexão. Tente novamente.'); setLoading(false);} });
    return () => {live = false;};
  }, [session?.access_token, revision]);

  if (!supabase) {
    if (import.meta.env.PROD) return <Notice title="Configuração pendente" text="Configure a conexão com o banco para disponibilizar a plataforma." />;
    return children;
  }
  const signOut = async () => {
    const {error} = await supabase.auth.signOut();
    if (error) {setError('Não foi possível encerrar a sessão. Tente novamente.'); return;}
    internalDb.clearSession(); setSession(null); setCode('');
  };
  if (booting || (session && (loading || (!profile && !error)))) return <Notice title="Carregando sua conta…" />;
  if (error) return <Notice title="Não foi possível conectar" text={error}>
    <button onClick={() => setRevision(v=>v+1)}>Tentar novamente</button>
    {session && <button onClick={signOut}>Sair da conta</button>}
  </Notice>;
  if (!session) return <AuthScreen onLoginSuccess={() => {}} />;
  if (!membership?.active) return <Notice title="Ative seu acesso" text="Sua conta foi criada. Informe o código de compra para liberar a plataforma.">
    <form onSubmit={async e => {
      e.preventDefault(); setActivating(true);
      try {
        const result = await supabase.rpc('redeem_access_code', {access_code:code.trim()});
        if (result.error || result.data !== true) {setError('Código inválido ou indisponível. Confira o código; após várias tentativas, aguarde 15 minutos.');}
        else {setCode('');setRevision(v=>v+1);}
      } catch {setError('Não foi possível validar o código. Tente novamente.');}
      finally {setActivating(false);}
    }} className="space-y-3">
      <input aria-label="Código de compra" autoComplete="off" required maxLength={128} value={code} onChange={e=>setCode(e.target.value)} className="border rounded-lg p-3 w-full" />
      <button disabled={activating} className="bg-[#EE4D2D] text-white p-3 rounded-lg w-full">{activating?'Validando…':'Ativar acesso'}</button>
    </form>
    <button onClick={signOut}>Sair da conta</button>
  </Notice>;
  return <AccountContext.Provider value={{unlimitedAiCredits,profile:profile!,membership,updateProfile:setProfile,signOut}}>
    <React.Fragment key={session.user.id}>{children}</React.Fragment>
  </AccountContext.Provider>;
}

function Notice({title,text,children}: {title:string;text?:string;children?:React.ReactNode}) {
  return <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6"><section className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 space-y-4">
    <h1 className="text-xl font-bold">{title}</h1>{text&&<p className="text-sm text-slate-600" role="status">{text}</p>}{children}
  </section></main>;
}
