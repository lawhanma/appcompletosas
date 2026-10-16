import {config} from 'dotenv';
config({path:'.env.local',quiet:true});
const url=process.env.VITE_SUPABASE_URL;
const key=process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error('Missing Supabase configuration');
const settings=await fetch(`${url}/auth/v1/settings`,{headers:{apikey:key}});
if (!settings.ok) throw new Error(`Auth connection failed: ${settings.status}`);
const data=await settings.json();
console.log('Supabase Auth: connected. Email confirmation:',data.mailer_autoconfirm===false?'required':'check dashboard');
const profiles=await fetch(`${url}/rest/v1/profiles?select=id`,{headers:{apikey:key}});
if (![401,403].includes(profiles.status)) throw new Error(`Anonymous profile access not denied: ${profiles.status}`);
console.log('Anonymous profile reads: denied');
const activation=await fetch(`${url}/rest/v1/rpc/redeem_access_code`,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({access_code:'invalid-test-code'})});
if (![401,403,404].includes(activation.status)) throw new Error(`Anonymous activation not denied: ${activation.status}`);
console.log('Anonymous license activation: denied');
for (const headers of [{},{Authorization:'Bearer invalid-test-token'}]) {
  const response=await fetch('http://localhost:3000/api/ai/generate-copy',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:'{}'});
  if (response.status!==401) throw new Error(`Unauthenticated AI request not denied: ${response.status}`);
}
console.log('AI endpoints: missing and invalid sessions rejected');
