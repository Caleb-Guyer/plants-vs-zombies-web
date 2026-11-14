// SPDX-License-Identifier: LGPL-3.0-or-later
// Headless integration entry point. All game logic is linked from the complete,
// unmodified release engine. Only the hardware and startup environment differ.
#include "LawnApp.h"
#include "Resources.h"
#include "Lawn/Board.h"
#include "Lawn/MessageWidget.h"
#include "Lawn/Challenge.h"
#include "Lawn/Plant.h"
#include "Lawn/Zombie.h"
#include "Lawn/SeedPacket.h"
#include "Lawn/Cutscene.h"
#include "Lawn/Coin.h"
#include "Lawn/Projectile.h"
#include "Lawn/CursorObject.h"
#include "Lawn/LawnMower.h"
#include "Lawn/Widget/ContinueDialog.h"
#include "Lawn/LawnCommon.h"
#include "Lawn/ZenGarden.h"
#include "Lawn/System/Zombotany3.h"
#include "Lawn/System/Zombotany3Art.h"
#include "Lawn/System/GustBloom.h"
#include "Lawn/System/GustChallenge.h"
#include "Lawn/System/GustBloomArt.h"
#include "Lawn/Widget/SeedChooserScreen.h"
#include "Lawn/System/TorchbearerZombie.h"
#include "Lawn/System/TorchbearerPresentation.h"
#include "Lawn/System/FireDrillPresentation.h"
#include "Lawn/System/PoolPanicEndless.h"
#include "Lawn/Widget/AlmanacDialog.h"
#include "Lawn/System/VaseAmbushPresentation.h"
#include "Lawn/System/RallyZombie.h"
#include "Lawn/GridItem.h"
#include "Lawn/Widget/NewOptionsDialog.h"
#include "Lawn/ToolTipWidget.h"
#include "Lawn/System/LanternShroom.h"
#include "Lawn/System/MenderBloom.h"
#include "PvzpLib/FilterEffect.h"
#include "PvzpLib/ReanimAtlas.h"
#include "PvzpLib/PvzpCommon.h"
#include "Lawn/Widget/GameButton.h"
#include "Lawn/Widget/LawnDialog.h"
#include "Lawn/Widget/ChallengeScreen.h"
#include "Lawn/System/Music.h"
#include "Lawn/System/PlayerInfo.h"
#include "Lawn/System/ProfileMgr.h"
#include "Lawn/System/PoolEffect.h"
#include "Lawn/System/ReanimationLawn.h"
#include "Lawn/System/SaveGame.h"
#include "PvzpLib/EffectSystem.h"
#include "PvzpLib/Attachment.h"
#include "PvzpLib/PvzpFoley.h"
#include "PvzpLib/PvzpParticle.h"
#include "PvzpLib/PvzpStringFile.h"
#include "PvzpLib/Reanimator.h"
#include "PvzpLib/Trail.h"
#include "misc/ResourceManager.h"
#include "paklib/PakInterface.h"
#include "sound/SoundManager.h"
#include "sound/DummyMusicInterface.h"
#include "widget/WidgetManager.h"
#include "widget/ButtonWidget.h"
#include "widget/DialogButton.h"
#include "graphics/MemoryImage.h"
#include <cstdio>
#include <cmath>
#include <cstdlib>
#include <stdexcept>
#include <algorithm>
#include <sstream>
#include <vector>
#include <set>
#include <iomanip>
#include <limits>
#include <map>
#include <array>
#include <format>
#include "graphics/Font.h"


// Do not skip native Foley calls: they intentionally consume game RNG even
// when muted. This hardware adapter never initializes or opens an audio device.
class SilentSoundManager final : public Sexy::SoundManager {
public:
 bool Initialized() override { return true; }
 bool LoadSound(intptr_t, const std::string&) override { return true; }
 intptr_t LoadSound(const std::string&) override { return next++; }
 void ReleaseSound(intptr_t) override {}
 void SetVolume(double) override {}
 bool SetBaseVolume(intptr_t,double) override { return true; }
 bool SetBasePan(intptr_t,int) override { return true; }
 Sexy::SoundInstance* GetSoundInstance(intptr_t) override { return nullptr; }
 void ReleaseSounds() override {}
 void ReleaseChannels() override {}
 double GetMasterVolume() override { return 0; }
 void SetMasterVolume(double) override {}
 void Flush() override {}
 void StopAllSounds() override {}
 intptr_t GetFreeSoundId() override { return next++; }
 int GetNumSounds() override { return static_cast<int>(next); }
 intptr_t next = 1;
};

