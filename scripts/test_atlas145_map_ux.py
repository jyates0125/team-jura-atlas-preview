#!/usr/bin/env python3
"""Atlas 14.5: ensure the actual VI layer buttons are sidebar-docked, not duplicated."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'atlas-vi.html').read_text(encoding='utf-8')
css=(root/'atlas145-leonida-map-ux.css').read_text(encoding='utf-8')
js=(root/'atlas145-leonida-map-ux.js').read_text(encoding='utf-8')
base=(root/'atlas86-ui.js').read_text(encoding='utf-8')
engine=(root/'atlas.js').read_text(encoding='utf-8')
for path in ('atlas145-leonida-map-ux.css','atlas145-leonida-map-ux.js'):
 assert path in html, path
assert "querySelector('.j86-mapviews')" in js
assert "sidebar.contains(views)" in js
assert "insertAdjacentElement('afterend',views)" in js
assert "views.classList.add('j145-docked-view')" in js
assert "scrollTo({top:0" in js
assert 'j145-open-map' in js and 'j145-open-map' in css
assert "position:static!important" in css
assert "grid-template-columns:repeat(2,minmax(0,1fr))" in css
assert "select.dispatchEvent(new Event('change'" in base
assert 'function mapView(style,g=game)' in engine
assert 'jura3-progress' in engine and 'jura-atlas-routes' in engine
assert 'jura86-leonida' in base
mobile=(root/'atlas145-mobile-map-entry.js').read_text(encoding='utf-8')
assert "if(!['atlas.html','atlas-online.html','atlas-vi.html'].includes(page))return" in mobile
assert "window.scrollTo({top:0" in mobile
assert "visitorInteracted" in mobile and "setTimeout(restoreFirstView,420)" in mobile
assert "initialHash" in mobile and "initialQuery.has('x')" in mobile
assert '/^#game(?:5|6|online)$/i.test(initialHash)' in mobile
assert '/^#game(?:5|6|online)$/i.test(location.hash)' in js
assert "!initialQuery.has('place')" in mobile
assert "sidebar.classList.add('mobile-collapsed')" in mobile
for filename in ('atlas.html','atlas-online.html','atlas-vi.html'):
 assert 'atlas145-mobile-map-entry.js?v=156' in (root/filename).read_text(encoding='utf-8'),filename
 assert 'atlas145-mobile-map-entry.css?v=211' in (root/filename).read_text(encoding='utf-8'),filename
assert "j145-docked-view" not in (root/'atlas.html').read_text()
assert "j145-docked-view" not in (root/'atlas-online.html').read_text()
print('Atlas 14.5 DOM-preserving Leonida sidebar view controls and map-first mobile gate PASS')
