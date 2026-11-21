/* Team Jura Atlas 9.8 — shared working portal and directory controls.
   No map-engine rewrites, no fabricated live feeds, local saved data read-only except style bookmarks. */
(function(){'use strict';
 const worlds=window.TeamJuraWorlds||[];
 const $=q=>document.querySelector(q);
 const $$=q=>[...document.querySelectorAll(q)];
 const E=(tag,cls,content)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(content!==undefined)x.textContent=content;return x};
 const safe=(k,d)=>{try{const x=JSON.parse(localStorage.getItem(k)||'null');return x&&typeof x==='object'&&!Array.isArray(x)?x:d}catch{return d}};
 const save=(k,x)=>{try{localStorage.setItem(k,JSON.stringify(x));return true}catch{return false}};
 const values=x=>x&&typeof x==='object'&&!Array.isArray(x)?Object.values(x):[];
 function nav(){const btn=$('.menu-toggle'),menu=$('.primary-nav');if(!btn||!menu)return;
   btn.addEventListener('click',()=>{const on=menu.dataset.open!=='true';menu.dataset.open=String(on);btn.setAttribute('aria-expanded',String(on));btn.setAttribute('aria-label',on?'Close site navigation':'Open site navigation')});
   menu.addEventListener('click',e=>{if(e.target.closest('a')){menu.dataset.open='false';btn.setAttribute('aria-expanded','false')}});
   document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.dataset.open==='true'){menu.dataset.open='false';btn.setAttribute('aria-expanded','false');btn.focus()}});
 }
 function makeWorld(w,short,directoryCover=false){const a=E('a',short?'rail-world':'world-card');a.href='./'+w.href;a.dataset.id=w.id;
   if(short){const emblem=E('span','rail-emblem',({'story':'V','online':'◉','vi':'VI','cayo':'☀','iv':'IV','sa':'SA'}[w.id]||'◆'));const label=E('span','rail-label',w.name);const detail=E('small','',w.short);label.append(detail);a.append(emblem,label);return a}
   const frame=E('span','world-art-frame'),blur=E('img','world-art-blur'),im=E('img','world-art-main');
   // Use only bundled Elario art candidates; owner's release approval remains pending: third-party box art,
   // screenshots, and remote mirrors are not a reliable or automatic reuse license.
   // Each world keeps its individual original cover; featured worlds can lead
   // with the separate Atlas 14.0 approved concept illustration.
   const featuredConcept=w.group==='featured' && typeof w.coverFallback==='string'
     && /^\.\/art\/atlas140-[a-z-]+-concept\.svg$/.test(w.coverFallback)?w.coverFallback:null;
   const premiumCover=typeof w.coverSrc==='string' && /^\.\/art\/(?:jura155-(?:story|online|vi|cayo)|jura157-(?:iv|sa|vc|iii|vcs|lcs|ctw|tlad|tbogt)-cinematic)\.webp$/.test(w.coverSrc)?w.coverSrc:null;
   const sources=[premiumCover,featuredConcept,'./art/'+w.art].filter(Boolean);let sourceIndex=0;
   const setCover=()=>{im.src=sources[sourceIndex];im.alt=sourceIndex===0&&premiumCover?'Original Elario Studios cinematic fan concept artwork for '+w.name+'; not official gameplay':'Original Team Jura fan illustration for '+w.name+'; not a screenshot or exact map';frame.dataset.cover=sourceIndex===0&&premiumCover?'original-cinematic':'original-elario'};
   for(const image of [blur,im]){image.loading='lazy';image.decoding='async';image.referrerPolicy='no-referrer'}
   // The soft backdrop is a small, local concept asset: never download the full remote cover twice.
   blur.src=premiumCover||(w.group==='featured'?'./art/atlas140-'+w.id+'-concept.svg':'./art/'+w.art);
   if(directoryCover||(w.group==='featured'&&(w.id==='story'||w.id==='online')))im.loading='eager';
   blur.alt='';blur.setAttribute('aria-hidden','true');
   im.onerror=()=>{if(sourceIndex<sources.length-1){sourceIndex++;setCover()}else{im.onerror=null;frame.dataset.cover='unavailable'}};
   frame.append(blur,im);setCover();
   const body=E('span','world-copy');body.append(E('small','',w.grade),E('strong','',w.name),E('em','',w.short),E('b','','OPEN '+(w.kind==='gateway'?'REFERENCE':'MAP')+' ›'));
   const artChip=E('span','world-art-chip',w.game+' · '+(w.kind==='research'?'PROVISIONAL RESEARCH':w.kind==='gateway'?'REFERENCE':'ATLAS'));a.append(frame,artChip,body);a.title=w.note;return a;
 }
 function homepage(){const featured=worlds.filter(w=>w.group==='featured'),more=worlds.filter(w=>w.group!=='featured');const rail=$('#featuredRail'),classic=$('#classicRail'),grid=$('#featuredGrid');
   featured.forEach(w=>{if(rail)rail.append(makeWorld(w,true));if(grid)grid.append(makeWorld(w,false))});more.forEach(w=>{if(classic)classic.append(makeWorld(w,true))});
   const hq=safe('team-jura-atlas81-hq-v1',{items:{}}),checklist=safe('team-jura-checklist-v54',{checked:{}}),p=safe('jura3-progress',{});
   const hqDone=values(hq.items).filter(x=>x&&x.done===true).length;
   const checkDone=values(checklist.checked).filter(Boolean).length;
   const nativeDone=values(p).filter(x=>x===true).length;
   if($('#progressCollections'))$('#progressCollections').textContent=Math.max(hqDone,checkDone,nativeDone).toLocaleString();
   const own=safe('team-jura-atlas90-collection-v1',{owned:{}}).owned||{};
   if($('#progressVehicles'))$('#progressVehicles').textContent=Object.entries(own).filter(([k,v])=>k.startsWith('vehicles5:')&&v===true).length.toLocaleString();
   const slots=safe('team-jura-atlas96-parking-v1',{slots:[]}).slots;
   if($('#progressGarage'))$('#progressGarage').textContent=(Array.isArray(slots)?slots.length:0).toLocaleString();
   const last=safe('team-jura-atlas97-last-workspace-v1',{});
   const known={'atlas.html':'Story map','atlas-online.html':'Online map','atlas-vi.html':'Leonida map','atlas-research.html':'VI research','atlas-cayo.html':'Cayo island','atlas81-hq.html':'Collection HQ','atlas93-garage.html':'My Garage','heists.html':'Heist HQ','atlas93-dispatch.html':'Dispatch','atlas87-daily.html':'Daily Intel','atlas90-vehicles5.html':'Vehicle gallery'};
   if(known[last.page]){const a=$('#resumeLink'),label=$('#resumeLabel');if(a){a.href='./'+last.page;a.textContent='Continue '+known[last.page]+' ›'}if(label)label.textContent='Welcome back · '+known[last.page]}
 }
 function directory(){const feature=$('#directoryFeatured'),additional=$('#directoryAdditional'),inp=$('#worldSearch'),count=$('#worldCount'),buttons=$$('[data-world-filter]');if(!feature||!additional)return;
   const params=new URLSearchParams(location.search);
   const modes=buttons.map(b=>b.dataset.worldFilter);
   let mode=modes.includes(params.get('filter'))?params.get('filter'):'all';
   inp.value=params.get('q')||'';
   // Atlas 21.2: private, allowlisted world-resume link. This is NOT a
   // collectible/progress save and never edits the canonical Atlas world data.
   const lastWorldKey='team-jura-directory-last-map-v1';
   const lastWorldBox=$('#j212Recent'),lastWorldLink=$('#j212RecentLink');
   function renderLastWorld(){
     if(!lastWorldBox||!lastWorldLink)return;
     const item=safe(lastWorldKey,{});
     // Never turn untrusted device storage into a navigable href.
     const selected=worlds.find(w=>w.id===item.id&&w.href===item.href);
     lastWorldBox.hidden=!selected;
     if(selected){lastWorldLink.href='./'+selected.href;
       lastWorldLink.textContent='Continue '+selected.name+' ›'}
   }
   renderLastWorld();
   function apply(){
     const url=new URL(location.href);
     for(const [key,value] of [['q',inp.value.trim()],['filter',mode==='all'?'':mode]]){
       if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);
     }
     history.replaceState(null,'',url);
     paint();
   }
   function paint(){feature.replaceChildren();additional.replaceChildren();const q=(inp?.value||'').trim().toLocaleLowerCase();let total=0;
     for(const w of worlds){const typeOk=mode==='all'||(mode==='interactive'?(w.kind==='interactive'||w.kind==='schematic'):mode==='research'?w.kind==='research':mode==='limited'?w.kind==='limited':w.kind==='gateway');if(!typeOk||!([w.id,w.name,w.game,w.short,w.grade,w.note,...w.features].join(' ').toLowerCase().includes(q)))continue;
       const card=makeWorld(w,false,true);card.classList.add('directory-card');
       card.addEventListener('click',()=>{save(lastWorldKey,{id:w.id,href:w.href})});
       const episode=w.id==='tlad'||w.id==='tbogt';
       const summary=episode?'50 sourced seagulls · Saved routes':w.kind==='gateway'?'Individual checklist · Personal pins & routes':w.features.slice(0,3).join(' · ');
       const note=episode?w.note:w.kind==='gateway'?'Built-in verified map calibration pending · Open for full coverage details':w.note;
       const features=E('p','world-feature-summary',summary);const caption=E('p','world-coverage-note',note);
       card.querySelector('.world-copy').append(features,caption);(w.group==='featured'?feature:additional).append(card);total++}
     if(count)count.textContent=total+' of '+worlds.length+' destinations';if($('#noWorlds'))$('#noWorlds').hidden=total!==0;
     $('#mainWorlds').hidden=feature.children.length===0;$('#otherWorlds').hidden=additional.children.length===0;
   }
   function syncButtons(){buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.worldFilter===mode)))}
   inp.addEventListener('input',apply);
   buttons.forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.worldFilter;syncButtons();apply()}));
   $('#resetWorldSearch').onclick=()=>{mode='all';inp.value='';syncButtons();apply();inp.focus()};
   syncButtons();paint();
 }
 const looks=[
  {id:'hero',title:'Original cinematic crew identity',kind:'approved',description:'Approved Team Jura character direction featuring the red-hatted Loki and Scaly Man.',art:'atlas98-approved-hero.webp'},
  {id:'home',title:'Approved universe homepage concept',kind:'approved',description:'Approved navigation and flagship-world visual reference; individual UI controls are built as real HTML.',art:'atlas98-approved-home-reference.webp'},
  {id:'loki',title:'Loki · five outfit explorations',kind:'concept',description:'Red top hat, red hair and slasher-inspired future variations.',art:'atlas98-loki-style-concept.webp'},
  {id:'scaly',title:'Scaly Man · wardrobe builds',kind:'concept',description:'Black tactical vest, short green/dark hair, painted slasher face and alternative outfits.',art:'atlas98-scaly-builds.webp'},
  {id:'styles',title:'Team Jura Style Lab concept boards',kind:'concept',description:'Galaxy textures, checker suits, gold trim and event-ready outfits.',art:'atlas98-style-lab.webp'},
  {id:'duo',title:'Crew Wardrobe Gallery',kind:'concept',description:'Coordinated Loki and Scaly looks from classic style to futuristic neon.',art:'atlas98-wardrobe-concept.webp'},
  {id:'slasher',title:'Slasher Collection',kind:'concept',description:'Horror-inspired red checker, black tactical, and ornate royal outfits.',art:'atlas98-slasher-collection.webp'},
  {id:'original',title:'Neon futuristic portrait',kind:'concept',description:'Experimental sci-fi treatment for special graphics and fan events.',art:'atlas98-original-cinematic.webp'}
 ];
 function styles(){const gallery=$('#styleGallery');if(!gallery)return;const keys='team-jura-atlas98-style-bookmarks-v1';let bookmarks=safe(keys,{}),filter='all';const buttons=$$('[data-style-filter]');const count=$('#savedStylesCount');const dialog=$('#styleDialog');const img=$('#stylePreview');const label=$('#stylePreviewLabel');
   function render(){gallery.replaceChildren();if(count)count.textContent=Object.values(bookmarks).filter(Boolean).length+' saved looks';
     for(const look of looks.filter(l=>filter==='all'||l.kind===filter)){
       const tile=E('article','style-tile');const image=E('img');image.src='./art/'+look.art;image.alt=look.title;image.loading='lazy';const body=E('div','style-body');body.append(E('small','',look.kind==='approved'?'APPROVED REFERENCE':'FUTURE CONCEPT · NOT APPROVED'),E('h3','',look.title),E('p','',look.description));const actions=E('div','style-actions');const zoom=E('button','','View artwork');zoom.type='button';zoom.addEventListener('click',()=>{if(img)img.src=image.src;if(label)label.textContent=look.title;if(dialog?.showModal)dialog.showModal();else window.open(image.src,'_blank','noopener')});const saveBtn=E('button','','☆ Save idea');saveBtn.type='button';if(bookmarks[look.id]){saveBtn.classList.add('is-saved');saveBtn.textContent='★ Saved'}saveBtn.addEventListener('click',()=>{bookmarks[look.id]=!bookmarks[look.id];if(!save(keys,bookmarks)){saveBtn.textContent='Storage unavailable';return}render()});actions.append(zoom,saveBtn);body.append(actions);tile.append(image,body);gallery.append(tile)
     }
   }buttons.forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.styleFilter;buttons.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render()}));render();
 }
 function init(){nav();const page=document.body.dataset.page;if(page==='home')homepage();if(page==='maps')directory();if(page==='styles')styles()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
