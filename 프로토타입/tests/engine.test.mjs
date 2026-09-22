import test from 'node:test';
import assert from 'node:assert/strict';
import {freshRun as currentFreshRun,choose,advance,result,restore,SCENES,INITIAL_CASH,availableActions,metrics,goBack,award} from '../engine.mjs';
// Existing save compatibility: these scenarios use the original expense timing.
const freshRun=()=>({...currentFreshRun(),immediateExpenses:false});
const start=()=>({...freshRun(),immediateExpenses:false,phase:'play'});
const finishChoice=(r,a)=>{let next=choose(r,a);return advance(next);};
test('16 cards complete with cash reserved; spending is not an investment loss',()=>{let r=award(start(),'survey');while(r.phase==='play'){const s=SCENES[r.turn];r=finishChoice(r,s.kind==='trade'?'hold':s.kind==='expense'?'pay':(s.kind==='rebalance'?'follow':s.choices[0].id));}assert.equal(r.phase,'result');assert.equal(r.ending,null);assert.equal(r.history.length,16);assert.equal(r.spent,7_800_000);assert.equal(r.cash,9_200_000);assert.equal(result(r).profit,0);});
test('trade execution conserves equity, rounds shares and disallows invalid actions',()=>{const r=start(),b=choose(r,'buy');assert.equal(b.shares,36);assert.equal(metrics(b).equity,INITIAL_CASH);assert.throws(()=>choose(r,'sell'));assert.throws(()=>choose(b,'buy'));assert.equal(advance(b).turn,3);});
test('expense failure and exact forced sale are distinct',()=>{const r={...start(),turn:5,cash:100_000,shares:100};const fail=choose(r,'pay');assert.equal(fail.ending,'expense');assert.equal(fail.spent,0);const funded=choose(r,'fund');assert.equal(funded.quantity,undefined);assert.equal(funded.history[0].quantity,38);assert.equal(funded.shares,62);assert.equal(funded.cash,35_600);assert.equal(funded.spent,2_200_000);assert.equal(funded.ending,null);const poor=choose({...r,shares:1},'fund');assert.equal(poor.ending,'expense');});
test('loss stress follows exposure and hidden calm does not end a run',()=>{let r={...start(),turn:8,cash:4_000_000,shares:60,calm:70};r=choose(r,'hold');const next=advance(r);assert.ok(next.calm<r.calm);const empty=advance(choose({...start(),turn:8},'hold'));assert.equal(empty.calm,65);const exhausted=choose({...start(),turn:3,calm:10},'check');assert.equal(exhausted.calm,0);assert.equal(advance(exhausted).ending,null);});
test('seeded legal runs restore without trusting balances and reach all endings',()=>{let seed=19;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const endings=new Set();for(let i=0;i<1200;i++){let r=i%2?award(start(),'survey'):start();while(r.phase==='play'){assert.deepEqual(restore(JSON.stringify(r)),r);const actions=availableActions(r);let next=choose(r,actions[Math.floor(random()*actions.length)]);assert.ok(next.cash>=0&&next.shares>=0&&next.calm>=0&&next.calm<=100);assert.deepEqual(restore(JSON.stringify({...next,cash:-999})),next);r=advance(next);}endings.add(r.ending);assert.deepEqual(restore(JSON.stringify(r)),r);}assert.deepEqual(endings,new Set([null]));assert.equal(restore('bad').phase,'intro');assert.equal(restore(JSON.stringify({version:2,history:[]})).phase,'intro');});

test('back restores prior resources including expenses and completion',()=>{let run=start();const snapshots=[];while(run.phase==='play'){snapshots.push(run);const s=SCENES[run.turn];run=finishChoice(run,s.kind==='trade'?'hold':s.kind==='expense'?'pay':(s.kind==='rebalance'?'follow':s.choices[0].id));}for(const previous of snapshots.reverse()){run=goBack(run);assert.deepEqual(run,previous);assert.deepEqual(restore(JSON.stringify(run)),run);}assert.equal(goBack(run).phase,'intro');});

test('rewards are one-time, excluded from profit and restored through backtracking',()=>{let r=award(start(),'survey');assert.equal(r.cash,5000000);assert.equal(result(r).profit,0);assert.deepEqual(award(r,'survey'),r);r=finishChoice(r,'hold');r=award(r,'reflection-rise');assert.equal(r.bonus,7500000);assert.deepEqual(restore(JSON.stringify(r)),r);let back=goBack(r);assert.equal(back.bonus,2500000);assert.equal(award(back,'reflection-rise').cash,back.cash);back=restore(JSON.stringify(finishChoice(back,'hold')));assert.equal(back.bonus,7500000);assert.equal(result(back).profit,0);assert.deepEqual(restore(JSON.stringify(back)),back);});


test('expense reductions persist, cannot repeat, and lower actual payment', async()=>{
 const {reduceExpense,plannedExpense,paymentAmount,expenseItems}=await import('../engine.mjs');
 let run={...freshRun(),phase:'play'};
 run=reduceExpense(run,'food');
 assert.equal(run.health,70);assert.equal(plannedExpense(run),1500000);
 assert.deepEqual(reduceExpense(run,'food'),run);
 run=restore(JSON.stringify(run));assert.equal(run.health,70);assert.equal(plannedExpense(run),1500000);
 while(run.turn<5)run=advance(choose(run,availableActions(run).includes('hold')?'hold':availableActions(run)[0]));
 assert.equal(paymentAmount(run),2000000);
 run=advance(choose(run,'pay'));assert.equal(run.spent,2000000);assert.equal(plannedExpense(run),1700000);
 run=restore(JSON.stringify(run));assert.equal(run.spent,2000000);assert.equal(run.health,60);
 run=advance(choose(run,'hold'));assert.equal(plannedExpense(run),2200000);
 run=reduceExpense(run,'hospital');assert.equal(run.health,40);assert.equal(plannedExpense(run),2500000);
 assert.equal(expenseItems(run).length,6);
 assert.deepEqual(restore(JSON.stringify(run)),run);
});

