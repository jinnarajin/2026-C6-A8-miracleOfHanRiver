export const START=1500000;
export const SCENES2=[
 {price:100,title:'친구의 새로운 추천',text:'민준이 메시지를 보냈습니다. “이번엔 2배 레버리지 상품에 투자해 볼래? 오를 때 더 크게 오르지만, 떨어질 때도 더 크게 떨어져.”',kind:'trade'},
 {price:110,title:'더 크게 오른 상품',text:'이번 턴에 삼성전자는 10%, 레버리지 상품은 20% 올랐습니다. 수익이 더 커지니 더 사고 싶은 마음이 드나요?',kind:'trade'},
 {price:85,title:'하락도 더 크게',text:'이번에는 두 상품 모두 떨어졌습니다. 레버리지 상품의 하락폭이 더 큽니다. 가격이 오를 때와 지금의 마음은 어떻게 다른가요?',kind:'trade'},
 {price:60,title:'흔들림을 감당할 수 있을까',text:'가격이 한 번 더 내려갔습니다. 같은 금액을 투자했어도 레버리지 상품은 더 크게 흔들립니다. 남은 투자금을 확인해 보세요.',kind:'observe'},
 {price:60,title:'투자와 별개로 돌아오는 생활비',text:'생활비 170만 원을 결제할 날입니다. 필요한 만큼 현금을 마련해 보세요.',kind:'bill',bill:1700000},
 {price:95,title:'오를 때도 더 크게',text:'가격이 반등했습니다. 레버리지 상품도 크게 올랐지만, 큰 하락 뒤에는 회복까지 더 많은 상승이 필요합니다.',kind:'trade'},
 {price:75,title:'내가 감당할 투자 규모',text:'다시 가격이 내려갑니다. 더 크게 오를 가능성만큼 더 크게 떨어질 가능성도 감당할 수 있나요?',kind:'trade'},
 {price:105,title:'마지막 생활비 결제',text:'생활비 170만 원을 결제하고 이번 선택을 돌아봅니다.',kind:'bill',bill:1700000}
];
export function fresh2(){return {version:2,phase:'intro',turn:0,cash:START,units:0,leverUnits:0,spent:0,grants:0,history:[],answers:[]};}
export function continueFrom1(previous,price){const initialGrant=(previous.grants||[]).some(g=>g.id==='survey')?2500000:0;return {...fresh2(),phase:'play',cash:previous.cash+(previous.friendLoan||0),units:previous.shares,basePrice:price,initialCapital:2500000+initialGrant,health:previous.health??80,salaryIncome:previous.salaryIncome||0,spent:previous.spent,grants:(previous.bonus||0)-initialGrant,source:structuredClone(previous),sourceSignature:JSON.stringify(previous)};}
export function price2(s){return SCENES2[s.turn].price*(s.basePrice||100)/100;}
export function leveragePrice2(s){let price=10000;for(let i=1;i<=s.turn;i++)price*=Math.max(0,1+2*(SCENES2[i].price/SCENES2[i-1].price-1));return price;}
export function changes2(s){const normal=s.turn?SCENES2[s.turn].price/SCENES2[s.turn-1].price-1:0;return {normal:normal*100,leverage:normal*200};}
export function value2(s){const samsung=Math.round(s.units*price2(s)),leverage=Math.round(s.leverUnits*leveragePrice2(s)),stock=samsung+leverage;return {samsung,leverage,stock,equity:s.cash+stock,profit:s.cash+stock+s.spent-(s.initialCapital??START)-s.grants-(s.salaryIncome||0)};}
export function bill2(s){return (SCENES2[s.turn].bill||0)+(s.medical?.bill===s.turn?500000:0);}
export function health2(s){if((s.health??80)>40||s.medical)return s;const bill=SCENES2.findIndex((x,i)=>i>=s.turn&&x.kind==='bill');return bill<0?s:{...s,medical:{bill,amount:500000}};}
export function purchasePlan2(s,actions){
 if(!actions.length)return [];
 const budget=Math.min(1000000,s.cash/actions.length);
 return actions.map(action=>{const price=action==='buy'?price2(s):leveragePrice2(s),quantity=Math.floor(budget/price);return {action,quantity,cost:quantity*price};});
}
export function actions2(s){if(s.phase!=='play')return [];const scene=SCENES2[s.turn];if(scene.kind==='bill')return ['pay'];if(scene.kind==='observe')return ['next'];if(s.turn===0)return ['hold',...(s.cash>=leveragePrice2(s)?['leverBuy']:[])];return ['hold','rest',...(purchasePlan2(s,['buy','leverBuy']).every(p=>p.quantity>0)?['buyBoth']:[]),...(s.cash>=price2(s)?['buy']:[]),...(s.cash>=leveragePrice2(s)?['leverBuy']:[]),...(s.leverUnits?['leverSell']:[]),...(s.units?['sell']:[])];}
export function step2(s,action){if(!actions2(s).includes(action))throw Error('선택할 수 없습니다.');s=structuredClone(s);const before=value2(s);let quantity=0;if(action==='rest')s.health=Math.min(100,(s.health??80)+15);
 if(action==='buy'||action==='leverBuy'){const price=action==='buy'?price2(s):leveragePrice2(s);quantity=Math.floor(Math.min(1000000,s.cash)/price);s.cash-=quantity*price;if(action==='buy')s.units+=quantity;else s.leverUnits+=quantity;}
 if(action==='buyBoth'){quantity=purchasePlan2(s,['buy','leverBuy']);for(const item of quantity){s.cash-=item.cost;if(item.action==='buy')s.units+=item.quantity;else s.leverUnits+=item.quantity;}}
 if(action==='sell'){quantity=s.units;s.cash+=value2(s).samsung;s.units=0;}
 if(action==='leverSell'){quantity=s.leverUnits;s.cash+=value2(s).leverage;s.leverUnits=0;}
 if(action==='pay'){const due=bill2(s);for(const [key,price] of [['leverUnits',leveragePrice2(s)],['units',price2(s)]]){if(s.cash>=due)break;const count=Math.min(s[key],Math.ceil((due-s.cash)/price));s[key]-=count;s.cash+=count*price;}if(s.cash<due)return {...s,phase:'support'};s.cash-=due;s.spent+=due;}
 const labels={buyBoth:'삼성전자와 레버리지 상품을 산다',hold:'그대로 둔다',rest:'쉬어 간다',buy:'삼성전자를 산다',leverBuy:'레버리지 상품을 산다',sell:'삼성전자를 판다',leverSell:'레버리지 상품을 판다',pay:'생활비를 결제한다',next:'다음 장면으로'};
 s.history.push({turn:s.turn,action,label:labels[action],quantity,before,after:value2(s)});if(s.turn===7)return {...s,phase:'result'};s.turn++;if(SCENES2[s.turn].kind==='bill'){s.cash+=3000000;s.salaryIncome=(s.salaryIncome||0)+3000000;}return health2(s);}
