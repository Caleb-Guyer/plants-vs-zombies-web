// SPDX-License-Identifier: MIT
// Exact published Gust assertions plus narrowly reviewed Zombotany3 collaborators.
import assert from 'node:assert/strict';
import {CURRENT_ENGINE_ID,CURRENT_SOURCE_COUNT,ZOMBOTANY3_SOURCE_ADDITIONS,GUST_ENGINE_ID,
 GUST_ARCHIVE_SHA256,ZOMBOTANY3_PARENT_TEST_INPUTS_SHA256,verifyZombotany3RetainedParentInputs}
 from './native-release-context.mjs';

const FOLDER='tests/zombotany3-focused-retention/';
const COUNTS={"game-speed":81,"qol-controls":90,"decks-cooldowns":274,"bonus-challenge":394,"bonus-completion":1382,"night-shift":231,"lantern-shroom":1724,"garden-shuffle":214,"seed-swap":587,"mender-bloom":523,"intensive-care":1135,"native-layout":27157,"care-fatigue":25042};
export const ZOMBOTANY3_FOCUSED_CHECK_EXTENSIONS=Object.freeze({'bonus-completion':1});
const PARENT_REPORT_PINS='a741622b272b9c0c0727fe712d0e9251a2e5a1b237bb8c5f728d88a7b9d15044';

// Independently reviewed literal operations: original case bodies, messages and
// thresholds cannot be replaced by an operation merely supplied by the adapter.
const REVIEWED_OPERATIONS = /* REVIEWED_ZOMBOTANY3_COMPATIBILITY_BEGIN */ {
  "game-speed": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art')",
      "count": 1,
      "reason": "Bind every published Gust production input and exactly four appended Zombotany3 files; remove no original dependency."
    }
  ],
  "qol-controls": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art')",
      "count": 1,
      "reason": "Bind every published Gust production input and exactly four appended Zombotany3 files; remove no original dependency."
    }
  ],
  "decks-cooldowns": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art')",
      "count": 1,
      "reason": "Bind every published Gust production input and exactly four appended Zombotany3 files; remove no original dependency."
    }
  ],
  "bonus-challenge": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art')",
      "count": 1,
      "reason": "Bind every published Gust production input and exactly four appended Zombotany3 files; remove no original dependency."
    },
    {
      "before": "NUM_GAME_MODES==93",
      "after": "NUM_GAME_MODES==94",
      "count": 2,
      "reason": "Account only for appended mode93 sentinel; every preceding explicit identity and assertion remains."
    }
  ],
  "bonus-completion": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art')",
      "count": 1,
      "reason": "Bind every published Gust production input and exactly four appended Zombotany3 files; remove no original dependency."
    },
    {
      "before": "NUM_GAME_MODES==93",
      "after": "NUM_GAME_MODES==94",
      "count": 1,
      "reason": "Account only for appended mode93 sentinel; every preceding explicit identity and assertion remains."
    },
    {
      "before": "NUM_CHALLENGE_MODES==92",
      "after": "NUM_CHALLENGE_MODES==93",
      "count": 1,
      "reason": "One family definition is appended after all92 published definitions; preserve every original mode identity and order."
    },
    {
      "before": "ambushRetainedChecks==1306",
      "after": "ambushRetainedChecks==1307",
      "count": 1,
      "reason": "Count one additional iteration through the actual native catalog before all unchanged published completion assertions."
    }
  ],
  "night-shift": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art')",
      "count": 1,
      "reason": "Bind every published Gust production input and exactly four appended Zombotany3 files; remove no original dependency."
    }
  ],
  "lantern-shroom": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art')",
      "count": 1,
      "reason": "Bind every published Gust production input and exactly four appended Zombotany3 files; remove no original dependency."
    },
    {
      "before": "cpp.write_text(head + constants + '\\n' + methods + tail, encoding='utf-8', newline='\\n')",
      "after": "head += '\\nnamespace Zombotany3 { bool UpdateFrozenPlant(Plant&){return false;} }\\n'\ncpp.write_text(head + constants + '\\n' + methods + tail, encoding='utf-8', newline='\\n')",
      "count": 1,
      "reason": "Observed native link failure requires the new out-of-scope frost collaborator to return false in the unchanged old Lantern submodel; preserve every original actor, timer, case and assertion."
    }
  ],
  "garden-shuffle": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art')",
      "count": 1,
      "reason": "Bind every published Gust production input and exactly four appended Zombotany3 files; remove no original dependency."
    }
  ],
  "seed-swap": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art')",
      "count": 1,
      "reason": "Bind every published Gust production input and exactly four appended Zombotany3 files; remove no original dependency."
    },
    {
      "before": "NUM_GAME_MODES==93",
      "after": "NUM_GAME_MODES==94",
      "count": 1,
      "reason": "Account only for appended mode93 sentinel; every preceding explicit identity and assertion remains."
    }
  ],
  "mender-bloom": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art')",
      "count": 1,
      "reason": "Bind every published Gust production input and exactly four appended Zombotany3 files; remove no original dependency."
    }
  ],
  "intensive-care": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art')",
      "count": 1,
      "reason": "Bind every published Gust production input and exactly four appended Zombotany3 files; remove no original dependency."
    },
    {
      "before": "NUM_GAME_MODES==93",
      "after": "NUM_GAME_MODES==94",
      "count": 1,
      "reason": "Account only for appended mode93 sentinel; every preceding explicit identity and assertion remains."
    }
  ],
  "native-layout": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art')",
      "count": 1,
      "reason": "Bind every published Gust production input and exactly four appended Zombotany3 files; remove no original dependency."
    },
    {
      "before": "GameMode::NUM_GAME_MODES)==93",
      "after": "GameMode::NUM_GAME_MODES)==94",
      "count": 2,
      "reason": "Account only for the appended mode cardinality in the two scoped native identity assertions; preserve explicit Scrap88 and Vase89 identities and all prior assertions."
    },
    {
      "before": "current_draw_button=extract(challenge_screen,'void ChallengeScreen::DrawButton(')",
      "after": "current_draw_button=extract(challenge_screen,'void ChallengeScreen::DrawButton(')\nzombotany_guard='\\t\\t\\tif (aDef.mChallengeMode == GAMEMODE_CHALLENGE_ZOMBOTANY_3)\\n\\t\\t\\t{\\n\\t\\t\\t\\tif (Image* image = Zombotany3Art::GetImage()) g->DrawImage(image, aPosX + 13, aPosY + 4);\\n\\t\\t\\t}\\n\\t\\t\\telse '\nassert current_draw_button.count(zombotany_guard)==1\ncurrent_draw_button=current_draw_button.replace(zombotany_guard,'\\t\\t\\t',1)",
      "count": 1,
      "reason": "Authenticate and project only the appended mode93 thumbnail branch before the exact unchanged historical DrawButton restoration assertion; current full-engine family/card pixel controls cover the new branch."
    }
  ],
  "care-fatigue": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art')",
      "count": 1,
      "reason": "Bind every published Gust production input and exactly four appended Zombotany3 files; remove no original dependency."
    }
  ]
} /* REVIEWED_ZOMBOTANY3_COMPATIBILITY_END */;

