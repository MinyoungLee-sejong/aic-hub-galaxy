import { Line } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

type GalaxyBackgroundProps = {
  webglAvailable?: boolean;
};

type StarData = {
  positions: Float32Array;
  colors: Float32Array;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function createStarData(
  count: number,
  spreadX: number,
  spreadY: number,
  seed: number,
): StarData {
  const random = seededRandom(seed);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [new THREE.Color('#20b8b3'), new THREE.Color('#2f80ed'), new THREE.Color('#dfeeff')];

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    positions[offset] = (random() - 0.5) * spreadX;
    positions[offset + 1] = (random() - 0.5) * spreadY;
    positions[offset + 2] = -random() * 6;

    const color = palette[Math.floor(random() * palette.length)];
    const intensity = 0.58 + random() * 0.42;
    colors[offset] = color.r * intensity;
    colors[offset + 1] = color.g * intensity;
    colors[offset + 2] = color.b * intensity;
  }

  return { positions, colors };
}

export function canUseWebGL(): boolean {
  if (typeof window === 'undefined' || typeof window.WebGLRenderingContext === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function calculatePointerTargetX({
  originX,
  y,
  z,
  pointerX,
  pointerY,
}: {
  originX: number;
  y: number;
  z: number;
  pointerX: number;
  pointerY: number;
}): number {
  const radius = 1.65;
  const dx = originX - pointerX;
  const dy = y - pointerY;
  const distance = Math.sqrt(dx * dx + dy * dy) || 0.001;
  if (distance >= radius) return originX;

  const depthInfluence = 1 - Math.min(Math.abs(z) / 7, 0.82);
  const push = (radius - distance) * 0.78 * depthInfluence;
  return originX + (dx / distance) * push;
}

function StarsLayer({
  count,
  size,
  speed,
  seed,
  opacity,
  spreadX = 18,
  spreadY = 11,
}: {
  count: number;
  size: number;
  speed: number;
  seed: number;
  opacity: number;
  spreadX?: number;
  spreadY?: number;
}) {
  const points = useRef<THREE.Points>(null);
  const { base, positions, colors } = useMemo(() => {
    const data = createStarData(count, spreadX, spreadY, seed);
    return {
      base: data.positions,
      positions: new Float32Array(data.positions),
      colors: data.colors,
    };
  }, [count, seed, spreadX, spreadY]);

  useFrame(({ pointer }, delta) => {
    if (!points.current) return;
    const attribute = points.current.geometry.attributes.position as THREE.BufferAttribute;
    const pointerX = pointer.x * 8.5;
    const pointerY = pointer.y * 4.8;

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      const originX = base[offset];
      const z = base[offset + 2];
      let y = attribute.getY(index) - delta * speed;
      if (y < -spreadY / 2) y = spreadY / 2;

      const targetX = calculatePointerTargetX({ originX, y, z, pointerX, pointerY });
      const currentX = attribute.getX(index);

      attribute.setXYZ(index, THREE.MathUtils.lerp(currentX, targetX, Math.min(delta * 5, 1)), y, z);
    }

    attribute.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function NebulaClouds() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }) => {
    if (!group.current) return;
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.06) * 0.08;
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, pointer.x * 0.4, 0.018);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, pointer.y * 0.24, 0.018);
  });

  return (
    <group ref={group}>
      <mesh position={[4.8, 1.2, -5]} rotation={[0, 0, -0.3]}>
        <circleGeometry args={[4.1, 64]} />
        <meshBasicMaterial color="#2d5bda" transparent opacity={0.075} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[-4.2, -2.7, -4.5]} rotation={[0, 0, 0.4]}>
        <circleGeometry args={[3.5, 64]} />
        <meshBasicMaterial color="#20b8b3" transparent opacity={0.055} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[1.2, -3.6, -5.5]} scale={[2.4, 0.7, 1]}>
        <circleGeometry args={[2.8, 64]} />
        <meshBasicMaterial color="#2f80ed" transparent opacity={0.04} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function ShootingStar({ delay, y, z }: { delay: number; y: number; z: number }) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const cycle = (clock.elapsedTime + delay) % 11;
    const visible = cycle < 1.15;
    group.current.visible = visible;
    if (visible) {
      const progress = cycle / 1.15;
      group.current.position.x = 10 - progress * 18;
      group.current.position.y = y - progress * 4.2;
    }
  });

  return (
    <group ref={group} position={[10, y, z]} rotation={[0, 0, 0.22]} visible={false}>
      <Line
        points={[[0, 0, 0], [2.4, 0, 0]]}
        color="#72c9ff"
        lineWidth={1.1}
        transparent
        opacity={0.46}
      />
      <mesh>
        <sphereGeometry args={[0.025, 10, 10]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
    </group>
  );
}

function GalaxyScene() {
  return (
    <>
      <NebulaClouds />
      <StarsLayer count={420} size={0.025} speed={0.055} seed={101} opacity={0.42} />
      <StarsLayer count={260} size={0.045} speed={0.11} seed={202} opacity={0.62} spreadX={17} />
      <StarsLayer count={90} size={0.085} speed={0.19} seed={303} opacity={0.86} spreadX={16} />
      <ShootingStar delay={0} y={3.8} z={-1} />
      <ShootingStar delay={5.2} y={2.4} z={-3} />
      <EffectComposer multisampling={0}>
        <Bloom intensity={1.15} luminanceThreshold={0.15} luminanceSmoothing={0.8} mipmapBlur />
      </EffectComposer>
    </>
  );
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function GalaxyBackground({ webglAvailable }: GalaxyBackgroundProps) {
  const showCanvas = (webglAvailable ?? canUseWebGL()) && !prefersReducedMotion();

  return (
    <div className="galaxy-background" aria-hidden="true">
      <div className="galaxy-visuals" data-testid="galaxy-visuals">
        <div className="galaxy-fallback" data-testid="galaxy-fallback">
          <div className="nebula nebula-one" />
          <div className="nebula nebula-two" />
          <div className="css-stars" />
        </div>
        {showCanvas && (
          <Canvas
            data-testid="galaxy-canvas"
            className="galaxy-canvas"
            camera={{ position: [0, 0, 8], fov: 52, near: 0.1, far: 40 }}
            dpr={[1, 1.5]}
            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          >
            <GalaxyScene />
          </Canvas>
        )}
      </div>
    </div>
  );
}
