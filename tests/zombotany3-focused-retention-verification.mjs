// SPDX-License-Identifier: MIT
// Exact published Gust assertions plus narrowly reviewed Zombotany3 collaborators.
import assert from 'node:assert/strict';
import {CURRENT_ENGINE_ID,CURRENT_SOURCE_COUNT,ZOMBOTANY3_SOURCE_ADDITIONS,GUST_ENGINE_ID,
 GUST_ARCHIVE_SHA256,ZOMBOTANY3_PARENT_TEST_INPUTS_SHA256,verifyZombotany3RetainedParentInputs,historicalEngine}
 from './native-release-context.mjs';

const FOLDER='tests/zombotany3-focused-retention/';
const COUNTS={"game-speed":81,"qol-controls":90,"decks-cooldowns":274,"bonus-challenge":394,"bonus-completion":1382,"night-shift":231,"lantern-shroom":1724,"garden-shuffle":214,"seed-swap":587,"mender-bloom":523,"intensive-care":1135,"native-layout":27157,"care-fatigue":25042};
export const ZOMBOTANY3_FOCUSED_CHECK_EXTENSIONS=Object.freeze({'bonus-completion':4});
const PARENT_REPORT_PINS='a741622b272b9c0c0727fe712d0e9251a2e5a1b237bb8c5f728d88a7b9d15044';

