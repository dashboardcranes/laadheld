'use strict';
function normalizeSearch(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function distanceKm(position,coordinates){if(!coordinates||coordinates.length<2||!coordinates.every(Number.isFinite))return Infinity;const rad=v=>v*Math.PI/180,lat=rad(position.latitude),other=rad(coordinates[1]),dlat=other-lat,dlon=rad(coordinates[0]-position.longitude),a=Math.sin(dlat/2)**2+Math.cos(lat)*Math.cos(other)*Math.sin(dlon/2)**2;return 6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(Math.max(0,1-a)))}
function nearestLocations(locations,position){return locations.filter(p=>Number.isFinite(distanceKm(position,p[5]))).map(p=>({p,d:distanceKm(position,p[5])})).sort((a,b)=>a.d-b.d).map(x=>x.p)}
if(typeof module!=='undefined')module.exports={distanceKm,nearestLocations,normalizeSearch};