static int gChecks=0;
static void Require(bool condition, const char* message) {
 ++gChecks;
 if (!condition) throw std::runtime_error(message);
}
static void Progress(const char* message) { std::fprintf(stderr,"zombotany3: %s\n",message); }

class IntegrationLawnApp final : public LawnApp {
public:
 int restartResponse=0;
 // Only the hardware confirmation result is scripted. Native dialog creation,
 // Options routing, board restart and stage population remain production code.
 Sexy::Dialog* DoDialog(int id,bool modal,const std::string& header,const std::string& lines,const std::string& footer,int buttons) override {
  auto dialog=LawnApp::DoDialog(id,modal,header,lines,footer,buttons);
  if(id==DIALOG_CONFIRM_RESTART && restartResponse) dialog->mResult=restartResponse;
  return dialog;
 }
};

static LawnApp* Bootstrap() {
 Sexy::SetResourceFolder("/resources/");
 Sexy::SetAppDataFolder("/test-saves/");
 Sexy::MkDir("/test-saves/userdata");
 Require(gPakInterface->AddPakFile("/resources/main.pak"),"actual main.pak could not be opened");
 PvzpStringListSetColors(gLawnStringFormats,gLawnStringFormatCount);
 gExtractResourcesByName=Sexy::ExtractResourcesByName;
 auto app = new IntegrationLawnApp();
 gLawnApp=app;
 app->mAutoEnable3D=false;
 app->mIs3DAccelerated=false;
 app->mSoundManager=std::make_unique<SilentSoundManager>();
 app->mMusicInterface=std::make_unique<DummyMusicInterface>();
 app->mMusicVolume=0;
 app->mSfxVolume=0;
 app->mActive=true;
 app->mMinimized=false;
 app->mWidgetManager->Resize(Sexy::Rect(0,0,800,600),Sexy::Rect(0,0,800,600));
 app->mSessionID=0;
 app->mAppRandSeed=1729;
 Progress("parse resources");
 Require(app->mResourceManager->ParseResourcesFile("properties/resources.xml"),"native resource manifest parse failed");
 Require(PvzpLoadResources("Init"),"native Init resources failed");
 app->mMusic=std::make_unique<Music>();
 app->mMusic->mMusicDisabled=true;
 app->mSoundSystem=std::make_unique<PvzpFoley>();
 app->mEffectSystem=std::make_unique<EffectSystem>();
 app->mEffectSystem->EffectSystemInitialize();
 ReanimatorLoadDefinitions(gLawnReanimationArray,NUM_REANIMS);
 Progress("load strings and properties");
 PvzpStringListLoad("Properties/LawnStrings.txt");
 app->LoadProperties("properties/default.xml",false,false);
 app->LoadProperties("properties/Layout.xml",false,false);
 app->LoadProperties("properties/pvz-portable.xml",false,false);
 Progress("load actual images and fonts");
 app->LoadGroup("LoadingImages",9);
 app->LoadGroup("LoadingFonts",54);
 Require(!app->mLoadingFailed && !app->mShutdown,"native image/font resource load failed");
 app->mDefaultFont=Sexy::FONT_PICO129;
 app->mPoolEffect=std::make_unique<PoolEffect>();
 app->mPoolEffect->PoolEffectInitialize();
 app->mZenGarden=std::make_unique<ZenGarden>();
 app->mReanimatorCache=std::make_unique<ReanimatorCache>();
 app->mReanimatorCache->ReanimatorCacheInitialize();
 PvzpFoleyInitialize(gLawnFoleyParamArray,static_cast<int>(FoleyType::NUM_FOLEY));
 TrailLoadDefinitions(gLawnTrailArray,static_cast<int>(TrailType::NUM_TRAILS));
 PvzpParticleLoadDefinitions(gLawnParticleArray,static_cast<int>(ParticleEffect::NUM_PARTICLES));
 app->mPlayerInfo=app->mProfileMgr->AddProfile("Headless integration test");
 app->mPlayerInfo->mFinishedAdventure=1;
 app->mPlayerInfo->mLevel=1;
 Progress("native preloading");
 app->PreloadForUser();
 app->mLoadingThreadCompleted=true;
 Require(!app->mLoadingFailed && !app->mShutdown,"native preloading failed");
 return app;
}
#include "zombotany3-policy.h"


