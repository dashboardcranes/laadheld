const test=require('node:test'),assert=require('node:assert/strict'),{session,calculate}=require('../web/calc.js');
const opts={today:'2026-10-25'},l={id:1,name:'Paal',n:4,kwh:20,minutes:180,idleMinutes:60,parking:2};
const t={available:true,confirmed:true,kwh:.4,start:.5,minute:.1,free:120,cap:3,pct:10,scope:'session',idle:.05,grace:10,other:1,date:'2026-10-25',source:'Aanbieder-app',demo:false};
const p=(id,rate,month=0,provider='')=>({id,name:'Pas '+id,provider,month,once:3,owned:false,tariffs:{1:{...t,kwh:rate}}});
test('time cap, idle grace and percentage exclude parking',()=>{let r=session(t,l,opts);assert.equal(r.time,3);assert.equal(r.idle,2.5);assert.equal(r.markup,1.5);assert.equal(r.total,18.5)});
test('energy-only markup',()=>{let r=session({...t,scope:'energy'},l,opts);assert.equal(r.markup,.8);assert.equal(r.total,17.8)});
test('unknown, unavailable, unconfirmed and future data are excluded',()=>{for(let patch of [{kwh:''},{start:''},{available:false},{confirmed:false},{date:'2026-10-26'},{date:''},{source:''},{cap:-1},{idle:''},{demo:true}])assert.equal(session({...t,...patch},l,opts),null)});
test('demo rates require explicit demo mode',()=>{assert(session({...t,demo:true},l,{...opts,demo:true}))});
test('annual costs count subscriptions and exclude one-off card and shipping costs',()=>{let r=calculate([p(1,.4,4)],[l],1,opts)[0];assert.equal(r.month,78);assert.equal(r.year,936);let owned=calculate([{...p(1,.4,4),owned:true}],[l],1,opts)[0];assert.equal(owned.year,936)});
test('two cards cover separate locations and both subscriptions counted',()=>{let a=p(1,.2,1),b=p(2,.3,2);b.tariffs={2:{...t,kwh:.3}};let ls=[l,{...l,id:2,n:1}];assert.equal(calculate([a,b],ls,1,opts).length,0);let r=calculate([a,b],ls,2,opts);assert.equal(r.length,1);assert.equal(r[0].fixed,3);assert.equal(r[0].once,0)});
test('unused second cards and same-provider combinations are removed',()=>{let a=p(1,.2,1,'same'),b=p(2,.3,2,'same');assert.equal(calculate([a,b],[l],2,opts).length,2);b.provider='different';assert.equal(calculate([a,b],[l],2,opts).length,2)});
test('zero and fractional session counts cannot produce monthly advice',()=>{assert.equal(calculate([p(1,.4)],[{...l,n:0}],1,opts).length,0);assert.equal(calculate([p(1,.4)],[{...l,n:1.5}],1,opts).length,0)});

test('unknown or very high legacy shipping costs cannot block or change ranking',()=>{const a=p(1,.4,4);const zero=calculate([{...a,once:0}],[l],1,opts)[0];for(const once of ['',null,undefined,999999]){const r=calculate([{...a,once}],[l],1,opts)[0];assert.equal(r.month,zero.month);assert.equal(r.year,zero.year)}});
