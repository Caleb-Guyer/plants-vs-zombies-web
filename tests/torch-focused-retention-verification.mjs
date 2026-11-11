// SPDX-License-Identifier: MIT
// Authenticate all published Ambush focused cases and bounded Torch adapters.
import assert from 'node:assert/strict';

const PARENT_ARCHIVE = '6da0b6e19d56b3b345a684d379453abecff055a6d788cc17bd161f412bf3e7c9';
const PARENT_SNAPSHOT = '011d5162458ab4523ecee51048e9d2d70e7d98a6806f8b9efcc50cecd98e57a6';
const FOLDER = 'tests/torch1-focused-retention/';
const COUNTS = {'game-speed':81, 'qol-controls':90, 'decks-cooldowns':274,
  'bonus-challenge':394, 'bonus-completion':1379, 'night-shift':231,
  'lantern-shroom':1724, 'garden-shuffle':214, 'seed-swap':587,
  'mender-bloom':523, 'intensive-care':1135, 'native-layout':27157, 'care-fatigue':25042};
export const TORCH_FOCUSED_CHECK_EXTENSIONS = Object.freeze({'bonus-completion':1});
const NEW_SOURCES = ['TorchbearerZombie.h','TorchbearerZombie.cpp',
  'TorchbearerPresentation.h','TorchbearerPresentation.cpp','FireDrill.h','FireDrill.cpp',
  'FireDrillPresentation.h','FireDrillPresentation.cpp'].map(name=>'source/src/Lawn/System/'+name);

