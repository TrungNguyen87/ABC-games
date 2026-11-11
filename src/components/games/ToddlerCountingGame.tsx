import React, { useState, useEffect, useMemo } from 'react';
import { Language } from '../../types/game';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { triggerKidCheer } from '../CheerCelebration';
import { Sparkles, RefreshCw, Volume2, ChevronRight, CheckCircle2 } from 'lucide-react';

interface ToddlerCountingGameProps {
  onEarnStar: () => void;
  language: Language;
}

type CountTheme = 'sinterklaas' | 'christmas' | 'halloween' | 'autumn' | 'fruits' | 'animals' | 'toys';

interface CountItemDef {
  emoji: string;
  nameNl: string;
  nameEn: string;
  soundName?: string;
}

const THEME_ITEMS: Record<CountTheme, CountItemDef[]> = {
  sinterklaas: [
    { emoji: '🍪', nameNl: 'pepernoten', nameEn: 'spiced cookies' },
    { emoji: '🎁', nameNl: 'cadeautjes', nameEn: 'presents' },
    { emoji: '👞', nameNl: 'schoentjes', nameEn: 'shoes' },
    { emoji: '🐴', nameNl: 'paardjes', nameEn: 'horses' },
    { emoji: '🥕', nameNl: 'wortels', nameEn: 'carrots' },
    { emoji: '🍫', nameNl: 'chocoladeletters', nameEn: 'chocolate letters' },
  ],
  christmas: [
    { emoji: '🎄', nameNl: 'kerstboompjes', nameEn: 'Christmas trees' },
    { emoji: '⭐', nameNl: 'kerststerren', nameEn: 'golden stars' },
    { emoji: '🔔', nameNl: 'kerstklokjes', nameEn: 'jingle bells' },
    { emoji: '⛄', nameNl: 'sneeuwpopjes', nameEn: 'snowmen' },
    { emoji: '🔮', nameNl: 'kerstballen', nameEn: 'baubles' },
    { emoji: '🦯', nameNl: 'zuurstokjes', nameEn: 'candy canes' },
  ],
  halloween: [
    { emoji: '🎃', nameNl: 'pompoenen', nameEn: 'pumpkins' },
    { emoji: '👻', nameNl: 'spookjes', nameEn: 'ghosts' },
    { emoji: '🦇', nameNl: 'vleermuisjes', nameEn: 'bats' },
    { emoji: '🕷️', nameNl: 'spinnetjes', nameEn: 'spiders' },
  ],
  autumn: [
    { emoji: '🍂', nameNl: 'herfstblaadjes', nameEn: 'autumn leaves' },
    { emoji: '🌰', nameNl: 'eikeltjes', nameEn: 'acorns' },
    { emoji: '🍄', nameNl: 'paddenstoelen', nameEn: 'mushrooms' },
    { emoji: '🍎', nameNl: 'appels', nameEn: 'apples' },
  ],
  fruits: [
    { emoji: '🍓', nameNl: 'aardbeien', nameEn: 'strawberries' },
    { emoji: '🍌', nameNl: 'bananen', nameEn: 'bananas' },
    { emoji: '🍊', nameNl: 'sinaasappels', nameEn: 'oranges' },
    { emoji: '🍉', nameNl: 'watermeloentjes', nameEn: 'watermelons' },
    { emoji: '🍪', nameNl: 'koekjes', nameEn: 'cookies' },
  ],
  animals: [
    { emoji: '🦆', nameNl: 'eendjes', nameEn: 'ducks' },
    { emoji: '🐱', nameNl: 'poesjes', nameEn: 'kittens' },
    { emoji: '🐶', nameNl: 'hondjes', nameEn: 'puppies' },
    { emoji: '🐸', nameNl: 'kikkertjes', nameEn: 'frogs' },
    { emoji: '🐰', nameNl: 'konijntjes', nameEn: 'bunnies' },
  ],
  toys: [
    { emoji: '🚗', nameNl: 'autootjes', nameEn: 'cars' },
    { emoji: '🧸', nameNl: 'beertjes', nameEn: 'teddy bears' },
    { emoji: '⭐', nameNl: 'sterretjes', nameEn: 'stars' },
    { emoji: '🚀', nameNl: 'raketjes', nameEn: 'rockets' },
    { emoji: '🎈', nameNl: 'ballonnen', nameEn: 'balloons' },
  ],
};

