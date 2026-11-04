import React, { useState, useEffect, useRef } from 'react';
import { DUTCH_WORLD_WORDS, ALPHABET_DATA } from '../../data/alphabetData';
import { WordItem, Language } from '../../types/game';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { Sparkles, Trophy, RefreshCw, Wind } from 'lucide-react';

interface FallingAutumnItem {
  id: number;
  wordItem: WordItem;
  x: number; // percentage (10 - 85)
  y: number; // px from top
  speed: number;
  size: number;
  sway: number;
  swaySpeed: number;
  rotation: number;
  rotSpeed: number;
  isSpecialGolden?: boolean;
}

interface AutumnLeavesGameProps {
  onEarnStar: () => void;
  onUnlockSticker?: (letter: string) => void;
  language: Language;
}

export default function AutumnLeavesGame({
  onEarnStar,
  onUnlockSticker,
  language,
}: AutumnLeavesGameProps) {
  const [items, setItems] = useState<FallingAutumnItem[]>([]);
  const [mode, setMode] = useState<'free' | 'target'>('free');
  const [targetItem, setTargetItem] = useState<WordItem>(
    DUTCH_WORLD_WORDS.find((w) => w.category === 'autumn') || DUTCH_WORLD_WORDS[0]
  );
  const [popups, setPopups] = useState<
    { id: number; x: number; y: number; text: string; color: string }[]
  >([]);
  const [basketCount, setBasketCount] = useState<number>(0);
  const nextIdRef = useRef(1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const autumnWords = DUTCH_WORLD_WORDS.filter((w) => w.category === 'autumn');

  // Choose target for Quest mode
  useEffect(() => {
    if (mode === 'target') {
      const random = autumnWords[Math.floor(Math.random() * autumnWords.length)];
      setTargetItem(random);
      if (language === 'nl') {
        sounds.speak(`Vang ${random.articleNl} ${random.nl}!`, 'nl');
      } else {
        sounds.speak(`Catch the ${random.en}!`, 'en');
      }
    } else {
      if (language === 'nl') {
        sounds.speak('Vang de herfstblaadjes en eikeltjes in de mand!', 'nl');
      } else {
        sounds.speak('Catch the falling autumn leaves and acorns in the basket!', 'en');
      }
    }
  }, [mode, language]);

  // Falling Items Physics & Spawner
  useEffect(() => {
    let animId: number;
    let lastSpawn = Date.now();

    const spawnItem = () => {
      const randomWord = autumnWords[Math.floor(Math.random() * autumnWords.length)];
      const isSpecialGolden = Math.random() < 0.15;

      const newItem: FallingAutumnItem = {
        id: nextIdRef.current++,
        wordItem: randomWord,
        x: 8 + Math.random() * 80,
        y: -50,
        speed: 1.1 + Math.random() * 1.3,
        size: 75 + Math.random() * 20,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.03,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 4,
        isSpecialGolden,
      };

      setItems((prev) => [...prev.slice(-14), newItem]);
    };

    // Initial fill
    for (let i = 0; i < 5; i++) {
      const randomWord = autumnWords[Math.floor(Math.random() * autumnWords.length)];
      setItems((prev) => [
        ...prev,
        {
          id: nextIdRef.current++,
          wordItem: randomWord,
          x: 10 + i * 18 + Math.random() * 5,
          y: i * 80 + 30,
          speed: 1.2 + Math.random() * 1.2,
          size: 80,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: 0.025,
          rotation: Math.random() * 360,
          rotSpeed: 1.5,
        },
      ]);
    }

    const loop = () => {
      const now = Date.now();
      if (now - lastSpawn > 1200 && items.length < 8) {
        spawnItem();
        lastSpawn = now;
      }

      setItems((prev) =>
        prev
          .map((item) => ({
            ...item,
            y: item.y + item.speed,
            sway: item.sway + item.swaySpeed,
            rotation: item.rotation + item.rotSpeed,
          }))
          .filter((item) => item.y < window.innerHeight + 100)
      );

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleCatchItem = (
    item: FallingAutumnItem,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    sounds.playRustle();

    let clientX = window.innerWidth * (item.x / 100);
    let clientY = item.y;
    if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    setBasketCount((prev) => prev + 1);

    // Text popup
    const popupId = Date.now();
    const wordLabel = language === 'nl' ? item.wordItem.nl : item.wordItem.en;
    setPopups((prev) => [
      ...prev,
      {
        id: popupId,
        x: clientX,
        y: clientY,
        text: `${item.wordItem.emoji} ${wordLabel}!`,
        color: item.wordItem.color,
      },
    ]);
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== popupId));
    }, 1100);

    // Remove caught item
    setItems((prev) => prev.filter((i) => i.id !== item.id));

    if (item.isSpecialGolden) {
      sounds.playCheer();
      fireConfettiBurst(clientX, clientY, 'autumn');
      onEarnStar();
      if (language === 'nl') {
        sounds.speak('Gouden herfstmagie! Wat een mooie vondst!', 'nl');
      } else {
        sounds.speak('Golden autumn magic! Beautiful catch!', 'en');
      }
      return;
    }

    if (mode === 'target') {
      if (item.wordItem.id === targetItem.id) {
        sounds.playChime();
        fireConfettiBurst(clientX, clientY, 'autumn');
        onEarnStar();

        if (language === 'nl') {
          sounds.speak(
            `Geweldig! Je hebt ${item.wordItem.articleNl} ${item.wordItem.nl} gevangen!`,
            'nl'
          );
        } else {
          sounds.speak(`Awesome! You caught the ${item.wordItem.en}!`, 'en');
        }

        // Pick next target
        const newTarget = autumnWords[Math.floor(Math.random() * autumnWords.length)];
        setTargetItem(newTarget);
        setTimeout(() => {
          if (language === 'nl') {
            sounds.speak(`Vang nu ${newTarget.articleNl} ${newTarget.nl}!`, 'nl');
          } else {
            sounds.speak(`Now catch the ${newTarget.en}!`, 'en');
          }
        }, 1300);
      } else {
        sounds.playBoing();
        if (language === 'nl') {
          sounds.speak(
            `Dat is ${item.wordItem.articleNl} ${item.wordItem.nl}. Vang ${targetItem.articleNl} ${targetItem.nl}!`,
            'nl'
          );
        } else {
          sounds.speak(
            `That's ${item.wordItem.en}. Catch the ${targetItem.en}!`,
            'en'
          );
        }
      }
    } else {
      // Free catch mode
      const spokenName = language === 'nl' ? item.wordItem.nl : item.wordItem.en;
      sounds.speak(`${spokenName}! ${item.wordItem.soundCue || ''}`, language);
      if (Math.random() < 0.25) {
        onEarnStar();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden flex flex-col justify-between select-none bg-gradient-to-b from-amber-200 via-orange-300 to-amber-700"
    >
      {/* Autumn Trees & Cozy Background Elements */}
      <div className="absolute top-4 left-6 text-6xl pointer-events-none opacity-40 animate-gentle-float">
        🍁
      </div>
      <div
        className="absolute top-16 right-10 text-7xl pointer-events-none opacity-30 animate-gentle-float"
        style={{ animationDelay: '1.2s' }}
      >
        🍂
      </div>
      <div className="absolute bottom-6 left-8 text-7xl pointer-events-none opacity-70">
        🍄
      </div>
      <div className="absolute bottom-8 right-12 text-7xl pointer-events-none opacity-70">
        🎃
      </div>

      {/* Top Banner & Mode Toggle */}
      <div className="z-20 flex flex-col items-center mt-1 px-4">
        <div className="bg-white/40 backdrop-blur-md p-1 rounded-full flex gap-1 border border-white/60 mb-2">
          <button
            onClick={() => {
              setMode('free');
              sounds.playPop();
            }}
            className={`px-4 py-1.5 text-xs sm:text-sm font-extrabold rounded-full transition-all cursor-pointer ${
              mode === 'free'
                ? 'bg-amber-400 text-amber-950 shadow-md'
                : 'text-amber-950 hover:bg-white/30'
            }`}
          >
            {language === 'nl' ? '🍂 Vrij Blaadjes Vangen' : '🍂 Free Leaf Catching'}
          </button>
          <button
            onClick={() => {
              setMode('target');
              sounds.playPop();
            }}
            className={`px-4 py-1.5 text-xs sm:text-sm font-extrabold rounded-full transition-all cursor-pointer ${
              mode === 'target'
                ? 'bg-amber-400 text-amber-950 shadow-md'
                : 'text-amber-950 hover:bg-white/30'
            }`}
          >
            {language === 'nl' ? '🎯 Herfst Zoektocht' : '🎯 Autumn Quest'}
          </button>
        </div>

        {mode === 'target' ? (
          <div
            onClick={() =>
              sounds.speak(
                language === 'nl'
                  ? `Vang ${targetItem.articleNl} ${targetItem.nl}!`
                  : `Catch the ${targetItem.en}!`,
                language
              )
            }
            className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-6 py-2 rounded-full border-2 border-white shadow-xl cursor-pointer animate-pulse-glow"
          >
            <span className="text-xl sm:text-2xl font-black text-amber-950 drop-shadow">
              {language === 'nl' ? 'Vang:' : 'Catch:'}
            </span>
            <span className="text-3xl sm:text-4xl">{targetItem.emoji}</span>
            <span
              className="text-2xl sm:text-3xl font-black px-4 py-1 rounded-2xl text-white drop-shadow-md"
              style={{ backgroundColor: targetItem.color }}
            >
              {language === 'nl' ? `${targetItem.articleNl} ${targetItem.nl}` : targetItem.en}
            </span>
          </div>
        ) : (
          <div className="text-amber-950 font-black text-base sm:text-xl drop-shadow text-center bg-white/30 backdrop-blur-sm px-6 py-1.5 rounded-full">
            {language === 'nl'
              ? 'Tik op de vallende herfstblaadjes en eikels! 🍂🐿️'
              : 'Tap the falling autumn leaves and acorns to catch them! 🍂🐿️'}
          </div>
        )}
      </div>

      {/* Falling Autumn Playfield */}
      <div className="absolute inset-0 pointer-events-auto overflow-hidden">
        {items.map((item) => {
          const swayX = Math.sin(item.sway) * 26;

          return (
            <div
              key={item.id}
              onClick={(e) => handleCatchItem(item, e)}
              onTouchStart={(e) => handleCatchItem(item, e)}
              style={{
                left: `${item.x}%`,
                top: `${item.y}px`,
                transform: `translateX(${swayX}px) rotate(${item.rotation}deg)`,
                width: `${item.size}px`,
                height: `${item.size}px`,
              }}
              className="absolute cursor-pointer flex flex-col items-center justify-center transition-transform duration-75 active:scale-90"
            >
              <div
                style={{
                  backgroundColor: item.isSpecialGolden ? '#F59E0B' : item.wordItem.color,
                  boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
                }}
                className={`relative w-full h-full rounded-3xl flex flex-col items-center justify-center text-white p-2 border-2 border-white/80 ${
                  item.isSpecialGolden ? 'animate-pulse ring-4 ring-yellow-300' : ''
                }`}
              >
                <span className="text-4xl sm:text-5xl drop-shadow">
                  {item.wordItem.emoji}
                </span>
                <span className="text-[11px] font-black mt-0.5 drop-shadow leading-tight text-center">
                  {language === 'nl' ? item.wordItem.nl : item.wordItem.en}
                </span>
              </div>
            </div>
          );
        })}

        {/* Catch Popups */}
        {popups.map((p) => (
          <div
            key={p.id}
            style={{ left: `${p.x}px`, top: `${p.y}px` }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pop-in z-40 bg-white px-4 py-2 rounded-2xl shadow-2xl border-2 border-amber-400 font-black text-xl text-amber-950"
          >
            {p.text} ✨
          </div>
        ))}
      </div>

      {/* Bottom Leaf Basket */}
      <div className="z-10 flex flex-col items-center pb-2">
        <div className="flex items-center gap-3 bg-amber-900/80 backdrop-blur-md px-6 py-2.5 rounded-full border-2 border-amber-300 text-white shadow-2xl">
          <span className="text-3xl">🧺</span>
          <span className="text-lg sm:text-xl font-black">
            {language === 'nl' ? 'Herfstmandje:' : 'Autumn Basket:'}{' '}
            <span className="text-yellow-300 font-black text-2xl">{basketCount}</span>{' '}
            {language === 'nl' ? 'gevangen' : 'caught'}
          </span>
          <span className="text-2xl animate-kid-bounce">🍁</span>
        </div>
      </div>
    </div>
  );
}
