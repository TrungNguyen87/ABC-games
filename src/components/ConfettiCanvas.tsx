import { useEffect, useRef } from 'react';

export type ConfettiTheme = 'autumn' | 'halloween' | 'winter' | 'rainbow' | 'stars' | 'mixed';

export type ConfettiShape =
  | 'leaf'
  | 'snowflake'
  | 'pumpkin'
  | 'ghost'
  | 'acorn'
  | 'candy'
  | 'star'
  | 'heart'
  | 'rect'
  | 'circle';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: ConfettiShape;
  rotation: number;
  rotSpeed: number;
  alpha: number;
  gravity: number;
  // Natural wind sway physics for falling leaves & snowflakes
  swayTimer: number;
  swaySpeed: number;
  swayAmount: number;
}

export interface ConfettiBurstOptions {
  x?: number;
  y?: number;
  theme?: ConfettiTheme;
  count?: number;
}

/**
 * Fires a festive burst of confetti with seasonal shapes.
 * Accepts flexible parameters:
 * - fireConfettiBurst()
 * - fireConfettiBurst(x, y)
 * - fireConfettiBurst(x, y, 'autumn')
 * - fireConfettiBurst('halloween')
 * - fireConfettiBurst({ theme: 'winter', x: 200, y: 300 })
 */
export function fireConfettiBurst(
  optionsOrXOrTheme?: ConfettiTheme | number | ConfettiBurstOptions,
  originY?: number,
  theme?: ConfettiTheme
) {
  let finalX: number | undefined;
  let finalY: number | undefined;
  let finalTheme: ConfettiTheme = 'mixed';
  let finalCount: number | undefined;

  if (typeof optionsOrXOrTheme === 'string') {
    finalTheme = optionsOrXOrTheme as ConfettiTheme;
  } else if (typeof optionsOrXOrTheme === 'number') {
    finalX = optionsOrXOrTheme;
    finalY = originY;
    if (theme) finalTheme = theme;
  } else if (optionsOrXOrTheme && typeof optionsOrXOrTheme === 'object') {
    finalX = optionsOrXOrTheme.x;
    finalY = optionsOrXOrTheme.y;
    finalTheme = optionsOrXOrTheme.theme || 'mixed';
    finalCount = optionsOrXOrTheme.count;
  }

  window.dispatchEvent(
    new CustomEvent('fire-confetti-burst', {
      detail: { x: finalX, y: finalY, theme: finalTheme, count: finalCount },
    })
  );
}

