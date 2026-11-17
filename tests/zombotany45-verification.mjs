// SPDX-License-Identifier: MIT
// Independent native Fog4/Roof5 acceptance. Synthetic controls cannot earn wins.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {CURRENT_ENGINE_ID,CURRENT_SOURCE_COUNT,CURRENT_OBJECT_COUNT,CURRENT_NORMAL_RECEIPT_SHA256,zsurvivalParentSourceReader} from './native-release-context.mjs';
import {verifyZombotany3PlantHeadRoster} from './zombotany3-verification.mjs';
import {FAMILY_FIX_INPUTS,verifyZombotanyFamilyFixes} from './zombotany-family-fixes-verification.mjs';
const vendor={exports:{}};
new Function('module','exports','require',fs.readFileSync(new URL('../dist/vendor/jszip.min.js',import.meta.url),'utf8'))(vendor,vendor.exports,createRequire(import.meta.url));
const Zip=vendor.exports;

// ROOT seals these only after reviewing the real final56 execution. A CI rerun
// may vary raw log hashes; all other canonical native observations stay fixed.
// Published45.1 observations remain historical. The final45.2 current56 run
// and separate renderer/compatibility proof were independently reviewed.
const acceptedContractPins=new Set(['3f3c8f6e8495ec7f6021a244981f523fd99ec8d06714d187695646147e56a310']);
const acceptedReportPins=new Set(['0743dfa37842d4e0e6b199e9e26279e9ac4b8f8cf5d7ed394f58d415cb9ba46a']);
const acceptedReportContentPins=new Set(['770518a16e3e206740025ae1a0b1f83f6f77aff99e4758eb96598b38a15ba406']);
const acceptedPrerequisitePins=new Set(['80570015aaa34160568aa38a068fd6c7c5a14b6b4df040f0a901206e0e363f8c']);
const ENGINE='0.2.6-web-zsurvival.1';
const NORMAL=CURRENT_NORMAL_RECEIPT_SHA256;
const PREREQUISITE_ENGINE='0.2.6-web-zombotany45.1';
const PREREQUISITE_NORMAL='721a1d47b75566e042bf7bd69dc3e34dc8c7cd69fe7a00eb4455f662defaef3b';
const names=['normal','hesitation','save-attack','retry','replay','no-action','controls'];
export const ZOMBOTANY45_MATRIX=[94,95].flatMap(mode=>[1729,7331].flatMap(seed=>names.flatMap(name=>[1,2].map(speed=>[mode,name,speed,seed]))));
const identity=row=>[row.mode,row.name,row.speed,row.seed].join('/');
const text=b=>Buffer.from(b).toString('utf8').replace(/\r\n?/g,'\n');
const json=b=>JSON.parse(text(b).replace(/^\uFEFF/,''));
const fields=(actual,expected)=>{for(const [key,value]of Object.entries(expected))assert.deepEqual(actual[key],value,key);};
const integer=(value,min=0,max=Number.MAX_SAFE_INTEGER)=>assert(Number.isSafeInteger(value)&&value>=min&&value<=max);
const digest=value=>assert(typeof value==='string'&&/^[a-f0-9]{64}$/.test(value));
const safe=name=>{assert(typeof name==='string'&&name&&!name.startsWith('/')&&!/[\\:\x00-\x1f]/.test(name));assert(name.split('/').every(p=>p&&p!=='.'&&p!=='..'));return name;};
const canonical=value=>Array.isArray(value)?value.map(canonical):value!==null&&typeof value==='object'?
 Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
const fogWaves=[[1,0,0,0,0],[1,0,0,1,0],[1,1,0,1,0],[2,0,1,1,0],[2,1,0,1,0],
 [2,1,1,1,0],[2,1,1,2,0],[3,1,1,2,0],[3,2,1,2,0],[3,2,1,2,1],
 [3,2,1,2,0],[3,2,1,2,0],[3,2,2,2,0],[3,2,2,3,0],[3,2,2,3,1],
 [3,3,2,3,0],[3,3,2,3,0],[3,3,2,3,1],[3,3,2,3,1],[4,3,2,3,1]];
const roofWaves=[[1,0,0,0],[2,0,0,0],[1,1,0,0],[2,1,0,0],[2,1,0,0],
 [2,1,0,0],[3,1,0,0],[3,1,0,0],[3,1,1,0],[3,2,1,0],
 [3,2,1,0],[3,2,1,0],[3,2,1,1],[3,2,1,0],[4,2,1,0],
 [4,2,1,0],[4,2,1,1],[4,3,1,0],[4,3,1,1],[4,3,2,1]];
const ledger=(mode,{historical=false}={})=>(mode===94?fogWaves:roofWaves).map((counts,wave)=>{
 const types=mode===94?[35,36,26,38,27]:[39,40,41,31],out=counts.map((n,i)=>[types[i],n]).filter(([,n])=>n);
 if((wave+1)%10===0){const flag=historical?1:mode===94?35:39,existing=out.find(([type])=>type===flag);if(existing)existing[1]++;else out.push([flag,1]);}
 return out.sort((a,b)=>a[0]-b[0]);
});
const emptyLedger=Array.from({length:20},()=>[]);
const stats={bodyHealth:270,seaRange:180,seaDamage:20,seaCadence:150,seaWindup:35,seaLifetime:60,
 cabbageRange:520,cabbageDamage:40,cabbageCadence:250,cabbageWindup:55,kernelRange:480,kernelDamage:20,
 butterDamage:40,kernelCadence:240,kernelWindup:55,kernelButterChance:4,melonRange:560,melonDamage:80,
 melonSplashDamage:26,melonCadence:330,melonWindup:65,lobMinimumRange:100,lobFlightTicks:80,
 umbrellaAnticipationTicks:20,butterTicks:150,hostilePuffMarker:-303,hostileLobMarker:-405,friendlyLobMarker:-406};
const course={waves:20,openingDelay:1800,startingSun:50,nativeSeedChooser:true,conveyor:false,
 fog:{mode:94,profileIndex:93,rows:6,waterRows:[2,3],authoredZombies:156},
 roof:{mode:95,profileIndex:94,rows:5,nativeStartingPots:15,authoredZombies:109}};
const expectedInputs=['zombotany45-harness.cpp','zombotany45-policy.h','zombotany45-verification-contract.json',
 'zombotany45-controls.h','zombotany45-battles.h','test-zombotany45.py','zombotany45-native-art-inputs.json',
 'zombotany45-assets.json','test-pool-panic.py','zombotany45-initial-plan.json','zombotany45-presentation-controls.h',
 'zombotany45-earned-z3-fixture.json','zombotany45-earned-z3/userdata/user1.dat','zombotany45-earned-z3/userdata/users.dat',
 'zombotany45-earned-z4-fixture.json','zombotany45-earned-z4/userdata/user1.dat','zombotany45-earned-z4/userdata/users.dat',
 'zombotany45-earned-z4-origin/result.json','zombotany45-earned-z4-origin/save-attack.log',
 'zombotany45-earned-z4-origin/build.json','zombotany45-earned-z4-origin/inputs.zip',...FAMILY_FIX_INPUTS];
// Byte pins independently extracted from the actual published .2 source ZIP
// 9e418637...: all eight saved layouts/serializers and the four existing3 files.
const legacySources={
 'src/Lawn/Plant.h':'2d0a52b08c8a41936e8ec7ea87509b2791e93b739bd319c4f4e9fc8eb87b3887',
 'src/Lawn/Zombie.h':'1bca96cf615ec7d2268ef2c0b79093295b0e6aab15ee93a4c319a82f6536d835',
 'src/Lawn/Board.h':'cfde9658f8b1f067a66ceb1fb0712bdfad9aaa745eae0e1079d95678ea847e26',
 'src/Lawn/Challenge.h':'6fcde9bd2ed500b7355737b0ca1febce8ac5a32728e07d0a4590f7828413bde0',
 'src/LawnApp.h':'4455c08c3d98b32ac1be71fe94e6c92397087c1c0d63b23e1d483f4889ba9b20',
 'src/Lawn/System/SaveGame.cpp':'1deb4fe9a316ddaa1473839c70bc7c0720cc32e2df7a8346be7d5f87901eb261',
 'src/Lawn/System/PlayerInfo.cpp':'b148f5b2b12db9e4fb651d4e9f07192b4434e4744230fe478edc18803d91fe02',
 'src/Lawn/System/PlayerInfo.h':'98e524a2a8ed093bcba54a2b27d5fd39da360408fdaaebe08d130c5f53af13fd',
 'src/Lawn/System/Zombotany3.cpp':'7112b10a8d4ef31f850f61a29653621ea7ad1ce3cb2263bf8054c0f1c3f81c2f',
 'src/Lawn/System/Zombotany3Art.h':'da13426bf53399b6c1a266feb773bd8b8ea5706134829688ffeabc517223478d',
 'src/Lawn/System/Zombotany3Art.cpp':'0059d09d9cb691b86ccbf273d28fd350051553b3dbd3cd0e4241ca75d87146ec'};

