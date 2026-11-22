"""Open all four finale cards through the menus and play them in a muted browser."""
import argparse
import base64
from contextlib import nullcontext
import importlib.util
import json
import os
from pathlib import Path
import shutil
import tempfile
import time

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("pool_browser", ROOT / "tests/pool-browser.py")
ui = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ui)
GAMES = ("stars", "portals", "columns", "stand")
AREAS = {
    "packet": (109, 14, 15, 40),
    "star": (130, 188, 60, 54),
    "repeater": (128, 290, 62, 58),
    "upperCabbage": (294, 118, 52, 44),
    "lowerCabbage": (294, 387, 52, 44),
    "lily": (60, 317, 40, 24),
}


def inspect(browser, frame, refs):
    """Measure the displayed artwork at native lawn coordinates, at any viewport scale."""
    result = browser.execute("""
        const [png, refs, areas, done] = arguments;
        (async () => {
            const image = new Image();
            image.src = 'data:image/png;base64,'+png;
            await image.decode();
            const ctx = new OffscreenCanvas(800,600).getContext('2d', {willReadFrequently:true});
            ctx.drawImage(image,0,0,800,600);
            const result = {};
            for (const [key,{rect,rgb}] of Object.entries(refs)) {
                const [, , w,h] = rect, pixels = ctx.getImageData(...rect).data;
                const sums = Array(72).fill(0), counts = Array(24).fill(0);
                for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
                    const cell = Math.floor(y*4/h)*6+Math.floor(x*6/w);
                    counts[cell]++;
                    for(let c=0;c<3;c++) sums[cell*3+c] += pixels[4*(y*w+x)+c];
                }
                result[key] = sums.reduce((d,v,i)=>d+Math.abs(v/counts[Math.floor(i/3)]-rgb[i]),0)/72;
            }
            for (const [name,rect] of Object.entries(areas)) {
                const pixels = ctx.getImageData(...rect).data;
                let count = 0;
                for(let i=0;i<pixels.length;i+=4) {
                    const r=pixels[i], g=pixels[i+1], b=pixels[i+2];
                    const yellow = r>188 && g>125 && r>g*1.04 && b<90;
                    const green = g>87 && g>r*1.22 && g>b*1.44;
                    const paper = r>141 && g>147 && b>99;
                    if(name==='packet' ? paper : name==='star' ? yellow : green) count++;
                }
                result[name]=count/(pixels.length/4);
            }
            return result;
        })().then(done,e=>done({error:String(e)}));
    """, base64.b64encode(frame).decode(), refs, AREAS, asynchronous=True)
    assert "error" not in result, result
    return result


def play(game, browser, output):
    refs = json.loads((ROOT / "tests/fixtures/zspool1-screens.json").read_bytes())
    refs.update(json.loads((ROOT / "tests/fixtures/zfinal1-screens.json").read_bytes()))
    def observe():
        frame = browser.screenshot()
        return frame, inspect(browser, frame, refs)

    def keep(name, frame):
        if output:
            (output / (name+".png")).write_bytes(frame)

    def reach(label, condition, source=None, position=None):
        end = time.monotonic()+75
        next_click = 0
        while time.monotonic()<end:
            frame, scores = observe()
            if condition(scores):
                keep(label, frame)
                return scores
            if source and scores[source]<17 and time.monotonic()>=next_click:
                ui.click_canvas(browser,*position)
                next_click=time.monotonic()+1.1
            time.sleep(.23)
        keep("failed-"+label,frame)
        raise AssertionError(f"{game} could not reach {label}: {scores}")

    def screen(key, source=None, position=None):
        return reach(key, lambda s: s[key]<17, source, position)

    screen("menu", "title", (400,545))
    screen("minigames", "menu", (565,245))
    card=game+"Card"
    screen(card, "minigames", (562,581))
    x = 245 + 155*GAMES.index(game)
    if game in ("stars","stand"):
        screen("chooserTitle", card, (x,505))
        # Starfruit is already selected in Shooting Stars. In Last Stand select Lily Pad first.
        seeds = ([(45,154),(100,154),(155,154),(206,154),(260,154)] if game=="stars" else
                 [(45,298),(45,154),(155,154),(206,154),(100,298),(260,154)])
        for xy in seeds:
            ui.click_canvas(browser,*xy)
            time.sleep(.45)
        time.sleep(.7)
        ui.click_canvas(browser,231,565)
        screen(game+"Lawn")
    else:
        screen(game+"Lawn", card, (x,505))

    if game in ("portals","columns"):
        reach("first-packet",lambda s:s["packet"]>.21)
    if game=="stand":
        screen("standButton")
    # Sample the empty square, plant the first packet, then check for the plant on the lawn.
    # On the roof two unchecked rows must also grow Cabbage-pults from that single click.
    counters, square = {
        "stars": (("star",), (160,221)), "portals": (("repeater",), (160,330)),
        "columns": (("upperCabbage","lowerCabbage"), (320,320)), "stand": (("lily",), (80,325)),
    }[game]
    frame, before = observe()
    keep("before-plant",frame)
    ui.click_canvas(browser,125,40)
    ui.click_canvas(browser,*square)
    change = .13 if game in ("stars","stand") else .09
    def planted(scores):
        return all(scores[key] > before[key]+change for key in counters)
    reach("planted",planted)
    time.sleep(.55)
    reach("established",planted)
    if game=="stand":
        ui.click_canvas(browser,407,578)
        reach("onslaught",lambda s:s["standButton"]>30 and s["lily"]>before["lily"]+change)
    assert browser.execute("return PVZAudio.isMuted()"), "Lost browser mute during "+game
    print("PASS muted browser", game, "card, cold save restore and lawn action", flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    driver = shutil.which("chromedriver") or shutil.which("chromedriver",path=os.getenv("CHROMEWEBDRIVER",""))
    parser.add_argument("--driver",default=driver or shutil.which("msedgedriver"))
    parser.add_argument("--site",help="Use this published game URL instead of the local build")
    parser.add_argument("--output",type=Path)
    parser.add_argument("--game",choices=GAMES,action="append")
    args=parser.parse_args()
    if not args.driver:
        parser.error("A matching Chrome or Edge WebDriver is required")
    with (nullcontext(args.site.rstrip("/")) if args.site else ui.serve_site(ROOT/"dist")) as site:
        for game in args.game or GAMES:
            # Both an older earned profile and the profile that finished all four cards must work.
            fixture="ztwist1" if game in ("stars","columns") else "zfinal1"
            profile=(ROOT/f"tests/fixtures/{fixture}-earned.dat").read_bytes()
            dest=args.output/game if args.output else None
            with tempfile.TemporaryDirectory(prefix="pvz-finale-",ignore_cleanup_errors=True) as temp:
                scratch=Path(temp)
                with ui.launch_browser(args.driver,scratch/"browser-profile") as browser:
                    ui.open_with_profile(browser,site,scratch,profile,dest,game)
                    play(game,browser,dest)


if __name__=="__main__":
    main()
