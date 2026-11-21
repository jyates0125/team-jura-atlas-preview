/* Team Jura Atlas GTA IV canvas explorer. GTADB.org and contributors: CC BY 4.0 source map and data. */
(()=>{'use strict';const $=id=>document.getElementById(id),canvas=$('classicCanvas'),shell=$('classicMapShell');if(!canvas||!shell)return;const ctx=canvas.getContext('2d');if(!ctx)return;const ranges={0:[[1,1],[2,2]],1:[[3,3],[4,4]],2:[[6,6],[9,8]],3:[[13,13],[18,17]],4:[[27,27],[37,34]],5:[[54,54],[75,68]]};const IV_TILE_SOURCES=[
 'https://raw.githubusercontent.com/rolux/gtadb.org/0d79c62bd47f7521b6847ec676b0f7389231101a/maps/tiles/4/',
 'https://maps.gtadb.org/tiles/4/'
];
const tiles=new Map();let layer='original',center={x:150,y:40},zoom=3.4,records=[],filtered=[],favorites=new Set(),route=[],selected=null,categories='all',onlyFav=false,showPins=true,source='starter';
let landmarkRecords=[],birdRecords={iv:[],tlad:[],tbogt:[]},activeScope='landmarks';
let finishId='';
const routeKey=()=>'team-jura-iv-route-v1:'+activeScope;
const birdKey='team-jura-iv-bird-progress-v1';
let birdFound=new Set();try{const x=JSON.parse(localStorage.getItem(birdKey)||'[]');if(Array.isArray(x))birdFound=new Set(x.filter(v=>typeof v==='string'&&/^(iv|tlad|tbogt)-bird-\d{3}$/.test(v)).slice(0,300))}catch(_){}
const saveBirds=()=>{try{localStorage.setItem(birdKey,JSON.stringify([...birdFound]))}catch(_){}};
try{favorites=new Set(JSON.parse(localStorage.getItem('jura-iv-favorites')||'[]'))}catch{};const lsSave=()=>{try{localStorage.setItem('jura-iv-favorites',JSON.stringify([...favorites]))}catch{}};const TILE=256,WX=16384,WY=16384;let w=800,h=600,raf=0,loadCount=0,failCount=0,hitTargets=[];const scale=()=>1024*2**zoom/32768;function point(x,y){const s=scale();return{x:w/2+(x-center.x)*s,y:h/2+(center.y-y)*s}}function world(px,py){const s=scale();return{x:center.x+(px-w/2)/s,y:center.y-(py-h/2)/s}}function resize(){const box=shell.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);w=Math.max(280,box.width);h=Math.max(300,box.height);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);render()}function render(){cancelAnimationFrame(raf);raf=requestAnimationFrame(draw)}function fallback(){ctx.fillStyle='#182334';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#334457';ctx.lineWidth=.6;for(let x=0;x<w;x+=36){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=0;y<h;y+=36){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}ctx.fillStyle='#cbbdc9';ctx.font='13px system-ui';ctx.textAlign='center';ctx.fillText('Map tiles require an internet connection',w/2,h/2)}function draw(){ctx.clearRect(0,0,w,h);fallback();const z=Math.max(0,Math.min(5,Math.ceil(zoom))),sz=TILE*2**(zoom-z),mapSize=1024*2**zoom;const offX=w/2-(center.x+WX)*mapSize/32768,offY=h/2-(WY-center.y)*mapSize/32768;const xmin=Math.floor(-offX/sz),xmax=Math.ceil((w-offX)/sz),ymin=Math.floor(-offY/sz),ymax=Math.ceil((h-offY)/sz),r=ranges[z];for(let y=Math.max(ymin,r[0][1]);y<=Math.min(ymax,r[1][1]);y++)for(let x=Math.max(xmin,r[0][0]);x<=Math.min(xmax,r[1][0]);x++){const tx=offX+x*sz,ty=offY+y*sz,k=`${layer}:${z}:${y}:${x}`;let t=tiles.get(k);if(!t&&tiles.size<1600){t={image:null,state:'loading'};tiles.set(k,t);
  const trySource=index=>{
   const im=new Image();im.crossOrigin='anonymous';t.image=im;
   im.onload=()=>{if(t.image!==im)return;t.state='loaded';loadCount++;render()};
   im.onerror=()=>{if(t.image!==im)return;if(index+1<IV_TILE_SOURCES.length){trySource(index+1);return;}t.state='error';failCount++;render()};
   im.src=IV_TILE_SOURCES[index]+layer+'/'+z+'/'+z+','+y+','+x+'.jpg';
  };trySource(0)}if(t?.state==='loaded')ctx.drawImage(t.image,tx,ty,sz+.25,sz+.25)}// Atlas 19.0: preserve every licensed landmark in adaptive map groups.