// Independently reviewed literal operations: original case bodies, messages and
// thresholds cannot be replaced by an operation merely supplied by the adapter.
const REVIEWED_OPERATIONS = /* REVIEWED_ZOMBOTANY3_COMPATIBILITY_BEGIN */ {
  "game-speed": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "count": 1,
      "reason": "Bind all published Gust production dependencies plus all eight appended Zombotany3/45 source files; remove no original dependency."
    }
  ],
  "qol-controls": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "count": 1,
      "reason": "Bind all published Gust production dependencies plus all eight appended Zombotany3/45 source files; remove no original dependency."
    }
  ],
  "decks-cooldowns": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "count": 1,
      "reason": "Bind all published Gust production dependencies plus all eight appended Zombotany3/45 source files; remove no original dependency."
    }
  ],
  "bonus-challenge": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "count": 1,
      "reason": "Bind all published Gust production dependencies plus all eight appended Zombotany3/45 source files; remove no original dependency."
    },
    {
      "before": "NUM_GAME_MODES==93",
      "after": "NUM_GAME_MODES==96",
      "count": 2,
      "reason": "Append only modes93/94/95 to the sentinel; preserve every preceding explicit identity and assertion."
    },
    {
      "before": "NUM_GAME_MODES==96",
      "after": "GAMEMODE_CHALLENGE_ZOMBOTANY_5==95&&GAMEMODE_SURVIVAL_ZOMBOTANY_DAY==96&&NUM_GAME_MODES==97",
      "count": 2,
      "reason": "Preserve every previous mode ID and bind the newly appended mode96/catalog terminal97."
    }
  ],
  "bonus-completion": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "count": 1,
      "reason": "Bind all published Gust production dependencies plus all eight appended Zombotany3/45 source files; remove no original dependency."
    },
    {
      "before": "NUM_GAME_MODES==93",
      "after": "NUM_GAME_MODES==96",
      "count": 1,
      "reason": "Append only modes93/94/95 to the sentinel; preserve every preceding explicit identity and assertion."
    },
    {
      "before": "NUM_CHALLENGE_MODES==92",
      "after": "NUM_CHALLENGE_MODES==95",
      "count": 1,
      "reason": "Append three definitions after all92 published definitions; preserve every original mode identity and order."
    },
    {
      "before": "ambushRetainedChecks==1306",
      "after": "ambushRetainedChecks==1309",
      "count": 1,
      "reason": "Count three additional actual native catalog iterations separately from all unchanged published completion assertions."
    },
    {
      "before": "NUM_GAME_MODES==96",
      "after": "GAMEMODE_CHALLENGE_ZOMBOTANY_5==95&&GAMEMODE_SURVIVAL_ZOMBOTANY_DAY==96&&NUM_GAME_MODES==97",
      "count": 1,
      "reason": "Preserve every previous mode ID and bind the newly appended mode96/catalog terminal97."
    },
    {
      "before": "cpp.write_text(head +",
      "after": "head += '\\nnamespace ZombotanySurvival { constexpr bool IsMode(GameMode mode){return mode==GAMEMODE_SURVIVAL_ZOMBOTANY_DAY;} }\\n'\ncpp.write_text(head +",
      "count": 1,
      "reason": "Provide the exact new mode predicate to the isolated legacy collaborator; no original assertion changes."
    },
    {
      "before": "ambushRetainedChecks==1309",
      "after": "ambushRetainedChecks==1310",
      "count": 1,
      "reason": "The unchanged native challenge-definition index loop executes one additional appended mode96; retain all1309 earlier checks and count its extra iteration."
    },
    {
      "before": "NUM_CHALLENGE_MODES==95",
      "after": "NUM_CHALLENGE_MODES==96&&GAMEMODE_SURVIVAL_ZOMBOTANY_DAY==96",
      "count": 1,
      "reason": "Bind the appended challenge-definition terminal96 while retaining Vase mode89/profile88 and all previous identities."
    }
  ],
  "night-shift": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "count": 1,
      "reason": "Bind all published Gust production dependencies plus all eight appended Zombotany3/45 source files; remove no original dependency."
    },
    {
      "before": "cpp.write_text(head +",
      "after": "head += '\\nnamespace ZombotanySurvival { constexpr bool IsMode(GameMode mode){return mode==GAMEMODE_SURVIVAL_ZOMBOTANY_DAY;} }\\n'\ncpp.write_text(head +",
      "count": 1,
      "reason": "Provide the exact new mode predicate to the isolated legacy collaborator; no original assertion changes."
    }
  ],
  "lantern-shroom": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "count": 1,
      "reason": "Bind all published Gust production dependencies plus all eight appended Zombotany3/45 source files; remove no original dependency."
    },
    {
      "before": "cpp.write_text(head + constants + '\\n' + methods + tail, encoding='utf-8', newline='\\n')",
      "after": "head += '\\nnamespace Zombotany3 { bool UpdateFrozenPlant(Plant&){return false;} }\\n'\nhead += '\\nnamespace Zombotany45 { bool UpdateButteredPlant(Plant&){return false;} }\\n'\ncpp.write_text(head + constants + '\\n' + methods + tail, encoding='utf-8', newline='\\n')",
      "count": 1,
      "reason": "Provide false controlled collaborators for actual added Plant::Update freeze/butter branches in old-mode harness cases; no original case, clock, renderer, or assertion changes."
    },
    {
      "before": "cpp.write_text(head +",
      "after": "head += '\\nnamespace ZombotanySurvival { constexpr bool IsMode(GameMode mode){return mode==GAMEMODE_SURVIVAL_ZOMBOTANY_DAY;} }\\n'\ncpp.write_text(head +",
      "count": 1,
      "reason": "Provide the exact new mode predicate to the isolated legacy collaborator; no original assertion changes."
    }
  ],
  "garden-shuffle": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "count": 1,
      "reason": "Bind all published Gust production dependencies plus all eight appended Zombotany3/45 source files; remove no original dependency."
    }
  ],
  "seed-swap": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "count": 1,
      "reason": "Bind all published Gust production dependencies plus all eight appended Zombotany3/45 source files; remove no original dependency."
    },
    {
      "before": "NUM_GAME_MODES==93",
      "after": "NUM_GAME_MODES==96",
      "count": 1,
      "reason": "Append only modes93/94/95 to the sentinel; preserve every preceding explicit identity and assertion."
    },
    {
      "before": "NUM_GAME_MODES==96",
      "after": "GAMEMODE_CHALLENGE_ZOMBOTANY_5==95&&GAMEMODE_SURVIVAL_ZOMBOTANY_DAY==96&&NUM_GAME_MODES==97",
      "count": 1,
      "reason": "Preserve every previous mode ID and bind the newly appended mode96/catalog terminal97."
    }
  ],
  "mender-bloom": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "count": 1,
      "reason": "Bind all published Gust production dependencies plus all eight appended Zombotany3/45 source files; remove no original dependency."
    }
  ],
  "intensive-care": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "count": 1,
      "reason": "Bind all published Gust production dependencies plus all eight appended Zombotany3/45 source files; remove no original dependency."
    },
    {
      "before": "NUM_GAME_MODES==93",
      "after": "NUM_GAME_MODES==96",
      "count": 1,
      "reason": "Append only modes93/94/95 to the sentinel; preserve every preceding explicit identity and assertion."
    },
    {
      "before": "NUM_GAME_MODES==96",
      "after": "GAMEMODE_CHALLENGE_ZOMBOTANY_5==95&&GAMEMODE_SURVIVAL_ZOMBOTANY_DAY==96&&NUM_GAME_MODES==97",
      "count": 1,
      "reason": "Preserve every previous mode ID and bind the newly appended mode96/catalog terminal97."
    }
  ],
  "native-layout": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "count": 1,
      "reason": "Bind all published Gust production dependencies plus all eight appended Zombotany3/45 source files; remove no original dependency."
    },
    {
      "before": "GameMode::NUM_GAME_MODES)==93",
      "after": "GameMode::NUM_GAME_MODES)==96",
      "count": 2,
      "reason": "Account only for the appended mode cardinality in two scoped identity assertions; preserve Scrap88,Vase89 and all original assertions."
    },
    {
      "before": "current_draw_button=extract(challenge_screen,'void ChallengeScreen::DrawButton(')",
      "after": "current_draw_button=extract(challenge_screen,'void ChallengeScreen::DrawButton(')\nzombotany_guard='\\t\\t\\tif (aDef.mChallengeMode == GAMEMODE_CHALLENGE_ZOMBOTANY_3)\\n\\t\\t\\t{\\n\\t\\t\\t\\tif (Image* image = Zombotany3Art::GetImage()) g->DrawImage(image, aPosX + 13, aPosY + 4);\\n\\t\\t\\t}\\n\\t\\t\\telse '\nassert current_draw_button.count(zombotany_guard)==1\ncurrent_draw_button=current_draw_button.replace(zombotany_guard,'\\t\\t\\t',1)\nzombotany45_guard='\\t\\t\\tif (aDef.mChallengeMode == GAMEMODE_CHALLENGE_ZOMBOTANY_4 || aDef.mChallengeMode == GAMEMODE_CHALLENGE_ZOMBOTANY_5)\\n\\t\\t\\t{\\n\\t\\t\\t\\tif (Image* image = Zombotany45Art::GetImage(aDef.mChallengeMode)) g->DrawImage(image, aPosX + 13, aPosY + 4);\\n\\t\\t\\t}\\n\\t\\t\\telse '\nassert current_draw_button.count(zombotany45_guard)==1\ncurrent_draw_button=current_draw_button.replace(zombotany45_guard,'\\t\\t\\t',1)",
      "count": 1,
      "reason": "Authenticate and project only appended93 and94/95 thumbnail dispatches before the exact unchanged historical DrawButton restoration assertion; full-engine presentation controls cover all new cards."
    },
    {
      "before": "static_cast<int>(GameMode::NUM_GAME_MODES)==96",
      "after": "GAMEMODE_CHALLENGE_ZOMBOTANY_5==95&&GAMEMODE_SURVIVAL_ZOMBOTANY_DAY==96&&static_cast<int>(GameMode::NUM_GAME_MODES)==97",
      "count": 2,
      "reason": "Preserve previous identities and bind the new appended mode only."
    },
    {
      "before": "current_draw_button=current_draw_button.replace(zombotany45_guard,'\\t\\t\\t',1)\n",
      "after": "current_draw_button=current_draw_button.replace(zombotany45_guard,'\\t\\t\\t',1)\nzombotany_survival_guard='\\t\\t\\tif (ZombotanySurvival::IsMode(aDef.mChallengeMode))\\n\\t\\t\\t{\\n\\t\\t\\t\\tif (Image* image = GetZombotanySurvivalImage()) g->DrawImage(image, aPosX + 13, aPosY + 4);\\n\\t\\t\\t}\\n\\t\\t\\telse '\nassert current_draw_button.count(zombotany_survival_guard)==1\ncurrent_draw_button=current_draw_button.replace(zombotany_survival_guard,'\\t\\t\\t',1)\n",
      "count": 1,
      "reason": "Remove only the new separately tested card renderer before the unchanged exact historical card-method comparison."
    }
  ],
  "care-fatigue": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "count": 1,
      "reason": "Bind all published Gust production dependencies plus all eight appended Zombotany3/45 source files; remove no original dependency."
    }
  ]
} /* REVIEWED_ZOMBOTANY3_COMPATIBILITY_END */;

