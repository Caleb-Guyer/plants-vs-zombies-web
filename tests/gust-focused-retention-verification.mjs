// SPDX-License-Identifier: MIT
// Exact published Double assertions plus narrowly reviewed Gust collaborators.
import assert from 'node:assert/strict';
import {CURRENT_ENGINE_ID,CURRENT_SOURCE_COUNT,GUST_SOURCE_ADDITIONS,DOUBLE_ENGINE_ID,
 DOUBLE_ARCHIVE_SHA256,GUST_PARENT_TEST_INPUTS_SHA256,verifyGustRetainedParentInputs}
 from './native-release-context.mjs';

const FOLDER='tests/gust1-focused-retention/';
const COUNTS={'game-speed':81,'qol-controls':90,'decks-cooldowns':274,'bonus-challenge':394,
 'bonus-completion':1381,'night-shift':231,'lantern-shroom':1724,'garden-shuffle':214,
 'seed-swap':587,'mender-bloom':523,'intensive-care':1135,'native-layout':27157,'care-fatigue':25042};
export const GUST_FOCUSED_CHECK_EXTENSIONS=Object.freeze({'bonus-completion':1});
const PARENT_REPORT_PINS='6772cdf9b8429ea445040c244a1544e345c68981cd0873b7e3768ff55bb711e1';

