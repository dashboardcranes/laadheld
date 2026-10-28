import { timingSafeEqual } from 'node:crypto';
const encoder=new TextEncoder();
function equalSecret(a,b){const aa=encoder.encode(a),bb=encoder.encode(b);if(aa.byteLength!==bb.byteLength){timingSafeEqual(bb,bb);return false}return timingSafeEqual(aa,bb)}
export function requirePrivateAccess(request,env){
 if(new URL(request.url).protocol!=='https:')return new Response('Gebruik de HTTPS-link.',{status:403,headers:{'Cache-Control':'no-store'}});
 if(typeof env.LAADHELD_PASSWORD!=='string'||env.LAADHELD_PASSWORD.length<24)return new Response('Privétoegang wordt ingesteld.',{status:503,headers:{'Cache-Control':'no-store'}});
 const denied=()=>new Response('Laadheld is privé. Meld je aan met je gebruikersnaam en wachtwoord.',{status:401,headers:{'WWW-Authenticate':'Basic realm="Laadheld prive", charset="UTF-8"','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
 const header=request.headers.get('Authorization')||'';if(header.length>2048||!/^Basic [A-Za-z0-9+/]+={0,2}$/i.test(header))return denied();
 let decoded;try{decoded=atob(header.slice(6))}catch{return denied()}
 const split=decoded.indexOf(':');if(split<0)return denied();
 const user=equalSecret(decoded.slice(0,split),env.LAADHELD_USER||'eduard'),pass=equalSecret(decoded.slice(split+1),env.LAADHELD_PASSWORD);
 return user&&pass?null:denied();
}
