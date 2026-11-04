import React, { useState } from 'react';
import { ALPHABET_DATA } from '../../data/alphabetData';
import { Language } from '../../types/game';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { Sparkles, Trash2, CheckCircle2 } from 'lucide-react';

interface PlacedSticker {
  id: number;
  letter: string;
  emoji: string;
  word: string;
  wordNl?: string;
  color: string;
  x: number;
  y: number;
  rotation: number;
}

interface StickerBookGameProps {
  unlockedLetters: string[];
  language: Language;
}

export default function StickerBookGame({ unlockedLetters, language }: StickerBookGameProps) {
  const [scene, setScene] = useState<'autumn' | 'park' | 'ocean' | 'space' | 'rainbow'>('autumn');
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([
    {
      id: 1,
      letter: 'H',
      emoji: '🍂',
      word: 'Autumn',
      wordNl: 'Herfst',
      color: '#D97706',
      x: 35,
      y: 50,
      rotation: -5,
    },
    {
      id: 2,
      letter: 'E',
      emoji: '🦔',
      word: 'Hedgehog',
      wordNl: 'Egel',
      color: '#B45309',
      x: 60,
      y: 55,
      rotation: 8,
    },
  ]);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);

  const scenes = {
    autumn: {
      nameNl: '🍂 Herfstbos',
      nameEn: '🍂 Autumn Woods',
      bgClass: 'bg-gradient-to-b from-amber-200 via-orange-300 to-amber-700',
      elements: (
        <>
          <div className="absolute top-6 left-8 text-6xl animate-gentle-float">🍁</div>
          <div className="absolute top-12 right-12 text-6xl opacity-80 animate-gentle-float">🍂</div>
          <div className="absolute bottom-4 left-6 text-7xl">🍄</div>
          <div className="absolute bottom-6 right-10 text-7xl">🎃</div>
          <div className="absolute bottom-2 left-1/3 text-6xl">🌰</div>
          <div className="absolute top-20 left-1/2 text-5xl opacity-75">🐿️</div>
        </>
      ),
    },
    park: {
      nameNl: '🌳 Zonnig Park',
      nameEn: '🌳 Sunny Park',
      bgClass: 'bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-400',
      elements: (
        <>
          <div className="absolute top-6 left-8 text-6xl animate-gentle-float">☀️</div>
          <div className="absolute top-12 right-12 text-5xl opacity-80">☁️</div>
          <div className="absolute bottom-4 left-6 text-7xl">🌳</div>
          <div className="absolute bottom-6 right-10 text-7xl">🌸</div>
          <div className="absolute bottom-2 left-1/3 text-6xl">🍄</div>
        </>
      ),
    },
    ocean: {
      nameNl: '🌊 Blauwe Oceaan',
      nameEn: '🌊 Ocean Blue',
      bgClass: 'bg-gradient-to-b from-cyan-300 via-sky-400 to-blue-700',
      elements: (
        <>
          <div className="absolute top-10 left-12 text-5xl animate-bounce">🫧</div>
          <div className="absolute top-20 right-20 text-4xl">🫧</div>
          <div className="absolute bottom-4 left-8 text-7xl">🪸</div>
          <div className="absolute bottom-4 right-12 text-7xl">🐚</div>
          <div className="absolute bottom-12 right-1/4 text-6xl">🐠</div>
        </>
      ),
    },
    space: {
      nameNl: '🚀 De Ruimte',
      nameEn: '🚀 Outer Space',
      bgClass: 'bg-gradient-to-b from-slate-950 via-indigo-950 to-purple-900',
      elements: (
        <>
          <div className="absolute top-6 right-10 text-6xl animate-pulse">🪐</div>
          <div className="absolute top-16 left-12 text-4xl">⭐</div>
          <div className="absolute top-28 right-1/3 text-3xl">✨</div>
          <div className="absolute bottom-8 left-16 text-7xl">🛸</div>
          <div className="absolute bottom-10 right-20 text-6xl">🚀</div>
        </>
      ),
    },
    rainbow: {
      nameNl: '🌈 Toverkasteel',
      nameEn: '🌈 Magic Kingdom',
      bgClass: 'bg-gradient-to-b from-pink-300 via-purple-300 to-amber-200',
      elements: (
        <>
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-8xl">🌈</div>
          <div className="absolute top-16 left-10 text-6xl">✨</div>
          <div className="absolute bottom-6 left-10 text-7xl">🏰</div>
          <div className="absolute bottom-4 right-12 text-7xl">🦄</div>
        </>
      ),
    },
  };

  const handleSceneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedSticker) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const letterItem = ALPHABET_DATA.find((l) => l.letter === selectedSticker);
    if (!letterItem) return;

    sounds.playPop();
    fireConfettiBurst(e.clientX, e.clientY);

    const wordName = language === 'nl' ? letterItem.wordNl || letterItem.word : letterItem.word;
    sounds.speak(`${wordName}!`, language);

    setPlacedStickers((prev) => [
      ...prev,
      {
        id: Date.now(),
        letter: letterItem.letter,
        emoji: letterItem.emoji,
        word: letterItem.word,
        wordNl: letterItem.wordNl,
        color: letterItem.color,
        x: Math.max(10, Math.min(90, x)),
        y: Math.max(15, Math.min(85, y)),
        rotation: (Math.random() - 0.5) * 20,
      },
    ]);
  };

  const handleTapPlacedSticker = (sticker: PlacedSticker, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playBoing();
    const wordName = language === 'nl' ? sticker.wordNl || sticker.word : sticker.word;
    sounds.speak(`${sticker.letter}! ${wordName}!`, language);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-2 px-3 sm:px-6 max-w-5xl mx-auto select-none">
      {/* Top Scene Pickers */}
      <div className="flex items-center gap-2 mb-2">
        {(Object.keys(scenes) as (keyof typeof scenes)[]).map((sKey) => (
          <button
            key={sKey}
            onClick={() => {
              setScene(sKey);
              sounds.playPop();
            }}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
              scene === sKey
                ? 'bg-yellow-400 text-yellow-950 shadow-md scale-105'
                : 'bg-white/40 text-slate-800 hover:bg-white/60'
            }`}
          >
            {language === 'nl' ? scenes[sKey].nameNl : scenes[sKey].nameEn}
          </button>
        ))}

        <button
          onClick={() => {
            sounds.playPop();
            setPlacedStickers([]);
          }}
          className="w-8 h-8 rounded-full bg-white/40 hover:bg-white/60 text-slate-800 flex items-center justify-center cursor-pointer ml-2"
          title="Stickers wissen"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Interactive Scenic Canvas */}
      <div
        onClick={handleSceneClick}
        className={`relative w-full flex-1 max-h-[500px] rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden cursor-pointer ${scenes[scene].bgClass}`}
      >
        {scenes[scene].elements}

        {/* Placed Stickers */}
        {placedStickers.map((stk) => (
          <div
            key={stk.id}
            onClick={(e) => handleTapPlacedSticker(stk, e)}
            style={{
              left: `${stk.x}%`,
              top: `${stk.y}%`,
              transform: `translate(-50%, -50%) rotate(${stk.rotation}deg)`,
            }}
            className="absolute z-20 cursor-pointer active:scale-90 hover:scale-110 transition-transform p-1.5 bg-white rounded-3xl shadow-xl border-2 border-yellow-300 flex flex-col items-center animate-pop-in"
          >
            <span className="text-4xl sm:text-5xl">{stk.emoji}</span>
            <span
              className="text-xs sm:text-sm font-black px-2 rounded-full text-white mt-1"
              style={{ backgroundColor: stk.color }}
            >
              {stk.letter}
            </span>
          </div>
        ))}

        {/* Placed guide instruction overlay if empty */}
        {placedStickers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/30 backdrop-blur-sm text-white px-6 py-2.5 rounded-full font-bold text-base sm:text-lg">
              {language === 'nl'
                ? '✨ Kies een sticker hieronder en tik om te plakken! ✨'
                : '✨ Pick a sticker below, then tap anywhere here to place it! ✨'}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticker Drawer */}
      <div className="w-full mt-2 bg-white/30 backdrop-blur-md p-2.5 rounded-3xl border-2 border-white/60">
        <div className="flex items-center justify-between px-2 mb-1">
          <span className="text-xs sm:text-sm font-black text-white drop-shadow">
            {language === 'nl'
              ? `Mijn Sticker Album (${unlockedLetters.length}/26 Verzameld)`
              : `My Sticker Album (${unlockedLetters.length}/26 Unlocked)`}
          </span>
          <span className="text-xs text-white/80 font-bold">
            {language === 'nl'
              ? 'Tik op een sticker en plak hem in het landschap!'
              : 'Tap a sticker to select, then tap above!'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none">
          {ALPHABET_DATA.map((item) => {
            const isUnlocked = unlockedLetters.includes(item.letter);
            const isSelected = selectedSticker === item.letter;
            const wordName = language === 'nl' ? item.wordNl || item.word : item.word;

            return (
              <button
                key={item.letter}
                onClick={() => {
                  if (isUnlocked) {
                    sounds.playPop();
                    setSelectedSticker(item.letter);
                    sounds.speak(`${item.letter}! ${wordName}!`, language);
                  } else {
                    sounds.playBoing();
                    if (language === 'nl') {
                      sounds.speak(
                        `Speel meer spelletjes om letter ${item.letter} vrij te spelen!`,
                        'nl'
                      );
                    } else {
                      sounds.speak(`Play more games to unlock ${item.letter}!`, 'en');
                    }
                  }
                }}
                className={`relative shrink-0 w-12 h-14 sm:w-16 sm:h-18 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isUnlocked
                    ? isSelected
                      ? 'bg-yellow-300 scale-110 shadow-lg border-2 border-yellow-500'
                      : 'bg-white hover:scale-105 shadow-md'
                    : 'bg-slate-300/60 opacity-60'
                }`}
              >
                {isUnlocked ? (
                  <>
                    <span className="text-xl sm:text-2xl">{item.emoji}</span>
                    <span
                      className="text-xs font-black px-1.5 rounded-md text-white mt-0.5"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.letter}
                    </span>
                  </>
                ) : (
                  <span className="text-xl text-slate-500 font-black">?</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
