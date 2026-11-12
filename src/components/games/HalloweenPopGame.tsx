import React, { useState, useEffect, useRef } from 'react';
import { ALPHABET_DATA, getLetterWord, getLetterEmoji } from '../../data/alphabetData';
import { LetterInfo, Language, LetterStyleOption } from '../../types/game';
import AlphabetLoreAvatar from '../AlphabetLoreAvatar';
import LetterAvatar from '../LetterAvatar';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { triggerKidCheer } from '../CheerCelebration';
import { Sparkles, Volume2, RefreshCw, Moon, Star, Wand2 } from 'lucide-react';

interface HalloweenPopGameProps {
  onEarnStar: () => void;
  onUnlockSticker?: (letter: string) => void;
  language: Language;
}

type HalloweenCreatureType = 'pumpkin' | 'ghost' | 'bat' | 'spider' | 'candy' | 'cauldron';

interface HalloweenPopItem {
  id: number;
  letter: LetterInfo;
  type: HalloweenCreatureType;
  x: number; // percentage (8 to 88)
  y: number; // pixels from top
  speed: number;
  size: number;
  sway: number;
  swaySpeed: number;
  isSpecialGolden?: boolean;
}

const CREATURE_CONFIGS: {
  [key in HalloweenCreatureType]: {
    emoji: string;
    nameNl: string;
    nameEn: string;
    bgGradient: string;
    border: string;
    shadow: string;
  };
} = {
  pumpkin: {
    emoji: '🎃',
    nameNl: 'Pompoen',
    nameEn: 'Pumpkin',
    bgGradient: 'radial-gradient(circle at 35% 35%, #fb923c, #ea580c, #9a3412)',
    border: '#fdba74',
    shadow: '0 8px 18px rgba(234,88,12,0.45)',
  },
  ghost: {
    emoji: '👻',
    nameNl: 'Spookje',
    nameEn: 'Ghost',
    bgGradient: 'radial-gradient(circle at 35% 35%, #ffffff, #f1f5f9, #cbd5e1)',
    border: '#e2e8f0',
    shadow: '0 8px 18px rgba(255,255,255,0.4)',
  },
  bat: {
    emoji: '🦇',
    nameNl: 'Vleermuis',
    nameEn: 'Bat',
    bgGradient: 'radial-gradient(circle at 35% 35%, #818cf8, #4f46e5, #312e81)',
    border: '#a5b4fc',
    shadow: '0 8px 18px rgba(79,70,229,0.45)',
  },
  spider: {
    emoji: '🕷️',
    nameNl: 'Spinnetje',
    nameEn: 'Spider',
    bgGradient: 'radial-gradient(circle at 35% 35%, #a855f7, #7e22ce, #3b0764)',
    border: '#d8b4fe',
    shadow: '0 8px 18px rgba(126,34,206,0.45)',
  },
  candy: {
    emoji: '🍬',
    nameNl: 'Snoepje',
    nameEn: 'Candy',
    bgGradient: 'radial-gradient(circle at 35% 35%, #f472b6, #e11d48, #9f1239)',
    border: '#fbcfe8',
    shadow: '0 8px 18px rgba(225,29,72,0.45)',
  },
  cauldron: {
    emoji: '🫕',
    nameNl: 'Toverketel',
    nameEn: 'Cauldron',
    bgGradient: 'radial-gradient(circle at 35% 35%, #4ade80, #16a34a, #052e16)',
    border: '#86efac',
    shadow: '0 8px 18px rgba(22,163,74,0.45)',
  },
};

const CREATURE_TYPES: HalloweenCreatureType[] = [
  'pumpkin',
  'ghost',
  'bat',
  'spider',
  'candy',
  'cauldron',
];

