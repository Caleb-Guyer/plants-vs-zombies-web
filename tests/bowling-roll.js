// Observe displayed game frames while WebDriver uses the normal seed and lawn controls.
// Sampling inside the browser keeps short rolls visible on a busy CI runner.
const [lane, pumpkin, keepPictures, ready] = arguments;
(async () => {
    const stream = Module.canvas.captureStream(60);
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d', {willReadFrequently: true});
    const left = 175, top = 84 + 100 * lane, width = 550, height = 82;
    const watch = { frames: 0, first: null, last: null, done: false, pictures: {} };
    window.bowlingRoll = watch;
    watch.stop = () => {
        video.pause();
        for (const track of stream.getTracks()) track.stop();
        video.srcObject = null;
    };
    await video.play();
    const takePicture = name => {
        if (keepPictures) watch.pictures[name] = canvas.toDataURL('image/png').split(',')[1];
    };
    let baseline = null, lastSeen = 0, armed = false;
    const started = performance.now();
    const check = now => {
        if (!video.srcObject) return;
        try {
            ctx.drawImage(video, 0, 0, 800, 600);
            const pixels = ctx.getImageData(left, top, width, height).data;
            watch.frames++;
            if (!baseline) {
                let grass = 0;
                for (let i = 0; i < pixels.length; i += 4)
                    if (pixels[i+1] > 60 && pixels[i+1] > pixels[i]*1.3) grass++;
                if (grass > width*height/3) {
                    baseline = pixels;
                    armed = true;
                    ready({armed: true});
                }
            } else {
                const counts = new Uint16Array(width);
                for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
                    const i = 4*(y*width+x);
                    const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
                    const shell = pumpkin ? r>125 && r>1.45*g && g>1.8*b :
                        r>85 && g>45 && r>1.10*g && r<2.25*g && g>1.55*b;
                    if (shell && Math.abs(r-baseline[i])+Math.abs(g-baseline[i+1])+Math.abs(b-baseline[i+2])>75)
                        counts[x]++;
                }
                // Separate moving silhouettes so a browncoat farther up the lane cannot
                // shift the nut's measured center. Stick to the trajectory from the throw.
                const centers = [];
                let start = -1, end = -1, sum = 0, mass = 0;
                for (let x = 0; x < width+4; x++) {
                    if (x < width && counts[x] >= 4) {
                        if (start < 0) start = x;
                        end = x;
                        sum += x*counts[x];
                        mass += counts[x];
                    } else if (start >= 0 && x-end >= 4) {
                        if (end-start >= 15 && end-start <= 106 && mass >= 180)
                            centers.push(left+sum/mass);
                        start = -1; sum = 0; mass = 0;
                    }
                }
                if (watch.first === null) {
                    const first = centers.find(x => x>=185 && x<278);
                    if (first !== undefined) {
                        watch.first = watch.last = first;
                        lastSeen = now;
                        takePicture('near');
                    }
                } else {
                    const maxStep = Math.min(130, 15 + .65*(now-lastSeen));
                    const next = centers.filter(x => x>=watch.last-7 && x<=watch.last+maxStep)
                        .sort((a,b) => Math.abs(a-watch.last)-Math.abs(b-watch.last))[0];
                    if (next !== undefined) {
                        watch.last = next;
                        lastSeen = now;
                        if (next>=365 && next-watch.first>=100) {
                            takePicture('far');
                            watch.done = true;
                            watch.stop();
                            return;
                        }
                    }
                }
            }
            if (now-started > 17000) throw Error('The rolling shell did not cross both sides of the red line');
            video.requestVideoFrameCallback(check);
        } catch (error) {
            watch.error = String(error);
            watch.stop();
            if (!armed) ready({error: watch.error});
        }
    };
    video.requestVideoFrameCallback(check);
})().catch(error => ready({error: String(error)}));
