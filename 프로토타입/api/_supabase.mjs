export const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
export function rest(path,init={}){
 return fetch(`${url}/rest/v1/${path}`,{...init,headers:{apikey:key,authorization:`Bearer ${key}`,'content-type':'application/json',...(init.headers||{})}});
}
export function json(res,status,body){res.status(status).setHeader('content-type','application/json');res.end(JSON.stringify(body));}
