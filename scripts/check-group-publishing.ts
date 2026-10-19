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
assert.ok(page.includes('Afiliado Shopee Iniciante / Divulgue seu Link'));
assert.ok(page.includes('21 Grupos Mapeados'));
assert.ok(page.includes('Seu link de afiliado'));
assert.ok(!page.includes('Disparo Automático'));
const facebook = OFFER_GROUPS.filter(g => g.platform === 'facebook');
assert.equal(facebook.length, 21);
for (const group of facebook) {assert.equal(group.isPublic, true);assert.equal(group.lastCheckedAt, '2026-10-19');}
console.log('Group publishing render checks passed');
