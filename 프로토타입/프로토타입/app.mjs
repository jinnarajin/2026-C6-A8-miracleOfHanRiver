import {resumeStage2,clearStage2} from './stage2.mjs?v=start-250-1';
import {setupResearch} from './research.mjs?v=start-250-1';
import {freshRun,restore,choose,advance,result,SCENES,INITIAL_CASH,options,metrics,plannedExpense,goBack,award,expenseItems,paymentAmount,reduceExpense,cancelExpenseReduction,currentScene} from './engine.mjs?v=start-250-1';
const KEY='return2025-stage1-v3',app=document.querySelector('#app');
const fmt=n=>n.toLocaleString('ko-KR'),money=n=>`${fmt(n)}원`,short=n=>`${Number((n/10000).toFixed(1)).toLocaleString('ko-KR')}만 원`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let stage2Active=false;

let forwardStates=[];
let state;try{state=restore(localStorage.getItem(KEY));}catch{state=freshRun();}
let changes=null;
if(state.phase==='feedback'){state=advance(state);}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}}
const header=()=>`<header><div class="header-start">${state.phase!=='intro'?'<button type="button" class="back-button" data-action="back" aria-label="이전 사건으로 돌아가기">← 뒤로</button>':''}${forwardStates.length?'<button type="button" class="back-button" data-action="forward" aria-label="다음 사건으로 다시 가기">앞으로 →</button>':state.phase!=='intro'?'<button type="button" class="back-button" disabled>앞으로 →</button>':''}</div><span class="turn">첫 스테이지 · ${state.phase==='intro'?'시작하기':`${SCENES.slice(0,state.turn+1).filter(s=>!s.removed).length} / ${SCENES.filter(s=>!s.removed).length}`}</span></header>`;
let openResource=null;
let guideStep=1;try{if(localStorage.getItem('resource-guide-v2')==='done')guideStep=0;}catch{}
function finishGuide(){guideStep=0;try{localStorage.setItem('resource-guide-v2','done');}catch{}updateGuide();}
function updateGuide(){
 app.querySelectorAll('.onboarding-tip').forEach(e=>e.remove());
 app.querySelectorAll('.guide-highlight').forEach(e=>e.classList.remove('guide-highlight'));
 if(!guideStep||state.phase!=='play')return;
 const target=app.querySelector(guideStep===1?'.resource-wrap':'.choices');
 if(!target)return;target.classList.add('guide-highlight');
 const text=guideStep===1?'위 아이콘을 눌러 보세요':'건강도 생활비에 영향을 줘요';
 const body=guideStep===1?'각 아이콘을 누르면 정확한 수치와 설명이 팝업으로 열려요. 위험할 때는 경고 표시가 나타나요.':'시세를 계속 확인하거나 식비·치료비를 줄이면 건강이 감소해요. 건강이 40 이하가 되면 병원비 50만 원이 다음 생활비에 한 번 추가돼요. 쉬는 선택으로 건강을 회복할 수 있어요. 아래 버튼으로 선택해 보세요.';
 target.insertAdjacentHTML(guideStep===1?'afterend':'beforebegin',`<aside class="onboarding-tip step-${guideStep}" aria-label="처음 이용 안내"><small>${guideStep} / 2 · 시작 안내</small><strong>${text}</strong><p>${body}</p><div><button type="button" data-guide-skip>안내 닫기</button><button type="button" data-guide-next>${guideStep===1?'설명 열어보기':'알겠어요'}</button></div></aside>`);
}
const icons={
 cash:'<path d="M5 9h20v17H5zM8 9V5h14v4"/><path d="M19 15h8v6h-8z"/><circle cx="22" cy="18" r="1" fill="currentColor" stroke="none"/>',
 expense:'<path d="M8 4h16v24l-4-3-4 3-4-3-4 3zM12 10h8M12 15h8M12 20h4"/>',
 ratio:'<path d="M17 4v12h12A12 12 0 0 0 17 4Z" fill="currentColor" stroke="none"/><path d="M12 8a11 11 0 1 0 12 12H12Z"/>',
 health:'<path d="M16 27 5 16C-2 7 10 0 16 9 22 0 34 7 27 16Z"/><path d="M8 16h5l2-5 3 10 2-5h4"/>',
 stress:'<path d="M13 7a3 3 0 0 1 6 0v12a6 6 0 1 1-6 0ZM16 11v12M23 8h3M23 13h3"/><circle cx="16" cy="24" r="2" fill="currentColor" stroke="none"/>'
};
function holdingChange(){
 const previous=state.history.at(-1)?.price,current=currentScene(state).price;
 if(!(previous>current))return '';
 return `<div class="holding-change"><span>보유 주식 전체 · ${state.shares}주</span><strong>${state.shares?`총 ${money(state.shares*(previous-current))} 감소`:'보유 주식이 없어 영향 없음'}</strong><p>${money(state.shares*previous)} → ${money(state.shares*current)}</p><small>직전 가격 대비 · 현재 보유 수량 기준<br>생활비 지출을 제외한 주가 하락분입니다.</small></div>`;
}
function hud(){
 const m=metrics(state),stress=100-state.calm;
 const due=plannedExpense(state),shortage=Math.max(0,due-state.cash);
 const payment=due&&currentScene(state)?.immediate&&!state.history.some(h=>h.turn===state.turn&&!h.ending)?currentScene(state):due?SCENES.find((scene,index)=>index>=state.turn&&scene.kind==='expense'&&!state.history.some(h=>h.turn===index&&!h.ending)):null;
 const parseDate=value=>{const [y,m,d]=value.match(/\d+/g).map(Number);return Date.UTC(y,m-1,d);};
 const days=payment?Math.max(0,Math.round((parseDate(payment.date)-parseDate(SCENES[state.turn].date))/86400000)):null;
 const deadline=days===null?'예정 없음':days===0?'결제일':`결제까지 ${Math.ceil(days/7)}턴`;
 const entries=[
 {key:'cash',name:'남은 현금',value:short(state.cash),level:Math.min(100,state.cash/INITIAL_CASH*100),description:'주식을 팔지 않고 바로 사용할 수 있는 돈입니다.'+(state.friendLoan?` 친구에게 빌려준 ${money(state.friendLoan)}은 아직 현금으로 쓸 수 없습니다. 3턴 뒤 돌려받을 예정입니다.`:'')},
 {key:'expense',name:days===null?'결제 예정 없음':days===0?'오늘 결제':`결제까지 ${Math.ceil(days/7)}턴`,value:due?short(due):'없음',description:currentScene(state)?.immediate?'오늘 내야 하는 추가 지출입니다. 월급은 다음 턴에 들어옵니다.':payment?'월급 300만 원 · 기본 생활비 170만 원. 4턴마다 생활비를 결제하고, 같은 날 월급이 들어옵니다.':'남은 생활비 결제가 없습니다.',warning:shortage>0},
 {key:'ratio',name:'투자금',value:short(m.stock),level:m.ratio,description:'현재 보유 주식의 평가금액입니다. 보유 수량에 현재 주가를 곱한 값으로, 처음 매수한 금액과 다를 수 있습니다.'},
 ];
 entries.push({key:'health',name:'건강',value:`${state.health??80} / 100`,level:state.health??80,warning:(state.health??80)<=40,description:'알림을 끄고 쉬면 건강이 회복되고, 계속 시세를 확인하면 감소합니다. 식비나 치료비를 줄여도 건강이 감소합니다. 40 이하가 되면 건강 악화 병원비 50만 원이 다음 생활비에 한 번 추가됩니다. 쉬는 선택은 건강을 회복시킵니다. 20 미만이 되는 절약은 선택할 수 없습니다.'});
 const active=entries.find(e=>e.key===openResource);
 const delta=e=>{const n=changes?.[e.key];return n?`${n>0?'+':'−'}${['cash','expense','ratio'].includes(e.key)?short(Math.abs(n)):Math.abs(n).toFixed(e.key==='ratio'?1:0)+(e.key==='ratio'?'%p':'')}`:'';};
 return `<div class="resource-wrap"><div class="hud icon-hud">${entries.map(e=>`<button type="button" class="resource-button ${e.warning?'warning':''} ${openResource===e.key?'selected':''}" data-resource="${e.key}" aria-label="${e.name}: ${e.value}. 자세히 보기" aria-expanded="${openResource===e.key}" aria-controls="resource-detail" aria-haspopup="dialog">${(e.key==='ratio'&&holdingChange())||(e.key==='expense'&&[4,7].includes(state.turn)&&state.phase==='play')?'<span class="resource-notification" aria-label="새 알림">●</span>':''}${e.warning?'<span class="resource-warning-badge" role="img" aria-label="위험 경고">!</span>':''}<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${icons[e.key]}</svg><span class="resource-name">${e.name}</span><strong class="investment-value">${e.value}</strong><em class="icon-delta" aria-live="polite">${delta(e)}</em>${e.key==='expense'&&shortage?`<small class="icon-warning">${short(shortage)} 부족</small>`:''}</button>`).join('')}</div><dialog id="resource-detail" aria-labelledby="resource-title" aria-describedby="resource-description">${active?`<div class="resource-detail-head"><strong id="resource-title">${active.name}</strong><button type="button" data-close-resource aria-label="설명 닫기" autofocus>×</button></div><div class="resource-popup-value">${active.value}</div><p id="resource-description">${active.description}</p>${active.key==='expense'?expenseBreakdown():active.key==='ratio'?holdingChange():''}`:''}</dialog></div>`;
}

