// SPDX-License-Identifier: LGPL-3.0-or-later
#pragma once
#ifdef ZOMBOTANY3_DEVELOPMENT_NO_ART
void Z3Presentation(LawnApp*,int,int,Json&){Require(false,"development driver cannot accept presentation");}
#else
namespace Z3Pixels{
using Picture=std::unique_ptr<Sexy::MemoryImage>;
Picture Blank(int w=800,int h=600,unsigned color=0){auto image=std::make_unique<Sexy::MemoryImage>();std::vector<unsigned>pixels(w*h,color);image->SetBits(pixels.data(),w,h);return image;}
Picture Frame(LawnApp*app){auto image=Blank();Sexy::Graphics g(image.get());g.SetLinearBlend(true);app->mWidgetManager->DrawWidgetsTo(&g);return image;}
Picture ActorFrame(Zombie&z){auto image=Blank(600,240,0xff508746);Sexy::Graphics g(image.get());g.SetLinearBlend(true);g.Translate(340-z.mX,40-z.mY);Require(z.BeginDraw(&g),"mushroom carrier not drawable");z.Draw(&g);z.EndDraw(&g);return image;}
int Different(Sexy::MemoryImage&a,Sexy::MemoryImage&b,const Sexy::Rect&r){Require(a.GetWidth()==b.GetWidth()&&a.GetHeight()==b.GetHeight(),"native image dimensions differ");int n=0;for(int y=r.mY;y<r.mY+r.mHeight;++y)for(int x=r.mX;x<r.mX+r.mWidth;++x)n+=a.GetBits()[y*a.GetWidth()+x]!=b.GetBits()[y*b.GetWidth()+x];return n;}
Sexy::Rect Ink(Sexy::MemoryImage&image){int l=image.GetWidth(),t=image.GetHeight(),r=-1,b=-1;for(int y=0;y<image.GetHeight();++y)for(int x=0;x<image.GetWidth();++x)if((image.GetBits()[y*image.GetWidth()+x]>>24)>8){l=std::min(l,x);t=std::min(t,y);r=std::max(r,x);b=std::max(b,y);}return r<l?Sexy::Rect():Sexy::Rect(l,t,r-l+1,b-t+1);}
bool Inside(const Sexy::Rect&r,const Sexy::Rect&w){return r.mWidth>0&&r.mHeight>0&&r.mX>=w.mX&&r.mY>=w.mY&&r.mX+r.mWidth<=w.mX+w.mWidth&&r.mY+r.mHeight<=w.mY+w.mHeight;}
void Fit(Sexy::Graphics&g,Sexy::MemoryImage&im,float x,float baseline,float w,float h){auto bounds=Ink(im);Require(bounds.mWidth>0&&bounds.mHeight>0,"original cached head/body blank");const float scale=std::min(w/bounds.mWidth,h/bounds.mHeight);PvzpDrawImageScaledF(&g,&im,x-(bounds.mX+bounds.mWidth*.5f)*scale,baseline-(bounds.mY+bounds.mHeight)*scale,scale,scale);}
bool MatrixNear(const Sexy::SexyMatrix3&a,const Sexy::SexyMatrix3&b){return std::abs(a.m00-b.m00)<.0001f&&std::abs(a.m01-b.m01)<.0001f&&std::abs(a.m02-b.m02)<.0001f&&std::abs(a.m10-b.m10)<.0001f&&std::abs(a.m11-b.m11)<.0001f&&std::abs(a.m12-b.m12)<.0001f&&std::abs(a.m20-b.m20)<.0001f&&std::abs(a.m21-b.m21)<.0001f&&std::abs(a.m22-b.m22)<.0001f;}
// Read the actual opaque outward spout edge from the native software raster.
// This does not call the production mouth helper or repeat its affine formula.
std::pair<float,float> SpoutEdge(Zombie&z,const std::string&path){
 auto body=z.mApp->ReanimationTryToGet(z.mBodyReanimID);auto head=z.mApp->ReanimationTryToGet(z.mSpecialHeadReanimID);Require(body&&head,"independent spout raster lacks native rig");
 std::vector<int>groups;for(int i=0;i<head->mDefinition->mTracks.count;++i)groups.push_back(head->mTrackInstances[i].mRenderGroup);
 head->ShowOnlyTrack("PuffShroom_tip");auto tip=ActorFrame(z);auto track=body->GetTrackInstanceByName("anim_head1");const auto attachment=track->mAttachmentID;track->mAttachmentID=ATTACHMENTID_NULL;auto absent=ActorFrame(z);track->mAttachmentID=attachment;
 for(int i=0;i<int(groups.size());++i)head->mTrackInstances[i].mRenderGroup=groups[i];WriteBmp(tip.get(),path.c_str());
 int edge=z.mMindControlled?-1:tip->GetWidth(),count=0;const auto a=tip->GetBits(),b=absent->GetBits();
 for(int y=0;y<tip->GetHeight();++y)for(int x=0;x<tip->GetWidth();++x)if(a[y*tip->GetWidth()+x]!=b[y*tip->GetWidth()+x]){edge=z.mMindControlled?std::max(edge,x):std::min(edge,x);++count;}
 Require(count>15&&edge>=0&&edge<tip->GetWidth(),"native opaque Puff spout contour absent");float ysum=0;int band=0;
 for(int y=0;y<tip->GetHeight();++y)for(int x=0;x<tip->GetWidth();++x)if(std::abs(x-edge)<=2&&a[y*tip->GetWidth()+x]!=b[y*tip->GetWidth()+x]){ysum+=y;++band;}
 Require(band>0,"native outward spout edge band absent");return{z.mX+edge-340.0f,z.mY+ysum/band-40.0f};
}
}
void Z3Presentation(LawnApp*app,int speed,int seed,Json&out){
 using namespace Z3Pixels;(void)seed;auto b=Arena(app);int attached=0,missingHeadPixels=0,headIdlePixels=0,attackPixels=0,mouthQueries=0;std::vector<int>headDifferences,attackDifferences,muzzlePixelErrors,spoutPixelErrors;
 const std::array<ZombieType,3>types={ZOMBIE_PUFF_HEAD,ZOMBIE_FUME_HEAD,ZOMBIE_ICE_HEAD};
 const std::array<ReanimationType,3>reanimations={REANIM_PUFFSHROOM,REANIM_FUMESHROOM,REANIM_ICESHROOM};
 const std::array<std::array<float,3>,3>literal={{{69,-28,1.05f},{62,-22,.90f},{60,-18,.85f}}};
 for(int index=0;index<3;++index){b=Arena(app);auto z=Actor(b,types[index],430,2);auto body=app->ReanimationTryToGet(z->mBodyReanimID);auto head=app->ReanimationTryToGet(z->mSpecialHeadReanimID);Require(body&&head&&head->mReanimationType==reanimations[index]&&head->mIsAttachment,"head is not its complete original attached mushroom rig");
  auto track=body->GetTrackInstanceByName("anim_head1");auto attachment=FindFirstAttachment(track->mAttachmentID);Require(attachment&&attachment->mEffectType==EFFECT_REANIM&&attachment->mEffectID==z->mSpecialHeadReanimID,"mushroom head detached from original zombie head track");
  Sexy::SexyMatrix3 expected;PvzpScaleRotateTransformMatrix(expected,literal[index][0],literal[index][1],.2f,-literal[index][2],literal[index][2]);Require(MatrixNear(attachment->mOffset,expected),"live head transform differs from independently specified original Zombotany attachment proportions");
  auto full=ActorFrame(*z);const auto saved=track->mAttachmentID;track->mAttachmentID=ATTACHMENTID_NULL;auto missing=ActorFrame(*z);track->mAttachmentID=saved;const int difference=Different(*full,*missing,Sexy::Rect(250,0,240,130));Require(difference>200,"complete original cap/face/neck pixels missing");missingHeadPixels+=difference;headDifferences.push_back(difference);++attached;
  // The walking carrier and original cap/face animate together. A detached or
  // frozen stamp fails this upper-body comparison while legs stay excluded.
  for(int tick=0;tick<70;++tick)OneTick(app);auto idle=ActorFrame(*z);const int idleDelta=Different(*full,*idle,Sexy::Rect(250,0,240,130));Require(idleDelta>80,"native mushroom carrier idle/walk motion is imperceptible");headIdlePixels+=idleDelta;
  const std::string base="/test-saves/zombotany3-head-"+std::to_string(index);WriteBmp(full.get(),(base+"-idle0.bmp").c_str());WriteBmp(idle.get(),(base+"-idle1.bmp").c_str());
  b->AddPlant(3,2,SEED_WALLNUT,SEED_NONE);Picture attack,release;for(int tick=0;tick<400;++tick){OneTick(app);if(!attack&&z->mBossBungeeCounter>0&&z->mBossBungeeCounter<=17)attack=ActorFrame(*z);if(attack&&z->mBossBungeeCounter<0){release=ActorFrame(*z);break;}}
  Require(attack&&release,"original mushroom attack anticipation/release was never rendered");const int attackDelta=Different(*idle,*attack,Sexy::Rect(250,0,240,130));Require(attackDelta>80,"mushroom attack pose/charge does not visibly change");attackPixels+=attackDelta;attackDifferences.push_back(attackDelta);WriteBmp(attack.get(),(base+"-windup.bmp").c_str());WriteBmp(release.get(),(base+"-release.bmp").c_str());
  if(index==1){for(int tick=0;tick<20;++tick)OneTick(app);Require(z->mBossBungeeCounter==-40,"native Fume peak frame missed age20");auto peak=ActorFrame(*z);WriteBmp(peak.get(),(base+"-peak20.bmp").c_str());Render(app,"/test-saves/zombotany3-fume-peak20-lawn.bmp");for(int tick=0;tick<38;++tick)OneTick(app);Require(z->mBossBungeeCounter==-2,"native Fume late fade frame missed age58");auto late=ActorFrame(*z);WriteBmp(late.get(),(base+"-late58.bmp").c_str());}
  for(bool hypno:{false,true}){z->mMindControlled=hypno;z->UpdateReanim();float x,y;Require(Zombotany3Art::GetMouthPosition(*z,x,y)&&std::isfinite(x)&&std::isfinite(y),"live original head mouth absent for normal/hypno carrier");Require(std::abs(x-z->mPosX)<160&&y>z->mPosY-100&&y<z->mPosY+120,"animated mushroom muzzle detached from its carrier");++mouthQueries;}
 }
 auto card=dynamic_cast<Sexy::MemoryImage*>(Zombotany3Art::GetImage());Require(card&&card->GetWidth()==80&&card->GetHeight()==65,"new Zombotany3 native card invalid");auto expectedCard=Blank(80,65);Sexy::Graphics cg(expectedCard.get());cg.SetLinearBlend(true);cg.ClipRect(0,0,80,65);cg.DrawImage(Sexy::IMAGE_BACKGROUND2,Sexy::Rect(0,0,80,65),Sexy::Rect(400,80,480,390));
 for(int i=0;i<3;++i){auto image=app->mReanimatorCache->MakeCachedZombieFrame(types[i]);Require(image.get()!=nullptr,"new type missing complete cached original body/head");Fit(cg,*image,13+27*i,63,i==1?30:25,i==0?43:i==1?59:50);}
 Require(Different(*card,*expectedCard,Sexy::Rect(0,0,80,65))==0,"unique three-head night thumbnail differs from independently composed native reference");WriteBmp(card,"/test-saves/zombotany3-card.bmp");
 // Independently sample walk/eat, two animation fractions, and both native
 // directions. Actor/timing assignments here are synthetic zero-credit only.
 for(bool hypno:{false,true})for(bool eating:{false,true})for(float phase:{.2f,.7f}){
  b=Arena(app);auto z=Actor(b,ZOMBIE_PUFF_HEAD,430,2);z->mMindControlled=hypno;z->mIsEating=eating;z->PlayZombieReanim(eating?"anim_eat":"anim_walk",REANIM_LOOP,0,12.0f);z->UpdateReanim();auto body=app->ReanimationTryToGet(z->mBodyReanimID);auto head=app->ReanimationTryToGet(z->mSpecialHeadReanimID);body->mAnimTime=phase;head->PlayReanim("anim_shooting",REANIM_PLAY_ONCE_AND_HOLD,0,35.0f);head->mAnimTime=.7f;body->Update();z->mBossBungeeCounter=1;z->mSummonCounter=0;
  if(hypno){Zombie::PreloadZombieResources(ZOMBIE_NORMAL);auto target=b->AddZombieInRow(ZOMBIE_NORMAL,2,0);target->mPosX=550;target->mX=550;target->UpdateReanim();}else b->AddPlant(3,2,SEED_WALLNUT,SEED_NONE);
  const std::string stem="/test-saves/zombotany3-mouth-"+std::to_string(hypno)+"-"+std::to_string(eating)+"-"+std::to_string(int(phase*10));auto full=ActorFrame(*z);WriteBmp(full.get(),(stem+"-head.bmp").c_str());const auto edge=SpoutEdge(*z,stem+"-spout.bmp");float x,y;Require(Zombotany3Art::GetMouthPosition(*z,x,y),"actual native Puff mouth absent");Zombotany3::UpdateZombie(*z);Projectile*shot=nullptr;for(auto p:b->mProjectiles)if(!p->mDead&&p->mProjectileType==PROJECTILE_PUFF)shot=p;Require(shot,"direct production release did not create visible native Puff");
  const float centerX=shot->mPosX+13,centerY=shot->mPosY+13;const int mouthError=std::llround(std::hypot(centerX-x,centerY-y)*1000),edgeError=std::llround(std::hypot(centerX-edge.first,centerY-edge.second)*1000);muzzlePixelErrors.push_back(mouthError);spoutPixelErrors.push_back(edgeError);
  std::fprintf(stderr,"actual native Puff raster hypno=%d eating=%d phase=%.1f center=(%.3f,%.3f) helper=(%.3f,%.3f) opaqueEdge=(%.3f,%.3f) helperErrorMilli=%d edgeErrorMilli=%d\n",hypno,eating,phase,centerX,centerY,x,y,edge.first,edge.second,mouthError,edgeError);Render(app,(stem+"-release.bmp").c_str());
 }
 app->KillBoard();if(app->mChallengeScreen)app->KillChallengeScreen();app->ShowChallengeScreen(CHALLENGE_PAGE_BONUS);auto screen=app->mChallengeScreen.get();int bonusCards=0;for(auto&button:screen->mChallengeButtons)bonusCards+=button->mVisible;Require(bonusCards==20,"existing Bonus page lost or gained a card");
 auto family=screen->mZombotanyButton.get();Require(family&&family->mVisible&&!family->mDisabled&&family->mX==505&&family->mY==568&&family->mWidth==111&&family->mHeight==26,"native family navigation button does not match original111px sprite and hit bounds");const auto f=family->GetAbsPos();Click(app,f.mX+family->mWidth/2,f.mY+family->mHeight/2);screen=app->mChallengeScreen.get();Require(screen&&screen->mPageIndex==CHALLENGE_PAGE_ZOMBOTANY,"actual family footer click did not open Zombotany");
 std::vector<int>visible;std::vector<Sexy::Rect>rectangles;for(int i=0;i<NUM_CHALLENGE_MODES;++i)if(screen->mChallengeButtons[i]->mVisible){visible.push_back(i);auto button=screen->mChallengeButtons[i].get();rectangles.emplace_back(button->mX,button->mY,button->mWidth,button->mHeight);}
 Require(visible==std::vector<int>({15,31,92}),"family does not contain exactly original1/2 and new3 records");
 for(int i=0;i<3;++i)Require(rectangles[i]==Sexy::Rect(193+155*i,93,104,115),"original challenge cards lost consistent centered family geometry");
 for(auto button:{screen->mBackButton.get(),screen->mBonusButton.get(),screen->mZombotanyButton.get()})if(button&&button->mVisible)rectangles.emplace_back(button->mX,button->mY,button->mWidth,button->mHeight);
 int pairs=0;for(int i=0;i<int(rectangles.size());++i){Require(Inside(rectangles[i],Sexy::Rect(0,0,800,600)),"family card/footer clips800x600");for(int j=0;j<i;++j){Require(!rectangles[i].Intersects(rectangles[j]),"family cards or footer controls overlap");++pairs;}}
 auto familyFrame=Frame(app);WriteBmp(familyFrame.get(),"/test-saves/zombotany3-family.bmp");
 // Synthetic zero-credit profile fixture: compare the same original locked
 // card through its real Mini-Games page and its family alias. All profile
 // fields are restored before the published original-record assertions below.
 const PlayerInfo tooltipProfile=*app->mPlayerInfo;
 app->mPlayerInfo->mFinishedAdventure=1;app->mPlayerInfo->mHasNewMiniGame=0;
 for(auto&record:app->mPlayerInfo->mChallengeRecords)record=0;
 for(int mode=16;mode<=28;++mode)app->mPlayerInfo->mChallengeRecords[mode-1]=1;
 Require(app->HasFinishedAdventure()&&!app->IsTrialStageLocked()&&app->GetNumTrophies(CHALLENGE_PAGE_CHALLENGE)==13&&!app->HasBeatenChallenge(GAMEMODE_CHALLENGE_WAR_AND_PEAS_2),"native alias tooltip fixture needs13 original trophies and an unbeaten second Zombotany");
 app->KillChallengeScreen();app->ShowChallengeScreen(CHALLENGE_PAGE_CHALLENGE);screen=app->mChallengeScreen.get();
 auto originalAlias=screen->mChallengeButtons[31].get();Require(originalAlias->mVisible&&originalAlias->mDisabled&&screen->MoreTrophiesNeeded(31)==1,"original second Zombotany must remain one trophy from unlock");
 auto originalPoint=originalAlias->GetAbsPos();app->mWidgetManager->MouseMove(originalPoint.mX+originalAlias->mWidth/2,originalPoint.mY+originalAlias->mHeight/2);screen->UpdateToolTip();
 Require(screen->mToolTip->mVisible&&screen->mToolTip->mLabel==PvzpStringTranslate("[ONE_MORE_CHALLENGE_TOOLTIP]"),"native original card hover lost its original unlock tooltip");
 const auto originalTipLabel=screen->mToolTip->mLabel;const int originalTipWidth=screen->mToolTip->mWidth,originalTipHeight=screen->mToolTip->mHeight;
 auto originalTooltipFrame=Frame(app);WriteBmp(originalTooltipFrame.get(),"/test-saves/zombotany3-tooltip-original.bmp");
 auto originalFamilyButton=screen->mZombotanyButton.get();const auto categoryPoint=originalFamilyButton->GetAbsPos();Click(app,categoryPoint.mX+originalFamilyButton->mWidth/2,categoryPoint.mY+originalFamilyButton->mHeight/2);screen=app->mChallengeScreen.get();
 Require(screen->mPageIndex==CHALLENGE_PAGE_ZOMBOTANY,"native alias tooltip category input did not open family");
 auto familyAlias=screen->mChallengeButtons[31].get();const auto aliasPoint=familyAlias->GetAbsPos();app->mWidgetManager->MouseMove(aliasPoint.mX+familyAlias->mWidth/2,aliasPoint.mY+familyAlias->mHeight/2);screen->UpdateToolTip();
 Require(familyAlias->mVisible&&familyAlias->mDisabled&&screen->MoreTrophiesNeeded(31)==1,"family alias changed the original one-trophy lock");
 Require(screen->mToolTip->mVisible&&screen->mToolTip->mLabel==originalTipLabel,"family alias lost the original unlock hover tooltip");
 Require(screen->mToolTip->mWidth==originalTipWidth&&screen->mToolTip->mHeight==originalTipHeight,"family alias changed the original native tooltip font/wrapping");
 const Sexy::Rect aliasTipRect(screen->mToolTip->mX-screen->mToolTip->mWidth/2,screen->mToolTip->mY,screen->mToolTip->mWidth,screen->mToolTip->mHeight);
 Require(Inside(aliasTipRect,Sexy::Rect(0,0,800,600)),"native alias tooltip clips the game canvas");
 Require(aliasTipRect.mX>=303&&aliasTipRect.mX+aliasTipRect.mWidth<=497,"native alias tooltip overlaps adjacent family card frames");
 auto aliasTooltipFrame=Frame(app);WriteBmp(aliasTooltipFrame.get(),"/test-saves/zombotany3-tooltip-alias.bmp");screen->mToolTip->mVisible=false;auto absentTooltipFrame=Frame(app);screen->mToolTip->mVisible=true;
 const int aliasTooltipPixels=Different(*aliasTooltipFrame,*absentTooltipFrame,aliasTipRect);Require(aliasTooltipPixels>100,"native alias tooltip was not actually rasterized");
 app->KillChallengeScreen();*app->mPlayerInfo=tooltipProfile;app->ShowChallengeScreen(CHALLENGE_PAGE_ZOMBOTANY);screen=app->mChallengeScreen.get();
 for(int i=0;i<100;++i)Require(app->mPlayerInfo->mChallengeRecords[i]==tooltipProfile.mChallengeRecords[i],"alias tooltip fixture changed a saved challenge record");
 Require(app->mPlayerInfo->mFinishedAdventure==tooltipProfile.mFinishedAdventure&&app->mPlayerInfo->mHasNewMiniGame==tooltipProfile.mHasNewMiniGame,"alias tooltip fixture did not restore original profile flags");
 out.B("nativeAliasTooltipSyntheticProfile",true);out.N("nativeAliasTooltipHoverInputs",2);out.N("nativeAliasTooltipOriginalTrophiesNeeded",1);out.N("nativeAliasTooltipFamilyTrophiesNeeded",1);out.B("nativeAliasTooltipOriginalVisible",true);out.B("nativeAliasTooltipFamilyVisible",true);out.B("nativeAliasTooltipLabelMatchesOriginal",true);out.B("nativeAliasTooltipDimensionsMatchOriginal",true);out.N("nativeAliasTooltipWidth",originalTipWidth);out.N("nativeAliasTooltipHeight",originalTipHeight);out.Raw("nativeAliasTooltipFamilyRect",Numbers({aliasTipRect.mX,aliasTipRect.mY,aliasTipRect.mWidth,aliasTipRect.mHeight}));out.N("nativeAliasTooltipRasterDifferencePixels",aliasTooltipPixels);out.B("nativeAliasTooltipCanvasAndNeighborsClear",true);out.B("nativeAliasTooltipProfileRestored",true);
 const auto before1=app->mPlayerInfo->mChallengeRecords[15],before2=app->mPlayerInfo->mChallengeRecords[31];Require(before1==0&&before2==0,"synthetic family began with original wins");Require(screen->mChallengeButtons[92]->mVisible&&!screen->mChallengeButtons[92]->mDisabled,"Zombotany3 cannot be selected from its own family");
 for(int error:muzzlePixelErrors)Require(error<2000,"visible native Puff center misses the actual mouth in walk/eat normal/Hypno pose");for(int error:spoutPixelErrors)Require(error<4000,"visible native Puff center misses the independent opaque spout edge");
 out.N("nativeAttachedMushroomHeads",attached);out.N("nativeMissingHeadDifferencePixels",missingHeadPixels);out.Raw("nativeHeadDifferencePixels",Numbers(headDifferences));out.N("nativeUpperBodyIdleDifferencePixels",headIdlePixels);out.N("nativeAttackDifferencePixels",attackPixels);out.Raw("nativeAttackDifferencePerHead",Numbers(attackDifferences));out.N("nativeMouthNormalHypnoQueries",mouthQueries);out.Raw("nativeVisiblePuffCenterMouthErrorMilliPixels",Numbers(muzzlePixelErrors));out.Raw("nativeVisiblePuffCenterOpaqueEdgeErrorMilliPixels",Numbers(spoutPixelErrors));out.N("nativeIndependentPuffSpoutPoseQueries",int(muzzlePixelErrors.size()));out.B("nativeOriginalHeadTransformsExact",true);out.B("nativeUniqueNightCardExact",true);out.N("nativeBonusCardsPreserved",bonusCards);out.Raw("nativeFamilyRecordIndices",Numbers(visible));out.N("nativeFamilyLayoutPairChecks",pairs);out.B("nativeFamilyActualFooterInput",true);out.B("nativeFamilyOriginalRecordsPreserved",true);out.B("nativeFamilyCardFooterNoOverlap",true);out.B("native800x600Canvas",true);
}
#endif
