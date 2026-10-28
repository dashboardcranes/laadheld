import app from './index.js';
import {requirePrivateAccess} from './auth.mjs';
export default {async fetch(request,env,ctx){
 const denial=requirePrivateAccess(request,env);if(denial)return denial;
 const headers=new Headers(request.headers);headers.delete('Authorization');
 const response=await app.fetch(new Request(request,{headers}),env,ctx);
 const result=new Response(response.body,response);result.headers.set('Cache-Control','private, no-store');result.headers.set('X-Robots-Tag','noindex, nofollow');result.headers.set('Referrer-Policy','same-origin');return result;
}};
