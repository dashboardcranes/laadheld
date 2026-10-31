import app from './index.js';

const alternateHosts = new Set(['www.laadheld.nl', 'laadheld.onlineworker.workers.dev']);
const guides = new Set(['laadpas-vergelijken', 'laadkosten-berekenen', 'openbaar-laden']);

export default {async fetch(request,env,ctx){
 const url = new URL(request.url);
 // Consolidate public production aliases without affecting local/preview hosts.
 if (['GET', 'HEAD'].includes(request.method) &&
     (alternateHosts.has(url.hostname) || (url.hostname === 'laadheld.nl' && url.protocol === 'http:'))) {
  url.protocol = 'https:';
  url.hostname = 'laadheld.nl';
  url.port = '';
  if (url.pathname === '/index.html') url.pathname = '/';
  const guide = url.pathname.slice(1).replace(/\.html$/, '');
  if (guides.has(guide)) url.pathname = '/' + guide + '/';
  return Response.redirect(url.href, 301);
 }
 const headers=new Headers(request.headers);headers.delete('Authorization');
 const response=await app.fetch(new Request(request,{headers}),env,ctx);
 const result=new Response(response.body,response);
 result.headers.set('Referrer-Policy','same-origin');
 const path=url.pathname;
 if(response.status >= 400 || path.startsWith('/api/') || path.startsWith('/tariffs/') || /\.(json|txt)$/.test(path)&&path!=='/robots.txt') result.headers.set('X-Robots-Tag','noindex');
 return result;
}};
