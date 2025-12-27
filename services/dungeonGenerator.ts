
import { DungeonFloor } from '../types';

export function generateFloor(width: number, height: number): DungeonFloor {
  // すべて壁で埋める
  const grid = Array.from({ length: height }, () => Array(width).fill(1));
  const explored = Array.from({ length: height }, () => Array(width).fill(false));
  
  // 道を掘る (穴掘り法)
  // 外周1マスは常に壁にするため、2からサイズ-2の間で動く
  function carve(x: number, y: number) {
    grid[y][x] = 0;
    
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]].sort(() => Math.random() - 0.5);
    
    for (const [dx, dy] of dirs) {
      const nx = x + dx * 2;
      const ny = y + dy * 2;
      
      // 境界チェック: 外周1マスを必ず残す
      if (nx >= 1 && nx < width - 1 && ny >= 1 && ny < height - 1 && grid[ny][nx] === 1) {
        grid[y + dy][x + dx] = 0;
        carve(nx, ny);
      }
    }
  }

  // 開始地点 (1,1)
  carve(1, 1);
  
  // 行き止まりをなくすためのループ生成
  // 周囲3マスが壁ならそこは行き止まり
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (grid[y][x] === 0) {
        let walls = 0;
        const neighbors = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (const [dx, dy] of neighbors) {
          if (grid[y + dy][x + dx] === 1) walls++;
        }
        
        // 行き止まりの場合、ランダムに隣接する壁を1つ壊す
        if (walls >= 3) {
          for (const [dx, dy] of neighbors.sort(() => Math.random() - 0.5)) {
            const wx = x + dx;
            const wy = y + dy;
            // 壊す壁が外周でないことを確認
            if (wx >= 1 && wx < width - 1 && wy >= 1 && wy < height - 1 && grid[wy][wx] === 1) {
              grid[wy][wx] = 0;
              break;
            }
          }
        }
      }
    }
  }

  // 階段の設置 (開始地点から遠い場所に置くのが望ましいが、簡易的にランダム)
  let stairsX, stairsY;
  do {
    stairsX = Math.floor(Math.random() * (width - 2)) + 1;
    stairsY = Math.floor(Math.random() * (height - 2)) + 1;
  } while (grid[stairsY][stairsX] !== 0 || (stairsX === 1 && stairsY === 1));
  
  grid[stairsY][stairsX] = 2;

  // 最終確認: 外周がすべて壁であることを保証する
  for (let x = 0; x < width; x++) {
    grid[0][x] = 1;
    grid[height - 1][x] = 1;
  }
  for (let y = 0; y < height; y++) {
    grid[y][0] = 1;
    grid[y][width - 1] = 1;
  }

  return { grid, explored, width, height };
}