const REVIEWED_PINS = /* REVIEWED_TORCH_FOCUSED_PINS_BEGIN */ {
  "pendingFinalFreeze": false,
  "parentReportPinsSha256": "2b8975a164b343d1e0e2fa215e80cfd0aedf56c84128cff371d54d885ba98190",
  "compatibilityPatchesSha256": "5c8c9d885ca80e3301c8ff854cc331a489c724e5c9d48a4bba47f73aa00a761e",
  "normalBuildReceiptSha256": "983236d83833fc9e176cc808a44a44ed836e3e6b43e5ddea9254b5f619089c9f",
  "adapterSha256": "e211f7dc072b8f7e295d9bf8c765981774b8b30ecd8c3a25e3cb7eedd90e4db3",
  "adaptationsSha256": "83fba134dd9550040cd8ba16a3adbe5a32bb946c2707af56f51a2b7c9e7c7294",
  "runSha256": "b62b414af34ca10de508d6807853745f1ed40a05b641be303133a16cdbdb4268",
  "runners": {
    "game-speed": {
      "runnerSha256": "f31ba151161b1665d9b9815ab4b69a6cbb0cdbc215e5f2887161f8dbb8c186c4",
      "reportSha256": "a908cef2dd61b82a86f7bae3c6fafeffe79a4e1969d2f872877186f79b5929df",
      "harnessSha256": "0299e42113cdd9a96fdc9e4ac14cf68c6144f2c3660cf14f85bb224bb3a96b6b"
    },
    "qol-controls": {
      "runnerSha256": "fdb4b5dd3598d0a5e1345120920bbe333e10a6ef60c5df96ba952a0c21c25f08",
      "reportSha256": "3a9995149d29bbb5ad47d042722dca3ac05226457e69241097de64729d971de1",
      "harnessSha256": "26baff16227c83705bc47cc2a8afd8b8f84effa24589d2ab63024c3495527316"
    },
    "decks-cooldowns": {
      "runnerSha256": "3c1d950c1b4d3dcfa73afb3cde81872fcca9bc7a4d9ad2f9a2b0c896f49f9a4d",
      "reportSha256": "25ba7e5d60363853b202c65ecf307fedd6e7a8dbf38317d8e6ad724d4ca12980",
      "harnessSha256": "ae4ac355c15099c69e92d325562a4cb3a60046a052d481119d2f12a5cf6f72d5"
    },
    "bonus-challenge": {
      "runnerSha256": "6175108d366d75f403b34cc06694999e04fe104cddcef5b4a0f41fe653613016",
      "reportSha256": "d288a08c2aec3894bb63d214013475b26e64fde66fa3fe619320fba17d38af79",
      "harnessSha256": "c05faf5b8ac00ca1d51b2ff5160e5e1c6ceff4e307bf8f11c5983f1623c448ee"
    },
    "bonus-completion": {
      "runnerSha256": "0558b294d902aead66149e1b7429550fa2cc88c3e4dcd4ddbafc1df5aace0491",
      "reportSha256": "f66df5f97122cf902f50bc7a1b2ad04a0cf841dc893d68e0322bbf5e0d82f6fb",
      "harnessSha256": "b9302722542893a3671bd7a32932e0c475db4c033064f54f201e5d15c5787a2c"
    },
    "night-shift": {
      "runnerSha256": "98ff5cb4e99e019e585c20e58c92a1a1c6649fd759947d90177699cb1d420a16",
      "reportSha256": "cad29cd2c750416df107578842421f7c3cfb84bb510c96977ce31bcfa15a54bd",
      "harnessSha256": "d356678a0b1287ceb389ca1efee153ca0f5d436bc865bbf23621299d5a4c5eca"
    },
    "lantern-shroom": {
      "runnerSha256": "a3c6f2654d983950ae26f4bde7c5294f7dd73249070595c95be47717e0a1a00a",
      "reportSha256": "5487202db9189896454d3f254ac38b7918870a997162b8055618b83551e6207d",
      "harnessSha256": "98df92f3a2d2cbe7c47be078c1f7c13a075207c71943f3fe77df338ab8ea3f51"
    },
    "garden-shuffle": {
      "runnerSha256": "19c604c1a901d8051e72f3b749a97b8fc776395bfe4c4b6bb07641dd2c71f718",
      "reportSha256": "e3f3bf971e3d76fc04aba3b387521a0b8850b1488e305694bca21e1d7271d87e",
      "harnessSha256": "7364fe91a888ab3d607b533cf4a1fdba903ed5bf65172b008078c950a1e6d182"
    },
    "seed-swap": {
      "runnerSha256": "aa2976cced589eed33dbeb36d8e84fe817e1e2d642cf4c25d1ff0670af9ed6b3",
      "reportSha256": "40a2bb0b56bd5129fb935996deb5bae22dc756aa1e7e75993c97994a8a83b689",
      "harnessSha256": "7c710e098603b5297041f06b02744393c72d9b6e1b7ddd597248b877ffa8aafd"
    },
    "mender-bloom": {
      "runnerSha256": "cffc515a05ae5d272e2b3459db7fdd198a374a5e0541e68374475402e562879a",
      "reportSha256": "d1f69e755870b0a76b88c975e326b731fa67e086a95ca8cd25a7e7c01143e343",
      "harnessSha256": "61586146eb86ff29afcca868b8f65605d50f987a819e9cb98ea99e6fe3b3fba7"
    },
    "intensive-care": {
      "runnerSha256": "908450b72f655a533405db55b366c7db34c296d53e0009b8146a1fd308ced2da",
      "reportSha256": "9d6c10ada643f21332d25259128bc807d2fbebdfe2eda699b62cc8533e1fdfd5",
      "harnessSha256": "49061c2837c2332dbee1621915e9cba6ceff21cc7855381da7ca3eb01c21f7c8"
    },
    "native-layout": {
      "runnerSha256": "6ae19903c87119c2cbbfd2ececf2965784e17ca531155eba8e8079d771af25e4",
      "reportSha256": "34393b45a04e02611f7a742d7bc5214d8cc7f3a6e2c757affb947687e2de846a",
      "harnessSha256": "65dee1bfa588b387b9f8cb97af288d1da9c65b7daf916432594ab9b64ffe6289"
    },
    "care-fatigue": {
      "runnerSha256": "643a5c0b0ab336c4768acb7ec5a52f787a8510ca2996ce25e0a89207b52296bf",
      "reportSha256": "6101a901eb2feaf86bf3e99aa7e093580361b1f284636a46c9ec4d755bd6ccec",
      "harnessSha256": "60b9b05a2437b088d08bd89ca393dc4ab00d107fc4c382927e2a36068ab92130"
    }
  },
  "blocks": {},
  "summaryPath": "focused-hostscale-final/summary.json",
  "summarySha256": "0aed100367d0dc8be251926449a73122c5548816a0bedf26608db01c1b3ec447"
} /* REVIEWED_TORCH_FOCUSED_PINS_END */;

function once(text, before, after) {
  assert.equal(text.split(before).length,2,'Unique reviewed compatibility boundary');
  return text.replace(before,after);
}

