import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {CreditRenewalModal, CREDIT_PLANS, UNLIMITED_CHECKOUT_URL} from '../src/components/CreditRenewalModal';

assert.equal(CREDIT_PLANS.length, 2);
const html = renderToStaticMarkup(React.createElement(CreditRenewalModal, {onClose() {}}));
for (const label of ['Créditos ilimitados', '35 créditos', '64,90', '34,90', 'role="dialog"', 'Agora não']) assert.ok(html.includes(label), label);
assert.equal((html.match(new RegExp(`href=\"${UNLIMITED_CHECKOUT_URL}\"`, 'g')) || []).length, 2);
assert.ok(html.includes('Indisponível. Apenas os créditos ilimitados estão disponíveis por R$ 64,90.'));
assert.ok(!html.includes('Renovar 35 créditos'));
assert.ok(html.includes('Ir para ilimitados · R$ 64,90'));
assert.ok(html.includes('não libera créditos'));
console.log('Credit renewal render checks passed');
