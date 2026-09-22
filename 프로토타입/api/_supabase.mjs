export const url=(process.env.SUPABASE_URL||'').trim().replace(/\/(rest\/v1)?\/?$/,''),key=(process.env.SUPABASE_SERVICE_ROLE_KEY||'').trim();
// 새 sb_secret_ 키는 apikey 헤더만, 옛 service_role JWT 는 Bearer 도 함께 보냅니다.
const auth=key.startsWith('eyJ')?{authorization:`Bearer ${key}`}:{};
export function rest(path,init={}){
 return fetch(`${url}/rest/v1/${path}`,{...init,headers:{apikey:key,...auth,'content-type':'application/json',...(init.headers||{})}});
}
export function json(res,status,body){res.status(status).setHeader('content-type','application/json');res.end(JSON.stringify(body));}
