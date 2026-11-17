// SPDX-License-Identifier: MIT
// Exact published Gust assertions plus narrowly reviewed Zombotany3 collaborators.
import assert from 'node:assert/strict';
import {CURRENT_ENGINE_ID,CURRENT_SOURCE_COUNT,ZOMBOTANY3_SOURCE_ADDITIONS,GUST_ENGINE_ID,
 GUST_ARCHIVE_SHA256,ZOMBOTANY3_PARENT_TEST_INPUTS_SHA256,verifyZombotany3RetainedParentInputs}
 from './native-release-context.mjs';

const FOLDER='tests/zombotany3-focused-retention/';
const COUNTS={"game-speed":81,"qol-controls":90,"decks-cooldowns":274,"bonus-challenge":394,"bonus-completion":1382,"night-shift":231,"lantern-shroom":1724,"garden-shuffle":214,"seed-swap":587,"mender-bloom":523,"intensive-care":1135,"native-layout":27157,"care-fatigue":25042};
export const ZOMBOTANY3_FOCUSED_CHECK_EXTENSIONS=Object.freeze({'bonus-completion':3});
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
    }
  ],
  "night-shift": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "count": 1,
      "reason": "Bind all published Gust production dependencies plus all eight appended Zombotany3/45 source files; remove no original dependency."
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
  "adaptationsSha256": "96052627943800ef5a55ed6945c2923e73f902a404ed27c883c10664c006b387",
  "compatibilityPatchesSha256": "e0d8d1d079a1adf262b429c575c480c54873fb04768f853bc1952172242a6561",
  "parentReportPinsSha256": "a741622b272b9c0c0727fe712d0e9251a2e5a1b237bb8c5f728d88a7b9d15044",
  "adapterSha256": "2b92746b80686f5ac3b02f3b5963092ef87647031a0516f21e453d25a327cf68",
  "runSha256": "b62b414af34ca10de508d6807853745f1ed40a05b641be303133a16cdbdb4268",
  "normalBuildReceiptSha256": "dbbb911dbb5cc8fdfdbf605422a4eb34bddd2d16565e17e04d3a40a657849f8a",
  "runners": {
    "game-speed": {
      "runnerSha256": "80a4e876506748e060cf42fdf03ec2db5e0aa1799717643ae719b3b742ffa40c",
      "reportSha256": "ab4ae81bde1eae04862e2a074f322f8ac03eeecc98fd3e00219edff07c6b5ef2",
      "harnessSha256": "0299e42113cdd9a96fdc9e4ac14cf68c6144f2c3660cf14f85bb224bb3a96b6b"
    },
    "qol-controls": {
      "runnerSha256": "d842e81f22f580dd10da981ac32071d241c45080bcc1be26fe8b0cd2a2ba9279",
      "reportSha256": "4ae398aa256b73e6b231a8b9ee370fb946543ad9a9c7bdd4475ea00e27e259da",
      "harnessSha256": "26baff16227c83705bc47cc2a8afd8b8f84effa24589d2ab63024c3495527316"
    },
    "decks-cooldowns": {
      "runnerSha256": "3ea68eb683087437b54bae5b8c1b3b02b7c498e65c94e608597874a1e67aa54a",
      "reportSha256": "b858e17e73277a42d82de9da287927efac00bbe6e459080746251053e4682613",
      "harnessSha256": "42d5ba51b452d466f385fdf07d23d1b7f204b121d8d300d5b192b31f3f5bb376"
    },
    "bonus-challenge": {
      "runnerSha256": "fb46da37141143eda86cb8d7b70e147f285f4321c1518a5b7b1933ffff6e5ccf",
      "reportSha256": "84ad0fd541ec8e51c473293056d88c64a120709bc662693109b1e96e15e02df1",
      "harnessSha256": "6bb09c8e5fc512283f622622a0f0a1274fa8f0148fdbbf7c520ddfc23ab1ef9b"
    },
    "bonus-completion": {
      "runnerSha256": "86f7349051211a9e358cd3be0c0a7e9de5344424e682c372607a47a83e6ad035",
      "reportSha256": "5b7da2ac9a9bb86667aa1272cdfe3df38cdd0704aa2e4403622b6bebe1cf218f",
      "harnessSha256": "d1182697fb468c2cb85071d337cb9d1d53e71bc1136bacce7441662b91491f24"
    },
    "night-shift": {
      "runnerSha256": "5fb74a9083af1e0034113a817010b5fb266f285cef080d83d0c88c69d1f7875b",
      "reportSha256": "6ec76770955604e1d57cb313ebfdcf48ae210974ce208c132f1b13502b8de220",
      "harnessSha256": "2a0e6a98d820f923804e9cbf6c21f8f1120e985017fd3b494845d8c42e80cc1e"
    },
    "lantern-shroom": {
      "runnerSha256": "e8a5bcdc6f9bf94046d06d1694c8ccf77d990af0755477b87919a8b855161d85",
      "reportSha256": "2bd6dfa38bcf4cfa7f18d966507732309ce6e9be865b2395860d92e7336a0b51",
      "harnessSha256": "329f86d97ead12333ea4cb7b2419ea940bbff8cca1b5243686d8ee8a722145f7"
    },
    "garden-shuffle": {
      "runnerSha256": "b28e8926a3fbfb70433cffe7f6919f179159196ccb864041115913b65beec597",
      "reportSha256": "50a1290ec2cf8637fe17ef0d3b6b49e9bd707bfc1956d3c43754aa1cd4d425d8",
      "harnessSha256": "9e06591927a1d872c72273f2db0bcbf549a16e38ffd5d491246c67d78977508d"
    },
    "seed-swap": {
      "runnerSha256": "4741a30e2a38f786c0d606c0c8b4707ed8a24f4548ead00a5d307c64579749e5",
      "reportSha256": "f1068c9dce404158b236816a04381ffd080175bc249522d43d6dc7d7f711c2bd",
      "harnessSha256": "84c43cb1d2c5f6e42094775557b1ae4f117bcf683f8ee3d8a89a0cc283149551"
    },
    "mender-bloom": {
      "runnerSha256": "98034510f76582696735b6943d86389fe0670d56858c8e919895e3b202d92615",
      "reportSha256": "af888b4ac95bcfdffcae68b66c6d1502de267ffbd824c34eacd91bcd55ecd3be",
      "harnessSha256": "276c6e8db99cb037fd8cc3f92122a3998d418905d454ec20fbbca0bf198c453c"
    },
    "intensive-care": {
      "runnerSha256": "703d6c1597d4558f5469990b497a6bb7ab3fa0ad65fa236da193a6fc64a62a48",
      "reportSha256": "7b673793fe5c8daaa74a277cd8e282ed9d5cf38a10552ab4e9bc15ea415aa1f3",
      "harnessSha256": "ffc6bb2cfd92801cd17bb61fa1f884fb6f29ef72efcad30f80e9e343e2ed6457"
    },
    "native-layout": {
      "runnerSha256": "c24625ad312b804c3e1d92c915e29586c76e2d02f24f194d6c3c93fab6529df1",
      "reportSha256": "6154eceba8f3ec8863d3b50a4792ef89fe885482cf0f903909fb0ad251f7f76b",
      "harnessSha256": "567a6c87c7e6ed9506814b11f185414b7a6338838a5bb9957ac58e64a73fdb9a"
    },
    "care-fatigue": {
      "runnerSha256": "926ef0357661ceb88b1d68fe4c78cdcfa5d07fabe60e52567518e6e53405f2ea",
      "reportSha256": "6c7e693d2575890e84afc568453ed9ebfe987d2bd547a9398b90540651408973",
      "harnessSha256": "60b9b05a2437b088d08bd89ca393dc4ab00d107fc4c382927e2a36068ab92130"
    }
  },
  "summaryPath": "focused45-2-final-closure/summary.json",
  "summarySha256": "037fd06afcc19430e255350b397ed0c358ecf8df89350871675f1723ee4d06a4",
  "originSummaries": {
    "focused45-2-settled/summary.json": "48c0cfa6f22e2ebf8dfa94f43d9fcb05ade767fb6c190663126f2dc36d432eb2"
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
 assert.equal(engine.id,CURRENT_ENGINE_ID);assert.equal(engine.parent.id,GUST_ENGINE_ID);
 assert.equal(engine.parent.artifacts.sourceSha256,GUST_ARCHIVE_SHA256);
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
 assert.equal(total,58837);
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
 console.log('PASS Zombotany3 focused retention:58,834 exact published assertions plus3 catalog iterations; all13 current and silent.');
}
