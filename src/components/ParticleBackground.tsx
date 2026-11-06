import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  colorIndex: number;
}

const COLORS = ['#00d4ff', '#a855f7', '#ec4899'];
const MAX_CONNECT_DIST = 115;
const MAX_CONNECT_DIST_SQ = MAX_CONNECT_DIST * MAX_CONNECT_DIST;

/**
 * Pre-renders a small glowing particle sprite once per color so we never call
 * expensive `ctx.shadowBlur` inside the animation loop.
 */
function createGlowSprite(color: string): HTMLCanvasElement {
  const sprite = document.createElement('canvas');
  const radius = 12;
  sprite.width = radius * 2;
  sprite.height = radius * 2;
  const sCtx = sprite.getContext('2d');
  if (sCtx) {
    const grad = sCtx.createRadialGradient(radius, radius, 0, radius, radius, radius);
    grad.addColorStop(0, color);
    grad.addColorStop(0.28, color);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, sprite.width, sprite.height);
  }
  return sprite;
}

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    let animationId = 0;
    let resizeTimer: number | undefined;
    let particles: Particle[] = [];
    let lastFrameTime = 0;
    // ~40 FPS is visually seamless for slow-drifting particles while cutting backdrop-blur repaints drastically
    const frameInterval = 1000 / 40;

    const sprites = COLORS.map(createGlowSprite);

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const isMobile = window.innerWidth <= 768;
      const divisor = isMobile ? 42000 : 28000;
      const maxParticles = isMobile ? 22 : 52;

      const count = Math.min(
        Math.floor((canvas.width * canvas.height) / divisor),
        maxParticles
      );

      particles = new Array(count);
      for (let i = 0; i < count; i++) {
        particles[i] = {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.8 + 0.8,
          speedX: (Math.random() - 0.5) * 0.45,
          speedY: (Math.random() - 0.5) * 0.45,
          opacity: Math.random() * 0.45 + 0.25,
          colorIndex: Math.floor(Math.random() * COLORS.length),
        };
      }
    };

    const drawParticles = (timestamp: number) => {
      animationId = requestAnimationFrame(drawParticles);

      if (document.hidden) return;
      if (timestamp - lastFrameTime < frameInterval) return;
      lastFrameTime = timestamp;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const len = particles.length;
      ctx.lineWidth = 0.5;

      for (let i = 0; i < len; i++) {
        const p = particles[i];

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        // Draw pre-rendered glow sprite (zero shadowBlur overhead)
        const drawRadius = p.size * 4.5;
        ctx.globalAlpha = p.opacity;
        ctx.drawImage(
          sprites[p.colorIndex],
          p.x - drawRadius,
          p.y - drawRadius,
          drawRadius * 2,
          drawRadius * 2
        );

        // Draw nearby connections without array allocations
        for (let j = i + 1; j < len; j++) {
          const other = particles[j];
          const dx = p.x - other.x;
          const dy = p.y - other.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < MAX_CONNECT_DIST_SQ) {
            const dist = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = COLORS[p.colorIndex];
            ctx.globalAlpha = (1 - dist / MAX_CONNECT_DIST) * 0.14;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
    };

    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resizeCanvas();
        createParticles();
      }, 150);
    };

    resizeCanvas();
    createParticles();
    animationId = requestAnimationFrame(drawParticles);

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(animationId);
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default ParticleBackground;
