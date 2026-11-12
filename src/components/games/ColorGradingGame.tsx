import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Language, LetterStyleOption } from '../../types/game';
import { ALPHABET_DATA, getLetterEmoji, getLetterWord } from '../../data/alphabetData';
import { LETTER_NAMES } from '../../utils/speechText';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { triggerKidCheer } from '../CheerCelebration';
import AlphabetLoreAvatar from '../AlphabetLoreAvatar';
import LetterAvatar from '../LetterAvatar';
import {
  Sparkles,
  RefreshCw,
  Volume2,
  ChevronRight,
  Palette,
  CheckCircle2,
  Wand2,
  Paintbrush,
  Eraser,
  Trash2,
  Shuffle,
} from 'lucide-react';

interface ColorGradingGameProps {
  onEarnStar: () => void;
  onUnlockSticker?: (letter: string) => void;
  language: Language;
}

type GradingGameType = 'paint-studio' | 'shade-sort' | 'rainbow-spectrum';

// Toddler brush tools
type PaintTool = 'rainbow-roller' | 'brush' | 'bucket' | 'stamp' | 'eraser';

// Stamps
const STAMPS = ['⭐', '💖', '🎃', '🍁', '🌸', '🌈', '👻', '✨'];

// Vivid toddler color palette
const PAINT_COLORS = [
  { nameNl: 'Robijn Rood', nameEn: 'Ruby Red', hex: '#ef4444', border: '#b91c1c' },
  { nameNl: 'Zonnig Oranje', nameEn: 'Sunny Orange', hex: '#f97316', border: '#c2410c' },
  { nameNl: 'Goudgeel', nameEn: 'Golden Yellow', hex: '#facc15', border: '#ca8a04' },
  { nameNl: 'Fris Groen', nameEn: 'Fresh Green', hex: '#22c55e', border: '#15803d' },
  { nameNl: 'Hemelsblauw', nameEn: 'Sky Blue', hex: '#38bdf8', border: '#0284c7' },
  { nameNl: 'Koningsblauw', nameEn: 'Royal Blue', hex: '#3b82f6', border: '#1d4ed8' },
  { nameNl: 'Magisch Paars', nameEn: 'Magic Purple', hex: '#a855f7', border: '#7e22ce' },
  { nameNl: 'Suikerspin Roze', nameEn: 'Cotton Pink', hex: '#f472b6', border: '#db2777' },
  { nameNl: 'Sneeuwwit', nameEn: 'Pure White', hex: '#ffffff', border: '#94a3b8' },
  { nameNl: 'Donkerblauw', nameEn: 'Midnight Blue', hex: '#1e1b4b', border: '#0f172a' },
];

// Gradient presets for bucket fill or background
const GRADIENT_PRESETS = [
  {
    id: 'sunset',
    nameNl: '🌅 Zonsondergang',
    nameEn: '🌅 Sunset Glow',
    css: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)',
    stops: ['#f59e0b', '#ec4899', '#8b5cf6'],
  },
  {
    id: 'rainbow',
    nameNl: '🌈 Regenboog',
    nameEn: '🌈 Rainbow',
    css: 'linear-gradient(135deg, #ef4444 0%, #f97316 20%, #eab308 40%, #22c55e 60%, #3b82f6 80%, #a855f7 100%)',
    stops: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'],
  },
  {
    id: 'ocean',
    nameNl: '🌊 Tropische Zee',
    nameEn: '🌊 Ocean Aurora',
    css: 'linear-gradient(135deg, #2dd4bf 0%, #06b6d4 40%, #3b82f6 75%, #1e1b4b 100%)',
    stops: ['#2dd4bf', '#06b6d4', '#3b82f6', '#1e1b4b'],
  },
  {
    id: 'autumn',
    nameNl: '🍂 Herfstbladeren',
    nameEn: '🍂 Autumn Woods',
    css: 'linear-gradient(135deg, #fde047 0%, #f97316 45%, #b91c1c 80%, #78350f 100%)',
    stops: ['#fde047', '#f97316', '#b91c1c', '#78350f'],
  },
  {
    id: 'halloween',
    nameNl: '🎃 Spooky Neon',
    nameEn: '🎃 Spooky Neon',
    css: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 40%, #10b981 80%, #f97316 100%)',
    stops: ['#a855f7', '#3b82f6', '#10b981', '#f97316'],
  },
  {
    id: 'candy',
    nameNl: '🍭 Snoepjes',
    nameEn: '🍭 Candy Sparkle',
    css: 'linear-gradient(135deg, #f472b6 0%, #c084fc 50%, #67e8f9 100%)',
    stops: ['#f472b6', '#c084fc', '#67e8f9'],
  },
];

// Shade definitions for Mode 2: Shade Sort
interface ShadeFamily {
  id: string;
  nameNl: string;
  nameEn: string;
  emoji: string;
  steps: {
    labelNl: string;
    labelEn: string;
    bgHex: string;
    borderHex: string;
    textColor: string;
  }[];
}

