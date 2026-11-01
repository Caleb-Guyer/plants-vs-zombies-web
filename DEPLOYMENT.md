# GitHub Pages release: Caleb-Guyer/plants-vs-zombies-web

This clean release repository targets `Caleb-Guyer/plants-vs-zombies-web`. On 2026-10-31 the user directed publication of the current build and stopped further manual gameplay. Publication is authorized while full original-game 1:1 parity remains unverified; it does not certify parity or complete that goal. GitHub Pages publication succeeded on 2026-10-31: [release workflow 41230962473](https://github.com/Caleb-Guyer/plants-vs-zombies-web/actions/runs/41230962473) deployed commit `5ba4d0d7279145dcbdfa3e91d19b91218ef1c04a`.

The current source target is `0.2.6-web-chill.5`, based on Chill.4. The user
accepted the replacement whole-character proportions before implementation.
Keep that master and its registered canonical layers; never fit its parts
independently to Ice artwork pivots. Source carries both original AI inputs,
exact prompts and deterministic extraction. Cards compose actual game sprites.

Downloads: [Chill.5 source](dist/source/pvz-portable-0.2.6-web-chill.5-source.zip),
[upstream patch](dist/source/web-chill.5.patch),
[Chill.4 delta](dist/source/chill4-to-chill5.patch), and retained
[parent source](dist/source/pvz-portable-0.2.6-web-chill.4-source.zip).
Runtime/loader cache tokens advance to `chill5`; unchanged storage retains
`polish1`. Keep `.gitattributes`, corresponding source and artifact identities.

Pre-publication current evidence on 2026-11-01: all 1,532 production checks
pass with current source/harness pins. The final 95.879-second incremental
Release build retains all 777 source files unchanged (the initial full build
also passed). Nine public art/JSON files and the packed header reproduce byte
for byte. The canonical neutral pixels independently match the accepted master.
Both upstream and Chill.4 delta patches reconstruct all 777 current source
files. The 809-entry source ZIP is 6,500,652 bytes, SHA-256
`8e97e5f49981a5e7a9a230e6651c586d6b9e3434ab22092dc30c7aa897d1c0ab`.
All fourteen browser integration suites and eleven worker scenarios pass.

Actual muted native review shows the same accepted proportions in the packet,
centered earned Cold Front portrait and restored 50-sun Sun/Chill/Puff board.
The new art is already present behind paused Continue. Original title hover is
red and no added Bonus tips appear. A bounded5.6-second sample captured33 valid
1280×720 frames showing idle, wind-up, release and recovery; sampled phases keep
the short body connected and show no old Ice artwork. The native Menu pauses
correctly. This is not full-game or every-blink/frame coverage, a full battle,
an earned win or a fresh import/export/save cycle. Owned test tab22 is closed;
the user's public game tab was not reloaded. Website-package and hosting
verification have separate publisher receipts.

Historical hosted records below retain their capture-time scope. The latest
previous release was Chill.4 commit `e18a309f36c906014489a1cfabc0faa4da791ca7`,
workflow [41276164647](https://github.com/Caleb-Guyer/plants-vs-zombies-web/actions/runs/41276164647).
The user subsequently rejected that sprite's proportions.

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

The workflow uses Node 24 and Python 3.13 for checkout checks and the runner's C++ compiler for seven production-method suites covering the new plant/third Bonus challenge, Night Shift, retained bonus wave/completion/navigation, speed, controls, decks and cooldowns. The coherent 226.121-second Release build, 1,513 native checks, fourteen browser suites including eleven worker scenarios, frozen-atlas reproduction and full/parent source reconstruction pass. Muted native review confirms centered earned/unearned cards, consistent new art, no added tips and existing 50-sun three-plant Continue with new parts before unpausing. Sparse clips verify idle/closed-eye wind-up only; no complete visual cycle, full battle or earned win is claimed. Detailed motion, blink/release and save phase have automated coverage. Bounded results belong in [QA](PARITY-QA.md); website-source and hosted verification remain independent release records. No `npm install`, Emscripten SDK, original game installation or full WASM rebuild is needed in deployment. It verifies bundled resource bytes, browser shell, save recovery/worker behavior, corresponding source and native content/QoL behavior before uploading `dist`. Automated native tests do not initialize the game or audio; browser checks use `?testing=1`.

The site includes the empty `.nojekyll` marker. Packaging targets GitHub Pages with a 100 MiB served-file ceiling and the 1 GB published-site ceiling. The former 25 MiB limit belonged to the earlier hosting provider; it must not cause complete current source, required parent/upstream inputs, artwork, tests, dependencies or licenses to be omitted. Final package verification records actual archive and site sizes.

Preserve `.gitattributes`: all `dist/**` bytes, including original XML CRLF and shell/source metadata, must survive Git checkout unchanged. Generator and test tooling use LF on Windows and Linux. This closes a demonstrated fresh-worktree failure where a converted generator header disagreed with the pinned runtime output; both required checks passed after the candidate-only newline policy was applied. `.gitignore` excludes local provider metadata and Python caches; they are not release source inputs.

## Initial Software.10 hosted release verification

The manual workflow completed successfully on 2026-10-31 (created 18:45:33 UTC; updated 18:46:13 UTC). The hosted index (5,637 bytes), JavaScript glue (208,448 bytes) and asset manifest (3,176 bytes) matched local SHA-256 values. WASM returned HTTP 200 with `application/wasm` and 7,411,823 bytes; the Software.10 source ZIP returned HTTP 200 with 5,233,817 bytes.

A silent `https://caleb-guyer.github.io/plants-vs-zombies-web/?testing=1` browser check reached the original Click to Start title automatically without a local file prompt. No campaign gameplay was performed on GitHub. These checks establish deployment, bounded resource delivery and file-free title startup, not every level, mode, ability, save path or full original-game parity. Future agent checks must remain silent with `?testing=1`; the normal Play URL has no testing parameter.

Normal players retain music and sound effects, subject to browser autoplay rules and their saved choice. Do not publish a testing-only URL as the ordinary Play link.

Browser saves belong to the origin. Export progress from the current playtest through its normal save control and import on the new origin. Repository paths on the same `caleb-guyer.github.io` origin currently share the fixed save-database names; a single copy needs no namespace change, but another copy on that origin should be considered before migration. A repository rename does not migrate or isolate saves.

Saves persist automatically on the existing five-second interval. The save worker and shared core must be deployed with the main adapter; their relative URLs work under the project path. Per-profile QoL settings and plant decks are separate files included in save export/import. Up to eight previous saved versions are retained locally for all-profile recovery; that browser-local history is not exported or migrated between origins. Recovery backs up the current version before replacing it. These additions retain schema 2 and existing native profile and board-save formats.

Regenerate `dist/source/site-source.zip` from current website source, the complete current engine package, its pinned immediate parent, raw upstream baseline, required patches, assets, tests, dependencies and licenses. Preserve every input needed to inspect and reproduce the current release. Historical downloads may remain separate; the old 25 MiB provider restriction is no longer a reason to remove required current inputs. The engine-source ZIP includes complete source, recipes and test/build receipts; exact full and incremental patches are separately served and pinned. The parent archive makes saved-layout and catalog regression checks runnable from the source download. Original UI extracts used by save recovery include attribution and hashes in `dist/ui`; full original game resource payloads remain in the runtime distribution. A successful Pages deployment proves hosting success, not complete original-game parity.

## Primary references

- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Configure a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub repository file-size limits](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)
