#!/usr/bin/env python3
"""Atlas 13.1 review-only social metadata: exact destinations and honest artwork."""
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
BASE="https://team-jura-atlas-preview.pages.dev/"
PAGES={
 'atlas.html':'Story map',
 'atlas-online.html':'Online map',
 'atlas-vi.html':'Leonida',
 'atlas-cayo.html':'Cayo',
 'maps.html':'13',
 'atlas93-garage.html':'Garage',
 'atlas-database.html':'Database',
 'heists.html':'Heist'
}
class Meta(HTMLParser):
 def __init__(self):super().__init__();self.m={};self.links=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='meta':self.m[a.get('property') or a.get('name')]=a.get('content')
  if tag=='link':self.links.append(a)
for path,term in PAGES.items():
 html=(ROOT/path).read_text(encoding='utf8')
 p=Meta();p.feed(html)
 assert len([x for x in p.links if x.get('rel')=='canonical'])==1,path
 assert [x['href'] for x in p.links if x.get('rel')=='canonical']==[BASE+path],path
 assert p.m['og:url']==BASE+path,path
 assert p.m['og:type']=='website',path
 assert p.m['og:site_name'].startswith('Elario Studios'),path
 assert p.m['og:title'] and p.m['twitter:title']==p.m['og:title'],path
 assert p.m['og:description'] and p.m['twitter:description']==p.m['og:description'],path
 assert p.m['og:image']==p.m['twitter:image'],path
 assert p.m['og:image:alt'] and ('original' in p.m['og:image:alt'].lower()),path
 assert p.m['twitter:card']=='summary_large_image',path
 assert p.m['og:image'].startswith(BASE+'art/'),path
 assert (ROOT/p.m['og:image'].removeprefix(BASE)).is_file(),path
 assert html.count('href="./atlas-share.html"')==1,path
 assert 'aria-label="Share Team Jura Atlas"' in html,path
 assert term.lower() in (p.m['og:title']+' '+p.m['og:description']).lower(),path
 if path=='atlas-vi.html':
  assert 'provisional' in p.m['og:description'].lower()
  assert 'unverified' in p.m['og:description'].lower()
 if path=='atlas-cayo.html':assert 'schematic' in p.m['og:description'].lower()
assert 'id="youtube"' in (ROOT/'atlas-share.html').read_text(encoding='utf8')
assert 'data-kind="youtube"' in (ROOT/'atlas-share.html').read_text(encoding='utf8')
assert "youtube:" in (ROOT/'atlas130-share.js').read_text(encoding='utf8')
assert 'id="featuredGrid"' in (ROOT/'index.html').read_text(encoding='utf8')
assert (ROOT/'atlas-dashboard.html').is_file()
charter=(ROOT/'docs/TEAM-JURA-STANDING-CHARTER.md').read_text(encoding='utf8')
assert 'no further `development` merges or live Cloudflare releases are pre-authorized' in charter
assert 'fresh explicit owner approval' in charter
print("PASS Atlas 13.1: 8 honest game-scope preview pages, distinct canonical URLs, share navigation, strict release hold")