// Independently reconstructed here: neither Python nor its patch JSON executes.
function compatibleRunner(original,name) {
  let text=original;
  if(name==='game-speed') {
    const token="ROOT / 'source/src/Lawn/System/VaseAmbushPresentation.cpp'";
    text=once(text,token,token+', '+NEW_SOURCES.map(name=>"ROOT / '"+name+"'").join(', '));
  } else {
    const line=text.match(/[^\n]*VaseAmbushPresentation\.cpp[^\n]*(?:\n|$)/g)
      ?.find(line=>line.includes('+='));
    assert(line,'Existing explicit source dependency line');
    const prefix=line.split('+=')[0]+'+= ';
    const paths=name==='native-layout'?NEW_SOURCES.map(path=>path.slice(7)):NEW_SOURCES;
    const array="['"+paths.join("', '")+"']";
    const addition=prefix+(line.includes('ROOT / name for name in')?'[ROOT / name for name in '+array+']':array)+'\n';
    text=once(text,line,line+addition);
  }
  text=text.replaceAll('NUM_GAME_MODES==90','NUM_GAME_MODES==91');
  text=text.replaceAll('static_cast<int>(GameMode::NUM_GAME_MODES)==90','static_cast<int>(GameMode::NUM_GAME_MODES)==91');
  if(name==='lantern-shroom') {
    const token='namespace VaseAmbushPresentation { Sexy::Image* GetBonusImage(){return nullptr;} }';
    text=once(text,token,token+'\nnamespace FireDrillPresentation { Sexy::Image* GetBonusImage(){return nullptr;} }');
  }
  if(name==='native-layout') {
    text=once(text,'assert len(raid_card_positions)==17 and','assert len(raid_card_positions)==18 and');
    const token="assert ambush_card_position==('4','1')";
    text=once(text,token,token+"\nassert raid_card_positions[17]==('4','2')");
    text=once(text,
      'Rect scaled(Rect r,int w,int h){double s=std::min(w/800.0,h/600.0);double ox=(w-800*s)/2,oy=(h-600*s)/2;int l=static_cast<int>(std::floor(ox+r.mX*s)),t=static_cast<int>(std::floor(oy+r.mY*s));return {l,t,static_cast<int>(std::ceil(ox+(r.mX+r.mWidth)*s))-l,static_cast<int>(std::ceil(oy+(r.mY+r.mHeight)*s))-t};}',
      `Rect scaled(Rect r,int w,int h){
 // Exact aspect-fit projection: native integer bounds and rational scale must
 // not acquire a negative top pixel from host FMA cancellation at 1.28/1.8.
 const long long n=static_cast<long long>(w)*600<=static_cast<long long>(h)*800?w:h;
 const long long d=static_cast<long long>(w)*600<=static_cast<long long>(h)*800?800:600;
 const long long divisor=2*d,ox=static_cast<long long>(w)*d-800*n,oy=static_cast<long long>(h)*d-600*n;
 auto floorDiv=[&](long long value){return value/divisor-(value%divisor<0);};
 auto ceilDiv=[&](long long value){return value/divisor+(value%divisor>0);};
 const int l=static_cast<int>(floorDiv(ox+2*static_cast<long long>(r.mX)*n));
 const int t=static_cast<int>(floorDiv(oy+2*static_cast<long long>(r.mY)*n));
 return {l,t,static_cast<int>(ceilDiv(ox+2*(static_cast<long long>(r.mX)+r.mWidth)*n))-l,
  static_cast<int>(ceilDiv(oy+2*(static_cast<long long>(r.mY)+r.mHeight)*n))-t};
}`);
  }
  if(name==='bonus-completion') {
    text=once(text,'ambushRetainedChecks==1303','ambushRetainedChecks==1304');
    text=once(text,'all1302 parent cases plus the appended catalog entry execute before Vase coverage',
      'all1302 parent cases plus two appended catalog iterations execute before Vase coverage');
    text=once(text,'GAMEMODE_CHALLENGE_VASE_AMBUSH==89&&NUM_CHALLENGE_MODES==89',
      'GAMEMODE_CHALLENGE_VASE_AMBUSH==89&&NUM_CHALLENGE_MODES==90');
  }
  if(name==='bonus-challenge') {
    const token='struct Plant {App* mApp;Board* mBoard;Zombie* target=nullptr;SeedType mSeedType=SEED_WALLNUT;';
    const collaborator='namespace TorchbearerZombie {bool IsZombie(const Zombie& zombie){return zombie.mZombieType==ZOMBIE_TORCHBEARER;}void Extinguish(Zombie&){assert(false&&"Torch extinction is covered by its complete-engine suite");}}\n';
    text=once(text,token,collaborator+token);
  }
  return Buffer.from(text);
}

