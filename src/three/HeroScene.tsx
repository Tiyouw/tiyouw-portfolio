import { useMemo, useRef } from 'react';
import { Canvas, useFrame, type ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { useMotionPref } from '../hooks/useMotionPref';

const VERT = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform float uAmp;
varying vec3 vNormalW;
varying vec3 vPosW;
varying float vDisp;

// classic simplex-ish value noise (cheap, deterministic)
vec3 hash3(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
           dot(p, vec3(269.5, 183.3, 246.1)),
           dot(p, vec3(113.5, 271.9, 124.6)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(dot(hash3(i + vec3(0,0,0)), f - vec3(0,0,0)),
                     dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
                 mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)),
                     dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
             mix(mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)),
                     dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
                 mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)),
                     dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y), u.z);
}

void main() {
  vec3 p = position;
  float n = noise(normalize(p) * 1.9 + vec3(0.0, uTime * 0.16, uScroll * 2.2));
  float ridge = noise(normalize(p) * 4.5 - vec3(uTime * 0.08, 0.0, 0.0)) * 0.35;
  float disp = (n + ridge) * uAmp;
  p += normal * disp;
  vDisp = disp;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(p, 1.0);
  vPosW = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uScroll;
varying vec3 vNormalW;
varying vec3 vPosW;
varying float vDisp;

void main() {
  vec3 viewDir = normalize(cameraPosition - vPosW);
  float fres = pow(1.0 - clamp(dot(viewDir, normalize(vNormalW)), 0.0, 1.0), 2.4);
  vec3 key = normalize(vec3(0.7, 0.9, 0.6));
  float lambert = clamp(dot(normalize(vNormalW), key), 0.0, 1.0);

  // three discipline hues rotate with scroll: code / design / video
  float phase = fract(uScroll * 1.35);
  vec3 base = mix(uColorA, uColorB, smoothstep(0.0, 0.5, phase));
  base = mix(base, uColorC, smoothstep(0.5, 1.0, phase));

  vec3 col = base * (0.22 + lambert * 0.72);
  col += fres * base * 1.85;
  col += smoothstep(0.05, 0.32, vDisp) * 0.32;
  gl_FragColor = vec4(col, 1.0);
}
`;

function Crystal({ reduced }: { reduced: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const progress = useScrollProgress();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uAmp: { value: 0.34 },
      uColorA: { value: new THREE.Color('#7170ff') },
      uColorB: { value: new THREE.Color('#f5b64a') },
      uColorC: { value: new THREE.Color('#2fd6a4') },
    }),
    [],
  );

  useFrame((state, delta) => {
    const p = progress.current;
    uniforms.uScroll.value += (p - uniforms.uScroll.value) * Math.min(1, delta * 4);
    if (!reduced) uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uAmp.value = 0.3 + Math.sin(p * Math.PI) * 0.18;
    if (mesh.current) {
      const target = p * Math.PI * 1.4;
      mesh.current.rotation.y += (target - mesh.current.rotation.y) * Math.min(1, delta * 2.2);
      mesh.current.rotation.x = 0.22 + Math.sin(p * Math.PI * 2) * 0.16;
      const scale = 1 - p * 0.18;
      mesh.current.scale.setScalar(scale);
      mesh.current.position.y = -p * 0.55;
    }
  });

  const args: ThreeElements['icosahedronGeometry']['args'] = [1.35, 48];

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={args} />
      <shaderMaterial vertexShader={VERT} fragmentShader={FRAG} uniforms={uniforms} />
    </mesh>
  );
}

function Dust({ count = 900, reduced }: { count?: number; reduced: boolean }) {
  const points = useRef<THREE.Points>(null);
  const progress = useScrollProgress();

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const r = 2.4 + Math.random() * 3.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi) * 0.6;
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (!points.current) return;
    if (!reduced) points.current.rotation.y += delta * 0.045;
    points.current.rotation.z = progress.current * 0.6;
    const mat = points.current.material as THREE.PointsMaterial;
    mat.opacity = 0.14 + Math.sin(state.clock.elapsedTime * 0.4) * 0.04 + progress.current * 0.1;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.021} color="#d0d6e0" transparent opacity={0.18} sizeAttenuation depthWrite={false} />
    </points>
  );
}

export default function HeroScene() {
  const reduced = useMotionPref();
  return (
    <Canvas
      className="hero-canvas"
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 4.2], fov: 42 }}
    >
      <color attach="background" args={['#08090a']} />
      <ambientLight intensity={0.4} />
      <Crystal reduced={reduced} />
      <Dust reduced={reduced} />
    </Canvas>
  );
}
