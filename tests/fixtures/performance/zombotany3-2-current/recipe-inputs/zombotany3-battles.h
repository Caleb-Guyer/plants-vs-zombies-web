// SPDX-License-Identifier: LGPL-3.0-or-later
#pragma once
struct Z3Run{
 int placements=0,sunClicks=0,sunValue=0,spentSun=0,windups=0,puffs=0,fumeReleases=0,iceReleases=0,freezeTicks=0,freezeMaximum=0,
  hesitations=0,mowersAtStart=0,mowersAtEnd=0,naturalChildren=0,awardType=-1,awardWave=-1,awardEnemies=-1;
 bool collected=false;std::vector<int>winTicks;
 std::set<unsigned>seen,projectiles;std::array<std::map<int,int>,20>ledger;
 std::map<unsigned,int>previousCharge,previousRecovery;std::map<SeedType,int>used;
 bool saved=false;std::string savedKind,beforeGraph,afterGraph;int savedCharge=0,savedFreeze=0;long long exportedBoardBytes=0,exportedUsersBytes=0,exportedProfileBytes=0;
};
long long CopyNativeSave(const std::string&source,const std::string&target){auto in=std::fopen(source.c_str(),"rb");auto out=std::fopen(target.c_str(),"wb");Require(in&&out,"actual earned checkpoint export file missing");unsigned char bytes[4096];long long n=0;for(;;){auto count=std::fread(bytes,1,sizeof(bytes),in);if(!count)break;Require(std::fwrite(bytes,1,count,out)==count,"native checkpoint export short write");n+=count;}Require(!std::ferror(in)&&n>0,"native checkpoint export read failed");std::fclose(in);std::fclose(out);return n;}
int PacketIndex(Board*b,SeedType seed){for(int i=0;i<b->mSeedBank->mNumPackets;++i){auto&p=b->mSeedBank->mSeedPackets[i];if(p.mPacketType==seed&&p.mActive&&!p.mRefreshing)return i;}return-1;}
Z3Player::View View(Board*b){
 Z3Player::View v;v.sun=b->mSunMoney;for(auto p:b->mPlants)if(!p->mDead&&p->mIsOnBoard&&p->mVisible)v.plants.push_back({p->mSeedType,p->mPlantCol,p->mRow});
 for(auto z:b->mZombies)if(!z->mDead&&!z->IsDeadOrDying()&&!z->mMindControlled&&z->mVisible&&z->IsOnBoard()&&z->mPosX>=0&&z->mPosX<=760&&z->GetZombieRect().Intersects(Sexy::Rect(0,0,800,600)))v.enemies.push_back({z->mZombieType,z->mRow,z->mPosX});
 for(int i=0;i<6;++i){const auto seed=Z3Player::Seeds[i];if(PacketIndex(b,seed)<0||b->mSunMoney<b->GetCurrentPlantCost(seed,SEED_NONE))continue;
  for(int row=0;row<5;++row)for(int col=0;col<9;++col)v.legal[i][row][col]=b->CanPlantAt(col,row,seed)==PLANTING_OK;}
 return v;
}
void Start(Board*b){
 Require(b&&b->mApp->mGameMode==kMode&&b->mChallenge->mChallengeState==kActive&&b->mChallenge->mChallengeGridY==1,"independent Zombotany3 mode/state/rules changed");
 Require(b->mBackground==BACKGROUND_2_NIGHT&&b->StageIsNight()&&!b->StageHasPool()&&!b->StageHasRoof()&&!b->StageHasFog(),"Zombotany3 must use the original five-row night lawn only");
 Require(!b->HasConveyorBeltSeedBank()&&b->mSeedBank->mNumPackets==6&&b->mSunMoney==50&&b->mNumWaves==20&&b->mCurrentWave==0,"native night bank/economy/wave opening changed");
 Require(LivePlants(b)==0&&LiveZombies(b)==0&&b->mLawnMowers.mSize==5,"night begins with the original empty lawn and five native mowers");
 for(int i=0;i<6;++i)Require(b->mSeedBank->mSeedPackets[i].mPacketType==Z3Player::Seeds[i],"normal chosen six-seed order changed");
 for(int wave=0;wave<20;++wave){std::map<int,int>expected,actual;if((wave+1)%10==0)expected[ZOMBIE_FLAG]=1;
  const auto&w=Z3Player::Waves[wave];for(int i=0;i<4;++i)if(w[i])expected[i==0?0:34+i]=w[i];
  for(auto type:b->mZombiesInWave[wave])if(type!=ZOMBIE_INVALID)++actual[int(type)];Require(actual==expected,"actual night wave table differs from independent20-wave authorship");}
}
void Observe(Board*b,Z3Run&run){
 Require(b->StageIsNight()&&!b->StageHasPool()&&!b->StageHasRoof()&&!b->StageHasFog()&&!b->HasConveyorBeltSeedBank(),"night course changed lawn/bank during combat");
 const int lease=b->mChallenge->mChallengeStateCounter;Require(lease>=0&&lease<=150,"nonstacking150tick freeze lease exceeded bounds");if(lease>0)run.freezeTicks+=2;run.freezeMaximum=std::max(run.freezeMaximum,lease);
 for(auto z:b->mZombies)if(!z->mDead){const auto id=b->mZombies.DataArrayGetID(z);if(run.seen.insert(id).second){
   if(z->mZombiePhase==PHASE_RISING_FROM_GRAVE)++run.naturalChildren;
   else if(z->mFromWave>=0){Require(z->mFromWave<20,"native Zombotany spawned an unauthored wave");++run.ledger[z->mFromWave][int(z->mZombieType)];}
   else ++run.naturalChildren;
  }
  if(Zombotany3::IsZombie(z->mZombieType)){
   Require(z->mBodyMaxHealth==270,"new mushroom heads do not use native270bodyHP");
   if(z->mBossBungeeCounter>0&&run.previousCharge[id]<=0)++run.windups;
   if(z->mBossBungeeCounter<0&&run.previousCharge[id]>=0){if(z->mZombieType==ZOMBIE_FUME_HEAD)++run.fumeReleases;if(z->mZombieType==ZOMBIE_ICE_HEAD)++run.iceReleases;}
   run.previousCharge[id]=z->mBossBungeeCounter;
  }
 }
 for(auto p:b->mProjectiles)if(!p->mDead&&Zombotany3::IsHostilePuff(*p)&&run.projectiles.insert(b->mProjectiles.DataArrayGetID(p)).second)++run.puffs;
}
void Deploy(Board*b,const Z3Player::Decision&d,Z3Run&run){
 if(d.seed==SEED_NONE)return;const int index=PacketIndex(b,d.seed);Require(index>=0&&b->CanPlantAt(d.col,d.row,d.seed)==PLANTING_OK,"visible night policy selected an unavailable packet/tile");
 auto&p=b->mSeedBank->mSeedPackets[index];const int cost=b->GetCurrentPlantCost(d.seed,SEED_NONE),before=b->mSunMoney;
 Require(before>=cost,"normal night player overspent sun");ClickBoard(b,b->mSeedBank->mX+p.mX+p.mWidth/2,b->mSeedBank->mY+p.mY+p.mHeight/2);
 Require(b->mCursorObject->mType==d.seed,"native night packet selected a different seed");ClickBoard(b,b->GridToPixelX(d.col,d.row)+40,b->GridToPixelY(d.col,d.row)+40);
 Require(At(b,d.col,d.row,d.seed)&&b->mSunMoney==before-cost,"ordinary night tile input failed or charged wrong cost");
 ++run.placements;++run.used[d.seed];run.spentSun+=cost;
 std::fprintf(stderr,"night input tick%d seed%d col%d row%d cost%d sun%d\n",b->mMainCounter,int(d.seed),d.col,d.row,cost,b->mSunMoney);
}
void Checkpoint(LawnApp*app,int speed,const std::string&name,Z3Run&run){
 if(run.saved)return;auto b=app->mBoard;Zombie*charging=nullptr;for(auto z:b->mZombies)if(!z->mDead&&!z->IsDeadOrDying()&&Zombotany3::IsCharging(*z)){charging=z;break;}
 if((name=="save-windup"&&!charging)||(name=="save-freeze"&&b->mChallenge->mChallengeStateCounter<=0))return;
 if(name!="save-windup"&&name!="save-freeze")return;
 run.saved=true;run.savedKind=name;run.savedCharge=charging?charging->mBossBungeeCounter:0;run.savedFreeze=b->mChallenge->mChallengeStateCounter;
 // Export the actually reached ordinary battle state before Continue or any
 // completion credit. No synthetic actor/profile fields are assigned here.
 app->mPlayerInfo->SaveDetails();app->mProfileMgr->Save();app->WriteCurrentUserConfig();
 const auto save=GetSavedGameName(kMode,app->mPlayerInfo->mId);Require(LawnSaveGame(b,save),"actual native checkpoint export SaveGame failed");
 Sexy::MkDir("/test-saves/earned-zombotany3-checkpoint/userdata");const auto id=std::to_string(app->mPlayerInfo->mId);
 run.exportedBoardBytes=CopyNativeSave(save,"/test-saves/earned-zombotany3-checkpoint/userdata/game"+id+"_93.v4");
 run.exportedUsersBytes=CopyNativeSave("/test-saves/userdata/users.dat","/test-saves/earned-zombotany3-checkpoint/userdata/users.dat");
 run.exportedProfileBytes=CopyNativeSave("/test-saves/userdata/user"+id+".dat","/test-saves/earned-zombotany3-checkpoint/userdata/user"+id+".dat");
 b->ClearCursor();run.beforeGraph=Graph(b);SaveContinue(app,speed);run.afterGraph=Graph(app->mBoard);Require(run.beforeGraph==run.afterGraph,"native head attack/freeze Continue graph changed");
}
void CompleteLedger(const Z3Run&run){
 for(int wave=0;wave<20;++wave){std::map<int,int>expected;if((wave+1)%10==0)expected[ZOMBIE_FLAG]=1;
  const auto&w=Z3Player::Waves[wave];for(int i=0;i<4;++i)if(w[i])expected[i==0?0:34+i]=w[i];Require(run.ledger[wave]==expected,"actual authored night enemy ledger does not match independent20-wave roster");}
}
void RunBattle(LawnApp*app,const std::string&name,int speed,Z3Run&run,unsigned initial){
 Start(app->mBoard);run.mowersAtStart=app->mBoard->mLawnMowers.mSize;const bool idle=name=="no-action",hesitate=name=="hesitation";const int begin=app->mBoard->mMainCounter;int nextAction=begin,lastWave=0;
 for(int observation=0;observation<130000&&app->mBoard;++observation){auto b=app->mBoard;Observe(b,run);Require(app->mPlayerInfo->mChallengeRecords[kProfile]==initial,"night credit appeared before native award collection");
  if(app->GetDialog(DIALOG_GAME_OVER))break;
  if(hesitate&&b->mCurrentWave>lastWave){lastWave=b->mCurrentWave;nextAction=std::max(nextAction,int(b->mMainCounter)+150);++run.hesitations;}
  if(!idle&&!b->HasLevelAwardDropped()&&b->mMainCounter>=nextAction){
   // Sun is collected using ordinary visible native coin targets only.
   for(auto coin:b->mCoins)if(!coin->mDead&&!coin->mIsBeingCollected&&coin->IsSun()&&coin->mPosX>=0&&coin->mPosX<=780&&coin->mPosY>=70&&coin->mPosY<=570){const int value=coin->GetSunValue();ClickBoard(b,int(coin->mPosX)+coin->mWidth/2,int(coin->mPosY)+coin->mHeight/2);if(coin->mIsBeingCollected){++run.sunClicks;run.sunValue+=value;}}
   Deploy(b,Z3Player::Choose(View(b)),run);nextAction=b->mMainCounter+150;
  }
  Checkpoint(app,speed,name,run);b=app->mBoard;
  for(auto coin:b->mCoins)if(!coin->mDead&&coin->IsLevelAward()&&!coin->mIsBeingCollected){run.awardType=coin->mType;run.awardWave=b->mCurrentWave;run.awardEnemies=b->AreEnemyZombiesOnScreen();
   Require(!idle&&run.awardWave==20&&!run.awardEnemies,"night award appeared before all20 waves and enemies cleared");Require(coin->mType==(initial?COIN_AWARD_MONEY_BAG:COIN_TROPHY),"native first/replay night award type changed");
   ClickBoard(b,int(coin->mPosX)+coin->mWidth/2,int(coin->mPosY)+coin->mHeight/2);Require(coin->mIsBeingCollected,"actual native night award click failed");run.collected=true;break;}
  if(run.collected)break;Z3Step(app,speed);
 }
 auto b=app->mBoard;run.mowersAtEnd=b?b->mLawnMowers.mSize:0;
 if(idle){Require(b&&app->GetDialog(DIALOG_GAME_OVER)&&app->mBoardResult==BOARDRESULT_LOST&&run.placements==0&&run.sunClicks==0&&!b->HasLevelAwardDropped()&&app->mPlayerInfo->mChallengeRecords[kProfile]==initial,"zero-input night course did not lose naturally without credit");return;}
 if(!run.collected){if(b){std::fprintf(stderr,"night failure tick%d wave%d alive%d sun%d plants%d mowers%d\n",b->mMainCounter,b->mCurrentWave,LiveZombies(b),b->mSunMoney,LivePlants(b),int(b->mLawnMowers.mSize));for(auto z:b->mZombies)if(!z->mDead&&!z->IsDeadOrDying())std::fprintf(stderr,"enemy type%d row%d x%.1f hp%d\n",int(z->mZombieType),z->mRow,z->mPosX,z->mBodyHealth);}throw std::runtime_error("ordinary native Zombotany3 player did not win");}
 CompleteLedger(run);Require(run.placements>0&&run.sunClicks>0&&run.windups>0&&run.puffs>0&&run.fumeReleases>0,"night win did not exercise natural economy and new shooting heads");
 if(name=="save-windup"||name=="save-freeze")Require(run.saved,"requested natural attack/freeze checkpoint never appeared");
 run.winTicks.push_back(b->mMainCounter-begin);for(int n=0;n<6000&&app->mPlayerInfo->mChallengeRecords[kProfile]==initial;++n)Tick(app,speed);
 Require(app->mPlayerInfo->mChallengeRecords[kProfile]==initial+1,"actual night award did not earn exactly one record92 credit");
}
std::string Ledger(const Z3Run&run){std::ostringstream out;out<<'[';for(int wave=0;wave<20;++wave){if(wave)out<<',';out<<'[';bool first=true;for(auto[type,count]:run.ledger[wave]){if(!first)out<<',';first=false;out<<'['<<type<<','<<count<<']';}out<<']';}out<<']';return out.str();}
void Z3BattleCase(LawnApp*app,const std::string&name,int speed,int seed){
 std::array<unsigned,100>before{};for(int i=0;i<100;++i)before[i]=app->mPlayerInfo->mChallengeRecords[i];Require(before[kProfile]==0,"fresh native night profile already has a Zombotany3 win");
 const bool idle=name=="no-action",retry=name=="retry",replay=name=="replay";bool retried=false;int retryLossTick=0;Z3Run run,second;
 if(retry){Z3Run failed;RunBattle(app,"no-action",speed,failed,0);retryLossTick=app->mBoard->mMainCounter;auto dialog=static_cast<LawnDialog*>(app->GetDialog(DIALOG_GAME_OVER));auto button=dialog->mLawnYesButton.get();auto p=button->GetAbsPos();Click(app,p.mX+button->mWidth/2,p.mY+button->mHeight/2);Require(!app->GetDialog(DIALOG_GAME_OVER),"native night Retry did not dismiss game over");ChooseNightSeeds(app,speed);retried=true;}
 RunBattle(app,name,speed,run,0);
 if(replay){for(int n=0;n<6000&&(!app->mChallengeScreen||app->mBoard);++n)Tick(app,speed);Require(!app->mBoard&&app->mChallengeScreen&&app->mChallengeScreen->mPageIndex==CHALLENGE_PAGE_ZOMBOTANY,"native night award did not return to its family");Z3Card(app,speed,seed);RunBattle(app,"normal",speed,second,1);}
 for(int i=0;i<100;++i)Require(app->mPlayerInfo->mChallengeRecords[i]==before[i]+(i==kProfile?(idle?0:replay?2:1):0),"Zombotany3 changed an original challenge record");
 Json out;out.S("execution","complete-production-engine");out.S("family","night-zombotany");out.S("name",name);out.N("speed",speed);out.N("seed",seed);out.N("mode",93);out.N("profileIndex",92);out.S("outcome",idle?"native-loss":"win");out.N("profileCredits",idle?0:replay?2:1);
 out.B("nativeFamilyThirdCardInput",true);out.B("nativeSixMouseSeedChoices",true);out.B("nativeChooserOutroCompleted",true);out.B("nativeIntroCancelled",false);out.B("ordinaryNativeMouseInputsOnly",true);out.B("visibleOnlyPolicy",true);out.B("postStartActorHealthPositionStageTimeOrRNGEdits",false);out.N("observerNativeTicks",2);out.N("minimumInputCadenceTicks",150);out.B("nativeNightOnly",true);out.B("nativeConveyorBank",false);out.N("nativeOpeningSun",50);out.N("nativeOpeningMowers",5);
 out.N("nativePlacements",run.placements);out.N("nativeSunClicks",run.sunClicks);out.N("nativeSunValueCollected",run.sunValue);out.N("nativeSunSpent",run.spentSun);out.N("nativeWindupsObserved",run.windups);out.N("nativeTravelingPuffsObserved",run.puffs);out.N("nativeFumeReleasesObserved",run.fumeReleases);out.N("nativeIceReleasesObserved",run.iceReleases);out.N("nativeFreezeTicksObserved",run.freezeTicks);out.N("nativeMaximumFreezeLease",run.freezeMaximum);out.N("nativeHesitationWindows",run.hesitations);out.N("nativeGraveEmergences",run.naturalChildren);out.N("nativeMowersRemaining",run.mowersAtEnd);
 out.N("nativeAwardWave",run.awardWave);out.N("nativeAwardEnemies",run.awardEnemies);out.N("nativeAwardType",run.awardType);out.B("nativeActualAwardCollected",run.collected);out.Raw("nativeFormationLedger",Ledger(run));out.Raw("replayFormationLedger",Ledger(second));out.Raw("winTicks",Numbers(run.winTicks));out.Raw("replayWinTicks",Numbers(second.winTicks));out.B("nativeGameOver",idle);out.B("failureAndRetry",retry);out.B("nativeRetryResetsNight",retried);out.N("nativeRetryLossTick",retryLossTick);out.B("nativeReplayCompleted",replay);
 Json checkpoint;checkpoint.B("performed",run.saved);checkpoint.S("kind",run.savedKind);checkpoint.N("charge",run.savedCharge);checkpoint.N("freezeLease",run.savedFreeze);checkpoint.S("beforeGraph",run.beforeGraph);checkpoint.S("afterGraph",run.afterGraph);checkpoint.B("graphPreserved",run.saved&&run.beforeGraph==run.afterGraph);checkpoint.N("exportedBoardBytes",run.exportedBoardBytes);checkpoint.N("exportedUsersBytes",run.exportedUsersBytes);checkpoint.N("exportedProfileBytes",run.exportedProfileBytes);checkpoint.S("exportRoot",run.saved?"earned-zombotany3-checkpoint/userdata":"");checkpoint.N("profileCreditAtExport",0);out.Raw("checkpoint",checkpoint.Done());
 out.B("all100ProfileRecordsPreservedExceptEarnedCredit",true);std::vector<int>oldRecords,newRecords;for(int i=0;i<100;++i){oldRecords.push_back(before[i]);newRecords.push_back(app->mPlayerInfo->mChallengeRecords[i]);}out.Raw("nativeProfileRecordsBefore",Numbers(oldRecords));out.Raw("nativeProfileRecordsAfter",Numbers(newRecords));out.B("syntheticInitialAdventureProfile",true);out.B("silentHardware",true);out.B("audioDeviceOpened",false);out.N("checks",gChecks);std::printf("ZOMBOTANY3_RESULT %s\n",out.Done().c_str());
}
