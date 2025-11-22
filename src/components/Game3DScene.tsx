import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Box, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

export interface Enemy {
  id: string;
  position: [number, number, number];
  health: number;
  maxHealth: number;
  alive: boolean;
}

export interface Resource {
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

export function Scene({ 
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
