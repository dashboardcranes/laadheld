const test=require('node:test'),assert=require('node:assert/strict');
const {safeSourceURL,sourceDate,validateCatalog}=require('../web/catalog.js');
const {session,calculate}=require('../web/calc.js');
const data=require('../web/catalog-fallback.json');
test('source snapshot has licensed provider records and no duplicate slugs',()=>{validateCatalog(data);assert.equal(new Set(data.passen.map(p=>p.slug)).size,data.passen.length);assert(data.passen.length>=18)});
test('external links allow only HTTPS, never executable URLs',()=>{assert.equal(safeSourceURL('javascript:alert(1)'),'');assert.equal(safeSourceURL('data:text/html,x'),'');assert.equal(safeSourceURL('https://example.com/'),'https://example.com/')});
test('Dutch source dates convert without locale assumptions',()=>{assert.equal(sourceDate('25 september 2026'),'2026-09-25');assert.equal(sourceDate('onbekend'),'')});
test('missing licence rejects an unverified remote replacement',()=>assert.throws(()=>validateCatalog({passen:[{naam:'Test',slug:'test'}]})));
test('unknown imported fixed costs cannot enter monthly ranking',()=>{const l={id:1,n:2,kwh:20,minutes:60,idleMinutes:0,parking:0},t={available:true,confirmed:true,kwh:.5,start:0,minute:0,free:0,cap:'',pct:0,scope:'session',idle:0,grace:0,other:0,date:'2026-10-25',source:'App'};assert(session(t,l));assert.deepEqual(calculate([{id:1,month:'',once:'',tariffs:{1:t}}],[l]),[])});
