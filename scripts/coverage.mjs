import {readFile,writeFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
export async function buildCoverage(tariffs,tariffMeta){
 const source='https://opendata.ndw.nu/charging_point_locations.geojson.gz';
 const response=process.env.NDW_LOCATIONS_FILE?null:await fetch(source,{signal:AbortSignal.timeout(90000)});
 if(response&&!response.ok)throw Error('NDW locations unavailable: '+response.status);
 let bytes=process.env.NDW_LOCATIONS_FILE?await readFile(process.env.NDW_LOCATIONS_FILE):Buffer.from(await response.arrayBuffer());
 if(bytes[0]===31&&bytes[1]===139)bytes=gunzipSync(bytes);
 const data=JSON.parse(bytes.toString());if(!Array.isArray(data.features)||!data.features.length)throw Error('Empty locations');
 const code=await readFile('worker/tariff-model.mjs','utf8')+'\n'+await readFile('worker/national-data.mjs','utf8')+'\nexport {pointPublishedModel,nationalOptions,pointSummary,nlCoordinates};';
 const {pointPublishedModel,nationalOptions,pointSummary,nlCoordinates}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 const index=new Map(tariffs.map(t=>[JSON.stringify([t.country_code,t.party_id,t.id]),t])),networks=new Map(),seen=new Set(),date=new Date().toLocaleDateString('en-CA',{timeZone:'Europe/Amsterdam'});
 const totals={records:0,linkedDefinitions:0,computableCpo:0,namedPayment:0,multiplePayments:0,missingLink:0,missingDefinition:0};
 for(const f of data.features){const p=f.properties||{};if(p.country!=='NLD'||!f.id||seen.has(f.id))continue;seen.add(f.id);totals.records++;
 const point=pointSummary(f),party=point.party||'unknown';let n=networks.get(party);if(!n){n={id:party,names:new Map(),records:0,linkedDefinitions:0,computableCpo:0,namedPayment:0,multiplePayments:0};networks.set(party,n)}n.records++;const name=(p.operator_name||'Onbekende exploitant').trim().replace(/\s+/g,' ');n.names.set(name,(n.names.get(name)||0)+1);
 const groups=point.groups,ids=[...new Set(groups.flatMap(g=>g.tariff_ids||[]))];
 if(!groups.length||groups.some(g=>!g.tariff_ids?.length)){totals.missingLink++;continue;}
 const ts=ids.map(id=>index.get(JSON.stringify(['NL',point.party,id])));if(ts.some(t=>!t)){totals.missingDefinition++;continue;}
 totals.linkedDefinitions++;n.linkedDefinitions++;
 if(ids.length>8||!/^NL-[-A-Za-z0-9_:.]{1,200}$/.test(point.id)||!point.coordinates||!nlCoordinates(...point.coordinates))continue;
 if(pointPublishedModel(point,ts,date).model){totals.computableCpo++;n.computableCpo++;}
 const options=nationalOptions(point,ts,date).options;
 if(options.length){totals.namedPayment++;n.namedPayment++;}if(options.length>1){totals.multiplePayments++;n.multiplePayments++;}
 }
 const report={measuredAt:new Date().toISOString(),locationSource:source,tariffSource:tariffMeta.source,tariffFetchedAt:tariffMeta.fetchedAt,scope:'Unieke NDW-laadpuntrecords met landcode NLD. Een record kan meerdere aansluitingen bevatten; dit is geen telling van alle fysieke stekkers of garantie van volledige marktdekking.',targetPercent:99,totals,networks:[...networks.values()].map(n=>({...n,name:[...n.names].sort((a,b)=>b[1]-a[1])[0][0],aliases:[...n.names.keys()],names:undefined})).sort((a,b)=>a.name.localeCompare(b.name,'nl'))};
 await writeFile('dist/coverage.json',JSON.stringify(report));console.log('Coverage: '+JSON.stringify(totals));return report;
}
