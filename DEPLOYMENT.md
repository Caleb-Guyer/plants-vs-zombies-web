# GitHub Pages release: Caleb-Guyer/plants-vs-zombies-web

## Vase Ambush artifacts

Current engine: `0.2.6-web-ambush.1`, with 860 production files and 138 non-main native objects. Mode 89 appends Bonus card 17 and uses reserved record 88. No serialized structure was enlarged. Its independently pinned parent is the published Scrap.1 source archive, SHA-256 `6ccb876d55621aa8c31b405c2495b97203fec344905a0920440607557c291a63`.

The frozen native build passes **25 native suites, 57,505,302 baseline checks and zero failures**, plus 29,323,409 separately counted Endless late checks (86,828,711 combined). The source ZIP includes 1,836 entries and reconstructable full/incremental patches. Four source files are added and eleven existing files change relative to Scrap.1. All retained native matrices run freshly against current objects.

| Validated artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| [Native JavaScript](dist/game/pvz-portable.js) | 209,600 | `4222ab8ec9b6cc49176fc55fae1aa08174487544a34cee3176907b92b08994d6` |
| [Native WebAssembly](dist/game/pvz-portable.wasm) | 7,809,381 | `a6e1f8b5ed4293513f1919ff840d74f81b7420112bba08302b03969f82a06a46` |
| [Current native source ZIP](dist/source/pvz-portable-0.2.6-web-ambush.1-source.zip) | 25,841,863 | `6da0b6e19d56b3b345a684d379453abecff055a6d788cc17bd161f412bf3e7c9` |
| [Full upstream patch](dist/source/web-ambush.1.patch) | 14,734,781 | `96b304e276704c211e75ab13655db84ffea176017a3f01308bf155cb10f5d20d` |
| [Scrap.1-to-Ambush.1 patch](dist/source/scrap1-to-ambush1.patch) | 50,357 | `a2968bbdf23150a43f2143bef3cedabf13730b5090f7620317fd0256fc0662c5` |

The native artifact codec restores 24 current files and two historical comparator files with exact individual byte hashes. The site-source ZIP includes current source, upstream source and the actual Endless.2 comparator. Two authenticated projections reconstruct the complete Scrap.1 and Endless.3 parent sources; full historical archives remain separate downloads. The 100 MiB static-file gate remains enforced.

Publication uses the existing manual GitHub Pages workflow after pushing the tested commit. The native and browser checks must pass before deployment; public file hashes are then compared with these local release files. Local validation and public deployment are distinct records.

### Vase Ambush browser verification

Muted inspection of the normal game page confirmed the seventeenth native Bonus card, original hammer/release animation, moving attackers, and the 1x/2x stone control. Opening Menu saved the garden; reload and Continue restored one eaten brain and eight unopened vases. The native New Game confirmation reset the first garden to ten vases and zero eaten brains. These are browser observations, not extra full-game wins. [Browser evidence](tests/fixtures/vase-ambush-browser/proof.json) binds three screenshots to the shipped engine.

Fresh performance observations cover four active 15-second windows on the retained synthetic Flag 20/40 checkpoints, plus two quiet paused controls. All four active windows remain in play through their end screenshots. The existing callback, scheduling, synchronous-save and long-task budgets pass for that controlled set; the paired paused scheduling p95 difference is below 1 ms. No additional performance fix was made from these measurements.

| Starting flag | Speed | Native callback p95 | Native callback max | Save capture max |
| --- | --- | --- | --- | --- |
| 20 | 1x | 1.2 ms | 5.3 ms | 4.5 ms |
| 20 | 2x | 1.3 ms | 2.1 ms | 4.3 ms |
| 40 | 1x | 1.6 ms | 4.7 ms | 4.8 ms |
| 40 | 2x | 1.6 ms | 2.6 ms | 4.7 ms |

An initial paused diagnostic recorded one 346.7 ms scheduling gap, with no matching native/save spike or reported long task. Its cause was not established. The subsequent quiet native/clock controls passed with maximum gaps of 6.5/6.3 ms, without screenshots during their timed intervals. The failed raw record remains alongside the passing controls, and the verifier confirms that it fails the unchanged scheduling budget. These short, single-device CPU/scheduling observations do not establish universal smoothness, GPU completion time or delivered-frame FPS.

## Historical deployment records

The sections below describe earlier releases; references to a current build apply to that historical release.

## Scrap.1 release

Current engine: `0.2.6-web-scrap.1`, with 856 production files and 136 non-main native objects. Scrap Yard appends mode 88 and Bonus card 16, reusing a reserved record slot without modifying the native save layout. Its independent parent is the published Endless.3 source archive, SHA-256 `206e5e16b0c4ae7c8b88afd94e627943b4cd15c56f82113fcaf4bb1adf4c13b1`.

The native source ZIP includes full current source, build recipes, test contracts, raw evidence and a lossless shared XZ pack for all exact linked test artifacts. Run its included `unpack-native-artifacts.py` before invoking a native CLI directly. Browser integration checks decode the same pack in memory and retain individual artifact hash checks. No external dependency download is needed for decoding.

The site-source ZIP nests current source, upstream source and the actual Endless.2 historical comparator. A reviewed fixture independently reconstructs and authenticates all 852 parent Endless.3 source files; the full parent archive remains a standalone public download. This avoids duplicate compiled test binaries and retains the 100 MiB static asset gate.

Publication uses the existing manual GitHub Pages workflow after pushing the tested commit. Both validation and deployment must succeed, then public files must match the local release.

### Scrap.1 validated artifacts

The installed local release passes all 24 current native suites: **52,882,925 baseline checks**, plus **29,323,403 separate Endless late checks**, with zero failures (**82,206,328 combined**). The current 856-source/136-object build includes thirteen changed paths relative to published Endless.3: four additions and nine modifications. Both the 146-path full upstream patch and the thirteen-path incremental patch reconstruct every current production source byte. The source ZIP contains 1,536 entries. Staged native-content, fileless-generator and Zombatar-export checks pass; publication and hosted-file verification follow separately.

| Validated file | Bytes | SHA-256 |
| --- | ---: | --- |
| [Native JavaScript](dist/game/pvz-portable.js) | 209,600 | `ea0dda8ee8444491421cd9e1b9ee600d8e98292e4c726d7d466383e5c6c7ef6e` |
| [Native WebAssembly](dist/game/pvz-portable.wasm) | 7,791,069 | `a9b1cc5296b9bcb5f4045b18f9bb30c6ae95823a2658afb6a3ea5a70932f6102` |
| [Current native source ZIP](dist/source/pvz-portable-0.2.6-web-scrap.1-source.zip) | 23,463,237 | `6ccb876d55621aa8c31b405c2495b97203fec344905a0920440607557c291a63` |
| [Full upstream patch](dist/source/web-scrap.1.patch) | 14,711,040 | `d49bd4f9bb8dd3dd94e7b218dd79f692f7a305a0667d387dc7744af7bc75bf63` |
| [Endless.3-to-Scrap.1 patch](dist/source/endless3-to-scrap1.patch) | 37,965 | `ba6341a82625e89df359fb53cd28a13c2b1855481c63fadb99c9e884dde5d97c` |
| Source ZIP: `tests/native-artifacts.json` | 4,769 | `539e6267d973dc7a4a3651aa6ac3012520b6c2a1d41ff2e28b7cc5f57cf3a37a` |
| Source ZIP: `tests/native-artifacts.xz` | 4,754,220 | `cf51348d5317d9a67d04891289f177c3c93f3a29fca9fe8417a168bfad649f05` |
| Source ZIP: `unpack-native-artifacts.py` | 3,711 | `91c4c57422ff03e9dd5c9b5adeb66b825d1c23aee2c1e377510a1bafdc622f66` |

The XZ pack restores 100,539,540 exact bytes across 22 current JS/WASM files and two separately identified historical comparator files; decoded raw SHA-256 is `2d3f05a4cc3b63ea63a2b9a2e32235f02f44c4bebe010ae21f1c7777f40f5a69`. Its index retains individual file offsets, lengths and hashes. [Build provenance](dist/source/build-provenance.json), SHA-256 `7c367b652b007dbd5aa9eb692341cc568a60bb549b8a527e580271e1f7aeec4b`, binds these artifacts and all 24 reports to the normal Release receipt, SHA-256 `11147d26bc00177ab9d292986fbc6a5fef0bb99425020ea4116e8c12b944ece4`. [Engine provenance](dist/game/engine-provenance.json) has SHA-256 `0887d3b4c24f8db8ae7283453663756bbc2937cf7f5559eb8a72639c95af56b1`.

Scrap's 18 cases produce twelve native wins, four genuine idle losses and two mechanic/history controls, with 1,968,447 checks and 866 authenticated original native art inputs. Normal wins retain three to five mowers and saved wins three or four. The [QA record](PARITY-QA.md#scrap1-validated-native-results) records the exact matrix, contract and report pins. These are local validation results, not a claim that this release is already deployed.

## Historical Endless.3 performance checks

This update adds developer performance tooling and retained browser evidence while keeping the shipped native engine and runtime unchanged.

The developer-only harness is documented in `tests/performance/README.md`. Run `python tests/performance/preview.py --port 4241` and open `http://127.0.0.1:4241/?testing=1` on an isolated test origin. Its controls are injected into local responses; normal public game pages have no performance HUD. `npm --offline run check` runs sixteen integration suites, including 58 measurement-analysis unit cases and validation of the retained raw traces. Retained trace validation is not a new browser execution. Engine/shell hash changes invalidate these observations until matching new captures are recorded.

The source packager retains the tools, synthetic fixtures, raw traces and screenshots. The existing100MiB static-file limit remains enforced. GitHub Pages runs the integration and fresh native-game checks before deployment.


## Endless.3 release inputs

Canonical play URL: https://caleb-guyer.github.io/plants-vs-zombies-web/