const SHADE_FAMILIES: ShadeFamily[] = [
  {
    id: 'sinterklaas-gold-red',
    nameNl: 'Sinterklaas Goud & Robijn',
    nameEn: 'Sinterklaas Gold & Ruby',
    emoji: '👑',
    steps: [
      { labelNl: 'Licht goudgeel', labelEn: 'Pale Gold', bgHex: '#fef08a', borderHex: '#fde047', textColor: '#854d0e' },
      { labelNl: 'Warm speculaasgoud', labelEn: 'Amber Gold', bgHex: '#f59e0b', borderHex: '#d97706', textColor: '#ffffff' },
      { labelNl: 'Mijter rood', labelEn: 'Mitre Red', bgHex: '#dc2626', borderHex: '#b91c1c', textColor: '#ffffff' },
      { labelNl: 'Vorstelijk purperrood', labelEn: 'Royal Crimson', bgHex: '#7f1d1d', borderHex: '#450a0a', textColor: '#fef2f2' },
    ],
  },
  {
    id: 'christmas-pine-winter',
    nameNl: 'Kerstmis Dennen & Hulst',
    nameEn: 'Christmas Pine & Holly',
    emoji: '🎄',
    steps: [
      { labelNl: 'Licht muntgroen', labelEn: 'Pale Mint', bgHex: '#bbf7d0', borderHex: '#86efac', textColor: '#14532d' },
      { labelNl: 'Fris kerstgroen', labelEn: 'Pine Green', bgHex: '#22c55e', borderHex: '#16a34a', textColor: '#ffffff' },
      { labelNl: 'Diep hulstgroen', labelEn: 'Deep Holly', bgHex: '#15803d', borderHex: '#166534', textColor: '#ffffff' },
      { labelNl: 'Donker winterbos', labelEn: 'Midnight Evergreen', bgHex: '#052e16', borderHex: '#022c22', textColor: '#dcfce7' },
    ],
  },
  {
    id: 'christmas-santa-ruby',
    nameNl: 'Kerstman Robijnrood',
    nameEn: 'Santa Claus Ruby Red',
    emoji: '🎅',
    steps: [
      { labelNl: 'Licht sneeuwroze', labelEn: 'Snow Pink', bgHex: '#ffe4e6', borderHex: '#fecdd3', textColor: '#9f1239' },
      { labelNl: 'Vrolijk kerstrood', labelEn: 'Bright Festive Red', bgHex: '#f43f5e', borderHex: '#e11d48', textColor: '#ffffff' },
      { labelNl: 'Diep robijnrood', labelEn: 'Deep Ruby Red', bgHex: '#be123c', borderHex: '#9f1239', textColor: '#ffffff' },
      { labelNl: 'Donker fluweelrood', labelEn: 'Dark Velvet Maroon', bgHex: '#4c0519', borderHex: '#27030c', textColor: '#ffe4e6' },
    ],
  },
  {
    id: 'pumpkin-orange',
    nameNl: 'Pompoen Oranje',
    nameEn: 'Pumpkin Orange',
    emoji: '🎃',
    steps: [
      { labelNl: 'Licht perzik', labelEn: 'Light Peach', bgHex: '#fed7aa', borderHex: '#fdba74', textColor: '#7c2d12' },
      { labelNl: 'Zacht oranje', labelEn: 'Warm Orange', bgHex: '#fb923c', borderHex: '#f97316', textColor: '#ffffff' },
      { labelNl: 'Diep oranje', labelEn: 'Deep Orange', bgHex: '#ea580c', borderHex: '#c2410c', textColor: '#ffffff' },
      { labelNl: 'Donker herfstbruin', labelEn: 'Dark Russet', bgHex: '#7c2d12', borderHex: '#451a03', textColor: '#fef3c7' },
    ],
  },
  {
    id: 'ocean-blue',
    nameNl: 'Oceaan Blauw',
    nameEn: 'Ocean Blue',
    emoji: '🌊',
    steps: [
      { labelNl: 'Zacht hemelsblauw', labelEn: 'Light Sky Blue', bgHex: '#bae6fd', borderHex: '#7dd3fc', textColor: '#0369a1' },
      { labelNl: 'Helder blauw', labelEn: 'Bright Cyan', bgHex: '#38bdf8', borderHex: '#0284c7', textColor: '#ffffff' },
      { labelNl: 'Diep koningsblauw', labelEn: 'Royal Blue', bgHex: '#0284c7', borderHex: '#0369a1', textColor: '#ffffff' },
      { labelNl: 'Donker nachtblauw', labelEn: 'Midnight Navy', bgHex: '#0c4a6e', borderHex: '#082f49', textColor: '#e0f2fe' },
    ],
  },
  {
    id: 'forest-green',
    nameNl: 'Bos Groen',
    nameEn: 'Forest Green',
    emoji: '🌲',
    steps: [
      { labelNl: 'Licht limoengroen', labelEn: 'Pale Lime', bgHex: '#bbf7d0', borderHex: '#86efac', textColor: '#15803d' },
      { labelNl: 'Fris groen', labelEn: 'Fresh Green', bgHex: '#4ade80', borderHex: '#22c55e', textColor: '#ffffff' },
      { labelNl: 'Klaver groen', labelEn: 'Clover Green', bgHex: '#16a34a', borderHex: '#15803d', textColor: '#ffffff' },
      { labelNl: 'Donker bosgroen', labelEn: 'Forest Green', bgHex: '#14532d', borderHex: '#052e16', textColor: '#dcfce7' },
    ],
  },
  {
    id: 'berry-purple',
    nameNl: 'Bessen Paars',
    nameEn: 'Berry Purple',
    emoji: '🍇',
    steps: [
      { labelNl: 'Licht lila', labelEn: 'Light Lavender', bgHex: '#f5d0fe', borderHex: '#e879f9', textColor: '#86198f' },
      { labelNl: 'Vrolijk paars', labelEn: 'Orchid Purple', bgHex: '#c084fc', borderHex: '#a855f7', textColor: '#ffffff' },
      { labelNl: 'Diep violet', labelEn: 'Deep Violet', bgHex: '#9333ea', borderHex: '#7e22ce', textColor: '#ffffff' },
      { labelNl: 'Donker pruim', labelEn: 'Dark Plum', bgHex: '#581c87', borderHex: '#3b0764', textColor: '#fae8ff' },
    ],
  },
  {
    id: 'autumn-gold',
    nameNl: 'Herfst Goud',
    nameEn: 'Autumn Gold',
    emoji: '🍂',
    steps: [
      { labelNl: 'Licht botergeel', labelEn: 'Pale Sunlight', bgHex: '#fef08a', borderHex: '#fde047', textColor: '#854d0e' },
      { labelNl: 'Zonnig geel', labelEn: 'Sunny Yellow', bgHex: '#facc15', borderHex: '#eab308', textColor: '#713f12' },
      { labelNl: 'Goud amber', labelEn: 'Golden Amber', bgHex: '#ca8a04', borderHex: '#a16207', textColor: '#ffffff' },
      { labelNl: 'Donker brons', labelEn: 'Rich Bronze', bgHex: '#713f12', borderHex: '#422006', textColor: '#fef9c3' },
    ],
  },
  {
    id: 'sweet-rose',
    nameNl: 'Roze & Rood',
    nameEn: 'Rose & Ruby',
    emoji: '🍓',
    steps: [
      { labelNl: 'Licht suikerspin', labelEn: 'Cotton Candy', bgHex: '#fbcfe8', borderHex: '#f472b6', textColor: '#9d174d' },
      { labelNl: 'Framboos roze', labelEn: 'Raspberry Pink', bgHex: '#f43f5e', borderHex: '#e11d48', textColor: '#ffffff' },
      { labelNl: 'Robijn rood', labelEn: 'Ruby Red', bgHex: '#be123c', borderHex: '#9f1239', textColor: '#ffffff' },
      { labelNl: 'Donker bordeaux', labelEn: 'Deep Maroon', bgHex: '#4c0519', borderHex: '#27030c', textColor: '#ffe4e6' },
    ],
  },
];

// Rainbow spectrum steps for Mode 3
const RAINBOW_SPECTRUM = [
  { letter: 'A', nameNl: 'Rood', nameEn: 'Red', bgHex: '#ef4444', borderHex: '#b91c1c', textColor: '#ffffff', soundRatio: 0.1 },
  { letter: 'B', nameNl: 'Oranje', nameEn: 'Orange', bgHex: '#f97316', borderHex: '#c2410c', textColor: '#ffffff', soundRatio: 0.28 },
  { letter: 'C', nameNl: 'Geel', nameEn: 'Yellow', bgHex: '#eab308', borderHex: '#a16207', textColor: '#713f12', soundRatio: 0.45 },
  { letter: 'D', nameNl: 'Groen', nameEn: 'Green', bgHex: '#22c55e', borderHex: '#15803d', textColor: '#ffffff', soundRatio: 0.62 },
  { letter: 'E', nameNl: 'Blauw', nameEn: 'Blue', bgHex: '#3b82f6', borderHex: '#1d4ed8', textColor: '#ffffff', soundRatio: 0.8 },
  { letter: 'F', nameNl: 'Paars', nameEn: 'Purple', bgHex: '#a855f7', borderHex: '#7e22ce', textColor: '#ffffff', soundRatio: 0.95 },
];