test('notification choices change health and next scene prices consistently',async()=>{
 const {currentScene,metrics}=await import('../engine.mjs');
 const base=advance(choose({...freshRun(),phase:'play'},'buy'));
 for(const action of ['pause','check']){
 const next=advance(choose(base,action));
 assert.equal(next.health,action==='pause'?90:70);
 assert.equal(currentScene(next).price,55500);
 assert.equal(metrics(next).stock,next.shares*55500);
 assert.equal(restore(JSON.stringify(next)).health,next.health);
 assert.equal(goBack(next).health,80);
 assert.equal(choose(next,'buy').history.at(-1).price,55500);
 }
});

test('final reflection reward is one-time and survives reload',()=>{
 let run={...freshRun(),phase:'play'};
 while(run.phase==='play')run=advance(choose(run,availableActions(run).includes('hold')?'hold':availableActions(run)[0]));
 const rewarded=award(run,'reflection-final');
 assert.equal(rewarded.cash,run.cash+5000000);
 assert.deepEqual(award(rewarded,'reflection-final'),rewarded);
 assert.equal(restore(JSON.stringify(rewarded)).cash,rewarded.cash);
 assert.equal(result(rewarded).profit,result(run).profit);
});

test('payments occur on turns 4, 8, 12 and 16 with fresh monthly budgets',async()=>{
 const {plannedExpense}=await import('../engine.mjs');
 let run=award(start(),'survey'),turn=1;const payments=[];
 while(run.phase==='play'){
 const scene=SCENES[run.turn];
 if(scene.kind==='expense')payments.push(turn);
 run=finishChoice(run,scene.kind==='expense'?'pay':scene.kind==='trade'?'hold':(scene.kind==='rebalance'?'follow':scene.choices[0].id));
 if(payments.at(-1)===turn&&run.phase==='play')assert.equal(plannedExpense(run),1700000);
 turn++;
 }
 assert.deepEqual(payments,[4,8,12,16]);assert.equal(run.ending,null);assert.equal(plannedExpense(run),0);
});

test('first payment leads directly to trading without an explanatory choice',()=>{
 const next=advance(choose({...start(),turn:5},'pay'));
 assert.equal(next.turn,6);
 assert.equal(SCENES[next.turn].kind,'trade');
 assert.deepEqual(availableActions(next),['hold','buy']);
 assert.equal(SCENES.filter(s=>!s.removed).length,16);
});

test('health threshold adds one fixed medical charge and survives recovery',async()=>{const {checkHealth,plannedExpense}=await import('../engine.mjs');let s={...freshRun(),phase:'play',health:41};assert.equal(checkHealth(s).healthEvent,undefined);s=checkHealth({...s,health:40});assert.equal(plannedExpense(s),2200000);assert.deepEqual(checkHealth(s),s);s=checkHealth({...s,health:80});assert.equal(plannedExpense(s),2200000);});

test('friend loan preserves equity and returns once after three turns',()=>{let r=award({...freshRun(),phase:'play'},'survey');while(r.turn<11){const scene=SCENES[r.turn];r=advance(choose(r,scene.kind==='trade'?'hold':scene.kind==='expense'?'pay':(scene.kind==='rebalance'?'follow':scene.choices[0].id)));}const cash=r.cash,profit=result(r).profit;r=advance(choose(r,'lend300'));assert.equal(r.cash,cash-1000000);assert.equal(r.friendLoan,1000000);assert.equal(result(r).profit,profit);assert.deepEqual(restore(JSON.stringify(r)),r);r=advance(choose(r,'follow'));r=advance(choose(r,'pay'));assert.equal(r.friendLoan,0);assert.equal(r.friendRepaid,1000000);assert.equal(r.cash,cash+3000000-1700000);assert.deepEqual(restore(JSON.stringify(r)),r);});

test('rebalancing adjusts holdings to half without changing equity',()=>{const r={...start(),turn:12,cash:2000000,shares:46};const before=metrics(r).equity;const next=choose(r,'compare');assert.equal(metrics(next).equity,before);assert.ok(metrics(next).stock<=before*.5);assert.ok(before*.5-metrics(next).stock<SCENES[12].price);assert.equal(choose(r,'follow').cash,r.cash);});

test('midgame feedback reward is unique, persisted and excluded from profit',()=>{let s=start();s=advance(choose(s,'buy'));const before=result(s).profit;s=award(s,'reflection-need');assert.equal(result(s).profit,before);assert.deepEqual(award(s,'reflection-need'),s);assert.deepEqual(restore(JSON.stringify(s)),s);});

test('cancel pending expense reduction restores cost and health and persists',async()=>{const {reduceExpense,cancelExpenseReduction,plannedExpense}=await import('../engine.mjs');const base=start();let r=reduceExpense(base,'food');assert.equal(r.health,70);r=cancelExpenseReduction(r,'food');assert.deepEqual(r,base);assert.equal(plannedExpense(r),1700000);assert.deepEqual(restore(JSON.stringify(r)),r);assert.deepEqual(cancelExpenseReduction(r,'food'),r);});
