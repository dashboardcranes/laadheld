import app from './index.js';
export default {async fetch(request,env,ctx){
 const headers=new Headers(request.headers);headers.delete('Authorization');
 const response=await app.fetch(new Request(request,{headers}),env,ctx);
 const result=new Response(response.body,response);result.headers.set('Referrer-Policy','same-origin');const path=new URL(request.url).pathname;if(path.startsWith('/api/')||path.startsWith('/tariffs/')||/\.(json|txt)$/.test(path)&&path!=='/robots.txt')result.headers.set('X-Robots-Tag','noindex');return result;
}};