const DUTCH_NUMBER_WORDS = [
  '',
  'één',
  'twee',
  'drie',
  'vier',
  'vijf',
  'zes',
  'zeven',
  'acht',
  'negen',
  'tien',
];

const ENGLISH_NUMBER_WORDS = [
  '',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
];

export default function ToddlerCountingGame({
  onEarnStar,
  language,
}: ToddlerCountingGameProps) {
  const [theme, setTheme] = useState<CountTheme>('sinterklaas');
  const [maxCountRange, setMaxCountRange] = useState<5 | 10>(5); // 1-5 for 3yo, 1-10 for 4yo
  const [targetCount, setTargetCount] = useState<number>(3);
  const [itemDef, setItemDef] = useState<CountItemDef>(THEME_ITEMS.sinterklaas[0]);
  const [countedIndices, setCountedIndices] = useState<number[]>([]);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [celebrationMsg, setCelebrationMsg] = useState<string>('');

  // Generate random new round
  const rollNewRound = (selectedTheme: CountTheme, range: 5 | 10, currentNum?: number) => {
    setIsSuccess(false);
    setCelebrationMsg('');
    setCountedIndices([]);

    const items = THEME_ITEMS[selectedTheme];
    const pickedItem = items[Math.floor(Math.random() * items.length)];
    setItemDef(pickedItem);

    // Pick a random number between 1 and range (avoiding currentNum if range > 1)
    let nextCount: number;
    do {
      nextCount = Math.floor(Math.random() * range) + 1;
    } while (range > 1 && nextCount === currentNum);

    setTargetCount(nextCount);

    // Spoken prompt: clean and non-repeating
    const itemName = language === 'nl' ? pickedItem.nameNl : pickedItem.nameEn;
    const prompt =
      language === 'nl'
        ? `${itemName} tellen!`
        : `Count the ${itemName}!`;

    if (selectedTheme === 'halloween') {
      sounds.playGhost();
    } else {
      sounds.playPop();
    }
    sounds.speak(prompt, language);
  };

  // Initial load
  useEffect(() => {
    rollNewRound(theme, maxCountRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSpeakQuestion = () => {
    sounds.playBoing();
    const itemName = language === 'nl' ? itemDef.nameNl : itemDef.nameEn;
    const prompt =
      language === 'nl'
        ? `Hoeveel ${itemName} tel jij?`
        : `How many ${itemName} do you count?`;
    sounds.speak(prompt, language);
  };

  // Toddler taps an individual item to count it
  const handleTapItem = (index: number) => {
    if (isSuccess) return;

    let nextCounted = [...countedIndices];
    if (!nextCounted.includes(index)) {
      nextCounted.push(index);
      setCountedIndices(nextCounted);

      // Play joyful pop & sound
      sounds.playPop();

      // Number for this item - speak cleanly without saying digit and word twice
      const currentTapNumber = nextCounted.length;
      const numWord =
        language === 'nl'
          ? DUTCH_NUMBER_WORDS[currentTapNumber] || `${currentTapNumber}`
          : ENGLISH_NUMBER_WORDS[currentTapNumber] || `${currentTapNumber}`;

      // If user tapped all items, trigger celebratory feedback cleanly after number
      if (nextCounted.length === targetCount) {
        sounds.speak(`${numWord}!`, language, () => {
          handleCorrect(targetCount);
        });
        // Fallback in case onEnd doesn't fire
        setTimeout(() => {
          if (!isSuccess) handleCorrect(targetCount);
        }, 800);
      } else {
        sounds.speak(numWord, language);
      }
    } else {
      // Re-speak that specific number cleanly
      const pos = nextCounted.indexOf(index) + 1;
      sounds.playRustle();
      const numWord =
        language === 'nl'
          ? DUTCH_NUMBER_WORDS[pos] || `${pos}`
          : ENGLISH_NUMBER_WORDS[pos] || `${pos}`;
      sounds.speak(numWord, language);
    }
  };

  // Toddler selects an answer from bottom numbers (1-5 or 1-10)
  const handleSelectNumber = (num: number) => {
    if (isSuccess) return;

    if (num === targetCount) {
      handleCorrect(num);
    } else {
      sounds.playBoing();
      const tip = language === 'nl' ? 'Bijna!' : 'Almost!';
      sounds.speak(tip, language);
    }
  };

  const handleCorrect = (num: number) => {
    if (isSuccess) return;
    setIsSuccess(true);
    // All items counted
    setCountedIndices(Array.from({ length: targetCount }, (_, i) => i));

    fireConfettiBurst(
      theme === 'halloween' ? 'halloween' : theme === 'autumn' ? 'autumn' : 'rainbow'
    );

    sounds.playTada();
    sounds.playSparkle();
    triggerKidCheer({
      message: language === 'nl' ? 'SUPER GETELD!' : 'GREAT COUNTING!',
      emoji: itemDef.emoji,
    });
    onEarnStar();

    const numWord =
      language === 'nl'
        ? DUTCH_NUMBER_WORDS[num] || `${num}`
        : ENGLISH_NUMBER_WORDS[num] || `${num}`;
    const itemName = language === 'nl' ? itemDef.nameNl : itemDef.nameEn;

    const message =
      language === 'nl'
        ? `Super! ${numWord} ${itemName}! 🎉`
        : `Awesome! ${numWord} ${itemName}! 🎉`;

    setCelebrationMsg(message);
    sounds.speak(message, language);
  };

  // Available number buttons for the toddler
  const numberButtons = useMemo(() => {
    return Array.from({ length: maxCountRange }, (_, i) => i + 1);
  }, [maxCountRange]);

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-between p-2 sm:p-3 rounded-3xl transition-colors duration-500 overflow-y-auto overflow-x-hidden scrollbar-none select-none ${
        theme === 'halloween'
          ? 'bg-gradient-to-b from-purple-950 via-slate-900 to-amber-950 text-white'
          : theme === 'autumn'
          ? 'bg-gradient-to-b from-amber-700 via-orange-800 to-amber-950 text-amber-50'
          : 'bg-gradient-to-b from-sky-300 via-indigo-100 to-pink-100 text-slate-800'
      }`}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
        {theme === 'sinterklaas' ? (
          <>
            <div className="absolute top-4 left-6 text-3xl animate-bounce">👑</div>
            <div className="absolute top-12 right-10 text-3xl animate-pulse">🎁</div>
            <div className="absolute bottom-8 left-12 text-3xl animate-kid-float">🐴</div>
          </>
        ) : theme === 'christmas' ? (
          <>
            <div className="absolute top-4 left-6 text-3xl animate-bounce">🎄</div>
            <div className="absolute top-12 right-10 text-3xl animate-pulse">⭐</div>
            <div className="absolute bottom-8 left-12 text-3xl animate-kid-float">⛄</div>
          </>
        ) : theme === 'halloween' ? (
          <>
            <div className="absolute top-4 left-6 text-3xl animate-bounce">🦇</div>
            <div className="absolute top-12 right-10 text-3xl animate-pulse">🎃</div>
            <div className="absolute bottom-8 left-12 text-3xl animate-kid-float">👻</div>
          </>
        ) : theme === 'autumn' ? (
          <>
            <div className="absolute top-4 left-6 text-3xl animate-kid-bounce">🍁</div>
            <div className="absolute top-10 right-10 text-3xl animate-kid-wiggle">🍂</div>
            <div className="absolute bottom-8 left-12 text-3xl animate-kid-float">🌰</div>
          </>
        ) : (
          <>
            <div className="absolute top-4 left-8 text-4xl animate-kid-float">☁️</div>
            <div className="absolute top-8 right-12 text-4xl animate-kid-bounce">☀️</div>
            <div className="absolute bottom-10 left-16 text-3xl animate-kid-wiggle">🌈</div>
          </>
        )}
      </div>

      {/* Top Controls: Theme selector, 1-5 / 1-10 toggle, 🎲 Randomizer */}
      <div className="relative z-10 w-full max-w-4xl flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 bg-black/20 backdrop-blur-md px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl border border-white/20">
        {/* Themes */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 max-w-full">
          {[
            { id: 'sinterklaas' as const, labelNl: '👑 Sinterklaas', labelEn: '👑 Sint' },
            { id: 'christmas' as const, labelNl: '🎄 Kerstmis', labelEn: '🎄 Xmas' },
            { id: 'halloween' as const, labelNl: '🎃 Halloween', labelEn: '🎃 Spooky' },
            { id: 'autumn' as const, labelNl: '🍂 Herfst', labelEn: '🍂 Autumn' },
            { id: 'fruits' as const, labelNl: '🍎 Eten', labelEn: '🍎 Fruits' },
            { id: 'animals' as const, labelNl: '🐾 Dieren', labelEn: '🐾 Animals' },
            { id: 'toys' as const, labelNl: '🧸 Speelgoed', labelEn: '🧸 Toys' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sounds.playPop();
                setTheme(t.id);
                rollNewRound(t.id, maxCountRange);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                theme === t.id
                  ? 'bg-amber-400 text-amber-950 shadow-md scale-105'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {language === 'nl' ? t.labelNl : t.labelEn}
            </button>
          ))}
        </div>

        {/* Right tools: 1-5 / 1-10 toggle & 🎲 Random */}
        <div className="flex items-center gap-1.5">
          {/* Toddler age/range toggle */}
          <div className="bg-white/20 p-0.5 rounded-full flex items-center border border-white/30">
            <button
              onClick={() => {
                sounds.playPop();
                setMaxCountRange(5);
                rollNewRound(theme, 5);
              }}
              className={`px-2 py-0.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                maxCountRange === 5
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
              title="1 - 5 (3 jaar)"
            >
              1-5
            </button>
            <button
              onClick={() => {
                sounds.playPop();
                setMaxCountRange(10);
                rollNewRound(theme, 10);
              }}
              className={`px-2 py-0.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                maxCountRange === 10
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
              title="1 - 10 (4 jaar)"
            >
              1-10
            </button>
          </div>

          {/* Randomizer Button */}
          <button
            onClick={() => {
              sounds.playPop();
              sounds.playSparkle();
              rollNewRound(theme, maxCountRange, targetCount);
            }}
            title={language === 'nl' ? 'Nieuwe telopgave' : 'New count puzzle'}
            className="px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 cursor-pointer bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-md active:scale-95 transition-transform"
          >
            <span>🎲</span>
            <span className="hidden sm:inline">{language === 'nl' ? 'Nieuw' : 'Random'}</span>
          </button>
        </div>
      </div>

      {/* Main Count Play Area */}
      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center justify-center my-auto px-2">
        {/* Audio question prompt banner */}
        <div
          onClick={handleSpeakQuestion}
          className="cursor-pointer group flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-white/40 shadow-lg active:scale-95 transition-all mb-3 text-center"
        >
          <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shadow">
            <Volume2 className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black drop-shadow tracking-wide">
              {language === 'nl'
                ? `Hoeveel ${itemDef.nameNl} tel jij?`
                : `How many ${itemDef.nameEn} do you count?`}
            </h2>
            <p className="text-[11px] sm:text-xs opacity-90">
              {language === 'nl'
                ? 'Tik op elk plaatje om te tellen!'
                : 'Tap each picture to count them!'}
            </p>
          </div>
        </div>

        {/* Tactile Items Grid - Click to count! */}
        <div className="flex items-center justify-center flex-wrap gap-3 sm:gap-4 md:gap-5 max-w-2xl min-h-[160px] sm:min-h-[200px] p-4 bg-black/15 backdrop-blur-sm rounded-3xl border-2 border-white/25 shadow-inner">
          {Array.from({ length: targetCount }).map((_, idx) => {
            const isCounted = countedIndices.includes(idx);
            const countOrder = countedIndices.indexOf(idx) + 1;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleTapItem(idx)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-300 cursor-pointer select-none ${
                  isCounted
                    ? 'bg-white/40 border-3 border-amber-300 scale-105 shadow-xl rotate-1'
                    : 'bg-white/15 hover:bg-white/25 border-2 border-dashed border-white/40 hover:scale-105 active:scale-90'
                }`}
              >
                {/* Main Emoji Item */}
                <span className="text-4xl sm:text-5xl md:text-6xl filter drop-shadow-md transition-transform group-hover:scale-110">
                  {itemDef.emoji}
                </span>

                {/* Number Badge shown once tapped */}
                {isCounted && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs sm:text-sm w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pop-in">
                    {countOrder}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Celebration Banner when completed */}
        {isSuccess && (
          <div className="animate-pop-in flex flex-col items-center bg-emerald-500/95 text-white px-5 py-2.5 rounded-3xl shadow-2xl border-2 border-white mt-3">
            <div className="flex items-center gap-2 text-base sm:text-xl font-black">
              <span>🌟</span>
              <span>{celebrationMsg}</span>
              <span>🎉</span>
            </div>
            <button
              onClick={() => rollNewRound(theme, maxCountRange, targetCount)}
              className="mt-2 px-5 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-sm sm:text-base rounded-full shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none flex items-center gap-1.5 cursor-pointer transition-all animate-kid-bounce"
            >
              <span>{language === 'nl' ? 'NOG EEN KEER TELLEN!' : 'COUNT AGAIN!'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Number Choice Cards: Tap the number answer */}
      <div className="relative z-10 w-full max-w-4xl bg-black/35 backdrop-blur-md rounded-2xl sm:rounded-3xl p-2 sm:p-3 border-2 border-white/20 flex flex-col items-center flex-shrink-0">
        <div className="text-[11px] sm:text-xs font-black text-white/90 mb-1.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>
            {language === 'nl'
              ? 'Hoeveel zijn het er? Kies het juiste cijfer:'
              : 'How many? Pick the right number:'}
          </span>
        </div>

        {/* Number Buttons Strip */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap w-full max-w-2xl">
          {numberButtons.map((num) => {
            const isMatch = isSuccess && num === targetCount;
            return (
              <button
                key={num}
                type="button"
                onClick={() => handleSelectNumber(num)}
                className={`relative w-12 h-14 sm:w-14 sm:h-16 md:w-16 md:h-18 rounded-2xl flex flex-col items-center justify-center font-black text-xl sm:text-2xl md:text-3xl transition-all duration-200 cursor-pointer shadow-lg active:scale-90 active:translate-y-1 ${
                  isMatch
                    ? 'bg-emerald-400 text-emerald-950 scale-110 shadow-emerald-400/50 ring-4 ring-white'
                    : 'bg-white hover:bg-amber-100 text-slate-800 hover:scale-105'
                }`}
                style={{
                  boxShadow: isMatch
                    ? '0 6px 0 #059669'
                    : '0 5px 0 #cbd5e1',
                }}
              >
                <span>{num}</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 -mt-1">
                  {language === 'nl'
                    ? DUTCH_NUMBER_WORDS[num]
                    : ENGLISH_NUMBER_WORDS[num]}
                </span>
                {isMatch && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-800 absolute -top-1 -right-1 fill-emerald-200" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