The current release preserves 852 production files and 134 non-main objects. Only `CMake/ProjectVersion.cmake` and `PoolPanicEndless.{h,cpp}` differ from the published .2 source. The corresponding-source package contains the twenty current complete-engine backend files plus two separately authenticated .2 comparison artifacts. The parent is compiled against its own frozen headers and objects. Portable parent receipts, source/object maps, original scaffold/policy snapshots, raw case logs, actual migration files and earned browser checkpoints support offline verification. The 746-input native-art fixture preserves all 643 original entries and adds 103 original PAK-derived inputs; no generated challenge illustrations or production artwork changes are introduced.

- `build/pvz-portable.js`: 209,600 bytes; SHA-256 `f68adcd086c6eefc01fe4d856f69a0971c7a0de26e997c7a7a8738f165bc8c76`.
- `build/pvz-portable.wasm`: 7,782,033 bytes; SHA-256 `ba915021d3574aca8b3a95578320a0f9bce0dc6fad1f7fed147260b3ee7de60b`.
- `build/ProjectVersion.h`: 193 bytes; SHA-256 `0dfd37e5cf97ca12b3c84c57dc54fcdaf304d02700763a50cdad83303b74081f`.
- `pvz-portable-0.2.6-web-endless.3-source.zip`: 44,423,471 bytes; SHA-256 `206e5e16b0c4ae7c8b88afd94e627943b4cd15c56f82113fcaf4bb1adf4c13b1`.
- `web-endless.3.patch`: 14,692,784 bytes; SHA-256 `3a179a9ac6472c3f6b07953327505e0adda1b01e7d1ffd80a4b323542fb384b9`.
- `endless2-to-endless3.patch`: 12,036 bytes; SHA-256 `a3e87c431c7e62700eb948d40f1cd7734bdd56114c646f47a6802e875e802dca`.

Frozen progression contract SHA-256: `5d4bc2feddbaddb64354cadb718f6bbdebf717b7a2ca5306318103915dce005d`.

The 23 retained native suites passed (50,914,086 baseline checks). The separate late-game verification passed 29,323,397 checks. The opening matrix retains 32 cases, 28 earned runs and 92 flags; four additional fresh runs earn 12 flags each across seeds 1729/7331 and 1×/2× speed (48 additional earned flags, 140 automated earned flags total). Sixteen established-defense windows, four actual parent-engine comparison windows, two crowded-wave/mechanics controls and two cross-version migration controls are explicitly separate from earned progression. All fifteen website integration suites passed with no downloaded dependencies. Tests disable audio output; ordinary play keeps its audio controls.

Muted browser testing continues a genuinely earned eight-flag native checkpoint, completes at least one additional flag through visible controls, exercises Menu/speed and verifies reload/Continue. Browser evidence is bound to the shipped release engine and captured screenshots. Offscreen native raster fixtures remain layout evidence and do not claim browser/GPU equivalence.

Publication uses the existing manually dispatched GitHub Pages workflow after the tested commit is pushed. The validate job checks bundled data, the browser/source package and real silent native matrices before the deploy job uploads the artifact. The release closes only after both jobs succeed and public files match the tested local bytes. Historical release evidence follows unchanged.


## Endless.2 - reviewed release inputs

Current engine: `0.2.6-web-endless.2`.

- Exact published parent: Endless.1, source SHA-256 `eee4ae6dfeaaa49bbf203c37cf45ad73dad56b85d3d0079e549ed11bc3d45f25`, 39,931,636 bytes, 1009 entries, 852 production files.
- Current production retains 852 files and the same 134 non-main Release objects.
- Reconstructing patches: `web-endless.2.patch` and `endless1-to-endless2.patch`.
- All prior twenty-two native suites remain gates, including finite Pool Panic. The ten complete-engine drivers produce twenty backend files.
- `build/pvz-portable.js`: 209,600 bytes, SHA-256 `06499a385df633c4d1a6428d36e4e9eaf39a6125c3e182a78725b014f7ddc075`.
- `build/pvz-portable.wasm`: 7,779,297 bytes, SHA-256 `95a45742959b901171c606fe3ebe3614783bb670f587a9701bc7d1f9f414b3e5`.
- `build/ProjectVersion.h`: 193 bytes, SHA-256 `a10a9e78b19c8288da712c6e85b8ee759a3d35194141bd9f06fba6f6fea8629e`.
- Corresponding source: `pvz-portable-0.2.6-web-endless.2-source.zip`, 40,424,282 bytes, SHA-256 `b9095c65547c3d013917ae4188e284f18eabb71a98020ca3d53f71f7365f9566`.
- Combined patch: `web-endless.2.patch`, 14,686,988 bytes, SHA-256 `bb680ec747e8f37a749d8176812b214a0990db7b4f600b3fd19dca837aaf40dd`.
- Incremental patch: `endless1-to-endless2.patch`, 35,111 bytes, SHA-256 `05269a579b688b846b166423e408614cfc2c9cbe88dca38edd46290bbca3feb8`.
- Both patches reconstruct all 852 production files. Fresh source extraction and `npm --offline run check` remain required before publication.

All twenty-three muted native suites passed: 50,914,086 checks, zero failures. All fifteen browser integration suites passed. Muted browser inspection completed an opening flag and checked controls and save continuation on these artifacts.


## Endless.1 - reviewed release inputs

Current engine: `0.2.6-web-endless.1`.

- Exact published parent: Pool.1 source SHA-256 `9d1cb0b7fdc6e10cb4ea79b869b922d98417b14c829862899c6361f80c7dc988`, 37,098,165 bytes, 991 entries, 848 production files.
- Current production: 852 files, including four new Pool Panic Endless implementation/presentation files.
- Reconstructing patches: `web-endless.1.patch` and `pool1-to-endless1.patch`.
- Ten silent complete-engine drivers link the same 134 normal Release objects except main, producing twenty backend files. All twenty-three native suites remain release gates.
- The independent first-three-flag fixture is SHA-256 `17909bb3a7df302a7b3ac2417cd813aa378282ff231e7fd77d645cafbc5267c0`; the 469-input art fixture is SHA-256 `bcc6c2fe9450245cea71e85e26cd3db5d9f4fa1da9cbe63c817c211948bbf3a6`.
- All fifteen browser integration suites, muted actual-browser inspection and a fresh offline source-download check remain publication gates.
- `build/pvz-portable.js`: 209,600 bytes, SHA-256 `cac16540c4538cbda98c25b9911d38c194db48abf7b73803780dd4c6f79be601`.
- `build/pvz-portable.wasm`: 7,772,035 bytes, SHA-256 `9608d3fb4419fe9da5409e6c7c87f47af751fab66b907a783475325c984869ad`.
- `build/ProjectVersion.h`: 193 bytes, SHA-256 `3c3d6c3953d7bbc215b2c8bc7da66192099f3cc44febd2f6799c85c869ecac47`.
- Corresponding source: `pvz-portable-0.2.6-web-endless.1-source.zip`, 39,931,636 bytes, 1009 entries, SHA-256 `eee4ae6dfeaaa49bbf203c37cf45ad73dad56b85d3d0079e549ed11bc3d45f25`.
- Combined patch: `web-endless.1.patch`, 14,674,652 bytes, SHA-256 `0a338c168aae8d8e18759fb98baee60f77bc255fe8cc76cde8c47c1c8c416cab`.
- Incremental patch: `pool1-to-endless1.patch`, 46,257 bytes, SHA-256 `16f8a348dcdc8d30b252d1d08b409ed38f3e121333b993c2d88dbccb3aeeac47`.
- Both patches reconstruct all 852 production files exactly. Fresh source-download extraction is checked with `npm --offline run check` before publication.

All twenty-three muted native suites passed: 39,350,711 checks and zero failures. All fifteen browser integration suites passed, and muted browser inspection completed for this engine. These exact artifacts are prepared for GitHub Pages publication.


## Pool.1 - reviewed release inputs

Current engine: `0.2.6-web-pool.1`.

- Exact published parent: Cob.1 source SHA-256 `f1882ce4c5a412d539d15d4ccfcd5412cc96d6ffc7b8ae5b4b374bf04418dee0`, 34,458,383 bytes, 977 entries, 844 production files.
- Current production: 848 files, including four new Pool Panic implementation/presentation files.
- Reconstructing patches: `web-pool.1.patch` and `cob1-to-pool1.patch`.
- Nine silent complete-engine drivers link the same 132 normal Release objects except main, producing eighteen backend files. All twenty-two native suites remain release gates.
- All fifteen browser integration suites, muted actual-browser inspection and a fresh offline source-download check remain publication gates.
- `build/pvz-portable.js`: 209,496 bytes, SHA-256 `13268167cdfbfa7c736796a106c2b57294b077b7f90f277fcdc3baa0650cc92b`.
- `build/pvz-portable.wasm`: 7,755,708 bytes, SHA-256 `943d3443abb91738d18db7130ba382beea1f00bd6cdf98d40f06394c39635b3b`.
- `build/ProjectVersion.h`: 190 bytes, SHA-256 `c3a97840b38e77cb30a6209b0e0666f2c5658527c38a9c0e4a2622556e437c36`.
- Corresponding source: `pvz-portable-0.2.6-web-pool.1-source.zip`, 37,098,165 bytes, 991 entries, SHA-256 `9d1cb0b7fdc6e10cb4ea79b869b922d98417b14c829862899c6361f80c7dc988`.
- Combined patch: `web-pool.1.patch`, 14,650,089 bytes, SHA-256 `150c9b7e718b72d1b168d20f486a4e454ad2f544c279cb8d6a8cda2642812a85`.
- Incremental patch: `cob1-to-pool1.patch`, 34,848 bytes, SHA-256 `4548001b2fe27954db06773e0faf41d13fa8a60ca27765cf5730dff0de106949`.
- Both patches reconstruct all 848 production files exactly. Fresh source-download extraction is checked with `npm --offline run check` before publication.

All twenty-two muted native suites passed: 11,597,574 checks and zero failures. All fifteen browser integration suites passed, and muted browser inspection completed for this engine. These exact artifacts are prepared for GitHub Pages publication.


