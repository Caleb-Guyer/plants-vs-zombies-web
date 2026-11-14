// SPDX-License-Identifier: MIT
// Exact published Torch assertions plus narrowly reviewed Double collaborators.
import assert from 'node:assert/strict';
import {DOUBLE_ENGINE_ID as CURRENT_ENGINE_ID,DOUBLE_SOURCE_COUNT as CURRENT_SOURCE_COUNT,DOUBLE_SOURCE_ADDITIONS,TORCH_ENGINE_ID,
 TORCH_ARCHIVE_SHA256,DOUBLE_PARENT_TEST_INPUTS_SHA256,verifyDoubleRetainedParentInputs}
 from './native-release-context.mjs';

const FOLDER='tests/double1-focused-retention/';
const COUNTS={'game-speed':81,'qol-controls':90,'decks-cooldowns':274,'bonus-challenge':394,
 'bonus-completion':1380,'night-shift':231,'lantern-shroom':1724,'garden-shuffle':214,
 'seed-swap':587,'mender-bloom':523,'intensive-care':1135,'native-layout':27157,'care-fatigue':25042};
export const DOUBLE_FOCUSED_CHECK_EXTENSIONS=Object.freeze({'bonus-completion':1});
const PARENT_REPORT_PINS='b9c70800786a666becfe71741b55c8d24f46a48ec33b124ffaece03d1eb96a87';

