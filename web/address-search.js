'use strict';
function createAddressSearch({input,menu,status,button,fetcher=fetch,select,delay=350,schedule=setTimeout,cancel=clearTimeout,controller=()=>new AbortController()}){
 let items=[],active=-1,timer=null,request=0,pending=null,composing=false;
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function close(){menu.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1}
 function render(){menu.innerHTML=items.map((p,i)=>'<button type="button" class="address-option" role="option" tabindex="-1" id="address-option-'+i+'" data-address-index="'+i+'" aria-selected="'+(i===active)+'">'+escape(p.label)+'</button>').join('');menu.hidden=!items.length;input.setAttribute('aria-expanded',String(!!items.length));if(active>=0){input.setAttribute('aria-activedescendant','address-option-'+active);menu.querySelector('[aria-selected="true"]')?.scrollIntoView({block:'nearest'})}else input.removeAttribute('aria-activedescendant')}
 function invalidate(){cancel(timer);pending?.abort();request++;input.removeAttribute('aria-busy')}
 function choose(index){const p=items[index];if(!p)return;invalidate();input.value=p.label;close();items=[];status.textContent='Gekozen: '+p.label;select(p)}
 async function search(){const q=input.value.trim();invalidate();const turn=request;if(q.length<2){items=[];close();status.textContent='';return}input.setAttribute('aria-busy','true');status.textContent='Adresvoorstellen zoeken…';pending=controller();
 try{const r=await fetcher('/api/national/search?'+new URLSearchParams({q}),{signal:AbortSignal.any([pending.signal,AbortSignal.timeout(15000)]),cache:'no-store'});if(!r.ok)throw Error();const data=await r.json();if(turn!==request||input.value.trim()!==q)return;items=(data.places||[]).filter(p=>typeof p.label==='string'&&Array.isArray(p.coordinates)&&p.coordinates.length===2&&p.coordinates.every(Number.isFinite)).slice(0,5);active=-1;render();status.textContent=items.length?items.length+' adresvoorstellen. Kies een adres.':'Geen adres gevonden. Voeg een huisnummer of plaatsnaam toe.'}
 catch(e){if(turn!==request||e.name==='AbortError')return;items=[];close();status.textContent='Adresvoorstellen konden niet geladen worden. Probeer opnieuw of gebruik je locatie.'}
 finally{if(turn===request)input.removeAttribute('aria-busy')}
 }
 function changed(){invalidate();items=[];close();status.textContent='';if(!composing&&input.value.trim().length>=2)timer=schedule(search,delay)}
 input.addEventListener('input',changed);input.addEventListener('compositionstart',()=>{composing=true;invalidate()});input.addEventListener('compositionend',()=>{composing=false;changed()});
 input.addEventListener('keydown',e=>{if(e.isComposing||composing)return;if(e.key==='Escape'){e.preventDefault();invalidate();close();return}if(e.key==='Tab'){invalidate();close();return}
 if((e.key==='ArrowDown'||e.key==='ArrowUp')&&items.length){e.preventDefault();active=e.key==='ArrowDown'?(active+1)%items.length:(active<=0?items.length-1:active-1);render();return}
 if(e.key==='Enter'){e.preventDefault();if(!menu.hidden&&active>=0)choose(active);else if(!menu.hidden&&items.length===1)choose(0);else search()}});
 input.addEventListener('focus',()=>{if(items.length)render()});input.addEventListener('blur',()=>{invalidate();close()});
 menu.addEventListener('pointerdown',e=>e.preventDefault());menu.addEventListener('click',e=>{const b=e.target.closest('[data-address-index]');if(b)choose(Number(b.dataset.addressIndex))});
 button.addEventListener('click',search);
 return {close(){invalidate();close()},search,choose,changed};
}
if(typeof module!=='undefined')module.exports={createAddressSearch};
if(typeof document!=='undefined'){
 const input=document.getElementById('quick-query'),menu=document.getElementById('address-suggestions');
 if(input&&menu){const c=createAddressSearch({input,menu,status:document.getElementById('address-search-status'),button:document.getElementById('quick-search'),select:p=>document.dispatchEvent(new CustomEvent('laadheld:address-selected',{detail:p}))});
 document.addEventListener('pointerdown',e=>{if(e.target!==input&&!menu.contains(e.target)){c.close()}});
 }
}
