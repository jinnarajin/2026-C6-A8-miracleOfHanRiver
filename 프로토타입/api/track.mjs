import {rest,json} from './_supabase.mjs';
const KINDS=new Set(['choice','expense_reduce','restart','form_open','form_complete','reward_granted','offer_skipped','answer','stage1_result','stage2_result','support','stage2_choice','stage2_answer']);
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'POST only'});
 const b=req.body||{};
 if(typeof b.visitor_id!=='string'||b.visitor_id.length>64||!KINDS.has(b.kind)||JSON.stringify(b.payload||{}).length>20000)return json(res,400,{error:'bad request'});
 const row={visitor_id:b.visitor_id,session_id:String(b.session_id||'').slice(0,64),stage:b.stage??null,turn:b.turn??null,kind:b.kind,payload:b.payload||{}};
 const r=await rest('events',{method:'POST',headers:{prefer:'return=minimal'},body:JSON.stringify(row)});
 json(res,r.ok?204:502,r.ok?{}:{error:await r.text()});
}