const REVIEWED_PINS = /* REVIEWED_ZOMBOTANY3_PINS_BEGIN */ {
  "pendingFinalFreeze": false,
  "adaptationsSha256": "394951c44b6d58ba9933f157fff163881bc0879242768eee274e2d15fac8df9b",
  "compatibilityPatchesSha256": "e962c1f77d9ac72d85d0d66e69b042e9e35a776e49fe0a71c709587b399adfc0",
  "parentReportPinsSha256": "a741622b272b9c0c0727fe712d0e9251a2e5a1b237bb8c5f728d88a7b9d15044",
  "adapterSha256": "5653af61cd2f94d0ba1964af01068463ee68cad9018362b22dc9cbce2e2bab31",
  "runSha256": "b62b414af34ca10de508d6807853745f1ed40a05b641be303133a16cdbdb4268",
  "normalBuildReceiptSha256": "6ea3a215e5c3e7ac3e4cccd238e9c759173e68ebd248b6cadfbb48e76d033fe8",
  "runners": {
    "game-speed": {
      "runnerSha256": "80a4e876506748e060cf42fdf03ec2db5e0aa1799717643ae719b3b742ffa40c",
      "reportSha256": "e80ef73b5c22e9c0934e7842ee63c3867b075ac79ecf6f518fffb2a511962b69",
      "harnessSha256": "0299e42113cdd9a96fdc9e4ac14cf68c6144f2c3660cf14f85bb224bb3a96b6b"
    },
    "qol-controls": {
      "runnerSha256": "d842e81f22f580dd10da981ac32071d241c45080bcc1be26fe8b0cd2a2ba9279",
      "reportSha256": "d203529bf2669a77b630df24c5cc2d53db5ff90165fe3a280d7d2f0257e8f179",
      "harnessSha256": "26baff16227c83705bc47cc2a8afd8b8f84effa24589d2ab63024c3495527316"
    },
    "decks-cooldowns": {
      "runnerSha256": "3ea68eb683087437b54bae5b8c1b3b02b7c498e65c94e608597874a1e67aa54a",
      "reportSha256": "660942aaa99b94fbffb14b87cdd382c8e87ead581fba558ec117a91962174f33",
      "harnessSha256": "42d5ba51b452d466f385fdf07d23d1b7f204b121d8d300d5b192b31f3f5bb376"
    },
    "bonus-challenge": {
      "runnerSha256": "2619929c62fe1e6e49416ee7d1391c4a703d707090124bfe3975e96660a616f4",
      "reportSha256": "f4bf30de1c890c06070ccdc72bfc986aefc426326a0aeb701229d298f6accdfe",
      "harnessSha256": "591a338c65a7770d417998c59b0737513c9ca02f13f21e7036f24bc5c960eb6d"
    },
    "bonus-completion": {
      "runnerSha256": "37a0d7bf152ad589c9a931c1835abc8848fc8a6eb80a91b25246da9e4bc189d4",
      "reportSha256": "b6f616f8fba98707111589571d84f1abbf24a4fa91293121025cf9800a59cbc8",
      "harnessSha256": "3c41df74fa09901bb86e92de2710f94142a8c27851f1b15b1d1af31c6169e34b"
    },
    "night-shift": {
      "runnerSha256": "336780bc0b969149f7b13922d5caa11fc0a5e23d9ba529072b149c9106deb4a2",
      "reportSha256": "3b8f217fdb2f2eefabcda739a3c0224362792e12e47ef89200bf98a790728355",
      "harnessSha256": "3014869ba824dfeb88bf08880b0c71507c58d168689963891c4f21f42f5195a3"
    },
    "lantern-shroom": {
      "runnerSha256": "c7dc42ad7dbae6926490335f7397dab9934008433d4d708d6ff1e951ad229c5c",
      "reportSha256": "543de6a5ef4638518c95d7da01cee5d1d1e0634c0003f33427e09bdd978e64e5",
      "harnessSha256": "61bc9d1b49447f7e9d0605ee0d16451256654689220d5c1e21f41e386c29d183"
    },
    "garden-shuffle": {
      "runnerSha256": "b28e8926a3fbfb70433cffe7f6919f179159196ccb864041115913b65beec597",
      "reportSha256": "7a552a41068d05639f79f79ffb35dc038ec4a7d64a1631258ca0fd9bf8305603",
      "harnessSha256": "9e06591927a1d872c72273f2db0bcbf549a16e38ffd5d491246c67d78977508d"
    },
    "seed-swap": {
      "runnerSha256": "9b802d9114b1dc6302f26486e295d99cb0410e9f8e42848cee2c0b24105ad8eb",
      "reportSha256": "dd2c10c077b0ce735f0e59d51800656cf3bed6d1ba4ee6092d94b6e91f8bdcb2",
      "harnessSha256": "8ecb5d1e00bc28bdb9f2292ebcd256d5d6fc0ce18daf902905ab29b501b9f949"
    },
    "mender-bloom": {
      "runnerSha256": "98034510f76582696735b6943d86389fe0670d56858c8e919895e3b202d92615",
      "reportSha256": "af4b424cbb8780a19179a3b44bca0b116adcf30e55aecb7dcc7e622e7a718502",
      "harnessSha256": "276c6e8db99cb037fd8cc3f92122a3998d418905d454ec20fbbca0bf198c453c"
    },
    "intensive-care": {
      "runnerSha256": "90c0e1b323eb710e5108b3a482187722ec975b31c4b97cddd67910c4999ae083",
      "reportSha256": "e4c30af879c581885185fad919f1806a0cadf14888339a2e4c6c72cd32ee6a16",
      "harnessSha256": "ad48418ede0a33455f8006d5a57ca0672f5f378e03c37b3ea45fcce7b6fc6dd3"
    },
    "native-layout": {
      "runnerSha256": "0b7fd080e65148a86726a217e9f4649a7afd0df05b964f017144753e6ad5a297",
      "reportSha256": "15dda29dad1023afde933a63a5c6f806923150503f9e263267dba83ed755bbc0",
      "harnessSha256": "456d4fedf1f734bf96259d831bca4487c7c17c9f249325ba907426f8cfc14be6"
    },
    "care-fatigue": {
      "runnerSha256": "926ef0357661ceb88b1d68fe4c78cdcfa5d07fabe60e52567518e6e53405f2ea",
      "reportSha256": "92cb3e496a7d5a40706718cfa6dbbc471335e0e20cf696f7a2fb9ee1d2ef4348",
      "harnessSha256": "60b9b05a2437b088d08bd89ca393dc4ab00d107fc4c382927e2a36068ab92130"
    }
  },
  "summaryPath": "focused-zsurvival-final-closure/summary.json",
  "summarySha256": "aa8f6014a4d4673d92d8e7ad425bf46c57e6b6d52243d64cb4e8deff502c299b",
  "originSummaries": {
    "focused-zsurvival-final-run/summary.json": "2d3d74a210465d2f84217770d1713eabdc9d668539d4b55f5030d5fd183f568a"
  }
} /* REVIEWED_ZOMBOTANY3_PINS_END */;

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