// Independently reviewed literal operations: original case bodies, messages and
// thresholds cannot be replaced by an operation merely supplied by the adapter.
const REVIEWED_OPERATIONS = /* REVIEWED_GUST_COMPATIBILITY_BEGIN */ {
  "game-speed": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "count": 1,
      "reason": "Bind every prior source dependency and exactly six additional Gust production files; no original pin is removed."
    }
  ],
  "qol-controls": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "count": 1,
      "reason": "Bind every prior source dependency and exactly six additional Gust production files; no original pin is removed."
    }
  ],
  "decks-cooldowns": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "count": 1,
      "reason": "Bind every prior source dependency and exactly six additional Gust production files; no original pin is removed."
    },
    {
      "before": "cpp.write_text(head + actual_curve + '\\n' + actual_unlock + '\\n' + actual_methods + '\\n' + actual_eligibility + '\\n' + tail, encoding='utf-8', newline='\\n')",
      "after": "head += '\\nnamespace GustBloom { bool IsUnlocked(const LawnApp*){return false;} }\\n'\ncpp.write_text(head + actual_curve + '\\n' + actual_unlock + '\\n' + actual_methods + '\\n' + actual_eligibility + '\\n' + tail, encoding='utf-8', newline='\\n')",
      "count": 1,
      "reason": "Supply only newly introduced out-of-scope Gust collaborators; every original actor/mode/case input remains unchanged."
    },
    {
      "before": "chooser_header=(ROOT/'source/src/Lawn/Widget/SeedChooserScreen.h').read_text(encoding='utf-8')",
      "after": "chooser_header=(ROOT/'source/src/Lawn/Widget/SeedChooserScreen.h').read_text(encoding='utf-8')\nassert chooser_header.count('static constexpr int ChooserSeedCount() { return NUM_SEEDS_IN_CHOOSER + 3; }\\n\\tstatic constexpr SeedType ChooserSeedType(int index)\\n\\t{\\n\\t\\treturn index == NUM_SEEDS_IN_CHOOSER ? SEED_LANTERNSHROOM :\\n\\t\\t\\tindex == NUM_SEEDS_IN_CHOOSER + 1 ? SEED_MENDERBLOOM :\\n\\t\\t\\tindex == NUM_SEEDS_IN_CHOOSER + 2 ? SEED_GUSTBLOOM : static_cast<SeedType>(index);\\n\\t}\\n\\tstatic constexpr bool IsChooserSeed(int type)\\n\\t{\\n\\t\\treturn (type >= SEED_PEASHOOTER && type < NUM_SEEDS_IN_CHOOSER) || type == SEED_LANTERNSHROOM || type == SEED_MENDERBLOOM || type == SEED_GUSTBLOOM;\\n\\t}\\n\\tstatic constexpr int ChosenSeedIndex(int type)\\n\\t{\\n\\t\\treturn type == SEED_LANTERNSHROOM ? NUM_SEEDS_IN_CHOOSER :\\n\\t\\t\\ttype == SEED_MENDERBLOOM ? NUM_SEEDS_IN_CHOOSER + 1 :\\n\\t\\t\\ttype == SEED_GUSTBLOOM ? NUM_SEEDS_IN_CHOOSER + 2 : type;\\n\\t}\\n\\tstatic_assert(NUM_SEEDS_IN_CHOOSER + 3 <= NUM_SEED_TYPES);') == 1\nchooser_header=chooser_header.replace('static constexpr int ChooserSeedCount() { return NUM_SEEDS_IN_CHOOSER + 3; }\\n\\tstatic constexpr SeedType ChooserSeedType(int index)\\n\\t{\\n\\t\\treturn index == NUM_SEEDS_IN_CHOOSER ? SEED_LANTERNSHROOM :\\n\\t\\t\\tindex == NUM_SEEDS_IN_CHOOSER + 1 ? SEED_MENDERBLOOM :\\n\\t\\t\\tindex == NUM_SEEDS_IN_CHOOSER + 2 ? SEED_GUSTBLOOM : static_cast<SeedType>(index);\\n\\t}\\n\\tstatic constexpr bool IsChooserSeed(int type)\\n\\t{\\n\\t\\treturn (type >= SEED_PEASHOOTER && type < NUM_SEEDS_IN_CHOOSER) || type == SEED_LANTERNSHROOM || type == SEED_MENDERBLOOM || type == SEED_GUSTBLOOM;\\n\\t}\\n\\tstatic constexpr int ChosenSeedIndex(int type)\\n\\t{\\n\\t\\treturn type == SEED_LANTERNSHROOM ? NUM_SEEDS_IN_CHOOSER :\\n\\t\\t\\ttype == SEED_MENDERBLOOM ? NUM_SEEDS_IN_CHOOSER + 1 :\\n\\t\\t\\ttype == SEED_GUSTBLOOM ? NUM_SEEDS_IN_CHOOSER + 2 : type;\\n\\t}\\n\\tstatic_assert(NUM_SEEDS_IN_CHOOSER + 3 <= NUM_SEED_TYPES);','static constexpr int ChooserSeedCount() { return NUM_SEEDS_IN_CHOOSER + 2; }\\n\\tstatic constexpr SeedType ChooserSeedType(int index)\\n\\t{\\n\\t\\treturn index == NUM_SEEDS_IN_CHOOSER ? SEED_LANTERNSHROOM :\\n\\t\\t\\tindex == NUM_SEEDS_IN_CHOOSER + 1 ? SEED_MENDERBLOOM : static_cast<SeedType>(index);\\n\\t}\\n\\tstatic constexpr bool IsChooserSeed(int type)\\n\\t{\\n\\t\\treturn (type >= SEED_PEASHOOTER && type < NUM_SEEDS_IN_CHOOSER) || type == SEED_LANTERNSHROOM || type == SEED_MENDERBLOOM;\\n\\t}\\n\\tstatic constexpr int ChosenSeedIndex(int type)\\n\\t{\\n\\t\\treturn type == SEED_LANTERNSHROOM ? NUM_SEEDS_IN_CHOOSER :\\n\\t\\t\\ttype == SEED_MENDERBLOOM ? NUM_SEEDS_IN_CHOOSER + 1 : type;\\n\\t}\\n\\tstatic_assert(NUM_SEEDS_IN_CHOOSER + 2 <= NUM_SEED_TYPES);',1)",
      "count": 1,
      "reason": "Project only the appended Gust catalog helper branches out of the controlled legacy UI submodel; retain every original51-slot assertion unchanged. Full-engine Gust controls exercise the current52-slot chooser/Almanac."
    }
  ],
  "bonus-challenge": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "count": 1,
      "reason": "Bind every prior source dependency and exactly six additional Gust production files; no original pin is removed."
    },
    {
      "before": "NUM_GAME_MODES==92",
      "after": "NUM_GAME_MODES==93",
      "count": 2,
      "reason": "Account only for the appended Headwind mode sentinel, retaining every preceding explicit identity and assertion."
    }
  ],
  "bonus-completion": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "count": 1,
      "reason": "Bind every prior source dependency and exactly six additional Gust production files; no original pin is removed."
    },
    {
      "before": "NUM_GAME_MODES==92",
      "after": "NUM_GAME_MODES==93",
      "count": 1,
      "reason": "Account only for the appended Headwind mode sentinel, retaining every preceding explicit identity and assertion."
    },
    {
      "before": "NUM_CHALLENGE_MODES==91",
      "after": "NUM_CHALLENGE_MODES==92",
      "count": 1,
      "reason": "One native catalog definition is appended; every old definition remains in order."
    },
    {
      "before": "ambushRetainedChecks==1305",
      "after": "ambushRetainedChecks==1306",
      "count": 1,
      "reason": "Count exactly one additional iteration through the actual catalog before the unchanged Vase assertions."
    },
    {
      "before": "cpp.write_text(head + '\\n\\n'.join(methods) + tail, encoding='utf-8', newline='\\n')",
      "after": "head += '\\nnamespace GustBloom { bool IsUnlocked(const LawnApp*){return false;} }\\n'\ncpp.write_text(head + '\\n\\n'.join(methods) + tail, encoding='utf-8', newline='\\n')",
      "count": 1,
      "reason": "Supply only newly introduced out-of-scope Gust collaborators; every original actor/mode/case input remains unchanged."
    }
  ],
  "night-shift": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "count": 1,
      "reason": "Bind every prior source dependency and exactly six additional Gust production files; no original pin is removed."
    }
  ],
  "lantern-shroom": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "count": 1,
      "reason": "Bind every prior source dependency and exactly six additional Gust production files; no original pin is removed."
    },
    {
      "before": "cpp.write_text(head + constants + '\\n' + methods + tail, encoding='utf-8', newline='\\n')",
      "after": "head += '\\n#include \"../source/src/Lawn/System/GustBloom.h\"\\nnamespace GustBloomArt { Sexy::Image* GetImage(){return nullptr;} Sexy::Image* GetHeadwindImage(){return nullptr;} void EnsurePlantReanimation(Plant&){} void DrawPlantRig(Sexy::Graphics*,const Plant&,Reanimation&){} }\\n'\ncpp.write_text(head + constants + '\\n' + methods + tail, encoding='utf-8', newline='\\n')",
      "count": 1,
      "reason": "Supply only newly introduced out-of-scope Gust collaborators; every original actor/mode/case input remains unchanged."
    }
  ],
  "garden-shuffle": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "count": 1,
      "reason": "Bind every prior source dependency and exactly six additional Gust production files; no original pin is removed."
    }
  ],
  "seed-swap": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "count": 1,
      "reason": "Bind every prior source dependency and exactly six additional Gust production files; no original pin is removed."
    },
    {
      "before": "NUM_GAME_MODES==92",
      "after": "NUM_GAME_MODES==93",
      "count": 1,
      "reason": "Account only for the appended Headwind mode sentinel, retaining every preceding explicit identity and assertion."
    }
  ],
  "mender-bloom": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "count": 1,
      "reason": "Bind every prior source dependency and exactly six additional Gust production files; no original pin is removed."
    },
    {
      "before": "cpp.write_text(head + core_harness + almanac + tail, encoding='utf-8', newline='\\n')",
      "after": "head += '\\nnamespace GustBloom { void Update(Plant&){} }\\n'\ncpp.write_text(head + core_harness + almanac + tail, encoding='utf-8', newline='\\n')",
      "count": 1,
      "reason": "Supply only newly introduced out-of-scope Gust collaborators; every original actor/mode/case input remains unchanged."
    },
    {
      "before": "almanac_header = inputs['source/src/Lawn/Widget/AlmanacDialog.h'].decode('utf-8')",
      "after": "almanac_header = inputs['source/src/Lawn/Widget/AlmanacDialog.h'].decode('utf-8')\nassert almanac_header.count('static constexpr int AlmanacSeedCount() { return NUM_ALMANAC_SEEDS + 3; }\\n\\tstatic constexpr SeedType AlmanacSeedType(int index)\\n\\t{\\n\\t\\treturn index == NUM_ALMANAC_SEEDS ? SEED_LANTERNSHROOM :\\n\\t\\t\\tindex == NUM_ALMANAC_SEEDS + 1 ? SEED_MENDERBLOOM :\\r\\n\\t\\t\\tindex == NUM_ALMANAC_SEEDS + 2 ? SEED_GUSTBLOOM : static_cast<SeedType>(index);\\n\\t}\\n\\tstatic const char* GetAddonAlmanacDescription(SeedType theSeedType);') == 1\nalmanac_header=almanac_header.replace('static constexpr int AlmanacSeedCount() { return NUM_ALMANAC_SEEDS + 3; }\\n\\tstatic constexpr SeedType AlmanacSeedType(int index)\\n\\t{\\n\\t\\treturn index == NUM_ALMANAC_SEEDS ? SEED_LANTERNSHROOM :\\n\\t\\t\\tindex == NUM_ALMANAC_SEEDS + 1 ? SEED_MENDERBLOOM :\\r\\n\\t\\t\\tindex == NUM_ALMANAC_SEEDS + 2 ? SEED_GUSTBLOOM : static_cast<SeedType>(index);\\n\\t}\\n\\tstatic const char* GetAddonAlmanacDescription(SeedType theSeedType);','static constexpr int AlmanacSeedCount() { return NUM_ALMANAC_SEEDS + 2; }\\n\\tstatic constexpr SeedType AlmanacSeedType(int index)\\n\\t{\\n\\t\\treturn index == NUM_ALMANAC_SEEDS ? SEED_LANTERNSHROOM :\\n\\t\\t\\tindex == NUM_ALMANAC_SEEDS + 1 ? SEED_MENDERBLOOM : static_cast<SeedType>(index);\\n\\t}\\n\\tstatic const char* GetAddonAlmanacDescription(SeedType theSeedType);',1)",
      "count": 1,
      "reason": "Project only the appended Gust catalog helper branches out of the controlled legacy UI submodel; retain every original51-slot assertion unchanged. Full-engine Gust controls exercise the current52-slot chooser/Almanac."
    }
  ],
  "intensive-care": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "count": 1,
      "reason": "Bind every prior source dependency and exactly six additional Gust production files; no original pin is removed."
    },
    {
      "before": "NUM_GAME_MODES==92",
      "after": "NUM_GAME_MODES==93",
      "count": 1,
      "reason": "Account only for the appended Headwind mode sentinel, retaining every preceding explicit identity and assertion."
    },
    {
      "before": "cpp.write_text(head + methods + transport + tests, encoding='utf-8', newline='\\n')",
      "after": "head += '\\nnamespace GustBloom { void Update(Plant&){} }\\n'\ncpp.write_text(head + methods + transport + tests, encoding='utf-8', newline='\\n')",
      "count": 1,
      "reason": "Supply only newly introduced out-of-scope Gust collaborators; every original actor/mode/case input remains unchanged."
    }
  ],
  "native-layout": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "count": 1,
      "reason": "Bind every prior source dependency and exactly six additional Gust production files; no original pin is removed."
    },
    {
      "before": "assert len(raid_card_positions)==19 and raid_card_positions[18]==('4','3')",
      "after": "assert len(raid_card_positions)==20 and raid_card_positions[18]==('4','3') and raid_card_positions[19]==('4','4')",
      "count": 1,
      "reason": "Retain all nineteen prior native catalog positions and require only the new twentieth position."
    },
    {
      "before": "cpp=OUT/'native-layout-harness.cpp';cpp.write_text(head+'\\n'+methods+'\\n'+tests,encoding='utf-8',newline='\\n')",
      "after": "head += '\\nnamespace GustBloomArt { std::string LevelLabel(int){return \"Headwind\";} }\\n'\ncpp=OUT/'native-layout-harness.cpp';cpp.write_text(head+'\\n'+methods+'\\n'+tests,encoding='utf-8',newline='\\n')",
      "count": 1,
      "reason": "Supply only newly introduced out-of-scope Gust collaborators; every original actor/mode/case input remains unchanged."
    },
    {
      "before": "static_cast<int>(GameMode::NUM_GAME_MODES)==92",
      "after": "static_cast<int>(GameMode::NUM_GAME_MODES)==93",
      "count": 2,
      "reason": "Account only for the appended game-mode sentinel in two existing explicit native identity assertions; all old identities/messages/checks stay unchanged."
    }
  ],
  "care-fatigue": [
    {
      "before": "for stem in ('DoubleAgent','DoubleAgentPresentation')",
      "after": "for stem in ('DoubleAgent','DoubleAgentPresentation','GustBloom','GustChallenge','GustBloomArt')",
      "count": 1,
      "reason": "Bind every prior source dependency and exactly six additional Gust production files; no original pin is removed."
    }
  ]
} /* REVIEWED_GUST_COMPATIBILITY_END */;

