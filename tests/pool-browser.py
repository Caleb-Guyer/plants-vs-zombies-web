"""Play the ZomBotany water lawns in a muted browser and restore their native trophies."""
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


def play_opening(browser, output, mode="pool"):
    # Each reference is the average RGB across a 6-by-4 grid on the native 800-by-600 screen.
    # Sample stable artwork so menu movement and the pool's ripples can vary between frames.
    references = json.loads((ROOT / "tests/fixtures/zspool1-screens.json").read_bytes())
    if mode == "fog":
        references.update(json.loads((ROOT / "tests/fixtures/zsfog1-screens.json").read_bytes()))
    def inspect(frame):
        return browser.execute("""
            const [png, references, done] = arguments;
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
                return scores;
            })().then(done, error => done({error:String(error)}));
        """, base64.b64encode(frame).decode(), references, asynchronous=True)

    def reach(target, source=None, position=None):
        next_click = 0
        end = time.monotonic() + 70
        while time.monotonic() < end:
            frame = browser.screenshot()
            scores = inspect(frame)
            assert "error" not in scores, scores
            if scores[target] < 18:
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
    reach("chooser", "family", (245 if mode == "fog" else 90,385))
    if mode == "fog":
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


def exercise(browser, site, scratch, profile, output, mode="pool"):
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
    play_opening(browser, output, mode)
    planting = "Plantern cleared the upper water lane" if mode == "fog" else "planted Lily Pad"
    print(f"PASS muted {mode.title()} card, seed selection, {planting}, cold save roundtrip ({sha256(profile).hexdigest()[:12]}).")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    driver = shutil.which("chromedriver") or shutil.which("chromedriver", path=os.getenv("CHROMEWEBDRIVER", ""))
    parser.add_argument("--driver", default=driver or shutil.which("msedgedriver"))
    parser.add_argument("--mode", choices=("pool", "fog"), default="pool")
    parser.add_argument("--output", type=Path, help="Keep a screenshot of the native canvas")
    args = parser.parse_args()
    if not args.driver:
        parser.error("A matching ChromeDriver or Microsoft Edge WebDriver is required")
    profile = (ROOT / f"tests/fixtures/zs{args.mode}1-earned.dat").read_bytes()
    trophies = b"ZSP1" + struct.pack("<I", 5)
    if args.mode == "fog":
        trophies += b"ZSF1" + struct.pack("<I", 5)
    assert profile.startswith(struct.pack("<I", 12)) and profile.endswith(trophies)
    with tempfile.TemporaryDirectory(prefix=f"pvz-{args.mode}-browser-", ignore_cleanup_errors=True) as temp:
        scratch = Path(temp)
        with serve_site(ROOT / "dist") as site, launch_browser(args.driver, scratch / "profile") as browser:
            exercise(browser, site, scratch, profile, args.output, mode=args.mode)


if __name__ == "__main__":
    main()
