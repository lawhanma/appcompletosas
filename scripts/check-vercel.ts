import assert from 'node:assert/strict';
import {createServer} from 'node:http';
process.env.VERCEL = '1';
const {default: app} = await import('../api/handler');
const server = createServer(app);
await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
try {
  const address = server.address();
  assert(address && typeof address !== 'string');
  const url = `http://127.0.0.1:${address.port}`;
  const health = await fetch(`${url}/api/health`);
  assert.equal(health.status,200);
  assert.equal((await health.json()).status,'ok');
  const response = await fetch(`${url}/api/ai/generate-copy`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
  assert.equal(response.status,process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 401 : 503);
  console.log('Vercel entry point, health endpoint and unauthenticated AI protection passed.');
} finally {await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