const REVIEWED_PINS = /* REVIEWED_GUST_PINS_BEGIN */ {
  "pendingFinalFreeze": false,
  "normalBuildReceiptSha256": "7cf4b25ac5aed0a7247e7807748a31b73eac46e99e38b505efd51fafe18b9d05",
  "adaptationsSha256": "6d3e364050f41c140dc231ac78c9e5926439c52a851e1ab3d29da0484387fe21",
  "compatibilityPatchesSha256": "9d904f13af640911c638a30f03a3854471ca71f2b1a4bd048d4e0fcc3a3973cf",
  "parentReportPinsSha256": "6772cdf9b8429ea445040c244a1544e345c68981cd0873b7e3768ff55bb711e1",
  "adapterSha256": "8c5008f8886f79d4cfad56c7315c7e768bd942a1ee2d78a5773ebb4e9fde4c46",
  "runSha256": "b62b414af34ca10de508d6807853745f1ed40a05b641be303133a16cdbdb4268",
  "runners": {
    "game-speed": {
      "runnerSha256": "047c86c3e3debeb9e0ec4072fe2bed2edac9a98f35b0e92de7c86d8b72a91edc",
      "reportSha256": "ae7eed6495212add565ad39f9bad9577fe603173c9990983665081ed6864ff66",
      "harnessSha256": "0299e42113cdd9a96fdc9e4ac14cf68c6144f2c3660cf14f85bb224bb3a96b6b"
    },
    "qol-controls": {
      "runnerSha256": "7ac95a9899061483ef24d3bff195f756733d72dd06e8b5b73f4d48e8ca577ec5",
      "reportSha256": "68b55d037ff5f49d710b7d11c7ef21f87d34e477e9d9cb59f096580f28faa71e",
      "harnessSha256": "26baff16227c83705bc47cc2a8afd8b8f84effa24589d2ab63024c3495527316"
    },
    "decks-cooldowns": {
      "runnerSha256": "2a274bfa4104650cefb1d48d2aed28d29ca91fad81826edb38221e6d366c6d1a",
      "reportSha256": "eec5804d0f96623815eb40a7e023bb1f237aeb2d378d91e32aeb2ffe21f8ca3f",
      "harnessSha256": "42d5ba51b452d466f385fdf07d23d1b7f204b121d8d300d5b192b31f3f5bb376"
    },
    "bonus-challenge": {
      "runnerSha256": "75bdbdcc39791e192ab7e270fec3c0c940e92a0920d4f9c54b36cd496de0f0a9",
      "reportSha256": "468464bc7b7aca57b25c1dafe9da9aa1262929171a4a48fd761d29b3ddce37cd",
      "harnessSha256": "e5f065ccac7b5cb32558a114e0457ad62bb56c4cde413b85a91214fc1b62df68"
    },
    "bonus-completion": {
      "runnerSha256": "d92312ce6a6f842fba6195b4f8338a7e9110818d4ec9a2bc86d983581bf94c55",
      "reportSha256": "1bb890ad900343ca5f0207963a5eee6ecd5644b8cecb0ae3d067eaaa46efbdd8",
      "harnessSha256": "422f1136030ad942173b76efc11a425bd0d794f193485aca2916933a36320e58"
    },
    "night-shift": {
      "runnerSha256": "fb396c8f607ca41d2c8da34a3d3c28475e6c8a487a61c9b23b2241a54dec8c81",
      "reportSha256": "4274a89c452399d7194c4149f042cfcf361a368efc04581a3b7024af5a669add",
      "harnessSha256": "55d83256d8157e18e570b813cc4155a0584acf1a175c5f234e56c1aca980f4d1"
    },
    "lantern-shroom": {
      "runnerSha256": "c5c1cab9365fa9a6680c6ec20b24c82d62d8c11d3fe56990047158efae55e9aa",
      "reportSha256": "e0f35ddeacb9b3a8439b6126475bbd74a2070ad97cccf14bfe1e88aaf4527024",
      "harnessSha256": "c4dfc2a88e2c3037e4a0c4e2b078f7ec292a6198bc17f3ca2fc66ac38b2d5ecb"
    },
    "garden-shuffle": {
      "runnerSha256": "4680673cec671a4a018a4e4f4eb29c2564e79b5c5d938f97ec0fd82402fde984",
      "reportSha256": "62f4c79032cc986786b1f76deec7c598ee5270624a54a73afe62b3115ffc7334",
      "harnessSha256": "7364fe91a888ab3d607b533cf4a1fdba903ed5bf65172b008078c950a1e6d182"
    },
    "seed-swap": {
      "runnerSha256": "764c20b0de75c3c4dcce8efa3e2f50d673b17c0bf5f35fcf78ab4dd70cf9f106",
      "reportSha256": "9e15a6528a928353320c52da87b2bbc2e63c691417bec5db40c0d8b6a2e584af",
      "harnessSha256": "e60d1f1c2d83fa0c780cca587697084514bda7f2a058d33d2f24a8916b67bed1"
    },
    "mender-bloom": {
      "runnerSha256": "32050320fe85d1c6ea4b79cfaa34df082135978dfd86fed6802b2d23223576a5",
      "reportSha256": "20b97ccf7fe87c525a0e3b391dab088abcd8b047d162e49ac4b8456cfdcb8efc",
      "harnessSha256": "276c6e8db99cb037fd8cc3f92122a3998d418905d454ec20fbbca0bf198c453c"
    },
    "intensive-care": {
      "runnerSha256": "7fc3672e416a05c171eedb4fa3a7653a416042f3a95903644998a3f771de6c03",
      "reportSha256": "afce80fa9afd9f109c61477b794c82e6105004adac86d3167b0e62a09eea9e78",
      "harnessSha256": "fa1eb951e19972be0f6ce7ef9a2efaf90d63de1d778055790d2acd804067b39e"
    },
    "native-layout": {
      "runnerSha256": "5103a51d95f50663f4bd2818fa862bd4d96181356e88cdff65ffc26cc063fb89",
      "reportSha256": "741862126d57ebf001165a7262bdf1e069209884f332a03d8baf0a96909630b7",
      "harnessSha256": "9295cfefd10e8c5222c0bc2764665315e27c58c859d45e0232c75832e081df4a"
    },
    "care-fatigue": {
      "runnerSha256": "f0f289fe9f0eb952e43485c59562fb3326c6aa4adf9d602730c60154c262ac53",
      "reportSha256": "053e25b0abdd3d8bec71881ac5043265f30e8be351a89806febb9a1ff3787d20",
      "harnessSha256": "60b9b05a2437b088d08bd89ca393dc4ab00d107fc4c382927e2a36068ab92130"
    }
  },
  "summaryPath": "focused-recovery-final/summary.json",
  "summarySha256": "ab808219bc696d55b0d98da611088e0d93a5d3b3bcfd92bc65ca8414f47ed76a"
} /* REVIEWED_GUST_PINS_END */;

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

