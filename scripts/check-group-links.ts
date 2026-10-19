import assert from 'node:assert/strict';
import { normalizeGroupLink } from '../src/utils/groupLink';
import { OFFER_GROUPS } from '../src/data/facebookGroups';

assert.equal(normalizeGroupLink('chat.whatsapp.com/invite/FOWKuJKkkKvDPKKEte2O4h', 'whatsapp'), 'https://chat.whatsapp.com/FOWKuJKkkKvDPKKEte2O4h');
assert.equal(normalizeGroupLink('https://t.me/vendas_online01', 'telegram'), 'https://t.me/vendas_online01');
assert.equal(normalizeGroupLink('https://www.facebook.com/groups/123456789/', 'facebook'), 'https://www.facebook.com/groups/123456789/');
for (const bad of ['javascript:alert(1)', 'https://chat.whatsapp.com/achadinhosshopeevip01', 'https://t.me.evil.test/vendas_online01', 'https://user:pass@t.me/vendas_online01', 'https://t.me/vendas_online01/123', 'https://facebook.com/groups/search/', 'http://t.me/vendas_online01']) {
  assert.equal(normalizeGroupLink(bad), null, bad);
}
assert.equal(normalizeGroupLink('https://t.me/vendas_online01', 'whatsapp'), null);
assert.equal(new Set(OFFER_GROUPS.map(g => g.groupUrl)).size, OFFER_GROUPS.length);
for (const group of OFFER_GROUPS) {
  assert.ok(normalizeGroupLink(group.groupUrl, group.platform));
  assert.ok(group.sourceUrl && group.lastCheckedAt);
  assert.equal(group.conversionRate, undefined);
}
console.log('Group link validation passed');