// Independently reviewed literal operations: original case bodies, messages and
// thresholds cannot be replaced by an operation merely supplied by the adapter.
const REVIEWED_OPERATIONS = /* REVIEWED_DOUBLE_COMPATIBILITY_BEGIN */ {
  "game-speed": [
    {
      "before": "(OUT / 'game-speed-results.json').write_text(json.dumps(result, indent=2) + '\\n', encoding='utf-8')",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation') for suffix in ('.h','.cpp')})\n(OUT / 'game-speed-results.json').write_text(json.dumps(result, indent=2) + '\\n', encoding='utf-8')",
      "count": 1,
      "reason": "Bind four additional production dependencies; no old source pin or assertion is removed."
    }
  ],
  "qol-controls": [
    {
      "before": "(OUT/'qol-controls-results.json').write_text(json.dumps(result,indent=2)+'\\n', encoding='utf-8')",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation') for suffix in ('.h','.cpp')})\n(OUT/'qol-controls-results.json').write_text(json.dumps(result,indent=2)+'\\n', encoding='utf-8')",
      "count": 1,
      "reason": "Bind four additional production dependencies; no old source pin or assertion is removed."
    }
  ],
  "decks-cooldowns": [
    {
      "before": "(OUT/'decks-cooldowns-results.json').write_text(json.dumps(result,indent=2)+'\\n',encoding='utf-8')",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation') for suffix in ('.h','.cpp')})\n(OUT/'decks-cooldowns-results.json').write_text(json.dumps(result,indent=2)+'\\n',encoding='utf-8')",
      "count": 1,
      "reason": "Bind four additional production dependencies; no old source pin or assertion is removed."
    }
  ],
  "bonus-challenge": [
    {
      "before": "(OUT / 'bonus-challenge-results.json').write_text(json.dumps(result, indent=2) + '\\n', encoding='utf-8', newline='\\n')",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation') for suffix in ('.h','.cpp')})\n(OUT / 'bonus-challenge-results.json').write_text(json.dumps(result, indent=2) + '\\n', encoding='utf-8', newline='\\n')",
      "count": 1,
      "reason": "Bind four additional production dependencies; no old source pin or assertion is removed."
    },
    {
      "before": "cpp.write_text(head + methods + branches + cone_fixture + tail, encoding='utf-8', newline='\\n')",
      "after": "head += '\\n#include \"../source/src/Lawn/System/DoubleAgent.h\"\\nnamespace DoubleAgent { bool IsPlanning(const Board&){return false;} bool IsOffense(const Board&){return false;} }\\n'\ncpp.write_text(head + methods + branches + cone_fixture + tail, encoding='utf-8', newline='\\n')",
      "count": 1,
      "reason": "Supply only new out-of-scope Double Agent collaborators; every old mode retains its prior input/state."
    },
    {
      "before": "NUM_GAME_MODES==91",
      "after": "NUM_GAME_MODES==92",
      "count": 2,
      "reason": "Account only for the appended mode sentinel; all prior mode IDs and state assertions remain unchanged."
    }
  ],
  "bonus-completion": [
    {
      "before": "(OUT / 'bonus-completion-results.json').write_text(json.dumps(result, indent=2) + '\\n', encoding='utf-8', newline='\\n')",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation') for suffix in ('.h','.cpp')})\n(OUT / 'bonus-completion-results.json').write_text(json.dumps(result, indent=2) + '\\n', encoding='utf-8', newline='\\n')",
      "count": 1,
      "reason": "Bind four additional production dependencies; no old source pin or assertion is removed."
    },
    {
      "before": "NUM_GAME_MODES==91",
      "after": "NUM_GAME_MODES==92",
      "count": 1,
      "reason": "One appended mode changes only the enum sentinel; every prior explicit mode identity stays in the same assertion."
    },
    {
      "before": "ambushRetainedChecks==1304",
      "after": "ambushRetainedChecks==1305",
      "count": 1,
      "reason": "Account for exactly one new iteration through the actual challenge table; all1304 preceding checks still execute."
    },
    {
      "before": "NUM_CHALLENGE_MODES==90",
      "after": "NUM_CHALLENGE_MODES==91",
      "count": 1,
      "reason": "Account for the one appended catalog definition; reserved Vase record and all old definitions remain."
    }
  ],
  "night-shift": [
    {
      "before": "(OUT / 'night-shift-results.json').write_text(json.dumps(result, indent=2) + '\\n', encoding='utf-8', newline='\\n')",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation') for suffix in ('.h','.cpp')})\n(OUT / 'night-shift-results.json').write_text(json.dumps(result, indent=2) + '\\n', encoding='utf-8', newline='\\n')",
      "count": 1,
      "reason": "Bind four additional production dependencies; no old source pin or assertion is removed."
    },
    {
      "before": "cpp.write_text(head + constants + '\\n' + methods + tail, encoding='utf-8', newline='\\n')",
      "after": "head += '\\n#include \"../source/src/Lawn/System/DoubleAgent.h\"\\nnamespace DoubleAgent { bool IsPlanning(const Board&){return false;} bool IsOffense(const Board&){return false;} }\\n'\ncpp.write_text(head + constants + '\\n' + methods + tail, encoding='utf-8', newline='\\n')",
      "count": 1,
      "reason": "Supply only new out-of-scope Double Agent collaborators; every old mode retains its prior input/state."
    }
  ],
  "lantern-shroom": [
    {
      "before": "(OUT / 'lantern-shroom-results.json').write_text(json.dumps(result, indent=2) + '\\n', encoding='utf-8', newline='\\n')",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation') for suffix in ('.h','.cpp')})\n(OUT / 'lantern-shroom-results.json').write_text(json.dumps(result, indent=2) + '\\n', encoding='utf-8', newline='\\n')",
      "count": 1,
      "reason": "Bind four additional production dependencies; no old source pin or assertion is removed."
    },
    {
      "before": "namespace FireDrillPresentation { Sexy::Image* GetBonusImage(){return nullptr;} }",
      "after": "namespace FireDrillPresentation { Sexy::Image* GetBonusImage(){return nullptr;} }\nnamespace DoubleAgentPresentation { Sexy::Image* GetBonusImage(){return nullptr;} }",
      "count": 1,
      "reason": "Supply new catalog image collaborator; original native plant/art assertions remain unchanged."
    },
    {
      "before": "cpp.write_text(head + constants + '\\n' + methods + tail, encoding='utf-8', newline='\\n')",
      "after": "head += '\\nnamespace DoubleAgent { bool IsPlanning(const Board&){return false;} bool IsOffense(const Board&){return false;} }\\n'\ncpp.write_text(head + constants + '\\n' + methods + tail, encoding='utf-8', newline='\\n')",
      "count": 1,
      "reason": "Supply only the newly referenced out-of-scope mode collaborators for unchanged old plant tests."
    }
  ],
  "garden-shuffle": [
    {
      "before": "(OUT/'garden-shuffle-results.json').write_text(json.dumps(result,indent=2)+'\\n',encoding='utf-8',newline='\\n')",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation') for suffix in ('.h','.cpp')})\n(OUT/'garden-shuffle-results.json').write_text(json.dumps(result,indent=2)+'\\n',encoding='utf-8',newline='\\n')",
      "count": 1,
      "reason": "Bind four additional production dependencies; no old source pin or assertion is removed."
    }
  ],
  "seed-swap": [
    {
      "before": "(OUT / 'seed-swap-results.json').write_text(json.dumps(result, indent=2) + '\\n', encoding='utf-8', newline='\\n')",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation') for suffix in ('.h','.cpp')})\n(OUT / 'seed-swap-results.json').write_text(json.dumps(result, indent=2) + '\\n', encoding='utf-8', newline='\\n')",
      "count": 1,
      "reason": "Bind four additional production dependencies; no old source pin or assertion is removed."
    },
    {
      "before": "NUM_GAME_MODES==91",
      "after": "NUM_GAME_MODES==92",
      "count": 1,
      "reason": "One appended mode changes only the enum sentinel; every prior explicit mode identity stays in the same assertion."
    }
  ],
  "mender-bloom": [
    {
      "before": "(OUT / 'mender-bloom-results.json').write_text(json.dumps(result, indent=2) + '\\n', encoding='utf-8', newline='\\n')",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation') for suffix in ('.h','.cpp')})\n(OUT / 'mender-bloom-results.json').write_text(json.dumps(result, indent=2) + '\\n', encoding='utf-8', newline='\\n')",
      "count": 1,
      "reason": "Bind four additional production dependencies; no old source pin or assertion is removed."
    },
    {
      "before": "cpp.write_text(head + core_harness + almanac + tail, encoding='utf-8', newline='\\n')",
      "after": "head += '\\n#include \"../source/src/Lawn/System/DoubleAgent.h\"\\nnamespace DoubleAgent { bool IsPlanning(const Board&){return false;} bool IsOffense(const Board&){return false;} }\\n'\ncpp.write_text(head + core_harness + almanac + tail, encoding='utf-8', newline='\\n')",
      "count": 1,
      "reason": "Supply only new out-of-scope Double Agent collaborators; every old mode retains its prior input/state."
    }
  ],
  "intensive-care": [
    {
      "before": "(OUT / 'intensive-care-results.json').write_text(json.dumps(result, indent=2) + '\\n', encoding='utf-8', newline='\\n')",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation') for suffix in ('.h','.cpp')})\n(OUT / 'intensive-care-results.json').write_text(json.dumps(result, indent=2) + '\\n', encoding='utf-8', newline='\\n')",
      "count": 1,
      "reason": "Bind four additional production dependencies; no old source pin or assertion is removed."
    },
    {
      "before": "cpp.write_text(head + methods + transport + tests, encoding='utf-8', newline='\\n')",
      "after": "head += '\\n#include \"../source/src/Lawn/System/DoubleAgent.h\"\\nnamespace DoubleAgent { bool IsPlanning(const Board&){return false;} bool IsOffense(const Board&){return false;} }\\n'\ncpp.write_text(head + methods + transport + tests, encoding='utf-8', newline='\\n')",
      "count": 1,
      "reason": "Supply only new out-of-scope Double Agent collaborators; every old mode retains its prior input/state."
    },
    {
      "before": "NUM_GAME_MODES==91",
      "after": "NUM_GAME_MODES==92",
      "count": 1,
      "reason": "Account only for the appended mode sentinel; all prior mode IDs and state assertions remain unchanged."
    }
  ],
  "native-layout": [
    {
      "before": "(OUT/'native-layout-results.json').write_text(json.dumps(result,indent=2)+'\\n',encoding='utf-8',newline='\\n')",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation') for suffix in ('.h','.cpp')})\n(OUT/'native-layout-results.json').write_text(json.dumps(result,indent=2)+'\\n',encoding='utf-8',newline='\\n')",
      "count": 1,
      "reason": "Bind four additional production dependencies; no old source pin or assertion is removed."
    },
    {
      "before": "assert len(raid_card_positions)==18 and raid_card_positions[9:15]==[('2','4'),('3','0'),('3','1'),('3','2'),('3','3'),('3','4')]",
      "after": "assert len(raid_card_positions[:18])==18 and raid_card_positions[9:15]==[('2','4'),('3','0'),('3','1'),('3','2'),('3','3'),('3','4')]\nassert len(raid_card_positions)==19 and raid_card_positions[18]==('4','3')",
      "count": 1,
      "reason": "Retain every existing18 card position and separately require the new19th position."
    },
    {
      "before": "cpp=OUT/'native-layout-harness.cpp';cpp.write_text(head+'\\n'+methods+'\\n'+tests,encoding='utf-8',newline='\\n')",
      "after": "head += '\\n#include \"../source/src/Lawn/System/DoubleAgent.h\"\\nnamespace DoubleAgent { bool IsPlanning(const Board&){return false;} bool IsOffense(const Board&){return false;} }\\nnamespace DoubleAgentPresentation { std::string LevelLabel(int){return \"Double Agent\";} }\\n'\ncpp=OUT/'native-layout-harness.cpp';cpp.write_text(head+'\\n'+methods+'\\n'+tests,encoding='utf-8',newline='\\n')",
      "count": 1,
      "reason": "Supply only new out-of-scope Double Agent collaborators; every old mode retains its prior input/state."
    },
    {
      "before": "static_cast<int>(GameMode::NUM_GAME_MODES)==91",
      "after": "static_cast<int>(GameMode::NUM_GAME_MODES)==92",
      "count": 2,
      "reason": "Account for the one appended mode while retaining exact Vase identity and all old layout checks."
    },
    {
      "before": "    prior_method=extract(actual,signature)",
      "after": "    prior_method=extract(actual,signature)\n    # Strip only the new mode's explicit guards before the existing exact\n    # historical method comparison; all other bytes remain authenticated.\n    for double_guard in (\n        '(!DoubleAgent::IsMode(mApp->mGameMode) || DoubleAgent::IsPlanning(*this) || DoubleAgent::IsOffense(*this)) && ',\n        '!DoubleAgent::IsMode(mApp->mGameMode) && ',\n        'DoubleAgent::IsMode(mApp->mGameMode) || '):\n        if double_guard in prior_method:\n            assert prior_method.count(double_guard)==1\n            prior_method=prior_method.replace(double_guard,'',1)",
      "count": 1,
      "reason": "Remove only explicit Double mode routing from the independently pinned old I,Zombie method equality comparison; all historical bytes and tests remain."
    }
  ],
  "care-fatigue": [
    {
      "before": "(OUT / 'care-fatigue-results.json').write_text(json.dumps(result, indent=2) + '\\n', encoding='utf-8', newline='\\n')",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation') for suffix in ('.h','.cpp')})\n(OUT / 'care-fatigue-results.json').write_text(json.dumps(result, indent=2) + '\\n', encoding='utf-8', newline='\\n')",
      "count": 1,
      "reason": "Bind four additional production dependencies; no old source pin or assertion is removed."
    }
  ]
} /* REVIEWED_DOUBLE_COMPATIBILITY_END */;