hitTargets=[];
if(showPins){
 const grid=new Map(),cell=zoom<2.5?49:zoom<3.6?35:zoom<4.6?25:16;
 for(const r of filtered){
  const p=point(r.x,r.y);
  if(p.x< -20||p.x>w+20||p.y< -20||p.y>h+20)continue;
  const key=Math.floor(p.x/cell)+':'+Math.floor(p.y/cell);
  if(!grid.has(key))grid.set(key,{x:0,y:0,members:[]});
  const bin=grid.get(key);bin.x+=p.x;bin.y+=p.y;bin.members.push(r);
 }
 for(const bin of grid.values()){
  const size=bin.members.length,x=bin.x/size,y=bin.y/size;
  const active=bin.members.some(r=>r.id===selected?.id);
  const favorite=bin.members.some(r=>favorites.has(r.id));
  const clustered=size>1;
  const allFound=activeScope!=='landmarks'&&bin.members.every(r=>birdFound.has(r.id));
  const radius=clustered?Math.min(16,9+Math.log2(size)*1.2):7;
  ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);
  ctx.fillStyle=active?'#ffe2a1':favorite?'#ba8cef':allFound?'#628c7c':clustered?'#56376d':'#edac78';ctx.fill();
  ctx.lineWidth=clustered?2.3:1.8;ctx.strokeStyle=active?'#2d173a':'#261c37';ctx.stroke();
  if(clustered){
   ctx.fillStyle=active?'#302038':'#fff5e6';
   ctx.font='800 '+(size>=100?'10':'11')+'px system-ui';
   ctx.textBaseline='middle';ctx.textAlign='center';ctx.fillText(String(size),x,y+.7);
  }else{
   const item=bin.members[0],tags=item.tags||[];
   const kind=tags.includes('collectible')?'◆':tags.includes('transport')?'⇄':tags.includes('hotel')?'⌂':tags.includes('landmark')?'★':tags.includes('restaurant')?'♨':tags.includes('government')?'⚑':tags.includes('nature')?'✿':tags.includes('shop')?'$':'·';
   ctx.fillStyle='#1b1731';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText(kind,x,y+.4);
  }
  hitTargets.push({x,y,radius:Math.max(radius+5,16),members:bin.members});
 }
}
const pinNotice=$('j190-marker-status');
if(pinNotice)pinNotice.textContent=showPins
 ? filtered.length.toLocaleString()+' matching '+(activeScope==='landmarks'?'landmarks':'collectibles')+' · '+hitTargets.length.toLocaleString()+' map symbols (clusters represent all matching records). Tap a number to zoom into that area.'
 : 'Map symbols hidden · '+filtered.length.toLocaleString()+' searchable source records remain available.';if(route.length>=2){ctx.beginPath();route.forEach((r,i)=>{const p=point(r.x,r.y);if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y)});ctx.strokeStyle='#ffe9a6';ctx.lineWidth=3;ctx.setLineDash([7,5]);ctx.stroke();ctx.setLineDash([])}for(const [i,r]of route.entries()){const p=point(r.x,r.y);ctx.fillStyle='#18101f';ctx.strokeStyle='#ffd17f';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,11,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText(i+1,p.x,p.y+4)}const status=$('tileStatus');if(status)status.textContent=loadCount>0?`${source==='full'?'Licensed local':'Starter'} landmarks · ${loadCount} source map tiles loaded`:failCount?'Map tiles unavailable from both attributed sources · the native map and landmarks remain available':'Loading attributed GTADB map tiles…';const loc=$('coordStatus');if(loc)loc.textContent=`X ${Math.round(center.x)} · Y ${Math.round(center.y)} · ${Math.round(zoom*10)/10}× view`}
