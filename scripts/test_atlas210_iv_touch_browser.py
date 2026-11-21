#!/usr/bin/env python3
"""Atlas 21.0: exercise actual Chromium/Edge touch input on the built GTA IV page.

Runs with ATLAS_BROWSER=chromium or msedge after building public/.
No mocked pointer events: CDP Input.dispatchTouchEvent supplies two touch contacts.
"""
import os
import re
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
if not (PUBLIC / "atlas-iv.html").exists():
    raise SystemExit("Build Cloudflare public/ before touch acceptance")

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

server = ThreadingHTTPServer(("127.0.0.1", 0), partial(Quiet, directory=str(PUBLIC)))
threading.Thread(target=server.serve_forever, daemon=True).start()
base = "http://127.0.0.1:%d/" % server.server_port
engine = os.getenv("ATLAS_BROWSER", "chromium")

def coords(text):
    match = re.search(r"X (-?\d+) · Y (-?\d+) · ([\d.]+)× view", text)
    assert match, "Missing map coordinates/zoom status: " + text
    return tuple(float(item) for item in match.groups())

def touch(session, kind, points):
    session.send("Input.dispatchTouchEvent", {
        "type": kind,
        "touchPoints": [
            {"id": idx, "x": round(x, 2), "y": round(y, 2),
             "radiusX": 2, "radiusY": 2, "force": 0.8}
            for idx, x, y in points
        ],
    })

try:
    with sync_playwright() as pw:
        opts = {"headless": True}
        if engine == "msedge":
            opts["channel"] = "msedge"
        browser = pw.chromium.launch(**opts)
        context = browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=1, is_mobile=True, has_touch=True,
        )
        page = context.new_page()
        page.goto(base + "atlas-iv.html?scope=iv", wait_until="domcontentloaded", timeout=45000)
        page.wait_for_function(
            "document.querySelector('#visibleCount')?.textContent==='200'", timeout=25000
        )
        page.locator("#classicCanvas").scroll_into_view_if_needed()
        page.wait_for_function(
            "document.querySelector('#coordStatus')?.textContent?.includes('view')"
        )
        before = coords(page.locator("#coordStatus").inner_text())
        box = page.locator("#classicCanvas").bounding_box()
        assert box and box["width"] > 250 and box["height"] > 300, box
        mid_x = box["x"] + box["width"] / 2
        mid_y = box["y"] + box["height"] / 2
        assert 0 < mid_x < 390 and 0 < mid_y < 844, (mid_x, mid_y)
        session = context.new_cdp_session(page)

        # Two fingers move apart at an unchanged midpoint. Pinch must zoom,
        # not select a marker or turn into an unpredictable one-finger drag.
        touch(session, "touchStart", [(1, mid_x-20, mid_y), (2, mid_x+20, mid_y)])
        touch(session, "touchMove", [(1, mid_x-62, mid_y), (2, mid_x+62, mid_y)])
        page.wait_for_function(
            """(initial)=> {
                const t=document.querySelector('#coordStatus')?.textContent||'';
                const m=t.match(/([\d.]+)× view/);
                return Boolean(m) && Number(m[1]) > initial + .5;
            }""",
            arg=before[2], timeout=10000,
        )
        touch(session, "touchEnd", [])
        after = coords(page.locator("#coordStatus").inner_text())
        assert after[2] > before[2] + .5, (before, after)
        assert page.locator("#detailContent").is_hidden(), "Pinch selected a marker"
        assert page.locator("#stopCount").inner_text() == "0", "Pinch changed saved route"

        # A later one-finger gesture must still pan (pinch state was released).
        touch(session, "touchStart", [(3, mid_x, mid_y)])
        touch(session, "touchMove", [(3, mid_x + 65, mid_y + 15)])
        page.wait_for_function(
            """(initial)=> {
                const t=document.querySelector('#coordStatus')?.textContent||'';
                const m=t.match(/X (-?\d+) · Y (-?\d+)/);
                return Boolean(m) && Math.abs(Number(m[1])-initial)>10;
            }""",
            arg=after[0], timeout=10000,
        )
        touch(session, "touchEnd", [])
        panned = coords(page.locator("#coordStatus").inner_text())
        assert abs(panned[0]-after[0]) > 10, (after, panned)
        assert page.locator("#detailContent").is_hidden()

        evidence = ROOT / "qa-evidence" / engine
        evidence.mkdir(parents=True, exist_ok=True)
        page.locator("#classicMapShell").screenshot(
            path=str(evidence / "atlas210-iv-mobile-pinch.png"),
            animations="disabled", timeout=30000,
        )
        print("PASS Atlas 21.0 %s: real mobile two-finger zoom, anchored gesture, later single-finger pan" % engine)
        context.close()
        browser.close()
finally:
    server.shutdown()
