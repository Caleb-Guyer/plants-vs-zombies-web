# Developer browser performance measurements

This harness observes the real browser running the installed game. It measures rAF scheduling gaps, synchronous native main-loop callback CPU time, and the complete synchronous save-file capture (including its byte copies). It does **not** measure GPU completion, compositor presentation, or delivered game FPS. There are no per-draw WebGL or per-file filesystem wrappers.

The server reads an existing `dist` without changing it. It injects the local recorder and save-capture timing hooks into HTTP responses only. The recorder panel is hidden during observation. These tools and their panel are not part of the public game UI.

## Run

From the repository root:

```sh
python tests/performance/preview.py --dist dist --output outputs/performance --port 4241
```

The defaults are the repository's `dist`, `outputs/performance`, and port 4241. `--dist` and `--output` must be separate, nonoverlapping directories. Results are written under `<output>/measurements/` using unique `v2-` labels. Existing measurements are never overwritten.

Open **http://127.0.0.1:4241/?testing=1** in an isolated browser origin/profile. Confirm that sound is muted before loading or resuming gameplay. Keep it muted throughout testing; normal game audio settings remain available outside testing.

1. Import and verify a synthetic checkpoint from `../fixtures/performance/checkpoints.json`: `20-early-active33` starts Flag 20 with 33 living zombies; `40-active74` starts Flag 40 with 74. Use the separate 75-zombie `20-crowded-render75` checkpoint for paused render controls only. These are isolated performance starting states, not earned progression. The recorder does not read hidden actor state or certify a constant population throughout combat.
2. Select the native renderer and 1×/2× speed using the original game UI. Keep viewport, canvas size, display scale, renderer, visibility, and audio conditions consistent between comparisons. Capture screenshots before/after an observation rather than repeatedly during it.
3. While paused, open **Local performance v2**, set a unique label, select the starting flag, phase and speed, and use the default **Native CPU + rAF + capture CPU** mode. The historical selector is labeled **Crowd**; its values 20/40 identify the starting flag, not a zombie count. Choose 15 seconds for the retained method.
4. Arm the recorder. For an active-play observation, resume through the native UI before the two-second delay ends. Leave the foreground tab alone during the interval. Pause again after completion if necessary.
5. Inspect the saved JSON and its `validationErrors`. `PASS measurement preconditions` means the recording conditions passed, **not** that a performance budget was met. Hidden, unmuted, resized, stale-file or missing-callback captures are saved as `FAIL` records rather than discarded.

The optional **rAF clock only** mode restores the original native callback and disables capture timing. It provides a lighter observer-overhead control; it is not eligible as native-CPU budget evidence. Both modes use a separate native rAF observer, without replacing the game's global rAF function.

## Provenance and analysis

Each recording includes page/start/end/receipt manifests for the loaded probe, running server, engine, shell and save code. The served save script has a separate base and instrumented hash. Reload after changing source files, and restart after editing the server. File changes during a measurement invalidate it.

`metrics.mjs` recomputes statistics from raw samples and checks caller-supplied manifest, scenario, duration and performance budgets. It intentionally supplies no universal thresholds. Save-capture durations cover synchronous main-thread work only; they exclude worker and IndexedDB completion latency. Short observations on one device do not establish broad late-game or device performance.

## Recorded and portable servers

`probe.js` preserves the exact executed v2 probe:

- SHA-256 `f5f9309cc585fd6ea6aad44f84c5c2552b682b21fd4769578693f321154ba99b`.

`recorded-preview.py` preserves the exact historical local recorder used by the retained traces:

- SHA-256 `8be4afca064d280802b4286c4c7d5fdde23955349893d5dda729a807c7c563bb`.

That file is a provenance artifact with its original workspace-specific paths; do not use it as the portable CLI. `preview.py` replays the same measurement method with configurable paths. Its different server hash is expected: new captures need a newly pinned manifest and must not be attributed to the historical recorder hash.
