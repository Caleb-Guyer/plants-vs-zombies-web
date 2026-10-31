# GitHub Pages release: Caleb-Guyer/plants-vs-zombies-web

This clean release repository targets `Caleb-Guyer/plants-vs-zombies-web`. On 2026-10-31 the user directed publication of the current build and stopped further manual gameplay. Publication is authorized while full original-game 1:1 parity remains unverified; it does not certify parity or complete that goal. GitHub Pages publication succeeded on 2026-10-31: [release workflow 41230962473](https://github.com/Caleb-Guyer/plants-vs-zombies-web/actions/runs/41230962473) deployed commit `5ba4d0d7279145dcbdfa3e91d19b91218ef1c04a`.

The current release files use `0.2.6-web-lantern.1`, adding Lantern-shroom and
Lantern Glow beside the retained Night Shift and Cone Zone Bonus challenges.
The new support mushroom uses generated transparent artwork and native chill;
mode 75 has its own checkpoint and reserved record 74. All prior mode/seed IDs,
original plant definitions, chooser content, saved object layouts, campaign and
trophy routing, background save worker, five-second persistence and schema 2
remain unchanged. The new PNG is embedded in the binary and published with
[art provenance](dist/content/lantern-shroom-art.json); no runtime asset request
is needed to draw it. Original resource bundles and historical engine downloads
remain unchanged. Advance the current engine, corresponding source, metadata
and shell cache keys together, preserving `.gitattributes`. The historical
Software.10 hosted verification below is not a Lantern.1 deployment result.

Current downloads are [Lantern.1 source](dist/source/pvz-portable-0.2.6-web-lantern.1-source.zip),
[complete upstream patch](dist/source/web-lantern.1.patch),
[Night.1 increment](dist/source/night1-to-lantern1.patch) and the retained
[Night.1 parent source](dist/source/pvz-portable-0.2.6-web-night.1-source.zip).
Artifact hashes belong in [engine provenance](dist/game/engine-provenance.json)
and the [build record](dist/source/build-provenance.json).

## What gets published

The workflow uploads the contents of `dist/` directly. It does not publish the repository root, handoff ZIP, private previews, local saves or a Node server. JavaScript, WebAssembly and all original runtime resources are already built and bundled; players do not need to install the game or supply local files. There is no backend or application server to configure.

The normal project Play URL is `https://caleb-guyer.github.io/plants-vs-zombies-web/` for repository `Caleb-Guyer/plants-vs-zombies-web`. No owner is hardcoded in the workflow: GitHub derives the deployed URL and the deployment job exposes it as `page_url`. Use that URL with its trailing slash, or its `index.html` form. Local assets and downloads resolve relative to the page and engine script.

The workflow performs no Jekyll build. The empty `dist/.nojekyll` is also provided for a possible static-branch fallback; it does not change game loading. If using GitHub's publishing-source interface, choose **GitHub Actions** for this repository layout. Its branch-folder picker does not publish an arbitrary `dist/` folder.

## Final release flow

Release the reviewed current build after the bounded feature checks:

1. Work from this repository's `main` branch. Verify the bundled assets and run `npm run check`, then commit and push the release to `Caleb-Guyer/plants-vs-zombies-web`. Native engine changes also require matching corresponding source and build records.
2. In repository Settings → Pages, select **GitHub Actions** as the publishing source. Keep the `github-pages` environment restricted to the intended release branch.
3. Run **Publish game to GitHub Pages** manually from the intended branch. Pushes and pull requests do not deploy this workflow. There is no additional game or parity input flag.
4. Review the validation job and deployment result. Open the URL recorded by the deployment environment.

The workflow uses Node 24 and Python 3.13 for checkout checks and the runner's C++ compiler for seven production-method suites covering Lantern-shroom/Lantern Glow, Night Shift, retained bonus wave/completion/navigation, speed, controls, decks and cooldowns. Current validation passes 1,295 native checks and fourteen browser suites, including eleven dedicated-worker scenarios; results retain their actual scope in [QA](PARITY-QA.md). No `npm install`, Emscripten SDK, original game installation or full WASM rebuild is needed in deployment. It verifies the bundled resource bytes, browser shell, save recovery/worker behavior, corresponding source and native content/QoL behavior before uploading `dist`. Automated native tests do not initialize the game or audio; browser checks use `?testing=1`.

The site includes the empty `.nojekyll` marker. Packaging checks every served file against a 25 MiB limit, below GitHub's 100 MiB per-file limit; the static game remains below the 1 GB published-site limit.

Preserve `.gitattributes`: all `dist/**` bytes, including original XML CRLF and shell/source metadata, must survive Git checkout unchanged. Generator and test tooling use LF on Windows and Linux. This closes a demonstrated fresh-worktree failure where a converted generator header disagreed with the pinned runtime output; both required checks passed after the candidate-only newline policy was applied. `.gitignore` excludes local provider metadata and Python caches; they are not release source inputs.

## Initial Software.10 hosted release verification

The manual workflow completed successfully on 2026-10-31 (created 18:45:33 UTC; updated 18:46:13 UTC). The hosted index (5,637 bytes), JavaScript glue (208,448 bytes) and asset manifest (3,176 bytes) matched local SHA-256 values. WASM returned HTTP 200 with `application/wasm` and 7,411,823 bytes; the Software.10 source ZIP returned HTTP 200 with 5,233,817 bytes.

A silent `https://caleb-guyer.github.io/plants-vs-zombies-web/?testing=1` browser check reached the original Click to Start title automatically without a local file prompt. No campaign gameplay was performed on GitHub. These checks establish deployment, bounded resource delivery and file-free title startup, not every level, mode, ability, save path or full original-game parity. Future agent checks must remain silent with `?testing=1`; the normal Play URL has no testing parameter.

Normal players retain music and sound effects, subject to browser autoplay rules and their saved choice. Do not publish a testing-only URL as the ordinary Play link.

Browser saves belong to the origin. Export progress from the current playtest through its normal save control and import on the new origin. Repository paths on the same `caleb-guyer.github.io` origin currently share the fixed save-database names; a single copy needs no namespace change, but another copy on that origin should be considered before migration. A repository rename does not migrate or isolate saves.

Saves persist automatically on the existing five-second interval. The save worker and shared core must be deployed with the main adapter; their relative URLs work under the project path. Per-profile QoL settings and plant decks are separate files included in save export/import. Up to eight previous saved versions are retained locally for all-profile recovery; that browser-local history is not exported or migrated between origins. Recovery backs up the current version before replacing it. These additions retain schema 2 and existing native profile and board-save formats.

The served `dist/source/site-source.zip` is regenerated from current website source, the corresponding engine package, its pinned immediate parent and the raw upstream baseline. The current Lantern engine-source ZIP includes complete source, recipes and test/build receipts, while its exact full and incremental patches are served separately without redundant PNG-bearing copies inside that ZIP. The parent archive makes the saved-layout and catalog regression checks runnable from the source download. Original UI extracts used by save recovery include attribution and hashes in `dist/ui`; full game resource payloads stay separate from that source download. A successful Pages deployment proves hosting success, not complete original-game parity.

## Primary references

- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Configure a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub repository file-size limits](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)
