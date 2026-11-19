// SPDX-License-Identifier: MIT
// Exact published Gust assertions plus narrowly reviewed Zombotany3 collaborators.
import assert from 'node:assert/strict';
import {CURRENT_ENGINE_ID,CURRENT_SOURCE_COUNT,ZOMBOTANY3_SOURCE_ADDITIONS,ZSURVIVAL_SOURCE_ADDITIONS,ZVASE_SOURCE_ADDITIONS,GUST_ENGINE_ID,
 GUST_ARCHIVE_SHA256,ZOMBOTANY3_PARENT_TEST_INPUTS_SHA256,verifyZombotany3RetainedParentInputs,historicalEngine}
 from './native-release-context.mjs';

const FOLDER='tests/zombotany3-focused-retention/';
const COUNTS={"game-speed":81,"qol-controls":90,"decks-cooldowns":274,"bonus-challenge":394,"bonus-completion":1382,"night-shift":231,"lantern-shroom":1724,"garden-shuffle":214,"seed-swap":587,"mender-bloom":523,"intensive-care":1135,"native-layout":27157,"care-fatigue":25042};
export const ZOMBOTANY3_FOCUSED_CHECK_EXTENSIONS=Object.freeze({'bonus-completion':5});
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
    },
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker')",
      "count": 1,
      "reason": "Retain every old dependency and authenticate the immediate-parent Survival pair plus the new Vasebreaker pair."
    },
    {
      "before": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})\nresult['sourceSha256']['source/src/Lawn/System/ZombotanyVasebreakerBoards.h']=hashlib.sha256((ROOT/'source/src/Lawn/System/ZombotanyVasebreakerBoards.h').read_bytes()).hexdigest()",
      "count": 1,
      "reason": "Authenticate the third authored-data header; remove no previous source binding."
    }
  ],
  "qol-controls": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "count": 1,
      "reason": "Bind all published Gust production dependencies plus all eight appended Zombotany3/45 source files; remove no original dependency."
    },
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker')",
      "count": 1,
      "reason": "Retain every old dependency and authenticate the immediate-parent Survival pair plus the new Vasebreaker pair."
    },
    {
      "before": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})\nresult['sourceSha256']['source/src/Lawn/System/ZombotanyVasebreakerBoards.h']=hashlib.sha256((ROOT/'source/src/Lawn/System/ZombotanyVasebreakerBoards.h').read_bytes()).hexdigest()",
      "count": 1,
      "reason": "Authenticate the third authored-data header; remove no previous source binding."
    }
  ],
  "decks-cooldowns": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "count": 1,
      "reason": "Bind all published Gust production dependencies plus all eight appended Zombotany3/45 source files; remove no original dependency."
    },
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker')",
      "count": 1,
      "reason": "Retain every old dependency and authenticate the immediate-parent Survival pair plus the new Vasebreaker pair."
    },
    {
      "before": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})\nresult['sourceSha256']['source/src/Lawn/System/ZombotanyVasebreakerBoards.h']=hashlib.sha256((ROOT/'source/src/Lawn/System/ZombotanyVasebreakerBoards.h').read_bytes()).hexdigest()",
      "count": 1,
      "reason": "Authenticate the third authored-data header; remove no previous source binding."
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
    },
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker')",
      "count": 1,
      "reason": "Retain every old dependency and authenticate the immediate-parent Survival pair plus the new Vasebreaker pair."
    },
    {
      "before": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})\nresult['sourceSha256']['source/src/Lawn/System/ZombotanyVasebreakerBoards.h']=hashlib.sha256((ROOT/'source/src/Lawn/System/ZombotanyVasebreakerBoards.h').read_bytes()).hexdigest()",
      "count": 1,
      "reason": "Authenticate the third authored-data header; remove no previous source binding."
    },
    {
      "before": "GAMEMODE_SURVIVAL_ZOMBOTANY_DAY==96&&NUM_GAME_MODES==97",
      "after": "GAMEMODE_SURVIVAL_ZOMBOTANY_DAY==96&&GAMEMODE_CHALLENGE_ZOMBOTANY_VASEBREAKER==97&&NUM_GAME_MODES==98",
      "count": 2,
      "reason": "Preserve all earlier mode identities and append only mode97/terminal98."
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
    },
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker')",
      "count": 1,
      "reason": "Retain every old dependency and authenticate the immediate-parent Survival pair plus the new Vasebreaker pair."
    },
    {
      "before": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})\nresult['sourceSha256']['source/src/Lawn/System/ZombotanyVasebreakerBoards.h']=hashlib.sha256((ROOT/'source/src/Lawn/System/ZombotanyVasebreakerBoards.h').read_bytes()).hexdigest()",
      "count": 1,
      "reason": "Authenticate the third authored-data header; remove no previous source binding."
    },
    {
      "before": "GAMEMODE_SURVIVAL_ZOMBOTANY_DAY==96&&NUM_GAME_MODES==97",
      "after": "GAMEMODE_SURVIVAL_ZOMBOTANY_DAY==96&&GAMEMODE_CHALLENGE_ZOMBOTANY_VASEBREAKER==97&&NUM_GAME_MODES==98",
      "count": 1,
      "reason": "Preserve all earlier mode identities and append only mode97/terminal98."
    },
    {
      "before": "ambushRetainedChecks==1310",
      "after": "ambushRetainedChecks==1311",
      "count": 1,
      "reason": "One additional actual catalog-definition iteration; every published per-definition assertion remains."
    },
    {
      "before": "NUM_CHALLENGE_MODES==96&&GAMEMODE_SURVIVAL_ZOMBOTANY_DAY==96",
      "after": "NUM_CHALLENGE_MODES==97&&GAMEMODE_SURVIVAL_ZOMBOTANY_DAY==96&&GAMEMODE_CHALLENGE_ZOMBOTANY_VASEBREAKER==97",
      "count": 1,
      "reason": "Append the seventh family definition while preserving all old identities."
    },
    {
      "before": "cpp.write_text(head +",
      "after": "head += '\\nnamespace ZombotanyVasebreaker { constexpr bool IsMode(GameMode mode){return mode==GAMEMODE_CHALLENGE_ZOMBOTANY_VASEBREAKER;} constexpr int kBoardCount=5,kProfileIndex=96; constexpr ChallengeState kFinished=static_cast<ChallengeState>(154); template<class T>void ResetStage(T&,int){assert(false&&\"Vasebreaker restart belongs to the complete new-mode suite\");} }\\n'\ncpp.write_text(head +",
      "count": 1,
      "reason": "Supply only exact new-mode classification/constants and a fail-fast out-of-scope restart collaborator; no prior assertion changes."
    },
    {
      "before": "#include \"../source/src/GameConstants.h\"",
      "after": "#include \"../source/src/GameConstants.h\"\n#include \"../source/src/Lawn/System/ZombotanyVasebreaker.h\"",
      "count": 1,
      "reason": "Compile the unchanged legacy extracted methods with the actual new-mode header before catalog or footer references; preserve every prior assertion."
    },
    {
      "before": "head += '\\nnamespace ZombotanyVasebreaker { constexpr bool IsMode(GameMode mode){return mode==GAMEMODE_CHALLENGE_ZOMBOTANY_VASEBREAKER;} constexpr int kBoardCount=5,kProfileIndex=96; constexpr ChallengeState kFinished=static_cast<ChallengeState>(154); template<class T>void ResetStage(T&,int){assert(false&&\"Vasebreaker restart belongs to the complete new-mode suite\");} }\\n'",
      "after": "head += '\\nnamespace ZombotanyVasebreaker { void ResetStage(Board&,int){assert(false&&\"Vasebreaker restart belongs to the complete new-mode suite\");} }\\n'",
      "count": 1,
      "reason": "Use real new-mode constants and predicate from the production header, leaving only a fail-fast out-of-scope ResetStage link collaborator; preserve all previous checks."
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
    },
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker')",
      "count": 1,
      "reason": "Retain every old dependency and authenticate the immediate-parent Survival pair plus the new Vasebreaker pair."
    },
    {
      "before": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})\nresult['sourceSha256']['source/src/Lawn/System/ZombotanyVasebreakerBoards.h']=hashlib.sha256((ROOT/'source/src/Lawn/System/ZombotanyVasebreakerBoards.h').read_bytes()).hexdigest()",
      "count": 1,
      "reason": "Authenticate the third authored-data header; remove no previous source binding."
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
    },
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker')",
      "count": 1,
      "reason": "Retain every old dependency and authenticate the immediate-parent Survival pair plus the new Vasebreaker pair."
    },
    {
      "before": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})\nresult['sourceSha256']['source/src/Lawn/System/ZombotanyVasebreakerBoards.h']=hashlib.sha256((ROOT/'source/src/Lawn/System/ZombotanyVasebreakerBoards.h').read_bytes()).hexdigest()",
      "count": 1,
      "reason": "Authenticate the third authored-data header; remove no previous source binding."
    },
    {
      "before": "#include \"../source/src/GameConstants.h\"",
      "after": "#include \"../source/src/GameConstants.h\"\n#include \"../source/src/Lawn/System/ZombotanyVasebreaker.h\"",
      "count": 1,
      "reason": "Compile the unchanged legacy extracted methods with the actual new-mode header before catalog or footer references; preserve every prior assertion."
    }
  ],
  "garden-shuffle": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "count": 1,
      "reason": "Bind all published Gust production dependencies plus all eight appended Zombotany3/45 source files; remove no original dependency."
    },
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker')",
      "count": 1,
      "reason": "Retain every old dependency and authenticate the immediate-parent Survival pair plus the new Vasebreaker pair."
    },
    {
      "before": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})\nresult['sourceSha256']['source/src/Lawn/System/ZombotanyVasebreakerBoards.h']=hashlib.sha256((ROOT/'source/src/Lawn/System/ZombotanyVasebreakerBoards.h').read_bytes()).hexdigest()",
      "count": 1,
      "reason": "Authenticate the third authored-data header; remove no previous source binding."
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
    },
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker')",
      "count": 1,
      "reason": "Retain every old dependency and authenticate the immediate-parent Survival pair plus the new Vasebreaker pair."
    },
    {
      "before": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})\nresult['sourceSha256']['source/src/Lawn/System/ZombotanyVasebreakerBoards.h']=hashlib.sha256((ROOT/'source/src/Lawn/System/ZombotanyVasebreakerBoards.h').read_bytes()).hexdigest()",
      "count": 1,
      "reason": "Authenticate the third authored-data header; remove no previous source binding."
    },
    {
      "before": "GAMEMODE_SURVIVAL_ZOMBOTANY_DAY==96&&NUM_GAME_MODES==97",
      "after": "GAMEMODE_SURVIVAL_ZOMBOTANY_DAY==96&&GAMEMODE_CHALLENGE_ZOMBOTANY_VASEBREAKER==97&&NUM_GAME_MODES==98",
      "count": 1,
      "reason": "Preserve all earlier mode identities and append only mode97/terminal98."
    }
  ],
  "mender-bloom": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "count": 1,
      "reason": "Bind all published Gust production dependencies plus all eight appended Zombotany3/45 source files; remove no original dependency."
    },
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker')",
      "count": 1,
      "reason": "Retain every old dependency and authenticate the immediate-parent Survival pair plus the new Vasebreaker pair."
    },
    {
      "before": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})\nresult['sourceSha256']['source/src/Lawn/System/ZombotanyVasebreakerBoards.h']=hashlib.sha256((ROOT/'source/src/Lawn/System/ZombotanyVasebreakerBoards.h').read_bytes()).hexdigest()",
      "count": 1,
      "reason": "Authenticate the third authored-data header; remove no previous source binding."
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
    },
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker')",
      "count": 1,
      "reason": "Retain every old dependency and authenticate the immediate-parent Survival pair plus the new Vasebreaker pair."
    },
    {
      "before": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})\nresult['sourceSha256']['source/src/Lawn/System/ZombotanyVasebreakerBoards.h']=hashlib.sha256((ROOT/'source/src/Lawn/System/ZombotanyVasebreakerBoards.h').read_bytes()).hexdigest()",
      "count": 1,
      "reason": "Authenticate the third authored-data header; remove no previous source binding."
    },
    {
      "before": "GAMEMODE_SURVIVAL_ZOMBOTANY_DAY==96&&NUM_GAME_MODES==97",
      "after": "GAMEMODE_SURVIVAL_ZOMBOTANY_DAY==96&&GAMEMODE_CHALLENGE_ZOMBOTANY_VASEBREAKER==97&&NUM_GAME_MODES==98",
      "count": 1,
      "reason": "Preserve all earlier mode identities and append only mode97/terminal98."
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
    },
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker')",
      "count": 1,
      "reason": "Retain every old dependency and authenticate the immediate-parent Survival pair plus the new Vasebreaker pair."
    },
    {
      "before": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})\nresult['sourceSha256']['source/src/Lawn/System/ZombotanyVasebreakerBoards.h']=hashlib.sha256((ROOT/'source/src/Lawn/System/ZombotanyVasebreakerBoards.h').read_bytes()).hexdigest()",
      "count": 1,
      "reason": "Authenticate the third authored-data header; remove no previous source binding."
    },
    {
      "before": "GAMEMODE_SURVIVAL_ZOMBOTANY_DAY==96&&static_cast<int>(GameMode::NUM_GAME_MODES)==97",
      "after": "GAMEMODE_SURVIVAL_ZOMBOTANY_DAY==96&&GAMEMODE_CHALLENGE_ZOMBOTANY_VASEBREAKER==97&&static_cast<int>(GameMode::NUM_GAME_MODES)==98",
      "count": 2,
      "reason": "Preserve all earlier mode identities and append only mode97/terminal98."
    },
    {
      "before": "current_draw_button=current_draw_button.replace(zombotany_survival_guard,'\\t\\t\\t',1)\n",
      "after": "current_draw_button=current_draw_button.replace(zombotany_survival_guard,'\\t\\t\\t',1)\nzombotany_vase_guard='\\t\\t\\tif (ZombotanyVasebreaker::IsMode(aDef.mChallengeMode))\\n\\t\\t\\t{\\n\\t\\t\\t\\tif (Image* image = GetZombotanyVasebreakerImage()) g->DrawImage(image, aPosX + 13, aPosY + 4);\\n\\t\\t\\t}\\n\\t\\t\\telse '\nassert current_draw_button.count(zombotany_vase_guard)==1\ncurrent_draw_button=current_draw_button.replace(zombotany_vase_guard,'\\t\\t\\t',1)\n",
      "count": 1,
      "reason": "Exclude only the separately proved new-mode thumbnail branch before the exact historical native-renderer comparison."
    },
    {
      "before": "#include \"../source/src/GameConstants.h\"",
      "after": "#include \"../source/src/GameConstants.h\"\n#include \"../source/src/Lawn/System/ZombotanyVasebreaker.h\"",
      "count": 1,
      "reason": "Compile the unchanged legacy extracted methods with the actual new-mode header before catalog or footer references; preserve every prior assertion."
    }
  ],
  "care-fatigue": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "count": 1,
      "reason": "Bind all published Gust production dependencies plus all eight appended Zombotany3/45 source files; remove no original dependency."
    },
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker')",
      "count": 1,
      "reason": "Retain every old dependency and authenticate the immediate-parent Survival pair plus the new Vasebreaker pair."
    },
    {
      "before": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})",
      "after": "result['sourceSha256'].update({'source/src/Lawn/System/'+stem+suffix:hashlib.sha256((ROOT/('source/src/Lawn/System/'+stem+suffix)).read_bytes()).hexdigest() for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt','Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art','ZombotanySurvival','ZombotanyVasebreaker') for suffix in ('.h','.cpp')})\nresult['sourceSha256']['source/src/Lawn/System/ZombotanyVasebreakerBoards.h']=hashlib.sha256((ROOT/'source/src/Lawn/System/ZombotanyVasebreakerBoards.h').read_bytes()).hexdigest()",
      "count": 1,
      "reason": "Authenticate the third authored-data header; remove no previous source binding."
    }
  ]
} /* REVIEWED_ZOMBOTANY3_COMPATIBILITY_END */;

