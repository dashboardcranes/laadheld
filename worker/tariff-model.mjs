// A source tariff is a CPO price, never an assumed roaming price.
function publishedModel(t,date){
 const fail=reason=>({reason});
 if(!t||t.country_code!=='NL'||t.currency!=='EUR'||t.type&&t.type!=='REGULAR'||t.min_price||t.max_price)return fail('Geen volledig standaardtarief in euro.');
 const now=Date.now();
 if(t.start_date_time&&(!Number.isFinite(Date.parse(t.start_date_time))||Date.parse(t.start_date_time)>now)||t.end_date_time&&(!Number.isFinite(Date.parse(t.end_date_time))||Date.parse(t.end_date_time)<=now))return fail('Het tarief is niet geldig voor de gekozen datum.');
 const out={kwh:0,start:0,minute:0,idle:0,components:[]};let energy=false,active=0;
 for(const el of t.elements||[]){const r=el.restrictions||{};
 if(r.start_date&&r.start_date>date||r.end_date&&r.end_date<date)continue;
 if(Object.entries(r).some(([k,v])=>!['start_date','end_date'].includes(k)&&v!=null&&(!Array.isArray(v)||v.length)))return fail('Tijdvensters, staffels of drempels vereisen een specifieke sessiecontrole.');
 if(!el.price_components?.length)return fail('Een kostencomponent ontbreekt.');active++;
 for(const c of el.price_components){
 if(typeof c.price!=='number'||!Number.isFinite(c.price)||c.price<0)return fail('Een bedrag ontbreekt.');
 if(c.type==='ENERGY')energy=true;
 if(c.price===0)continue; // Zero has no VAT or rounding exposure.
 if(typeof c.vat!=='number'||!Number.isFinite(c.vat)||c.vat<0||c.vat>100)return fail('De btw van een betaald tariefonderdeel ontbreekt.');
 if(!Number.isInteger(c.step_size)||c.step_size<1||c.type==='FLAT'&&c.step_size!==1)return fail('De afrekenstap is niet volledig beschreven.');
 const price=c.price*(1+c.vat/100);out.components.push({type:c.type,price,step:c.step_size});
 if(c.type==='ENERGY')out.kwh+=price;else if(c.type==='FLAT')out.start+=price;else if(c.type==='TIME')out.minute+=price/60;else if(c.type==='PARKING_TIME')out.idle+=price/60;else return fail('Een aanvullend kostentype wordt nog niet ondersteund.');
 }}
 if(!active||!energy)return fail('Geen volledige energiekosten beschikbaar.');
 return {model:out,modified:t.last_updated||null};
}
function pointPublishedModel(point,tariffs,date){
 if(!point.groups?.length||point.groups.some(g=>!g.tariff_ids?.length))return {reason:'De tariefkoppeling van een aansluiting ontbreekt.'};
 const ids=[...new Set(point.groups.flatMap(g=>g.tariff_ids))],models=[];
 for(const id of ids){const t=tariffs.find(t=>t.id===id&&t.party_id===point.party&&t.country_code==='NL');if(!t)return {reason:'Een gekoppelde tariefdefinitie ontbreekt bij de bron.'};const m=publishedModel(t,date);if(m.reason)return m;models.push(m);}
 if(!models.length||models.some(m=>JSON.stringify(m.model)!==JSON.stringify(models[0].model)))return {reason:'De aansluitingen hebben verschillende tarieven; kies een specifieke aansluiting.'};
 return {...models[0],tariffIds:ids};
}
