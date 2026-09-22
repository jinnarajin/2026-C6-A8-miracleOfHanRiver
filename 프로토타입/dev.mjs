// 로컬 확인용: 정적 파일 + /api 를 Vercel 없이 띄웁니다. SUPABASE_URL 이 없으면 메모리 DB 를 씁니다.
// 실행: node dev.mjs  →  http://127.0.0.1:4174/  (대시보드 비밀번호: DASHBOARD_PASSWORD, 기본 dev)
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
process.env.DASHBOARD_PASSWORD??='dev';
if(!process.env.SUPABASE_URL){process.env.SUPABASE_URL='http://mock';process.env.SUPABASE_SERVICE_ROLE_KEY='mock';const mem=[];const real=globalThis.fetch;
 globalThis.fetch=(u,i={})=>{if(!String(u).startsWith('http://mock'))return real(u,i);if(i.method==='POST'){mem.unshift({id:mem.length+1,created_at:new Date().toISOString(),...JSON.parse(i.body)});return Promise.resolve(new Response(null,{status:201}));}return Promise.resolve(Response.json(mem));};}
const track=(await import('./api/track.mjs')).default,events=(await import('./api/events.mjs')).default;
const types={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json'};
http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://x');res.status=c=>(res.statusCode=c,res);
 if(url.pathname.startsWith('/api/')){let body='';for await(const c of req)body+=c;req.body=body?JSON.parse(body):{};return (url.pathname==='/api/track'?track:events)(req,res);}
 const file=path.join(import.meta.dirname,url.pathname==='/'?'index.html':url.pathname);
 try{res.setHeader('content-type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.status(404).end();}
}).listen(process.env.PORT||4174,'127.0.0.1',()=>console.log('http://127.0.0.1:4174/'));