## Cob.1 - reviewed release inputs

Current engine: `0.2.6-web-cob.1`.

- Exact published parent: Bungee.1 source SHA-256 `452205b2a2e383a74183423ddcd730db978abe0ed086f8463c168c75142f9062`, 31,850,177 bytes, 962 entries, 840 production files.
- Current production: 844 files, including four new Cob Cannon Command implementation/presentation files.
- Reconstructing patches: `web-cob.1.patch` and `bungee1-to-cob1.patch`.
- Eight silent complete-engine drivers link the same 130 normal Release objects except main, producing sixteen backend files. All twenty-one native suites remain release gates.
- All fifteen browser integration suites, muted actual-browser inspection and a fresh offline source-download check remain publication gates.
- `build/pvz-portable.js`: 209,496 bytes, SHA-256 `c71e9fabbfefb0c84e06ee0b8227cda5f5993d66f7adbc89f66ede503856f6cc`.
- `build/pvz-portable.wasm`: 7,746,359 bytes, SHA-256 `dbe563e56fbf1929e9556fe39e6285aaf18153847e2c741b5e72958b8e40acf7`.
- `build/ProjectVersion.h`: 189 bytes, SHA-256 `8c594feafa4b00936426672bac2621c0eaebaf4eaa3462fb0ca692357dd4eadf`.
- Corresponding source: `pvz-portable-0.2.6-web-cob.1-source.zip`, 34,458,383 bytes, 977 entries, SHA-256 `f1882ce4c5a412d539d15d4ccfcd5412cc96d6ffc7b8ae5b4b374bf04418dee0`.
- Combined patch: `web-cob.1.patch`, 14,634,807 bytes, SHA-256 `5ff2a2f82480f25a6d93ededce80561461f5d56ddd153a7dda465596e55085c2`.
- Incremental patch: `bungee1-to-cob1.patch`, 30,345 bytes, SHA-256 `a0f971298d6e1de0ca8a6840af6fe03baa67458b4fdcdfd0af82b65d719a0f54`.
- Both patches reconstruct all 844 production files exactly. Fresh source-download extraction is checked with `npm --offline run check` before publication.

All twenty-one muted native suites passed: 4,995,572 checks and zero failures. All fifteen browser integration suites passed, and muted browser inspection completed for this engine. These exact artifacts are prepared for GitHub Pages publication.


## Bungee.1 - reviewed release inputs

Current engine: `0.2.6-web-bungee.1`.

- Exact published parent: Garlic.1 source SHA-256 `389c3ab2ca51747139b34f2162d9dd8b81a973919222974cce4e8431e495749c`, 29,234,821 bytes, 948 entries, 836 production files.
- Current production: 840 files, including four new Bungee Business implementation/presentation files.
- Reconstructing patches: `web-bungee.1.patch` and `garlic1-to-bungee1.patch`.
- Seven silent complete-engine drivers link the same 128 normal Release objects except main. All twenty native suites remain release gates.
- `build/pvz-portable.js`: 209,496 bytes, SHA-256 `b623dc15e681583b5c22fd16edb8c97375cfbdcac3412de35e9d2b9de12ba491`.
- `build/pvz-portable.wasm`: 7,739,560 bytes, SHA-256 `6b49b7731f1225626d793134d1f754f3016e1c8e5547eef9c088bdd5132f78f6`.
- `build/ProjectVersion.h`: 192 bytes, SHA-256 `7a2833d19f37597ff8b92a9f1f6111d779d1da9176fe968ba1bf9fd900422c98`.
- Corresponding source: `pvz-portable-0.2.6-web-bungee.1-source.zip`, 31,850,177 bytes, 962 entries, SHA-256 `452205b2a2e383a74183423ddcd730db978abe0ed086f8463c168c75142f9062`.
- Both patches reconstruct all840 production files exactly. Fresh source-download extraction is checked offline before publication.

All twenty muted native suites passed: 4,125,933 checks and zero failures. All fifteen browser integration suites passed, and muted browser inspection completed for this engine. These exact artifacts are prepared for GitHub Pages publication.


## Garlic.1 - reviewed release inputs

Current engine: `0.2.6-web-garlic.1`.

- Exact published parent: Lights.2 source SHA-256 `030d6dac37fbb4eca15ec4a852e2904ac6993ff598d824c7ef8a092804b6d26a`, 26,630,296 bytes, 934 entries, 832 production files.
- Current production: 836 files. Fifteen reviewed paths differ: eleven existing integration/version files and four new Garlic Run implementation/presentation files.
- Reconstructing patches: `web-garlic.1.patch` and `lights2-to-garlic1.patch`.
- Six silent complete-engine test drivers link the same 126 normal Release objects except main. All nineteen native suites remain release gates.
- `build/pvz-portable.js`: 209,496 bytes, SHA-256 `a1c3abb22fcfcb2f0af3b949e7024ced05d546b2e21e3d58c1005cc8386843f1`.
- `build/pvz-portable.wasm`: 7,729,353 bytes, SHA-256 `4360c05474466200f96cff484ec1b026f8dbc9440479d691dc659ddf45b04dc1`.
- `build/ProjectVersion.h`: 192 bytes, SHA-256 `52a9e0ecaa6e1908a57537312235a8fa5679767d2afa2d1c7b987eb2b16f955d`.
- Corresponding source: `pvz-portable-0.2.6-web-garlic.1-source.zip`, 29,234,821 bytes, 948 entries, SHA-256 `389c3ab2ca51747139b34f2162d9dd8b81a973919222974cce4e8431e495749c`.
- Both patches reconstruct all836 production files exactly. Fresh source-download extraction is checked offline before publication.

All nineteen muted native suites passed: 3,420,013 checks and zero failures. All fifteen browser integration suites passed, and muted browser inspection completed for this engine. These artifacts are prepared for GitHub Pages publication.


## Lights.2 - fog and glove-tooltip release inputs

Current engine: `0.2.6-web-lights.2`.

- Published Lights.1 parent source: `pvz-portable-0.2.6-web-lights.1-source.zip`, 26,618,089 bytes, 934 entries, SHA-256 `5f35953986e985af0de8a572fa8bac4657ceaaee42e6db1f9cd84b7c6d3d7b8e`.
- Production scope: 832 files; only CMake/ProjectVersion.cmake and Board.cpp change. No source files are added or removed.
- Full and incremental patches: `web-lights.2.patch` and `lights1-to-lights2.patch`.
- All accepted content files, including the ten-card metadata, must remain byte-identical.
- Normal JavaScript: 209,496 bytes, SHA-256 `c4a4be971b55b6c010cf9c9113caee9904e916952c7f84e483f1ffa084019dba`.
- Normal WebAssembly: 7,715,722 bytes, SHA-256 `4afe6f8cbca197e604156a81abd4e72499247d5acce6945cd4f65aedd928616a`.
- Corresponding source: `pvz-portable-0.2.6-web-lights.2-source.zip`, 26,630,296 bytes, 934 entries, SHA-256 `030d6dac37fbb4eca15ec4a852e2904ac6993ff598d824c7ef8a092804b6d26a`.
- Both patches reconstruct all 832 production files byte-for-byte. All eighteen native suites and fifteen integration suites passed; the source download is checked by fresh extraction before publication.

All eighteen muted native suites passed: 2,376,783 checks, zero failures, along with all fifteen browser integration suites. Muted browser inspection completed for this build. The correction is validated and prepared for GitHub Pages publication; normal game audio remains available.


## Lights.1 - Lights Out release inputs

Current engine: `0.2.6-web-lights.1`. The new Bonus minigame uses original Plantern/fog/glove assets and appends mode 82 without changing prior content IDs or serialized object layouts. Its eight waves contain 26 native walkers, Coneheads and a final-wave Flag Zombie; existing zombie combat statistics are retained.

- Published Raid.5 parent source: `pvz-portable-0.2.6-web-raid.5-source.zip`, 24,033,055 bytes, 920 entries, SHA-256 `1415b9a6f916b9780abd3425c5ea9ab32436c1ee56f1e59b89e0ce4d3db78307`.
- Production inputs: 832 files, including LightsOut.h/.cpp and LightsOutPresentation.h/.cpp. Existing engine hooks are bounded to the new mode.
- Normal JavaScript: 209,496 bytes, SHA-256 `b4218af945ccc0521b19d1683884fa9bb3cfd53c5e0e0dff48c883b63723a6fc`.
- Normal WebAssembly: 7,715,260 bytes, SHA-256 `4b8e06730872ee43e1935b972eb423e7909ba6bf5badc42590079b52107dc61f`.
- Corresponding source: `pvz-portable-0.2.6-web-lights.1-source.zip`, 26,618,089 bytes, 934 entries, SHA-256 `5f35953986e985af0de8a572fa8bac4657ceaaee42e6db1f9cd84b7c6d3d7b8e`.
- Full and incremental patches: `web-lights.1.patch` and `raid5-to-lights1.patch`. Both reconstruct all 832 production files byte-for-byte; the Raid.5 increment touches fourteen paths, including the four added Lights Out files.
- All eighteen muted native suites passed: 2,374,919 checks, zero failures. Five complete-engine drivers/ten backend files are authenticated. Lights Out contributes 882,133 checks in twenty cases/ten 1x/2x pairs, including twelve genuine wins, four static-lamp losses and four separate controls. All fifteen browser integration suites passed.

The normal Release receipt confirms the production source remained unchanged during compilation. Every Lights Out winning run retained full lamp health, five Wall-nuts and five unused mowers under the unchanged slow battle policy. Five final native render fixtures were independently reviewed. Muted private browser inspection verified file-free startup, the ten-card Bonus page, top/bottom light movement, real native shots, 2x/Menu and save/full reload/Continue with no export/import. Error-level console logs were empty; the owned preview tab/server were closed without changing public-origin saves or viewport settings.

The update is validated and prepared for GitHub Pages publication. The existing manual GitHub Pages workflow remains the publication gate; this record does not claim deployment has already completed. Earlier sections describe their named historical releases.


