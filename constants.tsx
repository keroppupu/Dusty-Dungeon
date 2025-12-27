
import { JobType, Item } from './types';

export const COLORS = {
  bg: '#EAE7DC',
  primary: '#8E8D8A',
  secondary: '#D8C3A5',
  accent: '#E98074',
  highlight: '#E85A4F',
  text: '#4A4A48',
  wall: '#7B6B5D',
  floor: '#9C8F84',
  sky: '#2C3E50'
};

export const DUNGEON_CONFIG = {
  FLOOR_WIDTH: 13, // 奇数の方が迷路生成しやすい
  FLOOR_HEIGHT: 13,
  MAX_FLOORS: 10
};

export const INITIAL_ITEMS: Item[] = [
  { id: 'p1', name: '薬草', type: 'CONSUMABLE', effectValue: 30, price: 10, description: 'HPを30回復する' },
  { id: 'w1', name: '錆びた剣', type: 'WEAPON', effectValue: 5, price: 50, description: '古びた鉄の剣' },
  { id: 'a1', name: '布の服', type: 'ARMOR', effectValue: 3, price: 30, description: '薄手の冒険着' },
];

export const SHOP_INVENTORY: Item[] = [
  { id: 'p1', name: '薬草', type: 'CONSUMABLE', effectValue: 30, price: 10, description: 'HPを30回復する' },
  { id: 'p2', name: '高級薬草', type: 'CONSUMABLE', effectValue: 70, price: 40, description: 'HPを70回復する' },
  { id: 'w2', name: '鋼の剣', type: 'WEAPON', effectValue: 15, price: 150, description: '鋭い切れ味の剣' },
  { id: 'a2', name: '鎖帷子', type: 'ARMOR', effectValue: 10, price: 120, description: '身の守りを固める' },
];

export const JOB_DATA: Record<JobType, { description: string; baseAtk: number; baseDef: number }> = {
  [JobType.WARRIOR]: { description: '力強く、防御にも優れる戦士。', baseAtk: 15, baseDef: 10 },
  [JobType.MAGE]: { description: '強力な魔法を操る魔導士。', baseAtk: 8, baseDef: 5 },
  [JobType.CLERIC]: { description: '癒やしの力を持つ聖職者。', baseAtk: 10, baseDef: 8 },
  [JobType.THIEF]: { description: '素早さに優れる盗賊。', baseAtk: 12, baseDef: 6 }
};

// Character & Monster Pixel Art
export const GUIDE_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAAnUlEQVR4nO2bwQmAMAxFX9dxHcfxOAn976mglOIp5Yp58CBQ2vS1SZJpkiRJkiRJkiRJkiRJkiRJkiRJkiRJkqS/5W3f68vj67W66N+m/Y09XvYBeu8DtL0P0PY+QNv7AG3vA7S9D9D2PkDb+wBt7wO0vQ/Q9j5A2/sAbe8DtL0P0PY+QNv7AG3vA7S9D9D2PkDb+wBt7wO0vQ/Q9j5A/3v6AZt0G5p8fG4IAAAAAElFTkSuQmCC';

export const ENEMY_IMAGES: Record<string, string> = {
  'スライム': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAAOUlEQVR4nO3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC+Bj9GAAEqm79SAAAAAElFTkSuQmCC',
  'ゴブリン': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAAOUlEQVR4nO3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC+Bj9GAAEqm79SAAAAAElFTkSuQmCC',
  'コウモリ': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAAOUlEQVR4nO3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC+Bj9GAAEqm79SAAAAAElFTkSuQmCC',
  'ガイコツ': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAAOUlEQVR4nO3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC+Bj9GAAEqm79SAAAAAElFTkSuQmCC'
};
