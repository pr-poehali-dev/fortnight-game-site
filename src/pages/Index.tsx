import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene, Enemy, Resource } from '@/components/Game3DScene';
import { GameHUD, PlayerStats, WeaponSlot } from '@/components/GameHUD';
import { StartScreen } from '@/components/StartScreen';

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 0, 0]);
  
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

  useEffect(() => {
    if (gameStarted) {
      const initialEnemies: Enemy[] = Array.from({ length: 8 }, (_, i) => ({
        id: `enemy-${i}`,
        position: [
          (Math.random() - 0.5) * 40,
          0,
          (Math.random() - 0.5) * 40
        ] as [number, number, number],
        health: 100,
        maxHealth: 100,
        alive: true
      }));
      setEnemies(initialEnemies);

      const initialResources: Resource[] = [
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `wood-${i}`,
          position: [(Math.random() - 0.5) * 50, 0.5, (Math.random() - 0.5) * 50] as [number, number, number],
          type: 'wood' as const,
          collected: false
        })),
        ...Array.from({ length: 8 }, (_, i) => ({
          id: `stone-${i}`,
          position: [(Math.random() - 0.5) * 50, 0.5, (Math.random() - 0.5) * 50] as [number, number, number],
          type: 'stone' as const,
          collected: false
        })),
        ...Array.from({ length: 6 }, (_, i) => ({
          id: `metal-${i}`,
          position: [(Math.random() - 0.5) * 50, 0.5, (Math.random() - 0.5) * 50] as [number, number, number],
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
      if (e.key >= '1' && e.key <= '5') {
        const slot = parseInt(e.key) - 1;
        if (slot < inventory.length) setSelectedSlot(slot);
      }
      
      if (e.key.toLowerCase() === 'r' || e.key === 'к') {
        reloadWeapon();
      }
      
      if (e.key.toLowerCase() === 'e' || e.key === 'у') {
        useHealItem();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, inventory, selectedSlot]);

  useEffect(() => {
    if (!gameStarted) return;

    resources.forEach(resource => {
      if (resource.collected) return;
      
      const distance = Math.sqrt(
        Math.pow(playerPosition[0] - resource.position[0], 2) +
        Math.pow(playerPosition[2] - resource.position[2], 2)
      );

      if (distance < 3) {
        collectResource(resource.id, resource.type);
      }
    });
  }, [playerPosition, resources, gameStarted]);

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

  const handleEnemyClick = (enemyId: string) => {
    const currentWeapon = inventory[selectedSlot];
    if (!currentWeapon || currentWeapon.type === 'heal' || !currentWeapon.ammo || currentWeapon.ammo <= 0) return;

    setInventory(prev => prev.map((item, idx) => 
      idx === selectedSlot && item.ammo ? { ...item, ammo: item.ammo - 1 } : item
    ));

    setEnemies(prev => prev.map(enemy => {
      if (enemy.id !== enemyId || !enemy.alive) return enemy;

      const newHealth = enemy.health - currentWeapon.damage;
      
      if (newHealth <= 0) {
        setPlayerStats(prevStats => ({ ...prevStats, kills: prevStats.kills + 1 }));
        setPlayersLeft(prev => Math.max(1, prev - 1));
        return { ...enemy, health: 0, alive: false };
      }
      
      return { ...enemy, health: newHealth };
    }));
  };

  const handleResourceCollect = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    if (resource && !resource.collected) {
      collectResource(resourceId, resource.type);
    }
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
    setPlayerPosition([0, 0, 0]);
    setPlayersLeft(47);
  };

  if (!gameStarted) {
    return <StartScreen onStartGame={startGame} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      <div className="absolute inset-0 scan-line pointer-events-none" />

      <GameHUD 
        playerStats={playerStats}
        inventory={inventory}
        selectedSlot={selectedSlot}
        playersLeft={playersLeft}
        stormTimer={stormTimer}
        onSlotSelect={setSelectedSlot}
      />

      <div className="absolute inset-0">
        <Canvas shadows>
          <Scene 
            playerPosition={playerPosition}
            enemies={enemies}
            resources={resources}
            onPlayerMove={setPlayerPosition}
            onEnemyClick={handleEnemyClick}
            onResourceCollect={handleResourceCollect}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default Index;