## Raid.5 - consistency release inputs

Current engine: `0.2.6-web-raid.5`. The release synchronizes Rally Raid walking animation with native Rally movement changes and extends the custom-content regression checks.

- Published Raid.4 parent source: `pvz-portable-0.2.6-web-raid.4-source.zip`, 24,005,557 bytes, 920 entries, SHA-256 `8c068366dc208d692d0e5d7afd286cc4ec34312564e7f8a6deace562d59a5512`.
- Normal JavaScript: 209,496 bytes, SHA-256 `177823909de86b31cb07f208cea136ab9263f17417d5d498d247e41d3d0c06a0`.
- Normal WebAssembly: 7,705,123 bytes, SHA-256 `ad543d5bc6056486ce7bcc413b3a849913647714d25925f245b967fe5bc6f951`.
- Production inputs: 828 files; only CMake/ProjectVersion.cmake and Zombie.cpp differ. No production files are added or removed.
- Corresponding source: `pvz-portable-0.2.6-web-raid.5-source.zip`, 24,033,055 bytes, 920 entries, SHA-256 `1415b9a6f916b9780abd3425c5ea9ab32436c1ee56f1e59b89e0ce4d3db78307`.
- Full and incremental patches: `web-raid.5.patch` and `raid4-to-raid5.patch`. Both reconstruct all 828 production files byte-for-byte.
- All seventeen muted native suites passed: 1,492,614 checks, zero failures. Rally Zombie passes 327,526 in 24 cases / twelve speed pairs, including four separate consistency controls. Raid passes 1,040,562 in 32 cases / sixteen speed pairs. All eight backend JS/WASM artifacts are authenticated; all fifteen browser integration suites passed.

Every accepted dist/content file is retained byte-for-byte. Muted private browser inspection verified the final Raid.5 Information identity/source link and all three custom Almanac entries with clear portraits, text and controls; error-level console logs were empty. The owned preview tab/server were closed without changing public-origin saves or viewport settings. The existing manual GitHub Pages workflow remains the publication gate. Earlier sections describe their named historical builds.


## Raid.4 - still Chill idle inputs

Current engine: `0.2.6-web-raid.4`. The renderer gives Chill-shroom a still open-eyed I, Zombie idle while retaining live attacks. Normal idle, Mender animation, shared clocks, gameplay and save layouts remain.

- Normal JavaScript: 209,496 bytes, SHA-256 `177823909de86b31cb07f208cea136ab9263f17417d5d498d247e41d3d0c06a0`.
- Normal WebAssembly: 7,705,120 bytes, SHA-256 `9bfe199c70a09471548bb5a576a6657fb1cdeec2a91a58ac917f98bb3091b885`.
- Published Raid.3 parent source: `pvz-portable-0.2.6-web-raid.3-source.zip`, 23,994,234 bytes, 919 entries, SHA-256 `dc02a3d87a227e3b6b890cd03894999dea831c62a6d184fc2a0bc281425e51a3`.
- Production inputs: 828 files; only CMake/ProjectVersion.cmake and RallyRaidPresentation.cpp differ. No source files are added or removed.
- Corresponding source: `pvz-portable-0.2.6-web-raid.4-source.zip`, 24,005,557 bytes, 920 entries, SHA-256 `8c068366dc208d692d0e5d7afd286cc4ec34312564e7f8a6deace562d59a5512`.
- Full and incremental patches: `web-raid.4.patch` and `raid3-to-raid4.patch`. Both reconstruct all 828 production files byte-for-byte.
- All 17 muted native suites passed: 1,485,247 checks, zero failures. Raid contributes 1,041,079 checks in 32 scenarios / 16 speed pairs: 24 legal winning runs, four native-UI controls and four plant-animation controls. All eight backend JS/WASM artifacts are authenticated. All 15 browser integration suites passed. Muted private browser inspection confirmed still idle, live attack and still cooldown, plus the final Raid.4 Information label and matching Engine Source URL; error-level console logs were empty.

Every dist/content file, including native-bonus-art.json, is retained byte-for-byte. Existing site-source packaging preserves the pinned Rally.3 native-UI reference and inherited plant-rendering negative fixtures. Browser shell changes are limited to version/cache identity. Earlier sections describe their named historical builds.


## Raid.3 - live cardboard animation inputs

Current engine: `0.2.6-web-raid.3`. Current custom-plant rigs replace cached snapshots in Rally Raid's original cardboard passes. The native I, Zombie UI fix, shared plant rigs, accepted content, gameplay and saved layouts remain.

- Normal JavaScript: 209,496 bytes, SHA-256 `451f7f209d71a518f0bc9313ae070bddd1f9f4c6e04174e96b912ee90fc74db6`.
- Normal WebAssembly: 7,703,685 bytes, SHA-256 `5852a90efec452dfaa8abfc54922131ad9a000a468caf956fa6c5c49c791667e`.
- Published Raid.2 parent source: `pvz-portable-0.2.6-web-raid.2-source.zip`, 23,967,714 bytes, 918 entries, SHA-256 `0bb8e6ae265488e1d1da8b472c10730f0bd17df9a56337c8acc34c4c3911a225`.
- Production inputs: 828 files; only CMake/ProjectVersion.cmake and RallyRaidPresentation.cpp differ. No source files are added or removed.
- Corresponding source: `pvz-portable-0.2.6-web-raid.3-source.zip`, 23,994,234 bytes, 919 entries, SHA-256 `dc02a3d87a227e3b6b890cd03894999dea831c62a6d184fc2a0bc281425e51a3`.
- Full and incremental patches: `web-raid.3.patch` and `raid2-to-raid3.patch`. Both reconstruct all 828 production files byte-for-byte.
- All 17 muted native suites passed: 1,483,032 checks, zero failures. Raid contributes 1,039,708 checks in 32 scenarios / 16 speed pairs: 24 legal winning runs, four native-UI controls and four plant-animation controls. All eight backend JS/WASM artifacts are authenticated. All 15 browser integration suites passed. Muted private browser inspection confirmed current attack motion and the final Raid.3 Information label with its matching Engine Source URL; error-level console logs were empty.

Every dist/content file, including native-bonus-art.json, is retained byte-for-byte. Existing site-source packaging preserves the pinned Rally.3 native-UI reference. Earlier sections describe their named historical builds.


## Raid.2 - native I, Zombie restoration inputs

Current engine: `0.2.6-web-raid.2`. The release restores the original bank/control and packet-effect routing without changing geometry, artwork, gameplay or save layouts.

- Normal JavaScript: 209,496 bytes, SHA-256 `149cde88e398e1e3a08ae2d43c77a1eed6701299d783c78ac8a610573c268f0f`.
- Normal WebAssembly: 7,702,521 bytes, SHA-256 `4262b50e1fc6511565e76039fc6c79814bf4c6619867d2fb8c9a3e1c56f94989`.
- Published Raid.1 parent source: `pvz-portable-0.2.6-web-raid.1-source.zip`, 23,958,264 bytes, 916 entries, SHA-256 `50e122044bb767eb9c78cf8c38c9cd48de022f8b3f966b69b3bd29a7bbafdb8c`.
- Production inputs: 828 files; only CMake/ProjectVersion.cmake, Board.cpp and SeedPacket.cpp differ from the parent. No files are added or removed.
- Corresponding source: `pvz-portable-0.2.6-web-raid.2-source.zip`, 23,967,714 bytes, 918 entries, SHA-256 `0bb8e6ae265488e1d1da8b472c10730f0bd17df9a56337c8acc34c4c3911a225`.
- Full and incremental patches: `web-raid.2.patch` and `raid1-to-raid2.patch`. Both reconstruct all 828 production files byte-for-byte.
- All 17 muted native suites passed: 1,474,524 checks, zero failures. Raid contributes 1,031,532 checks across 24 legal winning runs and four separate native-render controls. All 15 browser integration suites passed. Muted private browser inspection verified the final Raid.2 Information label and matching Engine Source URL, with no error-level console logs.

Site-source packaging includes the authenticated Rally.3 source archive used as the stock I, Zombie rendering reference; no runtime assets change. The existing manual GitHub Pages workflow reruns source/browser checks, native suites and asset verification before deployment. Earlier sections describe their named historical builds.


## Raid.1 - release inputs and publication

Current engine: `0.2.6-web-raid.1`. The following pins identify the packaged, tested normal Release build.

- Normal JavaScript: 209,496 bytes, SHA-256 `149cde88e398e1e3a08ae2d43c77a1eed6701299d783c78ac8a610573c268f0f`.
- Normal WebAssembly: 7,703,175 bytes, SHA-256 `bb64f196f81294ab56f8d4b9cda0d1e7f81af3545bfaf9656573e4f861ff49d6`.
- Published Rally.3 parent source SHA-256: `2deb50f9a38d8599453f567f5458a20505d552956df0bc442e649e49ea1c5c24`.
- Corresponding source: `pvz-portable-0.2.6-web-raid.1-source.zip`, 23,958,264 bytes, 916 entries, SHA-256 `50e122044bb767eb9c78cf8c38c9cd48de022f8b3f966b69b3bd29a7bbafdb8c`.
- Full and incremental patches: `web-raid.1.patch` and `rally3-to-raid1.patch`. Both reconstruct every current production byte.
- Production inputs: 828 files. The saved actor/application headers and both native SaveGame files remain byte-identical to the authenticated parent.
- All 17 muted native suites passed: 1,194,484 checks, zero failures. Rally Raid contributes 751,506 checks in 28 scenarios: 24 legal winning runs and four separate HUD controls. All 15 browser integration suites passed. Muted private browser inspection verified the final Raid.1 Information label and matching Engine Source link.

The existing manual GitHub Pages workflow reruns source/browser checks, the native suites and asset verification before deployment. Browser identity and native raster receipts are retained locally. Earlier sections describe their named historical builds.


## Rally.3 - tested grip-repair inputs

