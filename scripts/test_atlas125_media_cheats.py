#!/usr/bin/env python3
"""Atlas 12.6: artwork-first directory, credited character portraits, and per-platform cheats."""
from pathlib import Path
import json, re
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]
def source(path):
    return (ROOT / path).read_text(encoding="utf-8")

worlds = source("atlas98-worlds.js")
portal = source("atlas98-portal.js")
css = source("atlas98-portal.css")
credits = source("atlas-credits.html")
expected = ("story","online","vi","cayo","iv","sa","vc","iii","vcs","lcs","ctw","tlad","tbogt")
assert worlds.count("coverFallback:") == len(expected)
assert worlds.count("coverSrc:") == len(expected), "All thirteen world covers must use local premium assets"
for key in expected:
    entry = next((line for line in worlds.splitlines() if "{id:'" + key + "'" in line), None)
    assert entry is not None, key
    # Source-of-truth covers use distinct bundled cinematic WebPs; SVG is fallback only.
    art=re.search(r"art:'([^']+\.svg)'",entry)
    assert art and (ROOT/'art'/art.group(1)).is_file(),key
    assert re.search(r"coverFallback:'\./art/[^']+'",entry),key
    image=re.search(r"coverSrc:'(\./art/(?:jura155-(?:story|online|vi|cayo)|jura157-(?:iv|sa|vc|iii|vcs|lcs|ctw|tlad|tbogt)-cinematic)\.webp)'",entry)
    assert image is not None, f"Missing world-specific cinematic cover: {key}"
    asset=ROOT/image.group(1).removeprefix('./')
    blob=asset.read_bytes()
    assert len(blob)>25000 and blob[:4]==b'RIFF' and blob[8:12]==b'WEBP',key
assert "world-art-frame" in portal and "world-art-main" in portal and "sourceIndex++" in portal
assert ".world-card .world-art-frame" in css
for name in ('atlas128-gta3-radar.png','atlas128-vice-city-radar.png','atlas128-gta4-landmarks.jpg'):
    path=ROOT/'art'/name
    assert path.is_file() and path.stat().st_size>40000,name
classic=source('atlas98-classic.js')
for name in ('atlas128-gta3-radar.png','atlas128-vice-city-radar.png','atlas128-gta4-landmarks.jpg'):
    assert name in classic,name
assert 'noiseXYZ' in credits and 'images/map4.jpg' in credits
assert 'id="cover-art"' in credits and 'id="reuse"' in credits
for p in ("index.html","maps.html","map-hub.html","atlas98-style-lab.html"):
    html=source(p)
    for asset in ("atlas98-portal.js","atlas98-worlds.js","atlas98-portal.css"):
        version=212 if p=="maps.html" and asset=="atlas98-portal.js" else 128
        assert f"./{asset}?v={version}" in html,(p,asset,version)

profiles=json.loads(source("data/atlas-universe-profiles.json"))
characters=[r for r in profiles["records"] if r["kind"]=="character"]
assert len(characters)==30
assert all(r.get("image","").startswith("https://") for r in characters)
assert all(r.get("imageCredit","").startswith("https://") for r in characters)
assert {"character:vic-vance","character:toni-cipriani","character:huang-lee","character:johnny-klebitz","character:luis-lopez"}.issubset({c["id"] for c in characters})
assert "data/atlas-universe-profiles.json?v=130" in source("atlas100-universe.js")
assert "elarioCharacterPortrait" in source("atlas100-universe.js")
assert "Portrait source" in source("atlas100-universe.js")
assert ".u-character-portrait" in source("atlas100-universe.css")
animals=[r for r in profiles["records"] if r["kind"]=="animal"]
assert len(animals)>=18
assert len([a for a in animals if a.get("image")])>=3

data=json.loads(source("data/atlas-news-cheats.json"))
assert data["schema"]==1 and data["checkedAt"]>="2026-11-18"
story=[c for c in data["cheats"] if c["game"]=="story"]
sa=[c for c in data["cheats"] if c["game"]=="sa"]
assert len(story)==36 and len(sa)>=17
for game,count in [('iii',24),('vc',58),('iv',16),('tlad',6),('tbogt',9),('lcs',11),('vcs',11),('ctw',21)]:
    assert len([x for x in data['cheats'] if x['game']==game])==count,game
assert all(r.get("ps") and r.get("code") and r.get("phone") for r in story if r.get("code"))
assert next(r for r in sa if r["code"]=="KANGAROO")["ps"]=="Up Up Triangle Triangle Up Up Left Right Square R2 R2"
assert not any(r["game"]=="sa" and r["code"]=="CJPHONEHOME" and "jump" in r["name"].lower() for r in data["cheats"])
for row in data["cheats"]:
    if row.get("ps"):
        assert all(t in {"Left","Right","Up","Down","Cross","Circle","Square","Triangle","L1","L2","R1","R2"} for t in row["ps"].split()),row
class Doc(HTMLParser):
    def __init__(self):super().__init__();self.ids=set();self.scripts=[]
    def handle_starttag(self,tag,attrs):
        p=dict(attrs)
        if "id" in p: self.ids.add(p["id"])
        if tag=="script":self.scripts.append(p.get("src",""))
page=Doc();page.feed(source("atlas-cheats.html"))
assert {"hubGame","hubSearch","hubPlatform","hubCards","cheatPlatformHelp"}.issubset(page.ids)
assert "./atlas103-hub.js?v=131" in page.scripts
for game in ('story','sa','iii','vc','iv','lcs','vcs','ctw','tlad','tbogt','vi','online'):
    assert 'value="' + game + '"' in source("atlas-cheats.html"),game
hub=source("atlas103-hub.js")
for needle in ("PS_TO_XBOX","PS3_HD","X360_SWAP","MODERN_PHONE","function tokens","function available","syncPlatform"):
    assert needle in hub,needle
print("PASS Atlas 12.7 artwork-first maps, character portraits and seven-game-platform cheats")
