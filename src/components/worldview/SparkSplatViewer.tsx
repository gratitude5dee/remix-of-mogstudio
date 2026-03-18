import { useEffect, useRef, useState } from 'react';
import { Loader2, Globe2, AlertCircle } from 'lucide-react';

/**
 * SparkSplatViewer — Renders a Gaussian splat (.spz/.ply/.splat) file
 * using SparkJS from @sparkjsdev/spark with THREE.js.
 *
 * Falls back to an iframe viewer or static image if SparkJS fails to load.
 */
export function SparkSplatViewer({
  splatUrl,
  viewerUrl,
  fallbackImageUrl,
  displayName,
  className = '',
}: {
  splatUrl?: string;
  viewerUrl?: string;
  fallbackImageUrl?: string;
  displayName?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sparkInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // If no splat URL, skip SparkJS
    if (!splatUrl) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function initSpark() {
      try {
        setLoading(true);
        setError(null);

        // Dynamic import to avoid SSR/build issues
        const sparkModule = await import('@sparkjsdev/spark');
        const THREE = await import('three');

        if (cancelled) return;

        const { SparkRenderer } = sparkModule;

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container!.clientWidth, container!.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container!.innerHTML = '';
        container!.appendChild(renderer.domElement);

        // Create scene & camera
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          60,
          container!.clientWidth / container!.clientHeight,
          0.1,
          1000,
        );
        camera.position.set(0, 1.6, 3);
        camera.lookAt(0, 0, 0);

        // Init SparkJS renderer
        const spark = new SparkRenderer({ renderer, camera });

        // Load splat
        await spark.load(splatUrl!);

        if (cancelled) {
          renderer.dispose();
          return;
        }

        sparkInstanceRef.current = spark;

        // Simple orbit controls via pointer
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;
        let theta = 0;
        let phi = Math.PI / 6;
        let radius = 3;

        const updateCameraFromOrbit = () => {
          camera.position.x = radius * Math.sin(theta) * Math.cos(phi);
          camera.position.y = radius * Math.sin(phi) + 1;
          camera.position.z = radius * Math.cos(theta) * Math.cos(phi);
          camera.lookAt(0, 0.5, 0);
        };

        const onPointerDown = (e: PointerEvent) => {
          isDragging = true;
          lastX = e.clientX;
          lastY = e.clientY;
        };

        const onPointerMove = (e: PointerEvent) => {
          if (!isDragging) return;
          const dx = e.clientX - lastX;
          const dy = e.clientY - lastY;
          theta += dx * 0.005;
          phi = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, phi + dy * 0.005));
          lastX = e.clientX;
          lastY = e.clientY;
          updateCameraFromOrbit();
        };

        const onPointerUp = () => {
          isDragging = false;
        };

        const onWheel = (e: WheelEvent) => {
          e.preventDefault();
          radius = Math.max(1, Math.min(10, radius + e.deltaY * 0.005));
          updateCameraFromOrbit();
        };

        const canvas = renderer.domElement;
        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('wheel', onWheel, { passive: false });

        // Resize handler
        const resizeObserver = new ResizeObserver(() => {
          if (!container) return;
          const w = container.clientWidth;
          const h = container.clientHeight;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        });
        resizeObserver.observe(container!);

        // Render loop
        let animId: number;
        const animate = () => {
          if (cancelled) return;
          animId = requestAnimationFrame(animate);
          spark.render(scene, camera);
          renderer.render(scene, camera);
        };
        animate();

        setLoading(false);

        // Cleanup
        return () => {
          cancelled = true;
          cancelAnimationFrame(animId);
          canvas.removeEventListener('pointerdown', onPointerDown);
          canvas.removeEventListener('pointermove', onPointerMove);
          canvas.removeEventListener('pointerup', onPointerUp);
          canvas.removeEventListener('wheel', onWheel);
          resizeObserver.disconnect();
          renderer.dispose();
          spark.dispose?.();
        };
      } catch (err) {
        if (!cancelled) {
          console.warn('SparkJS init failed, falling back:', err);
          setError((err as Error).message ?? 'Failed to load 3D viewer');
          setLoading(false);
        }
      }
    }

    const cleanup = initSpark();

    return () => {
      cancelled = true;
      cleanup?.then?.((fn) => fn?.());
    };
  }, [splatUrl]);

  // Fallback: use iframe viewer URL
  if (!splatUrl && viewerUrl) {
    return (
      <div className={`relative ${className}`}>
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
              <span className="text-sm text-zinc-300">Loading 3D world…</span>
            </div>
          </div>
        )}
        <iframe
          src={viewerUrl}
          title="World Viewer"
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope"
          onLoad={() => setLoading(false)}
          onError={() => {
            setError('Viewer failed to load');
            setLoading(false);
          }}
        />
      </div>
    );
  }

  // Fallback: static image
  if (!splatUrl && !viewerUrl) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        {fallbackImageUrl ? (
          <img
            src={fallbackImageUrl}
            alt={displayName ?? 'World'}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex items-center gap-2">
            <Globe2 className="h-10 w-10 text-zinc-700" />
            <span className="text-sm text-zinc-500">No viewer available</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
            <span className="text-sm text-zinc-300">Loading 3D world…</span>
          </div>
        </div>
      )}

      {/* Error state - fall back to iframe or image */}
      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/80">
          <AlertCircle className="h-6 w-6 text-amber-400" />
          <p className="text-sm text-zinc-400">SparkJS renderer unavailable</p>
          {viewerUrl ? (
            <a
              href={viewerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/30"
            >
              Open in Marble ↗
            </a>
          ) : fallbackImageUrl ? (
            <img
              src={fallbackImageUrl}
              alt={displayName ?? 'World'}
              className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30"
            />
          ) : null}
        </div>
      )}

      {/* SparkJS canvas container */}
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