export async function verifyGustFocusedCompatibility({read,sha,engine}){
 assert.equal(engine.id,CURRENT_ENGINE_ID);assert.equal(engine.parent.id,DOUBLE_ENGINE_ID);
 assert.equal(engine.parent.artifacts.sourceSha256,DOUBLE_ARCHIVE_SHA256);
 const snapshot=await verifyGustRetainedParentInputs({read,sha});
 const parentPinsBytes=await read(FOLDER+'parent-report-pins.json');assert.equal(sha(parentPinsBytes),PARENT_REPORT_PINS);
 const parentPins=JSON.parse(parentPinsBytes);
 assert.equal(parentPins.schemaVersion,1);assert.equal(parentPins.parentEngineId,DOUBLE_ENGINE_ID);
 assert.equal(parentPins.parentArchiveSha256,DOUBLE_ARCHIVE_SHA256);assert.deepEqual(keys(parentPins.reports),keys(COUNTS));
 const adaptationBytes=await read(FOLDER+'adaptations.json'),adaptation=JSON.parse(adaptationBytes);
 const patchBytes=await read(FOLDER+'compatibility-patches.json'),patches=JSON.parse(patchBytes);
 assert.equal(patches.schemaVersion,1);assert.deepEqual(keys(patches.runners),keys(COUNTS));
 assert.deepEqual(patches.runners,REVIEWED_OPERATIONS,'Only the independently reviewed collaborator/sentinel/dependency edits may run');
 assert.equal(adaptation.schemaVersion,1);assert.equal(adaptation.engineId,CURRENT_ENGINE_ID);
 assert.equal(adaptation.parentEngineId,DOUBLE_ENGINE_ID);assert.equal(adaptation.parentArchiveSha256,DOUBLE_ARCHIVE_SHA256);
 assert.equal(adaptation.parentSnapshotSha256,GUST_PARENT_TEST_INPUTS_SHA256);
 assert.equal(adaptation.parentReportPinsSha256,sha(parentPinsBytes));assert.equal(adaptation.compatibilityPatchesSha256,sha(patchBytes));
 assert.equal(adaptation.retainedCheckTotal,58833);assert.deepEqual(adaptation.checkExtensions,GUST_FOCUSED_CHECK_EXTENSIONS);
 assert.deepEqual(keys(adaptation.runners),keys(COUNTS));
 const originalReports=new Map();let retained=0;
 for(const [name,count]of Object.entries(COUNTS)){
  const filename='test-'+name+'.py',record=adaptation.runners[name],pin=snapshot.files[filename];
  assert.equal(record.runner,filename);assert.equal(record.originalSnapshot,'gust1-retained-parent/'+filename);
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
  assert.equal(record.baselineChecks,count);assert.equal(record.appendedChecks,GUST_FOCUSED_CHECK_EXTENSIONS[name]||0);
  retained+=count;
 }
 assert.equal(retained,58833);
 // The entire original rational transform remains verbatim inside the exact
 // runner comparison above, including every27157 layout assertion/threshold.
 return {adaptation,adaptationBytes,patchBytes,parentPinsBytes,originalReports};
}