const REVIEWED_PINS = /* REVIEWED_ZOMBOTANY3_PINS_BEGIN */ {
  "pendingFinalFreeze": false,
  "adaptationsSha256": "4b64d15dac983be2724741e4fc8845ff0cab97c027356074c7657e5a4826e27a",
  "compatibilityPatchesSha256": "de8bd7ff1db81789c5375c5d7b01081219b103eab9d2b609d98ff3893bf6e753",
  "parentReportPinsSha256": "a741622b272b9c0c0727fe712d0e9251a2e5a1b237bb8c5f728d88a7b9d15044",
  "adapterSha256": "65d82b7f924c4e974b79f73f266065c2a6b94471a7806b4f1e9c7bc8676b7d54",
  "runSha256": "b62b414af34ca10de508d6807853745f1ed40a05b641be303133a16cdbdb4268",
  "normalBuildReceiptSha256": "7351dfbf72f989cddf155ac334b19e181bb898a86896817f6a26af5e1789c1dd",
  "runners": {
    "game-speed": {
      "runnerSha256": "ab702c5e16a29f5fea4e08771f5ee92584a8925170ff375ed8d9b9a0888d4c01",
      "reportSha256": "bd4862a0dc6703c0326b9df1485693ec5fa91b0890fd461c087605329e798031",
      "harnessSha256": "0299e42113cdd9a96fdc9e4ac14cf68c6144f2c3660cf14f85bb224bb3a96b6b"
    },
    "qol-controls": {
      "runnerSha256": "0fe757db708358ecb9fed14897724da78ad8972d00cdbe61dea753a285f10196",
      "reportSha256": "47a4be563dbc4a27361f5f3878f19192491a9677e7f30eb7d32f6706b04a2047",
      "harnessSha256": "26baff16227c83705bc47cc2a8afd8b8f84effa24589d2ab63024c3495527316"
    },
    "decks-cooldowns": {
      "runnerSha256": "4103fa2fbe0a24de5af11a6dd7d41da8cb480cfed74d1949a389031a6c81cddb",
      "reportSha256": "6afd100bf61abaee3b101af7e79024a6886b6eacb34abb637ff517baabffef1e",
      "harnessSha256": "42d5ba51b452d466f385fdf07d23d1b7f204b121d8d300d5b192b31f3f5bb376"
    },
    "bonus-challenge": {
      "runnerSha256": "be4ce4e2a137bfdc680cffd42be0840b12b9fdb2cdf0de86287f7c76b29dbd6c",
      "reportSha256": "7dbac7f8ac43df1ab7960360695e950587e56a0c761ad93b8ff289aa9b3b3401",
      "harnessSha256": "acedc57dda940f8455911b2e90d614b6e40676f91715c40b05cfb43eee4fb45e"
    },
    "bonus-completion": {
      "runnerSha256": "bab758e4b3b15d48378bb15d3085b9f8bd96b8da6528887031977e8b1e2fcc75",
      "reportSha256": "7474482b69b69745511fb406d6bb8d93ba59c2a9a21fb14caae20d95e510783e",
      "harnessSha256": "ec24fb475dcc1a3c02b62964aa63f9f7f17167aa67ee1ba15e542291a11c292e"
    },
    "night-shift": {
      "runnerSha256": "e34aa3b644f56c6b1e4b6fb0e446ccadccd71ec524fdfd12f33768465e813f5f",
      "reportSha256": "efd4e6dd2cd32a52d066f3f0b8555b319743b279f9bdb1d594aa3fffe64e2819",
      "harnessSha256": "2d1c73a841357a17b0281e7feb1e52668c6c837c8d25548e1478c64139f41fba"
    },
    "lantern-shroom": {
      "runnerSha256": "401871566fb3239c6ede6007a8dde81adb2440ef3d971e9d74860eedea3fe6f9",
      "reportSha256": "c3a816fe8a31f9bc65431a375e7abb8e27ff014bc480b2f116ed5a12f8229ca7",
      "harnessSha256": "e210aa0a72cd3d711bc593c66731479f53a411f59ac041511448580b75f2fba0"
    },
    "garden-shuffle": {
      "runnerSha256": "d65e6257f370b1405120f9e9fec1eb08489ecca0ce9c9f559296465f4eaa20bd",
      "reportSha256": "3c0c7a7d48a1cfec7a90b8b2b639ca5b4896d5567098f03c002aaf0d60a3236b",
      "harnessSha256": "9e06591927a1d872c72273f2db0bcbf549a16e38ffd5d491246c67d78977508d"
    },
    "seed-swap": {
      "runnerSha256": "587d9b3aa6fb76ed0d59506f050972d432730ae6090966aaf3f6bfa7d469033f",
      "reportSha256": "50b515c670e5581a36a12a8481b62a63a8a28d499466606638ebbe869aed4d1c",
      "harnessSha256": "5e8e8cb9a59e60f5ab1f84c3b99cc38e42a850139f12fbfbc3bf725a17857a6d"
    },
    "mender-bloom": {
      "runnerSha256": "11892725d210fc55bb950bc1bde438b35a192af3754a9ba8d7caeda1f6c40668",
      "reportSha256": "ddaf789ced0b1322f5fea79b36d3597d54223ea255d40cffe5182487caaf9212",
      "harnessSha256": "276c6e8db99cb037fd8cc3f92122a3998d418905d454ec20fbbca0bf198c453c"
    },
    "intensive-care": {
      "runnerSha256": "89a457ef902e116200730b090e327260c97b58081820fc46650d3f026e6d5be9",
      "reportSha256": "9bd0e7e63dd7df0ca169427215c2c62da61aa0cafb862e2e23949b2017c0b416",
      "harnessSha256": "f4466b553cc8449a9f6d42dd9cac69a9d5c8a79ff9ca2007ed94521736d72a9b"
    },
    "native-layout": {
      "runnerSha256": "60f41970e1373dd6856984ffcab6e2f3fcf8399a9e191f2d22d77ac5924256a0",
      "reportSha256": "67f3558989b4192e69d3b092556125a70fbc338200422a39cb198ba1a5ce90b2",
      "harnessSha256": "456c20c3e8571142b0129bba578c6fcdc7bd8b8515be5d185fa68c23efeb65af"
    },
    "care-fatigue": {
      "runnerSha256": "c7172b408f459ad64da2ea6c2543bd50edd4180e0825af6f2cab49c8af8ad79a",
      "reportSha256": "ca9535973da2307d10a89ff2763e4b261cf84902583d5050e40774523ab7917a",
      "harnessSha256": "60b9b05a2437b088d08bd89ca393dc4ab00d107fc4c382927e2a36068ab92130"
    }
  },
  "summaryPath": "focused-zvase-final-closure/summary.json",
  "summarySha256": "15966aacbb4f2e73caae4684cea774ea233851975b4bcb0b371f424f240b880b",
  "originSummaries": {
    "focused-zvase-initial-run/summary.json": "98e10cfeb91e43b53b998e4c62244f8d10624f4f472a7a4219ec72ae644b95ae",
    "focused-zvase-prefix-recheck/summary.json": "d12b5e5c4953739a0077ecff6936ab589e5b59e9beb7a374ea92f490fb63ebc2"
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
  const additions=[...ZOMBOTANY3_SOURCE_ADDITIONS,...ZSURVIVAL_SOURCE_ADDITIONS,...ZVASE_SOURCE_ADDITIONS].map(name=>'source/'+name);
  for(const input of additions)assert(Object.hasOwn(result.sourceSha256,input));
  assert.deepEqual(keys(result.sourceSha256),[...keys(retained.originalReports.get(name).sourceSha256),...additions].sort(),
   'Every old source dependency stays bound, with exactly thirteen appended production inputs: '+name);
  for(const [input,pin]of Object.entries(result.sourceSha256)){
   safeName(input);assert(input.startsWith('source/'));digest(pin);assert.equal(sha(await read(input)),pin);
  }
  total+=result.checks;
 }
 assert.equal(total,58839);
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
 console.log('PASS Zombotany3 focused retention:58,834 exact published assertions plus5 catalog iterations; all13 current and silent.');
}