function normalize(raw){
 const rows=raw&&typeof raw==='object'&&raw.records&&typeof raw.records==='object'?raw.records:raw;
 const out=[];if(!rows||typeof rows!=='object')return out;
 for(const [id,v]of Object.entries(rows)){
  if(!Array.isArray(v)||!Array.isArray(v[1])||typeof v[0]!=='string')continue;
  const [x,y]=v[1];if(!Number.isFinite(x)||!Number.isFinite(y))continue;
  // Some licensed source rows have positions and IDs but no supplied name.
  // Keep all of them searchable without inventing an in-game landmark identity.
  const sourceTitle=v[0].trim();
  out.push({id,name:sourceTitle||`Unnamed community landmark (source ${id})`,x,y,address:typeof v[3]==='string'?v[3]:'',
   tags:Array.isArray(v[6])?v[6].filter(x=>typeof x==='string'):[],
   region:sourceTitle?sourceTitle.split(',').slice(-2).join(',').trim():'Source title unavailable'});
 }
 return out;
}
function fromStarter(entries){return(entries||[]).map(v=>({id:v[0],name:v[1],x:v[2],y:v[3],address:v[4]||'',tags:v[5]||[],region:v[1].split(',').slice(-2).join(',').trim()}))}
async function load(){
 // Same-origin, provenance-checked research snapshot: no live fetch required.
 try{
  const r=await fetch('./data/gtadb-4.json',{cache:'no-cache'});
  if(r.ok){const snap=await r.json();
   if(snap.game!=='4'||snap.license!=='CC BY 4.0'||snap.schema!==2||!snap.records)throw Error('Invalid local snapshot metadata');
   const rows=normalize(snap);if(rows.length>=500){records=rows;landmarkRecords=rows;source='full';update();return;}
  }
 }catch(err){console.warn('Bundled GTA IV research unavailable, checking fallbacks:',err)}
 // Offline starter is always kept; the remote license-backed source is a fallback.
 try{const r=await fetch('./data/gtadb-iv-starter.json');if(r.ok){records=fromStarter((await r.json()).entries);source='starter';landmarkRecords=records;update()}}catch{}
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),7000);
 try{const r=await fetch('https://raw.githubusercontent.com/rolux/gtadb.org/main/map/data/4/landmarks.json',{signal:ctrl.signal});if(!r.ok)throw Error('Source unavailable');
  const parsed=normalize(await r.json());if(parsed.length<200)throw Error('Unexpected source response');
  records=parsed;landmarkRecords=parsed;source='full';update();
 }catch{if($('recordStatus'))$('recordStatus').textContent=`${records.length} locally saved starter landmarks · Full source unavailable`}
 finally{clearTimeout(timer)}
}
async function loadBirds(){
 try{
  const r=await fetch('./data/atlas-iv-300-source-birds.json',{cache:'force-cache'});
  if(!r.ok)throw Error('HTTP '+r.status);
  const pack=await r.json();
  if(pack?.schema!==1||pack.game!=='4'||pack.license!=='MIT'||pack.count!==300||
     pack.sourceCommit!=='de21b7df7ec8b10dfe5abe7290d894efbfc1bd11'||!pack.sets||
     pack.sets.iv?.length!==200||pack.sets.tlad?.length!==50||pack.sets.tbogt?.length!==50)throw Error('Pack provenance/count mismatch');
  const ids=new Set();
  for(const name of ['iv','tlad','tbogt']){
   birdRecords[name]=pack.sets[name].map(raw=>{
    if(raw?.edition!==name||typeof raw.id!=='string'||ids.has(raw.id)||
       ![raw.x,raw.y,raw.z].every(Number.isFinite)||!Array.isArray(raw.tags)||
       typeof raw.name!=='string')throw Error('Invalid bird record');
    ids.add(raw.id);
    return {id:raw.id,name:raw.name,region:String(raw.region||name),
      x:raw.x,y:raw.y,z:raw.z,address:'',
      hint:String(raw.hint||'').slice(0,280),
      sourceFile:String(raw.sourceFile||''),
      tags:raw.tags,isBird:true,edition:name};
   });
  }
  if(ids.size!==300)throw Error('Repeated bird record IDs');
 }catch(e){console.warn('Licensed collectible positions unavailable:',e);birdRecords={iv:[],tlad:[],tbogt:[]}}
}
function setScope(which){
 if(!['landmarks','iv','tlad','tbogt'].includes(which))return;
 activeScope=which;
 document.body.dataset.ivScope=which;
 const episode={tlad:'The Lost and Damned',tbogt:'The Ballad of Gay Tony'}[which];
 $('ivWorldName').textContent=episode||'Liberty City & Alderney';
 $('ivWorldIntro').textContent=which==='landmarks'?'Search licensed landmarks, save favorites and plan a Liberty City route.':
  (which==='iv'?'Track 200 Flying Rats':'Track 50 '+(which==='tlad'?'Lost and Damned':'Ballad of Gay Tony')+' seagulls')+' and plan a route from your chosen start.';

 records=which==='landmarks'?landmarkRecords:birdRecords[which];
 categories='all';onlyFav=false;selected=null;restoreRoute();
 $('classicSearch').value='';$('showFav').setAttribute('aria-pressed','false');
 $('detailIntro').hidden=false;$('detailContent').hidden=true;
 const pick=$('j190-iv-scope');if(pick)pick.value=which;
 const hide=$('j190-iv-hide-found');if(hide)hide.disabled=which==='landmarks';
 const badge=$('j190-iv-source-note');
 if(badge)badge.textContent=which==='landmarks'?'GTADB CC BY 4.0 · community landmarks, not verified collectibles':
  'Wes Hampson MIT · independently sourced XYZ bird positions · source order, not official in-game numbering';
 try{const url=new URL(location.href);url.searchParams.set('scope',which);
  url.searchParams.delete('loc');history.replaceState(null,'',url)}catch(_){}
 update();updateRoute();
}
const perPage=80;
let resultPage=0,previousFilter='';
function update(){const term=($('classicSearch').value||'').trim().toLowerCase();filtered=records.filter(r=>(activeScope==='landmarks'||!$('j190-iv-hide-found')?.checked||!birdFound.has(r.id))&&(categories==='all'||r.tags.includes(categories)||(categories==='other'&&!r.tags.length))&&(!onlyFav||favorites.has(r.id))&&(!term||[r.name,r.address,r.hint||'',r.region,r.tags.join(' ')].join(' ').toLowerCase().includes(term)));const sort=$('classicSort').value;
 const filterKey=JSON.stringify([activeScope,term,categories,onlyFav,sort,$('j190-iv-hide-found')?.checked]);
 if(filterKey!==previousFilter){resultPage=0;previousFilter=filterKey}
 filtered.sort((a,b)=>sort==='nearest'?Math.hypot(a.x-center.x,a.y-center.y)-Math.hypot(b.x-center.x,b.y-center.y):sort==='region'?a.region.localeCompare(b.region):a.name.localeCompare(b.name));$('resultCount').textContent=String(filtered.length);$('visibleCount').textContent=String(records.length);$('recordStatus').textContent=records.length+' '+(activeScope==='landmarks'?(source==='full'?'licensed community landmarks':'starter landmarks'):'MIT source collectible positions');const cat=$('categories');cat.replaceChildren();let tags=new Map([['all',records.length]]);for(const r of records){const t=r.tags.length?r.tags:['other'];for(const v of t)tags.set(v,(tags.get(v)||0)+1)}for(const [t,n]of tags){const b=document.createElement('button');b.type='button';b.textContent=`${t==='all'?'All':t==='other'?'Uncategorized':t} (${n})`;b.setAttribute('aria-pressed',String(categories===t));b.addEventListener('click',()=>{categories=t;update()});cat.append(b)}
 paintResults();syncNearby();render();
}
function paintResults(){
 resultPage=Math.max(0,Math.min(resultPage,Math.ceil(filtered.length/perPage)-1));
 const offset=resultPage*perPage;
 $('ivResultPager').hidden=filtered.length<=perPage;
 $('ivPrev').disabled=resultPage===0;
 $('ivNext').disabled=offset+perPage>=filtered.length;
 $('ivRange').textContent=filtered.length?(offset+1)+'–'+Math.min(offset+perPage,filtered.length)+' of '+filtered.length:'0 matches';
 const list=$('classicResults');list.replaceChildren();if(!filtered.length){const p=document.createElement('p');p.className='microcopy';p.textContent='No matches. Try another search or category.';list.append(p)}for(const r of filtered.slice(offset,offset+perPage)){const b=document.createElement('button');b.type='button';b.className='classic-result';b.setAttribute('aria-current',String(selected?.id===r.id));const strong=document.createElement('strong');strong.textContent=r.name;const small=document.createElement('small');small.textContent=`${favorites.has(r.id)?'★ Favorite · ':''}${r.region}`;b.append(strong,small);b.onclick=()=>select(r,true);list.append(b)}
}
for(const [id,step] of [['ivPrev',-1],['ivNext',1]]){
 $(id).onclick=()=>{resultPage+=step;paintResults();$('classicResults').scrollTop=0};
}
function select(r,recenter=false){selected=r;$('detailIntro').hidden=true;$('detailContent').hidden=false;$('detailName').textContent=r.name;$('detailRegion').textContent=r.region;$('detailCategory').textContent=r.tags.join(' · ').toUpperCase()||'LANDMARK';$('detailAddress').textContent=r.isBird?(r.hint||'No source clue attached; use the XYZ position and game map.'):(r.address||'No matching real-world reference reported');
 $('detailSource').href=r.isBird?'https://github.com/whampson/pigeon-locator/blob/de21b7df7ec8b10dfe5abe7290d894efbfc1bd11/PigeonLocator/GameData/'+r.sourceFile:'https://github.com/rolux/gtadb.org';
 $('detailSource').textContent=r.isBird?'MIT source coordinates and clues ↗':'GTADB research source ↗';
 const done=$('j190-iv-found');if(done){done.hidden=!r.isBird;done.textContent=birdFound.has(r.id)?'✓ Mark uncollected':'◇ Mark found'};$('detailCoord').textContent=r.x.toFixed(2)+', '+r.y.toFixed(2)+(r.isBird?', Z '+r.z.toFixed(2):'');$('detailFavorite').textContent=favorites.has(r.id)?'★ Unfavorite':'☆ Favorite';$('detailRoute').textContent=route.some(x=>x.id===r.id)?'✓ On route':'+ Route';if(recenter){center={x:r.x,y:r.y};zoom=Math.max(zoom,3.4)}try{const url=new URL(location.href);url.searchParams.set('scope',activeScope);url.searchParams.set('loc',r.id);history.replaceState(null,'',url.pathname+url.search+url.hash)}catch{}update()};function restoreRoute(){
 route=[];finishId='';
 try{
  const saved=JSON.parse(localStorage.getItem(routeKey()));
  if(!Array.isArray(saved?.stops))return;
  const byId=new Map(records.map(r=>[r.id,r]));
  route=[...new Set(saved.stops)].map(id=>byId.get(id)).filter(Boolean);
  if(route.slice(1).some(r=>r.id===saved.finish))finishId=saved.finish;
 }catch{}
}
function saveRoute(){
 let saved=true;
 try{localStorage.setItem(routeKey(),JSON.stringify({stops:route.map(r=>r.id),finish:finishId}))}
 catch{saved=false}
 updateRoute();
 if(!saved)$('routeStatus').textContent+=' Device storage unavailable for this change.';
}
function addRoute(){
 if(!selected||route.some(r=>r.id===selected.id))return;
 route.splice(finishId?route.length-1:route.length,0,selected);
 saveRoute();
}
function updateRoute(){
 const list=$('classicStops'),start=$('routeStart'),finish=$('routeFinish');
 list.replaceChildren();start.replaceChildren();finish.replaceChildren(new Option('Anywhere',''));
 route.forEach((r,i)=>{
  start.add(new Option(r.name,r.id));
  if(i)finish.add(new Option(r.name,r.id));
  const row=document.createElement('div'),remove=document.createElement('button');
  row.className='classic-stop';row.append((i+1)+'. '+r.name);
  remove.type='button';remove.textContent='Remove';remove.setAttribute('aria-label','Remove '+r.name+' from route');
  remove.onclick=()=>{
   route=route.filter(stop=>stop.id!==r.id);
   if(r.id===finishId||route.length<2)finishId='';
   saveRoute();
  };
  row.append(remove);list.append(row);
 });
 syncNearby();finish.value=finishId;
 start.disabled=finish.disabled=$('routeOrder').disabled=route.length<2;
 $('routeFit').disabled=$('routeCopy').disabled=$('routeClear').disabled=!route.length;
 $('stopCount').textContent=String(route.length);
 $('routeStatus').textContent=route.length?'Straight-line preview only · not driving directions':'Add places to plan a route.';
 if(selected)$('detailRoute').textContent=route.some(r=>r.id===selected.id)?'✓ On route':'+ Route';
 render();
}
$('routeStart').onchange=e=>{
 const i=route.findIndex(r=>r.id===e.target.value);
 if(i<0)return;
 if(route[i].id===finishId)finishId='';
 route.unshift(route.splice(i,1)[0]);saveRoute();
};
$('routeFinish').onchange=e=>{
 finishId=e.target.value;
 const i=route.findIndex(r=>r.id===finishId);
 if(i>0)route.push(route.splice(i,1)[0]);
 saveRoute();
};
function nearestIndex(last,remaining){
 const distance=r=>(r.x-last.x)**2+(r.y-last.y)**2;
 let index=0;
 for(let i=1;i<remaining.length;i++)if(distance(remaining[i])<distance(remaining[index]))index=i;
 return index;
}
function syncNearby(){
 const used=new Set(route.map(r=>r.id));
 $('ivNearby').disabled=!route.length||!filtered.some(r=>!used.has(r.id));
}
$('ivNearby').onclick=()=>{
 if(!route.length)return;
 const used=new Set(route.map(r=>r.id)),remaining=filtered.filter(r=>!used.has(r.id));
 let index=route.length-(finishId?1:0);
 for(let count=0;count<5&&remaining.length;count++){
  const nearest=nearestIndex(route[index-1],remaining);
  route.splice(index++,0,remaining.splice(nearest,1)[0]);
 }
 saveRoute();
};
$('routeOrder').onclick=()=>{
 if(route.length<2)return;
 const ordered=[route[0]],remaining=route.slice(1).filter(r=>r.id!==finishId);
 while(remaining.length){
  ordered.push(remaining.splice(nearestIndex(ordered[ordered.length-1],remaining),1)[0]);
 }
 if(finishId)ordered.push(route[route.length-1]);
 route=ordered;saveRoute();
};
$('j190-iv-scope')?.addEventListener('change',e=>setScope(e.target.value));
$('j190-iv-hide-found')?.addEventListener('change',update);
$('j190-iv-found')?.addEventListener('click',()=>{if(!selected?.isBird)return;
 if(birdFound.has(selected.id))birdFound.delete(selected.id);else birdFound.add(selected.id);
 saveBirds();select(selected,false);});