export async function verifyZombotany3FocusedCompatibility({read,sha,engine}){
 assert.equal(engine.id,CURRENT_ENGINE_ID);const oracleParent=historicalEngine(engine,GUST_ENGINE_ID);
 assert.equal(oracleParent.artifacts.sourceSha256,GUST_ARCHIVE_SHA256);
 const snapshot=await verifyZombotany3RetainedParentInputs({read,sha});
 const parentPinsBytes=await read(FOLDER+'parent-report-pins.json');assert.equal(sha(parentPinsBytes),PARENT_REPORT_PINS);
 const parentPins=JSON.parse(parentPinsBytes);
 assert.equal(parentPins.schemaVersion,1);assert.equal(parentPins.parentEngineId,GUST_ENGINE_ID);
 assert.equal(parentPins.parentArchiveSha256,GUST_ARCHIVE_SHA256);assert.deepEqual(keys(parentPins.reports),keys(COUNTS));
 const adaptationBytes=await read(FOLDER+'adaptations.json'),adaptation=JSON.parse(adaptationBytes);
 const patchBytes=await read(FOLDER+'compatibility-patches.json'),patches=JSON.parse(patchBytes);
 assert.equal(patches.schemaVersion,1);assert.deepEqual(keys(patches.runners),keys(COUNTS));
 assert.deepEqual(patches.runners,REVIEWED_OPERATIONS,'Only the independently reviewed collaborator/sentinel/dependency edits may run');
 assert.equal(adaptation.schemaVersion,1);assert.equal(adaptation.engineId,CURRENT_ENGINE_ID);
 assert.equal(adaptation.parentEngineId,GUST_ENGINE_ID);assert.equal(adaptation.parentArchiveSha256,GUST_ARCHIVE_SHA256);
 assert.equal(adaptation.parentSnapshotSha256,ZOMBOTANY3_PARENT_TEST_INPUTS_SHA256);
 assert.equal(adaptation.parentReportPinsSha256,sha(parentPinsBytes));assert.equal(adaptation.compatibilityPatchesSha256,sha(patchBytes));
 assert.equal(adaptation.retainedCheckTotal,58834);assert.deepEqual(adaptation.checkExtensions,ZOMBOTANY3_FOCUSED_CHECK_EXTENSIONS);
 assert.deepEqual(keys(adaptation.runners),keys(COUNTS));
 const originalReports=new Map();let retained=0;
 for(const [name,count]of Object.entries(COUNTS)){
  const filename='test-'+name+'.py',record=adaptation.runners[name],pin=snapshot.files[filename];
  assert.equal(record.runner,filename);assert.equal(record.originalSnapshot,'zombotany3-retained-parent/'+filename);
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
  assert.equal(record.baselineChecks,count);assert.equal(record.appendedChecks,ZOMBOTANY3_FOCUSED_CHECK_EXTENSIONS[name]||0);
  retained+=count;
 }
 assert.equal(retained,58834);
 // The entire original rational transform remains verbatim inside the exact
 // runner comparison above, including every27157 layout assertion/threshold.
 return {adaptation,adaptationBytes,patchBytes,parentPinsBytes,originalReports};
}

