import assert from 'node:assert/strict';
const values = new Map<string,string>();
Object.assign(globalThis, {localStorage: {
  getItem: (key:string) => values.get(key) ?? null,
  setItem: (key:string,value:string) => values.set(key,value),
  removeItem: (key:string) => values.delete(key),
}});
const {createCleanState} = await import('../src/context/FinancialContext');
const {getAccountPlanCode,isPresentationAccount} = await import('../src/utils/presentationAccount');
const {checkIsProductAffiliated} = await import('../src/utils/useShopeeAffiliation');
const {PRODUCTS} = await import('../src/data/mockData');
const regular = createCleanState('101190','other@example.invalid');
assert.equal(regular.faturamentoDiario,0);
assert.equal(regular.saldoDisponivel,0);
assert.equal(getAccountPlanCode('standard'),'101190');
assert.equal(getAccountPlanCode('free'),'free');
assert.equal(getAccountPlanCode('vip'),'123456');
assert.equal(isPresentationAccount(' ISAQUELAW@gmail.com '),true);
assert.equal(isPresentationAccount('other@example.invalid'),false);
const owner = createCleanState(getAccountPlanCode('standard'),' ISAQUELAW@gmail.com ');
assert.equal(owner.userCode,'101190');
assert.equal(owner.faturamentoDiario,0);
assert.equal(owner.faturamentoMes,0);
assert.equal(owner.saldoDisponivel,0);
assert.equal(owner.saldoPendente,0);
assert.deepEqual(owner.transactions,[]);
assert.equal(checkIsProductAffiliated(PRODUCTS[0].id,owner.userCode),false);
assert(PRODUCTS.every(p=>checkIsProductAffiliated(p.id,getAccountPlanCode('vip'))));
assert.equal(checkIsProductAffiliated(PRODUCTS[0].id,regular.userCode),false);
console.log('Preview badge isolation, plan mapping and zero seeded balances passed.');