Current engine: `0.2.6-web-rally.3`.

- Normal JavaScript SHA-256: `3efa16733b86653613e71e55bd160432c149fbb735c66d01a87c1685e1190e38`.
- Normal WebAssembly SHA-256: `9c5d64f4478fe5466037ca06fc1b9b2144c5f21fdac30f21c3b407b1432e802a`.
- Corresponding source: `pvz-portable-0.2.6-web-rally.3-source.zip`, 21,368,282 bytes, 902 entries, SHA-256 `2deb50f9a38d8599453f567f5458a20505d552956df0bc442e649e49ea1c5c24`.
- Published Rally.2 parent source SHA-256: `8d7c3d5a54bdebb57d36cd1b8a6d33f87ca68e7c0b39c905838f1a83173f8b82`.
- Full and incremental patches: `web-rally.3.patch`, `rally2-to-rally3.patch`. Both reconstruct every current production byte.
- Native suites: 16; 440,233 checks, zero failures. The normal build receipt binds all 824 production files; full-engine drivers use those production objects.
- Browser integration suites: 15. Muted visual inspection covers the held-object repair and the final normal browser build.

The existing manual Pages workflow reruns source/browser checks, the sixteen native suites and asset verification before deploying. Final commit/deployment identity, public-byte comparisons and presentation evidence are retained locally. Earlier sections describe their named historical builds.


## Rally.2 - tested maintenance release inputs

Current engine: `0.2.6-web-rally.2`.

- Normal JavaScript SHA-256: `3efa16733b86653613e71e55bd160432c149fbb735c66d01a87c1685e1190e38`.
- Normal WebAssembly SHA-256: `8207dcd75c93e999e31b520c41b88d9e4024277b1a043a77918b53379ec6c7e1`.
- Corresponding source: `pvz-portable-0.2.6-web-rally.2-source.zip`, 21,354,025 bytes, 902 entries, SHA-256 `8d7c3d5a54bdebb57d36cd1b8a6d33f87ca68e7c0b39c905838f1a83173f8b82`.
- Published Rally.1 parent source SHA-256: `a37ba37528139bc38df887a027c7c54aadfb2065897f32a48a556b3dc15df63e`.
- Full and incremental patches: `web-rally.2.patch`, `rally1-to-rally2.patch`. Both reconstruct every current production byte.
- Native suites: 16; 438,561 checks, zero failures. The normal build receipt records all 824 production files unchanged during compilation; the three full-engine test backends bind that exact receipt.
- Browser integration suites: 15. Native Options fullscreen was visually compared before/after the shell repair, and final Rally.2 startup was checked muted.

Push and manual Pages publication use the existing workflow. It reruns source/browser checks, the sixteen native suites and authenticated asset verification before deployment. The bounded stock trace audit is private characterization, not a workflow step. Final deployment identity, public-byte comparisons and screenshot identities remain in local release evidence.


## Rally.1 - tested release inputs

Current engine: `0.2.6-web-rally.1`.

- Normal JavaScript SHA-256: `3efa16733b86653613e71e55bd160432c149fbb735c66d01a87c1685e1190e38`.
- Normal WebAssembly SHA-256: `a3c8539b728ce0dbee3868f5375e0622d8cac2f3ac78b0e34f1d86cd364a5e71`.
- Corresponding source: `pvz-portable-0.2.6-web-rally.1-source.zip`, 21,343,650 bytes, 901 entries, SHA-256 `a37ba37528139bc38df887a027c7c54aadfb2065897f32a48a556b3dc15df63e`.
- Published Chain.1 parent source SHA-256: `2794ff25f7427a2d3c1032bb9e2671f5b425701d7944d274f7c94e26ffb132a7`.
- Full and incremental patches: `web-rally.1.patch`, `chain1-to-rally1.patch`. Both reconstruct every current production byte.
- Native suites: 16; 437,949 checks, zero failures. The build receipt records unchanged production source before/after compilation; executed full-engine artifacts bind that exact receipt.

Push and manual Pages publication use the repository's existing workflow. The workflow reruns source/browser checks, native suites and authenticated asset verification before deploying. Final deployment identity and public-byte comparisons are retained in the local release evidence.


## Chain.1 - Chain Reaction

`0.2.6-web-chain.1` adds **Chain Reaction** under **Mini-Games > Bonus**. Clear five hand-arranged boards with a limited supply of Cherry Bombs, Jalapenos and Potato Mines. Place the plants, then press the original Let's Rock button. Retry restarts the current board; a first complete clear earns one trophy. Its seventh Bonus card combines the original three plant sprites.

All fifteen silent native suites passed (119,694 checks). Tests include 24 complete five-board puzzle runs, bad-plan recovery and save/Continue at 1x and 2x.

24 current-engine puzzle runs and 18 retained Care cases passed; their complete reports remain with the corresponding source.

The [corresponding source archive](dist/source/pvz-portable-0.2.6-web-chain.1-source.zip) contains 820 production files, 888 ZIP entries and 18,774,227 bytes, SHA-256 `2794ff25f7427a2d3c1032bb9e2671f5b425701d7944d274f7c94e26ffb132a7`. The full upstream patch and the Care.3 increment reconstruct every production source byte. The source includes the reproducible, test-only complete-engine Node/WASM backends and authenticated execution reports. Actual scenario execution requires the approved game asset bundle and has no approximate-model fallback.

Commit, push, the exact-commit GitHub Pages workflow and public-byte verification receive separate receipts after publication. The source-download check separately extracts and verifies the packaged code-only website source.


## Care.3 - fatigue cues and complete-engine battles

`0.2.6-web-care.3` makes Intensive Lawn Care fatigue visible in the original plant rigs. Plants begin to droop at 180 HP, settle into a low breathing rest at 60 HP, and rise as Menders heal them. Native attack poses remain aligned with their projectiles. Fatigue no longer borrows the white bite flash; there are no extra status bars or floating icons. The accepted artwork, challenge layout and balance remain unchanged.

Mender healing sparkles now retire after their native 60-tick pulse instead of accumulating looping emitters. A one-time board-load cleanup also retires old zero-cutoff healing effects while preserving finite saved lifetimes. Shared trophy artwork and serialized layouts remain unchanged.

All fourteen silent native suites passed: 37,952 checks, zero failures, including 25,042 fatigue rendering/state checks. The complete linked production engine ran sixteen battles: normal play, an 18-second recovery lapse, save/Continue and no recovery, at 1x and 2x across two fixed seeds. All twelve required recovery strategies earned the native award; all four no-recovery controls reached actual game over. No battle exhausted the particle pool. Separate migration fixtures exercise real save/load of legacy looping particles. The normal strategy deploys cover at the visible 180-HP cue before resting its predecessor. Two additional strategies (waiting until 100 HP, or withdrawing lone defenders immediately at 180 HP) lost on one seed; their failure receipts and logs are retained locally as characterization limits and excluded from passing battle counts. These are bounded reactive test strategies, not a claim about every player's difficulty or exhaustive parity.

The [corresponding source archive](dist/source/pvz-portable-0.2.6-web-care.3-source.zip) contains 818 production files and 877 ZIP entries, SHA-256 `50d01dd1bbd793e1cda1dfbc74a70ca6724eee8741dab9260d188b3f49c882d4`. Both the full upstream patch and the Care.2 increment reconstruct every production source byte. The test-only complete-engine Node/WASM driver and its reproducible recipe accompany the source; actual battle execution requires the authenticated game asset bundle and has no approximate-model fallback.

Commit, push, Pages workflow and exact public-byte verification receive separate receipts after publication.


## Care.2 release

`0.2.6-web-care.2` repairs the Intensive Lawn Care toolbar and opening-hint layout. Its parent is the exact published Care.1 source archive, SHA-256 `540f1ee365b558e10304995692485976e91f23bb1b28c305e6ade6cd17f1ed11`. Production changes are confined to the version identity, three native Board presentation methods, the opening hint in Challenge and a draw-local legacy-hint compatibility rule in MessageWidget.

All twelve silent native suites passed: 11,940 checks, zero failures, including 6,862 layout checks. The layout harness also passed with the installed native compiler; all fourteen browser integration suites passed. The Release build passed with all 817 source inputs unchanged.

The [corresponding source archive](dist/source/pvz-portable-0.2.6-web-care.2-source.zip) contains 817 production files, 865 ZIP entries and 13,696,830 bytes, SHA-256 `d8c52ecbb0f4f417b871137fb2a27017a2cb8699b1f6702fb363399a7ea7bf98`. Full and incremental patches reconstruct every production source byte.

Muted browser checks at 800 by 600 and 1280 by 720 verified the live one-line hint, pausing while it was active, its return on resume, clear conveyor/glove/menu spacing and actual glove movement. Both 1x and 2x were observed; additional viewport and intro-camera combinations are covered by the automated layout matrix. Commit, push, Pages deployment and public byte checks receive separate receipts after publication. No new battle-clear claim is made for this presentation-only correction. Prior release records remain below.


## Care.1 release

`0.2.6-web-care.1` adds Intensive Lawn Care as Bonus mode 78 with completion record 77. Its source starts from the exact published Mender.3 archive, SHA-256 `5a6392e1d5415c3d7f5d3f2bad3114abb54a35bc13df5366be84b718c2d5bd1f`.

All eleven silent native suites passed: 5,078 checks, zero failures. All fourteen browser integration suites passed. The new [source archive](dist/source/pvz-portable-0.2.6-web-care.1-source.zip) contains 817 source files and 861 ZIP entries, SHA-256 `540f1ee365b558e10304995692485976e91f23bb1b28c305e6ade6cd17f1ed11`. Both full and delta reconstruction patches reproduce every source byte.

Muted manual play reached wave 10 and exercised recovery, movement, 2x and a full reload/Continue on the Care save path. Input and approval delays left unattended stretches; the final run ended paused near its end. Battle completion and final difficulty balance remain unverified.

Commit, push, Pages deployment and public source-download validation receive separate receipts after those steps. Prior release records remain below.