export async function verifyZombotany3FocusedRetention({read,sha,engine,reports}){
 assert.equal(REVIEWED_PINS.pendingFinalFreeze,false,'Current Zombotany3 focused evidence has not been frozen');
 assert(reports instanceof Map);
 const retained=await verifyZombotany3FocusedCompatibility({read,sha,engine});
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
  assert.equal(result.checks,count+(ZOMBOTANY3_FOCUSED_CHECK_EXTENSIONS[name]||0));
  const harness=await read('tests/'+name+'-harness.cpp');assert.equal(sha(harness),reviewed.harnessSha256);
  assert.equal(sha(harness),result.generatedHarnessSha256);
  const additions=ZOMBOTANY3_SOURCE_ADDITIONS.map(name=>'source/'+name);
  for(const input of additions)assert(Object.hasOwn(result.sourceSha256,input));
  assert.deepEqual(keys(result.sourceSha256),[...keys(retained.originalReports.get(name).sourceSha256),...additions].sort(),
   'Every old source dependency stays bound, with exactly eight appended production inputs: '+name);
  for(const [input,pin]of Object.entries(result.sourceSha256)){
   safeName(input);assert(input.startsWith('source/'));digest(pin);assert.equal(sha(await read(input)),pin);
  }
  total+=result.checks;
 }
 assert.equal(total,58838);
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
 assert.equal(summary.schemaVersion,1);assert.deepEqual(summary.originSummaries,REVIEWED_PINS.originSummaries);
 const actualInvocations=new Map();
 for(const [name,pin]of Object.entries(REVIEWED_PINS.originSummaries)){
  safeName(name);digest(pin);const bytes=await read(FOLDER+name);assert.equal(sha(bytes),pin);
  const invocation=JSON.parse(bytes);assert.equal(invocation.audioInitialized,false);
  assert.equal(invocation.execution,'focused-production-methods-with-controlled-collaborators');actualInvocations.set(name,invocation);
 }
 for(const row of summary.runners){
  assert.equal(row.status,'PASS');assert.equal(row.exitCode,0);assert.equal(row.runnerUnchangedDuringRun,true);
  assert.equal(row.runnerSha256,REVIEWED_PINS.runners[row.name].runnerSha256);
  assert.equal(row.reportSha256,REVIEWED_PINS.runners[row.name].reportSha256);assert.equal(row.checks,reports.get(row.name).checks);
  safeName(row.log);assert(row.log.startsWith('zombotany3-focused-retention/'));
  assert.equal(sha(await read('tests/'+row.log)),row.logSha256);
  assert(actualInvocations.has(row.actualExecutionSummary));
  const {actualExecutionSummary,...exactRow}=row;
  assert.deepEqual(exactRow,actualInvocations.get(actualExecutionSummary).runners.find(old=>old.name===row.name),
   'Every current passing row retains its exact actual invocation, including unchanged runner/report/log pins');
 }
 console.log('PASS Zombotany3 focused retention:58,834 exact published assertions plus4 catalog iterations; all13 current and silent.');
}