const REVIEWED_PINS = /* REVIEWED_DOUBLE_FOCUSED_PINS_BEGIN */ {
  "pendingFinalFreeze": false,
  "normalBuildReceiptSha256": "8ff0dbe3d087ce07f4e861afe5e999d55490684f306d6dcd609a1323aeb1fd62",
  "adaptationsSha256": "2adb53187310b8a22cb424a03b268a274ec4ffaf963e110e87bfc35772460905",
  "compatibilityPatchesSha256": "3bd2dda0c39b4a6b95d45e6718b750e83a39f94ddde0a72f82e66c84d66de888",
  "parentReportPinsSha256": "b9c70800786a666becfe71741b55c8d24f46a48ec33b124ffaece03d1eb96a87",
  "adapterSha256": "5fdee44cc6de695346c12c4ec3cb8f15437e925ca593de789d16386b338d4324",
  "runSha256": "b62b414af34ca10de508d6807853745f1ed40a05b641be303133a16cdbdb4268",
  "runners": {
    "game-speed": {
      "runnerSha256": "0ba7bf8ca80e060227ce796fd8bd57c8771c2bfbc000d213b4ab47fb1765dcc1",
      "reportSha256": "afdee89200c3adc6592a52cf2ef2b1106b7d98582f4ad0145980842a1036aafd",
      "harnessSha256": "0299e42113cdd9a96fdc9e4ac14cf68c6144f2c3660cf14f85bb224bb3a96b6b"
    },
    "qol-controls": {
      "runnerSha256": "5c2ac4b3bdd1c7de51a24ccf0cca302b567bfa4114dfb8f0deb6003f5e0c616b",
      "reportSha256": "58f69aa31dfa8645c5234221b8b84f3c479d878c7d41e409f00a8975cea2017a",
      "harnessSha256": "26baff16227c83705bc47cc2a8afd8b8f84effa24589d2ab63024c3495527316"
    },
    "decks-cooldowns": {
      "runnerSha256": "07f817241c4f9a79b03f15343ad6417fd10b2bc06871b5c08eb50b877da33f94",
      "reportSha256": "334b13e8327535ef7e5f8def2cc9ef29ce150d672185d6ecc3cae8dfb5dc2c1e",
      "harnessSha256": "ae4ac355c15099c69e92d325562a4cb3a60046a052d481119d2f12a5cf6f72d5"
    },
    "bonus-challenge": {
      "runnerSha256": "23ee16c6e0e4a843b5568cb262528290a50d52149d507c5f7f2da8bde80f5e20",
      "reportSha256": "ae5ec67e769184c82f9fa48e60ab63ad4977899bbc40494196e62394dc51d112",
      "harnessSha256": "62cb03d6ed11dae9fcc9a70fd841a15d73a0db68c53f0123dc0d37061d3a8208"
    },
    "bonus-completion": {
      "runnerSha256": "a54faa2b802d4896a46c129c247b16c199fa6d718f949d742ba9000d4519c2d1",
      "reportSha256": "c3d426005fe046b3147a01e2a8bb86e442838add4ea6df37a2b4670aef3b69ee",
      "harnessSha256": "bf1d87c28f42259355b7c56be0ec4fff68118073ac116dc6ae238ab14bdc18c3"
    },
    "night-shift": {
      "runnerSha256": "aed2e1c1b85e8db2fb33e2b6fc4e5d75de99fa142474c7d82f3fad9e856791a9",
      "reportSha256": "ab18275ce2aede13dc8523a9978455ea241715a1231e2b6bb3c41b62e3c91cca",
      "harnessSha256": "6d842f492565a151b0f23482861f8dc8bea8a58aafa677f160fcbe5f8f0ebfe4"
    },
    "lantern-shroom": {
      "runnerSha256": "e5f968dc5ec332b36b1bae812c9f40667d1fc626ded4ba9dbb00ea7c66d83cb0",
      "reportSha256": "caa12ca8f4157e586e1925599e00885ba2fe4d06b0fdf39e27ebc0a5d06872a9",
      "harnessSha256": "e6f18e767203a1f0bdf8c8a4c533c786e6a26a2860eac626d258ff6f41da4213"
    },
    "garden-shuffle": {
      "runnerSha256": "34bbc1027d4de4327952caa10b0196e3162cf8db984723e57e603ce465c0c222",
      "reportSha256": "634a3bc97585c6dce9cebebcce528b459e0db2506e200ee59b5932b83f0eeeb0",
      "harnessSha256": "7364fe91a888ab3d607b533cf4a1fdba903ed5bf65172b008078c950a1e6d182"
    },
    "seed-swap": {
      "runnerSha256": "3aa615eaff6b6ff725c1bcac84585903f20e91343c162b44e1e4c927b090c5ec",
      "reportSha256": "e21b18b3ccfb076acc269c53c61aa1159c957f2059e1b4cbf3f6572f33269a0a",
      "harnessSha256": "109168e7fe887f04621aee084c0d59048efe022ada7d8b30a472019d9cdd2ac9"
    },
    "mender-bloom": {
      "runnerSha256": "05f505ec275b2aead5c0aa9f1709eb7865715789e46a02933d4a94cbf0f3f681",
      "reportSha256": "2bd2258f3051e6cf19622367860ed3ce7802cd27ae986b059788281ead5f5e02",
      "harnessSha256": "94cf75c17ccbc44f47f7b827cb64e0da607e90b858342d0760cd973543f577f4"
    },
    "intensive-care": {
      "runnerSha256": "ceec046b2b30711fb3a367b134b76abb55667f7f2bd4a10a1015794b5303cd77",
      "reportSha256": "6a32f46593d545d8a832e51f607ad5bea8a78a6ffeb300aaf0fdb5b651439ece",
      "harnessSha256": "a551e7c575808e549a89acdca859260b31ceaeb0c600a782243319be6f0ace7d"
    },
    "native-layout": {
      "runnerSha256": "ec5d3e2a8c1713f0c59c9842e7a5be3f7847fe4245d3c8b92c1fa8816af39acf",
      "reportSha256": "3c8ffc84f3fc73be01db8ca5985577ce9c7ca3c56afc133f91419b4b3ccf81fe",
      "harnessSha256": "d31b449fcbfe4a7450a35f32515979f7e9b2ac38ab7a0cc22e8ae9e82eb3f14e"
    },
    "care-fatigue": {
      "runnerSha256": "ac63764f258131f18141c515a124a00778e5def1d667077d9812b715abc3f894",
      "reportSha256": "1fa95753245f0bc91b0f9e5770617c174a48871251e248de8ecd9752e1eb8ead",
      "harnessSha256": "60b9b05a2437b088d08bd89ca393dc4ab00d107fc4c382927e2a36068ab92130"
    }
  },
  "summaryPath": "focused-briefing-final/summary.json",
  "summarySha256": "5d3caaa9ed4832b12ac106e03504c0b5ecbbe97c3bec19bc815b21373ce66707"
} /* REVIEWED_DOUBLE_FOCUSED_PINS_END */;

