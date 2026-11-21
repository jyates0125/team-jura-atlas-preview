#!/usr/bin/env python3
"""Atlas 21.2 source rules: exactly one optional, allowlisted map-resume key."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'maps.html').read_text(encoding='utf-8')
js=(root/'atlas98-portal.js').read_text(encoding='utf-8')
css=(root/'atlas212-directory-resume.css').read_text(encoding='utf-8')
world=(root/'atlas98-worlds.js').read_text(encoding='utf-8')
assert 'id="j212Recent"' in html and 'hidden' in html
assert 'id="j212RecentLink"' in html
assert 'atlas98-portal.js?v=212' in html and 'atlas212-directory-resume.css?v=212' in html
for phrase in ("team-jura-directory-last-map-v1","w.id===item.id&&w.href===item.href",
               "save(lastWorldKey,{id:w.id,href:w.href})","lastWorldBox.hidden=!selected"):
 assert phrase in js,phrase
assert 'javascript:alert' not in js and 'team-jura-atlas97-last-workspace-v1' in js # Existing homepage read retained
assert 'j212-recent-map[hidden]' in css and 'min-height:44px' in css
assert world.count("group:'featured'")==4
assert world.count("group:'additional'")==9
print('PASS Atlas 21.2: 13 approved world links, isolated last-map storage, safe recent destination and intact dashboard read')
