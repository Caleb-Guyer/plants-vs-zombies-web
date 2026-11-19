// SPDX-License-Identifier: MIT
// The published Survival projection remains unchanged. New current source
// receives its own independent guards before that exact six-field projection.
import assert from 'node:assert/strict';
import {CURRENT_ENGINE_ID,CURRENT_NORMAL_RECEIPT_SHA256,ZVASE_PARENT_ENGINE_ID,
 ZVASE_PARENT_NORMAL_SHA256,zvaseParentSourceReader} from './native-release-context.mjs';
import {verifyZsurvivalCloudSourceGuard as verifyPublishedGuard,
 projectZsurvival1CloudCanonical as projectPublished} from './zsurvival1-cloud-canonical.mjs';

const CURRENT_SOURCE_PINS=Object.freeze({
 "source/src/ConstEnums.h": "12c1478948ca57ea64b5c5e0b5f4b3c1bf31e2285e6e2d5d084c204b0679b20f",
 "source/src/Lawn/Challenge.cpp": "1380c435bc8a298fd9a50b0bca9c173d7514b473190e24dc853107da0c013906",
 "source/src/Lawn/Challenge.h": "6fcde9bd2ed500b7355737b0ca1febce8ac5a32728e07d0a4590f7828413bde0",
 "source/src/Lawn/Board.cpp": "10e7b08410f54c2a2417c689a3bd846165d889597adad0243b600fca2118c546",
 "source/src/LawnApp.cpp": "7fcec837ac1abdbb4f477f150b65ee00328013585ce1f3480e04859f52257b30",
 "source/src/Lawn/System/SaveGame.cpp": "1deb4fe9a316ddaa1473839c70bc7c0720cc32e2df7a8346be7d5f87901eb261",
 "source/src/Lawn/System/ZombotanySurvival.cpp": "f2aefa0cdad14707a7026b098c56647b014a2c064516564de5361101b985abb0",
 "source/src/Lawn/System/ZombotanySurvival.h": "dd0683431f0dfa7b3268f32daff3294e5edee8118d255640b1cef75bcc100934",
 "source/src/Lawn/System/Zombotany45.cpp": "942479f958214242bd73beea97d442d0bcb6ad6fd5f2f5eba3e47a00ebaf3017",
 "source/src/Lawn/System/Zombotany45.h": "fdeafc313d248746afb7819ef6b03307c1c8267e4b4cb366ac07425075bdb676"
}); // Root audited all ten current files and all source uses of these counters.
const PATHS=Object.freeze(['source/src/ConstEnums.h','source/src/Lawn/Challenge.cpp','source/src/Lawn/Challenge.h',
 'source/src/Lawn/Board.cpp','source/src/LawnApp.cpp','source/src/Lawn/System/SaveGame.cpp',
 'source/src/Lawn/System/ZombotanySurvival.cpp','source/src/Lawn/System/ZombotanySurvival.h',
 'source/src/Lawn/System/Zombotany45.cpp','source/src/Lawn/System/Zombotany45.h'].sort());

export async function verifyZsurvivalCloudSourceGuard({read,sha,engineId,normalReceiptSha256,engine}){
 assert.equal(engineId,CURRENT_ENGINE_ID);assert.equal(engineId,'0.2.6-web-zvase.1');
 assert(CURRENT_NORMAL_RECEIPT_SHA256);assert.equal(normalReceiptSha256,CURRENT_NORMAL_RECEIPT_SHA256);
 assert(CURRENT_SOURCE_PINS,'Current ten-source unused-Day-counter audit has not been independently reviewed');
 assert.deepEqual(Object.keys(CURRENT_SOURCE_PINS).sort(),PATHS);
 for(const[name,pin]of Object.entries(CURRENT_SOURCE_PINS))assert.equal(sha(await read(name)),pin,name);
 const parent=await zvaseParentSourceReader({read,sha,engine});
 await verifyPublishedGuard({read:parent.read,sha,engineId:ZVASE_PARENT_ENGINE_ID,
  normalReceiptSha256:ZVASE_PARENT_NORMAL_SHA256});
 return {currentSourceFilesGuarded:10,publishedSourceFilesGuarded:10,mode:96,background:0,unusedCounterFields:6};
}

export function projectZsurvival1CloudCanonical(report){
 assert.equal(report.engineId,'0.2.6-web-zvase.1');
 const projected=projectPublished({...report,engineId:ZVASE_PARENT_ENGINE_ID});
 return {...projected,engineId:report.engineId};
}
