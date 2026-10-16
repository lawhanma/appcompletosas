import {supabase} from './supabase';

export async function apiFetch(url: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (supabase) {
    const {data,error} = await supabase.auth.getSession();
    if (error || !data.session) throw new Error('Entre novamente para continuar.');
    headers.set('Authorization', `Bearer ${data.session.access_token}`);
  }
  return fetch(url, {...init, headers});
}