export function support2(s,answer){if(s.phase!=='support')return s;const amount=s.appFeedback?2500000:s.needSurvey?5000000:Math.max(1000000,bill2(s)-s.cash);return {...s,needSurvey:false,appFeedback:false,phase:'play',cash:s.cash+amount,grants:s.grants+amount,answers:[...s.answers,{turn:s.turn,answer,amount,kind:s.appFeedback?'app-feedback':s.needSurvey?'reflection-need':'emergency'}]};}
export function restore2(raw){try{const s=JSON.parse(raw);if(s.version!==2||!['intro','play','support','result'].includes(s.phase)||!Number.isInteger(s.turn)||s.turn<0||s.turn>=8)return fresh2();if(!['cash','units','leverUnits','spent','grants'].every(k=>Number.isFinite(s[k])&&s[k]>=0)||!['history','answers'].every(k=>Array.isArray(s[k])))return fresh2();return s;}catch{return fresh2();}}

export function cashShort2(s){
 const bill=SCENES2.findIndex((scene,index)=>index>=s.turn&&scene.kind==='bill');
 const due=bill<0?0:SCENES2[bill].bill+(s.medical?.bill===bill?500000:0);
 return s.cash<due||(SCENES2[s.turn].kind==='trade'&&s.cash<Math.max(price2(s),leveragePrice2(s)));
}
