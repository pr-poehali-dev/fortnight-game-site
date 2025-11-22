import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export interface PlayerStats {
  health: number;
  shield: number;
  kills: number;
  materials: { wood: number; stone: number; metal: number };
}

export interface WeaponSlot {
  id: string;
  name: string;
  type: 'assault' | 'sniper' | 'shotgun' | 'smg' | 'heal';
  ammo?: number;
  maxAmmo?: number;
  damage: number;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface GameHUDProps {
  playerStats: PlayerStats;
  inventory: WeaponSlot[];
  selectedSlot: number;
  playersLeft: number;
  stormTimer: number;
  onSlotSelect: (slot: number) => void;
}

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

export function GameHUD({ 
  playerStats, 
  inventory, 
  selectedSlot, 
  playersLeft, 
  stormTimer,
  onSlotSelect 
}: GameHUDProps) {
  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-50 border-b border-primary/30 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold neon-text">CYBER ROYALE 3D</h1>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-lg neon-border">
              <Icon name="Users" size={20} className="text-primary" />
              <span className="font-semibold">{playersLeft}</span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-destructive/20 rounded-lg border border-destructive/50">
              <Icon name="AlertTriangle" size={20} className="text-destructive" />
              <span className="font-semibold">{Math.floor(stormTimer / 60)}:{(stormTimer % 60).toString().padStart(2, '0')}</span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-lg border border-accent/50">
              <Icon name="Crosshair" size={20} className="text-accent" />
              <span className="font-semibold">{playerStats.kills}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="absolute bottom-0 left-0 right-0 z-50 p-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-card/80 backdrop-blur border-accent/30 p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Icon name="Heart" size={16} className="text-red-500" />
                    HP
                  </span>
                  <span className="font-bold">{playerStats.health}</span>
                </div>
                <Progress value={playerStats.health} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Icon name="Shield" size={16} className="text-primary" />
                    Shield
                  </span>
                  <span className="font-bold">{playerStats.shield}</span>
                </div>
                <Progress value={playerStats.shield} className="h-2" />
              </div>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-secondary/30 p-4">
              <div className="flex justify-center gap-2">
                {inventory.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => onSlotSelect(idx)}
                    className={`relative w-16 h-16 rounded-lg border-2 ${rarityColors[item.rarity]} ${rarityGlow[item.rarity]} 
                      bg-black/50 hover:bg-black/70 transition-all ${selectedSlot === idx ? 'ring-2 ring-white scale-110' : ''}`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <Icon name={item.icon} size={24} />
                      {item.ammo !== undefined && (
                        <span className="text-xs font-bold">{item.ammo}</span>
                      )}
                    </div>
                    <div className="absolute -top-1 -left-1 text-xs font-bold bg-black/70 px-1 rounded">
                      {idx + 1}
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-primary/30 p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Icon name="TreePine" size={16} className="text-amber-600" />
                  <span className="font-bold">{playerStats.materials.wood}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Mountain" size={16} className="text-gray-500" />
                  <span className="font-bold">{playerStats.materials.stone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Anvil" size={16} className="text-slate-400" />
                  <span className="font-bold">{playerStats.materials.metal}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
