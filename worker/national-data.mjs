// Official provider rules reviewed 2026-10-25. Retrieval never renews this review.
const NATIONAL_REVIEW={checked:'2026-10-25',reviewAfter:'2026-11-24'};
const INCHARGE_PRICES=[.3256,.4903,.4899,.3624,.4619,.5222,.6534,.7744,.4734];
function nlCoordinates(lon,lat){return typeof lon==='number'&&typeof lat==='number'&&Number.isFinite(lon)&&Number.isFinite(lat)&&lon>=3.1&&lon<=7.6&&lat>=50.5&&lat<=53.7}
function pointSummary(f){const p=f.properties||{},groups=(p.availabilities||[]).filter(g=>g.power_type==='DC'||String(g.power_type).startsWith('AC'));return {id:f.id,address:p.address||f.id,operator:p.operator_name||'Onbekende exploitant',party:p.cpo_id,coordinates:f.geometry?.coordinates,groups,kw:Math.max(0,...groups.map(g=>Number(g.power_max)/1000||0)),type:groups.some(g=>g.power_type==='DC')?'DC':'AC'}}
function supportedNetwork(p){return p.id?.startsWith('NL-NUO-')&&p.party==='NUO'&&/^Vattenfall InCharge$/i.test(p.operator)||p.id?.startsWith('NL-FAS-')&&p.party==='FAS'&&/^Fastned$/i.test(p.operator)}
function flatEnergy(t,date,asOf=new Date().toISOString()){
 if(!t||t.country_code!=='NL'||t.currency!=='EUR'||t.type&&t.type!=='REGULAR'||t.min_price||t.max_price)return {reason:'Geen volledig standaardtarief in euro beschikbaar.'};
 if(t.start_date_time&&(!Number.isFinite(Date.parse(t.start_date_time))||Date.parse(t.start_date_time)>Date.parse(asOf))||t.end_date_time&&(!Number.isFinite(Date.parse(t.end_date_time))||Date.parse(t.end_date_time)<=Date.parse(asOf)))return {reason:'De bron bevat geen geldig tarief voor vandaag.'};
 const active=[];
 for(const el of t.elements||[]){const r=el.restrictions||{};if(r.start_date&&r.start_date>date||r.end_date&&r.end_date<date)continue;
 if(Object.entries(r).some(([k,v])=>!['start_date','end_date'].includes(k)&&v!==null&&v!==undefined&&(!Array.isArray(v)||v.length>0)))return {reason:'Dit laadpunt heeft tijdvensters, staffels of andere voorwaarden die nog niet automatisch worden berekend.'};
 if(!Array.isArray(el.price_components)||el.price_components.length!==1)return {reason:'De bron bevat aanvullende of ontbrekende kostencomponenten.'};
 const c=el.price_components[0];if(c.type!=='ENERGY'||typeof c.price!=='number'||!Number.isFinite(c.price)||c.price<0||typeof c.vat!=='number'||!Number.isFinite(c.vat)||c.vat<0||c.vat>100||!Number.isInteger(c.step_size)||c.step_size<1||c.step_size>1)return {reason:'Geen volledig kWh-tarief met bekende btw en afrekenstap beschikbaar.'};
 active.push(c.price*(1+c.vat/100));}
 if(active.length!==1)return {reason:'Geen eenduidige prijs voor deze datum; meerdere of ontbrekende tariefdelen.'};return {gross:active[0]};
}
function nationalOptions(point,tariffs,date){
 const base={point,checked:NATIONAL_REVIEW.checked,reviewAfter:NATIONAL_REVIEW.reviewAfter};
 const fail=reason=>({...base,status:'unsupported',reason,options:[]});
 if(date<NATIONAL_REVIEW.checked||date>NATIONAL_REVIEW.reviewAfter)return fail('De officiële prijsregels moeten opnieuw worden gecontroleerd.');
 if(!supportedNetwork(point))return fail('Voor deze exploitant is de volledige prijs van een concrete betaalmethode nog niet onderbouwd. Je kunt dit punt wel handmatig vergelijken.');
 if(!point.groups.length)return fail('De aansluiting en het tarief zijn niet volledig beschreven.');
 const ids=[...new Set(point.groups.flatMap(g=>g.tariff_ids||[]))];
 if(!ids.length||point.groups.some(g=>!g.tariff_ids?.length)||ids.length>8)return fail('Voor één of meer aansluitingen ontbreekt een eenduidige tariefkoppeling.');
 const prices=[];
 for(const id of ids){const t=tariffs.find(t=>t.id===id&&t.party_id===point.party&&t.country_code==='NL');if(!t)return fail('De gekoppelde tariefdefinitie ontbreekt bij de bron.');const p=flatEnergy(t,date);if(p.reason)return fail(p.reason);prices.push(p.gross)}
 if(prices.some(p=>Math.abs(p-prices[0])>.00001))return fail('De aansluitingen op dit punt hebben verschillende prijzen. Kies de specifieke aansluiting in de aanbieder-app.');
 const fields={month:0,once:0,start:0,checked:NATIONAL_REVIEW.checked,validFrom:NATIONAL_REVIEW.checked,reviewAfter:NATIONAL_REVIEW.reviewAfter};let options;
 if(point.party==='NUO'){
 const price=INCHARGE_PRICES.find(v=>Math.abs(v-prices[0])<=.000061);
 if(price===undefined)return fail('Het actuele paaltarief komt niet overeen met een gecontroleerde officiële InCharge-prijs.');
 options=[{...fields,key:'incharge-own',provider:'vattenfall-incharge',card:'Vattenfall InCharge',kwh:price,condition:'Eigen InCharge-pas op dit InCharge-laadpunt.',source:'Vattenfall officiële eigen-netwerkprijzen + actuele NDW-punt- en tariefkoppeling'}];
 }else{
 if(point.type!=='DC'||point.groups.some(g=>g.power_type!=='DC')||Math.abs(prices[0]-.77)>.000061)return fail('Het actuele Fastned-punttarief wijkt af van de gecontroleerde Nederlandse standaardprijs.');
 options=[{...fields,key:'fastned-direct',provider:'fastned',card:'Fastned · rechtstreeks betalen',kwh:.77,condition:'Betaal met bankpas of creditcard bij Fastned; geen externe laadpas.',source:'Fastned officiële tarieven Nederland + actuele NDW-punt- en tariefkoppeling'},
 {...fields,key:'fastned-app',provider:'fastned',card:'Fastned-app · 10% korting',kwh:.693,condition:'Directe betaalmethode in de Fastned-app, zonder externe laadpas. App-korting gecontroleerd op 25 oktober 2026.',source:'Fastned officiële tarieven en 10% app-korting Nederland + actuele NDW-puntkoppeling'}];
 }
 return {...base,status:'ready',options,tariffIds:ids};
}
