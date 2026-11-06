import React, { useState, useEffect, useMemo } from 'react';
import { Language } from '../../types/game';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { triggerKidCheer } from '../CheerCelebration';
import AlphabetLoreAvatar from '../AlphabetLoreAvatar';
import {
  Sparkles,
  RefreshCw,
  Volume2,
  ChevronRight,
  Palette,
  CheckCircle2,
  Wand2,
  Sliders,
  Sun,
  Moon,
} from 'lucide-react';

interface ColorGradingGameProps {
  onEarnStar: () => void;
  onUnlockSticker?: (letter: string) => void;
  language: Language;
}

type GradingGameType = 'shade-sort' | 'rainbow-spectrum' | 'gradient-studio';

// Shade family definitions for Type 1: Shade Gradient Sort
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

// Rainbow spectrum steps for Type 2
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
  const [gameType, setGameType] = useState<GradingGameType>('shade-sort');

  // --- STATE FOR TYPE 1: Shade Gradient Sort ---
  const [shadeFamilyIndex, setShadeFamilyIndex] = useState<number>(0);
  const currentShadeFamily = SHADE_FAMILIES[shadeFamilyIndex % SHADE_FAMILIES.length];
  const [currentLetter, setCurrentLetter] = useState<string>('A');
  // Shuffled items for toddler to place into slots
  const [availableShades, setAvailableShades] = useState<{ id: string; stepIndex: number }[]>([]);
  // Placed shade cards in the target gradient rack: index 0 (lightest) to 3 (darkest)
  const [placedShades, setPlacedShades] = useState<(number | null)[]>([null, null, null, null]);
  const [isShadeComplete, setIsShadeComplete] = useState<boolean>(false);

  // --- STATE FOR TYPE 2: Rainbow Spectrum Run ---
  const [rainbowTargetIndex, setRainbowTargetIndex] = useState<number>(0);
  const [rainbowPlaced, setRainbowPlaced] = useState<boolean[]>([false, false, false, false, false, false]);
  const [isRainbowComplete, setIsRainbowComplete] = useState<boolean>(false);

  // --- STATE FOR TYPE 3: Gradient Studio ---
  const [studioLetter, setStudioLetter] = useState<string>('A');
  const [studioLoreMode, setStudioLoreMode] = useState<boolean>(false);
  const [selectedGradient, setSelectedGradient] = useState<string>(STUDIO_GRADIENTS[0].id);
  const [gradientAngle, setGradientAngle] = useState<number>(135);
  const [sparkleActive, setSparkleActive] = useState<boolean>(true);
  const hasIntroducedShadeRef = React.useRef<boolean>(false);

  // --- INITIALIZE TYPE 1 ---
  const setupShadeRound = (familyIdx: number, letterChar?: string) => {
    setIsShadeComplete(false);
    setPlacedShades([null, null, null, null]);
    const chosenLetter = letterChar || String.fromCharCode(65 + Math.floor(Math.random() * 26));
    setCurrentLetter(chosenLetter);

    // Shuffle 4 shade indices: [0, 1, 2, 3]
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

  useEffect(() => {
    if (gameType === 'shade-sort') {
      setupShadeRound(shadeFamilyIndex);
    } else if (gameType === 'rainbow-spectrum') {
      setRainbowPlaced([false, false, false, false, false, false]);
      setIsRainbowComplete(false);
      setRainbowTargetIndex(0);
      sounds.speak(
        language === 'nl'
          ? 'Regenboog letters!'
          : 'Rainbow letters!',
        language
      );
    } else if (gameType === 'gradient-studio') {
      sounds.speak(
        language === 'nl'
          ? 'Kleur & Gradiënt Studio!'
          : 'Color & Gradient Studio!',
        language
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameType]);

  // Toddler taps an available shade card to place into next empty slot
  const handleSelectShadeCard = (item: { id: string; stepIndex: number }) => {
    if (isShadeComplete) return;

    // Find next empty target slot
    const emptySlotIdx = placedShades.findIndex((s) => s === null);
    if (emptySlotIdx === -1) return;

    // Check if item is already placed
    if (placedShades.includes(item.stepIndex)) return;

    const nextPlaced = [...placedShades];
    nextPlaced[emptySlotIdx] = item.stepIndex;
    setPlacedShades(nextPlaced);

    // Sound chime based on shade intensity
    sounds.playColorChime((item.stepIndex + 1) / 4);

    const isAllPlaced = nextPlaced.every((s) => s !== null);

    // Only speak the intermediate step label if not yet finishing the puzzle
    if (!isAllPlaced) {
      const stepInfo = currentShadeFamily.steps[item.stepIndex];
      const stepLabel = language === 'nl' ? stepInfo.labelNl : stepInfo.labelEn;
      sounds.speak(stepLabel, language);
    } else {
      // Check if sorted in order: 0, 1, 2, 3
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
        if (onUnlockSticker) onUnlockSticker(currentLetter);

        const famName = language === 'nl' ? currentShadeFamily.nameNl : currentShadeFamily.nameEn;
        const msg =
          language === 'nl'
            ? `Super! ${famName} gesorteerd!`
            : `Awesome! ${famName} sorted!`;
        sounds.speak(msg, language);
      } else {
        sounds.playBoing();
        sounds.speak(
          language === 'nl'
            ? 'Bijna!'
            : 'Almost!',
          language
        );
      }
    }
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

  // --- TYPE 2: Rainbow Spectrum Placement ---
  const handlePlaceRainbowLetter = (idx: number) => {
    if (rainbowPlaced[idx]) return;

    const step = RAINBOW_SPECTRUM[idx];
    sounds.playColorChime(step.soundRatio);

    const nextPlaced = [...rainbowPlaced];
    nextPlaced[idx] = true;
    setRainbowPlaced(nextPlaced);

    const colorName = language === 'nl' ? step.nameNl : step.nameEn;
    sounds.speak(`${step.letter}! ${colorName}!`, language);

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
        language === 'nl'
          ? 'Magische regenboog!'
          : 'Magical rainbow!',
        language
      );
    }
  };

  // Active studio gradient object
  const activeStudioGrad = useMemo(() => {
    return STUDIO_GRADIENTS.find((g) => g.id === selectedGradient) || STUDIO_GRADIENTS[0];
  }, [selectedGradient]);

  const studioGradientCss = useMemo(() => {
    const stopsJoined = activeStudioGrad.stops.join(', ');
    return `linear-gradient(${gradientAngle}deg, ${stopsJoined})`;
  }, [activeStudioGrad, gradientAngle]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-2 sm:p-3 rounded-3xl bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-950 text-white overflow-y-auto overflow-x-hidden scrollbar-none select-none">
      {/* Background Floating Color Sparks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-4 left-6 text-3xl animate-bounce">🎨</div>
        <div className="absolute top-12 right-8 text-3xl animate-pulse">✨</div>
        <div className="absolute bottom-8 left-12 text-3xl animate-kid-float">🌈</div>
        <div className="absolute bottom-16 right-16 text-3xl animate-spin">🌟</div>
      </div>

      {/* Top Controls: 3 Game Type Tabs & Language Notice */}
      <div className="relative z-10 w-full max-w-4xl flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 bg-black/25 backdrop-blur-md px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl border border-white/20">
        {/* Game Type Selector Pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 max-w-full">
          {[
            { id: 'shade-sort' as const, labelNl: '📶 Licht & Donker', labelEn: '📶 Shade Sort' },
            { id: 'rainbow-spectrum' as const, labelNl: '🌈 Regenboog ABC', labelEn: '🌈 Rainbow ABC' },
            { id: 'gradient-studio' as const, labelNl: '🎨 Kleur Studio', labelEn: '🎨 Gradient Studio' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playPop();
                setGameType(tab.id);
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                gameType === tab.id
                  ? 'bg-amber-400 text-amber-950 shadow-md scale-105'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {language === 'nl' ? tab.labelNl : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Quick Action Button for current game type */}
        <div className="flex items-center gap-1.5">
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
              <span className="hidden sm:inline">{language === 'nl' ? 'Nieuwe Kleur' : 'Next Color'}</span>
            </button>
          )}

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
              <span className="hidden sm:inline">{language === 'nl' ? 'Herstel' : 'Reset'}</span>
            </button>
          )}

          {gameType === 'gradient-studio' && (
            <button
              onClick={() => {
                sounds.playPop();
                setStudioLoreMode(!studioLoreMode);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 cursor-pointer transition-all ${
                studioLoreMode
                  ? 'bg-purple-500 text-white ring-2 ring-amber-300'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <span>👾</span>
              <span className="hidden sm:inline">Alphabet Lore</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TYPE 1: SHADE GRADIENT SORT (Licht naar Donker) */}
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
                  ? `Zet de ${currentLetter} van licht naar donker in ${famName}!`
                  : `Sort ${currentLetter} from light to dark in ${famName}!`,
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
                    disabled={!hasCard || isShadeComplete}
                    className={`relative w-16 h-22 sm:w-20 sm:h-28 md:w-24 md:h-32 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center transition-all duration-300 select-none ${
                      hasCard
                        ? 'cursor-pointer active:scale-95 shadow-xl rotate-0'
                        : 'border-2 sm:border-3 border-dashed border-white/40 bg-white/10'
                    }`}
                    style={
                      hasCard
                        ? {
                            backgroundColor: step!.bgHex,
                            borderColor: step!.borderHex,
                            borderWidth: '3px',
                            borderStyle: 'solid',
                            boxShadow: `0 6px 0 ${step!.borderHex}`,
                          }
                        : {}
                    }
                  >
                    {hasCard ? (
                      <div className="flex flex-col items-center justify-center animate-pop-in">
                        <span
                          className="text-4xl sm:text-5xl md:text-6xl font-black drop-shadow-md"
                          style={{ color: step!.textColor }}
                        >
                          {currentLetter}
                        </span>
                        <span
                          className="text-[9px] sm:text-[10px] font-black mt-1 px-1.5 py-0.5 rounded-full bg-black/30 text-white"
                        >
                          {language === 'nl' ? step!.labelNl : step!.labelEn}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center opacity-40">
                        <span className="text-xl sm:text-2xl font-black">{slotIdx + 1}</span>
                        <span className="text-[9px] font-bold">
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
                    <div className="absolute -top-2 -left-2 bg-black/60 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-white/50">
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

          {/* Shuffled Letter Cards to Choose From (Bottom Pool) */}
          <div className="w-full max-w-2xl bg-black/35 backdrop-blur-md rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 border-2 border-white/20 flex flex-col items-center flex-shrink-0 mt-2">
            <div className="text-[11px] sm:text-xs font-black text-white/90 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {language === 'nl'
                  ? 'Kies de juiste tint en zet hem op de plank:'
                  : 'Pick the shade and place it on the rack:'}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {availableShades.map((item) => {
                const step = currentShadeFamily.steps[item.stepIndex];
                const isPlaced = placedShades.includes(item.stepIndex);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectShadeCard(item)}
                    disabled={isPlaced || isShadeComplete}
                    className={`relative w-15 h-20 sm:w-18 sm:h-24 rounded-2xl flex flex-col items-center justify-center font-black transition-all duration-200 cursor-pointer shadow-lg active:scale-90 ${
                      isPlaced
                        ? 'opacity-20 pointer-events-none scale-90 translate-y-2'
                        : 'hover:scale-105 active:translate-y-1'
                    }`}
                    style={{
                      backgroundColor: step.bgHex,
                      borderColor: step.borderHex,
                      borderWidth: '3px',
                      borderStyle: 'solid',
                      boxShadow: `0 5px 0 ${step.borderHex}`,
                    }}
                  >
                    <span
                      className="text-3xl sm:text-4xl font-black drop-shadow"
                      style={{ color: step.textColor }}
                    >
                      {currentLetter}
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-black px-1 rounded bg-black/25 text-white mt-0.5">
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
      {/* TYPE 2: RAINBOW SPECTRUM RUN (Regenboog Spectrum) */}
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

          {/* Quick letter prompt help */}
          <div className="text-center text-xs text-white/80 my-2">
            <span>
              {language === 'nl'
                ? '💡 Wist je dat: Rood, Oranje, Geel, Groen, Blauw en Paars de kleuren van de regenboog zijn!'
                : '💡 Fun fact: Red, Orange, Yellow, Green, Blue and Purple are the colors of the rainbow!'}
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TYPE 3: GRADIENT COLORING STUDIO (Kleur & Gradiënt Studio) */}
      {/* ========================================================================= */}
      {gameType === 'gradient-studio' && (
        <div className="relative z-10 w-full max-w-4xl flex-1 flex flex-col items-center justify-between my-1 sm:my-auto overflow-y-auto scrollbar-none">
          {/* Main Studio Canvas */}
          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-3 p-3 bg-black/25 backdrop-blur-sm rounded-3xl border-2 border-white/20">
            {/* Left: The Letter Colored with Gradients */}
            <div className="flex flex-col items-center justify-center">
              <div
                className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-3xl flex items-center justify-center border-4 border-white shadow-2xl transition-all duration-300 overflow-hidden"
                style={{
                  background: studioGradientCss,
                  boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                }}
              >
                {/* Sparkle stars overlay */}
                {sparkleActive && (
                  <div className="absolute inset-0 pointer-events-none opacity-40 animate-pulse">
                    <span className="absolute top-3 left-4 text-xl">✨</span>
                    <span className="absolute top-6 right-6 text-xl">🌟</span>
                    <span className="absolute bottom-5 left-8 text-xl">⭐</span>
                    <span className="absolute bottom-6 right-6 text-xl">✨</span>
                  </div>
                )}

                {/* Styled Letter or Alphabet Lore Avatar */}
                {studioLoreMode ? (
                  <div className="scale-125 drop-shadow-2xl">
                    <AlphabetLoreAvatar
                      letter={studioLetter}
                      size="lg"
                      interactive={true}
                      language={language}
                    />
                  </div>
                ) : (
                  <span
                    className="text-8xl sm:text-9xl md:text-[110px] font-black text-white filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] select-none animate-kid-bounce"
                    style={{ WebkitTextStroke: '3px rgba(255,255,255,0.4)' }}
                  >
                    {studioLetter}
                  </span>
                )}

                {/* Gradient angle badge */}
                <div className="absolute bottom-2 right-2 bg-black/60 text-white font-mono text-[10px] px-2 py-0.5 rounded-full border border-white/30">
                  {gradientAngle}°
                </div>
              </div>

              {/* Angle slider */}
              <div className="flex items-center gap-2 mt-2 w-full max-w-xs">
                <span className="text-[10px] text-white/80 font-bold">Angle:</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={gradientAngle}
                  onChange={(e) => setGradientAngle(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <span className="text-[10px] font-bold text-amber-300 w-8">{gradientAngle}°</span>
              </div>
            </div>

            {/* Right: Palette Choices & Letter Selector */}
            <div className="flex-1 flex flex-col items-center md:items-start gap-2.5 max-w-md w-full">
              {/* Palette Choices */}
              <div className="w-full">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1 mb-1">
                  <Palette className="w-3.5 h-3.5" />
                  <span>
                    {language === 'nl' ? 'Kies een kleurgradiënt:' : 'Pick a color gradient:'}
                  </span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 w-full">
                  {STUDIO_GRADIENTS.map((grad) => (
                    <button
                      key={grad.id}
                      onClick={() => {
                        sounds.playColorChime(0.6);
                        setSelectedGradient(grad.id);
                        sounds.speak(language === 'nl' ? grad.nameNl : grad.nameEn, language);
                      }}
                      className={`h-11 rounded-xl p-1 flex items-center justify-center font-black text-xs text-white shadow-md cursor-pointer transition-all border-2 ${
                        selectedGradient === grad.id
                          ? 'border-white scale-105 ring-2 ring-amber-400'
                          : 'border-white/30 hover:scale-102 opacity-85 hover:opacity-100'
                      }`}
                      style={{ background: grad.css }}
                    >
                      <span className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-[11px] text-center">
                        {language === 'nl' ? grad.nameNl : grad.nameEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Letter Chooser A to Z */}
              <div className="w-full">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'nl' ? 'Kies een letter (A-Z):' : 'Pick a letter (A-Z):'}</span>
                </span>
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 max-w-full">
                  {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((char) => (
                    <button
                      key={char}
                      onClick={() => {
                        sounds.playPop();
                        setStudioLetter(char);
                        sounds.speak(char, language);
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm transition-all cursor-pointer flex-shrink-0 ${
                        studioLetter === char
                          ? 'bg-amber-400 text-amber-950 shadow-md scale-110 font-black'
                          : 'bg-white/20 hover:bg-white/30 text-white'
                      }`}
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions: Reward / Celebrate / Sparkle Toggle */}
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => {
                    sounds.playCheer();
                    sounds.playSparkle();
                    fireConfettiBurst('rainbow');
                    onEarnStar();
                    if (onUnlockSticker) onUnlockSticker(studioLetter);
                    sounds.speak(
                      language === 'nl'
                        ? `Prachtige gradiënt voor letter ${studioLetter}!`
                        : `Beautiful gradient on letter ${studioLetter}!`,
                      language
                    );
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs sm:text-sm rounded-full shadow-[0_4px_0_#065f46] active:translate-y-1 active:shadow-none flex items-center gap-1.5 cursor-pointer transition-transform"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>{language === 'nl' ? 'Opslaan & Ster! 🌟' : 'Save & Earn Star! 🌟'}</span>
                </button>

                <button
                  onClick={() => setSparkleActive(!sparkleActive)}
                  className={`px-3 py-2 rounded-full text-xs font-black flex items-center gap-1 cursor-pointer transition-all ${
                    sparkleActive
                      ? 'bg-yellow-400 text-yellow-950 shadow-sm'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <span>✨</span>
                  <span>{language === 'nl' ? 'Glitter' : 'Glitter'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
