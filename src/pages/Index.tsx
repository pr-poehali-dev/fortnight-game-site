import { useState } from 'react';
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
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const Index = () => {
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    health: 100,
    shield: 75,
    kills: 3,
    materials: { wood: 150, stone: 200, metal: 100 }
  });

  const [inventory, setInventory] = useState<WeaponSlot[]>([
    { id: '1', name: 'Assault Rifle', type: 'assault', ammo: 30, icon: 'Crosshair', rarity: 'epic' },
    { id: '2', name: 'Pump Shotgun', type: 'shotgun', ammo: 8, icon: 'Target', rarity: 'legendary' },
    { id: '3', name: 'Med Kit', type: 'heal', icon: 'Heart', rarity: 'rare' },
  ]);

  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [playersLeft, setPlayersLeft] = useState<number>(47);
  const [stormTimer, setStormTimer] = useState<number>(180);

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

  const dropLocations = [
    { name: 'Cyber Tower', x: 30, y: 25, threat: 'high' },
    { name: 'Neon District', x: 60, y: 40, threat: 'medium' },
    { name: 'Tech Outpost', x: 45, y: 70, threat: 'low' },
    { name: 'Digital Plaza', x: 75, y: 55, threat: 'high' },
  ];

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
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/80 backdrop-blur border-primary/30 overflow-hidden">
              <div className="relative h-[500px] bg-gradient-to-br from-primary/20 to-secondary/20">
                <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} className="border border-primary/10" />
                  ))}
                </div>

                {dropLocations.map((loc, idx) => (
                  <button
                    key={idx}
                    className="absolute group"
                    style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                  >
                    <div className={`w-4 h-4 rounded-full animate-pulse ${
                      loc.threat === 'high' ? 'bg-destructive' :
                      loc.threat === 'medium' ? 'bg-accent' : 'bg-green-500'
                    }`} />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black/90 px-3 py-2 rounded border border-primary/50 whitespace-nowrap">
                        <p className="font-semibold text-sm">{loc.name}</p>
                        <p className="text-xs text-muted-foreground">Threat: {loc.threat}</p>
                      </div>
                    </div>
                  </button>
                ))}

                <div className="absolute top-4 left-4 bg-black/80 px-4 py-2 rounded border border-primary/50">
                  <p className="text-xs text-muted-foreground">DROP LOCATION</p>
                  <p className="font-semibold">Select Landing Zone</p>
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
                      {item.ammo && (
                        <span className="text-xs font-bold">{item.ammo}</span>
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
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="capitalize">{inventory[selectedSlot].rarity}</span>
                    <span>•</span>
                    <span className="capitalize">{inventory[selectedSlot].type}</span>
                    {inventory[selectedSlot].ammo && (
                      <>
                        <span>•</span>
                        <span>{inventory[selectedSlot].ammo} rounds</span>
                      </>
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

                <div className="pt-4 border-t border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Icon name="Crosshair" size={16} className="text-destructive" />
                      Eliminations
                    </span>
                    <span className="text-2xl font-bold text-destructive">{playerStats.kills}</span>
                  </div>
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

            <Button className="w-full h-14 text-lg font-bold neon-border bg-primary hover:bg-primary/80 transition-all">
              <Icon name="Zap" size={24} className="mr-2" />
              DEPLOY TO BATTLEFIELD
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;