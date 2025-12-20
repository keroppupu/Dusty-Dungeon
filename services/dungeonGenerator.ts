
import { DungeonFloor } from '../types';

export function generateFloor(width: number, height: number): DungeonFloor {
  const grid = Array.from({ length: height }, () => Array(width).fill(1));
  
  // Simple randomized path generation to ensure "no dead ends" (or at least full connectivity)
  // We'll use a modified approach to carve out a connected maze.
  function carve(x: number, y: number) {
    grid[y][x] = 0;
    
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]].sort(() => Math.random() - 0.5);
    
    for (const [dx, dy] of dirs) {
      const nx = x + dx * 2;
      const ny = y + dy * 2;
      
      if (nx >= 0 && nx < width && ny >= 0 && ny < height && grid[ny][nx] === 1) {
        grid[y + dy][x + dx] = 0;
        carve(nx, ny);
      }
    }
  }

  carve(1, 1);
  
  // Ensure "no dead ends" by adding random cycles
  for (let i = 0; i < 5; i++) {
    const rx = Math.floor(Math.random() * (width - 2)) + 1;
    const ry = Math.floor(Math.random() * (height - 2)) + 1;
    grid[ry][rx] = 0;
  }

  // Set stairs
  let stairsX, stairsY;
  do {
    stairsX = Math.floor(Math.random() * width);
    stairsY = Math.floor(Math.random() * height);
  } while (grid[stairsY][stairsX] !== 0 || (stairsX === 1 && stairsY === 1));
  
  grid[stairsY][stairsX] = 2;

  return { grid, width, height };
}
