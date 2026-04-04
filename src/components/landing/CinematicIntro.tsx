import { useState, useEffect, useCallback, useRef, useMemo, Component, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { introVertexShader, introFragmentShader } from './shaders/intro-shaders';

/* ─── WebGL Detection ─── */
function isWebGLAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

/* ─── Error Boundary ─── */
class WebGLErrorBoundary extends Component<
  { fallback: ReactNode; onError?: () => void; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() { this.props.onError?.(); }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

/* ─── Create text texture ─── */
function createTextTexture(text: string, fontSize = 36): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(window.devicePixelRatio, 2);

  ctx.font = `300 ${fontSize}px "Inter", "SF Pro Display", -apple-system, sans-serif`;
  const metrics = ctx.measureText(text);
  const w = Math.ceil(metrics.width + 60);
  const h = Math.ceil(fontSize * 2.5);

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, w, h);
  ctx.font = `300 ${fontSize}px "Inter", "SF Pro Display", -apple-system, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Letter spacing simulation
  const chars = text.split('');
  const spacing = fontSize * 0.3;
  const totalWidth = chars.reduce((acc, ch) => acc + ctx.measureText(ch).width + spacing, -spacing);
  let x = (w - totalWidth) / 2;
  chars.forEach(ch => {
    const cw = ctx.measureText(ch).width;
    ctx.fillText(ch, x + cw / 2, h / 2);
    x += cw + spacing;
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/* ─── Fullscreen Shader Quad ─── */
function IntroQuad({ phase }: { phase: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();

  const [logoTex, setLogoTex] = useState<THREE.Texture | null>(null);
  const textTex = useMemo(() => createTextTexture('WZRD STUDIO', 32), []);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load('/lovable-uploads/wzrdtechlogo.png', (tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      setLogoTex(tex);
    });
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPhase: { value: 0 },
    uLogo: { value: new THREE.Texture() },
    uText: { value: textTex },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
  }), [textTex, size.width, size.height]);

  useEffect(() => {
    if (logoTex) uniforms.uLogo.value = logoTex;
  }, [logoTex, uniforms]);

  useEffect(() => {
    uniforms.uResolution.value.set(size.width, size.height);
  }, [size, uniforms]);

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
    // Smooth phase tracking
    uniforms.uPhase.value += (phase - uniforms.uPhase.value) * 2.0 * delta;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        vertexShader={introVertexShader}
        fragmentShader={introFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/* ─── Enhanced Particles (300 count) ─── */
function IntroParticles({ phase }: { phase: number }) {
  const ref = useRef<THREE.Points>(null);
  const count = 300;

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      vel[i * 3] = (Math.random() - 0.5) * 0.008;
      vel[i * 3 + 1] = Math.random() * 0.006 + 0.002;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
    }
    return [pos, vel] as const;
  }, []);

  useFrame(() => {
    if (!ref.current || phase < 0.6) return;
    const arr = (ref.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    const speed = phase < 2.5 ? 1.5 : 0.8;
    for (let i = 0; i < count; i++) {
      arr[i * 3] += velocities[i * 3] * speed;
      arr[i * 3 + 1] += velocities[i * 3 + 1] * speed;
      arr[i * 3 + 2] += velocities[i * 3 + 2];
      if (arr[i * 3 + 1] > 4.5) {
        arr[i * 3 + 1] = -4.5;
        arr[i * 3] = (Math.random() - 0.5) * 10;
      }
    }
    (ref.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  const opacity = phase < 0.6 ? 0 : phase > 5 ? Math.max(0, 1 - (phase - 5)) : 0.45;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        color="#FF6B4A"
        size={0.02}
        transparent
        opacity={opacity}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* ─── Scene ─── */
function IntroScene({ phase }: { phase: number }) {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <IntroQuad phase={phase} />
      <IntroParticles phase={phase} />
    </>
  );
}

/* ─── Main Component ─── */
interface CinematicIntroProps {
  onComplete: () => void;
}

const CinematicIntro = ({ onComplete }: CinematicIntroProps) => {
  const [phase, setPhase] = useState(0);
  const [webglAvailable] = useState(() => isWebGLAvailable());
  const [done, setDone] = useState(false);

  // Continuous phase from 0→6 over 6 seconds
  useEffect(() => {
    if (!webglAvailable) { onComplete(); return; }
    const start = performance.now();
    let raf: number;
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      setPhase(Math.min(elapsed, 6));
      if (elapsed >= 6) {
        setDone(true);
        onComplete();
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete, webglAvailable]);

  // Safety timeout
  useEffect(() => {
    const t = setTimeout(() => {
      if (!done) { setDone(true); onComplete(); }
    }, 7000);
    return () => clearTimeout(t);
  }, [onComplete, done]);

  const handleSkip = useCallback(() => {
    setDone(true);
    onComplete();
  }, [onComplete]);

  const handleWebGLError = useCallback(() => {
    setDone(true);
    onComplete();
  }, [onComplete]);

  if (!webglAvailable || done) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[99999] cursor-pointer"
      onClick={handleSkip}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      role="presentation"
      aria-label="Cinematic intro animation. Click to skip."
    >
      <WebGLErrorBoundary fallback={null} onError={handleWebGLError}>
        <Canvas
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false }}
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ background: '#000000' }}
          fallback={<div className="w-full h-full bg-black" />}
        >
          <IntroScene phase={phase} />
        </Canvas>
      </WebGLErrorBoundary>

      <motion.p
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-white/20 tracking-widest uppercase pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        Click anywhere to skip
      </motion.p>
    </motion.div>
  );
};

export default CinematicIntro;
