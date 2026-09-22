import {rest,json} from './_supabase.mjs';
export default async function handler(req,res){
 if(req.headers['x-once']!=='A2A0156E-AB4F-4C6F-A165-53A388DB03E2')return json(res,401,{});
 const r=await rest('events?visitor_id=eq.deploy-check',{method:'DELETE',headers:{prefer:'return=representation'}});
 json(res,r.status,{deleted:(await r.json()).length});
}