// Dedicated helper shortcuts
export const fireAutumnConfetti = (x?: number, y?: number) => fireConfettiBurst(x, y, 'autumn');
export const fireHalloweenConfetti = (x?: number, y?: number) => fireConfettiBurst(x, y, 'halloween');
export const fireWinterConfetti = (x?: number, y?: number) => fireConfettiBurst(x, y, 'winter');
export const fireStarConfetti = (x?: number, y?: number) => fireConfettiBurst(x, y, 'stars');

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

    // Color palettes per theme
    const autumnColors = [
      '#EA580C', // Maple orange
      '#D97706', // Golden amber
      '#DC2626', // Crimson red
      '#B45309', // Russet acorn
      '#F59E0B', // Harvest yellow
      '#65A30D', // Forest olive
      '#78350F', // Warm cedar
    ];

    const halloweenColors = [
      '#F97316', // Pumpkin orange
      '#EA580C', // Deep jack-o-lantern
      '#9333EA', // Witch purple
      '#7E22CE', // Midnight violet
      '#FACC15', // Candy corn yellow
      '#10B981', // Slime green
      '#FFFFFF', // Ghost white
    ];

    const winterColors = [
      '#FFFFFF', // Pure snow
      '#E0F2FE', // Ice crystal
      '#BAE6FD', // Sky frost
      '#7DD3FC', // Glacial blue
      '#38BDF8', // Deep frost
      '#A5F3FC', // Shimmer cyan
      '#F1F5F9', // Pearl silver
    ];

    const rainbowColors = [
      '#EF4444',
      '#F59E0B',
      '#10B981',
      '#3B82F6',
      '#8B5CF6',
      '#EC4899',
      '#06B6D4',
      '#F97316',
    ];

    const spawnBurst = (e?: any) => {
      const centerX = e?.detail?.x ?? canvas.width / 2;
      const centerY = e?.detail?.y ?? canvas.height / 2;
      const theme: ConfettiTheme = e?.detail?.theme ?? 'mixed';
      const particleCount = e?.detail?.count ?? 65;

      let shapesForTheme: ConfettiShape[];
      let palette: string[];
      let defaultGravity = 0.32;

      switch (theme) {
        case 'autumn':
          shapesForTheme = ['leaf', 'leaf', 'acorn', 'pumpkin', 'star'];
          palette = autumnColors;
          defaultGravity = 0.22; // Gentle drifting
          break;
        case 'halloween':
          shapesForTheme = ['pumpkin', 'pumpkin', 'ghost', 'candy', 'star', 'leaf'];
          palette = halloweenColors;
          defaultGravity = 0.26;
          break;
        case 'winter':
          shapesForTheme = ['snowflake', 'snowflake', 'snowflake', 'circle', 'star'];
          palette = winterColors;
          defaultGravity = 0.18; // Soft, slow snow drift
          break;
        case 'stars':
          shapesForTheme = ['star', 'star', 'heart', 'circle'];
          palette = ['#FACC15', '#FDE047', '#FEF08A', '#F59E0B', '#FFFFFF'];
          defaultGravity = 0.3;
          break;
        case 'rainbow':
          shapesForTheme = ['star', 'heart', 'circle', 'rect'];
          palette = rainbowColors;
          defaultGravity = 0.34;
          break;
        case 'mixed':
        default:
          shapesForTheme = ['leaf', 'pumpkin', 'snowflake', 'star', 'candy', 'circle'];
          palette = [...autumnColors, ...halloweenColors, ...winterColors];
          defaultGravity = 0.26;
          break;
      }

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 11 + 3.5;
        const shape = shapesForTheme[Math.floor(Math.random() * shapesForTheme.length)];
        const sizeBase = shape === 'leaf' || shape === 'pumpkin' || shape === 'ghost' ? 18 : 14;

        particles.push({
          x: centerX + (Math.random() - 0.5) * 20,
          y: centerY + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (shape === 'snowflake' ? 3 : 5.5),
          size: Math.random() * 12 + sizeBase,
          color: palette[Math.floor(Math.random() * palette.length)],
          shape,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * (shape === 'snowflake' ? 6 : 14),
          alpha: 1,
          gravity: shape === 'snowflake' ? 0.16 : shape === 'leaf' ? 0.22 : defaultGravity,
          swayTimer: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.08 + 0.04,
          swayAmount: shape === 'leaf' || shape === 'snowflake' ? Math.random() * 2.5 + 1.5 : 0.5,
        });
      }
    };

    const handleBurst = (e: any) => spawnBurst(e);
    window.addEventListener('fire-confetti-burst', handleBurst);

    // ==========================================
    // Drawing subroutines for bespoke seasonal shapes
    // ==========================================

    const drawLeaf = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
      // Natural curved maple / autumn leaf
      const half = size * 0.5;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -half * 1.2);
      ctx.bezierCurveTo(half * 0.9, -half * 0.4, half * 0.9, half * 0.5, 0, half * 1.1);
      ctx.bezierCurveTo(-half * 0.9, half * 0.5, -half * 0.9, -half * 0.4, 0, -half * 1.2);
      ctx.fill();

      // Leaf veins & stem
      ctx.beginPath();
      ctx.moveTo(0, -half * 1.0);
      ctx.lineTo(0, half * 1.3);
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = Math.max(1, size * 0.07);
      ctx.lineCap = 'round';
      ctx.stroke();

      // Side mini veins
      ctx.beginPath();
      ctx.moveTo(0, -half * 0.3);
      ctx.lineTo(half * 0.4, -half * 0.1);
      ctx.moveTo(0, -half * 0.3);
      ctx.lineTo(-half * 0.4, -half * 0.1);
      ctx.moveTo(0, half * 0.2);
      ctx.lineTo(half * 0.35, half * 0.4);
      ctx.moveTo(0, half * 0.2);
      ctx.lineTo(-half * 0.35, half * 0.4);
      ctx.lineWidth = Math.max(0.8, size * 0.05);
      ctx.stroke();
    };

    const drawPumpkin = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
      const r = size * 0.48;

      // Green stem at top
      ctx.fillStyle = '#15803D';
      ctx.fillRect(-r * 0.18, -r * 1.25, r * 0.36, r * 0.45);

      // Pumpkin center body
      ctx.fillStyle = color || '#F97316';
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.95, r * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Left and right rounded lobes
      ctx.fillStyle = '#EA580C';
      ctx.beginPath();
      ctx.ellipse(-r * 0.48, 0, r * 0.45, r * 0.72, 0, 0, Math.PI * 2);
      ctx.ellipse(r * 0.48, 0, r * 0.45, r * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cute Toddler Jack-o-lantern face when large enough
      if (size > 16) {
        ctx.fillStyle = '#451A03';
        // Left eye triangle
        ctx.beginPath();
        ctx.moveTo(-r * 0.4, -r * 0.2);
        ctx.lineTo(-r * 0.15, -r * 0.2);
        ctx.lineTo(-r * 0.27, -r * 0.02);
        ctx.closePath();
        ctx.fill();

        // Right eye triangle
        ctx.beginPath();
        ctx.moveTo(r * 0.4, -r * 0.2);
        ctx.lineTo(r * 0.15, -r * 0.2);
        ctx.lineTo(r * 0.27, -r * 0.02);
        ctx.closePath();
        ctx.fill();

        // Happy carved smile
        ctx.beginPath();
        ctx.arc(0, r * 0.15, r * 0.32, 0, Math.PI);
        ctx.lineWidth = Math.max(1.5, size * 0.08);
        ctx.strokeStyle = '#451A03';
        ctx.stroke();
      }
    };

    const drawSnowflake = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
      const r = size * 0.55;
      ctx.strokeStyle = color || '#BAE6FD';
      ctx.lineWidth = Math.max(1.5, size * 0.09);
      ctx.lineCap = 'round';

      ctx.beginPath();
      for (let a = 0; a < 6; a++) {
        const angle = (a * Math.PI) / 3;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        ctx.moveTo(0, 0);
        ctx.lineTo(cos * r, sin * r);

        // Sub-branches
        const midR = r * 0.6;
        const mx = cos * midR;
        const my = sin * midR;
        const bLen = r * 0.32;
        const a1 = angle + Math.PI / 4;
        const a2 = angle - Math.PI / 4;

        ctx.moveTo(mx, my);
        ctx.lineTo(mx + Math.cos(a1) * bLen, my + Math.sin(a1) * bLen);
        ctx.moveTo(mx, my);
        ctx.lineTo(mx + Math.cos(a2) * bLen, my + Math.sin(a2) * bLen);
      }
      ctx.stroke();

      // Sparkling center frost node
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1.5, size * 0.12), 0, Math.PI * 2);
      ctx.fill();
    };

    const drawGhost = (ctx: CanvasRenderingContext2D, size: number) => {
      const w = size * 0.45;
      const h = size * 0.55;

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      // Rounded head dome
      ctx.arc(0, -h * 0.3, w, Math.PI, 0);
      ctx.lineTo(w, h * 0.5);
      // Wavy fluttering hem
      ctx.quadraticCurveTo(w * 0.5, h * 0.25, w * 0.3, h * 0.55);
      ctx.quadraticCurveTo(0, h * 0.25, -w * 0.3, h * 0.55);
      ctx.quadraticCurveTo(-w * 0.5, h * 0.25, -w, h * 0.5);
      ctx.closePath();
      ctx.fill();

      // Soft purple shadow edge
      ctx.strokeStyle = '#C4B5FD';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Cute friendly eyes
      ctx.fillStyle = '#1E1B4B';
      ctx.beginPath();
      ctx.arc(-w * 0.32, -h * 0.2, Math.max(1.5, size * 0.08), 0, Math.PI * 2);
      ctx.arc(w * 0.32, -h * 0.2, Math.max(1.5, size * 0.08), 0, Math.PI * 2);
      ctx.fill();
    };

    const drawAcorn = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
      const r = size * 0.42;

      // Acorn Nut Body
      ctx.fillStyle = color || '#B45309';
      ctx.beginPath();
      ctx.arc(0, r * 0.1, r * 0.85, 0, Math.PI);
      ctx.lineTo(0, r * 1.35);
      ctx.closePath();
      ctx.fill();

      // Acorn Cap
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(0, -r * 0.1, r * 0.95, Math.PI, 0);
      ctx.closePath();
      ctx.fill();

      // Little top stalk
      ctx.fillRect(-r * 0.12, -r * 0.6, r * 0.24, r * 0.5);
    };

    const drawCandy = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
      const r = size * 0.35;
      ctx.fillStyle = color;

      // Center candy treat
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Left twisted wrapper
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, 0);
      ctx.lineTo(-r * 1.8, -r * 0.7);
      ctx.lineTo(-r * 1.8, r * 0.7);
      ctx.closePath();
      ctx.fill();

      // Right twisted wrapper
      ctx.beginPath();
      ctx.moveTo(r * 0.7, 0);
      ctx.lineTo(r * 1.8, -r * 0.7);
      ctx.lineTo(r * 1.8, r * 0.7);
      ctx.closePath();
      ctx.fill();
    };

    const drawStar = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      const spikes = 5;
      const outerR = size * 0.55;
      const innerR = size * 0.25;
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
    };

    const drawHeart = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
      const s = size * 0.45;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(-s * 0.7, -s * 0.7, -s * 1.3, s * 0.2, 0, s * 1.2);
      ctx.bezierCurveTo(s * 1.3, s * 0.2, s * 0.7, -s * 0.7, 0, s * 0.3);
      ctx.fill();
    };

    // ==========================================
    // Render loop with physics
    // ==========================================
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Horizontal sinusoidal sway for wind fluttering
        p.swayTimer += p.swaySpeed;
        p.x += p.vx + Math.sin(p.swayTimer) * p.swayAmount;
        p.y += p.vy;

        // Apply air friction and gravity
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.rotation += p.rotSpeed;
        p.alpha -= p.shape === 'snowflake' || p.shape === 'leaf' ? 0.006 : 0.009;

        if (p.alpha <= 0 || p.y > canvas.height + 60) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        switch (p.shape) {
          case 'leaf':
            drawLeaf(ctx, p.size, p.color);
            break;
          case 'pumpkin':
            drawPumpkin(ctx, p.size, p.color);
            break;
          case 'snowflake':
            drawSnowflake(ctx, p.size, p.color);
            break;
          case 'ghost':
            drawGhost(ctx, p.size);
            break;
          case 'acorn':
            drawAcorn(ctx, p.size, p.color);
            break;
          case 'candy':
            drawCandy(ctx, p.size, p.color);
            break;
          case 'star':
            drawStar(ctx, p.size, p.color);
            break;
          case 'heart':
            drawHeart(ctx, p.size, p.color);
            break;
          case 'circle':
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'rect':
          default:
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size * 0.5, -p.size * 0.35, p.size, p.size * 0.7);
            break;
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
