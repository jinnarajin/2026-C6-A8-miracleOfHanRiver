import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh2,value2,step2,support2,restore2,actions2,leveragePrice2,changes2} from '../stage2-engine.mjs';
const start=()=>({...fresh2(),phase:'play'});
test('leverage product uses cash only and compounds double each turn return',()=>{let s=step2(start(),'leverBuy');assert.equal(s.cash,500000);assert.equal(s.leverUnits,100);assert.equal(s.units,0);assert.equal(leveragePrice2(s),12000.000000000002);assert.equal(value2(s).profit,200000);s=step2(s,'hold');assert.ok(Math.abs(changes2(s).leverage-2*changes2(s).normal)<1e-9);s=step2(s,'hold');assert.equal(s.leverUnits,100);assert.equal(s.cash,500000);assert.equal(s.debt,undefined);assert.equal(s.receipt,undefined);});
test('selling leverage leaves Samsung holdings untouched',()=>{let s=step2({...start(),units:30},'leverBuy');s=step2(s,'leverSell');assert.equal(s.units,30);assert.equal(s.leverUnits,0);assert.equal(s.cash,1700000);});
test('support does not change investment profit and is not issued twice',()=>{let s={...start(),turn:4,cash:0};s=step2(s,'pay');assert.equal(s.phase,'support');const profit=value2(s).profit;s=support2(s,'분산투자와 ETF');assert.equal(value2(s).profit,profit);assert.deepEqual(support2(s,'duplicate'),s);s=step2(s,'pay');assert.equal(s.spent,1700000);assert.equal(s.turn,5);});
test('zero cash and large price moves never terminate a stage; all legal paths finish',()=>{let seed=42;for(let n=0;n<1000;n++){let s=start(),steps=0;while(s.phase!=='result'){assert.ok(++steps<40);if(s.receipt){s={...s,receipt:null};continue;}if(s.phase==='support'){s=support2(s,'응답하지 않음');continue;}const actions=actions2(s);seed=(seed*1664525+1013904223)>>>0;s=step2(s,actions[seed%actions.length]);assert.deepEqual(restore2(JSON.stringify(s)),s);}assert.equal(s.spent,3400000);assert.equal(s.turn,7);assert.equal(value2(s).profit,value2(s).equity+s.spent-1500000-s.grants-(s.salaryIncome||0));}});
test('continuation preserves stage one cash, shares, health and cumulative profit',async()=>{
 const {continueFrom1,price2}=await import('../stage2-engine.mjs');
 const previous={cash:2345000,shares:17,spent:7000000,bonus:7500000,health:60,calm:50,grants:[{id:'survey'},{id:'reflection-final'}]};
 const s=continueFrom1(previous,100500);
 assert.equal(s.phase,'play');assert.equal(s.cash,previous.cash);assert.equal(s.units,17);assert.equal(price2(s),100500);assert.equal(s.health,60);assert.equal(s.initialCapital,5000000);assert.equal(s.grants,5000000);
 assert.equal(value2(s).profit,previous.cash+17*100500+previous.spent-2500000-previous.bonus);
 assert.deepEqual(restore2(JSON.stringify(s)),s);
 const next=step2(s,'hold');assert.equal(next.units,17);assert.equal(price2(next),110550);assert.equal(next.spent,7000000);
});

test('stage two health adds hospital costs once, supports payment and rest',async()=>{const {health2,bill2}=await import('../stage2-engine.mjs');let s=health2({...start(),health:40,cash:0,turn:4});assert.equal(bill2(s),2200000);assert.deepEqual(health2(s),s);s=step2(s,'pay');s=support2(s,'응답하지 않음');s=step2(s,'pay');assert.equal(s.spent,2200000);assert.equal(value2(s).profit,-1500000);s=step2(s,'rest');assert.equal(s.health,55);assert.equal(s.medical.amount,500000);});