## Mender.3 release candidate

`0.2.6-web-mender.3` replaces the rejected Sunflower-like Mender-bloom head
with a distinct coral cupped blossom and its own expression. The original
stem and leaves remain, while the head avoids Sunflower's brown center disk
and radial petal ring. The intended finish follows the game's painted outlines
and shaded forms without reusing Sunflower's face.

Built-in image generation is limited to the new Mender-bloom head. The source
retains its masters, prompt record and registered extraction recipe. No new
challenge illustration is generated. The accepted Mender.2 idle motion,
Almanac formatting and compact chooser layout remain. Costs, healing, frost,
unlock rules, original IDs, serialized data and Chill-shroom artwork are unchanged.

The full build passed in 147.676 seconds with all 816 source inputs unchanged.
All 3,799 native checks in ten suites, 14 browser suites and 11 worker scenarios
passed. The corresponding source ZIP has 857 entries and 13,544,751 bytes, SHA-256
`5a6392e1d5415c3d7f5d3f2bad3114abb54a35bc13df5366be84b718c2d5bd1f`.
Both binary patches reconstruct every source byte.

Final wrappers verify the selected head, its three exact generation prompts and
draft/master/closed source images, reference pins, compiled/public pixels and
closed-eye alpha. The original stem PNG and RGBA remain byte-identical. All
non-art gameplay/rendering sources, including motion, UI and Chill-shroom, match
Mender.2; the release identity is updated.

Muted browser checks on isolated origin 4226 used a synthetic QA-Boss profile.
The new cupped coral head was compared with the original Sunflower entry; its
Almanac description fits. A 6.2-second idle recording shows the head and stem
connected and grounded. Open/closed source frames were checked. The compact
Almanac portrait and normal Survival chooser footer packet fit, show 125 sun,
select into a full-size bank packet and leave the zombie roster clear. These
checks claim no new battle, healing or gameplay save/resume observation.

Publication and source-download validation use the existing release process;
their separate receipts are recorded after those steps. Earlier Mender.2 results
below describe that historical build.

## Mender.2 release candidate

`0.2.6-web-mender.2` updates both custom plants after feedback that their
idle motion was too subtle and their Almanac presentation did not fit the game.

Chill-shroom now has a more visible 2.2-second rocking and squash cycle.
Mender-bloom's 2.8-second cycle flexes the planted stem and sways the head with
it. The layers stay connected, and their ground contact stays fixed. Attack and
healing poses remain distinct from idle motion; no combat timer or saved member
was added.

Both Almanac entries use the original blue introduction, brown keyword labels,
red stat values, short-line spacing and brown flavor text. Chill-shroom's sleep
notice uses the native purple nocturnal style. The bios give the plants specific
quirks: Chill-shroom outwaits a snowman in a staring contest, while Mender-bloom
finds that Wall-nut keeps eating his bandages. Mender-bloom uses the native
recharge label "fast"; her actual recharge remains 15 seconds.

The custom Almanac packets use 34 by 46 thumbnails beside the native Imitater.
The normal chooser puts Chill-shroom at (332,545) and Mender-bloom at (376,545)
in the left panel's footer, with no custom side frames over the zombie preview.
Compact hit areas match the thumbnails. Their native flight expands them to full
bank size and shrinks them on return, using the existing floating-point easing
curve and flight timer. Bank-to-bank reordering keeps full size. Their own
footer tooltips appear above the packets and stay within the left panel.
Original plant positions, Let's Rock, View Lawn and Imitater remain intact.
Only the cheat-only Debug Play button moves to make room for the earned packets.

Mender-bloom's current artwork is composed from checksum-pinned original game
parts: Sunflower's face, blink, stem and leaves, with six native petals recolored
coral. The current sprite does not use image-generated pixels. The earlier
generated masters and prompt record remain historical source inputs and are not
read by the active composer. The deterministic recipe and native-part provenance
are retained with the corresponding source and
[art provenance](dist/content/mender-bloom/provenance.json).

Costs, cooldowns, healing and frost mechanics, earned Cold Front/Seed Swap
unlocks, original IDs, serialized layouts and automatic saves are unchanged.
All five Bonus modes retain their rules and cards. No extra HUD or card tips
were added.

The full build passed in 121.518 seconds with all 810 source inputs unchanged.
All 3,799 checks in ten native suites, 14 browser suites and 11 worker scenarios
passed. Release wrappers authenticate the 13 original native artwork inputs and
the 810-file source tree. The corresponding source ZIP has 851 entries, SHA-256
`2d40f382100860e1f64e3475ee2e0b299875df5458e488099b226c19a3d6ee24`.
Both binary patches reconstruct every source byte.

Muted local browser checks on the isolated 4224 origin used a generated QA-Boss
profile with synthetic existing wins. Both Almanac descriptions fit, with brown
flavor text, Chill-shroom's purple sleep notice and native recharge wording.
The original Sunflower entry remains selectable and served as an on-screen style
reference. Full 2.8-second Mender-bloom and 2.2-second Chill-shroom idle cycles
were observed and recorded: the motion is visible, grounded and keeps the layers
connected.

The normal Survival chooser shows both compact footer packets inside the panel.
The zombie preview and its native click-to-view tooltip stay clear. Both packets
select into the bank at full size; removing Mender-bloom returns her to compact
size while Chill-shroom reorders at full bank size. Mender-bloom's own tooltip
fits above her footer packet within the panel. This presentation pass claims no
new battle clear, newly earned unlock or gameplay save/resume observation;
retained mechanics and serialized layouts are checked separately by production
tests.

Publication is handled by the existing GitHub Pages workflow. Hosted package,
source-download and public-byte receipts belong to the release process and are
recorded after those steps. Earlier release records below describe their own
builds. These checks do not establish subjective perfection or exhaustive
original-game parity.

## Mender.1 release candidate

The current candidate is `0.2.6-web-mender.1`. It adds the Seed Swap reward
Mender-bloom and repairs the missing Chill-shroom Almanac entry. Existing valid
Seed Swap and Cold Front wins unlock the corresponding plant and Almanac entry
without resetting progress. Mender-bloom costs 125 sun, recharges in 15 seconds,
and heals eligible damaged plants in the eight adjacent squares by 10 health
every three simulation seconds, capped at maximum health. It cannot attack,
heal itself or revive plants. Existing serialized counters hold the ability;
native save-object layouts and original seed IDs/ranges are unchanged.

The plant uses registered native-size head/stem artwork with idle motion,
blinking and a short healing lift; actual repairs use native sparkles. The
built-in image generation tool produced only Mender-bloom's sprite artwork.
Prompts, reference attribution, source masters, extraction settings, deterministic
rendering recipe and output hashes are included in the corresponding source;
the packed [provenance](dist/content/mender-bloom/provenance.json) records the
registered outputs. No new generated challenge illustration is included. All
five Bonus modes and their cards are unchanged, and the original Almanac
positions remain intact.

Build validation passed with 795 source inputs unchanged throughout compilation.
All 3,769 native checks in ten suites, 14 browser suites and 11 worker scenarios
passed. The corresponding engine source ZIP contains 836 entries and 11,905,661
bytes, SHA-256 `d91f663297f7787be7063f478027cd4935ff4285c9dbed600c1c71703d1e08a3`.
Both binary patches reconstructed every source byte.

Muted local browser checks confirmed both custom Almanac entries fit and open,
show accurate cost/recharge and animated portraits, and allow original Sunflower
reselection. Mender-bloom was selected in Survival, planted for 125 sun and seen
idling. Native Menu/Leave, full reload and Continue restored the three plants
(Sunflower, Wall-nut and Mender-bloom), saved bank, zombies and suns. The generated
QA profile had synthetic wins; unlock visibility is not a newly earned clear.
Healing amounts are covered by production-method tests, not a visual battle
claim. These are local results. The existing release workflow controls public
Pages publication and records hosted-byte/source-download receipts; no public
success is claimed here. SeedSwap.1 and older receipts below remain historical.
The available checks do not establish exhaustive original-game parity or
subjective art perfection.

## SeedSwap.1 native seed replacement minigame

The user approved Seed Swap: start with a small complete defense, collect native
seed packets from defeated zombies, and replace existing plants as the enemy mix
changes. This fifth Bonus card uses an original Wall-nut and Repeater packet,
without new generated artwork, extra HUD or tips below the challenge cards.

A fresh game starts with ten Peashooters and five Wall-nuts: two shooters and
one barrier per lane, with a twelve-second opening. Ten authored waves contain 48 zombies,
including screen doors, pole-vaulters, a balloon, a digger and a football zombie.
Drops include Repeater, Snow Pea, Cabbage-pult, Cactus, Split Pea, Kernel-pult,
Tall-nut and Melon-pult. Counter seeds repeat around the special waves. At most
six native packets are present. New loose packets expire after thirty simulation
seconds; native holding and cancellation timing is retained.

Click a dropped packet, then a living plant to replace that plant. There is no
sun cost, seed bank or shovel. Empty squares cannot be filled, so a plant eaten
by zombies leaves a permanent gap. Invalid targets consume nothing. Native
right-click/Escape returns a held packet; cancel before opening Menu. Space
pauses the game. The original planting animation, ghost and packet artwork stay
in use. Existing modes, plant IDs and native serialized members are retained;
new mode 77 owns unused profile record 76, and state 104 identifies the rules.
The drop ordinal uses the existing serialized challenge score.

The initial ten-plant preview left too little room for separate attack and
counter roles after a barrier was lost. The final fresh opening adds a second
Peashooter per lane. Waves, seed drops and all existing checkpoints remain
unchanged; loading a checkpoint never creates extra plants.

Final release validation passed: the unchanged 782-file source built in
182.024 seconds. All 3,199 native checks in nine suites passed, followed by
14 browser suites and 11 worker scenarios. The corresponding engine source ZIP
contains 820 entries and 9,379,580 bytes, SHA-256
`0db62a66059ebc4891181044609fa949d2c623b0a05181930c2734a0f7aeeb18`.
Both the raw-upstream patch and exact Garden.1 delta reconstructed every source
byte. The six accepted sprite PNGs and packed artwork header remain unchanged.

