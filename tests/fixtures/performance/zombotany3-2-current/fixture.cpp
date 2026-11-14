// Private, zero-credit starting-crowd fixture. Production code is unchanged.
#define ZOMBOTANY3_DEVELOPMENT_NO_ART 1
#define main unused_zombotany3_matrix_main
#include "performance-fixtures/recipe-inputs/zombotany3-harness.cpp"
#undef main

int main(int argc,char**argv){try{
 const int count=argc>1?std::atoi(argv[1]):20;
 Require(count==20||count==40,"only the two registered starting crowds are supported");
 auto app=Bootstrap();Z3Card(app,1,1729);auto b=app->mBoard;
 Require(app->mGameMode==kMode&&app->mGameScene==SCENE_PLAYING,"native night did not enter play");
 Require(b->mCurrentWave==0&&LiveZombies(b)==0,"starting night is not empty");
 Require(b->mZombieCountDown>=1790&&b->mZombieCountDown<=1800&&b->mZombieCountDownStart==1800,"native opening countdown changed");
 const int opening=b->mZombieCountDown,mainCounter=b->mMainCounter;
 for(unsigned n:app->mPlayerInfo->mChallengeRecords)Require(n==0,"synthetic profile must start with zero records");
 // These actors and plants are admitted once before the native board is saved.
 // No HP, gait, attack/freeze clocks, wave/countdown or economy fields are set.
 for(int row=0;row<5;++row){
  b->AddPlant(0,row,SEED_SUNSHROOM,SEED_NONE);
  b->AddPlant(1,row,SEED_SUNSHROOM,SEED_NONE);
  b->AddPlant(3,row,SEED_WALLNUT,SEED_NONE);
 }
 std::ostringstream actors;actors<<'[';
 std::array<int,3> types{};
 for(int i=0;i<count;++i){
  const int kind=i<count/2?0:i<count*9/10?1:2;
  const auto type=static_cast<ZombieType>(35+kind);++types[kind];
  Zombie::PreloadZombieResources(type);auto z=b->AddZombieInRow(type,i%5,0);
  const float x=count==20?440.0f+(i/5)*70.0f:420.0f+(i/5)*40.0f;
  z->mPosX=x;z->mX=static_cast<int>(x);z->UpdateReanim();
  Require(z->mBodyHealth==270&&z->mBodyMaxHealth==270&&z->mHasHead&&!z->mDead,"native crowd stats changed");
  if(i)actors<<',';
  actors<<"{\"type\":"<<int(type)<<",\"row\":"<<z->mRow<<",\"x\":"<<z->mPosX<<",\"y\":"<<z->mPosY
   <<",\"health\":"<<z->mBodyHealth<<",\"maxHealth\":"<<z->mBodyMaxHealth<<",\"gait\":"<<z->mVelX
   <<",\"abilityCountdown\":"<<z->mSummonCounter<<",\"attackVisualClock\":"<<z->mBossBungeeCounter<<'}';
 }
 actors<<']';
 Require(types==std::array<int,3>{count/2,count*4/10,count/10}&&LiveZombies(b)==count,"registered crowd composition changed");
 Require(b->mZombieCountDown==opening&&b->mMainCounter==mainCounter&&b->mCurrentWave==0,"fixture creation advanced the native clock");
 app->mPlayerInfo->SaveDetails();app->mProfileMgr->Save();app->WriteCurrentUserConfig();
 Require(app->mPlayerInfo->mId==1,"native output profile ID is not1");
 const auto save=GetSavedGameName(kMode,1);Require(LawnSaveGame(b,save),"native performance board save failed");
 for(unsigned n:app->mPlayerInfo->mChallengeRecords)Require(n==0,"synthetic fixture acquired challenge credit");
 const int sun=b->mSunMoney,bankSize=b->mSeedBank->mNumPackets;
 const auto before=Graph(b);Require(app->TryLoadGame(),"native performance fixture did not reload");
 Require(Graph(app->mBoard)==before,"native performance saved graph changed on reload");
 Json out;out.S("kind","synthetic-starting-crowd");out.S("engineId","0.2.6-web-zombotany3.2");
 out.N("mode",93);out.N("profileIndex",92);out.N("startingCrowd",count);out.N("puffHeads",types[0]);out.N("fumeHeads",types[1]);out.N("iceHeads",types[2]);
 out.N("nativeOpeningCountDown",opening);out.N("nativeOpeningCountDownStart",1800);out.N("nativeMainCounter",mainCounter);
 out.N("nativeWave",0);out.N("nativeSun",sun);out.N("nativeBankSize",bankSize);
 out.N("profileCredits",0);out.N("countedEarnedWins",0);out.B("savedGraphPreserved",true);
 out.B("syntheticInitialActorsAndPlants",true);out.B("initialActorPositionAssignmentOnly",true);
 out.B("postSaveTimerHPOrPositionWrites",false);out.B("audioDeviceOpened",false);out.Raw("actors",actors.str());
 std::printf("Z3_PERFORMANCE_FIXTURE %s\n",out.Done().c_str());return 0;
}catch(const std::exception&e){std::fprintf(stderr,"performance-fixture:FAIL:%s\n",e.what());return 1;}}