function expenseBreakdown(){return `<div class="expense-breakdown">${expenseItems(state).map(i=>`<div class="expense-item"><div><span>${i.name}</span><strong>${short(i.amount)}</strong></div>${i.cut?`<small>${i.reduced?'줄인 금액이 반영되었습니다':`${short(i.cut)} 절약 · 건강 −${i.healthCost}`}</small><button type="button" data-reduce="${i.id}" ${i.reduced||state.phase!=='play'||state.health-i.healthCost<20?'disabled':''}>${i.reduced?'조정 완료':i.id==='hospital'?'치료 일부 미루기':'식비 줄이기'}</button>${i.reduced&&state.phase==='play'?`<button type="button" data-cancel-reduction="${i.id}">취소</button>`:''}`:'<small>이번 결제에서 줄일 수 없는 고정 지출</small>'}</div>`).join('')}</div>`;}

let research;
function render(){
 if(stage2Active)return;
 app.innerHTML=header();
 if(state.phase==='intro')app.innerHTML+=`<section class="screen intro"><p class="year">2025</p><h2>그때로 돌아간다면,<br>어떤 선택을 할까요?</h2><p>${state.grants?.some(g=>g.id==='survey')?'500만 원으로 시작합니다.':'기본 250만 원으로 시작합니다.<br>질문에 답하면 250만 원을 더 받아 총 500만 원으로 시작합니다.'}<br>얼마를 투자하고,<br>얼마를 생활비로 남길까요?</p><div class="intro-actions"><button class="primary" data-action="start">첫 스테이지 시작</button></div></section>`;
 else if(state.phase==='play')play();else ending();
 
 updateGuide();
 research?.mount();
 window.scrollTo(0,0);
}
function healthPreview(action){
 if(state.phase!=='play'||!options(state).some(o=>o.id===action&&!o.disabled))return '';
 const delta=choose(state,action).health-state.health;
 return delta?`<span class="choice-health-preview" role="tooltip">건강 ${delta>0?'+':'−'}${Math.abs(delta)}</span>`:'';
}
function play(){const s=currentScene(state),choices=options(state).filter(o=>(o.id!=='sell'||state.shares>0)&&o.id!=='lend100');
const tips={0:'아래 버튼으로 선택하세요. 사면 현금이 줄고 투자금이 늘어납니다.',1:'위 게이지의 + / −는 방금 선택으로 바뀐 양입니다.',2:'투자 비중은 전체 자산에서 주식이 차지하는 비율입니다. 100%에 가까우면 현금이 거의 없습니다.',3:'투자금은 보유 주식 전체의 현재 금액입니다. 주가가 바뀌면 함께 변합니다.'};
let quote=s.immediate?s.quote:s.kind==='expense'?`예정된 ${short(paymentAmount(state))}을 결제할 날입니다. 현금으로 내거나 필요한 만큼 주식을 팔아 마련할 수 있습니다.`:s.quote;
if(s.kind==='rebalance'){const stock=state.shares*s.price,total=state.cash+stock;quote+=` 현재 주식 ${total?Math.round(stock/total*100):0}%, 현금 ${total?Math.round(state.cash/total*100):0}%입니다.`;}
if(s.kind==='expense'&&!s.immediate)quote='월급 300만 원이 입금됐습니다. '+quote;
if(s.kind==='expense')quote+=state.cash>=paymentAmount(state)?' 남겨 둔 현금으로 전액 낼 수 있습니다.':` 현금이 ${short(paymentAmount(state)-state.cash)} 부족합니다. 주식을 팔아 마련할 수 있습니다.`;
const previousPrice=state.history.at(-1)?.price;
const priceDrop=previousPrice>s.price;

const last=state.history.at(-1);const receipt=last&&currentScene({...state,turn:last.turn}).kind==='expense'&&!last.ending?`지출 결제 완료 · ${last.quantity?`${last.quantity}주를 팔아 마련했습니다.`:'남겨 둔 현금으로 냈습니다.'}`:null;
app.innerHTML+=`<section class="screen play">${hud()}${state.turn===14&&state.friendRepaid?`<p class="market-note" role="status">민준: “약속한 날이지? 정말 고마웠어.” 빌려준 ${money(state.friendRepaid)}이 현금으로 돌아왔습니다.</p>`:''}${state.healthEvent&&state.turn<=state.healthEvent.bill?'<p class="market-note" role="status">건강 악화로 병원비 50만 원이 추가됐습니다. 다음 생활비에 포함해 결제합니다. 건강을 회복해도 이미 발생한 병원비는 남습니다.</p>':''}<div class="progress" aria-label="진행률"><i style="width:${SCENES.slice(0,state.turn).filter(s=>!s.removed).length/SCENES.filter(s=>!s.removed).length*100}%"></i></div><h2 class="scene-title">${s.title}</h2><p class="dialogue">${quote}</p>${s.kind==='rebalance'?'<p class="control-tip">50%는 이번 연습의 기준이며 정답 비율은 아닙니다. 빌려준 돈을 제외한 현금·주식으로 계산하고, 실제 거래는 1주 단위로 맞춥니다. 다음 생활비도 확인해 보세요.</p>':''}${s.kind==='friend'?'<p class="control-tip">빌려준 돈은 3턴 동안 쓸 수 없으며, 3턴 뒤 전액 돌려받습니다.</p>':''}${tips[state.turn]?`<p class="control-tip">${tips[state.turn]}</p>`:''}${receipt?`<p class="notice expense-receipt">${receipt}</p>`:''}<div class="price"><span>삼성전자 · ${state.shares}주 보유</span><strong>${money(s.price)}</strong></div><div class="choices">${choices.map((o,i)=>`<button class="choice ${i===choices.length-1?'buy':''}" data-action="${o.id}" ${o.disabled?'disabled':''}>${o.label}${healthPreview(o.id)}${o.note&&s.kind!=='event'?`<small>${esc(o.note)}</small>`:''}</button>`).join('')}</div></section>`;}
function ending(){const r=result(state),sign=r.profit>0?'+':'';const title=state.ending==='expense'?'필요한 돈이 부족했습니다.':state.ending==='calm'?'스트레스가 한계에 도달했습니다.':'첫 스테이지를 마쳤습니다.';app.innerHTML+=`<section class="screen result"><div class="result-head"><p class="chapter">${state.ending?'이번 투자의 마침표':'첫 스테이지 결과'}</p><h2>${title}</h2></div>${hud()}<div class="balance"><div><span>시작 자산</span><strong>${short(INITIAL_CASH+((state.grants||[]).some(g=>g.id==='survey')?2500000:0))}</strong></div><div><span>받은 월급</span><strong>${money(state.salaryIncome||0)}</strong></div><div><span>지불한 생활비</span><strong>${money(state.spent)}</strong></div><div><span>현재 남은 자산${state.friendLoan?' (받을 돈 포함)':''}</span><strong>${money(r.equity)}</strong></div><div><span>투자로 생긴 손익</span><strong class="${r.profit>=0?'up':'down'}">${sign}${money(r.profit)}</strong></div></div><p class="notice">투자 손익은 남은 자산과 지불한 생활비에서 시작 자산과 받은 월급을 뺀 금액입니다. 회고 지원금은 투자 손익에 포함되지 않습니다.</p><div class="result-actions"><button class="primary" data-action="continue-stage2">이 자산으로 2스테이지 계속하기</button></div></section>`;}
function act(action){
 openResource=null;
 changes=null;
 if(action==='continue-stage2'){stage2Active=resumeStage2(state,currentScene(state).price,restartCampaign,true);return;}
 if(action==='back'){forwardStates.push(structuredClone(state));state=goBack(state);}
 else if(action==='forward'){if(!forwardStates.length)return;state=forwardStates.pop();}
 else if(action==='start'){forwardStates=[];state={...state,phase:'play'};}
 else if(action==='restart'){forwardStates=[];clearStage2();research?.log('restart');research?.reset();state=freshRun();}
 else if(state.phase==='play'&&options(state).some(o=>o.id===action&&!o.disabled)){
 forwardStates=[];research?.log('choice',{action});
 if(guideStep)finishGuide();
 const before={expense:plannedExpense(state),cash:state.cash,ratio:metrics(state).stock,health:state.health,stress:100-state.calm};
 state=advance(choose(state,action));
 state=restore(JSON.stringify(state));
 changes={health:state.health-before.health,expense:plannedExpense(state)-before.expense,cash:state.cash-before.cash,ratio:metrics(state).stock-before.ratio,stress:100-state.calm-before.stress};
 }else return;
 save();render();
}
function positionResourcePopup(){
 const popup=app.querySelector('#resource-detail');
 const row=app.querySelector('.icon-hud');
 if(!popup?.open||!row)return;
 const rect=row.getBoundingClientRect();
 const width=popup.getBoundingClientRect().width;
 popup.style.left=`${Math.max(12,Math.min(rect.left+(rect.width-width)/2,innerWidth-width-12))}px`;
 popup.style.top=`${Math.max(12,Math.min(rect.bottom+10,innerHeight-popup.getBoundingClientRect().height-12))}px`;
}
window.addEventListener('resize',positionResourcePopup);
window.addEventListener('scroll',positionResourcePopup,{passive:true});
function toggleResource(key){
 research?.resource(key);
 const previous=openResource;
 if(key&&guideStep===1)guideStep=2;
 app.querySelector('#resource-detail')?.close();
 openResource=key;
 const wrap=app.querySelector('.resource-wrap');if(wrap)wrap.outerHTML=hud();
 if(key)app.querySelector('#resource-detail').showModal();
 else if(previous)app.querySelector(`[data-resource="${previous}"]`)?.focus();
 updateGuide();
 if(key)positionResourcePopup();
}
app.addEventListener('click',e=>{
 if(stage2Active)return;
 if(e.target.closest('[data-reset-onboarding]')){research?.resetVisitor();for(const key of [KEY,'resource-guide-v2','prototype-research-v1']){try{localStorage.removeItem(key);}catch{}}window.location.reload();return;}
 if(e.target.closest('[data-research],[data-skip]')&&openResource)toggleResource(null);
 if(e.target.closest('[data-guide-skip]')){finishGuide();return;}
 if(e.target.closest('[data-guide-next]')){if(guideStep===1)toggleResource('cash');else finishGuide();return;}
 const cancellation=e.target.closest('[data-cancel-reduction]');
 if(cancellation){forwardStates=[];const before=state;state=cancelExpenseReduction(state,cancellation.dataset.cancelReduction);changes={expense:plannedExpense(state)-plannedExpense(before),health:state.health-before.health};save();render();toggleResource('expense');return;}
 const reduction=e.target.closest('[data-reduce]');
 if(reduction&&!reduction.disabled){forwardStates=[];const before=state;state=reduceExpense(state,reduction.dataset.reduce);changes={expense:plannedExpense(state)-plannedExpense(before),health:state.health-before.health};research?.log('expense_reduce',{item:reduction.dataset.reduce,amount:-changes.expense,healthDelta:changes.health});save();render();toggleResource('expense');return;}
 const resource=e.target.closest('[data-resource]');
 if(resource){toggleResource(resource.dataset.resource);return;}
 if(e.target.closest('[data-close-resource]')){toggleResource(null);return;}
 if(e.target.id==='resource-detail'){
 const r=e.target.getBoundingClientRect();
 if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)toggleResource(null);
 return;
 }
 const button=e.target.closest('button[data-action]');if(button&&!button.disabled)act(button.dataset.action);
});
app.addEventListener('cancel',e=>{if(e.target.id==='resource-detail'){e.preventDefault();toggleResource(null);}},true);
function restartCampaign(){forwardStates=[];stage2Active=false;state=freshRun();research?.reset();save();render();}
research=setupResearch({getState:()=>state,plannedExpense,grant:id=>{forwardStates=[];state=award(state,id);changes={cash:['survey','reflection-final','app-feedback'].includes(id)?2500000:5000000};save();},refresh:render});
stage2Active=resumeStage2(state,currentScene(state).price,restartCampaign);
if(!stage2Active)render();

