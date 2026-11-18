// SPDX-License-Identifier: MIT
// Cross-run comparison of the six unused DAY Survival cloud counters only.
// Raw native saves, native report strings and intra-run equality stay intact.
import assert from 'node:assert/strict';
const ENGINE='0.2.6-web-zsurvival.1';
export const ZSURVIVAL_CLOUD_NORMAL_SHA256='6ea3a215e5c3e7ac3e4cccd238e9c759173e68ebd248b6cadfbb48e76d033fe8';
export const ZSURVIVAL_UNUSED_CLOUD_INDICES=Object.freeze([7,9,11,13,15,17]); // Includes terrain tag at0.
// Independently reviewed frozen source: these counters are serialized, but read
// only by Tree of Wisdom and94/95 butter leases. Mode96 never consumes them.
export const ZSURVIVAL_CLOUD_SOURCE_PINS=Object.freeze({
 'source/src/ConstEnums.h':'c66a5deaefdcb67dc9d7321975f4b92eab7442262e211dfec6c4aa58e697e6f6',
 'source/src/Lawn/Challenge.cpp':'8156e4490e06dcefe52dec5a9c71af02647c71198e77fa4022f865e91bf920a7',
 'source/src/Lawn/Challenge.h':'6fcde9bd2ed500b7355737b0ca1febce8ac5a32728e07d0a4590f7828413bde0',
 'source/src/Lawn/Board.cpp':'50dfdc2d580c9384ae043ce36e2a1eab1b63789add57468b411e456cf2f35449',
 'source/src/LawnApp.cpp':'9fe3503f71f0557eb42f5333bbe6612754dcd66ca1b9d90cd3eb496ca5c60673',
 'source/src/Lawn/System/SaveGame.cpp':'1deb4fe9a316ddaa1473839c70bc7c0720cc32e2df7a8346be7d5f87901eb261',
 'source/src/Lawn/System/ZombotanySurvival.cpp':'f2aefa0cdad14707a7026b098c56647b014a2c064516564de5361101b985abb0',
 'source/src/Lawn/System/ZombotanySurvival.h':'dd0683431f0dfa7b3268f32daff3294e5edee8118d255640b1cef75bcc100934',
 'source/src/Lawn/System/Zombotany45.cpp':'942479f958214242bd73beea97d442d0bcb6ad6fd5f2f5eba3e47a00ebaf3017',
 'source/src/Lawn/System/Zombotany45.h':'fdeafc313d248746afb7819ef6b03307c1c8267e4b4cb366ac07425075bdb676',
});

export async function verifyZsurvivalCloudSourceGuard({read,sha,engineId,normalReceiptSha256}){
 assert.equal(engineId,ENGINE);assert.equal(normalReceiptSha256,ZSURVIVAL_CLOUD_NORMAL_SHA256);
 for(const[name,pin]of Object.entries(ZSURVIVAL_CLOUD_SOURCE_PINS))assert.equal(sha(await read(name)),pin,name);
 return {sourceFilesGuarded:10,mode:96,background:0,unusedCounterFields:6};
}

function graphForCrossRun(raw){
 assert.equal(typeof raw,'string');const parts=raw.split(';');
 const indices=parts.map((p,i)=>p.startsWith('terrain,')?i:-1).filter(i=>i>=0);
 assert.equal(indices.length,1,'Exactly one native terrain record is required');
 const index=indices[0],values=parts[index].split(',');
 assert.equal(values.length,135,'Exact native134-field terrain layout is required');
 assert.equal(values[0],'terrain');assert.equal(values[1],'0','Only DAY background0 is eligible');
 for(const i of ZSURVIVAL_UNUSED_CLOUD_INDICES){
  assert(/^(?:0|-?[1-9]\d*)$/.test(values[i]),'Unused counters must still be canonical native integer tokens');
  const value=Number(values[i]);assert(Number.isSafeInteger(value)&&value>=-2147483648&&value<=2147483647);
  values[i]='0';
 }
 parts[index]=values.join(',');return parts.join(';');
}

// Call only after source/build and EVERY raw scenario/log have been validated.
// This returns copies for comparison; it neither rewrites the report nor drops
// log identities. The caller's existing log-SHA exclusion remains separate.
export function projectZsurvival1CloudCanonical(report){
 assert.equal(report.engineId,ENGINE);assert(Array.isArray(report.scenarios));
 return {...report,scenarios:report.scenarios.map(row=>{
  assert.equal(row.mode,96);assert.equal(row.profileIndex,95);
  if(!row.checkpoint?.performed)return row;
  assert.equal(row.family,'zsurvival1-day');assert(['save-combat','save-transition'].includes(row.name));
  const cp=row.checkpoint;assert.equal(typeof cp.beforeGraph,'string');assert(cp.beforeGraph.length>500);
  assert.equal(cp.beforeGraph,cp.afterGraph,'Raw Save/Continue graph equality cannot be projected away');
  return {...row,checkpoint:{...cp,beforeGraph:graphForCrossRun(cp.beforeGraph),afterGraph:graphForCrossRun(cp.afterGraph)}};
 })};
}