function applyEdits(original,edits) {
  assert(Array.isArray(edits));
  let bytes=Buffer.from(original),previous=bytes.length+1;
  for(const edit of [...edits].reverse()) {
    const before=Buffer.from(edit.beforeBase64,'base64'),after=Buffer.from(edit.afterBase64,'base64');
    assert.equal(before.toString('base64'),edit.beforeBase64);
    assert.equal(after.toString('base64'),edit.afterBase64);
    assert(Number.isSafeInteger(edit.offset)&&edit.offset>=0&&edit.offset<previous);
    assert(edit.offset+before.length<=previous&&edit.offset+before.length<=bytes.length);
    assert.deepEqual(bytes.subarray(edit.offset,edit.offset+before.length),before);
    bytes=Buffer.concat([bytes.subarray(0,edit.offset),after,bytes.subarray(edit.offset+before.length)]);
    previous=edit.offset;
  }
  return bytes;
}
const safeName=name=>assert(typeof name==='string'&&name&&!name.startsWith('/')&&
  !/[\\:]/.test(name)&&!name.split('/').some(part=>!part||part==='.'||part==='..'));

export async function verifyTorchFocusedRetention({read,sha,engine,reports}) {
  assert.equal(REVIEWED_PINS.pendingFinalFreeze,false,'Torch focused evidence is not frozen');
  assert.equal(engine.id,'0.2.6-web-torch.1');
  assert.equal(engine.parent.id,'0.2.6-web-ambush.1');
  assert.equal(engine.parent.artifacts.sourceSha256,PARENT_ARCHIVE);
  assert(reports instanceof Map);
  const snapshotBytes=await read('tests/torch1-retained-parent/manifest.json');
  assert.equal(sha(snapshotBytes),PARENT_SNAPSHOT);
  const snapshot=JSON.parse(snapshotBytes);
  assert.equal(snapshot.parentArchiveSha256,PARENT_ARCHIVE);
  assert.equal(Object.keys(snapshot.files).length,166);
  const parentPinsBytes=await read(FOLDER+'parent-report-pins.json');
  assert.equal(sha(parentPinsBytes),REVIEWED_PINS.parentReportPinsSha256);
  const parentPins=JSON.parse(parentPinsBytes);
  assert.equal(parentPins.parentArchiveSha256,PARENT_ARCHIVE);
  assert.deepEqual(Object.keys(parentPins.reports).sort(),Object.keys(COUNTS).sort());
  const adaptationBytes=await read(FOLDER+'adaptations.json');
  assert.equal(sha(adaptationBytes),REVIEWED_PINS.adaptationsSha256);
  assert.equal(sha(await read(FOLDER+'adapter.py')),REVIEWED_PINS.adapterSha256);
  assert.equal(sha(await read(FOLDER+'run.py')),REVIEWED_PINS.runSha256);
  const patchBytes=await read(FOLDER+'compatibility-patches.json');
  assert.equal(sha(patchBytes),REVIEWED_PINS.compatibilityPatchesSha256);
  const patches=JSON.parse(patchBytes),adaptation=JSON.parse(adaptationBytes);
  assert.equal(adaptation.engineId,engine.id); assert.equal(adaptation.parentEngineId,engine.parent.id);
  assert.equal(adaptation.parentArchiveSha256,PARENT_ARCHIVE);
  assert.equal(adaptation.parentSnapshotSha256,PARENT_SNAPSHOT);
  assert.equal(adaptation.parentReportPinsSha256,sha(parentPinsBytes));
  assert.equal(adaptation.compatibilityPatchesSha256,sha(patchBytes));
  assert.equal(adaptation.retainedCheckTotal,58831);
  assert.deepEqual(adaptation.checkExtensions,TORCH_FOCUSED_CHECK_EXTENSIONS);
  assert.deepEqual(Object.keys(adaptation.runners).sort(),Object.keys(COUNTS).sort());
  assert.deepEqual(Object.keys(patches.runners).sort(),Object.keys(COUNTS).sort());
  let retained=0,total=0;
  for(const [name,count] of Object.entries(COUNTS)) {
    const record=adaptation.runners[name],reviewed=REVIEWED_PINS.runners[name];
    const runnerName='test-'+name+'.py';
    assert.equal(record.runner,runnerName);
    assert.equal(record.originalSnapshot,'torch1-retained-parent/'+runnerName);
    const original=await read('tests/'+record.originalSnapshot),originalPin=snapshot.files[runnerName];
    assert.equal(original.length,originalPin.bytes); assert.equal(sha(original),originalPin.sha256);
    assert.equal(record.originalBytes,original.length); assert.equal(record.originalSha256,sha(original));
    const oldReport=await read(FOLDER+'parent-reports/'+name+'-results.json'),oldPin=parentPins.reports[name];
    assert.equal(oldPin.publishedArchivePath,'ambush1-candidate/tests/'+name+'-results.json');
    assert.equal(oldReport.length,oldPin.bytes); assert.equal(sha(oldReport),oldPin.sha256);
    assert.equal(record.parentReportSha256,sha(oldReport));
    const parentResult=JSON.parse(oldReport);
    assert.equal(parentResult.checks,count); assert.equal(oldPin.checks,count);
    assert.equal(parentResult.failures,0); assert.equal(parentResult.exitCode,0); assert.match(parentResult.status,/^PASS /);
    const expected=compatibleRunner(original.toString('utf8'),name);
    assert.deepEqual(applyEdits(original,record.compatibilityEdits),expected,
      'Only independently reviewed compatibility changes preserve every old case: '+name);
    let patched=original.toString('utf8');
    for(const operation of patches.runners[name]) {
      assert(operation.before&&Number.isSafeInteger(operation.count)&&operation.count>0);
      assert.equal(patched.split(operation.before).length-1,operation.count);
      patched=patched.replaceAll(operation.before,operation.after);
    }
    assert.deepEqual(Buffer.from(patched),expected,'Python patch recipe agrees with independent JS whitelist');
    assert.deepEqual(record.compatibilityReasons,patches.runners[name].map(row=>row.reason));
    assert.deepEqual(record.appendedEdits,[]); assert.deepEqual(record.newCaseInputs,[]);
    assert.equal(record.baselineChecks,count);
    assert.equal(record.appendedChecks,TORCH_FOCUSED_CHECK_EXTENSIONS[name]||0);
    const runner=await read('tests/'+runnerName);
    assert.deepEqual(runner,expected); assert.equal(sha(runner),record.runnerSha256);
    assert.equal(sha(runner),reviewed.runnerSha256);
    const reportBytes=await read('tests/'+name+'-results.json');
    assert.equal(sha(reportBytes),reviewed.reportSha256);
    const result=reports.get(name); assert.deepEqual(result,JSON.parse(reportBytes));
    assert.match(result.status,/^PASS /); assert.equal(result.failures,0); assert.equal(result.exitCode,0);
    assert.equal(result.checks,count+(TORCH_FOCUSED_CHECK_EXTENSIONS[name]||0));
    const harness=await read('tests/'+name+'-harness.cpp');
    assert.equal(sha(harness),reviewed.harnessSha256); assert.equal(sha(harness),result.generatedHarnessSha256);
    for(const input of NEW_SOURCES) assert(Object.hasOwn(result.sourceSha256,input));
    for(const [input,pin] of Object.entries(result.sourceSha256)) {
      safeName(input); assert(input.startsWith('source/'));
      assert.equal(sha(await read(input)),pin,'Current focused dependency: '+name+'/'+input);
    }
    retained+=count; total+=result.checks;
  }
  assert.equal(retained,58831); assert.equal(total,58832);
  const layout=reports.get('native-layout');
  assert.equal(layout.rallyAlmanacChecks,760); assert.equal(layout.rallyAlmanacWindows,27);
  assert.equal(layout.scrapRetainedChecks,26138); assert.equal(layout.scrapLayoutChecks,333);
  assert.equal(layout.ambushRetainedChecks,26471); assert.equal(layout.ambushLayoutChecks,686);
  assert.equal(sha(await read('logs/build-result.json')),REVIEWED_PINS.normalBuildReceiptSha256);
  safeName(REVIEWED_PINS.summaryPath);
  const summaryBytes=await read(FOLDER+REVIEWED_PINS.summaryPath);
  assert.equal(sha(summaryBytes),REVIEWED_PINS.summarySha256);
  const summary=JSON.parse(summaryBytes);
  assert.equal(summary.status,'PASS'); assert.equal(summary.audioInitialized,false);
  assert.equal(summary.execution,'focused-production-methods-with-controlled-collaborators');
  assert.deepEqual(summary.selected,Object.keys(COUNTS)); assert.deepEqual(summary.staleReports,[]);
  assert.equal(summary.checks,total); assert.deepEqual(summary.runners.map(row=>row.name),Object.keys(COUNTS));
  for(const row of summary.runners) {
    assert.equal(row.status,'PASS'); assert.equal(row.exitCode,0); assert.equal(row.runnerUnchangedDuringRun,true);
    assert.equal(row.runnerSha256,REVIEWED_PINS.runners[row.name].runnerSha256);
    assert.equal(row.reportSha256,REVIEWED_PINS.runners[row.name].reportSha256);
    assert.equal(row.checks,reports.get(row.name).checks);
    safeName(row.log); assert(row.log.startsWith('torch1-focused-retention/'));
    assert.equal(sha(await read('tests/'+row.log)),row.logSha256);
  }
  console.log('PASS Torch focused retention:58,831 exact published assertions plus1 separately counted native catalog iteration; all13 suites current and silent.');
}
