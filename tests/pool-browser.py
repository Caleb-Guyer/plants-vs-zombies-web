"""Play ZomBotany cards in a muted browser and restore their native trophies."""
import argparse
import base64
from contextlib import contextmanager
from functools import partial
from hashlib import sha256
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import shutil
import socket
import struct
import subprocess
import tempfile
import threading
import time
from urllib.error import HTTPError, URLError
from urllib.request import build_opener, ProxyHandler, Request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
ELEMENT = "element-6066-11e4-a52e-4f735466cecf"
DIRECT = build_opener(ProxyHandler({}))


def wait_until(read, timeout=90):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        value = read()
        if value:
            return value
        time.sleep(0.3)
    raise TimeoutError(f"Condition did not become true in {timeout} seconds")


class SiteFiles(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


@contextmanager
def serve_site(directory):
    with ThreadingHTTPServer(("127.0.0.1", 0), partial(SiteFiles, directory=directory)) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        try:
            yield f"http://127.0.0.1:{server.server_port}"
        finally:
            server.shutdown()


class Browser:
    def __init__(self, port):
        self.base = f"http://127.0.0.1:{port}"
        self.session = ""

    def request(self, method, path, payload=None):
        data = json.dumps(payload).encode() if payload is not None else None
        request = Request(self.base + self.session + path, data=data, method=method,
                          headers={"Content-Type": "application/json"})
        try:
            with DIRECT.open(request, timeout=100) as response:
                return json.load(response)["value"]
        except HTTPError as error:
            raise RuntimeError(error.read().decode()[:1500]) from error

    def execute(self, script, *args, asynchronous=False):
        return self.request("POST", "/execute/" + ("async" if asynchronous else "sync"),
                            {"script": script, "args": args})

    def element(self, selector):
        return self.request("POST", "/element", {"using": "css selector", "value": selector})[ELEMENT]

    def screenshot(self):
        picture = self.request("GET", "/element/" + self.element("#canvas") + "/screenshot")
        return base64.b64decode(picture)


@contextmanager
def launch_browser(driver, profile):
    with socket.socket() as available:
        available.bind(("127.0.0.1", 0))
        port = available.getsockname()[1]
    edge = "msedgedriver" in Path(driver).name.lower()
    browser = Browser(port)
    flags = ["--headless=new", "--mute-audio", "--no-first-run", "--disable-dev-shm-usage",
             "--enable-unsafe-swiftshader", "--window-size=960,800", f"--user-data-dir={profile}"]
    options = {"browserName": "MicrosoftEdge" if edge else "chrome",
               ("ms:edgeOptions" if edge else "goog:chromeOptions"): {"args": flags}}
    with subprocess.Popen([driver, f"--port={port}"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                          env={**os.environ, "MSEDGEDRIVER_TELEMETRY_OPTOUT": "1"}) as service:
        try:
            def ready():
                if service.poll() is not None:
                    raise RuntimeError("Browser driver exited before accepting a session")
                try:
                    return browser.request("GET", "/status")["ready"]
                except URLError:
                    return False
            wait_until(ready, 20)
            session = browser.request("POST", "/session", {"capabilities": {"alwaysMatch": options}})
            browser.session = "/session/" + session["sessionId"]
            browser.request("POST", "/timeouts", {"script": 70000})
            yield browser
        finally:
            try:
                if browser.session:
                    browser.request("DELETE", "")
            finally:
                service.terminate()


def click_canvas(browser, x, y):
    x, y = browser.execute("""
        const rect = Module.canvas.getBoundingClientRect();
        return [Math.round(rect.x + rect.width * arguments[0]/800),
                Math.round(rect.y + rect.height * arguments[1]/600)];
    """, x, y)
    browser.request("POST", "/actions", {"actions": [{"type": "pointer", "id": "mouse",
        "parameters": {"pointerType": "mouse"}, "actions": [
            {"type": "pointerMove", "origin": "viewport", "x": x, "y": y},
            {"type": "pointerDown", "button": 0}, {"type": "pause", "duration": 30},
            {"type": "pointerUp", "button": 0}]}]})


def whack_puff(browser, output):
    # Track the Puff-shroom's purple cap on the lawn. Restricting the search to
    # its former position after the swing also works when a second grave opens.
    def read_lawn(frame, near=None):
        result = browser.execute("""
            const [png, near, done] = arguments;
            (async () => {
                const image = new Image();
                image.src = 'data:image/png;base64,' + png;
                await image.decode();
                const ctx = new OffscreenCanvas(800,600).getContext('2d');
                ctx.drawImage(image,0,0,800,600);
                const x0 = near ? Math.max(140,near[0]-65) : 185;
                const x1 = near ? Math.min(799,near[0]+65) : 799;
                const y0 = near ? Math.max(74,near[1]-55) : 74;
                const y1 = near ? Math.min(563,near[1]+55) : 563;
                const w = x1-x0, h = y1-y0, pixels = ctx.getImageData(x0,y0,w,h).data;
                const cap = new Uint8Array(w*h), stack = new Int32Array(w*h);
                let orangePixels = 0;
                for (let cell=0; cell<cap.length; cell++) {
                    const i=cell*4, r=pixels[i], g=pixels[i+1], b=pixels[i+2];
                    if (r>65 && r-g>30 && r-g<90 && r-b>=0 && r-b<22) cap[cell]=1;
                    if (r>=210 && g>=45 && g<=165 && b<40 && r-g>60 && g-b>45) orangePixels++;
                }
                let best=null, largest=90;
                for(let cell=0; cell<cap.length; cell++) {
                    if(!cap[cell]) continue;
                    cap[cell]=0;
                    let top=1, count=0, sx=0, sy=0;
                    stack[0]=cell;
                    while(top) {
                        const p=stack[--top], x=p%w, y=Math.floor(p/w);
                        count++; sx+=x; sy+=y;
                        for (const q of [x>0?p-1:-1,x+1<w?p+1:-1,p-w,p+w]) {
                            if (q<0 || q>=cap.length || !cap[q]) continue;
                            cap[q]=0; stack[top++]=q;
                        }
                    }
                    if(count>largest) {
                        largest=count;
                        best=[Math.round(sx/count)+x0,Math.round(sy/count)+y0];
                    }
                }
                return {cap:best, orange:orangePixels};
            })().then(done,error=>done({error:String(error)}));
        """, base64.b64encode(frame).decode(), near, asynchronous=True)
        assert "error" not in result, result
        return result

    end = time.monotonic() + 45
    while time.monotonic() < end:
        before = browser.screenshot()
        target = read_lawn(before)["cap"]
        if target is None:
            time.sleep(0.1)
            continue
        # Miss in the empty left margin. The same cap must still be on screen.
        click_canvas(browser, 105, 100)
        missed = browser.screenshot()
        control = read_lawn(missed, target)
        moving = control["cap"]
        if moving is None:
            continue
        click_canvas(browser, moving[0], moving[1]+20)
        impact = browser.screenshot()
        # Check the original orange POW burst at the point of contact.
        saw_pow = read_lawn(impact, moving)["orange"] > control["orange"] + 65
        # The cursor draws a mallet. Move it clear before checking the kill.
        canvas = browser.execute("const r=Module.canvas.getBoundingClientRect(); return [r.x+r.width*.12,r.y+r.height*.18]")
        browser.request("POST", "/actions", {"actions":[{"type":"pointer","id":"mouse",
            "parameters":{"pointerType":"mouse"},"actions":[{"type":"pointerMove","origin":"viewport",
            "x":round(canvas[0]),"y":round(canvas[1])}]}]})
        cutoff = time.monotonic() + 0.9
        while time.monotonic() < cutoff:
            after = browser.screenshot()
            field = read_lawn(after, moving)
            if field["orange"] > control["orange"] + 65:
                saw_pow = True
                impact = after
            if field["cap"] is None and saw_pow:
                if output:
                    (output/"puff-before.png").write_bytes(missed)
                    (output/"puff-whacked.png").write_bytes(impact)
                return
        time.sleep(0.1)
    raise AssertionError("A deliberate mallet hit did not remove a visible Puff-shroom head")


def play_opening(browser, output, mode="pool"):
    # Each reference is the average RGB across a 6-by-4 grid on the native 800-by-600 screen.
    # Sample stable artwork so menu movement and the pool's ripples can vary between frames.
    references = json.loads((ROOT / "tests/fixtures/zspool1-screens.json").read_bytes())
    key = {"bowling":"zbowling", "pins":"zbowling", "whack":"zwhack", "twist":"ztwist"}.get(mode, "zs"+mode)
    if mode != "pool":
        references.update(json.loads((ROOT / f"tests/fixtures/{key}1-screens.json").read_bytes()))
    if mode == "pins":
        references.update(json.loads((ROOT / "tests/fixtures/zpins1-screens.json").read_bytes()))
    def inspect(frame, before_roll=None, lane=2, pumpkin=False):
        return browser.execute("""
            const [png, references, beforeRoll, lane, pumpkin, done] = arguments;
            (async () => {
                const image = new Image();
                image.src = 'data:image/png;base64,' + png;
                await image.decode();
                const ctx = new OffscreenCanvas(800,600).getContext('2d', {willReadFrequently:true});
                ctx.drawImage(image,0,0,800,600);
                const scores = {};
                for (const [name,{rect,rgb}] of Object.entries(references)) {
                    const data = ctx.getImageData(...rect).data;
                    const [, , w, h] = rect;
                    const sums = Array(72).fill(0), counts = Array(24).fill(0);
                    for (let y=0; y<h; y++) for (let x=0; x<w; x++) {
                        const cell = Math.floor(4*y/h)*6 + Math.floor(6*x/w);
                        counts[cell]++;
                        for (let c=0; c<3; c++) sums[3*cell+c] += data[4*(y*w+x)+c];
                    }
                    scores[name] = sums.reduce((total,sum,i) =>
                        total + Math.abs(sum/counts[Math.floor(i/3)]-rgb[i]),0)/72;
                }
                const plant = ctx.getImageData(60,317,40,24).data;
                let green = 0;
                for (let i=0; i<plant.length; i+=4)
                    if (plant[i+1]>80 && plant[i+1]>plant[i]*1.3 && plant[i+1]>plant[i+2]*1.4) green++;
                scores.lily = green/(40*24);
                if (beforeRoll) {
                    const bounds = [190,84+100*lane,480,73];
                    const current = ctx.getImageData(...bounds).data;
                    const previous = new Image();
                    previous.src = 'data:image/png;base64,' + beforeRoll;
                    await previous.decode();
                    ctx.drawImage(previous,0,0,800,600);
                    const bare = ctx.getImageData(...bounds).data;
                    let count=0, sumX=0;
                    for (let i=0; i<current.length; i+=4) {
                        const [r,g,b] = [current[i],current[i+1],current[i+2]];
                        const shell = pumpkin ? r>125 && r>1.45*g && g>1.8*b :
                            r>85 && g>45 && r>1.10*g && r<2.25*g && g>1.55*b;
                        if (shell &&
                            Math.abs(r-bare[i])+Math.abs(g-bare[i+1])+Math.abs(b-bare[i+2])>75) {
                            count++;
                            sumX += bounds[0]+((i/4)%bounds[2]);
                        }
                    }
                    scores.rollingX = count>200 ? sumX/count : null;
                }
                return scores;
            })().then(done, error => done({error:String(error)}));
        """, base64.b64encode(frame).decode(), references, before_roll, lane, pumpkin, asynchronous=True)

    def reach(target, source=None, position=None):
        next_click = 0
        end = time.monotonic() + 70
        # The two golden-brown nut packets have similar colors at conveyor size.
        tolerance = 9 if target in ("readyTall", "readyPumpkin") else 18
        while time.monotonic() < end:
            frame = browser.screenshot()
            scores = inspect(frame)
            assert "error" not in scores, scores
            if scores[target] < tolerance:
                if output:
                    (output / (target + ".png")).write_bytes(frame)
                return
            if source and scores[source] < 18 and time.monotonic() >= next_click:
                click_canvas(browser, *position)
                next_click = time.monotonic() + 1
            time.sleep(0.3)
        raise AssertionError(f"Could not reach {target}; last visual differences {scores}")

    reach("menu", "title", (400,545))
    reach("minigames", "menu", (565,245))
    reach("family", "minigames", (562,581))
    if mode == "twist":
        reach("twistCard")
        reach("twistLawn", "twistCard", (90,505))
        # The seed shop is hidden until a legal rotation scores. Work across the
        # actual random board with pointer clicks until its four packets appear.
        def shop_visible():
            return inspect(browser.screenshot())["twistShop"] < 14
        assert not shop_visible(), "Unplayed board already shows the match reward"
        for row in range(4):
            for col in range(7):
                click_canvas(browser, 120+80*col, 180+100*row)
                time.sleep(.38)
                if shop_visible():
                    if output:
                        (output / "scored-rotation.png").write_bytes(browser.screenshot())
                    assert browser.execute("return PVZAudio.isMuted()")
                    return
        raise AssertionError("No rotation scored on the fresh Twist board")
    if mode == "whack":
        reach("whackCard")
        reach("whackLawn", "whackCard", (710,385))
        whack_puff(browser, output)
        assert browser.execute("return PVZAudio.isMuted()"), "Whack-a-Zombie test lost its mute"
        return
    if mode in ("bowling", "pins"):
        reach("stripe", "family", (555,385))
        opening = [("readyNut", 2)]
        if mode == "pins":
            opening.extend([("readyTall", 1), ("readyPumpkin", 3)])
        for packet, lane in opening:
            reach(packet)
            before_roll = base64.b64encode(browser.screenshot()).decode()
            click_canvas(browser, 125,40)
            click_canvas(browser, 202,131+100*lane)
            first = None
            end = time.monotonic()+12
            while time.monotonic() < end:
                frame = browser.screenshot()
                x = inspect(frame, before_roll, lane, packet == "readyPumpkin")["rollingX"]
                if x is not None:
                    if first is None and 215 < x < 465:
                        first = x
                        if output: (output / (packet + "-near.png")).write_bytes(frame)
                    if first is not None and x > 360 and x-first > 90:
                        if output: (output / (packet + "-far.png")).write_bytes(frame)
                        break
                time.sleep(0.05)
            else:
                raise AssertionError(f"{packet} did not roll across the red line in lane {lane+1}")
        assert browser.execute("return PVZAudio.isMuted()"), "Bowling test lost its mute"
        return
    card_x = {"pool": 90, "fog": 245, "roof": 400}[mode]
    reach("chooser", "family", (card_x,385))
    if mode == "roof":
        # Flower Pot, Potato Mine, Sunflower, Cabbage-pult, Kernel-pult and Umbrella Leaf.
        seeds = ((100,437),(260,154),(100,154),(45,437),(155,437),(314,437))
    elif mode == "fog":
        # Sun-shroom, Puff-shroom, Sea-shroom, Lily Pad, Plantern and Blover.
        seeds = ((100,224),(45,224),(45,366),(45,298),(100,366),(206,366))
    else:
        # Peashooter, Sunflower, Wall-nut, Potato Mine, Lily Pad and Squash.
        seeds = ((45,154),(100,154),(206,154),(260,154),(45,298),(100,298))
    for position in seeds:
        click_canvas(browser, *position)
        time.sleep(0.35)
    time.sleep(1)
    click_canvas(browser, 231,565)
    reach("lawn")
    if mode == "roof":
        reach("bareTile")
        reach("readyMine")
        click_canvas(browser, 120,42)
        click_canvas(browser, 320,320)
        reach("flowerPot")
        click_canvas(browser, 178,42)
        click_canvas(browser, 320,320)
        reach("armedMine")
        assert browser.execute("return PVZAudio.isMuted()"), "Roof gameplay test lost its mute"
        return
    if mode == "fog":
        reach("coveredWater")
        # The original Plantern packet starts the first flag on cooldown.
        reach("readyPlantern")
        click_canvas(browser, 354,42)
        click_canvas(browser, 560,230)
        def upper_bank_is_lit():
            frame = browser.screenshot()
            scores = inspect(frame)
            if scores["plantern"] < 18 and scores["litWater"] < 18 and scores["coveredWater"] > 26:
                if output:
                    (output / "lit-water.png").write_bytes(frame)
                return True
            return False
        wait_until(upper_bank_is_lit, 35)
        assert browser.execute("return PVZAudio.isMuted()"), "Fog gameplay test lost its mute"
        return
    wait_until(lambda: inspect(browser.screenshot())["lily"] < 0.05, 20)
    def plant_lily():
        frame = browser.screenshot()
        scores = inspect(frame)
        if scores["lawn"] < 18 and scores["lily"] > 0.18:
            if output:
                (output / "planted-lily.png").write_bytes(frame)
            return True
        click_canvas(browser, 354,42)
        click_canvas(browser, 80,325)
        time.sleep(0.5)
        return False
    wait_until(plant_lily, 30)
    assert browser.execute("return PVZAudio.isMuted()"), "Gameplay test lost its mute"


def open_with_profile(browser, site, scratch, profile, output, mode):
    # Use the save controls before native startup so the game reads the imported profile itself.
    browser.request("POST", "/url", {"url": site + "/source/build-provenance.json"})
    browser.execute("sessionStorage.setItem('pvz-show-import','1')")
    browser.request("POST", "/url", {"url": site + "/?testing=1"})
    wait_until(lambda: browser.execute("return !!document.querySelector('#more-dialog')?.open"))
    assert browser.execute("return PVZAudio.isMuted()"), "Browser test must be muted"
    name = (mode.title() + " QA").encode()
    index = struct.pack("<IHH", 14, 1, len(name)) + name + struct.pack("<II", 1, 1)
    save = scratch / (mode + "-save.zip")
    with zipfile.ZipFile(save, "w") as archive:
        archive.writestr("userdata/users.dat", index)
        archive.writestr("userdata/user1.dat", profile)
    file_input = browser.element("#upload-save-import-input")
    browser.request("POST", "/element/" + file_input + "/value", {"text": str(save)})
    wait_until(lambda: browser.execute("return document.querySelector('#save-import-status').textContent.includes('Save imported.')"))
    browser.execute("sessionStorage.setItem('pvz-show-import','1')")
    browser.request("POST", "/refresh", {})
    wait_until(lambda: browser.execute("return !!document.querySelector('#more-dialog')?.open"))
    exported = browser.execute("""
        const done = arguments[arguments.length-1];
        (async () => {
            await ensureSaveFsReady();
            const zip = await PVZSaveTransfer.exportZip(Module.FS, JSZip, {type:'uint8array'});
            const file = (await JSZip.loadAsync(zip, {checkCRC32:true})).file('userdata/user1.dat');
            return await file.async('base64');
        })().then(done, error => done({error:String(error)}));
    """, asynchronous=True)
    assert isinstance(exported, str) and base64.b64decode(exported) == profile, "Reload changed the earned native save"
    browser.request("POST", "/element/" + browser.element("#more-close") + "/click", {})
    wait_until(lambda: browser.execute("return document.body.classList.contains('game-mode')"), 120)
    assert browser.execute("return PVZAudio.isMuted() && Module.canvas.width >= 800 && Module.canvas.height >= 600")
    def rendered():
        frame = browser.screenshot()
        return frame if len(frame) > 50000 else None
    frame = wait_until(rendered, 90)
    if output:
        output.mkdir(parents=True, exist_ok=True)
        (output / "startup.png").write_bytes(frame)


def exercise(browser, site, scratch, profile, output, mode="pool"):
    open_with_profile(browser, site, scratch, profile, output, mode)
    play_opening(browser, output, mode)
    action = {"pool": "planted Lily Pad", "fog": "Plantern cleared the upper water lane",
              "roof": "armed a Potato Mine in a newly planted Flower Pot",
              "bowling": "rolled a conveyor Wall-nut across the red line",
              "pins": "rolled a Wall-nut, Tall-nut and Pumpkin from the conveyor",
              "twist": "scored a clockwise rotation and opened the seed shop",
              "whack": "missed and then struck a rising Puff-shroom head with the mallet"}[mode]
    title = {"bowling":"ZomBotany Bowling", "pins":"ZomBotany Bowling", "whack":"Whack a Sprout", "twist":"ZomBotany Twist"}.get(mode, mode.title())
    print(f"PASS muted {title} card, {action}, cold save roundtrip ({sha256(profile).hexdigest()[:12]}).")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    driver = shutil.which("chromedriver") or shutil.which("chromedriver", path=os.getenv("CHROMEWEBDRIVER", ""))
    parser.add_argument("--driver", default=driver or shutil.which("msedgedriver"))
    parser.add_argument("--mode", choices=("pool", "fog", "roof", "bowling", "pins", "whack", "twist"), default="pool")
    parser.add_argument("--output", type=Path, help="Keep a screenshot of the native canvas")
    args = parser.parse_args()
    if not args.driver:
        parser.error("A matching ChromeDriver or Microsoft Edge WebDriver is required")
    key = {"bowling": "zbowling", "pins": "zpins", "whack":"zwhack", "twist":"ztwist"}.get(args.mode, "zs" + args.mode)
    profile = (ROOT / f"tests/fixtures/{key}1-earned.dat").read_bytes()
    trophies = b"ZSP1" + struct.pack("<I", 5)
    if args.mode in ("fog", "roof", "bowling", "pins", "whack", "twist"):
        trophies += b"ZSF1" + struct.pack("<I", 5)
    if args.mode in ("roof", "bowling", "pins", "whack", "twist"):
        trophies += b"ZSR1" + struct.pack("<I", 5)
    if args.mode in ("bowling", "pins", "whack", "twist"):
        trophies += b"ZBW1" + struct.pack("<I", 1)
    if args.mode in ("whack", "twist"):
        trophies += b"ZWH1" + struct.pack("<I", 1)
    if args.mode == "twist":
        trophies += b"ZTW1" + struct.pack("<I", 1)
    assert profile.startswith(struct.pack("<I", 12)) and profile.endswith(trophies)
    with tempfile.TemporaryDirectory(prefix=f"pvz-{args.mode}-browser-", ignore_cleanup_errors=True) as temp:
        scratch = Path(temp)
        with serve_site(ROOT / "dist") as site, launch_browser(args.driver, scratch / "profile") as browser:
            exercise(browser, site, scratch, profile, args.output, mode=args.mode)


if __name__ == "__main__":
    main()
