# GitHub Pages release: Caleb-Guyer/plants-vs-zombies-web

This clean release repository targets `Caleb-Guyer/plants-vs-zombies-web`. On 2026-10-31 the user directed publication of the current build and stopped further manual gameplay. Publication is authorized while full original-game 1:1 parity remains unverified; it does not certify parity or complete that goal. GitHub Pages publication succeeded on 2026-10-31: [release workflow 41230962473](https://github.com/Caleb-Guyer/plants-vs-zombies-web/actions/runs/41230962473) deployed commit `5ba4d0d7279145dcbdfa3e91d19b91218ef1c04a`.

The current source uses `0.2.6-web-chill.4`, based on Chill.3. The user
rejected flat/simple proportions, shading and motion and explicitly allowed
image generation for the plant. One generated parts atlas supplies a fuller
blue cap, compact shaded cream/mint body, tucked feet and seamless full-body
expressions. Centered native cards still compose actual Conehead/Puff/custom-Chill
sprites over original grass, without a separately generated challenge painting.
[Sprite provenance](dist/content/chill-shroom/provenance.json),
[generation](dist/content/chill-shroom/generation.json),
[extraction](dist/content/chill-shroom/extraction.json) and
[card provenance](dist/content/native-bonus-art.json) accompany the current art.
Preserve the frozen atlas and deterministic extractor with corresponding source.
Gameplay, attack timing, IDs, native save layouts, prior checkpoints,
worker, five-second persistence and schema 2 retain compatibility.
The [revision criteria](CHILL-REVISION-GOAL.md) remain separate from claims of
perfect original-game parity.

Current downloads are [Chill.4 source](dist/source/pvz-portable-0.2.6-web-chill.4-source.zip),
[complete upstream patch](dist/source/web-chill.4.patch),
[Chill.3 increment](dist/source/chill3-to-chill4.patch) and retained
[Chill.3 parent source](dist/source/pvz-portable-0.2.6-web-chill.3-source.zip).
Independent assembled-proof review finds improved proportions/volume without
a critical defect in the bounded native view. Pre-publication local evidence
records the 226.121-second coherent build with 776 unchanged source files,
1,513 native checks, fourteen browser suites/eleven worker scenarios,
eight-file/header reproduction and both patch reconstructions. Native card,
preview/lawn and existing-checkpoint first-draw review pass. Reliable samples
show idle/wind-up; a full visual cycle is not claimed. Website/runtime package
and hosted rollout receipts are separate publisher records. Earlier evidence
retains its own scope.
Preserve `.gitattributes`, versioned engine URLs and matching source/build
identities. Runtime/loader tokens advance to `chill4`; unchanged storage code
keeps its existing `polish1` tokens. Exact artifact hashes belong in release
manifests. Historical hosted records below are not Chill.4 deployment results.

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