namespace {
constexpr GameMode kMode=static_cast<GameMode>(93);
constexpr int kProfile=92;
constexpr ChallengeState kActive=static_cast<ChallengeState>(146),kFinished=static_cast<ChallengeState>(147);
constexpr SeedType kGust=static_cast<SeedType>(78);
struct Json {
 std::ostringstream out;bool comma=false;
 static std::string Quote(const std::string& text){std::ostringstream o;o<<'"';for(unsigned char c:text){if(c=='"'||c=='\\')o<<'\\'<<c;else if(c=='\n')o<<"\\n";else if(c=='\r')o<<"\\r";else if(c=='\t')o<<"\\t";else if(c<32)o<<"?";else o<<c;}o<<'"';return o.str();}
 void Key(const std::string& key){if(comma)out<<',';comma=true;out<<Quote(key)<<':';}
 void N(const std::string& key,long long value){Key(key);out<<value;}
 void B(const std::string& key,bool value){Key(key);out<<(value?"true":"false");}
 void S(const std::string& key,const std::string& value){Key(key);out<<Quote(value);}
 void Raw(const std::string& key,const std::string& value){Key(key);out<<value;}
 std::string Done(){return "{"+out.str()+"}";}
};
std::string Numbers(const std::vector<int>& values){std::ostringstream out;out<<'[';for(size_t i=0;i<values.size();++i)out<<(i?",":"")<<values[i];out<<']';return out.str();}
void Click(LawnApp* app,int x,int y){app->mWidgetManager->MouseMove(x,y);app->mWidgetManager->MouseDown(x,y,1);app->mWidgetManager->MouseUp(x,y,1);}
void ClickBoard(Board* board,int x,int y){auto p=board->GetAbsPos();Click(board->mApp,p.mX+x,p.mY+y);}
void Tick(LawnApp* app,int speed){const auto before=app->mAppCounter;const auto old=app->mBoard;const bool doubled=app->IsDoubleGameSpeedActive();app->UpdateFrames();Require(app->mAppCounter-before==(doubled?2:1)||(doubled&&app->mAppCounter-before==1&&(!app->IsDoubleGameSpeedActive()||app->mBoard!=old)),"native speed frame count changed");(void)speed;}
int LiveZombies(Board* b){int n=0;for(auto z:b->mZombies)n+=!z->mDead&&!z->IsDeadOrDying()&&z->IsOnBoard();return n;}
int GraphZombies(Board* b){int n=0;for(auto z:b->mZombies)n+=!z->mDead;return n;}
int LiveProjectiles(Board* b){int n=0;for(auto p:b->mProjectiles)n+=!p->mDead;return n;}
int LivePlants(Board* b){int n=0;for(auto p:b->mPlants)n+=!p->mDead&&p->mIsOnBoard&&p->mPlantHealth>0;return n;}
int Brains(Board* b){int n=0;for(auto g:b->mGridItems)n+=!g->mDead&&g->mGridItemType==GRIDITEM_IZOMBIE_BRAIN;return n;}
int Pots(Board* b){int n=0;for(auto g:b->mGridItems)n+=!g->mDead&&g->mGridItemType==GRIDITEM_SCARY_POT;return n;}
GridItem* Pot(Board* b,int col,int row){for(auto g:b->mGridItems)if(!g->mDead&&g->mGridItemType==GRIDITEM_SCARY_POT&&g->mGridX==col&&g->mGridY==row)return g;return nullptr;}
bool Active(LawnApp* app){return app->mBoard&&app->mGameScene==SCENE_PLAYING&&app->mBoard->mChallenge->mChallengeState==kActive&&!app->mBoard->HasLevelAwardDropped()&&!app->GetDialog(DIALOG_GAME_OVER);}
void EnterPlaying(LawnApp* app,int speed){Require(app->mBoard,"native board missing");app->mBoard->mCutScene->CancelIntro();for(int i=0;i<2000&&app->mGameScene!=SCENE_PLAYING;++i)app->UpdateFrames();Require(app->mGameScene==SCENE_PLAYING,"native intro never entered play");app->mDoubleGameSpeed=speed==2;Require(speed==1||app->IsDoubleGameSpeedActive(),"native2x not active");}
void Card(LawnApp* app,int speed,int seed,GameMode mode=kMode,int profile=kProfile){
 if(app->mBoard)app->KillBoard();if(!app->mChallengeScreen)app->ShowChallengeScreen(CHALLENGE_PAGE_BONUS);
 Require(app->mChallengeScreen&&app->mChallengeScreen->mPageIndex==CHALLENGE_PAGE_BONUS,"native Bonus page missing");
 auto button=app->mChallengeScreen->mChallengeButtons[profile].get();Require(button&&button->mVisible&&!button->mDisabled,"native Bonus card unavailable");
 auto p=button->GetAbsPos();Sexy::SRand(seed);app->mAppRandSeed=seed;Click(app,p.mX+button->mWidth/2,p.mY+button->mHeight/2);
 Require(!app->mChallengeScreen&&app->mBoard&&app->mGameMode==mode,"actual native card did not launch requested game");
 if(auto dialog=static_cast<ContinueDialog*>(app->GetDialog(DIALOG_CONTINUE))){auto resume=dialog->mContinueButton.get();p=resume->GetAbsPos();Click(app,p.mX+resume->mWidth/2,p.mY+resume->mHeight/2);Require(!app->GetDialog(DIALOG_CONTINUE),"native Continue remained above board");}
 EnterPlaying(app,speed);Require(app->GetCurrentChallengeIndex()==profile,"native card lost profile routing");
}
std::string HexText(const char* text){std::ostringstream out;out<<std::hex<<std::setfill('0');for(unsigned char c:std::string(text))out<<std::setw(2)<<int(c);return out.str();}
std::string Graph(Board* b){std::ostringstream o;o<<std::setprecision(std::numeric_limits<float>::max_digits10);auto c=b->mChallenge.get();o<<b->mMainCounter<<':'<<b->mSunMoney<<':'<<b->mCurrentWave<<':'<<b->mZombieCountDown<<':'<<c->mSurvivalStage<<':'<<c->mChallengeState<<':'<<c->mChallengeStateCounter<<':'<<c->mChallengeScore<<':'<<c->mChallengeGridX<<':'<<c->mChallengeGridY<<':'<<c->mScaryPotterPots<<':'<<c->mReanimChallenge<<':'<<b->mProgressMeterWidth<<':'<<b->mSeedBank->mNumPackets<<':'<<b->mPlantsEaten<<':'<<c->mConveyorBeltCounter<<':'<<c->mLastConveyorSeedType<<':'<<c->mSlotMachineRollCount<<':'<<b->mSeedBank->mConveyorBeltCounter<<':'<<b->mTotalSpawnedWaves<<':'<<b->mZombieCountDownStart;std::set<unsigned> rigs;rigs.insert(c->mReanimChallenge);
 if(b->mAdvice){auto advice=b->mAdvice.get();o<<";a,"<<advice->mMessageStyle<<','<<advice->mDuration<<','<<advice->mDisplayTime<<','<<advice->mSlideOffTime<<','<<HexText(advice->mLabel)<<','<<advice->mMessageStyleNext<<','<<HexText(advice->mLabelNext);}
 o<<";snapshot";for(int row=0;row<6;++row)for(int col=0;col<9;++col)o<<','<<c->mBeghouledEated[col][row];
 for(auto p:b->mPlants)if(!p->mDead){o<<";p,"<<b->mPlants.DataArrayGetID(p)<<','<<p->mSeedType<<','<<p->mPlantCol<<','<<p->mRow<<','<<p->mPlantHealth<<','<<p->mAnimCounter<<','<<p->mIsAsleep<<','<<p->mState<<','<<p->mStateCountdown<<','<<p->mDoSpecialCountdown<<','<<p->mShootingCounter<<','<<p->mLaunchCounter<<','<<p->mBodyReanimID<<','<<p->mHeadReanimID<<','<<p->mHeadReanimID2<<','<<p->mHeadReanimID3<<','<<p->mBlinkReanimID<<','<<p->mLightReanimID;rigs.insert(p->mHeadReanimID);rigs.insert(p->mHeadReanimID2);rigs.insert(p->mHeadReanimID3);rigs.insert(p->mBlinkReanimID);rigs.insert(p->mLightReanimID);for(const auto& metal:p->mMagnetItems)o<<','<<metal.mItemType<<','<<metal.mPosX<<','<<metal.mPosY<<','<<metal.mDestOffsetX<<','<<metal.mDestOffsetY;rigs.insert(p->mBodyReanimID);}
 for(auto z:b->mZombies)if(!z->mDead){o<<";z,"<<b->mZombies.DataArrayGetID(z)<<','<<z->mZombieType<<','<<z->mRow<<','<<z->mPosX<<','<<z->mPosY<<','<<z->mBodyHealth<<','<<z->mHelmHealth<<','<<z->mShieldHealth<<','<<z->mHasHead<<','<<z->mHasArm<<','<<z->mHasObject<<','<<z->mIsEating<<','<<z->mMindControlled<<','<<z->mZombiePhase<<','<<z->mChilledCounter<<','<<z->mIceTrapCounter<<','<<z->mButteredCounter<<','<<z->mBodyReanimID<<','<<z->mSummonCounter<<','<<static_cast<unsigned>(z->mTargetPlantID)<<','<<z->mPhaseCounter<<','<<z->mZombieAge<<','<<z->mInPool<<','<<z->mZombieHeight<<','<<z->mYuckyFace<<','<<z->mBossStompCounter<<','<<z->mBossHeadCounter<<','<<z->mBossBungeeCounter<<','<<z->mSpecialHeadReanimID;rigs.insert(z->mSpecialHeadReanimID);rigs.insert(z->mBodyReanimID);}
 for(auto g:b->mGridItems)if(!g->mDead)o<<";g,"<<b->mGridItems.DataArrayGetID(g)<<','<<g->mGridItemType<<','<<g->mGridItemState<<','<<g->mGridX<<','<<g->mGridY<<','<<g->mGridItemCounter<<','<<g->mPosX<<','<<g->mPosY<<','<<g->mZombieType<<','<<g->mSeedType<<','<<g->mScaryPotType<<','<<g->mTransparentCounter<<','<<g->mSunCount;
 for(auto p:b->mProjectiles)if(!p->mDead)o<<";s,"<<b->mProjectiles.DataArrayGetID(p)<<','<<p->mProjectileType<<','<<p->mRow<<','<<p->mPosX<<','<<p->mPosY<<','<<p->mPosZ<<','<<p->mVelX<<','<<p->mVelY<<','<<p->mVelZ<<','<<p->mProjectileAge<<','<<p->mDamageRangeFlags<<','<<p->mMotionType;
 for(auto c:b->mCoins)if(!c->mDead)o<<";c,"<<b->mCoins.DataArrayGetID(c)<<','<<c->mType<<','<<c->mPosX<<','<<c->mPosY<<','<<c->mIsBeingCollected;
 for(int i=0;i<b->mSeedBank->mNumPackets;++i){auto& p=b->mSeedBank->mSeedPackets[i];o<<";b,"<<p.mPacketType<<','<<p.mIndex<<','<<p.mOffsetX<<','<<p.mRefreshTime<<','<<p.mActive<<','<<p.mRefreshing<<','<<p.mRefreshCounter<<','<<p.mTimesUsed;}
 for(auto r:b->mApp->mEffectSystem->mReanimationHolder->mReanimations){auto id=b->mApp->mEffectSystem->mReanimationHolder->mReanimations.DataArrayGetID(r);if(rigs.contains(id))o<<";r,"<<id<<','<<r->mReanimationType<<','<<r->mAnimTime<<','<<r->mLastFrameTime<<','<<r->mAnimRate<<','<<r->mFrameStart<<','<<r->mFrameCount<<','<<r->mLoopCount;}
 return o.str();}
void WriteBmp(Sexy::MemoryImage* im,const char* file){int w=im->GetWidth(),h=im->GetHeight(),stride=(w*3+3)&~3,bytes=54+stride*h;std::vector<unsigned char>d(bytes);auto u16=[&](int p,int v){d[p]=v;d[p+1]=v>>8;};auto u32=[&](int p,int v){for(int i=0;i<4;++i)d[p+i]=v>>(8*i);};d[0]='B';d[1]='M';u32(2,bytes);u32(10,54);u32(14,40);u32(18,w);u32(22,h);u16(26,1);u16(28,24);auto bits=im->GetBits();for(int y=0;y<h;++y)for(int x=0;x<w;++x){auto c=bits[y*w+x];int at=54+(h-1-y)*stride+x*3;d[at]=c;d[at+1]=c>>8;d[at+2]=c>>16;}auto f=std::fopen(file,"wb");Require(f,"native raster destination absent");Require(std::fwrite(d.data(),1,d.size(),f)==d.size(),"native raster short write");std::fclose(f);}
void Render(LawnApp* app,const char* file){Sexy::MemoryImage image(app);image.Create(800,600);Sexy::Graphics g(&image);g.SetColor(Sexy::Color(50,50,50));g.FillRect(0,0,800,600);app->mWidgetManager->DrawWidgetsTo(&g);WriteBmp(&image,file);}
void RenderActor(Zombie& z,const char* path){Sexy::MemoryImage image(z.mApp);image.Create(260,240);Sexy::Graphics g(&image);g.SetColor(Sexy::Color(80,135,70));g.FillRect(0,0,260,240);g.Translate(80-z.mX,40-z.mY);Require(z.BeginDraw(&g),"native actor not drawable");z.Draw(&g);z.EndDraw(&g);WriteBmp(&image,path);}


void Z3Step(LawnApp* app,int speed){Tick(app,speed);if(speed==1&&app->mBoard&&app->mGameScene==SCENE_PLAYING&&!app->GetDialog(DIALOG_GAME_OVER))Tick(app,speed);}
Plant* At(Board* b,int col,int row,SeedType seed=SEED_NONE){for(auto p:b->mPlants)if(!p->mDead&&p->mIsOnBoard&&p->mPlantCol==col&&p->mRow==row&&(seed==SEED_NONE||p->mSeedType==seed))return p;return nullptr;}
void ChooseNightSeeds(LawnApp* app,int speed){
 for(int n=0;n<4000&&(!app->mSeedChooserScreen||!app->mSeedChooserScreen->mMouseVisible);++n)Tick(app,speed);
 auto chooser=app->mSeedChooserScreen.get();Require(chooser&&chooser->mMouseVisible&&chooser->mSeedsInBank==0,"native Zombotany3 chooser did not open empty");
 for(auto seed:Z3Player::Seeds){const int index=SeedChooserScreen::ChosenSeedIndex(seed);auto& packet=chooser->mChosenSeeds[index];
  Require(packet.mSeedState==SEED_IN_CHOOSER,"normal night chooser packet unavailable");const auto origin=chooser->GetAbsPos();
  Require(chooser->SeedHitTest(packet.mX+16,packet.mY+22)==seed,"night chooser native hit target absent");
  Click(app,origin.mX+packet.mX+16,origin.mY+packet.mY+22);for(int n=0;n<200&&chooser->mSeedsInFlight;++n)Tick(app,speed);
  Require(chooser->PickedPlantType(seed)&&packet.mSeedState==SEED_IN_BANK,"actual night seed mouse choice failed");}
 Require(chooser->mSeedsInBank==6,"night bank does not contain six normal choices");auto button=chooser->mStartButton.get();Require(button&&!button->mDisabled,"native Let's Rock not enabled");
 auto origin=chooser->GetAbsPos();Click(app,origin.mX+button->mX+button->mWidth/2,origin.mY+button->mY+button->mHeight/2);
 Require(app->mSeedChooserScreen&&!app->mSeedChooserScreen->mMouseVisible&&!app->mBoard->mCutScene->mSeedChoosing,"native night chooser outro was not started");
 for(int n=0;n<4000&&(app->mSeedChooserScreen||app->mGameScene!=SCENE_PLAYING);++n)Tick(app,speed);
 Require(!app->mSeedChooserScreen&&app->mGameScene==SCENE_PLAYING,"original night chooser outro did not finish");
 app->mDoubleGameSpeed=speed==2;Require(speed==1||app->IsDoubleGameSpeedActive(),"actual native night2x did not activate");
}
void Z3Card(LawnApp* app,int speed,int seed){
 if(app->mBoard)app->KillBoard();if(app->mChallengeScreen)app->KillChallengeScreen();app->ShowChallengeScreen(CHALLENGE_PAGE_ZOMBOTANY);
 auto screen=app->mChallengeScreen.get();Require(screen&&screen->mPageIndex==CHALLENGE_PAGE_ZOMBOTANY,"native Zombotany family absent");
 auto button=screen->mChallengeButtons[kProfile].get();Require(button&&button->mVisible&&!button->mDisabled,"new third Zombotany card not playable");
 auto p=button->GetAbsPos();Sexy::SRand(seed);app->mAppRandSeed=seed;app->mDoubleGameSpeed=speed==2;Click(app,p.mX+button->mWidth/2,p.mY+button->mHeight/2);
 Require(!app->mChallengeScreen&&app->mBoard&&app->mGameMode==kMode&&app->GetCurrentChallengeIndex()==kProfile,"native family card launched a different record");
 if(auto dialog=static_cast<ContinueDialog*>(app->GetDialog(DIALOG_CONTINUE))){auto b=dialog->mContinueButton.get();p=b->GetAbsPos();Click(app,p.mX+b->mWidth/2,p.mY+b->mHeight/2);}
 ChooseNightSeeds(app,speed);
}
void SaveContinue(LawnApp* app,int speed){
 auto b=app->mBoard;b->ClearCursor();const auto mode=app->mGameMode;
 Require(LawnSaveGame(b,GetSavedGameName(mode,app->mPlayerInfo->mId)),"native Zombotany3 SaveGame failed");const auto before=Graph(b);
 Require(app->TryLoadGame(),"native Zombotany3 TryLoadGame failed");Require(Graph(app->mBoard)==before,"saved night attack/freeze/body/head/projectile graph changed");
 auto dialog=static_cast<ContinueDialog*>(app->GetDialog(DIALOG_CONTINUE));Require(dialog,"night Continue dialog missing");auto button=dialog->mContinueButton.get();auto p=button->GetAbsPos();Click(app,p.mX+button->mWidth/2,p.mY+button->mHeight/2);
 Require(!app->GetDialog(DIALOG_CONTINUE),"actual night Continue click failed");app->mDoubleGameSpeed=speed==2;
}
Board* Arena(LawnApp*);
Zombie* Actor(Board*,ZombieType,float=430,int=2);
void OneTick(LawnApp*);
#include "zombotany3-battles.h"
#include "zombotany3-presentation-controls.h"
#include "zombotany3-controls.h"
void ControlCase(LawnApp* app,const std::string& name,int speed,int seed){
 std::array<unsigned,100> before{};for(int i=0;i<100;++i)before[i]=app->mPlayerInfo->mChallengeRecords[i];Json out;
 if(name=="presentation")Z3Presentation(app,speed,seed,out);else Z3Mechanics(app,speed,seed,out);
 for(int i=0;i<100;++i)Require(before[i]==app->mPlayerInfo->mChallengeRecords[i],"synthetic Zombotany control earned a profile record");
 out.S("execution","complete-production-engine");out.S("family","synthetic-controls");out.S("name",name);out.N("speed",speed);out.N("seed",seed);out.N("mode",93);out.N("profileIndex",92);out.S("outcome","controls-pass");out.N("profileCredits",0);out.N("countedEarnedWins",0);out.B("syntheticActorSetup",true);out.B("all100ProfileRecordsPreserved",true);out.B("silentHardware",true);out.B("audioDeviceOpened",false);out.N("checks",gChecks);std::printf("ZOMBOTANY3_RESULT %s\n",out.Done().c_str());
}
}
int main(int argc,char**argv){try{
 const std::string name=argc>1?argv[1]:"normal";const int speed=argc>2?std::atoi(argv[2]):1,seed=argc>3?std::atoi(argv[3]):1729;Require(speed==1||speed==2,"unknown speed");auto app=Bootstrap();Z3Card(app,speed,seed);
 if(name=="mechanics"||name=="presentation")ControlCase(app,name,speed,seed);else Z3BattleCase(app,name,speed,seed);return 0;
}catch(const std::exception&e){std::fprintf(stderr,"zombotany3:FAIL:%s\n",e.what());return 1;}}
