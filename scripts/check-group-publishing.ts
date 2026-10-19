import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GroupPublishingQueue } from '../src/components/GroupPublishingQueue';
import { GruposOfertasView } from '../src/components/GruposOfertasView';
import { OFFER_GROUPS } from '../src/data/facebookGroups';

const queue = renderToStaticMarkup(React.createElement(GroupPublishingQueue, {
  groups: OFFER_GROUPS, text: 'https://s.shopee.com.br/example?tracking=mine', ready: true, onClose() {},
}));
assert.ok(queue.includes('https://s.shopee.com.br/example?tracking=mine'));
assert.ok(queue.includes('2. Abrir grupo'));
assert.ok(queue.includes('não envia automaticamente'));
const blocked = renderToStaticMarkup(React.createElement(GroupPublishingQueue, {
  groups: OFFER_GROUPS, text: '', ready: false, onClose() {},
}));
assert.ok(!blocked.includes('2. Abrir grupo'));
assert.ok(blocked.includes('informe seu link de afiliado'));
const page = renderToStaticMarkup(React.createElement(GruposOfertasView));
assert.ok(page.includes('Shopee Brasil compras'));
assert.ok(page.includes('Regras e privacidade pendentes'));
assert.ok(page.includes('Seu link de afiliado'));
assert.ok(!page.includes('Disparo Automático'));
for (const group of OFFER_GROUPS.filter(g => g.platform === 'facebook')) assert.equal(group.isPublic, undefined);
console.log('Group publishing render checks passed');
