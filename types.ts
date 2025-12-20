
export enum GameState {
  TOWN = 'TOWN',
  DUNGEON = 'DUNGEON',
  BATTLE = 'BATTLE',
  DIALOGUE = 'DIALOGUE',
  MENU = 'MENU',
  GAMEOVER = 'GAMEOVER'
}

export enum JobType {
  WARRIOR = '戦士',
  MAGE = '魔導士',
  CLERIC = '聖職者',
  THIEF = '盗賊'
}

export interface Stats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  level: number;
  exp: number;
}

export interface Item {
  id: string;
  name: string;
  type: 'WEAPON' | 'ARMOR' | 'CONSUMABLE';
  effectValue: number;
  price: number;
  description: string;
}

export interface Player {
  name: string;
  job: JobType;
  stats: Stats;
  inventory: Item[];
  equippedWeapon?: Item;
  equippedArmor?: Item;
  gold: number;
  floor: number;
  x: number;
  y: number;
  direction: number; // 0: N, 1: E, 2: S, 3: W
}

export interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  exp: number;
  gold: number;
}

export interface DungeonFloor {
  grid: number[][]; // 0: path, 1: wall, 2: stairs
  width: number;
  height: number;
}