const safeName=name=>assert(typeof name==='string'&&name&&!name.startsWith('/')&&
 !/[\\:]/.test(name)&&!name.split('/').some(part=>!part||part==='.'||part==='..'));
const digest=value=>assert.match(value,/^[a-f0-9]{64}$/);
const keys=value=>Object.keys(value).sort();
const sum=values=>values.reduce((a,b)=>a+b,0);

function applyEdits(original,edits){
 assert(Array.isArray(edits));let bytes=Buffer.from(original),previous=bytes.length+1;
 for(const edit of [...edits].reverse()){
  assert.deepEqual(keys(edit),['offset','beforeBase64','afterBase64'].sort());
  const before=Buffer.from(edit.beforeBase64,'base64'),after=Buffer.from(edit.afterBase64,'base64');
  assert.equal(before.toString('base64'),edit.beforeBase64);assert.equal(after.toString('base64'),edit.afterBase64);
  assert(Number.isSafeInteger(edit.offset)&&edit.offset>=0&&edit.offset<previous);
  assert(edit.offset+before.length<=previous&&edit.offset+before.length<=bytes.length);
  assert.deepEqual(bytes.subarray(edit.offset,edit.offset+before.length),before);
  bytes=Buffer.concat([bytes.subarray(0,edit.offset),after,bytes.subarray(edit.offset+before.length)]);
  previous=edit.offset;
 }
 return bytes;
}