A fresh final fifteen-plant Seed Swap run cleared all ten waves at 1x with
sound off and native planning pauses. The end board had 15 living plants
and 5 remaining mowers. Native packet selection, ghost preview, valid
replacement, empty-target rejection and cancellation were checked. The native
Menu/Main Menu/Leave path, full browser/engine reload and Continue restored
15 living plants and 4 loose packets. Visible restored board state
was checked through the game; exact saved challenge/drop-ordinal, plant, packet
and cursor fields are covered separately by production serializer tests.

The generated QA profile's earlier campaign wins and trophy ribbons were
synthetic. The full-clear evidence is the actual native replay moneybag,
collected reward and return to Bonus. Private player saves were not read.
The earlier ten-plant trial informed the final opening; it is not presented as
a final-build clear. One successful strategy with planning pauses does not
establish universal difficulty, fun or full original-game parity. Final
packaging, extracted-source and matching Pages publication receipts are
recorded separately by the release process.

## Garden.1 fixed-garden minigame and completed balance checks

The user approved full 1x balance runs and save/resume checks for the existing
three Bonus modes, followed by Garden Shuffle. The new fourth Bonus card uses a
centered original Peashooter and native gardening glove. It starts with three
Repeaters, one Snow Pea and two Wall-nuts facing ten authored rotating-lane waves
(40 zombies). Click a living plant and then an empty legal square to move the
same instance. A one-second move cooldown uses the existing challenge counter;
health, attack clocks and animation IDs persist. Right-click cancels selection.
The original glove occupies the shovel toolbar position; a brief native hint
explains the controls. The field uses the original daytime lawn without a seed
bank or sun economy, and no added tips appear below challenge cards.

Mode 76 owns unused native profile record 75; all earlier IDs, records and
serialized object members remain. A saved garden retains its surviving plants
and moved positions. Cold Front's earned Chill-shroom unlock and the other three
Bonus modes remain. Night Shift now warns every eligible mature grave, so
removing one warned grave cannot promote an unwarned grave into a capped rise.
The three-zombie rise limit and existing wave tuning are unchanged.

Release validation passed: the final 781-file source built in 325.974 seconds;
all 2,462 native checks in eight suites passed, followed by 14 browser suites
and 11 worker scenarios. The 9,342,093-byte engine source archive has 816 entries;
both the full-upstream patch and exact Chill.9 delta reconstructed all 781 source
files byte-for-byte. The accepted six sprite PNGs and packed artwork are unchanged.

Muted full 1x runs, with planning pauses, cleared all four Bonus modes. Cold Front
finished with all 25 plants, all five mowers and 250 of its 1,500 starting sun.
Cone Zone finished with three mowers after a mixed-attachment save/reload/Continue.
Night Shift finished with all five mowers after saving during a grave warning;
the pending rise continued after reload rather than restarting its six seconds.
Garden Shuffle finished all ten waves with four surviving shooters and all five
mowers, after a native save/full reload/Continue preserved moved positions and
the two lost Wall-nuts. Selection, ghost art, valid movement, occupied-square
rejection and the one-second cooldown were checked during the Garden run.

All runs used isolated generated QA profiles with synthetic starting trophies;
the actual native replay moneybag and return to Bonus establish the observed
clears. Private player saves were not read. Cold Front's run used unchanged
Chill.9 gameplay; the other three ran the final Garden.1 build. These successful
strategies do not establish universal balance or full original-game parity.
Packaging, extracted-source and matching GitHub Pages publication receipts are
recorded by the release process after this validation.


## Chill.9 Cone Zone variety and Night Shift graveyard control

The user requested many cone-wearing zombie combinations, native giant bowling
Wall-nuts, and a more distinctive Night Shift. They approved graveyard control:
new graves between waves, zombies emerging from them, and Grave Busters plus a
wider mushroom conveyor. The existing native presentation and absence of added
challenge tips remain.

Cone Zone now combines native cones with screen-door, newspaper, pole-vaulter,
ladder, jack-in-the-box and football zombies, plus regular coneheads and a cone
flag zombie. Cone armor has 370 health, native damage stages and a knocked-off
cone; shields and special behaviors remain. Football uses the cone in place of
its football helmet. Ten waves contain 80 authored zombies. The native giant
Wall-nut from Bowling 2 is in the five-packet opening, weighted deliveries and
every eighth successful delivery. Its original straight rolling and damage
behavior is retained.

Night Shift retains ten authored waves/66 zombies. Four starting graves can
be joined by one safe new grave before waves 2, 4, 6 and 8, capped at six live
graves and confined to empty right-side tiles. Before waves 4, 7 and 10, native
dirt effects warn of a six-second countdown; at most three normal zombies rise
from mature surviving graves. Grave Busters reduce that pressure. Two are in
the opening bank, and another is supplied when graves remain with none waiting
or working. The wider conveyor includes Doom-, Magnet-, Hypno-, Ice- and
Chill-shrooms. Existing plant/crater tiles are preserved.

Cold Front and its earned normal-chooser unlock are retained. No seed or mode
IDs, serialized fields or accepted sprite pixels change. State-zero legacy
checkpoints keep their old fixed-bank rules. Chill.8 arcade checkpoints retain
their saved board/belt/wave and gain the new mechanics on later events; new
games get the revised opening and wave roster.

Local release gates pass on 2026-11-01: the coherent 120.732-second Release
build left all 780 source files unchanged. All 2,084 native checks, fourteen
browser integration suites and eleven worker scenarios pass. Tests execute the
new armor/damage/drop, original giant-nut physics, safe grave placement, bounded
rises, pending-rise award gate and no-graves final completion path. Original
IDs, serialized member layouts, legacy content and accepted sprite pixels stay
verified. Both upstream and exact Chill.8 patches reconstruct every source byte.
The 812-entry corresponding-source ZIP is 9,308,592 bytes, SHA-256
`7fa3d16079cca928812a965ec7bdcd15c7f157570d14607895c31067d06e49f0`.

Muted browser checks used the isolated `127.0.0.1:4215/?testing=1` origin and
built-in generated QA - Boss! profile. Its campaign and Bonus trophies are
synthetic fixtures, not earned results. Browser file-chooser transport for a
separate generated fixture failed; built-in profile addition succeeded. No
private user saves were read. Actual Cone Zone play verified native giant,
normal and explosive launches, visible door/newspaper/pole/ladder/jack/football
cones, the replaced football helmet and knocked-off cones. Night Shift verified
an added grave between waves, Grave Busters working on graves, at least one
completed removal and a replacement packet, plus awake Chill-/Magnet-shrooms
and the wider native conveyor. These are bounded visual/control checks: no full
clear, universal balance, manual grave-burst timing or manual checkpoint restore
is claimed. Both runs saved through the native menu; the owned test tab/server
are closed. The user's public game tab was not reloaded. Final source-download
extraction and public hosting receipts are recorded separately with the matching
release commit and Pages workflow.


## Chill.8 bonus minigames and unlock — local verification

The user reported Cold Front was extremely hard, asked how Chill-shroom can be
selected in actual gameplay, and rejected three similar fixed-bank wave levels.
Previous short animation samples and method tests were insufficient evidence of
balance. On 2026-11-01 the user confirmed three distinct directions and the
unlock rule: Cone Zone bowling, Night Shift conveyor play, Cold Front a short
setup-and-defend puzzle; a Cold Front win unlocks Chill-shroom in normal native
Adventure/Survival seed selection. Existing valid wins count toward that unlock.

Fresh games use distinct native mechanics. Cold Front starts with a 1,500-sun
preparation phase, no graves or sun economy, six non-free plant choices and four
short waves. The native LET'S ROCK! button begins combat. Cone Zone uses
native rolling nuts and Night Shift uses timed native conveyor deliveries,
each with ten waves. Final source and playtest receipts establish exact tuning.
Existing state-zero checkpoints keep their old rules and original filenames;
the existing Continue dialog distinguishes saved challenge from new minigame.
No old checkpoint or completion is silently discarded.

Chill-shroom uses a sparse chooser mapping from seed ID75 to unused UI slot49,
without changing original seed/mode IDs, global capacities or native saved
object layouts. The packet uses the original addon frame above Imitater, with
safe selection, bank, Survival repick and saved-deck paths. Original Crazy Dave
forced picks and Imitater choices remain. Accepted plant artwork, original card
compositions, menus and absence of added challenge tips remain unchanged.

The exact parent is the published Chill.7 source ZIP, SHA-256
`450613f4d14df23380549081b154d40c11587151d37e749a74f5118a11534605`.
Current target is `0.2.6-web-chill.8`; full corresponding source and parent delta
must reconstruct all current source bytes. Agent browser tests use `?testing=1`
and isolated QA data; normal-player audio and automatic saves stay available.

Chill.8 local release gates pass on 2026-11-01. The coherent 190.365-second
Release build keeps all 780 source files unchanged during compilation. All
1,831 source-coherent native checks, fourteen browser integration suites and
eleven worker scenarios pass. Coverage includes sparse native chooser/deck
mapping, actual unlock/selection handlers, fresh minigame mechanics and retained
legacy rules. Original IDs, saved layouts and all six sprite PNG/header pixels
remain; nine public artwork/metadata files and the header reproduce exactly.
Both upstream and Chill.7 patches reconstruct every current source byte. The
812-entry engine source ZIP is 9,283,046 bytes, SHA-256
`04bd204805f83ce8322952fbba81a9e5a2d73bdf1eeafaf95b4a5c7ccf33d367`.

