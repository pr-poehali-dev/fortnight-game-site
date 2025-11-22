import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface PlayerStats {
  health: number;
  shield: number;
  kills: number;
  materials: { wood: number; stone: number; metal: number };
}

interface WeaponSlot {
  id: string;
  name: string;
  type: 'assault' | 'sniper' | 'shotgun' | 'smg' | 'heal';
  ammo?: number;
  maxAmmo?: number;
  damage: number;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Enemy {
  id: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  alive: boolean;
}

interface Player {
  x: number;
  y: number;
}

interface Resource {
  id: string;
  x: number;
  y: number;
  type: 'wood' | 'stone' | 'metal';
  collected: boolean;
}

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [player, setPlayer] = useState<Player>({ x: 50, y: 50 });
  
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    health: 100,
    shield: 75,
    kills: 0,
    materials: { wood: 0, stone: 0, metal: 0 }
  });

  const [inventory, setInventory] = useState<WeaponSlot[]>([
    { id: '1', name: 'Assault Rifle', type: 'assault', ammo: 30, maxAmmo: 30, damage: 35, icon: 'Crosshair', rarity: 'epic' },
    { id: '2', name: 'Pump Shotgun', type: 'shotgun', ammo: 8, maxAmmo: 8, damage: 90, icon: 'Target', rarity: 'legendary' },
    { id: '3', name: 'Med Kit', type: 'heal', damage: 0, icon: 'Heart', rarity: 'rare' },
  ]);

  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [playersLeft, setPlayersLeft] = useState<number>(47);
  const [stormTimer, setStormTimer] = useState<number>(180);
  const [shooting, setShooting] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameStarted) {
      const initialEnemies: Enemy[] = Array.from({ length: 5 }, (_, i) => ({
        id: `enemy-${i}`,
        x: Math.random() * 90 + 5,
        y: Math.random() * 90 + 5,
        health: 100,
        maxHealth: 100,
        alive: true
      }));
      setEnemies(initialEnemies);

      const initialResources: Resource[] = [
        ...Array.from({ length: 8 }, (_, i) => ({
          id: `wood-${i}`,
          x: Math.random() * 90 + 5,
          y: Math.random() * 90 + 5,
          type: 'wood' as const,
          collected: false
        })),
        ...Array.from({ length: 6 }, (_, i) => ({
          id: `stone-${i}`,
          x: Math.random() * 90 + 5,
          y: Math.random() * 90 + 5,
          type: 'stone' as const,
          collected: false
        })),
        ...Array.from({ length: 4 }, (_, i) => ({
          id: `metal-${i}`,
          x: Math.random() * 90 + 5,
          y: Math.random() * 90 + 5,
          type: 'metal' as const,
          collected: false
        }))
      ];
      setResources(initialResources);
    }
  }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const speed = 2;
      setPlayer(prev => {
        let newX = prev.x;
        let newY = prev.y;

        if (e.key === 'w' || e.key === 'W' || e.key === 'ц' || e.key === 'Ц') newY = Math.max(5, prev.y - speed);
        if (e.key === 's' || e.key === 'S' || e.key === 'ы' || e.key === 'Ы') newY = Math.min(95, prev.y + speed);
        if (e.key === 'a' || e.key === 'A' || e.key === 'ф' || e.key === 'Ф') newX = Math.max(5, prev.x - speed);
        if (e.key === 'd' || e.key === 'D' || e.key === 'в' || e.key === 'В') newX = Math.min(95, prev.x + speed);

        if (e.key >= '1' && e.key <= '5') {
          const slot = parseInt(e.key) - 1;
          if (slot < inventory.length) setSelectedSlot(slot);
        }

        return { x: newX, y: newY };
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, inventory.length]);

  useEffect(() => {
    if (!gameStarted) return;

    resources.forEach(resource => {
      if (resource.collected) return;
      
      const distance = Math.sqrt(
        Math.pow(player.x - resource.x, 2) + Math.pow(player.y - resource.y, 2)
      );

      if (distance < 5) {
        collectResource(resource.id, resource.type);
      }
    });
  }, [player, resources, gameStarted]);

  useEffect(() => {
    if (!gameStarted) return;

    const timer = setInterval(() => {
      setStormTimer(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted]);

  const collectResource = (resourceId: string, type: 'wood' | 'stone' | 'metal') => {
    setResources(prev => 
      prev.map(r => r.id === resourceId ? { ...r, collected: true } : r)
    );
    
    setPlayerStats(prev => ({
      ...prev,
      materials: {
        ...prev.materials,
        [type]: prev.materials[type] + 50
      }
    }));
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameStarted || !gameAreaRef.current) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const currentWeapon = inventory[selectedSlot];
    if (!currentWeapon || currentWeapon.type === 'heal' || !currentWeapon.ammo || currentWeapon.ammo <= 0) return;

    setShooting(true);
    setTimeout(() => setShooting(false), 200);

    setInventory(prev => prev.map((item, idx) => 
      idx === selectedSlot && item.ammo ? { ...item, ammo: item.ammo - 1 } : item
    ));

    setEnemies(prev => prev.map(enemy => {
      if (!enemy.alive) return enemy;

      const distance = Math.sqrt(
        Math.pow(clickX - enemy.x, 2) + Math.pow(clickY - enemy.y, 2)
      );

      if (distance < 8) {
        const newHealth = enemy.health - currentWeapon.damage;
        
        if (newHealth <= 0) {
          setPlayerStats(prevStats => ({ ...prevStats, kills: prevStats.kills + 1 }));
          setPlayersLeft(prev => Math.max(1, prev - 1));
          return { ...enemy, health: 0, alive: false };
        }
        
        return { ...enemy, health: newHealth };
      }
      
      return enemy;
    }));
  };

  const useHealItem = () => {
    const healItem = inventory[selectedSlot];
    if (healItem?.type !== 'heal') return;

    setPlayerStats(prev => ({
      ...prev,
      health: Math.min(100, prev.health + 50)
    }));

    setInventory(prev => prev.filter((_, idx) => idx !== selectedSlot));
    setSelectedSlot(Math.max(0, selectedSlot - 1));
  };

  const reloadWeapon = () => {
    const weapon = inventory[selectedSlot];
    if (!weapon || weapon.type === 'heal' || !weapon.maxAmmo) return;

    setInventory(prev => prev.map((item, idx) => 
      idx === selectedSlot && item.maxAmmo ? { ...item, ammo: item.maxAmmo } : item
    ));
  };

  const startGame = () => {
    setGameStarted(true);
    setPlayerStats({
      health: 100,
      shield: 75,
      kills: 0,
      materials: { wood: 0, stone: 0, metal: 0 }
    });
    setPlayer({ x: 50, y: 50 });
    setPlayersLeft(47);
  };

  const rarityColors = {
    common: 'border-gray-400',
    rare: 'border-blue-500',
    epic: 'border-purple-500',
    legendary: 'border-yellow-500'
  };

  const rarityGlow = {
    common: 'shadow-[0_0_10px_rgba(156,163,175,0.5)]',
    rare: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]',
    epic: 'shadow-[0_0_10px_rgba(168,85,247,0.5)]',
    legendary: 'shadow-[0_0_10px_rgba(234,179,8,0.5)]'
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 scan-line pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        
        <div className="relative z-10 text-center space-y-8">
          <h1 className="text-7xl font-bold neon-text glitch mb-4">CYBER ROYALE</h1>
          <p className="text-2xl text-muted-foreground mb-8">Battle Royale в киберпанк мире</p>
          
          <Card className="bg-card/80 backdrop-blur border-primary/30 p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Управление</h2>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 px-3 py-2 rounded border border-primary/50 font-bold">W A S D</div>
                <span>Движение</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 px-3 py-2 rounded border border-primary/50 font-bold">ЛКМ</div>
                <span>Стрелять</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 px-3 py-2 rounded border border-primary/50 font-bold">1-5</div>
                <span>Выбор оружия</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 px-3 py-2 rounded border border-primary/50 font-bold">E</div>
                <span>Использовать</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 px-3 py-2 rounded border border-primary/50 font-bold">R</div>
                <span>Перезарядка</span>
              </div>
            </div>
          </Card>

          <Button 
            onClick={startGame}
            className="h-16 px-12 text-2xl font-bold neon-border bg-primary hover:bg-primary/80 transition-all"
          >
            <Icon name="Zap" size={32} className="mr-3" />
            НАЧАТЬ ИГРУ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      <div className="absolute inset-0 scan-line pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />

      <header className="relative z-10 border-b border-primary/30 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-4xl font-bold neon-text glitch">CYBER ROYALE</h1>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-lg neon-border">
              <Icon name="Users" size={20} className="text-primary" />
              <span className="font-semibold">{playersLeft} ALIVE</span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-destructive/20 rounded-lg border border-destructive/50">
              <Icon name="AlertTriangle" size={20} className="text-destructive" />
              <span className="font-semibold">{Math.floor(stormTimer / 60)}:{(stormTimer % 60).toString().padStart(2, '0')}</span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-lg border border-accent/50">
              <Icon name="Crosshair" size={20} className="text-accent" />
              <span className="font-semibold">{playerStats.kills} KILLS</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/80 backdrop-blur border-primary/30 overflow-hidden">
              <div 
                ref={gameAreaRef}
                onClick={handleMapClick}
                className="relative h-[500px] bg-gradient-to-br from-primary/20 to-secondary/20 cursor-crosshair"
              >
                <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} className="border border-primary/10" />
                  ))}
                </div>

                {resources.map(resource => !resource.collected && (
                  <div
                    key={resource.id}
                    className="absolute w-6 h-6 animate-pulse"
                    style={{ left: `${resource.x}%`, top: `${resource.y}%` }}
                  >
                    <Icon 
                      name={resource.type === 'wood' ? 'TreePine' : resource.type === 'stone' ? 'Mountain' : 'Anvil'} 
                      size={24} 
                      className={
                        resource.type === 'wood' ? 'text-amber-600' :
                        resource.type === 'stone' ? 'text-gray-500' : 'text-slate-400'
                      }
                    />
                  </div>
                ))}

                {enemies.map(enemy => enemy.alive && (
                  <div
                    key={enemy.id}
                    className="absolute"
                    style={{ left: `${enemy.x}%`, top: `${enemy.y}%` }}
                  >
                    <div className="relative">
                      <div className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center border-2 border-white">
                        <Icon name="User" size={16} />
                      </div>
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-16">
                        <Progress value={(enemy.health / enemy.maxHealth) * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}

                <div
                  className="absolute transition-all duration-100"
                  style={{ 
                    left: `${player.x}%`, 
                    top: `${player.y}%`,
                    transform: shooting ? 'scale(1.2)' : 'scale(1)'
                  }}
                >
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center border-4 border-white neon-border animate-pulse">
                    <Icon name="User" size={20} />
                  </div>
                </div>

                <div className="absolute top-4 left-4 bg-black/80 px-4 py-2 rounded border border-primary/50">
                  <p className="text-xs text-muted-foreground">BATTLEFIELD</p>
                  <p className="font-semibold">Клик - стрелять, WASD - движение</p>
                </div>
              </div>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-secondary/30 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Backpack" size={24} className="text-secondary" />
                INVENTORY
              </h2>
              
              <div className="grid grid-cols-5 gap-4">
                {inventory.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedSlot(idx)}
                    className={`relative aspect-square rounded-lg border-2 ${rarityColors[item.rarity]} ${rarityGlow[item.rarity]} 
                      bg-black/50 hover:bg-black/70 transition-all ${selectedSlot === idx ? 'ring-4 ring-white scale-105' : ''}`}
                  >
                    <div className="flex flex-col items-center justify-center h-full p-2">
                      <Icon name={item.icon} size={32} className="mb-2" />
                      {item.ammo !== undefined && (
                        <span className="text-xs font-bold">{item.ammo}/{item.maxAmmo}</span>
                      )}
                    </div>
                    <div className="absolute top-1 left-1 text-xs font-bold bg-black/70 px-1 rounded">
                      {idx + 1}
                    </div>
                  </button>
                ))}
                
                {Array.from({ length: 5 - inventory.length }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="aspect-square rounded-lg border-2 border-dashed border-muted/30 bg-black/30" />
                ))}
              </div>

              {inventory[selectedSlot] && (
                <div className="mt-6 p-4 bg-black/50 rounded-lg border border-primary/30">
                  <h3 className="font-bold text-lg mb-2">{inventory[selectedSlot].name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="capitalize">{inventory[selectedSlot].rarity}</span>
                    <span>•</span>
                    <span className="capitalize">{inventory[selectedSlot].type}</span>
                    {inventory[selectedSlot].damage > 0 && (
                      <>
                        <span>•</span>
                        <span>{inventory[selectedSlot].damage} урона</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {inventory[selectedSlot].type === 'heal' && (
                      <Button 
                        onClick={useHealItem}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Icon name="Heart" size={16} className="mr-2" />
                        Использовать (E)
                      </Button>
                    )}
                    
                    {inventory[selectedSlot].maxAmmo && (
                      <Button 
                        onClick={reloadWeapon}
                        className="flex-1 bg-primary hover:bg-primary/80"
                      >
                        <Icon name="RotateCw" size={16} className="mr-2" />
                        Перезарядить (R)
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-card/80 backdrop-blur border-accent/30 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="User" size={24} className="text-accent" />
                PLAYER STATUS
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm flex items-center gap-2">
                      <Icon name="Heart" size={16} className="text-red-500" />
                      Health
                    </span>
                    <span className="font-bold">{playerStats.health}</span>
                  </div>
                  <Progress value={playerStats.health} className="h-3" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm flex items-center gap-2">
                      <Icon name="Shield" size={16} className="text-primary" />
                      Shield
                    </span>
                    <span className="font-bold">{playerStats.shield}</span>
                  </div>
                  <Progress value={playerStats.shield} className="h-3" />
                </div>
              </div>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-primary/30 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Hammer" size={24} className="text-primary" />
                MATERIALS
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
                  <span className="flex items-center gap-2">
                    <Icon name="TreePine" size={18} className="text-amber-600" />
                    Wood
                  </span>
                  <span className="font-bold text-lg">{playerStats.materials.wood}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
                  <span className="flex items-center gap-2">
                    <Icon name="Mountain" size={18} className="text-gray-500" />
                    Stone
                  </span>
                  <span className="font-bold text-lg">{playerStats.materials.stone}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
                  <span className="flex items-center gap-2">
                    <Icon name="Anvil" size={18} className="text-slate-400" />
                    Metal
                  </span>
                  <span className="font-bold text-lg">{playerStats.materials.metal}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