export async function verifyDoubleFocusedCompatibility({read,sha,engine}){
 assert.equal(engine.id,CURRENT_ENGINE_ID);assert.equal(engine.parent.id,TORCH_ENGINE_ID);
 assert.equal(engine.parent.artifacts.sourceSha256,TORCH_ARCHIVE_SHA256);
 const snapshot=await verifyDoubleRetainedParentInputs({read,sha});
 const parentPinsBytes=await read(FOLDER+'parent-report-pins.json');assert.equal(sha(parentPinsBytes),PARENT_REPORT_PINS);
 const parentPins=JSON.parse(parentPinsBytes);
 assert.equal(parentPins.schemaVersion,1);assert.equal(parentPins.parentEngineId,TORCH_ENGINE_ID);
 assert.equal(parentPins.parentArchiveSha256,TORCH_ARCHIVE_SHA256);assert.deepEqual(keys(parentPins.reports),keys(COUNTS));
 const adaptationBytes=await read(FOLDER+'adaptations.json'),adaptation=JSON.parse(adaptationBytes);
 const patchBytes=await read(FOLDER+'compatibility-patches.json'),patches=JSON.parse(patchBytes);
 assert.equal(patches.schemaVersion,1);assert.deepEqual(keys(patches.runners),keys(COUNTS));
 assert.deepEqual(patches.runners,REVIEWED_OPERATIONS,'Only the independently reviewed collaborator/sentinel/dependency edits may run');
 assert.equal(adaptation.schemaVersion,1);assert.equal(adaptation.engineId,CURRENT_ENGINE_ID);
 assert.equal(adaptation.parentEngineId,TORCH_ENGINE_ID);assert.equal(adaptation.parentArchiveSha256,TORCH_ARCHIVE_SHA256);
 assert.equal(adaptation.parentSnapshotSha256,DOUBLE_PARENT_TEST_INPUTS_SHA256);
 assert.equal(adaptation.parentReportPinsSha256,sha(parentPinsBytes));assert.equal(adaptation.compatibilityPatchesSha256,sha(patchBytes));
 assert.equal(adaptation.retainedCheckTotal,58832);assert.deepEqual(adaptation.checkExtensions,DOUBLE_FOCUSED_CHECK_EXTENSIONS);
 assert.deepEqual(keys(adaptation.runners),keys(COUNTS));
 const originalReports=new Map();let retained=0;
 for(const [name,count]of Object.entries(COUNTS)){
  const filename='test-'+name+'.py',record=adaptation.runners[name],pin=snapshot.files['tests/'+filename];
  assert.equal(record.runner,filename);assert.equal(record.originalSnapshot,'double1-retained-parent/'+filename);
  const original=Buffer.from(await read('tests/'+record.originalSnapshot));
  assert.equal(original.length,pin.bytes);assert.equal(sha(original),pin.sha256);
  assert.equal(record.originalBytes,original.length);assert.equal(record.originalSha256,sha(original));
  const oldReport=await read(FOLDER+'parent-reports/'+name+'-results.json'),oldPin=parentPins.reports[name];
  assert.equal(oldReport.length,oldPin.bytes);assert.equal(sha(oldReport),oldPin.sha256);assert.equal(oldPin.checks,count);
  assert.equal(record.parentReportSha256,sha(oldReport));
  const previous=JSON.parse(oldReport);assert.equal(previous.checks,count);assert.equal(previous.failures,0);
  assert.equal(previous.exitCode,0);assert.match(previous.status,/^PASS /);originalReports.set(name,previous);
  let text=original.toString('utf8');
  for(const operation of REVIEWED_OPERATIONS[name]){
   assert(operation.before&&Number.isSafeInteger(operation.count)&&operation.count>0);
   assert.equal(text.split(operation.before).length-1,operation.count,'Unique reviewed edit count: '+name);
   text=text.replaceAll(operation.before,operation.after);
  }
  const expected=Buffer.from(text),current=Buffer.from(await read('tests/'+filename));
  assert.deepEqual(applyEdits(original,record.compatibilityEdits),expected,'Exact bounded byte edits retain all old cases: '+name);
  assert.deepEqual(current,expected,'No unreviewed current runner byte: '+name);assert.equal(sha(current),record.runnerSha256);
  assert.deepEqual(record.compatibilityReasons,REVIEWED_OPERATIONS[name].map(row=>row.reason));
  assert.deepEqual(record.appendedEdits,[]);assert.deepEqual(record.newCaseInputs,[]);
  assert.equal(record.baselineChecks,count);assert.equal(record.appendedChecks,DOUBLE_FOCUSED_CHECK_EXTENSIONS[name]||0);
  retained+=count;
 }
 assert.equal(retained,58832);
 // The entire original rational transform remains verbatim inside the exact
 // runner comparison above, including every27157 layout assertion/threshold.
 return {adaptation,adaptationBytes,patchBytes,parentPinsBytes,originalReports};
}

