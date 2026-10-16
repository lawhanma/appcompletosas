import assert from 'node:assert/strict';
const values = new Map<string,string>();
Object.assign(globalThis, {localStorage: {
  getItem: (key:string) => values.get(key) ?? null,
  setItem: (key:string,value:string) => values.set(key,value),
  removeItem: (key:string) => values.delete(key),
}});
const {createCleanState} = await import('../src/context/FinancialContext');
const {getPresentationCode} = await import('../src/utils/presentationAccount');
const {checkIsProductAffiliated} = await import('../src/utils/useShopeeAffiliation');
const {PRODUCTS} = await import('../src/data/mockData');
const regular = createCleanState('101190','other@example.invalid');
assert.equal(regular.faturamentoDiario,0);
assert.equal(regular.saldoDisponivel,0);
assert.equal(getPresentationCode('standard','other@example.invalid'),'101190');
const code = getPresentationCode('standard',' ISAQUELAW@gmail.com ');
assert.equal(code,'123456');
const sample = createCleanState(code,' ISAQUELAW@gmail.com ');
assert(sample.faturamentoDiario>0 && sample.faturamentoMes>sample.faturamentoDiario);
assert(sample.saldoDisponivel>0 && sample.saldoPendente>0);
assert.equal(sample.transactions.length,sample.pedidosHoje);
assert.equal(Number(sample.transactions.reduce((sum,t)=>sum+t.saleAmount,0).toFixed(2)), sample.faturamentoDiario);
assert(PRODUCTS.every(p=>checkIsProductAffiliated(p.id,code)));
assert.equal(checkIsProductAffiliated(PRODUCTS[0].id,regular.userCode),false);
console.log(`Account isolation, sample balances and ${PRODUCTS.length} product affiliations passed.`);
