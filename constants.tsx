
import { JobType, Item } from './types';

export const COLORS = {
  bg: '#EAE7DC',
  primary: '#8E8D8A',
  secondary: '#D8C3A5',
  accent: '#E98074',
  highlight: '#E85A4F',
  text: '#4A4A48',
  wall: '#B0A295',
  floor: '#D1C7BD',
  sky: '#C5D0D3'
};

export const INITIAL_ITEMS: Item[] = [
  { id: 'herb', name: 'やくそう', type: 'CONSUMABLE', effectValue: 30, price: 10, description: 'HPを30回復する。' },
  { id: 'rusty_sword', name: 'なまくら刀', type: 'WEAPON', effectValue: 5, price: 50, description: '少しだけ攻撃力が上がる。' },
  { id: 'cloth_armor', name: '布の服', type: 'ARMOR', effectValue: 3, price: 40, description: '少しだけ防御力が上がる。' }
];

export const SHOP_INVENTORY: Item[] = [
  ...INITIAL_ITEMS,
  { id: 'potion', name: '上やくそう', type: 'CONSUMABLE', effectValue: 80, price: 50, description: 'HPを80回復する。' },
  { id: 'iron_sword', name: '鉄の剣', type: 'WEAPON', effectValue: 15, price: 500, description: '鋭い鉄の剣。' },
  { id: 'steel_armor', name: '鋼の鎧', type: 'ARMOR', effectValue: 12, price: 600, description: '頑丈な鋼の鎧。' },
  { id: 'magic_staff', name: '魔力の杖', type: 'WEAPON', effectValue: 10, price: 450, description: '魔力がこもった杖。' }
];

export const JOB_DATA = {
  [JobType.WARRIOR]: { hp: 120, mp: 20, atk: 15, def: 10 },
  [JobType.MAGE]: { hp: 70, mp: 80, atk: 5, def: 5 },
  [JobType.CLERIC]: { hp: 90, mp: 50, atk: 8, def: 8 },
  [JobType.THIEF]: { hp: 100, mp: 30, atk: 12, def: 6 }
};
