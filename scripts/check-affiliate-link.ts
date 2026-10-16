import assert from 'node:assert/strict';
import {validateAffiliateLink} from '../src/utils/affiliateLink';
const link='https://s.shopee.com.br/Example?sub_id=meu%20canal&af_siteid=123#oferta';
assert.equal(validateAffiliateLink(`  ${link}  `),link);
assert.equal(validateAffiliateLink('https://example.com/product?ref=other-user'),'https://example.com/product?ref=other-user');
for (const invalid of ['', 'shopee.com.br', 'javascript:alert(1)', 'data:text/html,x', 'ftp://example.com/file','https://', 'https://user:password@example.com','https://example.com/invalid link','https://example.com/\ntracking','https://example.com/'+ 'a'.repeat(2048)]) {
  assert.equal(validateAffiliateLink(invalid),null,`accepted invalid link: ${invalid.slice(0,50)}`);
}
console.log('Affiliate tracking URL preservation and invalid/scripting link rejection passed.');