export async function verifyGustFocusedRetention({read,sha,engine,reports}){
 assert.equal(REVIEWED_PINS.pendingFinalFreeze,false,'Current Gust-bloom focused evidence has not been frozen');
 assert(reports instanceof Map);
 const retained=await verifyGustFocusedCompatibility({read,sha,engine});
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
  assert.equal(result.checks,count+(GUST_FOCUSED_CHECK_EXTENSIONS[name]||0));
  const harness=await read('tests/'+name+'-harness.cpp');assert.equal(sha(harness),reviewed.harnessSha256);
  assert.equal(sha(harness),result.generatedHarnessSha256);
  const additions=GUST_SOURCE_ADDITIONS.map(name=>'source/'+name);
  for(const input of additions)assert(Object.hasOwn(result.sourceSha256,input));
  assert.deepEqual(keys(result.sourceSha256),[...keys(retained.originalReports.get(name).sourceSha256),...additions].sort(),
   'Every old source dependency stays bound, with exactly six new production inputs: '+name);
  for(const [input,pin]of Object.entries(result.sourceSha256)){
   safeName(input);assert(input.startsWith('source/'));digest(pin);assert.equal(sha(await read(input)),pin);
  }
  total+=result.checks;
 }
 assert.equal(total,58834);
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
  safeName(row.log);assert(row.log.startsWith('gust1-focused-retention/'));
  assert.equal(sha(await read('tests/'+row.log)),row.logSha256);
 }
 console.log('PASS Gust focused retention:58,833 exact published assertions plus1 catalog iteration; all13 current and silent.');
}
