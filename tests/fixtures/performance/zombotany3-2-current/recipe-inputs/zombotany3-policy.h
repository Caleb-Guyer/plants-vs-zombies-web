// SPDX-License-Identifier: LGPL-3.0-or-later
#pragma once
#include "ConstEnums.h"
#include <array>
#include <vector>
#include <algorithm>

// The independent player sees only visible species, rows, positions, planted
// cells, sun and actual packet/tile availability. It never reads enemy HP,
// attack/freeze clocks, future waves or the RNG.
namespace Z3Player {
inline constexpr std::array<SeedType,6> Seeds={SEED_SUNSHROOM,SEED_PUFFSHROOM,SEED_SCAREDYSHROOM,SEED_FUMESHROOM,SEED_WALLNUT,SEED_CHERRYBOMB};
inline constexpr std::array<std::array<int,4>,20> Waves={{{0,1,0,0},{1,1,0,0},{0,2,0,0},{0,2,0,0},{0,2,1,0},
 {0,2,1,0},{0,3,1,0},{0,3,1,0},{0,3,2,0},{0,3,2,1},{0,3,2,0},{0,3,2,0},{0,4,2,0},{0,4,2,0},{0,4,2,0},
 {0,4,3,0},{0,4,3,0},{0,4,3,0},{0,4,3,0},{0,5,3,1}}};
struct Cell{SeedType seed;int col,row;};
struct Enemy{ZombieType type;int row;float x;};
struct View{int sun=0;std::vector<Cell> plants;std::vector<Enemy> enemies;std::array<std::array<std::array<bool,9>,5>,6> legal{};};
struct Decision{SeedType seed=SEED_NONE;int col=0,row=0;};
inline int Index(SeedType seed){for(int i=0;i<6;++i)if(Seeds[i]==seed)return i;return -1;}
inline bool Has(const View&v,SeedType seed,int col,int row){return std::any_of(v.plants.begin(),v.plants.end(),[&](const Cell&p){return p.seed==seed&&p.col==col&&p.row==row;});}
inline bool Can(const View&v,SeedType seed,int col,int row){const int i=Index(seed);return i>=0&&col>=0&&col<9&&row>=0&&row<5&&v.legal[i][row][col];}
inline int Count(const View&v,SeedType seed){return int(std::count_if(v.plants.begin(),v.plants.end(),[&](const Cell&p){return p.seed==seed;}));}
inline Decision Choose(const View&v){
 const auto rows=std::array{2,1,3,0,4};
 // An emergency instant is based solely on a visibly advanced attacker.
 for(const auto&e:v.enemies)if(e.x<280){const int col=std::clamp(int((e.x-40)/80),0,8);for(int c:{col,std::min(8,col+1),std::max(0,col-1)})if(Can(v,SEED_CHERRYBOMB,c,e.row))return{SEED_CHERRYBOMB,c,e.row};}
 // Free front guards are useful while the original night economy develops.
 for(const auto&e:v.enemies)if(e.x<690){
  bool defended=false;for(const auto&p:v.plants)defended|=p.row==e.row&&p.seed!=SEED_SUNSHROOM&&p.seed!=SEED_WALLNUT;
  if(!defended){if(Can(v,SEED_SCAREDYSHROOM,0,e.row))return{SEED_SCAREDYSHROOM,0,e.row};for(int col:{4,3,5})if(Can(v,SEED_PUFFSHROOM,col,e.row))return{SEED_PUFFSHROOM,col,e.row};}
 }
 const int producers=Count(v,SEED_SUNSHROOM);
 if(producers<5)for(int row:rows)if(Can(v,SEED_SUNSHROOM,1,row))return{SEED_SUNSHROOM,1,row};
 for(const auto&e:v.enemies)if(e.x<680){
  if(!Has(v,SEED_SCAREDYSHROOM,0,e.row)&&Can(v,SEED_SCAREDYSHROOM,0,e.row))return{SEED_SCAREDYSHROOM,0,e.row};
  for(int col:{4,3,5})if(Can(v,SEED_PUFFSHROOM,col,e.row))return{SEED_PUFFSHROOM,col,e.row};
 }
 for(int row:rows)if(Can(v,SEED_SCAREDYSHROOM,0,row))return{SEED_SCAREDYSHROOM,0,row};
 for(int row:rows)if(Can(v,SEED_FUMESHROOM,3,row))return{SEED_FUMESHROOM,3,row};
 for(int row:rows)if(Can(v,SEED_PUFFSHROOM,4,row))return{SEED_PUFFSHROOM,4,row};
 for(int row:rows)if(Can(v,SEED_WALLNUT,5,row))return{SEED_WALLNUT,5,row};
 for(int row:rows)if(Can(v,SEED_SCAREDYSHROOM,2,row))return{SEED_SCAREDYSHROOM,2,row};
 for(int row:rows)if(Can(v,SEED_PUFFSHROOM,6,row))return{SEED_PUFFSHROOM,6,row};
 return{};
}
}