$('classicSearch').addEventListener('input',update);$('classicSort').addEventListener('change',update);$('classicLayer').addEventListener('change',e=>{layer=e.target.value;loadCount=failCount=0;render()});$('showAll').onclick=()=>{onlyFav=false;categories='all';$('classicSearch').value='';$('showFav').setAttribute('aria-pressed','false');update()};$('showFav').onclick=()=>{onlyFav=!onlyFav;$('showFav').setAttribute('aria-pressed',String(onlyFav));update()};$('classicPins').onclick=()=>{showPins=!showPins;$('classicPins').setAttribute('aria-pressed',String(showPins));render()};$('classicFit').onclick=()=>{center={x:150,y:40};zoom=3.4;update()};$('classicPlus').onclick=()=>{zoom=Math.min(5,zoom+.5);render()};$('classicMinus').onclick=()=>{zoom=Math.max(.2,zoom-.5);render()};$('detailFavorite').onclick=()=>{if(!selected)return;if(favorites.has(selected.id))favorites.delete(selected.id);else favorites.add(selected.id);lsSave();update();$('detailFavorite').textContent=favorites.has(selected.id)?'★ Unfavorite':'☆ Favorite'};$('detailRoute').onclick=addRoute;$('routeFit').onclick=()=>{if(!route.length)return;const xs=route.map(r=>r.x),ys=route.map(r=>r.y);center={x:(Math.min(...xs)+Math.max(...xs))/2,y:(Math.min(...ys)+Math.max(...ys))/2};zoom=Math.max(.6,Math.min(5,Math.log2(Math.min(w/((Math.max(...xs)-Math.min(...xs)+350)/32),h/((Math.max(...ys)-Math.min(...ys)+350)/32)))));render()};$('routeClear').onclick=()=>{route=[];finishId='';saveRoute()};$('routeCopy').onclick=async()=>{const str=route.map((r,i)=>`${i+1}. ${r.name}: ${r.x.toFixed(1)}, ${r.y.toFixed(1)}`).join('\n');try{await navigator.clipboard.writeText(str);$('routeStatus').textContent='Route stops copied.'}catch{$('routeStatus').textContent='Copy requires HTTPS. Select route text manually.'}};$('detailShare').onclick=async()=>{const url=new URL(location.href);url.searchParams.set('loc',selected.id);try{await navigator.clipboard.writeText(url.href);$('detailShare').textContent='✓ Copied'}catch{$('detailShare').textContent='Use browser address bar'}};$('closeDetail').onclick=()=>{selected=null;$('detailIntro').hidden=false;$('detailContent').hidden=true;try{const url=new URL(location.href);url.searchParams.delete('loc');history.replaceState(null,'',url.pathname+url.search+url.hash)}catch{}update()};// Atlas 21.0: true two-finger pinch and single-finger pan on iPhone/Android.
// Preserve the same map-coordinate anchor under the fingers while zooming.
let dragging=null,moved=false,pinch=null;
const activePointers=new Map();
const localPoint=e=>{const box=canvas.getBoundingClientRect();return{x:e.clientX-box.left,y:e.clientY-box.top}};
function beginPinch(){
 const pts=[...activePointers.values()].slice(0,2);
 if(pts.length<2)return;
 const mid={x:(pts[0].x+pts[1].x)/2,y:(pts[0].y+pts[1].y)/2};
 pinch={distance:Math.max(1,Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y)),zoom,anchor:world(mid.x,mid.y)};
 dragging=null;moved=true;
}
canvas.addEventListener('pointerdown',e=>{
 if(e.pointerType==='mouse'&&e.button!==0)return;
 activePointers.set(e.pointerId,localPoint(e));
 try{canvas.setPointerCapture(e.pointerId)}catch(_){}
 if(activePointers.size===1){
  dragging={x:e.clientX,y:e.clientY,cx:center.x,cy:center.y};
  pinch=null;moved=false;
 }else beginPinch();
});
canvas.addEventListener('pointermove',e=>{
 if(!activePointers.has(e.pointerId))return;
 activePointers.set(e.pointerId,localPoint(e));
 if(activePointers.size>=2){
  if(!pinch)beginPinch();
  const pts=[...activePointers.values()].slice(0,2);
  const mid={x:(pts[0].x+pts[1].x)/2,y:(pts[0].y+pts[1].y)/2};
  const distance=Math.max(1,Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y));
  zoom=Math.max(.2,Math.min(5,pinch.zoom+Math.log2(distance/pinch.distance)));
  const after=world(mid.x,mid.y);
  center.x+=pinch.anchor.x-after.x;
  center.y+=pinch.anchor.y-after.y;
  moved=true;render();return;
 }
 if(!dragging)return;
 const dx=e.clientX-dragging.x,dy=e.clientY-dragging.y;
 if(Math.abs(dx)+Math.abs(dy)>5)moved=true;
 center.x=dragging.cx-dx/scale();center.y=dragging.cy+dy/scale();render();
});
function endPointer(e,cancelled=false){
 if(!activePointers.has(e.pointerId))return;
 activePointers.delete(e.pointerId);
 try{if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId)}catch(_){}
 if(activePointers.size>=2){beginPinch();return}
 if(activePointers.size===1){
  const [id,pt]=activePointers.entries().next().value;
  const box=canvas.getBoundingClientRect();
  dragging={x:pt.x+box.left,y:pt.y+box.top,cx:center.x,cy:center.y};
  pinch=null;moved=true;return;
 }
 dragging=null;pinch=null;
 if(cancelled||moved)return;
 const {x:mx,y:my}=localPoint(e);
 let found=null,best=Infinity;
 for(const hit of hitTargets){
  const d=Math.hypot(hit.x-mx,hit.y-my);
  if(d<=hit.radius&&d<best){best=d;found=hit}
 }
 if(!found)return;
 if(found.members.length===1){select(found.members[0],false);return}
 const x=found.members.reduce((n,r)=>n+r.x,0)/found.members.length;
 const y=found.members.reduce((n,r)=>n+r.y,0)/found.members.length;
 if(zoom<4.99){center={x,y};zoom=Math.min(5,zoom+0.85);render();return}
 const nearest=found.members.slice().sort((a,b)=>Math.hypot(point(a.x,a.y).x-mx,point(a.x,a.y).y-my)-Math.hypot(point(b.x,b.y).x-mx,point(b.x,b.y).y-my))[0];
 select(nearest,false);
}
canvas.addEventListener('pointerup',e=>endPointer(e));
canvas.addEventListener('pointercancel',e=>endPointer(e,true));
canvas.addEventListener('lostpointercapture',e=>endPointer(e,true));
canvas.addEventListener('wheel',e=>{e.preventDefault();const box=canvas.getBoundingClientRect(),mx=e.clientX-box.left,my=e.clientY-box.top,before=world(mx,my);zoom=Math.max(.2,Math.min(5,zoom+(e.deltaY<0?.23:-.23)));const after=world(mx,my);center.x+=before.x-after.x;center.y+=before.y-after.y;render()},{passive:false});canvas.addEventListener('keydown',e=>{const d=140/scale();if(e.key==='ArrowRight')center.x+=d;else if(e.key==='ArrowLeft')center.x-=d;else if(e.key==='ArrowUp')center.y+=d;else if(e.key==='ArrowDown')center.y-=d;else if(e.key==='+')zoom=Math.min(5,zoom+.25);else if(e.key==='-')zoom=Math.max(.2,zoom-.25);else return;e.preventDefault();render()});// Read-only GTA IV 3D bridge; exact same records, filters, selection, map and player saves.
window.TeamJuraIV3DBridge=Object.freeze({
 state:()=>({game:4,x:center.x,y:center.y,z:zoom,layer,selectedId:selected?.id||null}),
 visible:()=>showPins?filtered.filter(r=>Number.isFinite(r.x)&&Number.isFinite(r.y)).slice(0,600).map(r=>({
  id:r.id,name:r.name,igCoordinates:[r.x,r.y],color:favorites.has(r.id)?'dc9aff':'f6aa69'
 })):[],
 select:id=>{const place=records.find(r=>r.id===id);if(!place)return false;select(place,true);return true;},
 hasData:()=>records.length>0
});
new ResizeObserver(resize).observe(shell);resize();Promise.all([load(),loadBirds()]).then(()=>{
 const params=new URLSearchParams(location.search);
 const requested=params.get('scope');
 setScope(['iv','tlad','tbogt'].includes(requested)?requested:'landmarks');
 const id=params.get('loc'),r=records.find(x=>x.id===id);
 if(r)select(r,true);
});
})();
