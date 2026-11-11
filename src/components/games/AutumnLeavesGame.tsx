import React, { useState, useEffect, useRef } from 'react';
import { DUTCH_WORLD_WORDS } from '../../data/alphabetData';
import { WordItem, Language } from '../../types/game';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { triggerKidCheer } from '../CheerCelebration';
import { Sparkles, Trophy, Volume2 } from 'lucide-react';

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

type CatchTheme = 'sinterklaas' | 'christmas' | 'autumn';

export default function AutumnLeavesGame({
  onEarnStar,
  onUnlockSticker,
  language,
}: AutumnLeavesGameProps) {
  const [theme, setTheme] = useState<CatchTheme>('sinterklaas');
  const [items, setItems] = useState<FallingAutumnItem[]>([]);
  const [mode, setMode] = useState<'free' | 'target'>('free');
  const [targetItem, setTargetItem] = useState<WordItem>(() => {
    return DUTCH_WORLD_WORDS.find((w) => w.category === 'sinterklaas') || DUTCH_WORLD_WORDS[0];
  });
  const [popups, setPopups] = useState<
    { id: number; x: number; y: number; text: string; color: string; emoji: string }[]
  >([]);
  const [basketCount, setBasketCount] = useState<number>(0);
  const nextIdRef = useRef(1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetTimeoutRef = useRef<any>(null);

  const themeWords = DUTCH_WORLD_WORDS.filter((w) => w.category === theme);

  // Choose target for Quest mode
  useEffect(() => {
    if (targetTimeoutRef.current) clearTimeout(targetTimeoutRef.current);
    const pool = DUTCH_WORLD_WORDS.filter((w) => w.category === theme);
    const random = pool[Math.floor(Math.random() * pool.length)] || pool[0];
    setTargetItem(random);

    if (mode === 'target') {
      if (language === 'nl') {
        sounds.speak(`Vang ${random.articleNl} ${random.nl}!`, 'nl');
      } else {
        sounds.speak(`Catch the ${random.en}!`, 'en');
      }
    } else {
      if (theme === 'sinterklaas') {
        sounds.speak(language === 'nl' ? 'Pepernoten en cadeautjes vangen!' : 'Catch the treats and gifts!', language);
      } else if (theme === 'christmas') {
        sounds.speak(language === 'nl' ? 'Sneeuwvlokken en kerstballen vangen!' : 'Catch snowflakes and ornaments!', language);
      } else {
        sounds.speak(language === 'nl' ? 'Herfstblaadjes vangen!' : 'Catch autumn leaves!', language);
      }
    }
    return () => {
      if (targetTimeoutRef.current) clearTimeout(targetTimeoutRef.current);
    };
  }, [theme, mode, language]);

  // Falling Items Physics & Spawner
  useEffect(() => {
    let animId: number;
    let lastSpawn = Date.now();

    const spawnItem = () => {
      const pool = DUTCH_WORLD_WORDS.filter((w) => w.category === theme);
      if (!pool.length) return;
      const randomWord = pool[Math.floor(Math.random() * pool.length)];
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
    const pool = DUTCH_WORLD_WORDS.filter((w) => w.category === theme);
    for (let i = 0; i < 5; i++) {
      const randomWord = pool[Math.floor(Math.random() * pool.length)] || pool[0];
      setItems((prev) => [
        ...prev,
        {
          id: nextIdRef.current++,
          wordItem: randomWord,
          x: 10 + i * 16 + Math.random() * 8,
          y: window.innerHeight * 0.15 + i * 90,
          speed: 1.1 + Math.random() * 1.3,
          size: 80,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: 0.025,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 3,
        },
      ]);
    }

    const loop = () => {
      const now = Date.now();
      if (now - lastSpawn > 1100 && items.length < 10) {
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
  }, [theme]);

  const handleCatch = (
    item: FallingAutumnItem,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    sounds.playRustle();

    let clientX = window.innerWidth * (item.x / 100);
    let clientY = item.y;
    if ('changedTouches' in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e && (e as React.MouseEvent).clientX) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const popupId = Date.now();
    const wordLabel = language === 'nl' ? item.wordItem.nl : item.wordItem.en;
    setPopups((prev) => [
      ...prev,
      {
        id: popupId,
        x: clientX,
        y: clientY,
        text: wordLabel,
        color: item.wordItem.color,
        emoji: item.wordItem.emoji,
      },
    ]);
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== popupId));
    }, 1200);

    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setBasketCount((prev) => prev + 1);

    if (item.isSpecialGolden) {
      sounds.playKidsCheer();
      sounds.playSparkle();
      fireConfettiBurst(clientX, clientY, theme === 'sinterklaas' ? 'stars' : theme === 'christmas' ? 'winter' : 'autumn');
      triggerKidCheer({
        message: language === 'nl' ? 'GOUDEN VANGST!' : 'GOLDEN CATCH!',
        emoji: '⭐',
        x: clientX,
        y: clientY,
      });
      onEarnStar();
      if (language === 'nl') {
        sounds.speak('Gouden vangst!', 'nl');
      } else {
        sounds.speak('Golden catch!', 'en');
      }
      return;
    }

    if (mode === 'target') {
      if (item.wordItem.id === targetItem.id) {
        sounds.playTada();
        fireConfettiBurst(clientX, clientY, theme === 'sinterklaas' ? 'stars' : theme === 'christmas' ? 'winter' : 'autumn');
        triggerKidCheer({
          message: language === 'nl' ? 'GOED GEVANGEN!' : 'WELL CAUGHT!',
          emoji: item.wordItem.emoji,
          x: clientX,
          y: clientY,
        });
        onEarnStar();
        if (onUnlockSticker) onUnlockSticker(item.wordItem.nl.charAt(0).toUpperCase());

        if (language === 'nl') {
          sounds.speak(`Super! ${item.wordItem.nl}!`, 'nl');
        } else {
          sounds.speak(`Great! ${item.wordItem.en}!`, 'en');
        }

        const pool = DUTCH_WORLD_WORDS.filter((w) => w.category === theme);
        const newTarget = pool[Math.floor(Math.random() * pool.length)] || pool[0];
        setTargetItem(newTarget);
        if (targetTimeoutRef.current) clearTimeout(targetTimeoutRef.current);
        targetTimeoutRef.current = setTimeout(() => {
          const nextName = language === 'nl' ? newTarget.nl : newTarget.en;
          sounds.speak(nextName, language);
        }, 1200);
      } else {
        sounds.playBoing();
        const tappedName = language === 'nl' ? item.wordItem.nl : item.wordItem.en;
        sounds.speak(tappedName, language);
      }
    } else {
      const spokenName = language === 'nl' ? item.wordItem.nl : item.wordItem.en;
      sounds.speak(spokenName, language);
      if (Math.random() < 0.25) {
        onEarnStar();
        triggerKidCheer({ emoji: item.wordItem.emoji, x: clientX, y: clientY });
      }
    }
  };

  const bgStyle =
    theme === 'sinterklaas'
      ? 'from-red-950 via-slate-900 to-amber-950 text-white'
      : theme === 'christmas'
      ? 'from-emerald-950 via-slate-900 to-red-950 text-white'
      : 'from-amber-200 via-orange-300 to-amber-700 text-slate-900';

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden flex flex-col justify-between select-none bg-gradient-to-b ${bgStyle} transition-colors duration-500`}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        {theme === 'sinterklaas' ? (
          <>
            <div className="absolute top-4 left-6 text-6xl animate-gentle-float">🌙</div>
            <div className="absolute top-16 right-10 text-6xl animate-gentle-float">⭐</div>
            <div className="absolute bottom-6 left-8 text-7xl">🐴</div>
            <div className="absolute bottom-8 right-12 text-7xl">🎁</div>
          </>
        ) : theme === 'christmas' ? (
          <>
            <div className="absolute top-4 left-6 text-6xl animate-gentle-float">❄️</div>
            <div className="absolute top-16 right-10 text-6xl animate-gentle-float">⭐</div>
            <div className="absolute bottom-6 left-8 text-7xl">🎄</div>
            <div className="absolute bottom-8 right-12 text-7xl">⛄</div>
          </>
        ) : (
          <>
            <div className="absolute top-4 left-6 text-6xl animate-gentle-float">🍁</div>
            <div className="absolute top-16 right-10 text-7xl animate-gentle-float">🍂</div>
            <div className="absolute bottom-6 left-8 text-7xl">🍄</div>
            <div className="absolute bottom-8 right-12 text-7xl">🎃</div>
          </>
        )}
      </div>

      {/* Top Banner, Theme Selector & Mode Toggle */}
      <div className="z-20 flex flex-col items-center mt-1 px-3">
        {/* Themes Tabs */}
        <div className="bg-black/35 backdrop-blur-md p-1 rounded-full flex gap-1 border border-white/30 mb-1.5">
          {[
            { id: 'sinterklaas' as const, labelNl: '👑 Sinterklaas', labelEn: '👑 Sint' },
            { id: 'christmas' as const, labelNl: '🎄 Kerstmis', labelEn: '🎄 Xmas' },
            { id: 'autumn' as const, labelNl: '🍂 Herfst', labelEn: '🍂 Autumn' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sounds.playPop();
                setTheme(t.id);
              }}
              className={`px-3 py-1 text-xs font-black rounded-full transition-all cursor-pointer ${
                theme === t.id
                  ? 'bg-amber-400 text-amber-950 shadow-md scale-105'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {language === 'nl' ? t.labelNl : t.labelEn}
            </button>
          ))}
        </div>

        {/* Mode Switcher */}
        <div className="bg-white/30 backdrop-blur-md p-1 rounded-full flex gap-1 border border-white/50 mb-2">
          <button
            onClick={() => {
              setMode('free');
              sounds.playPop();
            }}
            className={`px-3.5 py-1 text-xs sm:text-sm font-extrabold rounded-full transition-all cursor-pointer ${
              mode === 'free'
                ? 'bg-amber-400 text-amber-950 shadow-md'
                : 'text-white hover:text-amber-200'
            }`}
          >
            {language === 'nl' ? '🧺 Vrij Vangen' : '🧺 Free Catch'}
          </button>
          <button
            onClick={() => {
              setMode('target');
              sounds.playPop();
            }}
            className={`px-3.5 py-1 text-xs sm:text-sm font-extrabold rounded-full transition-all cursor-pointer ${
              mode === 'target'
                ? 'bg-amber-400 text-amber-950 shadow-md'
                : 'text-white hover:text-amber-200'
            }`}
          >
            {language === 'nl' ? '🎯 Zoekopdracht' : '🎯 Quest'}
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
            className="flex items-center gap-3 bg-white/40 backdrop-blur-md px-6 py-2 rounded-full border-2 border-white shadow-lg cursor-pointer animate-pulse-glow"
          >
            <span className="text-sm sm:text-base font-black drop-shadow">
              {language === 'nl' ? 'Vang het item:' : 'Catch the item:'}
            </span>
            <span
              className="text-2xl sm:text-3xl font-black px-4 py-1 rounded-2xl text-white drop-shadow-md"
              style={{ backgroundColor: targetItem.color }}
            >
              {targetItem.emoji} {language === 'nl' ? targetItem.nl : targetItem.en}
            </span>
            <Volume2 className="w-4 h-4 animate-pulse ml-1" />
          </div>
        ) : (
          <div className="font-extrabold text-xs sm:text-sm drop-shadow text-center">
            {language === 'nl'
              ? '🍂 Tik op de vallende items om ze in het mandje te verzamelen! 🧺'
              : '🍂 Tap the falling items to collect them in the basket! 🧺'}
          </div>
        )}
      </div>

      {/* Playfield Area */}
      <div className="absolute inset-0 pointer-events-auto">
        {items.map((item) => {
          const swayX = Math.sin(item.sway) * 28;

          return (
            <div
              key={item.id}
              onClick={(e) => handleCatch(item, e)}
              onTouchStart={(e) => {
                e.preventDefault();
                handleCatch(item, e);
              }}
              style={{
                left: `${item.x}%`,
                top: `${item.y}px`,
                transform: `translateX(${swayX}px) rotate(${item.rotation}deg)`,
                width: `${item.size}px`,
                height: `${item.size}px`,
              }}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 active:scale-90 flex flex-col items-center justify-center"
            >
              <div
                style={{
                  backgroundColor: item.isSpecialGolden ? '#FDE047' : `${item.wordItem.color}33`,
                  borderColor: item.wordItem.color,
                }}
                className={`w-full h-full rounded-3xl border-3 flex flex-col items-center justify-center p-1.5 shadow-xl backdrop-blur-xs ${
                  item.isSpecialGolden ? 'ring-4 ring-amber-300 animate-spin-slow' : ''
                }`}
              >
                <span className="text-4xl sm:text-5xl filter drop-shadow animate-kid-bounce">
                  {item.wordItem.emoji}
                </span>
                <span className="text-[10px] sm:text-xs font-black text-center leading-tight bg-black/40 text-white px-1.5 py-0.5 rounded-full mt-1">
                  {language === 'nl' ? item.wordItem.nl : item.wordItem.en}
                </span>
              </div>
            </div>
          );
        })}

        {/* Popped text floats */}
        {popups.map((p) => (
          <div
            key={p.id}
            style={{ left: `${p.x}px`, top: `${p.y}px` }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pop-in z-40 bg-white/95 px-4 py-2 rounded-2xl shadow-2xl border-3 border-amber-300 font-black text-lg flex items-center gap-2"
          >
            <span className="text-2xl">{p.emoji}</span>
            <span style={{ color: p.color }}>{p.text}</span> ✨
          </div>
        ))}
      </div>

      {/* Bottom Basket Counter */}
      <div className="z-10 flex items-center justify-between px-6 py-2 bg-black/25 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧺</span>
          <span className="font-extrabold text-sm sm:text-base">
            {language === 'nl' ? `Verzameld: ${basketCount}` : `Collected: ${basketCount}`}
          </span>
        </div>
        <div className="text-xs font-bold opacity-80">
          {language === 'nl' ? 'Vang alles voor sterren! ⭐' : 'Catch all for stars! ⭐'}
        </div>
      </div>
    </div>
  );
}