// Multi-stop gradient palettes for Type 3: Gradient Studio
const STUDIO_GRADIENTS = [
  {
    id: 'sinterklaas',
    nameNl: '👑 Sinterklaas Goud & Robijn',
    nameEn: '👑 Saint Nicholas Gold',
    css: 'linear-gradient(135deg, #fde047 0%, #f59e0b 35%, #dc2626 70%, #7f1d1d 100%)',
    stops: ['#fde047', '#f59e0b', '#dc2626', '#7f1d1d'],
  },
  {
    id: 'christmas',
    nameNl: '🎄 Kerst Dennen & Sneeuw',
    nameEn: '🎄 Christmas Pine & Snow',
    css: 'linear-gradient(135deg, #ffffff 0%, #38bdf8 25%, #22c55e 65%, #dc2626 100%)',
    stops: ['#ffffff', '#38bdf8', '#22c55e', '#dc2626'],
  },
  {
    id: 'sunset',
    nameNl: '🌅 Zonsondergang',
    nameEn: '🌅 Sunset Glow',
    css: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)',
    stops: ['#f59e0b', '#ec4899', '#8b5cf6'],
  },
  {
    id: 'halloween',
    nameNl: '🎃 Spooky Neon',
    nameEn: '🎃 Spooky Neon',
    css: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 40%, #10b981 80%, #f97316 100%)',
    stops: ['#a855f7', '#3b82f6', '#10b981', '#f97316'],
  },
  {
    id: 'autumn',
    nameNl: '🍂 Herfstbladeren',
    nameEn: '🍂 Autumn Woods',
    css: 'linear-gradient(135deg, #fde047 0%, #f97316 45%, #b91c1c 80%, #78350f 100%)',
    stops: ['#fde047', '#f97316', '#b91c1c', '#78350f'],
  },
  {
    id: 'ocean',
    nameNl: '🌊 Tropische Zee',
    nameEn: '🌊 Ocean Aurora',
    css: 'linear-gradient(135deg, #2dd4bf 0%, #06b6d4 40%, #3b82f6 75%, #1e1b4b 100%)',
    stops: ['#2dd4bf', '#06b6d4', '#3b82f6', '#1e1b4b'],
  },
  {
    id: 'cotton-candy',
    nameNl: '🍭 Suikerspin',
    nameEn: '🍭 Candy Magic',
    css: 'linear-gradient(135deg, #f472b6 0%, #c084fc 50%, #67e8f9 100%)',
    stops: ['#f472b6', '#c084fc', '#67e8f9'],
  },
  {
    id: 'rainbow',
    nameNl: '🌈 Volle Regenboog',
    nameEn: '🌈 Full Rainbow',
    css: 'linear-gradient(135deg, #ef4444 0%, #f97316 20%, #eab308 40%, #22c55e 60%, #3b82f6 80%, #a855f7 100%)',
    stops: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'],
  },
];
export default function ColorGradingGame({
  onEarnStar,
  onUnlockSticker,
  language,
}: ColorGradingGameProps) {
  // Main Tab: defaults to 'paint-studio' since the user requested "Colour grading mean kids can paint the letter"
  const [gameType, setGameType] = useState<GradingGameType>('paint-studio');

  // =========================================================================
  // STATE FOR MODE 1: Interactive Letter Painting Studio (MULTI-TOUCH)
  // =========================================================================
  const [paintLetter, setPaintLetter] = useState<string>('A');
  const [letterStyle, setLetterStyle] = useState<LetterStyleOption>('normal');
  const [activeTool, setActiveTool] = useState<PaintTool>('rainbow-roller');
  const [activeColor, setActiveColor] = useState<string>(PAINT_COLORS[0].hex);
  const [activeStamp, setActiveStamp] = useState<string>(STAMPS[0]);
  const [brushSize, setBrushSize] = useState<number>(24);
  const [letterBgColor, setLetterBgColor] = useState<string>('#ffffff');
  const [letterBgGradient, setLetterBgGradient] = useState<string | null>(null);
  const [paintStrokesCount, setPaintStrokesCount] = useState<number>(0);
  // Starts with non-colour picture letter so kid will colour it!
  const [isColoringOutlineMode, setIsColoringOutlineMode] = useState<boolean>(true);

  // HTML5 Multi-touch painting canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const touchPointsRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const mouseDrawingRef = useRef<boolean>(false);
  const rainbowHueRef = useRef<number>(0);

  // =========================================================================
  // STATE FOR MODE 2: Shade Sort
  // =========================================================================
  const [shadeFamilyIndex, setShadeFamilyIndex] = useState<number>(0);
  const currentShadeFamily = SHADE_FAMILIES[shadeFamilyIndex % SHADE_FAMILIES.length];
  const [shadeTargetLetter, setShadeTargetLetter] = useState<string>('A');
  const [availableShades, setAvailableShades] = useState<{ id: string; stepIndex: number }[]>([]);
  const [placedShades, setPlacedShades] = useState<(number | null)[]>([null, null, null, null]);
  const [isShadeComplete, setIsShadeComplete] = useState<boolean>(false);
  const hasIntroducedShadeRef = useRef<boolean>(false);

  // =========================================================================
  // STATE FOR MODE 3: Rainbow Spectrum
  // =========================================================================
  const [rainbowPlaced, setRainbowPlaced] = useState<boolean[]>([false, false, false, false, false, false]);
  const [isRainbowComplete, setIsRainbowComplete] = useState<boolean>(false);

  // Clear or resize canvas
  const clearPaintCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPaintStrokesCount(0);
  }, []);

  // Setup / Initialize canvas sizing
  useEffect(() => {
    if (gameType === 'paint-studio' && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [gameType, paintLetter, letterStyle]);

  // Mode announcement
  useEffect(() => {
    if (gameType === 'paint-studio') {
      sounds.speak(
        language === 'nl'
          ? `Schilder de letter ${paintLetter}!`
          : `Paint the letter ${paintLetter}!`,
        language
      );
    } else if (gameType === 'shade-sort') {
      setupShadeRound(shadeFamilyIndex);
    } else if (gameType === 'rainbow-spectrum') {
      setRainbowPlaced([false, false, false, false, false, false]);
      setIsRainbowComplete(false);
      sounds.speak(
        language === 'nl' ? 'Regenboog letters!' : 'Rainbow letters!',
        language
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameType]);

  // =========================================================================
  // MULTI-TOUCH PAINTING HANDLERS
  // Supports multiple fingers at the same time for toddlers on tablets!
  // =========================================================================
  const drawPaintSegment = (
    from: { x: number; y: number },
    to: { x: number; y: number }
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 1.5;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else if (activeTool === 'rainbow-roller') {
      // Advance rainbow hue
      rainbowHueRef.current = (rainbowHueRef.current + 8) % 360;
      ctx.strokeStyle = `hsl(${rainbowHueRef.current}, 95%, 55%)`;
      ctx.shadowColor = `hsl(${rainbowHueRef.current}, 95%, 65%)`;
      ctx.shadowBlur = 10;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else if (activeTool === 'brush') {
      ctx.strokeStyle = activeColor;
      ctx.shadowColor = activeColor;
      ctx.shadowBlur = 4;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }
    ctx.restore();
    setPaintStrokesCount((c) => c + 1);
  };

  const drawStampAt = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.font = `${brushSize * 1.5}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 6;
    ctx.fillText(activeStamp, x, y);
    ctx.restore();

    sounds.playPop();
    setPaintStrokesCount((c) => c + 1);
  };

  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // MULTI-TOUCH START
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent default scrolling on canvas touch
    e.preventDefault();
    sounds.playRustle();

    Array.from(e.changedTouches).forEach((touch) => {
      const coords = getCanvasCoords(touch.clientX, touch.clientY);
      touchPointsRef.current.set(touch.identifier, coords);

      if (activeTool === 'stamp') {
        drawStampAt(coords.x, coords.y);
      } else if (activeTool === 'bucket') {
        // Fill letter with active color or gradient
        setLetterBgColor(activeColor);
        setLetterBgGradient(null);
        sounds.playSplash();
        sounds.playColorChime(0.7);
      } else {
        // Draw initial dot
        drawPaintSegment(coords, { x: coords.x + 0.5, y: coords.y + 0.5 });
      }
    });
  };

  // MULTI-TOUCH MOVE (All active fingers update simultaneously!)
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (activeTool === 'stamp' || activeTool === 'bucket') return;

    Array.from(e.changedTouches).forEach((touch) => {
      const prevCoords = touchPointsRef.current.get(touch.identifier);
      const curCoords = getCanvasCoords(touch.clientX, touch.clientY);

      if (prevCoords) {
        drawPaintSegment(prevCoords, curCoords);
      }
      touchPointsRef.current.set(touch.identifier, curCoords);
    });
  };

  // MULTI-TOUCH END
  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    Array.from(e.changedTouches).forEach((touch) => {
      touchPointsRef.current.delete(touch.identifier);
    });
  };

  // MOUSE FALLBACK (For desktop / mouse drag)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    mouseDrawingRef.current = true;
    const coords = getCanvasCoords(e.clientX, e.clientY);

    if (activeTool === 'stamp') {
      drawStampAt(coords.x, coords.y);
    } else if (activeTool === 'bucket') {
      setLetterBgColor(activeColor);
      setLetterBgGradient(null);
      sounds.playSplash();
      sounds.playColorChime(0.7);
    } else {
      drawPaintSegment(coords, { x: coords.x + 0.5, y: coords.y + 0.5 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mouseDrawingRef.current) return;
    if (activeTool === 'stamp' || activeTool === 'bucket') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const prevCoords = {
      x: coords.x - e.movementX,
      y: coords.y - e.movementY,
    };
    drawPaintSegment(prevCoords, coords);
  };

  const handleMouseUp = () => {
    mouseDrawingRef.current = false;
  };

  // Finish painting and celebrate!
  const handleFinishPainting = () => {
    sounds.playTada();
    sounds.playSparkle();
    fireConfettiBurst('rainbow');
    onEarnStar();
    if (onUnlockSticker) onUnlockSticker(paintLetter);

    triggerKidCheer({
      message: language === 'nl' ? 'MOOI GESCHILDERD!' : 'BEAUTIFUL ART!',
      emoji: '🎨',
    });

    const msg =
      language === 'nl'
        ? `Wat een prachtig kunstwerk voor letter ${paintLetter}!`
        : `Such a wonderful artwork for letter ${paintLetter}!`;
    sounds.speak(msg, language);
  };

  // =========================================================================
  // TYPE 2: SHADE GRADIENT SORT HELPERS
  // =========================================================================
  const setupShadeRound = (familyIdx: number, letterChar?: string) => {
    setIsShadeComplete(false);
    setPlacedShades([null, null, null, null]);
    const chosenLetter = letterChar || String.fromCharCode(65 + Math.floor(Math.random() * 26));
    setShadeTargetLetter(chosenLetter);

    const indices = [0, 1, 2, 3]
      .map((val) => ({ val, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((item, idx) => ({ id: `shade-${item.val}-${idx}-${Date.now()}`, stepIndex: item.val }));

    setAvailableShades(indices);

    const fam = SHADE_FAMILIES[familyIdx % SHADE_FAMILIES.length];
    const famName = language === 'nl' ? fam.nameNl : fam.nameEn;
    sounds.playColorChime(0.5);

    if (!hasIntroducedShadeRef.current) {
      hasIntroducedShadeRef.current = true;
      const prompt =
        language === 'nl'
          ? `Sorteer van licht naar donker in ${famName}!`
          : `Sort from light to dark in ${famName}!`;
      sounds.speak(prompt, language);
    } else {
      sounds.speak(`${famName}!`, language);
    }
  };

  // Place shade card directly into a specific rack slot (via drag & drop or tap)
  const handlePlaceShadeInSlot = (slotIdx: number, stepIndex: number) => {
    if (isShadeComplete) return;

    const nextPlaced = [...placedShades];
    // If this stepIndex was already in another slot, clear old slot
    const prevSlot = nextPlaced.indexOf(stepIndex);
    if (prevSlot !== -1) {
      nextPlaced[prevSlot] = null;
    }
    nextPlaced[slotIdx] = stepIndex;
    setPlacedShades(nextPlaced);

    sounds.playColorChime((stepIndex + 1) / 4);

    const isAllPlaced = nextPlaced.every((s) => s !== null);
    if (!isAllPlaced) {
      const stepInfo = currentShadeFamily.steps[stepIndex];
      const stepLabel = language === 'nl' ? stepInfo.labelNl : stepInfo.labelEn;
      sounds.speak(stepLabel, language);
    } else {
      const isCorrectOrder = nextPlaced.every((val, idx) => val === idx);
      if (isCorrectOrder) {
        setIsShadeComplete(true);
        sounds.playTada();
        sounds.playSparkle();
        fireConfettiBurst('rainbow');
        triggerKidCheer({
          message: language === 'nl' ? 'MOOIE TINTEN!' : 'BEAUTIFUL SHADES!',
          emoji: '🎨',
        });
        onEarnStar();
        if (onUnlockSticker) onUnlockSticker(shadeTargetLetter);

        const famName = language === 'nl' ? currentShadeFamily.nameNl : currentShadeFamily.nameEn;
        const msg =
          language === 'nl'
            ? `Super! ${famName} gesorteerd!`
            : `Awesome! ${famName} sorted!`;
        sounds.speak(msg, language);
      } else {
        sounds.playBoing();
        sounds.speak(language === 'nl' ? 'Bijna!' : 'Almost!', language);
      }
    }
  };

  // Toddler taps an available shade card to place into next empty slot
  const handleSelectShadeCard = (item: { id: string; stepIndex: number }) => {
    if (isShadeComplete) return;

    // Find next empty target slot
    const emptySlotIdx = placedShades.findIndex((s) => s === null);
    if (emptySlotIdx === -1) return;

    // Check if item is already placed
    if (placedShades.includes(item.stepIndex)) return;

    handlePlaceShadeInSlot(emptySlotIdx, item.stepIndex);
  };

  // Remove card from slot
  const handleRemoveFromRack = (slotIdx: number) => {
    if (isShadeComplete) return;
    if (placedShades[slotIdx] === null) return;
    sounds.playRustle();
    const nextPlaced = [...placedShades];
    nextPlaced[slotIdx] = null;
    setPlacedShades(nextPlaced);
  };

  // =========================================================================
  // TYPE 3: RAINBOW SPECTRUM HELPERS
  // =========================================================================
  const handlePlaceRainbowLetter = (idx: number) => {
    if (rainbowPlaced[idx]) return;

    const step = RAINBOW_SPECTRUM[idx];
    sounds.playColorChime(step.soundRatio);

    const nextPlaced = [...rainbowPlaced];
    nextPlaced[idx] = true;
    setRainbowPlaced(nextPlaced);

    const colorName = language === 'nl' ? step.nameNl : step.nameEn;
    const letterPronounce = language === 'nl' ? (LETTER_NAMES.nl[step.letter] || step.letter) : step.letter;
    const spoken = language === 'nl'
      ? `${letterPronounce}! ${colorName}!`
      : `${step.letter}! ${colorName}!`;
    sounds.speak(spoken, language);

    if (nextPlaced.every(Boolean)) {
      setIsRainbowComplete(true);
      sounds.playTada();
      sounds.playSparkle();
      fireConfettiBurst('rainbow');
      triggerKidCheer({
        message: language === 'nl' ? 'REGENBOOG KLAAR!' : 'RAINBOW COMPLETE!',
        emoji: '🌈',
      });
      onEarnStar();
      sounds.speak(
        language === 'nl' ? 'Magische regenboog!' : 'Magical rainbow!',
        language
      );
    }
  };

  const currentLetterInfo = useMemo(() => {
    return (
      ALPHABET_DATA.find((item) => item.letter === paintLetter) || ALPHABET_DATA[0]
    );
  }, [paintLetter]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-2 sm:p-3 rounded-3xl bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-950 text-white overflow-y-auto overflow-x-hidden scrollbar-none select-none touch-manipulation">
      {/* Background Floating Color Sparks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-4 left-6 text-3xl animate-bounce">🎨</div>
        <div className="absolute top-12 right-8 text-3xl animate-pulse">✨</div>
        <div className="absolute bottom-8 left-12 text-3xl animate-kid-float">🌈</div>
        <div className="absolute bottom-16 right-16 text-3xl animate-spin">🌟</div>
      </div>

      {/* Top Header: Game Mode Tabs (Paint Studio, Shade Sort, Rainbow ABC) */}
      <div className="relative z-10 w-full max-w-4xl flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 bg-black/25 backdrop-blur-md px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl border border-white/20">
        {/* Game Mode Selector Pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 max-w-full">
          {[
            { id: 'paint-studio' as const, labelNl: '🖌️ Letter Schilderen', labelEn: '🖌️ Paint Letter' },
            { id: 'shade-sort' as const, labelNl: '📶 Licht & Donker', labelEn: '📶 Shade Sort' },
            { id: 'rainbow-spectrum' as const, labelNl: '🌈 Regenboog ABC', labelEn: '🌈 Rainbow ABC' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playPop();
                setGameType(tab.id);
              }}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                gameType === tab.id
                  ? 'bg-amber-400 text-amber-950 shadow-md scale-105'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {language === 'nl' ? tab.labelNl : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Quick Style Switcher (Normal vs Lore) when in Painting Studio */}
        {gameType === 'paint-studio' && (
          <div className="flex items-center gap-1 bg-white/15 p-0.5 rounded-full border border-white/30">
            <button
              onClick={() => {
                sounds.playPop();
                setLetterStyle('normal');
              }}
              className={`px-2.5 py-0.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                letterStyle === 'normal'
                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span>🔤</span>
              <span>{language === 'nl' ? 'Normaal' : 'Normal'}</span>
            </button>
            <button
              onClick={() => {
                sounds.playPop();
                setLetterStyle('lore');
              }}
              className={`px-2.5 py-0.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                letterStyle === 'lore'
                  ? 'bg-purple-500 text-white shadow-sm ring-1 ring-amber-300'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span>👾</span>
              <span>Lore</span>
            </button>
          </div>
        )}

        {/* Toggle between Uncolored Coloring Page (Blanco Kleurplaat) and Example */}
        {gameType === 'paint-studio' && (
          <button
            onClick={() => {
              sounds.playPop();
              setIsColoringOutlineMode((prev) => !prev);
            }}
            className={`px-2.5 py-1 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
              isColoringOutlineMode
                ? 'bg-amber-400 text-amber-950 shadow-sm ring-1 ring-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <span>🖍️</span>
            <span>{isColoringOutlineMode ? (language === 'nl' ? 'Blanco Kleurplaat' : 'Coloring Sheet') : (language === 'nl' ? 'Gekleurd' : 'Colored')}</span>
          </button>
        )}

        {/* Quick Action Button for Shade Mode */}
        {gameType === 'shade-sort' && (
          <button
            onClick={() => {
              sounds.playPop();
              const nextIdx = (shadeFamilyIndex + 1) % SHADE_FAMILIES.length;
              setShadeFamilyIndex(nextIdx);
              setupShadeRound(nextIdx);
            }}
            className="px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 cursor-pointer bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-md active:scale-95 transition-transform"
          >
            <span>🎲</span>
            <span>{language === 'nl' ? 'Nieuwe Kleur' : 'Next Color'}</span>
          </button>
        )}

        {/* Quick Action Button for Rainbow Mode */}
        {gameType === 'rainbow-spectrum' && (
          <button
            onClick={() => {
              sounds.playPop();
              setRainbowPlaced([false, false, false, false, false, false]);
              setIsRainbowComplete(false);
            }}
            className="px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 cursor-pointer bg-white/20 text-white hover:bg-white/30 shadow-md active:scale-95 transition-transform"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'nl' ? 'Herstel' : 'Reset'}</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: INTERACTIVE MULTI-TOUCH LETTER PAINTING STUDIO */}
      {/* ========================================================================= */}
      {gameType === 'paint-studio' && (
        <div className="relative z-10 w-full max-w-4xl flex-1 flex flex-col items-center justify-between my-1 sm:my-auto">
          {/* Header prompt banner */}
          <div
            onClick={() => {
              sounds.playBoing();
              const letterWord = getLetterWord(currentLetterInfo, language);
              const letterPronounce =
                language === 'nl'
                  ? LETTER_NAMES.nl[paintLetter] || paintLetter
                  : paintLetter;
              const phrase =
                language === 'nl'
                  ? `${letterPronounce} van ${letterWord}!`
                  : `${paintLetter} for ${letterWord}!`;
              sounds.speak(phrase, language);
            }}
            className="cursor-pointer group flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border-2 border-white/30 shadow-md active:scale-95 transition-all text-center mb-1"
          >
            <div className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow">
              <Volume2 className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getLetterEmoji(currentLetterInfo, language)}</span>
              <span className="text-base sm:text-lg font-black tracking-wide drop-shadow">
                {language === 'nl'
                  ? `${paintLetter} van ${getLetterWord(currentLetterInfo, language)}`
                  : `${paintLetter} for ${getLetterWord(currentLetterInfo, language)}`}
              </span>
            </div>
          </div>

          {/* Main Studio Center: Palette Tools on Left/Top, Canvas in Center, Color/Stamps on Right */}
          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-2 sm:gap-3 my-auto">
            {/* Tool Selection Bar (Roller, Brush, Bucket, Stamps, Eraser, Clear) */}
            <div className="flex md:flex-col items-center gap-1.5 bg-black/30 p-1.5 rounded-2xl border border-white/20">
              {/* Rainbow Roller */}
              <button
                onClick={() => {
                  sounds.playPop();
                  setActiveTool('rainbow-roller');
                  sounds.speak(language === 'nl' ? 'Regenboog Roller!' : 'Rainbow Roller!', language);
                }}
                className={`p-2 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                  activeTool === 'rainbow-roller'
                    ? 'bg-gradient-to-r from-red-500 via-yellow-400 to-purple-500 text-white scale-110 shadow-lg ring-2 ring-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={language === 'nl' ? 'Regenboog Roller' : 'Rainbow Roller'}
              >
                <span className="text-xl">🌈</span>
              </button>

              {/* Paint Brush */}
              <button
                onClick={() => {
                  sounds.playPop();
                  setActiveTool('brush');
                  sounds.speak(language === 'nl' ? 'Verfkwast!' : 'Paint Brush!', language);
                }}
                className={`p-2 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                  activeTool === 'brush'
                    ? 'bg-amber-400 text-amber-950 scale-110 shadow-lg ring-2 ring-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={language === 'nl' ? 'Verfkwast' : 'Paint Brush'}
              >
                <Paintbrush className="w-5 h-5" />
              </button>

              {/* Bucket Fill */}
              <button
                onClick={() => {
                  sounds.playPop();
                  setActiveTool('bucket');
                  sounds.speak(language === 'nl' ? 'Verfemmer!' : 'Paint Bucket!', language);
                }}
                className={`p-2 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                  activeTool === 'bucket'
                    ? 'bg-emerald-400 text-emerald-950 scale-110 shadow-lg ring-2 ring-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={language === 'nl' ? 'Verfemmer' : 'Paint Bucket'}
              >
                <span className="text-xl">🪣</span>
              </button>

              {/* Stamp Tool */}
              <button
                onClick={() => {
                  sounds.playPop();
                  setActiveTool('stamp');
                  sounds.speak(language === 'nl' ? 'Stempels!' : 'Stamps!', language);
                }}
                className={`p-2 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                  activeTool === 'stamp'
                    ? 'bg-pink-400 text-pink-950 scale-110 shadow-lg ring-2 ring-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={language === 'nl' ? 'Stempels' : 'Stamps'}
              >
                <span className="text-xl">⭐</span>
              </button>

              {/* Eraser */}
              <button
                onClick={() => {
                  sounds.playPop();
                  setActiveTool('eraser');
                  sounds.speak(language === 'nl' ? 'Spons' : 'Eraser', language);
                }}
                className={`p-2 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                  activeTool === 'eraser'
                    ? 'bg-sky-400 text-sky-950 scale-110 shadow-lg ring-2 ring-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={language === 'nl' ? 'Spons / Gum' : 'Eraser'}
              >
                <Eraser className="w-5 h-5" />
              </button>

              {/* Clear Canvas */}
              <button
                onClick={() => {
                  sounds.playRustle();
                  clearPaintCanvas();
                  sounds.speak(language === 'nl' ? 'Schoongemaakt!' : 'Clean canvas!', language);
                }}
                className="p-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                title={language === 'nl' ? 'Wis alles' : 'Clear all'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Central Paint Canvas on Letter */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-3xl overflow-hidden border-4 border-white shadow-2xl flex items-center justify-center">
              {/* Dutch Letter & Symbol Badge in canvas corner */}
              <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none drop-shadow flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-2xl border border-white/20 select-none animate-kid-float">
                <span className="text-2xl sm:text-3xl">{getLetterEmoji(currentLetterInfo, language)}</span>
                <span className="text-xs sm:text-sm font-black text-white">
                  {getLetterWord(currentLetterInfo, language)}
                </span>
              </div>

              {/* Background of the letter / card */}
              <div
                className="absolute inset-0 transition-colors duration-300"
                style={{
                  background: letterBgGradient || letterBgColor,
                }}
              />

              {/* Letter Silhouette Base Layer: Starts as uncolored coloring page letter as requested! */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                {letterStyle === 'lore' ? (
                  <div
                    className={`scale-125 transition-all duration-300 ${
                      isColoringOutlineMode
                        ? 'filter grayscale contrast-200 opacity-90 drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)]'
                        : 'opacity-85 drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]'
                    }`}
                  >
                    <AlphabetLoreAvatar
                      letter={paintLetter}
                      size="xl"
                      interactive={false}
                      asDiv={true}
                      language={language}
                    />
                  </div>
                ) : (
                  <span
                    className="text-[140px] sm:text-[170px] md:text-[190px] font-black drop-shadow-[0_6px_12px_rgba(0,0,0,0.25)] select-none transition-all duration-300"
                    style={{
                      color: isColoringOutlineMode ? '#ffffff' : currentLetterInfo.color,
                      WebkitTextStroke: isColoringOutlineMode ? '7px #0f172a' : '5px #ffffff',
                    }}
                  >
                    {paintLetter}
                  </span>
                )}
              </div>

              {/* Multi-Touch HTML5 Canvas for Toddler Finger-Painting */}
              <canvas
                ref={canvasRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="absolute inset-0 w-full h-full cursor-crosshair touch-none z-10"
              />

              {/* Gentle Helper hint if not yet painted */}
              {paintStrokesCount === 0 && (
                <div className="absolute bottom-2 inset-x-0 mx-auto w-max bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[11px] font-black pointer-events-none flex items-center gap-1.5 animate-pulse">
                  <span>👆</span>
                  <span>
                    {language === 'nl'
                      ? 'Veeg met je vingers om te schilderen!'
                      : 'Swipe with your fingers to paint!'}
                  </span>
                </div>
              )}
            </div>

            {/* Right Side: Color Palette & Stamp Options */}
            <div className="flex flex-col items-center md:items-start gap-2 max-w-xs w-full bg-black/25 backdrop-blur-sm p-2.5 rounded-2xl border border-white/20">
              {/* If Stamp Tool is active, show stamp choices */}
              {activeTool === 'stamp' ? (
                <div className="w-full">
                  <span className="text-[11px] font-black text-amber-300 flex items-center gap-1 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{language === 'nl' ? 'Kies een stempel:' : 'Pick a stamp:'}</span>
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 w-full">
                    {STAMPS.map((stamp) => (
                      <button
                        key={stamp}
                        onClick={() => {
                          sounds.playPop();
                          setActiveStamp(stamp);
                        }}
                        className={`h-10 rounded-xl text-xl flex items-center justify-center cursor-pointer transition-all ${
                          activeStamp === stamp
                            ? 'bg-amber-400 scale-110 shadow-md ring-2 ring-white'
                            : 'bg-white/15 hover:bg-white/25'
                        }`}
                      >
                        {stamp}
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeTool === 'bucket' ? (
                /* If Bucket Tool is active, show gradient & solid presets */
                <div className="w-full">
                  <span className="text-[11px] font-black text-amber-300 flex items-center gap-1 mb-1">
                    <Palette className="w-3.5 h-3.5" />
                    <span>{language === 'nl' ? 'Kies een gradiënt:' : 'Pick a gradient:'}</span>
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 w-full">
                    {GRADIENT_PRESETS.map((grad) => (
                      <button
                        key={grad.id}
                        onClick={() => {
                          sounds.playSplash();
                          sounds.playColorChime(0.6);
                          setLetterBgGradient(grad.css);
                          sounds.speak(language === 'nl' ? grad.nameNl : grad.nameEn, language);
                        }}
                        className="h-9 rounded-xl px-1.5 flex items-center justify-center font-black text-[11px] text-white shadow-md cursor-pointer hover:scale-102 active:scale-95 transition-all border border-white/40"
                        style={{ background: grad.css }}
                      >
                        <span className="drop-shadow">{language === 'nl' ? grad.nameNl : grad.nameEn}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Color swatches for brush / roller */
                <div className="w-full">
                  <span className="text-[11px] font-black text-amber-300 flex items-center gap-1 mb-1">
                    <Palette className="w-3.5 h-3.5" />
                    <span>{language === 'nl' ? 'Kies een kleur:' : 'Pick a color:'}</span>
                  </span>
                  <div className="grid grid-cols-5 gap-1.5 w-full">
                    {PAINT_COLORS.map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => {
                          sounds.playPop();
                          setActiveColor(col.hex);
                          if (activeTool !== 'brush') setActiveTool('brush');
                          sounds.speak(language === 'nl' ? col.nameNl : col.nameEn, language);
                        }}
                        className={`w-9 h-9 rounded-full cursor-pointer transition-all ${
                          activeColor === col.hex && activeTool === 'brush'
                            ? 'scale-115 ring-3 ring-white shadow-lg'
                            : 'hover:scale-105 opacity-90'
                        }`}
                        style={{
                          backgroundColor: col.hex,
                          border: `2px solid ${col.border}`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Brush size buttons */}
              <div className="flex items-center justify-between w-full mt-1 pt-1 border-t border-white/15">
                <span className="text-[10px] font-bold text-white/80">
                  {language === 'nl' ? 'Dikte:' : 'Size:'}
                </span>
                <div className="flex items-center gap-1.5">
                  {[14, 24, 38].map((size) => (
                    <button
                      key={size}
                      onClick={() => setBrushSize(size)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                        brushSize === size
                          ? 'bg-amber-400 text-amber-950 font-black scale-110 shadow-sm'
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      <div
                        className="rounded-full bg-current"
                        style={{ width: `${Math.max(4, size / 3)}px`, height: `${Math.max(4, size / 3)}px` }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Finish & Earn Star Button */}
              <button
                onClick={handleFinishPainting}
                className="w-full mt-1 py-2 px-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs sm:text-sm rounded-full shadow-[0_4px_0_#065f46] active:translate-y-1 active:shadow-none flex items-center justify-center gap-1.5 cursor-pointer transition-transform animate-kid-wiggle"
              >
                <Wand2 className="w-4 h-4" />
                <span>{language === 'nl' ? 'KLAAR! STER VERDIENEN! 🌟' : 'DONE! EARN STAR! 🌟'}</span>
              </button>
            </div>
          </div>

          {/* Letter Chooser A to Z Strip (Enlarged with Dutch Symbol & Letter) */}
          <div className="relative z-10 w-full max-w-4xl flex items-center gap-2 overflow-x-auto scrollbar-none py-2 px-2 mt-1 bg-black/25 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
            {ALPHABET_DATA.map((item) => {
              const letterEmoji = getLetterEmoji(item, language);
              const isSelected = paintLetter === item.letter;
              return (
                <button
                  key={item.letter}
                  onClick={() => {
                    sounds.playPop();
                    setPaintLetter(item.letter);
                    clearPaintCanvas();
                    const letterWord = getLetterWord(item, language);
                    const letterPronounce =
                      language === 'nl'
                        ? LETTER_NAMES.nl[item.letter] || item.letter
                        : item.letter;
                    const spokenPhrase =
                      language === 'nl'
                        ? `${letterPronounce} van ${letterWord}!`
                        : `${item.letter} for ${letterWord}!`;
                    sounds.speak(spokenPhrase, language);
                  }}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-black transition-all cursor-pointer flex-shrink-0 shadow-md ${
                    isSelected
                      ? 'bg-amber-400 text-amber-950 scale-110 shadow-lg ring-3 ring-white font-black'
                      : 'bg-white/20 text-white hover:bg-white/35 active:scale-95'
                  }`}
                >
                  <span className="text-lg sm:text-xl leading-none">{item.letter}</span>
                  <span className="text-xs sm:text-sm mt-0.5 leading-none">{letterEmoji}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: SHADE GRADIENT SORT (Licht naar Donker) */}
      {/* ========================================================================= */}
      {gameType === 'shade-sort' && (
        <div className="relative z-10 w-full max-w-3xl flex-1 flex flex-col items-center justify-between my-1 sm:my-auto">
          {/* Header prompt banner */}
          <div
            onClick={() => {
              sounds.playBoing();
              const famName = language === 'nl' ? currentShadeFamily.nameNl : currentShadeFamily.nameEn;
              sounds.speak(
                language === 'nl'
                  ? `Zet de ${shadeTargetLetter} van licht naar donker in ${famName}!`
                  : `Sort ${shadeTargetLetter} from light to dark in ${famName}!`,
                language
              );
            }}
            className="cursor-pointer group flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-white/30 shadow-lg active:scale-95 transition-all mb-2 text-center"
          >
            <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow">
              <Volume2 className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide drop-shadow flex items-center gap-1.5 justify-center">
                <span>{currentShadeFamily.emoji}</span>
                <span>
                  {language === 'nl'
                    ? `Sorteer ${currentShadeFamily.nameNl}: Licht ➔ Donker`
                    : `Sort ${currentShadeFamily.nameEn}: Light ➔ Dark`}
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs opacity-90">
                {language === 'nl'
                  ? `Tik op de letters om ze van licht naar donker op de plank te zetten!`
                  : `Tap the letters to arrange them from lightest to darkest!`}
              </p>
            </div>
          </div>

          {/* Target Gradient Rack (Pedestals 1 to 4) */}
          <div className="w-full flex flex-col items-center justify-center bg-black/25 backdrop-blur-sm p-3 sm:p-4 rounded-3xl border-2 border-white/25 shadow-inner">
            <div className="flex items-center justify-between w-full max-w-md px-2 text-[11px] sm:text-xs font-black text-white/80 mb-1.5">
              <span>☀️ {language === 'nl' ? 'Lichtste' : 'Lightest'}</span>
              <span>➔</span>
              <span>🌙 {language === 'nl' ? 'Donkerste' : 'Darkest'}</span>
            </div>

            <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              {placedShades.map((stepIdx, slotIdx) => {
                const hasCard = stepIdx !== null;
                const step = hasCard ? currentShadeFamily.steps[stepIdx] : null;

                return (
                  <button
                    key={slotIdx}
                    type="button"
                    onClick={() => handleRemoveFromRack(slotIdx)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const droppedStep = parseInt(e.dataTransfer.getData('text/plain'), 10);
                      if (!isNaN(droppedStep)) {
                        handlePlaceShadeInSlot(slotIdx, droppedStep);
                      }
                    }}
                    disabled={!hasCard || isShadeComplete}
                    className={`relative w-20 h-28 sm:w-26 sm:h-36 md:w-30 md:h-40 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 select-none ${
                      hasCard
                        ? 'cursor-pointer active:scale-95 shadow-2xl rotate-0'
                        : 'border-3 border-dashed border-white/50 bg-white/10 hover:border-amber-300 hover:bg-white/20'
                    }`}
                    style={
                      hasCard
                        ? {
                            backgroundColor: step!.bgHex,
                            borderColor: step!.borderHex,
                            borderWidth: '4px',
                            borderStyle: 'solid',
                            boxShadow: `0 8px 0 ${step!.borderHex}`,
                          }
                        : {}
                    }
                  >
                    {hasCard ? (
                      <div className="flex flex-col items-center justify-center animate-pop-in">
                        <span
                          className="text-5xl sm:text-6xl md:text-7xl font-black drop-shadow-md select-none leading-none"
                          style={{ color: step!.textColor }}
                        >
                          {shadeTargetLetter}
                        </span>
                        <span
                          className="text-[9px] sm:text-xs font-black mt-1.5 px-2 py-0.5 rounded-full bg-black/35 text-white"
                        >
                          {language === 'nl' ? step!.labelNl : step!.labelEn}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center opacity-40">
                        <span className="text-2xl sm:text-3xl font-black">{slotIdx + 1}</span>
                        <span className="text-[10px] sm:text-xs font-bold mt-1">
                          {slotIdx === 0
                            ? language === 'nl'
                              ? 'Lichtst'
                              : 'Light'
                            : slotIdx === 3
                            ? language === 'nl'
                              ? 'Donkerst'
                              : 'Dark'
                            : ''}
                        </span>
                      </div>
                    )}

                    {/* Step number badge */}
                    <div className="absolute -top-2.5 -left-2.5 bg-black/75 text-amber-300 font-black text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-white/60 shadow">
                      {slotIdx + 1}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Victory banner */}
            {isShadeComplete && (
              <div className="animate-pop-in flex flex-col items-center bg-emerald-500/95 text-white px-5 py-2 rounded-2xl shadow-2xl border-2 border-white mt-3">
                <div className="flex items-center gap-2 text-sm sm:text-base font-black">
                  <span>🌟</span>
                  <span>
                    {language === 'nl'
                      ? 'Prachtig gedaan! Een perfecte kleurgradiënt!'
                      : 'Magnificent! A perfect color gradient!'}
                  </span>
                  <span>🎉</span>
                </div>
                <button
                  onClick={() => {
                    const nextIdx = (shadeFamilyIndex + 1) % SHADE_FAMILIES.length;
                    setShadeFamilyIndex(nextIdx);
                    setupShadeRound(nextIdx);
                  }}
                  className="mt-1.5 px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm rounded-full shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none flex items-center gap-1 cursor-pointer transition-all animate-kid-bounce"
                >
                  <span>{language === 'nl' ? 'VOLGENDE KLEUR!' : 'NEXT COLOR!'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Shuffled Letter Cards to Choose From (Bottom Pool) - Extra Large for Easy Tapping/Dragging */}
          <div className="w-full max-w-3xl bg-black/35 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 border-2 border-white/20 flex flex-col items-center flex-shrink-0 mt-2">
            <div className="text-xs sm:text-sm font-black text-white/90 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>
                {language === 'nl'
                  ? 'Kies of sleep de grote lettertinten naar de juiste plek:'
                  : 'Tap or drag the big letter shades to the matching spot:'}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap">
              {availableShades.map((item) => {
                const step = currentShadeFamily.steps[item.stepIndex];
                const isPlaced = placedShades.includes(item.stepIndex);

                return (
                  <button
                    key={item.id}
                    type="button"
                    draggable={!isPlaced && !isShadeComplete}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', item.stepIndex.toString());
                    }}
                    onClick={() => handleSelectShadeCard(item)}
                    disabled={isPlaced || isShadeComplete}
                    className={`relative w-20 h-28 sm:w-26 sm:h-36 md:w-30 md:h-40 rounded-3xl flex flex-col items-center justify-center font-black transition-all duration-200 cursor-grab active:cursor-grabbing shadow-xl select-none ${
                      isPlaced
                        ? 'opacity-20 pointer-events-none scale-90 translate-y-2'
                        : 'hover:scale-105 active:scale-95 active:translate-y-1'
                    }`}
                    style={{
                      backgroundColor: step.bgHex,
                      borderColor: step.borderHex,
                      borderWidth: '4px',
                      borderStyle: 'solid',
                      boxShadow: `0 7px 0 ${step.borderHex}`,
                    }}
                  >
                    <span
                      className="text-5xl sm:text-6xl md:text-7xl font-black drop-shadow-md leading-none select-none"
                      style={{ color: step.textColor }}
                    >
                      {shadeTargetLetter}
                    </span>
                    <span className="text-[9px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-black/35 text-white mt-1.5">
                      {language === 'nl' ? step.labelNl : step.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: RAINBOW SPECTRUM RUN (Regenboog Spectrum) */}
      {/* ========================================================================= */}
      {gameType === 'rainbow-spectrum' && (
        <div className="relative z-10 w-full max-w-3xl flex-1 flex flex-col items-center justify-between my-1 sm:my-auto">
          {/* Header */}
          <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-white/30 shadow-lg text-center mb-2">
            <h2 className="text-base sm:text-lg font-black tracking-wide drop-shadow flex items-center justify-center gap-1.5">
              <span>🌈</span>
              <span>
                {language === 'nl'
                  ? 'De Magische Regenboog Letter Loop'
                  : 'Magical Rainbow Spectrum Run'}
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs opacity-90">
              {language === 'nl'
                ? 'Tik op de letters van Rood naar Paars om de regenboog te laten zingen!'
                : 'Tap letters from Red to Purple to build the singing rainbow!'}
            </p>
          </div>

          {/* Rainbow Track Arch */}
          <div className="w-full bg-black/25 backdrop-blur-sm p-3 sm:p-4 rounded-3xl border-2 border-white/25 flex flex-col items-center shadow-inner">
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap my-2">
              {RAINBOW_SPECTRUM.map((step, idx) => {
                const isPlaced = rainbowPlaced[idx];

                return (
                  <button
                    key={step.letter}
                    type="button"
                    onClick={() => handlePlaceRainbowLetter(idx)}
                    className={`relative w-14 h-22 sm:w-18 sm:h-28 rounded-2xl flex flex-col items-center justify-center font-black transition-all duration-300 cursor-pointer ${
                      isPlaced
                        ? 'scale-105 shadow-xl animate-pop-in'
                        : 'opacity-50 hover:opacity-80 scale-95 hover:scale-100'
                    }`}
                    style={{
                      backgroundColor: isPlaced ? step.bgHex : 'rgba(255,255,255,0.1)',
                      borderColor: step.borderHex,
                      borderWidth: '3px',
                      borderStyle: isPlaced ? 'solid' : 'dashed',
                      boxShadow: isPlaced ? `0 6px 0 ${step.borderHex}` : 'none',
                    }}
                  >
                    <span
                      className="text-3xl sm:text-4xl md:text-5xl font-black drop-shadow"
                      style={{ color: isPlaced ? step.textColor : 'rgba(255,255,255,0.7)' }}
                    >
                      {step.letter}
                    </span>
                    <span className="text-[9px] font-black mt-1 px-1.5 rounded-full bg-black/35 text-white">
                      {language === 'nl' ? step.nameNl : step.nameEn}
                    </span>
                    {isPlaced && (
                      <CheckCircle2 className="w-4 h-4 text-white absolute -top-1.5 -right-1.5 fill-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Victory Rainbow Wave */}
            {isRainbowComplete && (
              <div className="animate-pop-in flex flex-col items-center bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-5 py-2 rounded-2xl shadow-2xl border-2 border-white mt-2">
                <div className="flex items-center gap-2 text-sm sm:text-base font-black">
                  <span>🎉</span>
                  <span>
                    {language === 'nl'
                      ? 'Geweldig! De hele regenboog straalt!'
                      : 'Hooray! The entire rainbow is shining!'}
                  </span>
                  <span>🌈</span>
                </div>
                <button
                  onClick={() => {
                    setRainbowPlaced([false, false, false, false, false, false]);
                    setIsRainbowComplete(false);
                  }}
                  className="mt-1.5 px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm rounded-full shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none flex items-center gap-1 cursor-pointer transition-all animate-kid-bounce"
                >
                  <span>{language === 'nl' ? 'NOG EEN KEER SPELEN!' : 'PLAY AGAIN!'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
