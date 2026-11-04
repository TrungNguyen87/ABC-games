import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'rect' | 'circle' | 'star';
  rotation: number;
  rotSpeed: number;
  alpha: number;
  gravity: number;
}

export function fireConfettiBurst(originX?: number, originY?: number) {
  window.dispatchEvent(
    new CustomEvent('fire-confetti-burst', {
      detail: { x: originX, y: originY },
    })
  );
}

export default function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = [
      '#EF4444', // Red
      '#F59E0B', // Yellow
      '#10B981', // Green
      '#3B82F6', // Blue
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#F97316', // Orange
    ];

    const spawnBurst = (e?: any) => {
      const centerX = e?.detail?.x ?? canvas.width / 2;
      const centerY = e?.detail?.y ?? canvas.height / 2;

      for (let i = 0; i < 70; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 4;
        const shapes: ('rect' | 'circle' | 'star')[] = ['rect', 'circle', 'star'];
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 5,
          size: Math.random() * 12 + 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 14,
          alpha: 1,
          gravity: 0.35,
        });
      }
    };

    const handleBurst = (e: any) => spawnBurst(e);
    window.addEventListener('fire-confetti-burst', handleBurst);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotSpeed;
        p.alpha -= 0.008;

        if (p.alpha <= 0 || p.y > canvas.height + 50) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'star') {
          ctx.beginPath();
          const spikes = 5;
          const outerR = p.size / 1.5;
          const innerR = p.size / 3;
          let rot = (Math.PI / 2) * 3;
          const step = Math.PI / spikes;
          ctx.moveTo(0, -outerR);
          for (let s = 0; s < spikes; s++) {
            ctx.lineTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
            rot += step;
            ctx.lineTo(Math.cos(rot) * innerR, Math.sin(rot) * innerR);
            rot += step;
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('fire-confetti-burst', handleBurst);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
}
