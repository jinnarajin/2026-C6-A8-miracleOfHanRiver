import test from 'node:test';
import assert from 'node:assert/strict';
import {freshRun,currentScene,choose,advance,paymentAmount,restore,result} from '../engine.mjs';
test('unexpected costs are paid before salary and not billed twice',()=>{
 let s={...freshRun(),phase:'play'};let total=0;
 while(s.phase==='play'){
  const c=currentScene(s);
  if([4,8].includes(s.turn)){assert.equal(c.immediate,true);assert.equal(paymentAmount(s),500000);assert.equal(s.salaryIncome||0,s.turn===4?0:3000000);}
  if([5,9,13,17].includes(s.turn))assert.equal(paymentAmount(s),1700000);
  const a=c.kind==='trade'?'hold':c.kind==='expense'?'pay':c.kind==='rebalance'?'follow':c.kind==='friend'?'rest':c.choices[0].id;
  s=advance(choose(s,a));assert.deepEqual(restore(JSON.stringify(s)),s);
 }
 assert.equal(s.spent,7800000);assert.equal(s.salaryIncome,12000000);assert.equal(result(s).profit,0);
});
test('cash reserve avoids forced sale before payday',()=>{
 const s={...freshRun(),phase:'play',turn:8,cash:100000,shares:50};
 const sold=choose(s,'fund');assert.equal(sold.history.at(-1).quantity,6);assert.equal(sold.cash,28400);
 const reserve=choose({...s,cash:500000},'pay');assert.equal(reserve.shares,50);assert.equal(reserve.cash,0);
 assert.equal(advance(reserve).cash,3000000);
});
