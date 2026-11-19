/* Team Jura Atlas 13.0 — transparent, user-initiated social sharing.
 * No tracking pixels, no server-side analytics, no auto-posting or account impersonation. */
(function(){'use strict';
const SITE='https://team-jura-atlas-preview.pages.dev/';
const POST={
 title:'Team Jura Atlas | Explore the GTA Universe',
 text:'Explore 13 GTA destinations: maps, collectibles, heists, garages, and unverified Leonida research. Free public development preview by Elario Studios. Many Crews. One Vision.',
 film:'One Last Ride — the Team Jura fan-fiction tribute, nine-chapter story treatment and motion-poster preview. The full animated film is still in development.',
 tiktok:'POV: You just found 13 GTA worlds in ONE place. 🎮 Explore Team Jura Atlas — interactive maps, collectibles, heists, garages & more. We are building in public. Which GTA world is your favorite? '+SITE+' #GTA #GTAV #GTAOnline #GTA6 #GamingCommunity #TeamJuraAtlas',
 youtube:'Team Jura Atlas — 13 GTA destinations in one public development preview! Explore working maps, collectibles, heist planning, garage tools, and source-labeled Leonida research. Which GTA world should we improve next? '+SITE+' #GTA #GTAV #GTAOnline #TeamJuraAtlas',
 instagram:'13 GTA worlds. One growing community-made Atlas. 🗺️🎮 From Los Santos to provisional Leonida research, check out our maps, heists, collectibles and garage tools. Public development preview — link in bio: '+SITE+' #GTA #GTAV #GTAOnline #GamingCommunity #TeamJuraAtlas',
 discord:'🎮 Team Jura Atlas public preview is open! Explore maps, heist workspaces, collectibles and garage tools across 13 GTA destinations. Feedback welcome — still under development. Many Crews. One Vision. '+SITE,
 facebook:'🚀 Team Jura Atlas by Elario Studios is open as a public development preview! Explore 13 GTA destinations: maps, collectible tools, garages, heists and research. Join us as we build. Many Crews. One Vision. '+SITE,
 short:'Explore 13 GTA worlds in Team Jura Atlas. Free fan-made public development preview: '+SITE
};
const display=(message)=>{document.querySelectorAll('[data-j130-status]').forEach(n=>{n.textContent=message})};
async function copy(text){
 display('Preparing your caption for copying…');
 try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);display('Copied — ready to paste.');return true}}
 catch(_){}
 const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.left='-9999px';document.body.append(ta);ta.select();
 try{let done=document.execCommand('copy');ta.remove();if(done){display('Copied — ready to paste.');return true}}catch(_){ta.remove()}
 display('Select the prepared text and copy it manually.');const first=document.querySelector('[data-j130-copytext]');if(first){first.focus();first.select()}return false;
}
function linkTo(kind){const url=new URL(SITE);if(kind!=='site')url.searchParams.set('from',kind);return url.toString()}
function socialUrl(platform,url,title,text){
 if(platform==='facebook')return 'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url);
 if(platform==='reddit')return 'https://www.reddit.com/submit?url='+encodeURIComponent(url)+'&title='+encodeURIComponent(title);
 if(platform==='x')return 'https://twitter.com/intent/tweet?text='+encodeURIComponent(text.slice(0,160))+'&url='+encodeURIComponent(url);
 if(platform==='pinterest')return 'https://www.pinterest.com/pin/create/button/?url='+encodeURIComponent(url)+'&description='+encodeURIComponent(text);
 return null;
}
document.addEventListener('click',async(e)=>{
 const el=e.target.closest('[data-j130-action]');if(!el)return;
 const kind=el.getAttribute('data-j130-action');
 if(kind==='copy-url'){e.preventDefault();await copy(linkTo(el.dataset.platform||'site'));return}
 if(kind==='copy-text'){e.preventDefault();await copy(el.dataset.kind==='custom'?(document.querySelector('[data-j130-copytext]')?.value||POST.facebook):(POST[el.dataset.kind]||POST.short));return}
 if(kind==='copy-page'){e.preventDefault();await copy(window.location.href);return}
 if(kind==='share-page'){
   e.preventDefault();const url=el.dataset.shareUrl?new URL(el.dataset.shareUrl,window.location.href).href:window.location.href;
   const film=url.includes('one-last-ride');const title=film?'One Last Ride | Team Jura Atlas':POST.title;const text=film?POST.film:POST.text;
   if(navigator.share){try{await navigator.share({title,text,url});display('Share sheet opened.');return}catch(err){if(err&&err.name==='AbortError')return}}
   await copy(text+' '+url);return;
 }
 if(kind==='open-social'){
   e.preventDefault();const platform=el.dataset.platform;const url=linkTo(platform||'site');
   const destination=socialUrl(platform,url,POST.title,POST.text);
   if(destination)window.open(destination,'_blank','noopener,noreferrer');
   else await copy(url);
 }
});
const caption=document.querySelector('[data-j130-copytext]');if(caption)caption.value=POST.facebook;
document.querySelectorAll('[data-j130-version]').forEach(n=>n.textContent='Public development preview · 13 destinations · Not affiliated with Rockstar Games');
})();
