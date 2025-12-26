
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

      // 背景 (天井と床)
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

      /**
       * 下へ続く階段の描画 (参考画像を反映)
       * 通路の幅いっぱいの段差が奥の闇へ消えていく
       */
      const drawDeepStairway = (df: number, sf: number, light: number) => {
        const farZ = df + 1;
        const xLNear = getX(df, sf - 0.5);
        const xRNear = getX(df, sf + 0.5);
        const xLFar = getX(farZ, sf - 0.5);
        const xRFar = getX(farZ, sf + 0.5);
        
        const yFloorNear = getY(df, false);
        const yFloorFar = getY(farZ, false);
        const yCeilFar = getY(farZ, true);

        // 1. 階段のトンネル (奥に向かって暗くなる)
        const grad = ctx.createLinearGradient(0, yFloorNear, 0, yFloorFar);
        grad.addColorStop(0, `rgba(50, 45, 42, ${light})`);
        grad.addColorStop(1, `rgba(0, 0, 0, ${light})`);
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(xLNear, yFloorNear);
        ctx.lineTo(xRNear, yFloorNear);
        ctx.lineTo(xRFar, yFloorFar);
        ctx.lineTo(xLFar, yFloorFar);
        ctx.fill();

        // 2. 奥の闇 (トンネルの出口)
        ctx.fillStyle = `rgba(0, 0, 0, ${light})`;
        ctx.fillRect(xLFar, yCeilFar, xRFar - xLFar, yFloorFar - yCeilFar);

        // 3. 段差の描画
        const numSteps = 12;
        for (let i = 0; i < numSteps; i++) {
          const ratio = i / numSteps;
          const nextRatio = (i + 1) / numSteps;
          
          // ステップの座標計算
          const stepY1 = yFloorNear + (yFloorFar - yFloorNear) * ratio;
          const stepY2 = yFloorNear + (yFloorFar - yFloorNear) * nextRatio;
          const stepW1 = (xRNear - xLNear) * (1 - ratio * 0.4);
          const stepW2 = (xRNear - xLNear) * (1 - nextRatio * 0.4);
          const stepX1 = (xLNear + xRNear) / 2 - stepW1 / 2;
          const stepX2 = (xLNear + xRNear) / 2 - stepW2 / 2;

          // 踏み面のグラデーション (石の質感)
          const stepLight = light * (1 - ratio * 0.9);
          ctx.fillStyle = `rgb(${Math.floor(100 * stepLight)}, ${Math.floor(95 * stepLight)}, ${Math.floor(90 * stepLight)})`;
          
          ctx.beginPath();
          ctx.moveTo(stepX1, stepY1);
          ctx.lineTo(stepX1 + stepW1, stepY1);
          ctx.lineTo(stepX2 + stepW2, stepY2);
          ctx.lineTo(stepX2, stepY2);
          ctx.fill();

          // 段差の輪郭とエッジのハイライト
          ctx.strokeStyle = `rgba(255, 255, 255, ${stepLight * 0.15})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(stepX1, stepY1);
          ctx.lineTo(stepX1 + stepW1, stepY1);
          ctx.stroke();
          
          ctx.strokeStyle = `rgba(0, 0, 0, ${stepLight * 0.4})`;
          ctx.beginPath();
          ctx.moveTo(stepX2, stepY2);
          ctx.lineTo(stepX2 + stepW2, stepY2);
          ctx.stroke();
        }

        // 4. 側面の壁 (階段に合わせた影)
        ctx.fillStyle = `rgba(20, 18, 15, ${light * 0.6})`;
        // 左壁
        ctx.beginPath();
        ctx.moveTo(xLNear, getY(df, true));
        ctx.lineTo(xLFar, yCeilFar);
        ctx.lineTo(xLFar, yFloorFar);
        ctx.lineTo(xLNear, yFloorNear);
        ctx.fill();
        // 右壁
        ctx.beginPath();
        ctx.moveTo(xRNear, getY(df, true));
        ctx.lineTo(xRFar, yCeilFar);
        ctx.lineTo(xRFar, yFloorFar);
        ctx.lineTo(xRNear, yFloorNear);
        ctx.fill();
      };

      const maxDepth = 6;
      for (let d = maxDepth; d >= 0; d--) {
        const nearZ = d === 0 ? 0.05 : d;
        const farZ = d + 1;
        const light = Math.max(0, 1 - d / 6);
        const baseColor = (r: number, g: number, b: number, factor = 1) => 
          `rgb(${Math.floor(r * light * factor)}, ${Math.floor(g * light * factor)}, ${Math.floor(b * light * factor)})`;

        // セルに階段がある場合、そのセルの場所に階段を描く
        if (getCellAt(d, 0) === 2) {
          drawDeepStairway(d, 0, light);
        }

        // 正面壁の描画
        for (let s = -1; s <= 1; s++) {
          const cell = getCellAt(d + 1, s);
          // 階段の正面には壁を描かない (通路として開放)
          if (cell === 1) {
            const xL = getX(farZ, s - 0.5);
            const xR = getX(farZ, s + 0.5);
            const yT = getY(farZ, true);
            const yB = getY(farZ, false);
            ctx.fillStyle = baseColor(160, 150, 140, 0.9); // 石の壁っぽいくすみカラー
            ctx.fillRect(xL - 1, yT - 1, (xR - xL) + 2, (yB - yT) + 2);
            
            // 壁のディテール (薄い横線)
            ctx.strokeStyle = baseColor(120, 110, 100, 0.5);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(xL, yT + (yB - yT) * 0.3); ctx.lineTo(xR, yT + (yB - yT) * 0.3);
            ctx.moveTo(xL, yT + (yB - yT) * 0.7); ctx.lineTo(xR, yT + (yB - yT) * 0.7);
            ctx.stroke();
          }
        }

        // 側面(左)
        if (getCellAt(d, -1) === 1) {
          const xN = getX(nearZ, -0.5); const xF = getX(farZ, -0.5);
          const yNT = getY(nearZ, true); const yNB = getY(nearZ, false);
          const yFT = getY(farZ, true); const yFB = getY(farZ, false);
          ctx.fillStyle = baseColor(160, 150, 140, 1.0);
          ctx.beginPath(); ctx.moveTo(xN, yNT - 1); ctx.lineTo(xF, yFT - 1); ctx.lineTo(xF, yFB + 1); ctx.lineTo(xN, yNB + 1); ctx.fill();
        }

        // 側面(右)
        if (getCellAt(d, 1) === 1) {
          const xN = getX(nearZ, 0.5); const xF = getX(farZ, 0.5);
          const yNT = getY(nearZ, true); const yNB = getY(nearZ, false);
          const yFT = getY(farZ, true); const yFB = getY(farZ, false);
          ctx.fillStyle = baseColor(160, 150, 140, 1.0);
          ctx.beginPath(); ctx.moveTo(xN, yNT - 1); ctx.lineTo(xF, yFT - 1); ctx.lineTo(xF, yFB + 1); ctx.lineTo(xN, yNB + 1); ctx.fill();
        }
      }

      // ビネット (周辺を暗く)
      const gradVignette = ctx.createRadialGradient(w/2, h/2, w/4, w/2, h/2, w/1.1);
      gradVignette.addColorStop(0, 'rgba(0,0,0,0)');
      gradVignette.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = gradVignette;
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
          // Check explored status
          if (!floor.explored[ly][lx]) {
            ctx.fillStyle = 'rgba(0,0,0,0.4)'; // Still hidden
            ctx.fillRect(ox + lx * cellWidth, oy + ly * cellHeight, cellWidth - 0.5, cellHeight - 0.5);
            continue;
          }

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
      <canvas ref={canvasRef} width={400} height={300} className="w-full h-full object-contain pixelated" />
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