export default function HalloweenPopGame({
  onEarnStar,
  onUnlockSticker,
  language,
}: HalloweenPopGameProps) {
  const [mode, setMode] = useState<'free' | 'target'>('free');
  const [letterStyle, setLetterStyle] = useState<LetterStyleOption>('lore');
  const [targetLetter, setTargetLetter] = useState<LetterInfo>(ALPHABET_DATA[0]);
  const [creatures, setCreatures] = useState<HalloweenPopItem[]>([]);
  const [popScore, setPopScore] = useState<number>(0);
  const [popups, setPopups] = useState<
    { id: number; x: number; y: number; text: string; emoji: string }[]
  >([]);

  const nextIdRef = useRef<number>(1);
  const audioLockedRef = useRef<boolean>(false);

  // Pick random target letter for Quest mode
  const pickNewTarget = () => {
    const randomTarget = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
    setTargetLetter(randomTarget);
    const word = language === 'nl' ? randomTarget.wordNl || randomTarget.word : randomTarget.word;
    sounds.speak(
      language === 'nl'
        ? `Zoek en plop de letter ${randomTarget.letter} van ${word}!`
        : `Find and pop letter ${randomTarget.letter} for ${word}!`,
      language
    );
  };

  // Spawn initial creatures
  useEffect(() => {
    let animId: number;
    let lastSpawn = Date.now();

    const spawnCreature = () => {
      const randomLetter = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
      const randomType = CREATURE_TYPES[Math.floor(Math.random() * CREATURE_TYPES.length)];
      const isSpecial = Math.random() < 0.15;

      const newCreature: HalloweenPopItem = {
        id: nextIdRef.current++,
        letter: randomLetter,
        type: randomType,
        x: 10 + Math.random() * 78,
        y: window.innerHeight * 0.9 + Math.random() * 80,
        speed: 1.2 + Math.random() * 1.5,
        size: 92,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.02,
        isSpecialGolden: isSpecial,
      };

      setCreatures((prev) => [...prev.slice(-14), newCreature]);
    };

    // Initial fill of 5 creatures
    for (let i = 0; i < 5; i++) {
      const randomLetter = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
      const randomType = CREATURE_TYPES[i % CREATURE_TYPES.length];

      setCreatures((prev) => [
        ...prev,
        {
          id: nextIdRef.current++,
          letter: randomLetter,
          type: randomType,
          x: 10 + i * 16 + Math.random() * 6,
          y: window.innerHeight * 0.35 + i * 85,
          speed: 1.2 + Math.random() * 1.4,
          size: 92,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: 0.025,
        },
      ]);
    }

    const loop = () => {
      const now = Date.now();
      if (now - lastSpawn > 1200 && creatures.length < 9) {
        spawnCreature();
        lastSpawn = now;
      }

      setCreatures((prev) =>
        prev
          .map((c) => ({
            ...c,
            y: c.y - c.speed,
            sway: c.sway + c.swaySpeed,
          }))
          .filter((c) => c.y > -180)
      );

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Multi-touch popping handler
  const handlePop = (
    item: HalloweenPopItem,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    sounds.playPop();

    let clientX = window.innerWidth * (item.x / 100);
    let clientY = item.y;
    if ('changedTouches' in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    // Creature & Letter details - letter A links to Appel/Apple with apple emoji
    const cfg = CREATURE_CONFIGS[item.type];
    const letterWord = getLetterWord(item.letter, language);
    const letterEmoji = getLetterEmoji(item.letter, language);

    // Visual burst popup with the word's emoji and name
    const popupId = Date.now();
    setPopups((prev) => [
      ...prev,
      {
        id: popupId,
        x: clientX,
        y: clientY,
        text: `${item.letter.letter}! ${letterWord}`,
        emoji: letterEmoji,
      },
    ]);
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== popupId));
    }, 1100);

    // Remove popped creature
    setCreatures((prev) => prev.filter((c) => c.id !== item.id));
    setPopScore((s) => s + 1);

    // Special golden burst
    if (item.isSpecialGolden) {
      sounds.playSparkle();
      fireConfettiBurst('halloween');
      triggerKidCheer({
        message: language === 'nl' ? '🎃 GOUDEN SPOOKJE!' : '🎃 GOLDEN SPOOK!',
        emoji: '🎃',
      });
      onEarnStar();
      sounds.speak(language === 'nl' ? 'Gouden magie!' : 'Golden magic!', language);
      return;
    }

    // Quest mode check
    if (mode === 'target') {
      if (item.letter.letter === targetLetter.letter) {
        // Success match!
        sounds.playTada();
        sounds.playSparkle();
        fireConfettiBurst('halloween');
        triggerKidCheer({
          message: language === 'nl' ? 'GOED GEPLOPT!' : 'GREAT POP!',
          emoji: letterEmoji,
        });
        onEarnStar();
        if (onUnlockSticker) onUnlockSticker(item.letter.letter);

        const cheerMsg =
          language === 'nl'
            ? `Super! ${item.letter.letter} van ${letterWord}!`
            : `Great! ${item.letter.letter} for ${letterWord}!`;
        sounds.speak(cheerMsg, language);

        setTimeout(() => {
          pickNewTarget();
        }, 1600);
      } else {
        // Soft giggle on other creature
        sounds.playGhost();
        const otherMsg =
          language === 'nl'
            ? `${item.letter.letter} van ${letterWord}!`
            : `${item.letter.letter} for ${letterWord}!`;
        sounds.speak(otherMsg, language);
      }
    } else {
      // Free play mode: soft giggle or pop + letter
      if (!audioLockedRef.current) {
        audioLockedRef.current = true;
        const freeMsg =
          language === 'nl'
            ? `${item.letter.letter} van ${letterWord}!`
            : `${item.letter.letter} for ${letterWord}!`;
        sounds.speak(freeMsg, language);
        setTimeout(() => {
          audioLockedRef.current = false;
        }, 800);
      }
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-2 sm:p-3 rounded-3xl bg-gradient-to-b from-purple-950 via-indigo-950 to-slate-950 text-white overflow-hidden select-none touch-manipulation">
      {/* Halloween Night Sky Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
        <div className="absolute top-6 left-10 text-4xl animate-bounce">🌕</div>
        <div className="absolute top-16 right-12 text-3xl animate-pulse">🦇</div>
        <div className="absolute bottom-10 left-16 text-3xl animate-kid-float">👻</div>
        <div className="absolute bottom-20 right-20 text-3xl animate-spin">🕸️</div>
        {/* Subtle glowing stars */}
        <div className="absolute top-1/4 left-1/2 text-xl animate-pulse">✨</div>
        <div className="absolute top-1/3 right-1/4 text-2xl animate-pulse">🌟</div>
      </div>

      {/* Top Header Bar: Mode & Letter Style Switches */}
      <div className="relative z-20 w-full max-w-4xl flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 bg-black/35 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-purple-500/30 shadow-lg">
        {/* Free Pop vs Letter Quest Mode */}
        <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-full border border-white/20">
          <button
            onClick={() => {
              setMode('free');
              sounds.playPop();
            }}
            className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
              mode === 'free'
                ? 'bg-amber-400 text-amber-950 shadow-md scale-105'
                : 'text-white/80 hover:text-white'
            }`}
          >
            🎃 {language === 'nl' ? 'Vrij Ploppen' : 'Free Pop'}
          </button>

          <button
            onClick={() => {
              setMode('target');
              sounds.playPop();
              pickNewTarget();
            }}
            className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
              mode === 'target'
                ? 'bg-amber-400 text-amber-950 shadow-md scale-105'
                : 'text-white/80 hover:text-white'
            }`}
          >
            🎯 {language === 'nl' ? 'Spookjes Zoektocht' : 'Letter Quest'}
          </button>
        </div>

        {/* Normal vs Alphabet Lore Style Switch */}
        <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-full border border-white/20">
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

        {/* Popped score counter */}
        <div className="flex items-center gap-1.5 bg-purple-900/60 px-3 py-1 rounded-full border border-purple-400/30 text-xs font-black text-amber-300">
          <span>🎃</span>
          <span>{popScore} {language === 'nl' ? 'Geplopt' : 'Popped'}</span>
        </div>
      </div>

      {/* Target Letter Header Banner for Quest Mode */}
      {mode === 'target' ? (
        <div
          onClick={() => {
            sounds.playBoing();
            const word =
              language === 'nl'
                ? targetLetter.wordNl || targetLetter.word
                : targetLetter.word;
            sounds.speak(
              language === 'nl'
                ? `Plop de letter ${targetLetter.letter} van ${word}!`
                : `Pop the letter ${targetLetter.letter} for ${word}!`,
              language
            );
          }}
          className="relative z-20 flex items-center gap-3 bg-purple-900/80 backdrop-blur-md px-5 py-2 rounded-2xl border-2 border-amber-400 shadow-xl cursor-pointer active:scale-95 transition-transform animate-pulse-glow my-1"
        >
          <span className="text-sm sm:text-base font-black text-amber-300 drop-shadow">
            {language === 'nl' ? 'Zoek & Plop de Letter:' : 'Find & Pop Letter:'}
          </span>
          <span
            className="text-3xl sm:text-4xl font-black px-3.5 py-1 rounded-2xl text-white shadow-md border-2 border-white"
            style={{ backgroundColor: targetLetter.color }}
          >
            {targetLetter.letter}
          </span>
          <span className="text-3xl animate-bounce">{getLetterEmoji(targetLetter, language)}</span>
        </div>
      ) : (
        <div className="relative z-20 text-white/90 text-xs sm:text-sm font-extrabold drop-shadow text-center my-1 bg-black/25 px-4 py-1 rounded-full border border-white/10">
          {language === 'nl'
            ? 'Tik op de zwevende spookjes en pompoenen om letters te leren! 🎃👻✨'
            : 'Tap the floating ghosts and pumpkins to hear the letters! 🎃👻✨'}
        </div>
      )}

      {/* Floating Halloween Creatures Playfield (MULTI-TOUCH SUPPORTED) */}
      <div className="absolute inset-0 pointer-events-auto overflow-hidden">
        {creatures.map((c) => {
          const cfg = CREATURE_CONFIGS[c.type];
          const swayX = Math.sin(c.sway) * 24;

          return (
            <div
              key={c.id}
              onClick={(e) => handlePop(c, e)}
              onTouchStart={(e) => {
                e.preventDefault();
                handlePop(c, e);
              }}
              style={{
                left: `${c.x}%`,
                top: `${c.y}px`,
                transform: `translateX(${swayX}px)`,
                width: `${c.size}px`,
                height: `${c.size * 1.25}px`,
              }}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 active:scale-90"
            >
              {/* Halloween Character Body Container */}
              <div
                style={{
                  background: c.isSpecialGolden
                    ? 'radial-gradient(circle at 35% 35%, #fde047, #f59e0b, #b45309)'
                    : cfg.bgGradient,
                  borderColor: cfg.border,
                  borderWidth: '3px',
                  borderStyle: 'solid',
                  boxShadow: cfg.shadow,
                }}
                className={`relative w-full h-[85%] rounded-[48%_48%_44%_44%] flex flex-col items-center justify-center text-white transition-transform ${
                  c.isSpecialGolden ? 'animate-pulse ring-4 ring-amber-300' : ''
                }`}
              >
                {/* Creature Head Emoji / Character Icon */}
                <div className="absolute -top-3 inset-x-0 mx-auto w-max text-2xl drop-shadow animate-kid-float pointer-events-none">
                  {cfg.emoji}
                </div>

                {/* Letter Presentation: Normal or Alphabet Lore */}
                <div className="flex flex-col items-center justify-center mt-1 pointer-events-none">
                  {letterStyle === 'lore' ? (
                    <div className="scale-90 drop-shadow-md">
                      <AlphabetLoreAvatar
                        letter={c.letter.letter}
                        size="md"
                        interactive={false}
                        asDiv={true}
                      />
                    </div>
                  ) : (
                    <span
                      className="text-4xl sm:text-5xl font-black drop-shadow-lg text-white"
                      style={{
                        WebkitTextStroke: '2px rgba(0,0,0,0.4)',
                        textShadow: '0 4px 8px rgba(0,0,0,0.5)',
                      }}
                    >
                      {c.letter.letter}
                    </span>
                  )}

                  {/* Character Name Label */}
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-black/40 text-white mt-0.5">
                    {language === 'nl' ? cfg.nameNl : cfg.nameEn}
                  </span>
                </div>

                {/* Floating shine dot */}
                <div className="absolute top-2 left-2.5 w-3.5 h-5 bg-white/40 rounded-full rotate-25 pointer-events-none" />
              </div>

              {/* Spider silk or hanging string */}
              {c.type === 'spider' && (
                <div className="absolute top-0 left-1/2 w-0.5 h-16 bg-white/30 -translate-y-full pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Animated Pop Score / Text Bursts */}
      {popups.map((p) => (
        <div
          key={p.id}
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
          }}
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 animate-float-text flex items-center gap-1.5 bg-amber-400 text-amber-950 font-black text-sm sm:text-base px-3 py-1.5 rounded-2xl shadow-2xl border-2 border-white"
        >
          <span className="text-xl">{p.emoji}</span>
          <span>{p.text}</span>
          <span>✨</span>
        </div>
      ))}

      {/* Bottom Hint Footer */}
      <div className="relative z-20 w-full flex items-center justify-between text-xs text-white/75 font-bold px-3 py-1">
        <span>
          {language === 'nl'
            ? '🎃 Plop pompoenen, spookjes & vleermuizen met meerdere vingers tegelijk!'
            : '🎃 Pop pumpkins, ghosts & bats with multiple fingers at once!'}
        </span>
        <button
          onClick={() => {
            sounds.playSpookyBoo();
            fireConfettiBurst('halloween');
          }}
          className="text-amber-300 hover:text-white flex items-center gap-1 cursor-pointer bg-white/10 px-2.5 py-0.5 rounded-full"
        >
          <span>👻</span>
          <span>{language === 'nl' ? 'Boe!' : 'Boo!'}</span>
        </button>
      </div>
    </div>
  );
}
