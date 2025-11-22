import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Box, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
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
  position: [number, number, number];
  health: number;
  maxHealth: number;
  alive: boolean;
}

interface Resource {
  id: string;
  position: [number, number, number];
  type: 'wood' | 'stone' | 'metal';
  collected: boolean;
}

function Player({ position, onMove }: { position: [number, number, number]; onMove: (pos: [number, number, number]) => void }) {
  const { camera } = useThree();
  const keysPressed = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    const speed = 0.3;
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)).normalize();

    const movement = new THREE.Vector3();

    if (keysPressed.current.has('w') || keysPressed.current.has('ц')) movement.add(cameraDirection);
    if (keysPressed.current.has('s') || keysPressed.current.has('ы')) movement.sub(cameraDirection);
    if (keysPressed.current.has('a') || keysPressed.current.has('ф')) movement.sub(right);
    if (keysPressed.current.has('d') || keysPressed.current.has('в')) movement.add(right);

    if (movement.length() > 0) {
      movement.normalize().multiplyScalar(speed);
      
      const newPos: [number, number, number] = [
        Math.max(-30, Math.min(30, position[0] + movement.x)),
        position[1],
        Math.max(-30, Math.min(30, position[2] + movement.z))
      ];
      
      onMove(newPos);
      camera.position.set(newPos[0], newPos[1] + 5, newPos[2] + 8);
    }
  });

  return (
    <group position={position}>
      <Sphere args={[1, 16, 16]}>
        <meshStandardMaterial color="#0EA5E9" emissive="#0EA5E9" emissiveIntensity={0.5} />
      </Sphere>
      <Cylinder args={[0.5, 0.5, 0.3, 16]} position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#F97316" />
      </Cylinder>
    </group>
  );
}

function Enemy3D({ enemy, onClick }: { enemy: Enemy; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
  });

  if (!enemy.alive) return null;

  return (
    <group position={enemy.position} onClick={onClick}>
      <Sphere ref={meshRef} args={[0.8, 16, 16]}>
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.3} />
      </Sphere>
      <Box args={[0.3, 1.5, 0.3]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#7C2D12" />
      </Box>
    </group>
  );
}

function ResourceNode({ resource, onCollect }: { resource: Resource; onCollect: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = resource.position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      meshRef.current.rotation.y += 0.01;
    }
  });

  if (resource.collected) return null;

  const colors = {
    wood: '#D97706',
    stone: '#6B7280',
    metal: '#94A3B8'
  };

  return (
    <Box 
      ref={meshRef}
      args={[1, 1, 1]} 
      position={resource.position}
      onClick={onCollect}
    >
      <meshStandardMaterial 
        color={colors[resource.type]} 
        metalness={resource.type === 'metal' ? 0.8 : 0.2}
        roughness={resource.type === 'metal' ? 0.2 : 0.8}
      />
    </Box>
  );
}

function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[80, 80, 20, 20]} />
        <meshStandardMaterial 
          color="#1a1f2e"
          wireframe={false}
        />
      </mesh>
      
      <gridHelper args={[80, 40, '#0EA5E9', '#0EA5E9']} position={[0, -0.4, 0]} />
      
      {Array.from({ length: 30 }).map((_, i) => (
        <Box 
          key={i}
          args={[2, Math.random() * 10 + 5, 2]} 
          position={[
            (Math.random() - 0.5) * 60,
            Math.random() * 5,
            (Math.random() - 0.5) * 60
          ]}
        >
          <meshStandardMaterial 
            color="#1e293b" 
            emissive="#0EA5E9"
            emissiveIntensity={0.1}
          />
        </Box>
      ))}
    </group>
  );
}

function Scene({ 
  playerPosition, 
  enemies, 
  resources,
  onPlayerMove,
  onEnemyClick,
  onResourceCollect 
}: { 
  playerPosition: [number, number, number];
  enemies: Enemy[];
  resources: Resource[];
  onPlayerMove: (pos: [number, number, number]) => void;
  onEnemyClick: (id: string) => void;
  onResourceCollect: (id: string) => void;
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 10, 15]} fov={75} />
      <OrbitControls 
        enablePan={false}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={20}
      />

      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#0EA5E9" />
      <pointLight position={[20, 5, 20]} intensity={0.3} color="#D946EF" />
      <pointLight position={[-20, 5, -20]} intensity={0.3} color="#F97316" />

      <fog attach="fog" args={['#0a0a0f', 30, 80]} />

      <Ground />
      
      <Player position={playerPosition} onMove={onPlayerMove} />
      
      {enemies.map(enemy => (
        <Enemy3D 
          key={enemy.id} 
          enemy={enemy}
          onClick={() => onEnemyClick(enemy.id)}
        />
      ))}

      {resources.map(resource => (
        <ResourceNode
          key={resource.id}
          resource={resource}
          onCollect={() => onResourceCollect(resource.id)}
        />
      ))}
    </>
  );
}

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
          <h1 className="text-7xl font-bold neon-text glitch mb-4">CYBER ROYALE 3D</h1>
          <p className="text-2xl text-muted-foreground mb-8">3D Battle Royale в киберпанк мире</p>
          
          <Card className="bg-card/80 backdrop-blur border-primary/30 p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Управление</h2>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 px-3 py-2 rounded border border-primary/50 font-bold">W A S D</div>
                <span>Движение 3D</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 px-3 py-2 rounded border border-primary/50 font-bold">Мышь</div>
                <span>Камера + атака</span>
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
                    onClick={() => setSelectedSlot(idx)}
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
    </div>
  );
};

export default Index;
