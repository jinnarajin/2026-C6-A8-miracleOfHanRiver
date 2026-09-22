import {rest,json} from './_supabase.mjs';
export default async function handler(req,res){
 if(!process.env.DASHBOARD_PASSWORD||req.headers['x-dashboard-key']!==process.env.DASHBOARD_PASSWORD)return json(res,401,{error:'unauthorized'});
 const r=await rest('events?select=*&order=created_at.desc&limit=5000');
 const body=await r.text();res.status(r.status).setHeader('content-type','application/json');res.end(body);
}
