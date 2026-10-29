// Freshness is a product safeguard, not a claim that prices cannot change sooner.
const MAX_TARIFF_AGE_DAYS=30;
function dateAge(value,today){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return Infinity;let d=new Date(value+'T00:00:00Z'),now=new Date(today+'T00:00:00Z');if(!Number.isFinite(+d)||d.toISOString().slice(0,10)!==value)return Infinity;return Math.floor((now-d)/86400000)}
function freshDate(value,today){let age=dateAge(value,today);return age>=0&&age<=MAX_TARIFF_AGE_DAYS}
const num=v=>v!==''&&v!==null&&v!==undefined&&Number.isFinite(+v)&&+v>=0;
function session(t,l,{demo=false,today=new Date().toISOString().slice(0,10)}={}){
 if(!t||!t.available||!t.confirmed||(!demo&&t.demo)||!t.date||t.date>today||(!demo&&(!t.source?.trim()||!freshDate(t.date,today)))||['kwh','start','minute','free','pct','idle','grace','other'].some(k=>!num(t[k]))||!['','session','energy'].includes(t.scope)||(!num(t.cap)&&t.cap!=='')||['kwh','minutes','idleMinutes','parking'].some(k=>!num(l[k])))return null;
 let energy=l.kwh*t.kwh,start=+t.start;
 let time=Math.max(0,l.minutes-t.free)*t.minute;
 if(t.cap!=='')time=Math.min(time,+t.cap);
 let idle=Math.max(0,l.idleMinutes-t.grace)*t.idle,other=+t.other,parking=+l.parking;
 let markup=(t.scope==='energy'?energy:energy+start+time+idle+other)*t.pct/100;
 return {energy,start,time,idle,other,markup,parking,total:energy+start+time+idle+other+markup+parking};
}
function calculate(plans,locations,max=1,opts={}){
 const active=locations.filter(l=>num(l.n)&&+l.n>0);if(!active.length||active.some(l=>!Number.isInteger(+l.n)))return [];
 let sets=plans.map(p=>[p]);if(max===2)for(let i=0;i<plans.length;i++)for(let j=i+1;j<plans.length;j++)if(plans[i].provider!==plans[j].provider||!plans[i].provider)sets.push([plans[i],plans[j]]);
 return sets.flatMap(set=>{
 if(set.some(p=>!num(p.month)))return [];
 let variable=0,routes=[];
 for(let l of active){let choices=set.map(p=>({p,c:session(p.tariffs[l.id],l,opts)})).filter(x=>x.c).sort((a,b)=>a.c.total-b.c.total);if(!choices.length)return [];
 const {p,c}=choices[0];variable+=c.total*l.n;routes.push({location:l,plan:p,breakdown:c,total:c.total*l.n});}
 // Avoid recommending a second card which is never used.
 if(set.length>1&&new Set(routes.map(r=>r.plan.id)).size<2)return [];
 let fixed=set.reduce((s,p)=>s+ +p.month,0),once=0;
 return [{set,variable,fixed,once,month:variable+fixed,year:12*(variable+fixed),routes}];
 });
}
if(typeof module!=='undefined')module.exports={session,calculate,dateAge,freshDate,MAX_TARIFF_AGE_DAYS};
