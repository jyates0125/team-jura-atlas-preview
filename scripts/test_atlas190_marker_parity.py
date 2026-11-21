#!/usr/bin/env python3
"""Atlas 19.0: evidence-backed map and marker parity without invented coordinates."""
from pathlib import Path
import json, re

ROOT=Path(__file__).resolve().parents[1]
def read(path):
    return (ROOT/path).read_text(encoding='utf-8')

iv=read('atlas-iv.js')
ivhtml=read('atlas-iv.html')
sa=read('atlas85-sa.js')
saplan=read('atlas190-sa-route.js')
sacss=read('atlas190-sa-route.css')
sah=read('atlas-sa.html')
classic=read('atlas98-classic.js')
hub=read('map-hub.html')

birds=json.loads(read('data/atlas-iv-300-source-birds.json'))
assert birds['schema']==1 and birds['game']=='4' and birds['license']=='MIT'
assert birds['sourceCommit']=='de21b7df7ec8b10dfe5abe7290d894efbfc1bd11'
assert birds['count']==300
assert {k:len(v) for k,v in birds['sets'].items()}=={'iv':200,'tlad':50,'tbogt':50}
ids=set()
for scope,rows in birds['sets'].items():
    for r in rows:
        assert r['id'].startswith(scope+'-bird-') and r['edition']==scope
        assert r['id'] not in ids and all(isinstance(r[k],(int,float)) for k in ('x','y','z'))
        assert abs(r['x'])<10000 and abs(r['y'])<10000
        assert 'collectible' in r['tags']
        ids.add(r['id'])
assert len(ids)==300
gtadb=json.loads(read('data/gtadb-4-manifest.json'))
assert gtadb['license']=='CC BY 4.0' and gtadb['count']==2650
assert gtadb['mappedCount']==2648
# Never discard positioned entries whose upstream source left the title blank.
source_rows=json.loads(read('data/gtadb-4.json'))['records']
untitled=[key for key,row in source_rows.items() if isinstance(row,list) and isinstance(row[0],str) and not row[0].strip()]
assert len(untitled)==14 and len(source_rows)==2650
assert 'Unnamed community landmark (source ${id})' in iv
assert 'Source title unavailable' in iv
assert 'Math.ceil(visible.length/400)' not in iv,'Old stride-based data omission returned'
for token in ('hitTargets.push','const clustered=size>1','getComputedStyle' if False else 'j190-marker-status',
              "loadBirds()", "setScope(which)", "birdRecords={iv:[],tlad:[],tbogt:[]}",
              "sourceFile", "birdFound", "j190-iv-hide-found", "j190-iv-found"):
    assert token in iv,token
for token in ('j190-iv-scope','GTA IV · 200 Flying Rats','50 Seagulls','j190-iv-found',
              'j190-marker-status','pigeon-locator','MIT'):
    assert token in ivhtml,token
assert 'atlas-iv.js?v=210' in ivhtml and 'atlas-iv.css?v=200' in ivhtml
# New touch support must preserve accessible single-pointer, marker, wheel and keyboard behavior.
for token in ("const activePointers=new Map()", "activePointers.size>=2",
              "pinch.zoom+Math.log2(distance/pinch.distance)",
              "canvas.addEventListener('pointercancel'",
              "canvas.addEventListener('wheel'",
              "canvas.addEventListener('keydown'",
              "if(found.members.length===1){select(found.members[0],false);return}"):
    assert token in iv,token
assert "pinch with two fingers" in ivhtml.lower()
pack=json.loads(read('data/atlas-sa-150-sourced-pins.json'))
assert pack['schema']==1 and len(pack['records'])==150
assert pack['counts']=={'snapshots':50,'horseshoes':50,'oysters':50}
assert 'juraSaPoint' in sa and 'juraSaSet' in sa
assert "loadAtlasSourcePins" in sa and "team-jura-sa-v1" in sa
for token in ('getRoute:()=>lastRoute.map','sourceReady()', 'atlas-sa-150-sourced-pins.json',
              "state.skipCollected", "Map selection canceled", "Math.max(1,state.limit",
              'j190-sa-overlay', 'No required ending pin', 'TeamJuraSARoute'):
    assert token in saplan,token
assert 'j190-sa-line' in sacss and 'pointer-events:none' in sacss
assert 'atlas190-sa-route.js?v=190' in sah and 'atlas190-sa-route.css?v=190' in sah
assert 'j190-episode-collectibles' in hub
assert "atlas-iv.html?scope=" in classic
assert 'atlas98-classic.js?v=190' in hub
assert len(set(ids))==300
print('PASS Atlas 19.0: 2650 sourced IV landmarks (2648 positioned), 300 MIT GTA IV/episode birds, 150 SA pickups, scoped routes, markers and credits')
