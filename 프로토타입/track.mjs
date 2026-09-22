// 사용자 선택·설문 기록을 /api/track 으로 보냅니다. 실패해도 게임은 계속됩니다.
const VISITOR='prototype-visitor-id',SESSION='prototype-session-id';
const uuid=()=>crypto.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
function id(key,renew=false){let v=null;try{v=renew?null:localStorage.getItem(key);if(!v){v=uuid();localStorage.setItem(key,v);}}catch{v=v||uuid();}return v;}
export const visitorId=()=>id(VISITOR);
export const sessionId=()=>id(SESSION);
export const newSession=()=>id(SESSION,true);
export function track(kind,payload={},{stage=null,turn=null}={}){
 const body={visitor_id:visitorId(),session_id:sessionId(),stage,turn,kind,payload};
 try{fetch('/api/track',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),keepalive:true}).catch(()=>{});}catch{}
}
