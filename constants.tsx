
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

export const DUNGEON_CONFIG = {
  FLOOR_WIDTH: 12,
  FLOOR_HEIGHT: 12,
  MAX_FLOORS: 10
};

// Character & Monster Pixel Art (Data URLs)
export const GUIDE_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH6AMFDBUuN8Y7YAAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkZW5mdy8AAAL+SURBVHja7ZpNSBRRFMf/78280SxdXU3TNC0rS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0iwrS0vL0v0D88Bf6f8A3B69jHwAAAABJRU5ErkJggg==';

export const ENEMY_IMAGES: Record<string, string> = {
  'スライム': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH6AMFDBUuN8Y7YAAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkZW5mdy8AAACFSURBVHja7dtBCsAgDATAsv9/uX6khxYpSreZBy8isS06Sknp866unK8u87yv676Wz98N0H7vA7S9D9D2PkDb+wBt7wO0vQ/Q9j5A2/sAbe8DtL0P0PY+QNv7AG3vA7S9D9D2PkDb+wBt7wO0vQ/Q9j5A2/sAbe8DtL0P0PY+QNv7AG3vA7S9D9D2PkDb+wB9O/uFAAAAAElFTkSuQmCC',
  'ゴブリン': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH6AMFDBUuN8Y7YAAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkZW5mdy8AAACMSURBVHja7dvRCsAgDATAsv9/uT6khxaN6szmwc0ktm1HKem9n+vK/ery7Xvd9/p6/G6A8X0fYOxfAOP7PsDYvwDG932AsX8BjO/7AGP/Ahjf9wHG/gUwvu8DjP0LYHzfBxj7F8D4vg8w9i+A8X0fYOxfAOP7PsDYvwDG932AsX8BjO/7AGP/Ahjf9wHG/gUwvu8D9C/p9gEAAAAASUVORK5CYII=',
  'コウモリ': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH6AMFDBUuN8Y7YAAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkZW5mdy8AAACCSURBVHja7dtRCsAgDATAsv9/uT6khxaN6szmwc0ktm1HKem9n+vK/ery7Xvd9/p6/G6A8X0fYOxfAOP7PsDYvwDG932AsX8BjO/7AGP/Ahjf9wHG/gUwvu8DjP0LYHzfBxj7F8D4vg8w9i+A8X0fYOxfAOP7PsDYvwDG932AsX8BjO/7AGP/Ahjf9wHG/gUwvu8D9C/p9gEAAAAASUVORK5CYII=',
  'ガイコツ': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH6AMFDBUuN8Y7YAAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkZW5mdy8AAACCSURBVHja7dtRCsAgDATAsv9/uT6khxaN6szmwc0ktm1HKem9n+vK/ery7Xvd9/p6/G6A8X0fYOxfAOP7PsDYvwDG932AsX8BjO/7AGP/Ahjf9wHG/gUwvu8DjP0LYHzfBxj7F8D4vg8w9i+A8X0fYOxfAOP7PsDYvwDG932AsX8BjO/7AGP/Ahjf9wHG/gUwvu8D9C/p9gEAAAAASUVORK5CYII=',
  '魔導士': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH6AMFDBUuN8Y7YAAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkZW5mdy8AAACCSURBVHja7dtRCsAgDATAsv9/uT6khxaN6szmwc0ktm1HKem9n+vK/ery7Xvd9/p6/G6A8X0fYOxfAOP7PsDYvwDG932AsX8BjO/7AGP/Ahjf9wHG/gUwvu8DjP0LYHzfBxj7F8D4vg8w9i+A8X0fYOxfAOP7PsDYvwDG932AsX8BjO/7AGP/Ahjf9wHG/gUwvu8D9C/p9gEAAAAASUVORK5CYII='
};

export const INITIAL_ITEMS: Item[] = [
  { id: '1', name: '薬草', type: 'CONSUMABLE', effectValue: 30, price: 10, description: 'HPを30回復する。' },
  { id: '2', name: '錆びた剣', type: 'WEAPON', effectValue: 5, price: 0, description: '古びた鉄の剣。' },
  { id: '3', name: '布の服', type: 'ARMOR', effectValue: 2, price: 0, description: '粗末な服。' }
];

export const SHOP_INVENTORY: Item[] = [
  { id: 's1', name: '癒やしの水', type: 'CONSUMABLE', effectValue: 60, price: 30, description: 'HPを60回復する。' },
  { id: 's2', name: '鋼の剣', type: 'WEAPON', effectValue: 15, price: 100, description: '鋭い鋼鉄の剣。' },
  { id: 's3', name: '鎖かたびら', type: 'ARMOR', effectValue: 10, price: 80, description: '頑丈な鎖の防具。' },
  { id: 's4', name: '勇者の剣', type: 'WEAPON', effectValue: 40, price: 500, description: '伝説の輝きを放つ剣。' }
];

export const JOB_DATA = {
  [JobType.WARRIOR]: { hp: 120, mp: 10, atk: 18, def: 12 },
  [JobType.MAGE]: { hp: 70, mp: 50, atk: 25, def: 5 },
  [JobType.CLERIC]: { hp: 90, mp: 30, atk: 10, def: 8 },
  [JobType.THIEF]: { hp: 100, mp: 15, atk: 14, def: 7 }
};
