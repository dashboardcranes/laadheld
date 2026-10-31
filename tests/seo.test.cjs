const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const load=()=>import('../worker/public.mjs');
const ctx={waitUntil(){}};
test('canonical SEO pages return crawlable HTML without running JavaScript',async()=>{const {default:w}=await load();for(const path of ['/','/laadpas-vergelijken/','/laadkosten-berekenen/','/openbaar-laden/']){const r=await w.fetch(new Request('https://laadheld.nl'+path),{},ctx),html=await r.text();assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/text\/html/);assert(html.includes('rel="canonical" href="https://laadheld.nl'+path+'"'));assert.match(html,/<h1>/);assert.doesNotMatch(html,/noindex/);const data=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);assert.equal(data['@context'],'https://schema.org')}});
test('sitemap, robots and favicon have their own content types and no invented modification dates',async()=>{const {default:w}=await load();const r=await w.fetch(new Request('https://laadheld.nl/sitemap.xml'),{},ctx),xml=await r.text();assert.match(r.headers.get('content-type'),/application\/xml/);assert.equal([...xml.matchAll(/<loc>/g)].length,4);assert.doesNotMatch(xml,/workers\.dev|<lastmod>/);const robots=await (await w.fetch(new Request('https://laadheld.nl/robots.txt'),{},ctx)).text();assert.match(robots,/Sitemap: https:\/\/laadheld.nl\/sitemap.xml/);assert.doesNotMatch(robots,/Disallow: \/(?:api|.*\.js)/);const icon=await w.fetch(new Request('https://laadheld.nl/favicon.svg'),{},ctx);assert.match(icon.headers.get('content-type'),/image\/svg/)});
test('duplicate page aliases redirect to preferred paths and data APIs stay out of search results',async()=>{const {default:w}=await load();for(const [path,target] of [['/index.html','/'],['/laadpas-vergelijken.html','/laadpas-vergelijken/'],['/openbaar-laden','/openbaar-laden/']]){const r=await w.fetch(new Request('https://laadheld.nl'+path),{},ctx);assert.equal(r.status,301);assert.equal(r.headers.get('location'),'https://laadheld.nl'+target)}const health=await w.fetch(new Request('https://laadheld.nl/api/health'),{},ctx);assert.equal(health.headers.get('x-robots-tag'),'noindex');assert.equal((await w.fetch(new Request('https://laadheld.nl/does-not-exist'),{},ctx)).status,404)});

test('production host aliases consolidate to HTTPS canonical paths in one hop',async()=>{
 const {default:w}=await load();
 for(const origin of ['http://laadheld.nl','https://www.laadheld.nl','https://laadheld.onlineworker.workers.dev']){
  for(const [path,target] of [['/','/'],['/index.html','/'],['/laadpas-vergelijken.html','/laadpas-vergelijken/'],['/openbaar-laden','/openbaar-laden/'],['/api/health','/api/health']]){
   for(const method of ['GET','HEAD']){
    const r=await w.fetch(new Request(origin+path+'?ref=check',{method}),{},ctx);
    assert.equal(r.status,301);assert.equal(r.headers.get('location'),'https://laadheld.nl'+target+'?ref=check');
   }
  }
 }
 assert.equal((await w.fetch(new Request('https://preview.example/'),{},ctx)).status,200);
 const missing=await w.fetch(new Request('https://laadheld.nl/missing-page'),{},ctx);
 assert.equal(missing.status,404);assert.equal(missing.headers.get('x-robots-tag'),'noindex');
});

test('guide breadcrumbs describe the visible navigation and canonical URL',async()=>{
 const {default:w}=await load();
 for(const slug of ['laadpas-vergelijken','laadkosten-berekenen','openbaar-laden']){
  const html=await(await w.fetch(new Request('https://laadheld.nl/'+slug+'/'),{},ctx)).text();
  const blocks=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  const crumb=blocks.find(b=>b['@type']==='BreadcrumbList');
  assert.equal(crumb.itemListElement[0].item,'https://laadheld.nl/');
  assert.equal(crumb.itemListElement[1].item,'https://laadheld.nl/'+slug+'/');
  assert(html.includes(crumb.itemListElement[1].name));
 }
});