export function verifyZombotany45ReportIdentity({reportBytes,sha}){
 const report=json(reportBytes);assert(Array.isArray(report.scenarios));
 verifyZombotany45Matrix(report);
 const scenarios=report.scenarios.map(row=>{digest(row.logSha256);const{logSha256,...native}=row;return native;});
 assert(acceptedReportContentPins.has(sha(Buffer.from(JSON.stringify(canonical({...report,scenarios}))))),
  'No independently reviewed actual final56 Zombotany4/5 matrix is accepted yet');
 return {report,sealedReport:acceptedReportPins.has(sha(reportBytes))};
}

const PUBLISHED_POLICY_SHA256='0e84c76fd9ee68bcef7943ee91aacc46c4cc44bc77bad5b3beff929b41613b84';
const REVIEWED_POLICY_SHA256='1fac33b8fe17feaaa9627f240c317c7a9460e7c3ea0e33c780389ce874ea139e';
const REVIEWED_POLICY_BEFORE='e.type==ZOMBIE_TALLNUT_HEAD&&e.x<360';
const REVIEWED_POLICY_AFTER='e.type==ZOMBIE_TALLNUT_HEAD&&e.x<520';
export function verifyZombotany45PlayerPolicy({policyBytes,sha}){
 const policy=text(policyBytes);
 assert.equal(sha(Buffer.from(policy)),REVIEWED_POLICY_SHA256,'Only the independently reviewed Tall-nut response change is accepted');
 assert.equal(policy.split(REVIEWED_POLICY_AFTER).length,2,'Exactly one visible Tall-nut Cherry predicate changed');
 assert(!policy.includes(REVIEWED_POLICY_BEFORE));
 const original=policy.replace(REVIEWED_POLICY_AFTER,REVIEWED_POLICY_BEFORE);
 assert.equal(sha(Buffer.from(original)),PUBLISHED_POLICY_SHA256,
  'Reversing the one reviewed predicate must recover every published45.1 player byte, including all Fog choices and costs/cadence');
 return {policySha256:REVIEWED_POLICY_SHA256,publishedPolicySha256:PUBLISHED_POLICY_SHA256,reviewedReplacements:1};
}

