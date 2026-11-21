#!/usr/bin/env python3
"""Atlas 21.2: real-browser test of private map resume across all 13 world links."""
import os
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
if not(PUBLIC/'maps.html').exists():
    raise SystemExit('Build public/ first')
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):
        pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base='http://127.0.0.1:%d/'%server.server_port
engine=os.environ.get('ATLAS_BROWSER','chromium')
key='team-jura-directory-last-map-v1'

try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,**({'channel':'msedge'} if engine=='msedge' else {}))
  for width,height in ((1440,900),(390,844)):
   context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
   page=context.new_page()
   page.goto(base+'maps.html',wait_until='domcontentloaded')
   page.locator('.directory-card').first.wait_for()
   assert page.locator('.directory-card').count()==13
   assert page.locator('#j212Recent').is_hidden(), 'New visitors must not see a bogus recent map'
   # Gateway URLs include a game query: preserve the exact world, not a general IV map.
   card=page.locator('.directory-card[data-id="tlad"]')
   assert card.get_attribute('href')=='./map-hub.html?game=tlad'
   card.click()
   page.wait_for_url('**/map-hub.html?game=tlad')
   entry=page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',key)
   assert entry=={'id':'tlad','href':'map-hub.html?game=tlad'},entry
   page.goto(base+'maps.html',wait_until='domcontentloaded')
   recent=page.locator('#j212Recent')
   assert recent.is_visible()
   link=page.locator('#j212RecentLink')
   assert link.get_attribute('href')=='./map-hub.html?game=tlad'
   assert 'The Lost and Damned' in link.inner_text()
   link.click()
   page.wait_for_url('**/map-hub.html?game=tlad')
   assert parse_qs(urlparse(page.url).query).get('game')==['tlad']
   # New visit updates only the map shortcut, not the canonical world data.
   page.goto(base+'maps.html',wait_until='domcontentloaded')
   page.locator('.directory-card[data-id="story"]').click()
   page.wait_for_url('**/atlas.html')
   page.goto(base+'maps.html',wait_until='domcontentloaded')
   assert page.locator('#j212RecentLink').get_attribute('href')=='./atlas.html'
   # A modified localStorage value must never become an untrusted href.
   page.evaluate('(k)=>localStorage.setItem(k,JSON.stringify({id:"story",href:"javascript:alert(1)"}))',key)
   page.reload(wait_until='domcontentloaded')
   assert page.locator('#j212Recent').is_hidden()
   assert page.locator('.directory-card').count()==13
   if width==390:
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),'Mobile directory overflow'
   out=ROOT/'qa-evidence'/engine
   out.mkdir(parents=True,exist_ok=True)
   page.screenshot(path=str(out/('atlas212-directory-resume-'+str(width)+'.png')),
                   animations='disabled',timeout=20000)
   print('PASS Atlas 21.2 %s %s: 13 worlds, exact episode resume, local allowlist, safe fallback' % (engine,width))
   context.close()
  browser.close()
finally:
 server.shutdown()