export async function verifyDoubleFocusedRetention({read,sha,engine,reports}){
 assert.equal(REVIEWED_PINS.pendingFinalFreeze,false,'Current Double Agent focused evidence has not been frozen');
 assert(reports instanceof Map);
 const retained=await verifyDoubleFocusedCompatibility({read,sha,engine});
 for(const [name,bytes]of Object.entries({adaptations:retained.adaptationBytes,compatibilityPatches:retained.patchBytes,
  parentReportPins:retained.parentPinsBytes}))assert.equal(sha(bytes),REVIEWED_PINS[name+'Sha256']);
 assert.equal(sha(await read(FOLDER+'adapter.py')),REVIEWED_PINS.adapterSha256);
 assert.equal(sha(await read(FOLDER+'run.py')),REVIEWED_PINS.runSha256);
 let total=0;
 for(const [name,count]of Object.entries(COUNTS)){
  const reviewed=REVIEWED_PINS.runners[name],record=retained.adaptation.runners[name];
  const runner=await read('tests/'+record.runner);assert.equal(sha(runner),reviewed.runnerSha256);
  const reportBytes=await read('tests/'+name+'-results.json');assert.equal(sha(reportBytes),reviewed.reportSha256);
  const result=reports.get(name);assert.deepEqual(result,JSON.parse(reportBytes));
  assert.match(result.status,/^PASS /);assert.equal(result.failures,0);assert.equal(result.exitCode,0);
  assert.equal(result.checks,count+(DOUBLE_FOCUSED_CHECK_EXTENSIONS[name]||0));
  const harness=await read('tests/'+name+'-harness.cpp');assert.equal(sha(harness),reviewed.harnessSha256);
  assert.equal(sha(harness),result.generatedHarnessSha256);
  const additions=DOUBLE_SOURCE_ADDITIONS.map(name=>'source/'+name);
  for(const input of additions)assert(Object.hasOwn(result.sourceSha256,input));
  assert.deepEqual(keys(result.sourceSha256),[...keys(retained.originalReports.get(name).sourceSha256),...additions].sort(),
   'Every old source dependency stays bound, with exactly four new production inputs: '+name);
  for(const [input,pin]of Object.entries(result.sourceSha256)){
   safeName(input);assert(input.startsWith('source/'));digest(pin);assert.equal(sha(await read(input)),pin);
  }
  total+=result.checks;
 }
 assert.equal(total,58833);
 const layout=reports.get('native-layout');
 assert.equal(layout.rallyAlmanacChecks,760);assert.equal(layout.rallyAlmanacWindows,27);
 assert.equal(layout.scrapRetainedChecks,26138);assert.equal(layout.scrapLayoutChecks,333);
 assert.equal(layout.ambushRetainedChecks,26471);assert.equal(layout.ambushLayoutChecks,686);
 const normalBytes=await read('logs/build-result.json');assert.equal(sha(normalBytes),REVIEWED_PINS.normalBuildReceiptSha256);
 const normal=JSON.parse(normalBytes);assert.equal(normal.status,'PASS');assert.equal(normal.exitCode,0);
 assert.equal(normal.sourceUnchangedDuringBuild,true);assert.equal(normal.sourceFiles,CURRENT_SOURCE_COUNT);
 for(const suffix of ['js','wasm'])assert.equal(normal.outputs['build/pvz-portable.'+suffix].sha256,engine.artifacts[suffix+'Sha256']);
 safeName(REVIEWED_PINS.summaryPath);
 const summaryBytes=await read(FOLDER+REVIEWED_PINS.summaryPath);assert.equal(sha(summaryBytes),REVIEWED_PINS.summarySha256);
 const summary=JSON.parse(summaryBytes);assert.equal(summary.status,'PASS');assert.equal(summary.audioInitialized,false);
 assert.equal(summary.execution,'focused-production-methods-with-controlled-collaborators');
 assert.deepEqual(summary.selected,Object.keys(COUNTS));assert.deepEqual(summary.staleReports,[]);
 assert.equal(summary.checks,total);assert.deepEqual(summary.runners.map(row=>row.name),Object.keys(COUNTS));
 for(const row of summary.runners){
  assert.equal(row.status,'PASS');assert.equal(row.exitCode,0);assert.equal(row.runnerUnchangedDuringRun,true);
  assert.equal(row.runnerSha256,REVIEWED_PINS.runners[row.name].runnerSha256);
  assert.equal(row.reportSha256,REVIEWED_PINS.runners[row.name].reportSha256);assert.equal(row.checks,reports.get(row.name).checks);
  safeName(row.log);assert(row.log.startsWith('double1-focused-retention/'));
  assert.equal(sha(await read('tests/'+row.log)),row.logSha256);
 }
 console.log('PASS Double focused retention:58,832 exact published assertions plus1 catalog iteration; all13 current and silent.');
}