export async function verifyZombotany45SourceBounds({read,sha,engine}){
 assert.equal(CURRENT_ENGINE_ID,ENGINE);assert.equal(CURRENT_SOURCE_COUNT,888);assert.equal(CURRENT_OBJECT_COUNT,152);
 const sourceParent=await zsurvivalParentSourceReader({read,sha,engine});read=sourceParent.read;
 for(const[path,pin]of Object.entries(legacySources))assert.equal(sha(await read('source/'+path)),pin,'Prior saved ABI/native3 bytes: '+path);
 verifyZombotany3PlantHeadRoster({header:await read('source/src/Lawn/System/Zombotany3.h'),sha});
 let enums=text(await read('source/src/ConstEnums.h'));
 for(const line of ['\tGAMEMODE_CHALLENGE_ZOMBOTANY_4 = 94,\n','\tGAMEMODE_CHALLENGE_ZOMBOTANY_5 = 95,\n',
  '\tZOMBIE_SEA_HEAD,\n','\tZOMBIE_CABBAGE_HEAD,\n','\tZOMBIE_KERNEL_HEAD,\n','\tZOMBIE_MELON_HEAD,\n']){
  assert.equal(enums.split(line).length,2);enums=enums.replace(line,'');
 }
 assert.equal(enums.split('\tNUM_GAME_MODES = 96').length,2);enums=enums.replace('\tNUM_GAME_MODES = 96','\tNUM_GAME_MODES = 94');
 assert.equal(sha(Buffer.from(enums)),'5a845f32795899196efadd7222dc50bb2d4ca6fbc933b53f3569f1e43c1cd1fb','Only appended stable mode/head IDs differ from published .2');
 const header=text(await read('source/src/Lawn/System/Zombotany45.h'));
 const headerConstants={kFogProfileIndex:93,kRoofProfileIndex:94,kRulesVersion:1,kWaveCount:20,kWavesPerFlag:10,
  kStartingSun:50,kOpeningDelay:1800,kRoofStartingPots:15,kSeaRange:180,kSeaDamage:20,kSeaCadence:150,kSeaWindup:35,kSeaLifetime:60,
  kCabbageRange:520,kCabbageCadence:250,kCabbageWindup:55,kCabbageDamage:40,kKernelRange:480,kKernelCadence:240,kKernelWindup:55,
  kKernelDamage:20,kButterDamage:40,kButterTicks:150,kButterChance:4,kMelonRange:560,kMelonCadence:330,kMelonWindup:65,
  kMelonDamage:80,kMelonSplashDamage:26,kLobMinimumRange:100,kLobFlightTicks:80,kUmbrellaAnticipationTicks:20,kHostileLobMarker:-405,kFriendlyLobMarker:-406};
 for(const[name,value]of Object.entries(headerConstants))assert(header.includes(`${name} = ${value};`),name);
 assert(header.includes('kActive = static_cast<ChallengeState>(148)'));
 for(const[name,expected,width]of [['kFogWaves',fogWaves,5],['kRoofWaves',roofWaves,4]]){
  const body=header.match(new RegExp(name+'\\s*=\\s*\\{\\{([\\s\\S]*?)\\}\\};'));assert(body);
  assert.deepEqual([...body[1].matchAll(/\{([\d,]+)\}/g)].map(m=>m[1].split(',').map(Number)),expected);
  assert(expected.every(row=>row.length===width));
 }
 assert(header.includes('if((wave+1)%10==0)output[wave][index++]=IsFog(mode)?ZOMBIE_PUFF_HEAD:ZOMBIE_CABBAGE_HEAD;'));
 assert(!header.includes('ZOMBIE_FLAG'),'New authored flag waves and allowlists contain plant heads only');
 const implementation=text(await read('source/src/Lawn/System/Zombotany45.cpp'));
 for(const exact of ['Zombotany45Art::GetMouthPosition(zombie','static_cast<int>(x)-13,static_cast<int>(y)-13',
  'zombie.mMindControlled?9:Zombotany3::kHostilePuffMarker','zombie.mBossMode==1?PROJECTILE_BUTTER:PROJECTILE_KERNEL',
  'p->mMotionType=MOTION_LOBBED','kLobFlightTicks','p.mProjectileAge>=kLobFlightTicks-kUmbrellaAnticipationTicks',
  'challenge.mBeghouledEated[plant.mPlantCol][plant.mRow]','plant.mBoard->mMainCounter+kButterTicks',
  'if(IsButtered(plant))return','target->mRow!=source.mRow','zombie.mBossBungeeCounter=Windup(zombie.mZombieType)',
  'zombie.mBossMode=zombie.mZombieType==ZOMBIE_KERNEL_HEAD && Rand(kButterChance)==0?1:0'])assert(implementation.includes(exact),exact);
 assert(!/zombie\.(?:mBodyHealth|mBodyMaxHealth|mHelmHealth|mShieldHealth|mVelX|mBossStompCounter|mBossHeadCounter)\s*(?:[+*/-]=|=(?!=))/.test(implementation),'Native carrier stats and Gust fields must remain separate');
 assert(!implementation.includes('board.AddPlant(0,row,SEED_FLOWERPOT'),'Original native roof intro supplies its own three pot columns');
 const art=text(await read('source/src/Lawn/System/Zombotany45Art.cpp'));
 for(const exact of ['void PlaceHead(Reanimation& carrier, Reanimation& head, ZombieType type)',
  'head.mOverlayMatrix = attachment * HeadTransform(type);',
  'carrier.GetTrackMatrix(carrier.FindTrackIndex("Zombie_neck"), neck);',
  'head.GetTrackMatrix(head.FindTrackIndex("anim_face"), face);',
  'neck.m02 + neck.m00 * 3.0f - neck.m01 * 6.5f',
  'neck.m12 + neck.m10 * 3.0f - neck.m11 * 6.5f',
  'face.m02 + face.m00 * 1.0f + face.m01 * 11.5f',
  'face.m12 + face.m10 * 1.0f + face.m11 * 11.5f',
  'head.mOverlayMatrix.m02 += neckX - faceX;','head.mOverlayMatrix.m12 += neckY - faceY;',
  'PlaceHead(carrier, head, type);','PlaceHead(*carrier, *head, zombie.mZombieType);'])assert(art.includes(exact),exact);
 assert(art.indexOf('head.mOverlayMatrix = attachment * HeadTransform(type);')<art.indexOf('head.mOverlayMatrix.m02 += neckX - faceX;'),
  'The current Sea pose is rebuilt from the native base before correction, avoiding incremental drift');
 const zombieSource=text(await read('source/src/Lawn/Zombie.cpp'));
 assert(zombieSource.includes('aBodyReanim->Update();\n    Zombotany45Art::UpdateHeadAnchor(*this);'));
 const board=text(await read('source/src/Lawn/Board.cpp'));
 for(const exact of ['Zombotany45::RestorePlantHeadOnly(*this);',
  'theZombieType = Zombotany45::PlantHeadForSpawn(mApp->mGameMode, theZombieType, theRow);',
  'theZombieType = Zombotany45::PlantHeadForSpawn(mApp->mGameMode, theZombieType);'])assert(board.includes(exact),exact);
 const graves=board.match(/void Board::SpawnZombiesFromGraves\(\)\s*\{([^]*?)\n\}/);assert(graves);
 assert(graves[1].includes('Zombotany3::IsMode(mApp->mGameMode) || Zombotany45::IsMode(mApp->mGameMode)'));
 const spawning=board.match(/void Board::UpdateZombieSpawning\(\)\s*\{([^]*?)\n\}/);assert(spawning);
 const completion='if (Zombotany45::IsFamilyMode(mApp->mGameMode) && mApp->mGameScene == SCENE_PLAYING &&\n'+
  '        !mPaused && mTimeStopCounter <= 0 && !mLevelComplete && mNumWaves > 0 &&\n'+
  '        mCurrentWave >= mNumWaves && mRiseFromGraveCounter <= 0 && !AreEnemyZombiesOnScreen())\n'+
  '    {\n        mChallenge->SpawnLevelAward(4, 2);\n        return;\n    }';
 assert.equal(spawning[1].split(completion).length,2,
  'Sanitized legacy completion requires an active, unpaused, unstopped, unfinished final wave with no pending grave spawn or enemy');
 assert(spawning[1].indexOf('if (HasLevelAwardDropped())')<spawning[1].indexOf(completion)&&spawning[1].indexOf('if (HasLevelAwardDropped())')>=0,
  'The existing native award guard prevents repeated completion awards');
 for(const exact of ['if(!IsFamilyMode(mode) || type<ZOMBIE_NORMAL || type>=NUM_ZOMBIE_TYPES || Zombie::IsZombotany(type))return type;',
  'if(IsRoof(mode))return ZOMBIE_CABBAGE_HEAD;',
  'if(IsFog(mode))return row==2 || row==3?ZOMBIE_SEA_HEAD:ZOMBIE_PUFF_HEAD;',
  'return Zombotany3::IsMode(mode)?ZOMBIE_PUFF_HEAD:ZOMBIE_PEA_HEAD;',
  'for(auto& wave:board.mZombiesInWave)for(auto& type:wave)type=PlantHeadForSpawn(mode,type);',
  'if(zombie->mZombieType==ZOMBIE_SEA_HEAD)Zombotany45Art::UpdateHeadAnchor(*zombie);'])assert(implementation.includes(exact),exact);
 const restore=implementation.match(/void RestorePlantHeadOnly\(Board& board\)\s*\{([^]*?)\n\}\nvoid Populate\(/);assert(restore);
 const firstOverlay='if((zombie->mZombieType==ZOMBIE_PEA_HEAD || zombie->mZombieType==ZOMBIE_PUFF_HEAD) &&\n'+
  '                    gEffectSystem && gEffectSystem->mAttachmentHolder)';
 assert.equal(restore[1].split(firstOverlay).length,2,'Only newly converted native Pea/Puff heads need their initial attachment overlay seeded');
 for(const exact of ['auto* track=body->GetTrackInstanceByName("anim_head1");',
  'gEffectSystem->mAttachmentHolder->mAttachments.DataArrayTryToGet(static_cast<unsigned int>(track->mAttachmentID))',
  'for(int i=0;i<attachment->mNumEffects;++i)',
  'const AttachEffect& effect=attachment->mEffectArray[i];',
  'if(effect.mEffectType!=EffectType::EFFECT_REANIM ||\n'+
   '                                effect.mEffectID!=static_cast<unsigned int>(zombie->mSpecialHeadReanimID))continue;',
  'body->GetAttachmentOverlayMatrix(body->FindTrackIndex("anim_head1"),parent);',
  'head->mOverlayMatrix=parent*effect.mOffset;\n                            break;'])
  assert(restore[1].includes(exact),'First Continue draw must use the matching native attached head and its actual offset: '+exact);
 assert(!/(?:head|body)->(?:Update|UpdateReanim)\s*\(|(?:AttachmentUpdate|ReanimationUpdateTransform)\s*\(/.test(restore[1]),
  'Legacy first-render attachment seeding cannot advance body, head or attachment clocks');
 assert(!/(?:head|body)->(?:mAnimTime|mLastFrameTime)\s*(?:[+*/-]=|=(?!=)|\+\+|--)/.test(restore[1]),
  'Legacy first-render attachment seeding cannot rewrite the saved animation clocks');
 const specs=[...art.matchAll(/case ZOMBIE_(SEA|CABBAGE|KERNEL|MELON)_HEAD: return \{(REANIM_\w+), ([\d.]+)f, (-?[\d.]+)f, ([\d.]+)f\};/g)]
  .map(m=>[m[1],m[2],...m.slice(3).map(Number)]);
 assert.deepEqual(specs,[['SEA','REANIM_SEASHROOM',69,-34,1],['CABBAGE','REANIM_CABBAGEPULT',65,-21,.82],
  ['KERNEL','REANIM_KERNELPULT',64,-25,.78],['MELON','REANIM_MELONPULT',65,-19,.78]]);
 for(const exact of ['AttachReanim(track->mAttachmentID, head, 0, 0)','attachment->mOffset = HeadTransform(zombie.mZombieType)',
  'GetAttachmentOverlayMatrix','head->GetTrackMatrix(index, mouth)','head->mOverlayMatrix = previous','head->mAnimTime = previousTime',
  'IMAGE_REANIM_CORNPULT_BUTTER_SPLAT','IMAGE_BACKGROUND4','IMAGE_BACKGROUND5','MakeCachedZombieFrame(ZOMBIE_SEA_HEAD)',
  'MakeCachedZombieFrame(ZOMBIE_PEA_HEAD)','MakeCachedZombieFrame(ZOMBIE_CABBAGE_HEAD)','MakeCachedZombieFrame(ZOMBIE_KERNEL_HEAD)',
  'MakeCachedZombieFrame(ZOMBIE_MELON_HEAD)','Blank(80, 65)'])assert(art.includes(exact),exact);
 const screen=text(await read('source/src/Lawn/Widget/ChallengeScreen.cpp'));
 const definitions=screen.match(/constinit const ChallengeDefinition gChallengeDefs[^]*?\n\};/);assert(definitions);
 const rows=definitions[0].split('\n').filter(line=>line.includes('.mChallengeMode =')).map(line=>line.replace(/,?\s*$/,''));assert.equal(rows.length,95);
 assert.equal(sha(Buffer.from(rows.slice(0,93).join('\n'))),'5699315113b2178723fb4f60a952407c6d2521be51b05e8d9d66eb33b5905037','All prior93 native definitions remain exact');
 for(const[index,mode,col]of [[93,4,3],[94,5,4]])assert(rows[index].includes('GAMEMODE_CHALLENGE_ZOMBOTANY_'+mode)&&rows[index].includes('CHALLENGE_PAGE_ZOMBOTANY')&&rows[index].includes('.mCol = '+col));
 for(const exact of ['mPageIndex == CHALLENGE_PAGE_ZOMBOTANY ? aDef.mPage : mPageIndex','GAMEMODE_CHALLENGE_ZOMBOTANY_3 ? 2 :',
  'GAMEMODE_CHALLENGE_ZOMBOTANY_4 ? 3 :','GAMEMODE_CHALLENGE_ZOMBOTANY_5 ? 4 : -1;'])assert(screen.includes(exact),exact);
 const battles=text(await read('tests/zombotany45-battles.h')),view=battles.match(/Z45Player::View View\(Board\*b\)\{([\s\S]*?)\n\}/);assert(view);
 const policy=text(await read('tests/zombotany45-policy.h'));
 verifyZombotany45PlayerPolicy({policyBytes:Buffer.from(policy),sha});
 assert(battles.includes('Require(Zombie::IsZombotany(z->mZombieType),"passive45 observer found an unauthorized ordinary zombie");++run.liveHeadChecks;'));
 for(const[name,seeds]of [['FogSeeds',['SUNSHROOM','LILYPAD','PUFFSHROOM','SCAREDYSHROOM','FUMESHROOM','WALLNUT']],
  ['RoofSeeds',['SUNFLOWER','FLOWERPOT','CABBAGEPULT','WALLNUT','UMBRELLA','CHERRYBOMB']]]){
  const deck=policy.match(new RegExp(name+'\\s*=\\s*\\{([^}]+)\\}'));assert(deck);
  assert.deepEqual([...deck[1].matchAll(/SEED_(\w+)/g)].map(m=>m[1]),seeds,'Literal final player deck: '+name);
 }
 assert(view[1].includes('kFog?260:760'));assert(!/mBodyHealth|mSummonCounter|mBoss\w+|mCurrentWave|Rand\(/.test(view[1]),'Player decisions cannot inspect hidden combat state');
 for(const exact of ['const auto visible=View(b);','const auto decision=Z45Player::Choose(visible);','Deploy(b,decision,run);',
  'if(b->mCurrentWave!=20)return;',
  '!z->mDead&&z->mHasHead&&!z->IsDeadOrDying()&&z->IsOnBoard()&&z->mPosX>=0&&z->mPosX<=760&&Zombotany45::IsCharging(*z)',
  'run.saveActorID=charging?b->mZombies.DataArrayGetID(charging):0'])assert(battles.includes(exact),exact);
 assert(!battles.includes('ChooseFog(visible,true)'),'The passive Save observer cannot alter the ordinary player opening');
 for(const exact of ['Require(before>=cost,"native45 player overspent finite sun")',
  'b->mSunMoney==before-cost'])assert(battles.includes(exact),exact);
 assert(!/(?:\.|->)mSunMoney\s*(?:[+*/-]=|=(?!=)|\+\+|--)|(?:\+\+|--)\s*\w+(?:\.|->)mSunMoney/.test(battles+'\n'+policy),
  'Ordinary player code cannot write native sun directly');
 const liveBattle=battles.match(/void RunBattle\([^]*?(?=\nvoid BattleCase\()/);assert(liveBattle);
 assert(!/SRand\(|srand\(|mAppRandSeed\s*=/.test(liveBattle[0]),'No RNG seed writes during the live battle');
 assert.equal((battles.match(/Sexy::SRand\(/g)||[]).length,1);
 assert(battles.includes('Require(app->mGameScene==SCENE_ZOMBIES_WON&&app->mBoardResult==BOARDRESULT_LOST&&app->GetDialog(DIALOG_GAME_OVER),"retry seed setup must occur only after native loss and before the new board");Sexy::SRand(seed);app->mAppRandSeed=seed;Click(app,pos.mX+button->mWidth/2,pos.mY+button->mHeight/2);'));
 assert(!/(?:\.|->)(?:mBodyHealth|mBodyMaxHealth|mPosX|mPosY|mCurrentWave|mZombieCountDown|mPlantHealth)\s*(?:[+*/-]=|=(?!=))/.test(battles),'Ordinary battles cannot edit actors, waves or health');
 return {sourceCount:888,productionObjectCount:152,priorSavedAndNative3Files:Object.keys(legacySources).length};
}

export async function verifyZombotany45BuildBindings({report,read,sha,engine,fullRunReport,productionBuildBytes}){
 fields(report,{status:'PASS',execution:'complete-production-engine',optimization:'O2',engineId:ENGINE,
  productionObjectCount:152,failures:0,exitCode:0,presentationControlsAvailable:true,developmentNoArt:false});
 assert.equal(engine.id,ENGINE);assert.equal(Object.keys(report.sourceSha256).length,888);assert.equal(Object.keys(report.productionObjectSha256).length,152);
 assert.deepEqual(report.sourceSha256,fullRunReport.sourceSha256);assert.deepEqual(report.productionObjectSha256,fullRunReport.productionObjectSha256);
 for(const[path,pin]of Object.entries(report.sourceSha256)){safe(path);assert(path.startsWith('source/'));digest(pin);assert.equal(sha(await read(path)),pin,path);}
 for(const[path,pin]of Object.entries(report.productionObjectSha256)){safe(path);digest(pin);assert(path.endsWith('.o'));}
 assert(NORMAL,'Current45.2 normal build has not been independently reviewed');
 assert.equal(sha(productionBuildBytes),NORMAL);assert.equal(report.productionBuildReceiptSha256,NORMAL);
 const normal=json(productionBuildBytes);fields(normal,{status:'PASS',exitCode:0,sourceUnchangedDuringBuild:true,sourceFiles:888});
 for(const suffix of ['js','wasm'])assert.equal(normal.outputs['build/pvz-portable.'+suffix].sha256,engine.artifacts[suffix+'Sha256']);
 for(const name of ['source-before.json','source-after.json']){
  const pins=json(await read('logs/'+name));assert.deepEqual(Object.fromEntries(Object.entries(pins).map(([p,h])=>['source/'+safe(p),h])),report.sourceSha256);
 }
 const build=json(await read('tests/zombotany45-build.json'));
 for(const key of ['execution','optimization','productionObjectCount','productionBuildReceiptSha256','generatedHarnessSha256','builderSha256',
  'policySha256','controlSha256','verificationContractSha256','testInputSha256','testArtifactSha256','sourceSha256','productionObjectSha256'])assert.deepEqual(report[key],build[key],key);
 fields(build,{presentationControlsAvailable:true,developmentNoArt:false});
 for(const[field,name]of Object.entries({generatedHarnessSha256:'zombotany45-harness.cpp',builderSha256:'build-zombotany45.py',
  runnerSha256:'test-zombotany45.py',policySha256:'zombotany45-policy.h',controlSha256:'zombotany45-controls.h',verificationContractSha256:'zombotany45-verification-contract.json'}))
  assert.equal(report[field],sha(await read('tests/'+name)),name);
 assert.deepEqual(Object.keys(build.testInputSha256).sort(),[...expectedInputs].sort());
 for(const[name,pin]of Object.entries(build.testInputSha256)){safe(name);digest(pin);assert.equal(sha(await read('tests/'+name)),pin,name);}
 assert.deepEqual(Object.keys(build.testArtifactSha256).sort(),['zombotany45-engine.js','zombotany45-engine.wasm']);
 for(const suffix of ['js','wasm'])assert.equal(sha(await read('tests/zombotany45-engine.'+suffix)),build.testArtifactSha256['zombotany45-engine.'+suffix]);
 assert(WebAssembly.validate(await read('tests/zombotany45-engine.wasm')));return build;
}

export function verifyZombotany45Checkpoint(cp,mode,{scope='final-current'}={}){
 assert(['final-current','earlier-genuine-prerequisite'].includes(scope));assert([94,95].includes(mode));
 if(scope==='earlier-genuine-prerequisite')assert.equal(mode,94);
 fields(cp,{performed:true,kind:'save-attack',graphPreserved:true,profileCreditAtExport:0,exportRoot:'earned-zombotany45-checkpoint/userdata'});
 assert.equal(cp.beforeGraph,cp.afterGraph);assert(cp.beforeGraph.length>100);integer(cp.charge,0,65);integer(cp.projectileAge,-1,50);integer(cp.butterRemaining,0,150);
 integer(cp.exportedBoardBytes,1024,16*1024*1024);assert.equal(cp.exportedUsersBytes,41);assert.equal(cp.exportedProfileBytes,886);
 const parts=cp.beforeGraph.split(';'),head=parts.shift().split(':').map(Number);assert.equal(head.length,21);assert(head.every(Number.isFinite));
 integer(head[0],1);integer(head[1]);integer(head[2],1,20);assert.equal(head[5],148);assert.equal(head[9],1);assert.equal(head[13],6);
 const records={a:[],snapshot:[],p:[],z:[],g:[],s:[],c:[],b:[],r:[],terrain:[],'x-z':[],'x-s':[]};
 const widths={snapshot:54,p:43,z:29,g:13,s:12,c:5,b:8,r:8,terrain:134,'x-z':2,'x-s':10};
 for(const part of parts){const[tag,...tokens]=part.split(',');assert(Object.hasOwn(records,tag));
  if(tag==='a'){assert.equal(tokens.length,7);for(const i of [0,1,2,3,5])assert(Number.isFinite(Number(tokens[i])));for(const i of [4,6])assert(/^(?:[a-f0-9]{2})*$/.test(tokens[i]));records.a.push(tokens);}
  else {assert.equal(tokens.length,widths[tag],tag);const values=tokens.map(Number);assert(values.every(Number.isFinite));records[tag].push(values);}
 }
 for(const tag of ['a','snapshot','terrain'])assert.equal(records[tag].length,1);assert.equal(records.b.length,6);
 const bank=mode===95?[1,33,32,3,37,2]:scope==='earlier-genuine-prerequisite'?[9,16,8,13,10,25]:[9,16,8,13,10,3];
 assert.deepEqual(records.b.map(v=>v[0]),bank,'Exact native seed bank for '+scope);
 // BackgroundType is zero-based; contract names Background4/5 are asset names.
 const terrain=records.terrain[0];assert.equal(terrain[0],mode===94?3:4);
 const leases=Array.from({length:6},(_,r)=>terrain[6+2*r]);leases.forEach(v=>integer(v,0,head[0]+150));
 assert.equal(cp.butterRemaining,Math.max(0,...leases.map(v=>v-head[0])));
 const plantIDs=new Map(records.p.map(v=>[v[0],v]));
 records.snapshot[0].forEach((id,index)=>{if(id){const p=plantIDs.get(id);assert(p);assert.equal(p[2],index%9);assert.equal(p[3],Math.floor(index/9));}});
 const extraZ=new Map(records['x-z'].map(v=>[v[0],v]));assert.equal(extraZ.size,records.z.length);
 for(const z of records.z){assert(extraZ.has(z[0]));if([38,39,40,41].includes(z[1])){integer(z[28],1);assert(records.r.some(r=>r[0]===z[28]));if(z[1]===40)integer(extraZ.get(z[0])[1],0,1);}}
 assert.equal(new Set(records['x-s'].map(v=>v[0])).size,records.s.length);
 if(scope==='earlier-genuine-prerequisite'){
  integer(cp.charge,1,35);assert(records.z.some(z=>z[1]===38&&[2,3].includes(z[2])&&z[3]<=320&&z[22]===1&&z[27]===cp.charge));
 }else{
  assert.equal(cp.wave,head[2]);assert.equal(cp.wave,head[19]);
  integer(cp.aliveEnemies,1,mode===94?156:109);integer(cp.authoredObserved,cp.aliveEnemies,mode===94?156:109);
  assert.equal(cp.aliveEnemies,records.z.filter(z=>![1,2,3].includes(z[13])).length,'Actual living battle actors match the saved native phase graph');
  fields(cp,{wave:20,authoredObserved:mode===94?156:109});assert.equal(head[19],20);
  integer(cp.actorID,0,0xffffffff);assert.equal(typeof cp.withinPlayerViewBoundary,'boolean');
  if(cp.charge>0){
   integer(cp.actorID,1,0xffffffff);integer(cp.actorXMilliPixels,0,760000);
   const actor=records.z.find(z=>z[0]===cp.actorID);assert(actor,'The saved charging carrier ID must exist in the exact graph');
   assert.equal(actor[1],cp.actorType);assert.equal(actor[27],cp.charge);assert.equal(Math.round(actor[3]*1000),cp.actorXMilliPixels);
   assert(actor[3]>=0&&actor[3]<=760&&actor[5]>0&&actor[8]===1,'The saved carrier must be living, headed and on-screen');
   assert.equal(cp.withinPlayerViewBoundary,mode===95||actor[3]<=260,'Player-view flag is a literal coordinate comparison, not an optical visibility claim');
   if(mode===94){assert.equal(cp.actorType,38);integer(cp.charge,1,35);assert([2,3].includes(actor[2])&&actor[22]===1);}
   else {assert([39,40,41].includes(cp.actorType));integer(cp.charge,1,cp.actorType===41?65:55);}
  }else{assert.equal(mode,95);fields(cp,{actorID:0,actorType:-1,actorXMilliPixels:-1000,withinPlayerViewBoundary:true});}
 }
 if(mode===94)integer(cp.charge,1,35);
 else {assert.equal(head[2],20);assert(cp.charge>0||cp.projectileAge>=3);
  if(cp.projectileAge>=3)assert(records.s.some(s=>[2,3,10,12].includes(s[1])&&s[9]===cp.projectileAge&&s[10]===-405&&s[11]===1));
 }
 for(const s of records.s)if(s[10]===-405){assert([2,3,10,12].includes(s[1]));integer(s[9],0,79);assert.equal(s[11],1);const extra=records['x-s'].find(v=>v[0]===s[0]);assert(extra&&Math.abs(extra[1]-.15)<.000001);}
 return records;
}

export function verifyZombotany45Scenario(row,{scope='final-current'}={}){
 assert(['final-current','earlier-genuine-prerequisite'].includes(scope));
 if(scope==='earlier-genuine-prerequisite')fields(row,{mode:94,name:'save-attack',speed:1,seed:1729});
 assert([94,95].includes(row.mode));assert(names.includes(row.name));assert([1,2].includes(row.speed));assert([1729,7331].includes(row.seed));integer(row.checks,31);
 const fog=row.mode===94;fields(row,{execution:'complete-production-engine',biome:fog?'fog':'roof',profileIndex:row.mode-1,silentHardware:true,audioDeviceOpened:false});
 if(row.name==='controls'){
  fields(row,{family:'synthetic-controls',outcome:'controls-pass',syntheticActorSetup:true,profileCredits:0,countedEarnedWins:0,all100ProfileRecordsPreserved:true,
   nativeTargetRejections:fog?3:9,nativeInterruptKinds:fog?4:12,nativeFiniteFlights:fog?1:3,directProductionAbilityAndImpactControls:true,
   nativeSupportRetargetBeforeNoTargetCancellation:true,nativeWindupPerHead:fog?[35]:[55,55,65],
   nativeFamilyRecordIndices:[15,31,92,93,94],nativeFamilyPairChecks:10,nativeFamilyCanvasAndCardsClear:true,
   nativeFamilyCardCount:6,nativeSurvivalCardIndex:95,nativeSurvivalCardPairChecks:5,
   nativeSequentialUnlocks:true,nativeLockedHoverTooltipVisible:true,nativeSyntheticProfileRestored:true,
   nativeHypnoTintPropagated:true,nativeAcceptedHeadTransformsExact:true,nativeActorCropHeight:320,nativeHypnoCropHeight:320,
   nativeHeadPoseFrames:fog?4:12,nativeOriginalPlantRigsAttached:true,nativeMirroredHeadOriginsFinite:true});
  const n=fog?1:3;for(const[key,min,max]of [['nativeAttachedHeadDifferencePixels',151,115200],['nativeIdleDifferencePixels',51,115200],
   ['nativeAttackDifferencePixels',51,115200],['nativeMuzzleErrorMilliPixels',0,17999]]){
   assert.equal(row[key].length,n);row[key].forEach(v=>integer(v,min,max));
  }
  assert.equal(row.nativeCollarGapManhattanPixels.length,n*3);row.nativeCollarGapManhattanPixels.forEach(v=>integer(v,0,4));
  integer(row.nativeUniqueCardDifferencePixels,1001,5200);integer(row.nativeLockedTooltipWidth,1,800);
  assert.equal(row.nativeDamagePerHead.length,n);assert.equal(row.nativeArcMinimumZ.length,n);assert.equal(row.nativeMaximumFlightAge.length,n);
  if(fog){fields(row,{nativeDamagePerHead:[20],nativeSeaFogSaveExact:true});integer(row.nativeMaximumFlightAge[0],0,59);assert.equal(row.nativeArcMinimumZ[0],0);}
  else {assert.equal(row.nativeDamagePerHead[0],40);assert([20,40].includes(row.nativeDamagePerHead[1]));assert.equal(row.nativeDamagePerHead[2],80);
   row.nativeMaximumFlightAge.forEach(v=>assert.equal(v,79));assert.deepEqual(row.nativeArcMinimumZ,[-120,-120,-120]);
   fields(row,{nativeKernelPayloadSamples:48,nativeKernelPayloadSaveExact:true,nativeGustPayloadCountersSeparate:true,
    nativeActualGustKernelOverlap:true,nativeActualGustKernelSaveExact:true,nativeUmbrellaOpensAndBlocks:true,
    nativeMelonDamageNineCells:[26,26,26,26,80,26,26,26,26],nativeMelonOutsideUnaffected:true,nativeButterPlantUpdates:150,
    nativeButterNoStack:true,nativeButterBodyHeadClocksHeld:true,nativeButterResumes:true,nativeButterSaveExact:true,nativeButterReplacementSafe:true});
   integer(row.nativeKernelSelections,1,47);integer(row.nativeButterSelections,1,47);assert.equal(row.nativeKernelSelections+row.nativeButterSelections,48);
   integer(row.nativeActualGustKernelPushMilliPixels,40001,69999);
  }return;
 }
 const loss=row.name==='no-action',replay=row.name==='replay',retry=row.name==='retry',credits=loss?0:replay?2:1;
 if(scope==='final-current'){fields(row,{nativeAllLiveZombiesPlantHeadOnly:true});integer(row.nativeLivePlantHeadChecks,1);}
 fields(row,{family:'zombotany45',outcome:loss?'native-loss':'win',profileCredits:credits,
  ordinaryNativeMouseInputsOnly:true,visibleOnlyPolicy:true,noHiddenFogEnemyReads:true,noAssignedUnlockCredits:true,
  postStartActorHealthPositionStageTimeOrRNGEdits:false,nativeOriginalSeedChooser:true,nativeIntroCancelled:false,
  minimumInputCadenceTicks:150,observerNativeTicks:2,nativeOpeningSun:50,nativeStartingPots:fog?0:15,nativeConveyorBank:false,
  all100ProfileRecordsPreservedExceptCurrentEarnedCredit:true,failureAndRetry:retry,nativeReplayCompleted:replay,nativeGameOver:loss});
 assert.equal(row.nativeProfileRecordsBefore.length,100);assert.equal(row.nativeProfileRecordsAfter.length,100);row.nativeProfileRecordsBefore.forEach(v=>integer(v));
 assert.equal(row.nativeProfileRecordsBefore[92],1);assert.equal(row.nativeProfileRecordsBefore[93],fog?0:1);assert.equal(row.nativeProfileRecordsBefore[94],0);
 assert.deepEqual(row.nativeProfileRecordsAfter,row.nativeProfileRecordsBefore.map((v,i)=>v+(i===row.mode-1?credits:0)));
 for(const key of ['nativePlacements','nativeSunClicks','nativeSunCollected','nativeSunSpent','nativePaidLilies','nativePaidPots','nativePlanterns',
  'nativeWindupsObserved','nativeWaterHeadsObserved','nativeSwimmingHeadsObserved','nativePuffsObserved','nativeRoofLobsObserved',
  'nativeRoofArcChangesObserved','nativeButterPlantUpdatesObserved','nativeHesitationWindows'])integer(row[key]);
 integer(row.nativeMowersRemaining,0,fog?6:5);assert.equal(row.checkpoint.performed,row.name==='save-attack');
 if(row.checkpoint.performed)verifyZombotany45Checkpoint(row.checkpoint,row.mode,{scope});
 else fields(row.checkpoint,{performed:false,kind:'',charge:0,projectileAge:-1,butterRemaining:0,beforeGraph:'',afterGraph:'',
  graphPreserved:false,profileCreditAtExport:0,exportedBoardBytes:0,exportedUsersBytes:0,exportedProfileBytes:0,exportRoot:''});
 if(scope==='final-current'&&!row.checkpoint.performed)fields(row.checkpoint,{actorID:0,actorType:-1,actorXMilliPixels:-1000,withinPlayerViewBoundary:false});
 if(scope==='final-current'&&!row.checkpoint.performed)fields(row.checkpoint,{wave:-1,aliveEnemies:0,authoredObserved:0});
 if(loss){fields(row,{nativeActualAwardCollected:false,nativePlacements:0,nativeSunClicks:0,nativeSunCollected:0,nativeSunSpent:0,
  nativePaidLilies:0,nativePaidPots:0,nativePlanterns:0,winTicks:[],replayWinTicks:[],nativeAwardWave:-1,nativeAwardEnemies:-1,nativeAwardType:-1});return;}
 fields(row,{nativeActualAwardCollected:true,nativeAwardWave:20,nativeAwardEnemies:0,nativeAwardType:8});assert.deepEqual(row.nativeFormationLedger,ledger(row.mode,{historical:scope==='earlier-genuine-prerequisite'}));
 for(const key of ['nativePlacements','nativeSunClicks','nativeSunCollected','nativeSunSpent','nativeWindupsObserved'])integer(row[key],1);
 // nativeSunCollected is the manually intended coin's value, not a complete
 // income ledger: a native hit test may collect a different overlapping sun.
 // Per-action native costs/balances are independently checked in the raw log.
 if(fog){integer(row.nativePaidLilies,1);integer(row.nativeWaterHeadsObserved,1);integer(row.nativeSwimmingHeadsObserved,1);integer(row.nativePuffsObserved,1);assert.equal(row.nativePaidPots,0);assert.equal(row.nativeRoofLobsObserved,0);}
 else {integer(row.nativePaidPots,1);integer(row.nativeRoofLobsObserved,1);integer(row.nativeRoofArcChangesObserved,1);assert.equal(row.nativePaidLilies,0);assert.equal(row.nativeWaterHeadsObserved,0);assert.equal(row.nativeSwimmingHeadsObserved,0);}
 assert.equal(row.winTicks.length,1);integer(row.winTicks[0],1,319999);
 if(replay){assert.deepEqual(row.replayFormationLedger,ledger(row.mode,{historical:scope==='earlier-genuine-prerequisite'}));assert.equal(row.replayWinTicks.length,1);integer(row.replayWinTicks[0],1,319999);}
 else {assert.deepEqual(row.replayFormationLedger,emptyLedger);assert.deepEqual(row.replayWinTicks,[]);}
 if(retry)integer(row.nativeRetryLossTick,1);else assert.equal(row.nativeRetryLossTick,0);
 if(row.name==='hesitation')integer(row.nativeHesitationWindows,19,20);else assert.equal(row.nativeHesitationWindows,0);
}

export function verifyZombotany45Matrix(report){
 assert.equal(report.scenarios.length,56);assert.deepEqual(report.scenarios.map(identity).sort(),ZOMBOTANY45_MATRIX.map(([mode,name,speed,seed])=>identity({mode,name,speed,seed})).sort());
 for(const row of report.scenarios){verifyZombotany45Scenario(row);if(row.family==='zombotany45'){
  integer(row.nativeCherryBombs,0,row.nativePlacements);integer(row.nativeShovelInputs,0,row.nativePlacements+(row.mode===95?15:0));
  assert.equal(row.nativeCheckpointOpeningVariant,false);
  assert.equal(row.nativeCheckpointObserverSeparateFromPlayer,row.mode===94&&row.name==='save-attack');
  assert.equal(row.nativeRetrySeedInitializedBeforeNewBoard,row.name==='retry');
  assert(row.nativeCherryBombs*150<=row.nativeSunSpent,'Native Cherry cost remains part of finite spending');
 }}
 assert.equal(report.scenarios.filter(r=>r.outcome==='win').length,40);assert.equal(report.scenarios.filter(r=>r.outcome==='native-loss').length,8);
 assert.equal(report.scenarios.filter(r=>r.family==='synthetic-controls').length,8);assert.equal(report.scenarios.reduce((s,r)=>s+r.profileCredits,0),48);
 assert.equal(report.scenarios.filter(r=>r.family==='zombotany45'&&r.checkpoint.performed).length,8);
 assert.equal(report.scenarios.filter(r=>r.nativeGameOver||r.failureAndRetry).length,16);
 assert.equal(report.speedPairs.length,28);assert.equal(report.checks,888+report.scenarios.reduce((s,r)=>s+r.checks,0));
 assert.deepEqual(report.speedPairs.map(r=>[r.mode,r.name,r.seed].join('/')).sort(),[94,95].flatMap(mode=>names.flatMap(name=>[1729,7331].map(seed=>[mode,name,seed].join('/')))).sort());
 for(const pair of report.speedPairs){fields(pair,{semanticResultEqual:true});const rows=report.scenarios.filter(r=>r.mode===pair.mode&&r.name===pair.name&&r.seed===pair.seed).sort((a,b)=>a.speed-b.speed);
  assert.deepEqual(rows.map(r=>r.speed),[1,2]);for(const key of ['family','outcome','profileCredits','nativeFormationLedger','replayFormationLedger','nativeAwardWave','nativeAwardEnemies','nativeAwardType','failureAndRetry','nativeReplayCompleted','nativeGameOver'])
   assert.deepEqual(rows[0][key],rows[1][key],key);
  const a=[...(rows[0].winTicks||[]),...(rows[0].replayWinTicks||[])],b=[...(rows[1].winTicks||[]),...(rows[1].replayWinTicks||[])];assert.equal(a.length,b.length);
  const deltas=a.map((v,i)=>Math.abs(v-b[i]));assert.deepEqual(pair.nativeTickDeltas,deltas);deltas.forEach(v=>integer(v,0,30));
 }
 return {cases:56,speedPairs:28,winningCases:40,naturalLossCases:8,syntheticControls:8,earnedClears:48,earnedCredits:48,nativeLosses:16,nativeLossesIncludingRetries:16};
}

export async function verifyZombotany45CaseLog(row,{read,sha}){
 const path=`tests/zombotany45-logs/${row.mode}-${row.name}-${row.speed}x-${row.seed}.log`,bytes=await read(path);digest(row.logSha256);assert.equal(sha(bytes),row.logSha256,path);
 const raw=text(bytes),lines=raw.split('\n').filter(line=>line.startsWith('ZOMBOTANY45_RESULT '));assert.equal(lines.length,1);
 const diagnostics=raw.split('\n').filter(line=>!line.startsWith('ZOMBOTANY45_RESULT ')).join('\n');
 assert(!/Too many (?:particle|emitters)|DataArray.*(?:full|exhaust|capacity)|(?:particle|reanimation).*capacity|memory access out of bounds|RuntimeError|zombotany45:FAIL/i.test(diagnostics));
 const{logSha256,resourceCapacityWarnings,...native}=row;fields(row,{resourceCapacityWarnings:0});assert.deepEqual(JSON.parse(lines[0].slice('ZOMBOTANY45_RESULT '.length)),native,'Every native raw observation is retained');
 if(row.family==='zombotany45'){
  const inputs=[...raw.matchAll(/^45input mode(94|95) tick(\d+) seed(\d+) col(\d+) row(\d+) cost(\d+) sun(\d+)$/gm)].map(m=>m.slice(1).map(Number));
  if(row.name==='no-action')assert.equal(inputs.length,0);
  else {const costs={1:50,2:150,3:50,8:0,9:25,10:75,13:25,16:25,25:25,32:100,33:25,34:100,37:100};
   const runs=[[]];for(const input of inputs){assert.equal(input[0],row.mode);integer(input[3],0,8);integer(input[4],0,row.mode===94?5:4);
    assert(Object.hasOwn(costs,input[2]));assert.equal(input[5],costs[input[2]],'Fixed original native seed cost');integer(input[6]);
    const last=runs.at(-1).at(-1);if(last&&input[1]<last[1])runs.push([]);else if(last)integer(input[1]-last[1],150);runs.at(-1).push(input);}
   for(const run of runs){let previous=50;for(const input of run){integer(input[6]+input[5]-previous,0);previous=input[6];}}
   assert.equal(runs.length,row.name==='replay'?2:1);const first=runs[0];assert.equal(first.length,row.nativePlacements);
   assert.equal(first.reduce((s,v)=>s+v[5],0),row.nativeSunSpent);assert.equal(first.filter(v=>v[2]===16).length,row.nativePaidLilies);
   assert.equal(first.filter(v=>v[2]===33).length,row.nativePaidPots);assert.equal(first.filter(v=>v[2]===25).length,row.nativePlanterns);
  }
 }return native;
}

export async function verifyZombotany45Prerequisite({read,sha,build,engine}){
 const previousBytes=fs.readFileSync(new URL('./fixtures/zombotany45-1-release.json',import.meta.url));
 assert.equal(sha(previousBytes),'3d02891ed6e4faf40019bb77b701d14cac796b7c67852f0b878eff51b092423e');
 fields(json(previousBytes),{id:PREREQUISITE_ENGINE,normalReceiptSha256:PREREQUISITE_NORMAL,sourceFiles:886,productionObjects:151,
  sourceSha256:'3961bb9b472f27e3661d645bf9ab89865f9fd9ffa795a5462f31b959175151e5'});
 const threeBytes=await read('tests/zombotany45-earned-z3-fixture.json');assert.equal(sha(threeBytes),'d1cc9cfaa16fc60aa4e1be312d4eb2651499270f6293f311ee1ef41ed7c7ea3b');
 const three=json(threeBytes);fields(three,{originEngineId:'0.2.6-web-zombotany3.2',sourceArchiveSha256:'9e4186372f80a9b59d119f8bf9cb0217e17a072d5fa178ea9f96cd120a4b5efb',
  ordinaryMouseInputsOnly:true,postStartStateEdits:false,realNativeTrophyCollected:true,earnedRecordIndex:92,earnedRecordValue:1});
 assert.deepEqual(Object.keys(three.files).sort(),['tests/zombotany45-earned-z3/userdata/user1.dat','tests/zombotany45-earned-z3/userdata/users.dat']);
 for(const[name,pin]of Object.entries(three.files)){const bytes=await read(safe(name));assert.equal(bytes.length,pin.bytes);assert.equal(sha(bytes),pin.sha256);}
 const fixtureBytes=await read('tests/zombotany45-earned-z4-fixture.json');
 const fixture=json(fixtureBytes);fields(fixture,{schemaVersion:1,originEngineId:PREREQUISITE_ENGINE,originNormalBuildReceiptSha256:PREREQUISITE_NORMAL,originCase:[94,'save-attack',1,1729],
  ordinaryNativeMouseInputsOnly:true,postStartStateEdits:false,noAssignedUnlockCredits:true,realNativeTrophyCollected:true,earnedRecordIndex:93,earnedRecordValue:1,
  priorActuallyEarned3FixtureSha256:sha(threeBytes)});
 const resultBytes=await read('tests/zombotany45-earned-z4-origin/result.json'),logBytes=await read('tests/zombotany45-earned-z4-origin/save-attack.log'),
  buildBytes=await read('tests/zombotany45-earned-z4-origin/build.json'),snapshotBytes=await read('tests/zombotany45-earned-z4-origin/inputs.zip');
 assert.equal(sha(resultBytes),fixture.originResultSha256);assert.equal(sha(logBytes),fixture.originRawLogSha256);
 assert.equal(sha(buildBytes),fixture.originBuildSha256);assert.equal(sha(snapshotBytes),fixture.originInputSnapshotSha256);
 const origin=json(resultBytes),earlierBuild=json(buildBytes),{logSha256,resourceCapacityWarnings,optimization,productionBuildReceiptSha256,testArtifactSha256,testInputSha256,...native}=origin;
 fields(origin,{optimization:'O2',resourceCapacityWarnings:0,productionBuildReceiptSha256:PREREQUISITE_NORMAL,mode:94,name:'save-attack',speed:1,seed:1729});verifyZombotany45Scenario(native,{scope:'earlier-genuine-prerequisite'});
 const rows=text(logBytes).split('\n').filter(line=>line.startsWith('ZOMBOTANY45_RESULT '));assert.equal(rows.length,1);assert.deepEqual(JSON.parse(rows[0].slice('ZOMBOTANY45_RESULT '.length)),native);assert.equal(logSha256,sha(logBytes));
 assert.deepEqual(fixture.nativeChallengeRecords,origin.nativeProfileRecordsAfter);assert.deepEqual(fixture.nativeWinTicks,origin.winTicks);
 fields(earlierBuild,{execution:'complete-production-engine',optimization:'O2',productionObjectCount:151,productionBuildReceiptSha256:PREREQUISITE_NORMAL});
 // A genuinely earned profile remains usable across a renderer correction.
 // Authenticate its distinct old executable, rather than relabelling it as
 // the current56 driver or requiring an unlock to be re-earned per rebuild.
 const changed=new Set(['CMake/ProjectVersion.cmake','src/Lawn/Board.cpp','src/Lawn/Challenge.cpp','src/Lawn/Zombie.cpp',
  'src/Lawn/System/Zombotany3.h','src/Lawn/System/Zombotany45.cpp','src/Lawn/System/Zombotany45.h',
  'src/Lawn/System/Zombotany45Art.cpp','src/Lawn/System/Zombotany45Art.h'].map(path=>'source/'+path));
 const parent=await zsurvivalParentSourceReader({read,sha,engine});
 const parentSourcePins=Object.fromEntries([...parent.files].map(([name,bytes])=>['source/'+name,sha(bytes)]));
 assert.deepEqual(Object.keys(earlierBuild.sourceSha256).sort(),Object.keys(parentSourcePins).sort());
 for(const[path,pin]of Object.entries(earlierBuild.sourceSha256)){
  if(changed.has(path))assert.notEqual(parentSourcePins[path],pin,'Every approved45.2 production delta is real: '+path);
  else assert.equal(parentSourcePins[path],pin,'Every unrelated production source remains identical to the genuine prerequisite: '+path);
 }
 assert.equal(Object.keys(earlierBuild.sourceSha256).length,886);assert.equal(Object.keys(earlierBuild.productionObjectSha256).length,151);
 assert.deepEqual(earlierBuild.testArtifactSha256,fixture.originTestArtifacts);assert.deepEqual(testArtifactSha256,fixture.originTestArtifacts);assert.deepEqual(testInputSha256,earlierBuild.testInputSha256);
 const snapshot=await Zip.loadAsync(snapshotBytes,{checkCRC32:true});
 assert.deepEqual(Buffer.from(await snapshot.file('tests/zombotany45-build.json').async('uint8array')),Buffer.from(buildBytes));
 for(const[name,pin]of Object.entries(earlierBuild.testInputSha256)){safe(name);const file=snapshot.file('tests/'+name);assert(file);assert.equal(sha(Buffer.from(await file.async('uint8array'))),pin,name);}
 assert.equal(sha(Buffer.from(await snapshot.file('tests/build-zombotany45.py').async('uint8array'))),earlierBuild.builderSha256);
 assert.deepEqual(Object.keys(fixture.files).sort(),['user1.dat','users.dat']);
 for(const[name,pin]of Object.entries(fixture.files)){const bytes=await read('tests/zombotany45-earned-z4/userdata/'+name);assert.equal(bytes.length,pin.bytes);assert.equal(sha(bytes),pin.sha256);}
 return {genuineNativePrerequisite:true,originEngine:PREREQUISITE_ENGINE,originNormal:PREREQUISITE_NORMAL,
  scope:'Historical published45.1 actual legal Fog4 win; separate from the current45.2 normal and final56 driver'};
}

export async function verifyZombotany45(options){
 const{report,read,sha,engine}=options,reportBytes=await read('tests/zombotany45-results.json');
 const authenticated=verifyZombotany45ReportIdentity({reportBytes,sha});assert.deepEqual(report,authenticated.report);
 const contractBytes=await read('tests/zombotany45-verification-contract.json');assert(acceptedContractPins.has(sha(contractBytes)),'Final actual56 preregistration has not been reviewed');
 const c=json(contractBytes);fields(c,{schemaVersion:1,stage:'final-preregistered',engineId:ENGINE,cases:56,speedPairs:28,sourceCount:888,productionObjectCount:152,nativeArtInputs:1027,syntheticControlsEarnCurrentModeCredits:false});
 assert.deepEqual(c.matrix,ZOMBOTANY45_MATRIX);assert.deepEqual(c.nativeStats,stats);assert.deepEqual(c.course,course);assert.deepEqual(c.independentWaves,{fog:fogWaves,roof:roofWaves});
 assert.deepEqual(c.nativeDecks,{fog:[9,16,8,13,10,3],roof:[1,33,32,3,37,2]});
 fields(c.roofShieldedFormation,{nativeDeck:[1,33,32,3,37,2],umbrellaPairs:[[1,1],[1,3],[4,1],[4,3]],
  coversAllFiveRowsColumns:[0,1,2,3,4,5],nativeSeedSlots:6,nativeStartingSun:50,
  noProductionStatRosterRNGObserverThresholdChanges:true,noAdditionalShopPurchasesOrAssignedCredits:true});
 fields(c.saveAttackOpeningVariant,{active:false});assert(c.saveAttackOpeningVariant.scope.startsWith('Retired;'));
 fields(c.checkpointObserverScope,{playerOpeningVariant:false,playerVisibleEnemyMaximumX:260,observerSeaMaximumX:760,
  statChargeGraphAwardsCreditsAssertionsPreserved:true,fogWave:20,fogAuthoredObserved:156,roofWave:20,roofAuthoredObserved:109,minimumLivingEnemies:1});
 assert(c.checkpointObserverScope.rngClaim.startsWith('No originalglobalRNG preservation claim.'));
 fields(c.retryPreBoardSeedScope,{registeredSeeds:[1729,7331],whilePlayingRNGWrites:false,newBoardActorsHPPositionWaveTimerWrites:false,
  scenarioRowFlag:'nativeRetrySeedInitializedBeforeNewBoard'});
 fields(c.modes.fog,{mode:94,profileIndex:93,background:4,rows:6,waterRows:[2,3]});fields(c.modes.roof,{mode:95,profileIndex:94,background:5,rows:5,startingNativePots:15});
 fields(c.playerBoundary,{ordinaryNativeChooserAndMouseInputs:true,nativeStatsOnly:true,noPostStartHPActorPositionStageWaveTimerOrRNGWrites:true,
  minimumInputCadenceTicks:150,nativeObservationQuantum:2,noHiddenFogEnemyReads:true,noAssignedUnlockCredits:true});
 fields(c.bounds,{maximumNativeBattleTicks:320000,maximumSpeedPairDeltaTicks:30,minimumOrdinaryInputCadenceTicks:150,observerNativeTicks:2,
  nativeAttachedHeadDifferencePixels:150,nativeIdleDifferencePixels:50,nativeAttackDifferencePixels:50,nativeMuzzleErrorMilliPixels:[0,17999],
  nativeCardDifferencePixels:1000,nativeCollarGapManhattanPixels:[0,4]});
 fields(c.nativeFogRouting,{seaWaterOnly:true,puffFumeLandOnly:true,originalPeaWallnutNativeMixedEligibility:true,ordinaryFlagNotAllowed:true,originalMixedPoolMinimumWaveIndex:5});
 fields(c.plantHeadOnlyCorrection,{priorEngineId:'0.2.6-web-zombotany45.1',sameAuthoredEnemyTotals:true,
  ordinaryPlayerChoiceBytesUnchanged:false,nativeAllLiveZombiesPlantHeadOnly:true,minimumNativeLivePlantHeadChecks:1,
  observerAuditsDoNotFeedPolicy:true,flagWavePlantHeads:{fog:35,roof:39}});
 fields(c.reviewedRoofCherryThresholdCorrection,{scope:'test-player-only',baselineEngineId:'0.2.6-web-zombotany45.1',
  baselinePolicySha256:PUBLISHED_POLICY_SHA256,currentPolicySha256:REVIEWED_POLICY_SHA256,
  beforePredicate:REVIEWED_POLICY_BEFORE,afterPredicate:REVIEWED_POLICY_AFTER,exactReplacementCount:1,
  beforeThresholdX:360,afterThresholdX:520,visibleEnemyType:'ZOMBIE_TALLNUT_HEAD',
  fogChoicesUnchanged:true,seedBankFormationCostsAndCadenceUnchanged:true,productionSourceAndMechanicsUnchanged:true,
  playerHiddenStateAndInputBoundsUnchanged:true,publishedPlayerBytesRecoveredByExactReverse:true});
 assert.deepEqual(c.nativeAcceptedHeadSpecs,{'38':[69,-34,1],'39':[65,-21,.82],'40':[64,-25,.78],'41':[65,-19,.78]});
 assert.equal(c.prerequisiteNormalBuildReceiptSha256,PREREQUISITE_NORMAL);
 for(const name of [...expectedInputs.filter(n=>n!=='zombotany45-verification-contract.json'),'build-zombotany45.py'])assert(Object.hasOwn(c.fixtureSha256,'tests/'+name),name);
 for(const[name,pin]of Object.entries(c.fixtureSha256)){safe(name);assert(name.startsWith('tests/'));digest(pin);assert.equal(sha(await read(name)),pin,name);}
 assert.equal(c.initialEarned3FixtureSha256,sha(await read('tests/zombotany45-earned-z3-fixture.json')));assert.equal(c.earned4FixtureSha256,sha(await read('tests/zombotany45-earned-z4-fixture.json')));
 const build=await verifyZombotany45BuildBindings(options);await verifyZombotany45SourceBounds(options);
 await verifyZombotanyFamilyFixes({...options,build});
 assert(acceptedPrerequisitePins.has(sha(await read('tests/zombotany45-earned-z4-fixture.json'))),'Current actual genuine4 prerequisite is not reviewed');
 await verifyZombotany45Prerequisite({...options,build});
 fields(report,{assetBundleId:engine.assetBundleId,nativeArtInputs:1027});
 const assetBytes=await read('tests/zombotany45-assets.json'),assets=json(assetBytes);assert.equal(report.assetFixtureSha256,sha(assetBytes));
 fields(assets.files['main.pak'],{bytes:45453180,sha256:'5878326408285cb01f83b4fa4edcc66d65e727f6d6ee88563b5b3b287dd259fc'});
 const artBytes=await read('tests/zombotany45-native-art-inputs.json'),art=json(artBytes);assert.equal(report.nativeArtFixtureSha256,sha(artBytes));
 fields(art,{assetBundleId:engine.assetBundleId,mainPakSha256:assets.files['main.pak'].sha256});assert.equal(Object.keys(art.sourceInputs).length,1027);
 const priorBytes=await read('tests/zombotany3-native-art-inputs.json');assert.equal(sha(priorBytes),'c9fae39821db0bd9388befba730b3634862aa0cb34e4a337608c81a16ea27826');
 const prior=json(priorBytes);assert.equal(Object.keys(prior.sourceInputs).length,970);for(const[name,pin]of Object.entries(prior.sourceInputs))assert.deepEqual(art.sourceInputs[name],pin,name);
 for(const[name,pin]of Object.entries(art.sourceInputs)){safe(name);integer(pin.bytes,1);digest(pin.sha256);}
 for(const name of ['reanim/SeaShroom.reanim','reanim/Cabbagepult.reanim','reanim/Cornpult.reanim','reanim/Melonpult.reanim','reanim/Cornpult_butter_splat.png'])assert(Object.hasOwn(art.sourceInputs,name));
 for(const row of report.scenarios)await verifyZombotany45CaseLog(row,{read,sha});
 return verifyZombotany45Matrix(report);
}
