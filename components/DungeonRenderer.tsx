
import React, { useRef, useEffect } from 'react';
import { Player, DungeonFloor } from '../types';
import { COLORS } from '../constants';

interface DungeonRendererProps {
  player: Player;
  floor: DungeonFloor;
}

const DungeonRenderer: React.FC<DungeonRendererProps> = ({ player, floor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const { x: px, y: py, direction } = player;

      const dirs = [{dx:0, dy:-1}, {dx:1, dy:0}, {dx:0, dy:1}, {dx:-1, dy:0}];
      const forward = dirs[direction];
      const right = dirs[(direction + 1) % 4];

      // 背景
      ctx.fillStyle = COLORS.sky;
      ctx.fillRect(0, 0, w, h / 2);
      ctx.fillStyle = COLORS.floor;
      ctx.fillRect(0, h / 2, w, h / 2);

      const getX = (d: number, s: number) => {
        const scale = 0.8 / Math.max(0.01, d);
        return (w / 2) + (s * w * scale);
      };
      
      const getY = (d: number, isTop: boolean) => {
        const scale = 0.8 / Math.max(0.01, d);
        const ySize = h * scale;
        return isTop ? (h / 2) - (ySize / 2) : (h / 2) + (ySize / 2);
      };

      const getCellAt = (df: number, sf: number) => {
        const cx = Math.floor(px + forward.dx * df + right.dx * sf);
        const cy = Math.floor(py + forward.dy * df + right.dy * sf);
        if (cx < 0 || cx >= floor.width || cy < 0 || cy >= floor.height) return 1;
        return floor.grid[cy][cx];
      };

      // 階段（出口）を描画
      const drawStaircase = (points: {x: number, y: number}[], light: number, isSide: boolean) => {
        const [tl, tr, br, bl] = points;
        const w_cell = tr.x - tl.x;
        const h_cell = bl.y - tl.y;

        // 1. 暗い入り口（穴）
        ctx.fillStyle = `rgba(20, 15, 15, ${light})`;
        if (!isSide) {
          ctx.beginPath();
          ctx.moveTo(tl.x + w_cell * 0.1, tl.y + h_cell * 0.1);
          ctx.lineTo(tr.x - w_cell * 0.1, tr.y + h_cell * 0.1);
          ctx.lineTo(br.x - w_cell * 0.1, br.y);
          ctx.lineTo(bl.x + w_cell * 0.1, bl.y);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(tl.x, tl.y + (bl.y - tl.y) * 0.1);
          ctx.lineTo(tr.x, tr.y + (br.y - tr.y) * 0.1);
          ctx.lineTo(br.x, br.y);
          ctx.lineTo(bl.x, bl.y);
          ctx.fill();
        }

        // 2. 段差の描画
        const numSteps = 6;
        for (let i = 0; i < numSteps; i++) {
          const stepRatio = i / numSteps;
          const nextStepRatio = (i + 1) / numSteps;
          const stepLight = light * (0.3 + (i / numSteps) * 0.7);

          ctx.fillStyle = `rgba(140, 130, 120, ${stepLight})`;
          
          if (!isSide) {
            // 正面階段
            const y1 = bl.y - h_cell * 0.6 * (1 - stepRatio);
            const y2 = bl.y - h_cell * 0.6 * (1 - nextStepRatio);
            const x1 = tl.x + w_cell * (0.15 + stepRatio * 0.1);
            const x2 = tr.x - w_cell * (0.15 + stepRatio * 0.1);
            ctx.fillRect(x1, y1, x2 - x1, y2 - y1 + 1);
            
            // 踏み面のハイライト
            ctx.fillStyle = `rgba(200, 190, 180, ${stepLight * 0.5})`;
            ctx.fillRect(x1, y1, x2 - x1, 2);
          } else {
            // 側面階段
            const y1Start = bl.y - (bl.y - tl.y) * 0.6 * (1 - stepRatio);
            const y1End = br.y - (br.y - tr.y) * 0.6 * (1 - stepRatio);
            const y2Start = bl.y - (bl.y - tl.y) * 0.6 * (1 - nextStepRatio);
            const y2End = br.y - (br.y - tr.y) * 0.6 * (1 - nextStepRatio);

            ctx.beginPath();
            ctx.moveTo(tl.x, y1Start);
            ctx.lineTo(tr.x, y1End);
            ctx.lineTo(tr.x, y2End);
            ctx.lineTo(tl.x, y2Start);
            ctx.fill();
            
            // 踏み面のエッジ
            ctx.strokeStyle = `rgba(255, 255, 255, ${stepLight * 0.3})`;
            ctx.beginPath();
            ctx.moveTo(tl.x, y1Start);
            ctx.lineTo(tr.x, y1End);
            ctx.stroke();
          }
        }
        
        // 3. アーチの枠
        ctx.strokeStyle = `rgba(60, 50, 45, ${light})`;
        ctx.lineWidth = 3;
        if (!isSide) {
          ctx.strokeRect(tl.x + w_cell * 0.1, tl.y + h_cell * 0.1, w_cell * 0.8, h_cell * 0.9);
        } else {
          ctx.beginPath();
          ctx.moveTo(tl.x, tl.y + (bl.y - tl.y) * 0.1);
          ctx.lineTo(tr.x, tr.y + (br.y - tr.y) * 0.1);
          ctx.lineTo(br.x, br.y);
          ctx.lineTo(bl.x, bl.y);
          ctx.closePath();
          ctx.stroke();
        }
      };

      const maxDepth = 6;

      // 奥から手前に向かって描画
      for (let d = maxDepth; d >= 0; d--) {
        const nearZ = d === 0 ? 0.05 : d;
        const farZ = d + 1;

        const light = Math.max(0, 1 - d / 6);
        const baseColor = (r: number, g: number, b: number, factor = 1) => 
          `rgb(${Math.floor(r * light * factor)}, ${Math.floor(g * light * factor)}, ${Math.floor(b * light * factor)})`;

        // 1. 正面壁
        for (let s = -1; s <= 1; s++) {
          const cell = getCellAt(d + 1, s);
          if (cell !== 0) {
            const isStairs = cell === 2;
            const r = isStairs ? 140 : 176, g = isStairs ? 130 : 162, b = isStairs ? 120 : 149;
            const xL = getX(farZ, s - 0.5);
            const xR = getX(farZ, s + 0.5);
            const yT = getY(farZ, true);
            const yB = getY(farZ, false);
            
            ctx.fillStyle = baseColor(r, g, b, 0.9);
            ctx.fillRect(xL - 1, yT - 1, (xR - xL) + 2, (yB - yT) + 2);

            if (isStairs) {
              drawStaircase([{x: xL, y: yT}, {x: xR, y: yT}, {x: xR, y: yB}, {x: xL, y: yB}], light, false);
            }
          }
        }

        // 2. 側面壁 (左)
        const leftCell = getCellAt(d, -1);
        if (leftCell !== 0) {
          const isStairs = leftCell === 2;
          const r = isStairs ? 140 : 176, g = isStairs ? 130 : 162, b = isStairs ? 120 : 149;
          const xN = getX(nearZ, -0.5);
          const xF = getX(farZ, -0.5);
          const yNT = getY(nearZ, true);
          const yNB = getY(nearZ, false);
          const yFT = getY(farZ, true);
          const yFB = getY(farZ, false);
          
          ctx.fillStyle = baseColor(r, g, b, 1.0);
          ctx.beginPath();
          ctx.moveTo(xN, yNT - 1); ctx.lineTo(xF, yFT - 1);
          ctx.lineTo(xF, yFB + 1); ctx.lineTo(xN, yNB + 1);
          ctx.fill();

          if (isStairs) {
            drawStaircase([{x: xN, y: yNT}, {x: xF, y: yFT}, {x: xF, y: yFB}, {x: xN, y: yNB}], light, true);
          }
        }

        // 3. 側面壁 (右)
        const rightCell = getCellAt(d, 1);
        if (rightCell !== 0) {
          const isStairs = rightCell === 2;
          const r = isStairs ? 140 : 176, g = isStairs ? 130 : 162, b = isStairs ? 120 : 149;
          const xN = getX(nearZ, 0.5);
          const xF = getX(farZ, 0.5);
          const yNT = getY(nearZ, true);
          const yNB = getY(nearZ, false);
          const yFT = getY(farZ, true);
          const yFB = getY(farZ, false);
          
          ctx.fillStyle = baseColor(r, g, b, 1.0);
          ctx.beginPath();
          ctx.moveTo(xN, yNT - 1); ctx.lineTo(xF, yFT - 1);
          ctx.lineTo(xF, yFB + 1); ctx.lineTo(xN, yNB + 1);
          ctx.fill();

          if (isStairs) {
            drawStaircase([{x: xN, y: yNT}, {x: xF, y: yFT}, {x: xF, y: yFB}, {x: xN, y: yNB}], light, true);
          }
        }
      }

      // ビネット
      const grad = ctx.createRadialGradient(w/2, h/2, w/4, w/2, h/2, w/1.1);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      drawMiniMap(ctx, w, floor, px, py, direction);
    };

    const drawMiniMap = (ctx: CanvasRenderingContext2D, w: number, floor: DungeonFloor, px: number, py: number, dir: number) => {
      const size = 64;
      const cellWidth = size / floor.width;
      const cellHeight = size / floor.height;
      const ox = w - size - 12;
      const oy = 12;
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(ox - 4, oy - 4, size + 8, size + 8);
      for (let ly = 0; ly < floor.height; ly++) {
        for (let lx = 0; lx < floor.width; lx++) {
          const cell = floor.grid[ly][lx];
          if (cell === 1) ctx.fillStyle = COLORS.primary;
          else if (cell === 2) ctx.fillStyle = COLORS.accent;
          else ctx.fillStyle = 'rgba(255,255,255,0.1)';
          ctx.fillRect(ox + lx * cellWidth, oy + ly * cellHeight, cellWidth - 0.5, cellHeight - 0.5);
        }
      }
      const cx = ox + px * cellWidth + cellWidth / 2;
      const cy = oy + py * cellHeight + cellHeight / 2;
      const r = Math.min(cellWidth, cellHeight) * 0.8;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      if (dir === 0) { ctx.moveTo(cx, cy - r); ctx.lineTo(cx - r/1.5, cy + r/2); ctx.lineTo(cx + r/1.5, cy + r/2); }
      else if (dir === 1) { ctx.moveTo(cx + r, cy); ctx.lineTo(cx - r/2, cy - r/1.5); ctx.lineTo(cx - r/2, cy + r/1.5); }
      else if (dir === 2) { ctx.moveTo(cx, cy + r); ctx.lineTo(cx - r/1.5, cy - r/2); ctx.lineTo(cx + r/1.5, cy - r/2); }
      else { ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r/2, cy - r/1.5); ctx.lineTo(cx + r/2, cy + r/1.5); }
      ctx.closePath();
      ctx.fill();
    };

    render();
  }, [player, floor]);

  return (
    <div className="w-full h-full relative bg-black overflow-hidden flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={300} 
        className="w-full h-full object-contain pixelated"
      />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.6)]" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
        <div className="flex gap-6 text-[10px] font-mono tracking-[0.3em] text-white/50 items-center">
          <span className={player.direction === 0 ? 'text-[#E98074] font-bold' : ''}>N</span>
          <span className={player.direction === 1 ? 'text-[#E98074] font-bold' : ''}>E</span>
          <span className={player.direction === 2 ? 'text-[#E98074] font-bold' : ''}>S</span>
          <span className={player.direction === 3 ? 'text-[#E98074] font-bold' : ''}>W</span>
        </div>
      </div>
    </div>
  );
};

export default DungeonRenderer;
