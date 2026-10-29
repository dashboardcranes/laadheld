const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const load=()=>import('data:text/javascript;base64,'+Buffer.from(fs.readFileSync('worker/index.js','utf8')).toString('base64'));
test('index isolates identical IDs by country and operator and never downloads national file',async()=>{
 const {indexedTariffs}=await load(),key=JSON.stringify(['NL','ABC','one']);let calls=0;
 const env={TARIFFS:{fetch:async req=>{calls++;assert.match(req.url,/\/tariffs\/[a-f0-9]{3}\.json$/);return new Response(JSON.stringify({fetchedAt:new Date().toISOString(),tariffs:{[key]:{country_code:'NL',party_id:'ABC',id:'one',elements:[]}}}))}}};
 assert.equal((await indexedTariffs(env,'NL','ABC',['one'])).tariffs.length,1);
 assert.equal((await indexedTariffs(env,'BE','ABC',['one'])).tariffs.length,0);assert.equal(calls,2);
});
test('expired index and unavailable binding cannot confirm a price',async()=>{
 const {indexedTariffs}=await load();await assert.rejects(indexedTariffs({},'NL','ABC',['one']));
 await assert.rejects(indexedTariffs({TARIFFS:{fetch:async()=>new Response(JSON.stringify({fetchedAt:'2020-01-01',tariffs:{}}))}},'NL','ABC',['one']));
});
