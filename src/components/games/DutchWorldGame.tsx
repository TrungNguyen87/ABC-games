import React, { useState, useEffect, useCallback } from 'react';
import { DUTCH_WORLD_WORDS } from '../../data/alphabetData';
import { WordItem, Language } from '../../types/game';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { Sparkles, RefreshCw, Volume2, Search, Compass } from 'lucide-react';

interface DutchWorldGameProps {
  onEarnStar: () => void;
  language: Language;
}

export default function DutchWorldGame({ onEarnStar, language }: DutchWorldGameProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    'autumn' | 'animals' | 'vehicles' | 'food' | 'nature'
  >('autumn');
  const [mode, setMode] = useState<'explore' | 'quiz'>('explore');
  const [targetWord, setTargetWord] = useState<WordItem>(
    DUTCH_WORLD_WORDS.find((w) => w.category === 'autumn') || DUTCH_WORLD_WORDS[0]
  );
  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  const currentCategoryWords = DUTCH_WORLD_WORDS.filter(
    (w) => w.category === selectedCategory
  );

  const startQuizRound = useCallback(() => {
    const words = DUTCH_WORLD_WORDS.filter((w) => w.category === selectedCategory);
    const random = words[Math.floor(Math.random() * words.length)] || DUTCH_WORLD_WORDS[0];
    setTargetWord(random);
    setActiveWordId(null);
    setFeedback('');

    setTimeout(() => {
      if (language === 'nl') {
        sounds.speak(`Waar is ${random.articleNl} ${random.nl}?`, 'nl');
      } else {
        sounds.speak(
          `Can you find the Dutch word for ${random.en}? Find ${random.articleNl} ${random.nl}!`,
          'nl'
        );
      }
    }, 400);
  }, [selectedCategory, language]);

  useEffect(() => {
    if (mode === 'quiz') {
      startQuizRound();
    } else {
      setActiveWordId(null);
      setFeedback('');
      const catName =
        selectedCategory === 'autumn'
          ? 'de herfst en het bos'
          : selectedCategory === 'animals'
          ? 'de dieren'
          : selectedCategory === 'vehicles'
          ? 'het vervoer en Holland'
          : selectedCategory === 'food'
          ? 'het eten en fruit'
          : 'de natuur';
      sounds.speak(`Tik op de plaatjes om ${catName} te leren!`, 'nl');
    }
  }, [selectedCategory, mode, startQuizRound]);

  const handleWordClick = (word: WordItem) => {
    setActiveWordId(word.id);

    if (mode === 'quiz') {
      if (word.id === targetWord.id) {
        sounds.playChime();
        fireConfettiBurst(selectedCategory === 'autumn' ? 'autumn' : 'rainbow');
        onEarnStar();
        setFeedback(`Goed zo! ${word.articleNl} ${word.nl}! 🎉`);

        sounds.speak(`Goed zo! Dat is ${word.articleNl} ${word.nl}! ${word.soundCue || ''}`, 'nl');

        setTimeout(() => {
          startQuizRound();
        }, 2200);
      } else {
        sounds.playBoing();
        setFeedback(
          `Dat is ${word.articleNl} ${word.nl}. Zoek ${targetWord.articleNl} ${targetWord.nl}!`
        );
        sounds.speak(
          `Dat is ${word.articleNl} ${word.nl}. Waar is ${targetWord.articleNl} ${targetWord.nl}?`,
          'nl'
        );
        setTimeout(() => {
          setActiveWordId(null);
        }, 800);
      }
    } else {
      sounds.playPop();
      setFeedback(`${word.articleNl} ${word.nl} (${word.en})`);
      sounds.speak(`${word.articleNl} ${word.nl}! ${word.soundCue || ''}`, 'nl');

      setTimeout(() => {
        setActiveWordId(null);
      }, 1200);
    }
  };

  const categories = [
    { id: 'autumn', labelNl: '🍂 Herfst & Bos', labelEn: 'Autumn & Woods' },
    { id: 'animals', labelNl: '🐶 Dieren', labelEn: 'Animals' },
    { id: 'vehicles', labelNl: '🚲 Holland & Vervoer', labelEn: 'Bikes & City' },
    { id: 'food', labelNl: '🧀 Eten & Kaas', labelEn: 'Food & Fruit' },
    { id: 'nature', labelNl: '🌷 Natuur & Bloemen', labelEn: 'Nature & Tulips' },
  ] as const;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-2 px-3 sm:px-6 max-w-5xl mx-auto select-none">
      {/* Category Tabs & Mode Switcher */}
      <div className="w-full flex flex-col items-center gap-2 mt-1">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sounds.playPop();
                setSelectedCategory(cat.id);
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-amber-950 shadow-md scale-105'
                  : 'bg-white/40 text-slate-800 hover:bg-white/60'
              }`}
            >
              {language === 'nl' ? cat.labelNl : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Mode Toggle (Explore vs Find-It Quiz) */}
        <div className="flex items-center gap-2">
          <div className="bg-white/30 backdrop-blur-md p-1 rounded-full flex gap-1 border border-white/50">
            <button
              onClick={() => {
                setMode('explore');
                sounds.playPop();
              }}
              className={`px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                mode === 'explore'
                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                  : 'text-white hover:text-white/80'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{language === 'nl' ? 'Ontdekken (Tik & Luister)' : 'Explore & Tap'}</span>
            </button>
            <button
              onClick={() => {
                setMode('quiz');
                sounds.playPop();
              }}
              className={`px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                mode === 'quiz'
                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                  : 'text-white hover:text-white/80'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{language === 'nl' ? 'Zoekspelletje (Waar is...)' : 'Find Word Quest'}</span>
            </button>
          </div>

          {mode === 'quiz' && (
            <button
              onClick={startQuizRound}
              className="w-8 h-8 rounded-full bg-white/40 hover:bg-white/60 text-slate-800 flex items-center justify-center transition-all cursor-pointer"
              title="Ander woord"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quiz Target Prompt */}
        {mode === 'quiz' && (
          <div
            onClick={() =>
              sounds.speak(`Waar is ${targetWord.articleNl} ${targetWord.nl}?`, 'nl')
            }
            className="flex items-center gap-3 bg-white/40 backdrop-blur-md px-6 py-2 rounded-full border-2 border-white shadow-xl cursor-pointer animate-pulse-glow"
          >
            <span className="text-xl sm:text-2xl font-black text-white drop-shadow">
              Waar is:
            </span>
            <span className="text-2xl sm:text-3xl font-black px-4 py-1 rounded-2xl bg-amber-400 text-amber-950 shadow-md">
              {targetWord.articleNl} {targetWord.nl}
            </span>
            <span className="text-xs sm:text-sm font-bold text-white/90">
              ({targetWord.en})
            </span>
            <Volume2 className="w-5 h-5 text-white animate-bounce ml-1" />
          </div>
        )}
      </div>

      {/* Main Grid of Dutch World Cards */}
      <div className="w-full flex-1 flex items-center justify-center my-2 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl p-2">
          {currentCategoryWords.map((word) => {
            const isActive = activeWordId === word.id;

            return (
              <button
                key={word.id}
                onClick={() => handleWordClick(word)}
                className={`relative rounded-3xl p-3 sm:p-4 bg-white flex flex-col items-center justify-between shadow-xl border-4 transition-all duration-150 cursor-pointer select-none active:translate-y-2
                  ${isActive ? 'scale-105 border-amber-400 bg-amber-50 animate-kid-bounce' : 'border-white/90 hover:scale-105'}
                `}
                style={{
                  boxShadow: isActive
                    ? '0 10px 0 #b45309, 0 20px 25px rgba(0,0,0,0.2)'
                    : `0 8px 0 rgba(0,0,0,0.12), 0 12px 18px rgba(0,0,0,0.08)`,
                }}
              >
                <div className="text-5xl sm:text-6xl my-2 transform transition-transform group-hover:scale-110">
                  {word.emoji}
                </div>

                <div className="w-full bg-slate-100 rounded-2xl py-1.5 text-center flex flex-col items-center">
                  <div className="text-base sm:text-lg font-black text-slate-800 leading-tight">
                    <span className="text-amber-600 font-extrabold text-sm mr-1">
                      {word.articleNl}
                    </span>
                    <span>{word.nl}</span>
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 font-bold">
                    {word.en}
                  </div>
                </div>

                {word.soundCue && (
                  <span className="absolute top-2 right-2 text-[10px] font-black bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-full">
                    🔊 {word.soundCue}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Feedback Banner */}
      <div className="h-10 text-center flex items-center justify-center">
        {feedback ? (
          <div className="bg-white px-5 py-1.5 rounded-full shadow-md text-amber-900 font-black text-base animate-pop-in border border-amber-300">
            {feedback}
          </div>
        ) : (
          <p className="text-white/80 font-bold text-sm drop-shadow">
            {mode === 'explore'
              ? 'Tik op een plaatje om het Nederlandse woord te horen! 🇳🇱'
              : `Zoek ${targetWord.articleNl} ${targetWord.nl}! ⭐`}
          </p>
        )}
      </div>
    </div>
  );
}
