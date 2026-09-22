export const INITIAL_CASH=2_500_000;
export const ORDER_BUDGET=2_000_000;
export const FINAL_PRICE=100_500;
const trade=(date,price,title,quote)=>({date,price,title,quote,kind:'trade',speaker:'친구 · 민준'});
const event=(date,price,title,quote,choices,kind='event')=>({date,price,title,quote,choices,kind,speaker:kind==='expense'?'생활 · 결제 알림':''});
const option=(id,label,calm,note)=>({id,label,calm,note});
export const SCENES=[
 trade('2025. 04. 30',55500,'친구의 첫 제안','삼성전자 5만 원대네. 나 조금 샀는데, 너도 살래?'),
 event('2025. 04. 30',55500,'나에게 필요한 돈','앞으로 생활비 250만 원이 필요합니다. 지금 남은 현금은 위에 표시되어 있습니다. 투자에 쓸 돈과 생활에 쓸 돈을 나눠 볼까요?',[option('plan','생활비를 먼저 확인한다',8,'곧 생활비 250만 원과 수리비 150만 원이 필요합니다. 마음의 여유 +8.'),option('later','다음에 생각한다',-5,'생활비 확인을 미뤘습니다. 돈이 필요할 때 주식을 팔아야 할 수도 있습니다. 마음의 여유 -5.')]),
 trade('2025. 04. 30',55500,'얼마나 담을까','처음 선택하고 나니 금액이 눈에 들어옵니다. 지금 가격이 그대로일 때, 투자 규모를 다시 정해 볼까요?'),
 event('2025. 05. 30',56200,'계속 켜지는 화면','일하는 중에도 주가가 궁금합니다. 작은 움직임까지 확인하다 보니 해야 할 일에 집중하기 어렵습니다.',[option('check','계속 확인한다',-14,'새로운 판단 근거 없이 화면을 확인하느라 지쳤습니다. 마음의 여유 -14.'),option('pause','알림을 잠시 끈다',10,'확인할 시간을 정하고 일상으로 돌아왔습니다. 마음의 여유 +10.')]),
 trade('2025. 05. 30',56200,'나만 뒤처지는 걸까','조금 올랐네. 친구는 더 샀대. 네가 남겨 둔 현금으로 더 살 수도 있지만, 예상하지 못한 일이 생길 때 쓸 돈도 남겨둘 수 있어.'),
 event('2025. 05. 30',56200,'갑자기 고장 난 자동차','출근길에 차가 고장 났습니다. 수리비 250만 원을 오늘 내야 합니다. 남겨 둔 현금으로 낼까요, 주식을 일부 팔까요?',[], 'expense'),
 event('2025. 07. 31',71400,'같은 상승, 다른 금액','주가가 올랐습니다. 주식을 많이 샀다면 늘어난 금액도 더 큽니다. 하지만 주식의 평가금액은 바로 쓸 수 있는 현금과 다릅니다.',[option('read','남은 현금을 확인한다',4,'한 가지 숫자만으로 가격의 이유를 단정하기는 어렵습니다. 잠시 판단을 정리했습니다. 마음의 여유 +4.'),option('rush','오른 주가를 계속 확인한다',-6,'친구는 가격이 올랐다는 이야기만 합니다. 내 생각은 아직 정리되지 않았습니다. 마음의 여유 -6.')]),
 trade('2025. 07. 31',71400,'오른 뒤의 선택','주가가 올랐습니다. 더 투자할 수도 있고, 일부를 팔아 현금으로 남길 수도 있습니다. 지금 어느 정도를 투자해 두고 싶나요?'),
 event('2025. 07. 31',71400,'예상하지 못한 병원비','갑자기 치료를 받게 되어 병원비 50만 원이 생겼습니다. 오늘 결제해야 하는데, 바로 쓸 수 있는 현금이 있나요?',[], 'expense'),
 event('2025. 08. 29',69700,'가격이 내려간 날','주가가 다시 6만 원대로 내려왔습니다. 보유 금액이 클수록 변화가 더 크게 느껴집니다. 지금 무엇부터 할까요?',[option('review','잠시 화면을 끈다',8,'가격 확인을 멈추고 잠시 쉬었습니다. 마음의 여유 +8.'),option('watch','화면을 계속 지켜본다',-16,'가격이 바뀌길 기다리며 화면을 놓지 못했습니다. 마음의 여유 -16.')]),
 trade('2025. 08. 29',69700,'싸졌다는 생각','지난번보다 싸졌으니 더 사도 될까? 아니면 내가 감당할 수 있는 만큼만 남길까? 같은 가격도 보유 상황에 따라 다르게 느껴집니다.'),
 event('2025. 08. 29',69700,'잠들기 전까지','하루 종일 투자 생각이 머릿속을 맴돕니다. 내일도 선택은 이어집니다. 오늘은 어떻게 마무리할까요?',[option('rest','오늘은 쉬기로 한다',14,'잠시 거리를 두고 쉴 시간을 확보했습니다. 마음의 여유 +14.'),option('search','후기를 더 찾아본다',-12,'서로 다른 전망을 계속 읽으니 더 혼란스러워졌습니다. 마음의 여유 -12.')]),
 event('2025. 10. 30',104100,'주식이 차지하는 몫','주가가 크게 올랐습니다. 더 사지 않아도 자산에서 주식이 차지하는 비중이 커질 수 있습니다. 지금 내 돈이 어디에 있는지 확인해 보세요.',[option('compare','현금과 주식을 나눠 본다',6,'내가 기대했던 변화가 있었는지 살펴봤습니다. 마음의 여유 +6.'),option('follow','주가를 계속 확인한다',-8,'주변의 들뜬 분위기에 조급해졌습니다. 마음의 여유 -8.')]),
 trade('2025. 10. 30',104100,'다들 들떠 있을 때','친구가 수익 화면을 보내왔습니다. 더 사고 싶은 마음이 듭니다. 지금 내 자산 중 주식이 차지하는 비율은 어느 정도인가요?'),
 event('2025. 10. 30',104100,'다시 평온해진 일상','당장 예정된 큰 지출은 없습니다. 그래도 뜻밖의 일이 생길 수 있습니다. 오늘은 잠시 투자 화면에서 벗어날까요?',[option('prepare','오늘은 쉬기로 한다',8,'마지막 거래 뒤 200만 원이 나갑니다. 현금이 부족하면 필요한 만큼 주식을 팔게 됩니다. 마음의 여유 +8.'),option('ignore','시세를 조금 더 확인한다',-8,'지출은 그대로 남아 있습니다. 준비를 미루니 조금 신경이 쓰입니다. 마음의 여유 -8.')]),
 trade('2025. 11. 28',100500,'마지막으로 비중 조절','가격이 조금 내려왔습니다. 더 사고 싶은 마음도 들지만, 남은 현금이 눈에 들어옵니다. 주식을 더 살까요, 현금을 남길까요?'),
 event('2025. 11. 28',100500,'집에 생긴 누수','갑자기 집에 물이 새기 시작했습니다. 긴급 수리비는 200만 원입니다. 주가가 내려간 지금, 수리비를 어떻게 마련할까요?',[], 'expense'),
];
SCENES[1].removed=true; SCENES[2].removed=true; // Retained only to replay existing saved decisions.
SCENES[5].expense=2_000_000; SCENES[8].expense=500_000;
// Billing dates are fictional; use the preceding market snapshot for transactions.
SCENES[5].priceDate=SCENES[5].date; SCENES[5].date='2025. 05. 31';
SCENES[0].priceDate=SCENES[0].date; SCENES[0].date='2025. 05. 01';
SCENES[8].priceDate=SCENES[8].date; SCENES[8].date='2025. 08. 01';
Object.assign(SCENES[4],{title:'예정 생활비가 늘었습니다',quote:'자동차 수리비 50만 원이 추가됐습니다. 예정 생활비가 170만 원에서 220만 원으로 늘었습니다. 남은 현금을 보고 투자 금액을 정해 보세요.'});
Object.assign(SCENES[5],{title:'생활비 결제일',quote:'예정된 생활비 200만 원을 낼 날입니다. 남겨 둔 현금으로 낼까요, 주식을 일부 팔아 마련할까요?'});
Object.assign(SCENES[7],{title:'예정 생활비가 늘었습니다',quote:'예상하지 못한 병원비 50만 원이 예정 생활비에 추가됐습니다. 곧 결제해야 합니다. 지금 투자 금액을 조절할까요?'});
Object.assign(SCENES[8],{title:'병원비 결제일',quote:'예정 생활비에 추가된 병원비 50만 원을 결제할 시간입니다.'});
Object.assign(SCENES[14],{title:'다시 평온해진 일상',quote:'당장 예정된 지출은 없습니다. 오늘은 잠시 쉬어 갈까요, 시세를 더 확인할까요?'});
Object.assign(SCENES[16],{kind:'event',title:'오늘의 거래를 마치며',quote:'오늘 할 거래는 마쳤습니다. 이제 화면을 닫고 일상으로 돌아갈까요?',choices:[option('finish','오늘은 여기까지',5,'오늘의 거래를 마쳤습니다.'),option('check','시세를 한 번 더 본다',-3,'마지막으로 시세를 확인했습니다.')]});
Object.assign(SCENES[6],{kind:'trade',title:'결제 후, 다음 투자',quote:'생활비를 내고 나니 주가가 71,400원으로 올라 있습니다. 남은 현금으로 더 살까요, 그대로 둘까요, 일부를 팔까요?'});
// Four decisions per billing cycle, sixteen playable turns in total.
Object.assign(SCENES[8],{kind:'trade',title:'결제 전 점검',quote:'다음 주에는 생활비와 병원비가 결제됩니다. 필요한 현금을 남겨 두었나요?'});
SCENES.push(event('2025. 11. 28',100500,'마지막 생활비 결제','이번 생활비를 결제하고 첫 스테이지를 마무리합니다.',[],'expense'));
export const BILL_TURNS=[5,9,13,17];
for(const [cycle,turn] of BILL_TURNS.entries())Object.assign(SCENES[turn],{kind:'expense',expense:cycle<2?2000000:1500000,title:`${cycle+1}번째 생활비 결제`,quote:'이번 주는 생활비 결제일입니다.'});
Object.assign(SCENES[14],{title:'다시 시작된 한 주',quote:'생활비를 결제하고 새로운 한 주가 시작됐습니다. 다음 결제에 쓸 돈을 남겨 두고 잠시 쉬어 갈까요?'});
// Each playable scene advances the fictional calendar by exactly one week.
let calendarTurn=0;
for(const scene of SCENES){
 if(scene.removed)continue;
 scene.priceDate=scene.priceDate||scene.date;
 const date=new Date(Date.UTC(2025,4,1+calendarTurn*7));
 scene.date=`${date.getUTCFullYear()}. ${String(date.getUTCMonth()+1).padStart(2,'0')}. ${String(date.getUTCDate()).padStart(2,'0')}`;
 calendarTurn++;
}
Object.assign(SCENES[11],{kind:'friend',speaker:'가장 친한 친구 · 민준',title:'가장 친한 친구의 조심스러운 부탁',quote:'가장 친한 친구가 조심스럽게 말을 꺼냅니다. “급하게 100만 원이 필요한데, 빌려줄 수 있을까? 3주 뒤에는 꼭 갚을게.” 다음 생활비도 곧 나갑니다. 어떻게 답할까요?',choices:[option('rest','지금은 어렵다고 말한다',0,'친구는 이 일을 기억할 것입니다.'),option('lend100','50만 원만 빌려준다',0,'가능한 범위를 정해 50만 원을 빌려줬습니다.'),option('lend300','100만 원을 빌려준다',0,'친구를 믿고 100만 원을 빌려줬습니다.')]});
Object.assign(SCENES[12],{kind:'rebalance',title:'투자 비중 다시 맞추기',quote:'주가가 오르면 더 사지 않아도 주식 비중이 커집니다. 현금과 주식의 비율을 다시 조절하는 것을 리밸런싱이라고 합니다. 이번에는 어떻게 할까요?'});
export function checkHealth(state){
 if((state.health??80)>40||state.healthEvent)return state;
 const bill=BILL_TURNS.find(t=>t>=state.turn&&!state.history.some(h=>h.turn===t&&!h.ending));
 if(bill===undefined)return state;
 return {...state,healthEvent:{bill,amount:500000,turn:state.turn}};
}
export function expenseItems(state){
 if(state.immediateExpenses&&[4,8].includes(state.turn)&&!state.history.some(h=>h.turn===state.turn&&!h.ending))return [{id:state.turn===4?'repair':'hospital',name:state.turn===4?'자동차 수리비':'병원비',amount:500000,bill:state.turn}];
 const bill=BILL_TURNS.find(turn=>turn>=state.turn&&!state.history.some(h=>h.turn===turn&&!h.ending));
 if(bill===undefined)return [];
 const suffix=bill===5?'':`-${bill}`;
 const items=[{id:'rent'+suffix,name:'월세',amount:800000,bill},{id:'food'+suffix,name:'식비',amount:550000,bill,cut:200000,healthCost:10},{id:'transport'+suffix,name:'교통·통신비',amount:50000,bill},{id:'other'+suffix,name:'기타 지출',amount:300000,bill}];
 if(!state.immediateExpenses&&bill===5&&state.turn>=4)items.push({id:'repair',name:'자동차 수리비',amount:500000,bill});
 if(!state.immediateExpenses&&bill===9&&state.turn>=7)items.push({id:'hospital',name:'병원비',amount:500000,bill,cut:200000,healthCost:20});
 if(state.healthEvent?.bill===bill)items.push({id:'health-care',name:'건강 악화 병원비',amount:500000,bill});
 return items.map(i=>({...i,reduced:(state.cuts||[]).some(c=>c.id===i.id),amount:i.amount-((state.cuts||[]).some(c=>c.id===i.id)?i.cut||0:0)}));
}
export const plannedExpense=state=>expenseItems(state).reduce((n,i)=>n+i.amount,0);
export const paymentAmount=state=>expenseItems(state).filter(i=>i.bill===state.turn).reduce((n,i)=>n+i.amount,0);
export function reduceExpense(state,id){
 const item=expenseItems(state).find(i=>i.id===id);
 if(state.phase!=='play'||!item?.cut||item.reduced||(state.health??80)-item.healthCost<20)return state;
 return checkHealth({...state,health:(state.health??80)-item.healthCost,cuts:[...(state.cuts||[]),{id,at:state.history.length,turn:state.turn}]});
}
export function cancelExpenseReduction(state,id){
 const item=expenseItems(state).find(i=>i.id===id);
 if(state.phase!=='play'||!item?.reduced)return state;
 return restore(JSON.stringify({...state,cuts:(state.cuts||[]).filter(c=>c.id!==id)}));
}
export function freshRun(){return {version:3,immediateExpenses:true,phase:'intro',turn:0,cash:INITIAL_CASH,shares:0,calm:65,health:80,cuts:[],spent:0,history:[],ending:null};}
export function currentScene(state){
 const scene=SCENES[state.turn];
 if(state.immediateExpenses&&[4,8].includes(state.turn))return {...scene,kind:'expense',immediate:true,price:state.turn===4?55500:71400,title:state.turn===4?'월급 전에 고장 난 자동차':'월급 전에 생긴 병원비',quote:(state.turn===4?'출근에 쓰는 차가 고장 났습니다. 수리비 50만 원을 오늘 내야 합니다.':'갑자기 치료를 받아 병원비 50만 원을 오늘 내야 합니다.')+' 월급은 다음 턴에 들어옵니다. 현금으로 내거나 필요한 만큼 주식을 팔아 마련하세요.'};
 if(state.immediateExpenses&&state.turn===7)return {...scene,title:'오른 뒤의 선택',quote:'주가가 올랐습니다. 더 살까요, 일부를 팔아 예상하지 못한 지출에 쓸 현금을 남길까요?'};
 if(state.turn!==4)return scene;
 const paused=state.history.some(h=>h.turn===3&&h.action==='pause');
 return {...scene,price:55500,title:paused?'쉬고 돌아와 보니':'계속 지켜봐도',quote:(paused?'알림을 끄고 쉬는 동안 건강이 회복됐습니다. 일주일 뒤 확인한 주가는 56,200원에서 55,500원으로 내려와 있습니다.':'계속 시세를 확인하느라 피곤해졌습니다. 일주일 뒤 주가는 56,200원에서 55,500원으로 내려왔습니다.')+' 자동차 수리비 50만 원도 추가되어 예정 결제 금액이 늘었습니다. 지금은 어떻게 할까요?'};
}
export function metrics(state,price=currentScene(state)?.price||FINAL_PRICE){const stock=state.shares*price;return {stock,equity:state.cash+stock+(state.friendLoan||0),ratio:stock/(state.cash+stock+(state.friendLoan||0)||1)*100};}
export function options(state){
 const s=currentScene(state);if(state.phase!=='play'||!s)return [];
 if(s.kind==='rebalance'){const stock=state.shares*s.price,total=state.cash+stock,target=Math.floor(total*0.5/s.price),delta=target-state.shares;return [{id:'compare',label:'주식 약 50%로 맞춘다',note:delta===0?'이미 목표 비중에 가깝습니다.':`${Math.abs(delta)}주 ${delta>0?'매수':'매도'} · ${Math.abs(delta*s.price).toLocaleString('ko-KR')}원`,disabled:false},{id:'follow',label:'현재 비중을 유지한다',note:'주식을 사고팔지 않습니다.'}];}
 if(s.kind==='friend')return s.choices.map(o=>({...o,disabled:o.id==='lend300'?state.cash<1000000:o.id==='lend100'?state.cash<500000:false}));
 if(s.kind==='trade')return [{id:'sell',label:'절반 판다',note:'보유 주식의 절반',disabled:state.shares===0},{id:'hold',label:state.shares?'그대로 둔다':'지켜본다',note:'지금 상태 유지'},{id:'buy',label:'산다',note:'200만 원',disabled:state.cash<s.price},...(state.turn===2?[{id:'all',label:'남은 돈 전부 산다',note:'현금을 거의 남기지 않음',disabled:state.cash<s.price}]:[])];
 if(s.kind==='expense')return [{id:'pay',label:'현금으로 낸다',note:state.cash>=paymentAmount(state)?'주식을 그대로 유지':'현금 부족 · 종료',disabled:false},{id:'fund',label:'필요한 만큼 판다',note:state.cash>=paymentAmount(state)?'매도 없이 현금 결제':'부족한 금액만 마련'}];
 return s.choices;
}
export const availableActions=state=>options(state).filter(o=>!o.disabled).map(o=>o.id);
export function choose(state,action){
 if(!availableActions(state).includes(action))throw Error('지금은 선택할 수 없습니다.');
 const s={...currentScene(state),expense:paymentAmount(state)},o=options(state).find(o=>o.id===action);let {cash,shares,calm,spent}=state;let health=state.health??80;let quantity=0,ending=null,note=o.note;let friendLoan=state.friendLoan||0;
 if(s.kind==='rebalance'){if(action==='compare'){const target=Math.floor((cash+shares*s.price)*0.5/s.price);quantity=target-shares;cash-=quantity*s.price;shares=target;}note=action==='compare'?'주식 비중을 약 50%로 조절했습니다.':'현재 투자 비중을 유지했습니다.';}else if(s.kind==='friend'){const amount=action==='lend300'?1000000:action==='lend100'?500000:0;cash-=amount;friendLoan+=amount;}else if(s.kind==='trade'){
 quantity=['buy','all'].includes(action)?Math.floor((action==='all'?cash:Math.min(ORDER_BUDGET,cash))/s.price):action==='sell'?Math.ceil(shares/2):0;
 const delta=['buy','all'].includes(action)?quantity:action==='sell'?-quantity:0;cash-=delta*s.price;shares+=delta;
 const ratio=metrics({cash,shares},s.price).ratio;
 const change=['buy','all'].includes(action)?(ratio>60?-14:-4):action==='sell'?5:0;calm+=change;
 note=action==='hold'?'보유 상태를 유지했습니다.':`${quantity}주 ${['buy','all'].includes(action)?'매수':'매도'}했습니다. 마음의 여유 ${change>0?'+':''}${change}.`;
 }else if(s.kind==='expense'){
 if(action==='fund'){quantity=Math.min(shares,Math.ceil(Math.max(0,s.expense-cash)/s.price));cash+=quantity*s.price;shares-=quantity;calm-=quantity?8:0;}
 if(cash<s.expense){ending='expense';note='오늘 필요한 돈을 마련하지 못했습니다. 이번 투자는 여기서 멈춥니다.';}
 else{cash-=s.expense;spent+=s.expense;note=`${(s.expense/10000)}만 원을 지불했습니다.${quantity?` ${quantity}주를 팔아 마련했고, 마음의 여유가 8 줄었습니다.`:' 남겨 둔 현금으로 해결했습니다.'}`;}
 }else{calm+=o.calm;if(state.turn===3){health=Math.max(0,Math.min(100,health+(action==='pause'?10:-10)));note=action==='pause'?'알림을 끄고 쉬었습니다. 건강 +10.':'계속 시세를 확인하느라 지쳤습니다. 건강 −10.';}}
 calm=Math.max(0,Math.min(100,calm));
 if(s.kind==='event'&&state.turn!==3){health=Math.max(0,Math.min(100,health+(o.calm>0?10:-10)));}
 const record={turn:state.turn,action,label:o.label,price:s.price,quantity,cash,shares,calm,health,spent,note,ending};
 return checkHealth({...state,...(friendLoan?{friendLoan}:{}),cash,shares,calm,health,spent,ending,phase:'feedback',history:[...state.history,record]});
}
export function advance(state){
 if(state.phase!=='feedback')throw Error('선택을 먼저 해주세요.');
 if(state.ending||state.turn===SCENES.length-1)return {...state,phase:'result'};
 const turn=state.turn<3?3:state.turn+1,fall=currentScene({...state,turn}).price<currentScene(state).price;
 const stress=fall?Math.ceil(metrics(state,currentScene(state).price).ratio/10):0;
 const calm=Math.max(0,state.calm-stress);
 const payday=BILL_TURNS.includes(turn);
 const repaid=turn===14&&(state.friendLoan||0)>0;
 return {...state,...(repaid?{cash:state.cash+state.friendLoan,friendLoan:0,friendRepaid:state.friendLoan}:{}),...(payday?{cash:state.cash+(repaid?state.friendLoan:0)+3000000,salaryIncome:(state.salaryIncome||0)+3000000}:{}),turn,calm,phase:'play',ending:null,marketNote:stress?`주가 하락으로 마음의 여유 −${stress}. 투자 비중이 높을수록 부담이 커집니다.`:null};
}
export function result(state){const {equity,stock}=metrics(state);const profit=equity+state.spent-INITIAL_CASH-(state.bonus||0)-(state.salaryIncome||0);return {equity,profit,rate:profit/INITIAL_CASH*100,stockValue:stock};}
export function restore(raw){try{
 const saved=JSON.parse(raw);if(saved?.version!==3||!Array.isArray(saved.history)||saved.history.length>SCENES.length+1)return freshRun();
 if(saved.history.length>=SCENES.length){saved.history=saved.history.slice(0,SCENES.length);if(saved.turn>=SCENES.length)saved.phase='result';}
 let run={...freshRun(),immediateExpenses:saved.immediateExpenses===true};const cuts=Array.isArray(saved.cuts)?saved.cuts:[];const grants=Array.isArray(saved.grants)?saved.grants.filter((g,i,a)=>['survey','reflection-rise','reflection-short','reflection-final','reflection-need','app-feedback'].includes(g.id)&&Number.isInteger(g.at)&&g.at>=0&&a.findIndex(x=>x.id===g.id)===i):[];
 const apply=()=>{for(const c of cuts.filter(c=>c.at===run.history.length&&c.turn===run.turn)){const phase=run.phase;run=reduceExpense({...run,phase:'play'},c.id);run.phase=phase;}for(const g of grants.filter(g=>g.at===run.history.length))run=award(run,g.id);};apply();
 if(!saved.history.length){if(grants.length)run={...run,grants};return saved.phase==='play'?{...run,phase:'play'}:run;}
 run.phase='play';
 for(let i=0;i<saved.history.length;i++){
 if(run.turn===3&&[1,2].includes(saved.history[i].turn)&&saved.history[i].turn>run.history.at(-1)?.turn)run={...run,turn:saved.history[i].turn};
 const savedAction=run.turn===11&&saved.history[i].action==='search'?'rest':saved.history[i].action;
 run=choose(run,run.turn===6&&['read','rush'].includes(savedAction)?'hold':savedAction);
 if(i<saved.history.length-1||saved.phase!=='feedback')run=advance(run);
 apply();
 }
 if([1,2].includes(run.turn)&&run.phase==='feedback')run=advance(run);
 if(grants.length)run={...run,grants};
 return run.phase===saved.phase||[1,2].includes(saved.turn)?run:freshRun();
 }catch{return freshRun();}}

export function goBack(state){
 if(state.phase==='intro')return state;
 let index=state.history.length-1;
 while(index>=0&&SCENES[state.history[index].turn]?.removed)index--;
 if(index<0)return restore(JSON.stringify({...state,phase:'intro',history:[],cuts:[]}));
 const next=restore(JSON.stringify({...state,phase:'play',history:state.history.slice(0,index),cuts:(state.cuts||[]).filter(c=>c.at<index)}));
 return state.grants?.length?{...next,grants:state.grants}:next;
}

export function award(state,id){
 if(!['survey','reflection-rise','reflection-short','reflection-final','reflection-need','app-feedback'].includes(id)||(state.grants||[]).some(g=>g.id===id))return state;
 const amount=['survey','reflection-final','app-feedback'].includes(id)?2_500_000:5_000_000;
 return {...state,cash:state.cash+amount,bonus:(state.bonus||0)+amount,grants:[...(state.grants||[]),{id,at:state.history.length}]};
}