const REVIEWED_PINS = /* REVIEWED_ZOMBOTANY3_PINS_BEGIN */ {
  "pendingFinalFreeze": false,
  "adaptationsSha256": "8e15a8f8745f3cf0c14fa6b5a940917f83c19601302b301ab135549e8f7f4e9a",
  "compatibilityPatchesSha256": "e83d9d3dd199e220a03cca1b7a690087ce71f4f7131ea5abca7ee5db10272adf",
  "parentReportPinsSha256": "a741622b272b9c0c0727fe712d0e9251a2e5a1b237bb8c5f728d88a7b9d15044",
  "adapterSha256": "07f00e8bd1acab5417a3f4bb6fd3576b1ddb3dac8dc42ad5445cd632ec2775fc",
  "runSha256": "b62b414af34ca10de508d6807853745f1ed40a05b641be303133a16cdbdb4268",
  "normalBuildReceiptSha256": "805528006b1ce40dbca55cf1bb2b836855e93ba50f72b77c41fddd9ef57a54b4",
  "runners": {
    "game-speed": {
      "runnerSha256": "1c2644a2815a4e5cc5f257d97c8e192cd14b624c08ff7db50c16155fec58b62e",
      "reportSha256": "7c9b4efcf0b105433ec67a2108e2df2afd7268e73ceb508a92f702bd48f87679",
      "harnessSha256": "0299e42113cdd9a96fdc9e4ac14cf68c6144f2c3660cf14f85bb224bb3a96b6b"
    },
    "qol-controls": {
      "runnerSha256": "9dc189a51063e80e88812e5cf6d0c1539e76a5ac6ea0675446aec9795fa0c422",
      "reportSha256": "80e9ff849d259fa0912a31eac3bf93cc7cfadd1092addc70cd9e28c2c49319dc",
      "harnessSha256": "26baff16227c83705bc47cc2a8afd8b8f84effa24589d2ab63024c3495527316"
    },
    "decks-cooldowns": {
      "runnerSha256": "747673958736174afbe9ded355b10095afa242c10a181c47b0282ef5c8739312",
      "reportSha256": "f8e5ccf6e1b56a78d601255a3493bf7a27a9415c853301126d21c98299514a1b",
      "harnessSha256": "42d5ba51b452d466f385fdf07d23d1b7f204b121d8d300d5b192b31f3f5bb376"
    },
    "bonus-challenge": {
      "runnerSha256": "2d1557c0efcd1f5be125829d9c49bae0358492b4a79f8e9623625125a5619f59",
      "reportSha256": "d709ff51e9523fd619198b4d565f005f99791981cbd9be1e757720823da250eb",
      "harnessSha256": "79f02435b53144deb25f3f456a34f8f4381894849a2589460a529f066469eccd"
    },
    "bonus-completion": {
      "runnerSha256": "8da50da7e2570383676fd8debe9d85b4aee26a08d20141f4a066d8782e067585",
      "reportSha256": "4ab2c84035f51ad9be8753bb1669a631ee7f2defa1bd5952a608c1b17ba7584b",
      "harnessSha256": "41eb9392fc62db53d59ebe241a2d845693faadc1a10ba4e77894301ffec7f99b"
    },
    "night-shift": {
      "runnerSha256": "05bc0f4663301ff61c2d333cfa06740410eb87344a1f6ea7c1a2c338491c1de5",
      "reportSha256": "b002da8314c2b42c6bda64c7d63a599d61225f66c31442ac382ab577b1d05edf",
      "harnessSha256": "b3836d59e10366fdcefdd9fa4787a3d7a68304fb316ab2b22cdde53e11a3198a"
    },
    "lantern-shroom": {
      "runnerSha256": "1b066f555757d304634a633dcde2c6568ad69b9af5d96d35b511c44296809d45",
      "reportSha256": "e788aaf945c677a38fa09be6c881f05fa537f45bdd49cc19a447aedceeff5651",
      "harnessSha256": "c9b02d418c43f2224fb59395b128c3c67522197297945e56cc3ff37f940b92d7"
    },
    "garden-shuffle": {
      "runnerSha256": "8f37dea56f6160758559167aa86ad34565bd5df39677e2e68145b7c8f29d38c8",
      "reportSha256": "6d54017dc5a2e9f5091f747569df53d5f0c89921c4a20c901f40333dce5803b2",
      "harnessSha256": "9e06591927a1d872c72273f2db0bcbf549a16e38ffd5d491246c67d78977508d"
    },
    "seed-swap": {
      "runnerSha256": "d30276d0e53eba5c59bb9ead3b901e3c0a0dda1ef3da4c4afd6b78fc968d4610",
      "reportSha256": "c204d7e3a903961c1c05daa32477efe92dab3c2a3b1c857e8872a780dc1849b3",
      "harnessSha256": "ed8203c007359197f45d8847ce811ac2ef9b78243131b4c78eae2ea4f63c05be"
    },
    "mender-bloom": {
      "runnerSha256": "61c9ee9b0254e24e9dfe319e58fefb9dec85efe5759ff948b1dafb39e825af87",
      "reportSha256": "8c2658739c0bfd0a3fbb747e124cbdc5d01a178cec8428910c0ccd2dc727fc52",
      "harnessSha256": "276c6e8db99cb037fd8cc3f92122a3998d418905d454ec20fbbca0bf198c453c"
    },
    "intensive-care": {
      "runnerSha256": "3f99ba1f7cf3339b48407a3e0e06a6173f7524633cd64ebf7cb13a42cc2da267",
      "reportSha256": "f586999dd55851c7b16f252d40a51723c38a46cf4990dd010057fe71180f9c4a",
      "harnessSha256": "e6aff77f496f322966ec908c3929e8ea785a88b0fad072d65c696555f60803d4"
    },
    "native-layout": {
      "runnerSha256": "3def8434b1d20b482428ee64b7d23d83ae935449e8c2a38ec7da3f2cafe5f68b",
      "reportSha256": "1160b061deaa3a332fa15d330f8cf909b6e2db858f62f156a9131c478efc2f47",
      "harnessSha256": "6d7c38aa013b0b250d321d5bd6fc3f880e8f37d09f87e8abbd5fb1157ee1d774"
    },
    "care-fatigue": {
      "runnerSha256": "4a211b3423e151fd3e32bbab22683f9607791ab4b54841acf0568a9329c5a2bd",
      "reportSha256": "3392dfe53c047c0cc4f7176598583abaf9aceb63570c5d9605018f83c2898f00",
      "harnessSha256": "60b9b05a2437b088d08bd89ca393dc4ab00d107fc4c382927e2a36068ab92130"
    }
  },
  "summaryPath": "focused-v2-closure/summary.json",
  "summarySha256": "989e9d45cc2aae8e9bf0dfda0bda736d09c67e8617b1f5b2011af67f3856ac50",
  "originSummaries": {
    "focused-v2/summary.json": "0a79b3317fbf47852964d5ae1e196e19bfaabeb30b6690fca18d9a763e404981"
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
   'Every old source dependency stays bound, with exactly four new production inputs: '+name);
  for(const [input,pin]of Object.entries(result.sourceSha256)){
   safeName(input);assert(input.startsWith('source/'));digest(pin);assert.equal(sha(await read(input)),pin);
  }
  total+=result.checks;
 }
 assert.equal(total,58835);
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
 console.log('PASS Zombotany3 focused retention:58,834 exact published assertions plus1 catalog iteration; all13 current and silent.');
}