Actual muted playtesting used an isolated local origin and a generated campaign
fixture with all three bonus records zero. Fresh Cold Front was played through
at 1x: 1,250 of the 1,500 sun bought five Chill-shrooms, five Fume-shrooms, ten
Scaredy-shrooms and five Wall-nuts. All four waves/32 authored zombies cleared
with 250 sun left, all 25 plants and all five mowers intact, and no Cherry/Squash
use. A trophy was observed by 112.977 wall-clock seconds after combat began;
that is an observation bound, not an exact game-time measurement. The trophy
was collected and only Cold Front gained the native Bonus ribbon.

That earned reward appeared in Adventure's native chooser and selected into
its bank. Actual non-bonus planting used the original Last Stand: Chill cost75
(5000 to4925), slept in daylight, then native Coffee Bean cost75 (to4850) and
woke it. Normal Adventure planting/completion is not claimed. Separate early
synthetic-win and zero-win fixtures verified selectable addon versus absence;
the earned proof is the separate fresh Cold Front run. Native Cone Zone checks
launched normal and explosive bowling nuts and observed the original explosion.
Night Shift checks consumed/replenished conveyor packets, planted an awake
Fume-shroom and used Grave Buster to reduce the four initial graves to three.
These were bounded control checks, not full Cone/Night clears or balance proof.
Legacy checkpoint rules and layouts are source-tested, without a fresh manual
legacy restore claim. Owned test tab/server are closed; the user's public game
tab was not reloaded. Final packages, extracted-source check and hosting results
are recorded separately by the publisher and matching Pages workflow. One
successful strategy does not establish universal balance or original-game parity.

This clean release repository targets `Caleb-Guyer/plants-vs-zombies-web`. On 2026-10-31 the user directed publication of the current build and stopped further manual gameplay. Publication is authorized while full original-game 1:1 parity remains unverified; it does not certify parity or complete that goal. GitHub Pages publication succeeded on 2026-10-31: [release workflow 41230962473](https://github.com/Caleb-Guyer/plants-vs-zombies-web/actions/runs/41230962473) deployed commit `5ba4d0d7279145dcbdfa3e91d19b91218ef1c04a`.

## Chill.7 publication target, 2026-11-01

Target `0.2.6-web-chill.7` adds gentle idle breathing, attacks only while an
eligible zombie is within the existing 150-pixel radius, and a slower frost
plume with readable outward movement and fade. The accepted Chill.5 proportions
and published Chill.6 paint are preserved: all six sprite PNGs and the packed
artwork header stay unchanged. The shared rig, centered packet/native card,
original menus and absence of added challenge tips remain.

A ready plant waits at counter 41 without a target, then begins a 40-tick
wind-up when an eligible zombie enters range. Recheck eligibility during that
wind-up and cancel if every target leaves. Pulses remain at least 400 ticks
apart, with the existing 75-sun cost, 750-tick recharge, 150-tick slow and no
damage. Stronger chill/freeze is preserved. Keep idle movement gentle, about
one to two percent, ground-anchored and derived from the saved native carrier phase.

Use the original Snow Pea puff artwork for the frost plume, with staggered
outward movement over 55 ticks and a fading tail lasting 100 ticks in total
(about one second at normal speed). Keep the 30-tick recoil separate from the
longer visual tail. Preserve pause, 1x/2x speed, saved phase and native tint,
filter, flash, blink/sleep and attachment ownership. Add no serialized fields,
new plant/challenge IDs, gameplay HUD or new image-generated artwork.

The exact parent is the published Chill.6 source ZIP, SHA-256
`518d779b9948ac8a2d124db8f7929f13acf1121f38953d4ebee367518da17104`.
Current source targets are [Chill.7 source](dist/source/pvz-portable-0.2.6-web-chill.7-source.zip),
[full upstream patch](dist/source/web-chill.7.patch),
[Chill.6 delta](dist/source/chill6-to-chill7.patch), and
[pinned parent](dist/source/pvz-portable-0.2.6-web-chill.6-source.zip).
All agent browser checks remain silent with `?testing=1`; normal-player audio
and automatic saves remain available. Historical art prompts and inputs are
retained; this motion/effect revision does not generate new plant or card art.

Runtime/loader cache tokens advance to `chill7`; unchanged storage retains
`polish1`. Keep `.gitattributes`, complete source and matching artifact identities.

The last verified publication before this pass is Chill.6 commit
`3dfc2e9952961fa6b02c63a6fa8aebe0f016fd55`, deployed by successful
[workflow 41325541238](https://github.com/Caleb-Guyer/plants-vs-zombies-web/actions/runs/41325541238).
That result does not establish Chill.7 publication or full parity.

Chill.7 local release gates pass on 2026-11-01. The coherent 113.347-second
Release build retains all 780 source files unchanged while building. All 1,577
native checks, fourteen browser integration suites and eleven worker scenarios
pass with current source/harness pins. New coverage includes empty-lawn ready
hold, exact range entry, interrupted wind-up/reacquisition, eligibility, unchanged
cadence/slow, skipped long-cooldown scans, saved-phase grounded breathing and
actual native puff centering, staggered travel, late visibility and fading.
No new serialized fields or IDs are introduced. Original plant logic outside
the reviewed custom update/pose hook remains byte-identical to the exact parent.

All six artwork PNGs and the packed header are unchanged from Chill.6. Nine
public artwork/metadata files and that header reproduce exactly. Both upstream
and Chill.6 delta patches reconstruct all 780 source files. The current engine
source ZIP has 812 entries and 9,257,802 bytes, SHA-256
`450613f4d14df23380549081b154d40c11587151d37e749a74f5118a11534605`.

The muted native review restored the existing Sun/Chill/Puff fixture and
captured 74 full 1280x720 frames over 8.2 seconds. Sampled idle poses, two frost
releases, outward plume travel and dissipation are coherent; there are no
observed detached parts, plant seams, clipping or paint changes. Packet and
centered native Bonus card remain consistent. Menu paused the game; the owned
test tab and server were closed without reloading the user's public game tab.
Empty-range gating is automated coverage, not a separate browser observation.
This is not an earned win, full battle, every-frame/style equivalence or new
save-transfer cycle. Final website-package identity, extracted-source check and
hosting result are recorded by the publisher and matching Pages workflow.

## Historical Chill.6 publication target, 2026-11-01

The current source target is `0.2.6-web-chill.6`, based on the exact published
Chill.5 source, SHA-256
`8e97e5f49981a5e7a9a230e6651c586d6b9e3434ab22092dc30c7aa897d1c0ab`.
The user accepted Chill.5's proportions. Keep original alpha and cap/body
partition exactly while refining only cap markings, shading, face and bounded
eye patches. Runtime code, mechanics, animation and save formats stay unchanged.
Publish immutable art inputs, exact built-in image-generation prompts and the
deterministic finish/extraction recipe. Cards compose actual sprites; no
standalone AI challenge illustrations or added tips.

Current downloads: [Chill.6 source](dist/source/pvz-portable-0.2.6-web-chill.6-source.zip),
[full upstream patch](dist/source/web-chill.6.patch),
[Chill.5 delta](dist/source/chill5-to-chill6.patch), and
[pinned parent source](dist/source/pvz-portable-0.2.6-web-chill.5-source.zip).
Runtime/loader cache tokens advance to `chill6`; unchanged storage retains
`polish1`. Keep `.gitattributes`, complete source and matching artifact identities.

Historical Chill.6 local release gates passed on 2026-11-01. The coherent 90.230-second
Release build contains 780 source files. All 1,532 native production checks,
fourteen browser integration suites and eleven worker scenarios pass. Independent
parent comparisons retain every approved canonical and cap/body alpha byte and
all runtime, mechanics, animation and save code. Nine public artwork/metadata
files and the packed header reproduce exactly. Both the full upstream and
Chill.5 delta patches reconstruct every current source byte. The 812-entry
engine source ZIP is 9,249,381 bytes, SHA-256
`518d779b9948ac8a2d124db8f7929f13acf1121f38953d4ebee367518da17104`.

A muted native review inspected the centered earned-fixture card, seed packet,
restored Sun/Chill/Puff checkpoint and 32 full-size frames over a bounded
5.6-second idle/wind-up/release/recovery sample. The corrected paint is consistent
across these views, with no observed seam, detached part, clipping or layer jump.
The original Menu paused the game and the owned test tab was closed. This is
fixture-based visual coverage, not an earned win, full battle, new save-transfer
cycle, every animation frame, subjective perfection or full original-game parity.
Final website-package identity, extracted-source check and hosting result are
recorded separately by the publisher and matching Pages workflow.

For that historical Chill.6 pass, the latest verified publication was Chill.5 commit
`b8c2049da83ed3850e9c31c78e5c55ea6d59fea8`, successful
[workflow 41279145103](https://github.com/Caleb-Guyer/plants-vs-zombies-web/actions/runs/41279145103).
Record a new commit, successful matching workflow and public byte verification
for Chill.6 rather than reusing that result.

## Historical Chill.5 publication evidence — proportions accepted

The historical source target was `0.2.6-web-chill.5`, based on Chill.4. The user
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

Historical Chill.5 pre-publication evidence on 2026-11-01: all 1,532 production checks
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

Historical hosted records below retain their capture-time scope. The Chill.5 parent
release was Chill.4 commit `e18a309f36c906014489a1cfabc0faa4da791ca7`,
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

The workflow uses Node 24 and Python 3.13 for checkout checks and the runner's C++ compiler for seven production-method suites covering the new plant/third Bonus challenge, Night Shift, retained bonus wave/completion/navigation, speed, controls, decks and cooldowns. For Chill.7, record current coherent-build, native/source-harness, browser/worker, target-gating, idle/effect timing, unchanged artwork/save/ID and upstream/Chill.6 reconstruction results before release. Keep the bounded muted visual review separate from automated correctness and historical captures. Current results belong in [QA](PARITY-QA.md); website-source packaging and hosted verification require their own receipts. No `npm install`, Emscripten SDK, original game installation or full WASM rebuild is needed in deployment. It verifies bundled resource bytes, browser shell, save recovery/worker behavior, corresponding source and native content/QoL behavior before uploading `dist`. Automated native tests do not initialize the game or audio; browser checks use `?testing=1`.

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
