import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {CreditRenewalModal, CREDIT_PLANS} from '../src/components/CreditRenewalModal';

assert.equal(CREDIT_PLANS.length, 2);
const html = renderToStaticMarkup(React.createElement(CreditRenewalModal, {onClose() {}}));
for (const label of ['Créditos ilimitados', '35 créditos', '64,90', '34,90', 'role="dialog"', 'Agora não']) assert.ok(html.includes(label), label);
assert.equal((html.match(/Pagamento em breve/g) || []).length, 2);
assert.ok(!html.includes('<a '), 'No invented payment destinations when checkout is missing');
assert.ok(html.includes('não libera créditos'));
console.log('Credit renewal render checks passed');
