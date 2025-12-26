
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Player, DungeonFloor, JobType, Item, Enemy } from './types';
import { COLORS, INITIAL_ITEMS, SHOP_INVENTORY, JOB_DATA, DUNGEON_CONFIG, ENEMY_IMAGES, GUIDE_IMAGE } from './constants';
import { generateFloor } from './services/dungeonGenerator';
import { generateFloorDialogue, generateBattleIntro } from './services/geminiService';
import DungeonRenderer from './components/DungeonRenderer';
import VirtualPad from './components/VirtualPad';
import { ShoppingBag, Sword, Shield, Heart, Zap, User, ArrowRight } from 'lucide-react';

interface VisualEffect {
  id: number;
  type: 'hit' | 'slash' | 'shake';
  target: 'player' | 'enemy';
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.TOWN);
  const [player, setPlayer] = useState<Player>(() => ({
    name: '冒険者',
    job: JobType.WARRIOR,
    stats: { hp: 100, maxHp: 100, mp: 20, maxMp: 20, atk: 15, def: 10, level: 1, exp: 0 },
    inventory: [...INITIAL_ITEMS],
    gold: 100,
    floor: 1,
    x: 1,
    y: 1,
    direction: 0,
    equippedWeapon: INITIAL_ITEMS[1],
    equippedArmor: INITIAL_ITEMS[2]
  }));
  
  const [currentFloor, setCurrentFloor] = useState<DungeonFloor | null>(null);
  const [dialogue, setDialogue] = useState<{ speaker: string; message: string; portrait: string } | null>(null);
  const [battle, setBattle] = useState<{ enemy: Enemy; log: string[] } | null>(null);
  const [message, setMessage] = useState<string>('');
  const [activeVfx, setActiveVfx] = useState<VisualEffect[]>([]);
  const battleLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (battleLogRef.current) {
      battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  }, [battle?.log]);

  useEffect(() => {
    if (gameState === GameState.DUNGEON && currentFloor) {
      const { x, y } = player;
      const newExplored = [...currentFloor.explored.map(row => [...row])];
      let changed = false;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (ny >= 0 && ny < currentFloor.height && nx >= 0 && nx < currentFloor.width) {
            if (!newExplored[ny][nx]) {
              newExplored[ny][nx] = true;
              changed = true;
            }
          }
        }
      }

      if (changed) {
        setCurrentFloor({ ...currentFloor, explored: newExplored });
      }
    }
  }, [player.x, player.y, gameState, currentFloor]);

  const triggerVfx = (type: VisualEffect['type'], target: VisualEffect['target']) => {
    const id = Date.now();
    setActiveVfx(prev => [...prev, { id, type, target }]);
    setTimeout(() => {
      setActiveVfx(prev => prev.filter(v => v.id !== id));
    }, 500);
  };

  const backToTown = useCallback(() => {
    setCurrentFloor(null);
    setGameState(GameState.TOWN);
    setBattle(null);
    setPlayer(p => ({ ...p, floor: 1 }));
  }, []);

  const handleFloorEnter = async (floorNum: number, pName: string, pJob: JobType) => {
    setGameState(GameState.DIALOGUE);
    const talk = await generateFloorDialogue(floorNum, pName, pJob);
    setDialogue(talk);
  };

  const startDungeon = useCallback(() => {
    const floor = generateFloor(DUNGEON_CONFIG.FLOOR_WIDTH, DUNGEON_CONFIG.FLOOR_HEIGHT);
    setCurrentFloor(floor);
    setPlayer(prev => ({ ...prev, x: 1, y: 1, floor: 1, direction: 0 }));
    handleFloorEnter(1, player.name, player.job);
  }, [player.name, player.job]);

  const triggerBattle = async () => {
    const enemyNames = Object.keys(ENEMY_IMAGES);
    const name = enemyNames[Math.floor(Math.random() * enemyNames.length)];
    const intro = await generateBattleIntro(name);
    
    setBattle({
      enemy: {
        name,
        hp: 20 + player.floor * 10,
        maxHp: 20 + player.floor * 10,
        atk: 5 + player.floor * 3,
        def: 2 + player.floor * 2,
        exp: 10 * player.floor,
        gold: 15 * player.floor
      },
      log: [intro]
    });
    setGameState(GameState.BATTLE);
  };

  const movePlayer = (action: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (!currentFloor || (gameState !== GameState.DUNGEON)) return;

    setPlayer(prev => {
      let nx = prev.x;
      let ny = prev.y;
      let ndir = prev.direction;

      if (action === 'UP') {
        const dx = [0, 1, 0, -1][prev.direction];
        const dy = [-1, 0, 1, 0][prev.direction];
        nx += dx; ny += dy;
      } else if (action === 'DOWN') {
        const dx = [0, 1, 0, -1][(prev.direction + 2) % 4];
        const dy = [-1, 0, 1, 0][(prev.direction + 2) % 4];
        nx += dx; ny += dy;
      } else if (action === 'LEFT') {
        ndir = (prev.direction + 3) % 4;
        return { ...prev, direction: ndir };
      } else if (action === 'RIGHT') {
        ndir = (prev.direction + 1) % 4;
        return { ...prev, direction: ndir };
      }

      if (nx < 0 || ny < 0 || nx >= currentFloor.width || ny >= currentFloor.height || currentFloor.grid[ny][nx] === 1) {
        return prev;
      }

      if (currentFloor.grid[ny][nx] === 2) {
        if (prev.floor >= DUNGEON_CONFIG.MAX_FLOORS) {
          setMessage("おめでとう！ダンジョンを制覇した！");
          backToTown();
        } else {
          const nextFloorNum = prev.floor + 1;
          const nextFloor = generateFloor(DUNGEON_CONFIG.FLOOR_WIDTH, DUNGEON_CONFIG.FLOOR_HEIGHT);
          setCurrentFloor(nextFloor);
          handleFloorEnter(nextFloorNum, prev.name, prev.job);
          return { ...prev, x: 1, y: 1, floor: nextFloorNum, direction: 0 };
        }
      }

      if ((nx !== prev.x || ny !== prev.y) && Math.random() < 0.15) {
        triggerBattle();
      }

      return { ...prev, x: nx, y: ny, direction: ndir };
    });
  };

  const handleBattleTurn = (action: 'ATTACK' | 'ITEM' | 'RUN') => {
    if (!battle) return;

    if (action === 'ATTACK') {
      const pAtk = player.stats.atk + (player.equippedWeapon?.effectValue || 0);
      const damage = Math.max(1, pAtk - battle.enemy.def + Math.floor(Math.random() * 5));
      const newEnemyHp = Math.max(0, battle.enemy.hp - damage);
      const newLogs = [...battle.log, `${player.name}の攻撃！ ${battle.enemy.name}に${damage}のダメージ！`];
      
      triggerVfx('slash', 'enemy');
      triggerVfx('shake', 'enemy');

      if (newEnemyHp <= 0) {
        newLogs.push(`${battle.enemy.name}を倒した！`);
        newLogs.push(`${battle.enemy.exp}の経験値と${battle.enemy.gold}Gを手に入れた。`);
        
        let newStats = { ...player.stats, exp: player.stats.exp + battle.enemy.exp };
        if (newStats.exp >= newStats.level * 50) {
          newStats.level += 1;
          newStats.maxHp += 10;
          newStats.hp = newStats.maxHp;
          newStats.atk += 2;
          newStats.def += 1;
          newLogs.push(`レベルが上がった！ レベル${newStats.level}になった！`);
        }

        setTimeout(() => {
          setPlayer(p => ({ ...p, stats: newStats, gold: p.gold + battle.enemy.gold }));
          setGameState(GameState.DUNGEON);
          setBattle(null);
        }, 1500);
      } else {
        setTimeout(() => {
          const eAtk = battle.enemy.atk;
          const pDef = player.stats.def + (player.equippedArmor?.effectValue || 0);
          const eDamage = Math.max(1, eAtk - pDef + Math.floor(Math.random() * 3));
          const newPlayerHp = Math.max(0, player.stats.hp - eDamage);
          
          triggerVfx('hit', 'player');
          triggerVfx('shake', 'player');

          newLogs.push(`${battle.enemy.name}の攻撃！ ${player.name}は${eDamage}のダメージ！`);
          setPlayer(p => ({ ...p, stats: { ...p.stats, hp: newPlayerHp } }));

          if (newPlayerHp <= 0) {
            newLogs.push(`${player.name}は倒れてしまった...`);
            setTimeout(() => setGameState(GameState.GAMEOVER), 2000);
          }
          setBattle(prev => prev ? { ...prev, log: newLogs } : null);
        }, 600);
      }
      setBattle({ ...battle, enemy: { ...battle.enemy, hp: newEnemyHp }, log: newLogs });
    } else if (action === 'RUN') {
      if (Math.random() > 0.5) {
        setMessage("うまく逃げ出した！");
        setGameState(GameState.DUNGEON);
        setBattle(null);
      } else {
        const newLogs = [...battle.log, "逃げられなかった！"];
        const eAtk = battle.enemy.atk;
        const pDef = player.stats.def + (player.equippedArmor?.effectValue || 0);
        const eDamage = Math.max(1, eAtk - pDef);
        const newPlayerHp = Math.max(0, player.stats.hp - eDamage);
        
        triggerVfx('hit', 'player');
        triggerVfx('shake', 'player');

        newLogs.push(`${battle.enemy.name}の追撃！ ${player.name}は${eDamage}のダメージ！`);
        setPlayer(p => ({ ...p, stats: { ...p.stats, hp: newPlayerHp } }));
        setBattle({ ...battle, log: newLogs });
      }
    }
  };

  const buyItem = (item: Item) => {
    if (player.gold >= item.price) {
      setPlayer(p => ({
        ...p,
        gold: p.gold - item.price,
        inventory: [...p.inventory, { ...item }]
      }));
      setMessage(`${item.name}を購入した。`);
    } else {
      setMessage("お金が足りない。");
    }
  };

  const useItem = (item: Item) => {
    if (item.type === 'CONSUMABLE') {
      setPlayer(p => ({
        ...p,
        stats: { ...p.stats, hp: Math.min(p.stats.maxHp, p.stats.hp + item.effectValue) },
        inventory: p.inventory.filter((_, i) => p.inventory.indexOf(item) !== i)
      }));
      setMessage(`${item.name}を使用した。`);
    } else if (item.type === 'WEAPON') {
      setPlayer(p => ({ ...p, equippedWeapon: item }));
      setMessage(`${item.name}を装備した。`);
    } else if (item.type === 'ARMOR') {
      setPlayer(p => ({ ...p, equippedArmor: item }));
      setMessage(`${item.name}を装備した。`);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (gameState === GameState.DUNGEON) {
        if (key === 'ArrowUp' || key === 'w') movePlayer('UP');
        if (key === 'ArrowDown' || key === 's') movePlayer('DOWN');
        if (key === 'ArrowLeft' || key === 'a') movePlayer('LEFT');
        if (key === 'ArrowRight' || key === 'd') movePlayer('RIGHT');
        if (key === 'm' || key === 'Escape') setGameState(GameState.MENU);
      } else if (gameState === GameState.TOWN) {
        if (key === '1') startDungeon();
        if (key === '2') setGameState(GameState.MENU);
      } else if (gameState === GameState.DIALOGUE) {
        if (key === 'Enter' || key === ' ') setGameState(GameState.DUNGEON);
      } else if (gameState === GameState.BATTLE) {
        if (key === '1') handleBattleTurn('ATTACK');
        if (key === '2') setGameState(GameState.MENU);
        if (key === '3') handleBattleTurn('RUN');
      } else if (gameState === GameState.MENU) {
        if (key === 'Escape' || key === 'm' || key === 'c') {
          setGameState(battle ? GameState.BATTLE : (currentFloor ? GameState.DUNGEON : GameState.TOWN));
        }
      } else if (gameState === GameState.GAMEOVER) {
        if (key === 'Enter') {
          setPlayer(p => ({ ...p, gold: Math.floor(p.gold / 2), stats: { ...p.stats, hp: p.stats.maxHp } }));
          backToTown();
        }
      }
      if (message && key === 'Enter') setMessage('');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentFloor, player, battle, message]);

  const getEnemyImage = (name: string) => {
    return ENEMY_IMAGES[name] || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`;
  };

  return (
    <div className={`flex items-center justify-center min-h-screen bg-[#F5F5F5] p-2 text-[#4A4A48] select-none overflow-hidden ${activeVfx.some(v => v.type === 'shake' && v.target === 'player') ? 'animate-shake' : ''}`}>
      <div className="relative w-full max-w-lg aspect-[3/4] bg-[#EAE7DC] border-8 border-[#8E8D8A] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header Stats */}
        <div className="bg-[#8E8D8A] text-white p-3 flex justify-between items-center shadow-md z-10">
          <div className="flex items-center gap-2">
            <div className="bg-[#D8C3A5] p-1 rounded-md text-xs font-bold text-[#4A4A48] flex items-center gap-1">
              <User size={12} /> LV.{player.stats.level}
            </div>
            <span className="text-sm font-bold truncate max-w-[80px]">{player.name}</span>
          </div>
          <div className="flex gap-3 text-xs font-bold">
            <span className="flex items-center gap-1"><Heart size={14} className="text-[#E98074]" /> {player.stats.hp}/{player.stats.maxHp}</span>
            <span className="flex items-center gap-1"><Zap size={14} className="text-[#C5D0D3]" /> {player.stats.mp}/{player.stats.maxMp}</span>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden bg-black">
          {/* Main Visual Content */}
          {(gameState === GameState.DUNGEON || gameState === GameState.BATTLE || gameState === GameState.DIALOGUE) && currentFloor && (
            <div className="h-full relative">
              <DungeonRenderer player={player} floor={currentFloor} />
              
              {gameState === GameState.BATTLE && battle && (
                <div className="absolute inset-0 bg-black/60 flex flex-col p-4 space-y-4 animate-in fade-in duration-500">
                  <div className={`flex-1 flex flex-col items-center justify-center space-y-6 ${activeVfx.some(v => v.type === 'shake' && v.target === 'enemy') ? 'animate-shake' : ''}`}>
                    <div className="relative w-48 h-48 flex items-center justify-center">
                      <div className="w-full h-full flex items-center justify-center drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        <img 
                          src={getEnemyImage(battle.enemy.name)} 
                          className="max-w-full max-h-full pixelated object-contain relative z-0" 
                          alt="enemy"
                        />
                        {activeVfx.map(v => v.target === 'enemy' && (
                          <div key={v.id} className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                            {v.type === 'slash' && <div className="w-full h-1 bg-white/80 rotate-45 animate-slash shadow-[0_0_10px_white]" />}
                            {v.type === 'hit' && <div className="w-8 h-8 bg-yellow-400/80 rounded-full animate-hit-spark" />}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <div className="font-bold text-lg text-white drop-shadow-lg">{battle.enemy.name}</div>
                      <div className="w-32 h-3 bg-gray-900/50 rounded-full mt-2 border border-white/20 overflow-hidden mx-auto">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300" 
                          style={{ width: `${(battle.enemy.hp / battle.enemy.maxHp) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div ref={battleLogRef} className="bg-black/80 text-white p-3 rounded-xl h-32 flex-shrink-0 font-mono text-[11px] overflow-y-auto border-2 border-[#8E8D8A] custom-scrollbar scroll-smooth">
                    {battle.log.map((log, i) => <div key={i} className="mb-1 border-b border-white/5 pb-1 last:border-0">{log}</div>)}
                  </div>

                  <div className="grid grid-cols-3 gap-2 flex-shrink-0">
                    <button onClick={() => handleBattleTurn('ATTACK')} className="py-3 bg-[#E98074] text-white rounded-lg font-bold border-b-4 border-[#E85A4F] active:border-b-0 active:translate-y-1">
                      攻撃
                    </button>
                    <button onClick={() => setGameState(GameState.MENU)} className="py-3 bg-[#D8C3A5] rounded-lg font-bold border-b-4 border-[#8E8D8A] active:border-b-0 active:translate-y-1">
                      道具
                    </button>
                    <button onClick={() => handleBattleTurn('RUN')} className="py-3 bg-[#8E8D8A] text-white rounded-lg font-bold border-b-4 border-[#4A4A48] active:border-b-0 active:translate-y-1">
                      逃走
                    </button>
                  </div>
                </div>
              )}

              {gameState === GameState.DUNGEON && (
                <>
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <div className="bg-black/40 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20">地下 {player.floor} 階</div>
                  </div>
                  <VirtualPad onMove={movePlayer} onMenu={() => setGameState(GameState.MENU)} />
                </>
              )}
            </div>
          )}

          {gameState === GameState.DIALOGUE && dialogue && (
            <div className="h-full flex items-end justify-center p-4 bg-black/30 z-20 absolute inset-0">
              <div className="bg-[#F1FAEE]/95 backdrop-blur-md w-full p-5 rounded-2xl shadow-2xl border-4 border-[#8E8D8A] relative animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center gap-4 mb-3 border-b border-[#D8C3A5] pb-2">
                  <div className="w-16 h-16 bg-white rounded-lg border-2 border-[#E98074] overflow-hidden flex items-center justify-center p-1">
                    <img 
                      src={dialogue.portrait} 
                      className="max-w-full max-h-full object-contain pixelated" 
                      alt="portrait"
                    />
                  </div>
                  <h4 className="font-bold text-[#E98074] text-sm uppercase tracking-wider">{dialogue.speaker}</h4>
                </div>
                <p className="text-sm leading-relaxed mb-4 min-h-[3em]">{dialogue.message}</p>
                <button onClick={() => setGameState(GameState.DUNGEON)} className="w-full py-2 bg-[#E98074] text-white rounded-lg font-bold hover:brightness-90 active:scale-95 transition">
                  つぎへ
                </button>
              </div>
            </div>
          )}

          {gameState === GameState.TOWN && (
            <div className="h-full flex flex-col p-4 space-y-4 bg-[#EAE7DC]">
              <div className="text-center mb-2">
                <h1 className="text-2xl font-bold text-[#E98074]">冒険の町</h1>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={startDungeon} className="flex flex-col items-center justify-center p-4 bg-[#D8C3A5] rounded-xl hover:bg-[#8E8D8A] hover:text-white transition group border-b-4 border-[#8E8D8A] active:border-b-0 active:translate-y-1 relative">
                  <ArrowRight size={32} className="mb-2 group-hover:scale-110" />
                  <span className="font-bold">ダンジョンへ</span>
                </button>
                <button onClick={() => setGameState(GameState.MENU)} className="flex flex-col items-center justify-center p-4 bg-[#D8C3A5] rounded-xl hover:bg-[#8E8D8A] hover:text-white transition group border-b-4 border-[#8E8D8A] active:border-b-0 active:translate-y-1 relative">
                  <Sword size={32} className="mb-2 group-hover:scale-110" />
                  <span className="font-bold">もちもの</span>
                </button>
              </div>
              <div className="bg-white/50 rounded-xl p-4 flex-1 flex flex-col overflow-hidden">
                <h3 className="font-bold flex items-center gap-2 mb-2 border-b border-[#D1C7BD] pb-1"><ShoppingBag size={18} /> おみせ ({player.gold}G)</h3>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {SHOP_INVENTORY.map((item) => (
                    <button key={item.id} onClick={() => buyItem(item)} className="w-full text-left p-2 bg-[#F1FAEE] rounded border border-[#D1C7BD] flex justify-between items-center text-sm hover:brightness-95 transition relative pl-2">
                      <span>{item.name}</span>
                      <span className="text-orange-600 font-bold">{item.price}G</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {gameState === GameState.MENU && (
            <div className="h-full flex flex-col p-4 bg-[#F1FAEE] z-30 relative">
              <div className="flex justify-between items-center mb-4 border-b-2 border-[#D8C3A5] pb-2">
                <h2 className="text-xl font-bold flex items-center gap-2"><Sword size={20} /> MENU</h2>
                <button onClick={() => setGameState(battle ? GameState.BATTLE : (currentFloor ? GameState.DUNGEON : GameState.TOWN))} className="px-4 py-1 bg-[#8E8D8A] text-white rounded-lg text-sm font-bold active:scale-95 transition relative">
                  閉じる
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4 text-[11px]">
                <div className="p-2 bg-white rounded-lg border border-[#D8C3A5] shadow-sm">
                  <p className="opacity-60 font-bold">ATK</p>
                  <p className="text-lg font-bold text-[#E98074]">{player.stats.atk + (player.equippedWeapon?.effectValue || 0)}</p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-[#D8C3A5] shadow-sm">
                  <p className="opacity-60 font-bold">DEF</p>
                  <p className="text-lg font-bold text-[#D8C3A5]">{player.stats.def + (player.equippedArmor?.effectValue || 0)}</p>
                </div>
              </div>
              <h3 className="font-bold mb-2 flex items-center gap-2 text-sm"><ShoppingBag size={16} /> 持ち物 ({player.gold}G)</h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {player.inventory.map((item, i) => (
                  <div key={i} className="bg-white p-2 rounded-lg border flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-[10px] opacity-60">{item.description}</p>
                    </div>
                    <button onClick={() => useItem(item)} className="px-3 py-1 bg-[#D8C3A5] rounded-full text-[10px] font-bold">
                      {item.type === 'CONSUMABLE' ? '使う' : '装備'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gameState === GameState.GAMEOVER && (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#222] text-white z-50 absolute inset-0">
              <h2 className="text-4xl font-bold mb-4 tracking-tighter text-red-500">GAME OVER</h2>
              <p className="mb-8 opacity-60 text-sm">力尽きてしまった...</p>
              <button onClick={() => {
                  setPlayer(p => ({ ...p, gold: Math.floor(p.gold / 2), stats: { ...p.stats, hp: p.stats.maxHp } }));
                  backToTown();
                }}
                className="px-8 py-3 bg-red-600 text-white rounded-full font-bold transition"
              >
                町へ戻る
              </button>
            </div>
          )}
        </div>

        {message && (
          <div className="absolute inset-x-0 bottom-24 flex justify-center z-50 animate-in fade-in slide-in-from-bottom duration-300">
            <div className="bg-[#4A4A48]/90 text-white px-5 py-2 rounded-xl text-xs font-bold backdrop-blur-sm border border-white/20 flex items-center gap-4 shadow-xl">
              {message}
              <button className="bg-white/20 hover:bg-white/40 px-2 py-1 rounded text-[10px] transition" onClick={() => setMessage('')}>OK</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
