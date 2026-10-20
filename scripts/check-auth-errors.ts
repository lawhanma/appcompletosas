import assert from 'node:assert/strict';
import {authErrorMessage} from '../src/utils/authError';

for (const code of ['user_already_exists', 'email_exists']) {
  const message = authErrorMessage({code, status:422}, true);
  assert.ok(message.includes('já tem uma conta'));
  assert.ok(message.includes('Entrar'));
}
assert.ok(authErrorMessage({code:'invalid_credentials'}, false).includes('código de compra não é a senha'));
assert.ok(authErrorMessage({code:'over_request_rate_limit', status:429}, true).includes('Aguarde'));
assert.ok(authErrorMessage({status:503}, true).includes('temporariamente indisponível'));
assert.ok(!authErrorMessage({code:'unexpected_failure', status:500}, true).includes('não autorizado'));
console.log('Auth error handling checks passed');
