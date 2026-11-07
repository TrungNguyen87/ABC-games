import React, { useState, useEffect } from 'react';
import { GameMode, LetterInfo, Language, VoiceStyle } from './types/game';
import { ALPHABET_DATA } from './data/alphabetData';
import { sounds } from './utils/soundEffects';
import ConfettiCanvas, { fireConfettiBurst } from './components/ConfettiCanvas';
import CheerCelebration, { triggerKidCheer } from './components/CheerCelebration';
import GameHeader from './components/GameHeader';
import LetterAvatar from './components/LetterAvatar';
import LetterFriendsGame from './components/games/LetterFriendsGame';
import BalloonPopGame from './components/games/BalloonPopGame';
import MonsterSnackGame from './components/games/MonsterSnackGame';
import AutumnLeavesGame from './components/games/AutumnLeavesGame';
import PuddleSplashGame from './components/games/PuddleSplashGame';
import LetterTraceGame from './components/games/LetterTraceGame';
import PhonicsMatchGame from './components/games/PhonicsMatchGame';
import MusicalPianoGame from './components/games/MusicalPianoGame';
import DutchWorldGame from './components/games/DutchWorldGame';
import StickerBookGame from './components/games/StickerBookGame';
import LoreSpellerGame from './components/games/LoreSpellerGame';
import LoreCharactersGame from './components/games/LoreCharactersGame';
import ToddlerCountingGame from './components/games/ToddlerCountingGame';
import ColorGradingGame from './components/games/ColorGradingGame';
import AlphabetPuzzleGame from './components/games/AlphabetPuzzleGame';
import HalloweenPopGame from './components/games/HalloweenPopGame';
import VoiceSettingsModal from './components/VoiceSettingsModal';
import GitHubPagesModal from './components/GitHubPagesModal';
import { Play, Sparkles, Star, Award, Heart } from 'lucide-react';

export default function App() {
  const [currentMode, setCurrentMode] = useState<GameMode>('menu');
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('abc_kids_lang');
    return saved === 'en' ? 'en' : 'nl'; // Default to Dutch
  });
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>(() => sounds.getVoiceStyle());
  const [stars, setStars] = useState<number>(() => {
    const saved = localStorage.getItem('abc_kids_stars');
    return saved ? parseInt(saved, 10) : 5;
  });
  const [streak, setStreak] = useState<number>(0);
  const [unlockedLetters, setUnlockedLetters] = useState<string[]>(() => {
    const saved = localStorage.getItem('abc_kids_stickers');
    return saved ? JSON.parse(saved) : ['A', 'B', 'C', 'D', 'H'];
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [showDeployModal, setShowDeployModal] = useState<boolean>(false);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('abc_kids_stars', stars.toString());
  }, [stars]);

  useEffect(() => {
    localStorage.setItem('abc_kids_stickers', JSON.stringify(unlockedLetters));
  }, [unlockedLetters]);

  useEffect(() => {
    localStorage.setItem('abc_kids_lang', language);
  }, [language]);

  const handleEarnStar = () => {
    setStars((prev) => prev + 1);
    setStreak((prev) => prev + 1);
    triggerKidCheer({ type: 'star' });
  };

  const handleUnlockSticker = (letter: string) => {
    if (!unlockedLetters.includes(letter)) {
      setUnlockedLetters((prev) => [...prev, letter]);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.setMuted(nextMuted);
  };

  const handleToggleMusic = () => {
    const nextState = sounds.toggleBackgroundMusic();
    setIsMusicPlaying(nextState);
  };

  const handleToggleLanguage = () => {
    const nextLang: Language = language === 'nl' ? 'en' : 'nl';
    setLanguage(nextLang);
    if (nextLang === 'nl') {
      sounds.speak('Nederlands gekozen! Welkom bij ABC Kids!', 'nl');
    } else {
      sounds.speak('English selected! Welcome to ABC Kids!', 'en');
    }
  };

  const handleSelectVoiceStyle = (style: VoiceStyle) => {
    setVoiceStyle(style);
    sounds.setVoiceStyle(style);
  };

  const gameCards: {
    id: GameMode;
    titleNl: string;
    titleEn: string;
    subtitleNl: string;
    subtitleEn: string;
    icon: string;
    badgeNl: string;
    badgeEn: string;
    bgGradient: string;
    borderShadow: string;
  }[] = [
    {
      id: 'alphabet-puzzle',
      titleNl: '🧩 Letter Puzzels',
      titleEn: '🧩 Alphabet Puzzles',
      subtitleNl: 'Schuif en leg de puzzelstukjes om de letter te maken!',
      subtitleEn: 'Move and fit puzzle pieces together to build letters!',
      icon: '🧩',
      badgeNl: '🧩 NIEUW!',
      badgeEn: '🧩 NEW!',
      bgGradient: 'from-amber-500 via-rose-500 to-indigo-600',
      borderShadow: '#881337',
    },
    {
      id: 'halloween-pop',
      titleNl: '🎃 Halloween Spookjes Ploppen',
      titleEn: '🎃 Halloween Spooky Pop',
      subtitleNl: 'Plop vliegende pompoenen, spookjes & vleermuizen!',
      subtitleEn: 'Pop floating pumpkins, ghosts & bats!',
      icon: '🎃',
      badgeNl: '🎃 NIEUW!',
      badgeEn: '🎃 NEW!',
      bgGradient: 'from-orange-600 via-purple-700 to-slate-900',
      borderShadow: '#581c87',
    },
    {
      id: 'color-grading',
      titleNl: '🎨 Kleur & Gradiënt ABC',
      titleEn: '🎨 Color Grading ABC',
      subtitleNl: 'Sorteer tinten, regenboog spectrum & verf met gradiënten!',
      subtitleEn: 'Sort shades light-to-dark, rainbow spectrum & paint gradients!',
      icon: '🎨',
      badgeNl: '🎨 3 Speltypes!',
      badgeEn: '🎨 3 Game Types!',
      bgGradient: 'from-pink-500 via-purple-600 to-indigo-700',
      borderShadow: '#701a75',
    },
    {
      id: 'lore-speller',
      titleNl: '🎃 Halloween & Woordjes',
      titleEn: '🎃 Halloween & Words',
      subtitleNl: 'Spel spookjes, fruit, speelgoed & dieren!',
      subtitleEn: 'Spell spooky words, fruits, toys & animals!',
      icon: '👻',
      badgeNl: '🎃 Randomizer!',
      badgeEn: '🎃 Randomizer!',
      bgGradient: 'from-purple-700 via-indigo-700 to-slate-900',
      borderShadow: '#312e81',
    },
    {
      id: 'toddler-counting',
      titleNl: '🔢 Peuter Telspelletje',
      titleEn: '🔢 Toddler Counting',
      subtitleNl: 'Tel pompoenen, spookjes, appels & diertjes (1-10)!',
      subtitleEn: 'Count pumpkins, ghosts, apples & animals (1-10)!',
      icon: '🔢',
      badgeNl: '🔢 NIEUW!',
      badgeEn: '🔢 NEW!',
      bgGradient: 'from-emerald-500 via-teal-600 to-cyan-700',
      borderShadow: '#065f46',
    },
    {
      id: 'lore-characters',
      titleNl: '👾 Alphabet Lore Figuren',
      titleEn: '👾 Alphabet Lore Friends',
      subtitleNl: 'Ontdek alle 26 karakters van A tot Z!',
      subtitleEn: 'Explore all 26 characters A to Z!',
      icon: '👑',
      badgeNl: '👾 Soundboard',
      badgeEn: '👾 Soundboard',
      bgGradient: 'from-fuchsia-600 via-purple-600 to-indigo-800',
      borderShadow: '#4c1d95',
    },
    {
      id: 'autumn-leaves',
      titleNl: 'Herfstblaadjes Vangen',
      titleEn: 'Autumn Leaf Catch',
      subtitleNl: 'Vang vallende blaadjes, eikels en pompoenen!',
      subtitleEn: 'Catch falling leaves, acorns and pumpkins!',
      icon: '🍂',
      badgeNl: '🍁 Herfstwereld',
      badgeEn: '🍁 Autumn World',
      bgGradient: 'from-amber-500 via-orange-500 to-amber-700',
      borderShadow: '#b45309',
    },
    {
      id: 'puddle-splash',
      titleNl: 'Plassen Springen',
      titleEn: 'Puddle Splash & Hop',
      subtitleNl: 'Trek je laarzen aan en spring in de plassen!',
      subtitleEn: 'Put on rainboots and jump into puddles!',
      icon: '👢',
      badgeNl: '💦 Spetter Pret!',
      badgeEn: '💦 Splash Fun!',
      bgGradient: 'from-cyan-400 via-sky-500 to-blue-600',
      borderShadow: '#0369a1',
    },
    {
      id: 'dutch-world',
      titleNl: 'Nederlandse Wereld',
      titleEn: 'Dutch World & Words',
      subtitleNl: 'Herfst, dieren, fietsen & Hollandse woordjes!',
      subtitleEn: 'Autumn, animals, bikes & Dutch vocab!',
      icon: '🚲',
      badgeNl: '🇳🇱 Ontdekken',
      badgeEn: '🇳🇱 Learn Dutch',
      bgGradient: 'from-orange-500 via-amber-500 to-yellow-500',
      borderShadow: '#c2410c',
    },
    {
      id: 'letter-friends',
      titleNl: 'Letter Vriendjes',
      titleEn: 'Letter Friends',
      subtitleNl: 'Zoek het vrolijke lettermonstertje!',
      subtitleEn: 'Find the matching letter friend!',
      icon: '👾',
      badgeNl: 'Populair',
      badgeEn: 'Favorite',
      bgGradient: 'from-amber-400 to-orange-500',
      borderShadow: '#b45309',
    },
    {
      id: 'balloon-pop',
      titleNl: 'Ballonnen Ploppen',
      titleEn: 'Balloon Pop ABC',
      subtitleNl: 'Plop vliegende ballonnen en leer klanken!',
      subtitleEn: 'Pop balloons & hear letter sounds!',
      icon: '🎈',
      badgeNl: 'Super Pret!',
      badgeEn: 'Super Fun!',
      bgGradient: 'from-sky-400 to-blue-600',
      borderShadow: '#1e40af',
    },
    {
      id: 'monster-snack',
      titleNl: 'Voer het Monster',
      titleEn: 'Feed the Monster',
      subtitleNl: 'Geef lekkere letterkoekjes aan Smul-Monster!',
      subtitleEn: 'Feed letter cookies to hungry Grumble!',
      icon: '🍪',
      badgeNl: 'Grappig!',
      badgeEn: 'Silly & Funny',
      bgGradient: 'from-emerald-400 to-teal-600',
      borderShadow: '#0f766e',
    },
    {
      id: 'letter-trace',
      titleNl: 'Magisch Tekenen',
      titleEn: 'Magic Tracing',
      subtitleNl: 'Teken letters met glinsterende sterren!',
      subtitleEn: 'Draw letters with rainbow sparkles!',
      icon: '✍️',
      badgeNl: 'Letters Schrijven',
      badgeEn: 'Learn Writing',
      bgGradient: 'from-purple-400 to-indigo-600',
      borderShadow: '#4338ca',
    },
    {
      id: 'phonics-match',
      titleNl: 'Plaatjes & Klanken',
      titleEn: 'Picture & Sound',
      subtitleNl: 'B voor Beer & H voor Herfst!',
      subtitleEn: 'A for Apple & B for Bear!',
      icon: '🍎',
      badgeNl: 'Klankenspel',
      badgeEn: 'Phonics Fun',
      bgGradient: 'from-rose-400 to-pink-600',
      borderShadow: '#be185d',
    },
    {
      id: 'music-piano',
      titleNl: 'Muzikale Regenboog Piano',
      titleEn: 'Musical ABC Piano',
      subtitleNl: 'Speel muziek en zing het ABC liedje!',
      subtitleEn: 'Play songs & sing ABC together!',
      icon: '🎹',
      badgeNl: 'Samen Zingen',
      badgeEn: 'Sing Along',
      bgGradient: 'from-yellow-400 to-amber-600',
      borderShadow: '#b45309',
    },
    {
      id: 'sticker-book',
      titleNl: 'Mijn Sticker Boek',
      titleEn: 'My Sticker Album',
      subtitleNl: 'Plak je verzamelde stickers in het herfstbos!',
      subtitleEn: 'Create scenes with collected stickers!',
      icon: '🌟',
      badgeNl: `${unlockedLetters.length}/26 Vrij`,
      badgeEn: `${unlockedLetters.length}/26 Collected`,
      bgGradient: 'from-fuchsia-400 to-purple-600',
      borderShadow: '#7e22ce',
    },
  ];

  const currentGame = gameCards.find((g) => g.id === currentMode);
  const currentTitle = currentGame
    ? language === 'nl'
      ? currentGame.titleNl
      : currentGame.titleEn
    : undefined;

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-sky-400 select-none">
      {/* Background playful dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(circle, #ffffff 15%, transparent 15%), radial-gradient(circle, #ffffff 15%, transparent 15%)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
        }}
      />

      {/* Confetti celebration canvas */}
      <ConfettiCanvas />

      {/* Cheerful Kids Celebration Overlays & Milestone Fanfare */}
      <CheerCelebration streak={streak} language={language} />

      {/* Top Header Bar */}
      <GameHeader
        onBackToMenu={() => {
          setCurrentMode('menu');
          sounds.speak(language === 'nl' ? 'Kies een leuk spelletje!' : 'Pick a fun game!', language);
        }}
        onRepeatAudio={
          currentMode === 'letter-friends' ||
          currentMode === 'phonics-match' ||
          currentMode === 'monster-snack' ||
          currentMode === 'dutch-world' ||
          currentMode === 'autumn-leaves' ||
          currentMode === 'puddle-splash' ||
          currentMode === 'toddler-counting' ||
          currentMode === 'color-grading' ||
          currentMode === 'alphabet-puzzle' ||
          currentMode === 'halloween-pop'
            ? () => {
                const cheersNl = ['Jij kan dit!', 'Goed kijken!', 'Wat denk jij?', 'Tik maar!', 'Super bezig!'];
                const cheersEn = ['You can do it!', 'Look closely!', 'What do you think?', 'Tap your pick!', 'Doing great!'];
                const pick = language === 'nl'
                  ? cheersNl[Math.floor(Math.random() * cheersNl.length)]
                  : cheersEn[Math.floor(Math.random() * cheersEn.length)];
                sounds.speak(pick, language);
              }
            : undefined
        }
        stars={stars}
        streak={streak}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={handleToggleMusic}
        onOpenDeployInfo={() => setShowDeployModal(true)}
        onOpenVoiceSettings={() => setShowVoiceModal(true)}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        title={currentTitle}
      />

      {/* Main Play Area */}
      <main className="relative flex-1 w-full h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] overflow-hidden flex flex-col items-center justify-center p-1 sm:p-2">
        {currentMode === 'menu' && (
          <div className="w-full h-full max-w-5xl mx-auto flex flex-col items-center justify-between py-1 sm:py-2 px-3 sm:px-4 overflow-y-auto scrollbar-none">
            {/* Title Lockup */}
            <div className="flex flex-col items-center text-center mt-0.5">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-3xl sm:text-4xl animate-kid-bounce">🍂</span>
                <h1
                  className="text-3xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-lg tracking-wide"
                  style={{ textShadow: '0 5px 0 #0284c7' }}
                >
                  {language === 'nl' ? 'ABC Kids & Herfstwereld' : 'ABC Kids & Autumn World'}
                </h1>
                <span
                  className="text-3xl sm:text-4xl animate-kid-bounce"
                  style={{ animationDelay: '0.3s' }}
                >
                  🍁
                </span>
              </div>
              <p className="text-white/95 text-xs sm:text-base font-bold drop-shadow mt-0.5">
                {language === 'nl'
                  ? 'Vrolijke herfstspelletjes en Nederlandse woordjes met zachte lieve juf!'
                  : 'Fun autumn games & Dutch learning for toddlers with soft gentle voice!'}
              </p>
            </div>

            {/* Quick Hero Banner / Play CTA buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 my-1.5">
              {/* Alphabet Puzzle CTA */}
              <button
                onClick={() => {
                  sounds.playPop();
                  fireConfettiBurst('rainbow');
                  setCurrentMode('alphabet-puzzle');
                  if (language === 'nl') {
                    sounds.speak('Welkom bij de letter puzzels! Laten we puzzelen!', 'nl');
                  } else {
                    sounds.speak('Welcome to Alphabet Puzzles! Let us solve puzzles!', 'en');
                  }
                }}
                className="group px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white rounded-full font-black text-lg sm:text-xl shadow-[0_6px_0_#881337] active:translate-y-1.5 active:shadow-none transition-all flex items-center gap-2 cursor-pointer animate-pulse-glow"
              >
                <span className="text-2xl animate-spin">🧩</span>
                <span>
                  {language === 'nl' ? 'LETTER PUZZELS! 🧩' : 'ALPHABET PUZZLES! 🧩'}
                </span>
              </button>

              {/* Halloween Pop CTA */}
              <button
                onClick={() => {
                  sounds.playGhost();
                  fireConfettiBurst('halloween');
                  setCurrentMode('halloween-pop');
                  if (language === 'nl') {
                    sounds.speak('Welkom bij Halloween Spookjes Ploppen! Plop ze allemaal!', 'nl');
                  } else {
                    sounds.speak('Welcome to Halloween Spooky Pop! Pop them all!', 'en');
                  }
                }}
                className="group px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-600 via-purple-700 to-slate-900 hover:from-orange-500 hover:to-purple-600 text-white rounded-full font-black text-lg sm:text-xl shadow-[0_6px_0_#581c87] active:translate-y-1.5 active:shadow-none transition-all flex items-center gap-2 cursor-pointer animate-pulse-glow"
              >
                <span className="text-2xl animate-kid-bounce">🎃</span>
                <span>
                  {language === 'nl' ? 'SPOOKJES PLOPPEN! 🎃' : 'SPOOKY POP! 🎃'}
                </span>
              </button>

              {/* Halloween Lore Speller CTA */}
              <button
                onClick={() => {
                  sounds.playGhost();
                  fireConfettiBurst('halloween');
                  setCurrentMode('lore-speller');
                  if (language === 'nl') {
                    sounds.speak('Boe! Welkom bij Halloween Woordjes Spellen!', 'nl');
                  } else {
                    sounds.speak('Boo! Welcome to Halloween Word Speller!', 'en');
                  }
                }}
                className="group px-5 sm:px-7 py-2.5 sm:py-3 bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-600 hover:to-indigo-500 text-white rounded-full font-black text-lg sm:text-xl shadow-[0_6px_0_#312e81] active:translate-y-1.5 active:shadow-none transition-all flex items-center gap-2 cursor-pointer animate-pulse-glow"
              >
                <span className="text-2xl animate-kid-bounce">👻</span>
                <span>
                  {language === 'nl' ? 'HALLOWEEN SPELLEN! 🎃' : 'HALLOWEEN SPELLER! 🎃'}
                </span>
              </button>

              {/* Color Grading CTA */}
              <button
                onClick={() => {
                  sounds.playColorChime(0.6);
                  fireConfettiBurst('rainbow');
                  setCurrentMode('color-grading');
                  if (language === 'nl') {
                    sounds.speak('Welkom bij Kleur en Gradiënt Spelletjes!', 'nl');
                  } else {
                    sounds.speak('Welcome to Color Grading and Gradient Games!', 'en');
                  }
                }}
                className="group px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white rounded-full font-black text-lg sm:text-xl shadow-[0_6px_0_#9d174d] active:translate-y-1.5 active:shadow-none transition-all flex items-center gap-2 cursor-pointer animate-kid-bounce"
              >
                <span className="text-2xl animate-spin">🎨</span>
                <span>
                  {language === 'nl' ? 'KLEUR GRADIËNT! 🌈' : 'COLOR GRADING! 🌈'}
                </span>
              </button>

              {/* Toddler Counting CTA */}
              <button
                onClick={() => {
                  sounds.playPop();
                  fireConfettiBurst('rainbow');
                  setCurrentMode('toddler-counting');
                  if (language === 'nl') {
                    sounds.speak('Welkom bij het telspelletje! Laten we tellen!', 'nl');
                  } else {
                    sounds.speak('Welcome to the counting game! Let us count together!', 'en');
                  }
                }}
                className="group px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-full font-black text-lg sm:text-xl shadow-[0_6px_0_#065f46] active:translate-y-1.5 active:shadow-none transition-all flex items-center gap-2 cursor-pointer animate-kid-wiggle"
              >
                <span className="text-2xl animate-kid-bounce">🔢</span>
                <span>
                  {language === 'nl' ? 'TEL DE SPOOKJES & APPELS! 🍎' : 'COUNTING FUN! 🍎'}
                </span>
              </button>

              {/* Autumn Leaf Game CTA */}
              <button
                onClick={() => {
                  sounds.playRustle();
                  fireConfettiBurst('autumn');
                  setCurrentMode('autumn-leaves');
                  if (language === 'nl') {
                    sounds.speak('Welkom in het herfstbos! Vang de vallende blaadjes!', 'nl');
                  } else {
                    sounds.speak('Welcome to the autumn woods! Catch the falling leaves!', 'en');
                  }
                }}
                className="group px-5 sm:px-6 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-full font-black text-lg sm:text-xl shadow-[0_6px_0_#b45309] active:translate-y-1.5 active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="text-2xl animate-spin">🍁</span>
                <span>
                  {language === 'nl' ? 'HERFSTBLAADJES!' : 'AUTUMN LEAVES!'}
                </span>
              </button>

              {/* Rain Puddle Splash CTA */}
              <button
                onClick={() => {
                  sounds.playSplash();
                  fireConfettiBurst('autumn');
                  setCurrentMode('puddle-splash');
                  if (language === 'nl') {
                    sounds.speak('Plons! Trek je laarzen aan en spring in de plassen!', 'nl');
                  } else {
                    sounds.speak('Splash! Put on boots and jump in puddles!', 'en');
                  }
                }}
                className="group px-5 sm:px-7 py-2.5 sm:py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full font-black text-lg sm:text-xl shadow-[0_6px_0_#0369a1] active:translate-y-1.5 active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="text-2xl">👢</span>
                <span>
                  {language === 'nl' ? 'PLASSEN SPRINGEN! 💦' : 'PUDDLE SPLASH! 💦'}
                </span>
              </button>

              {/* Voice button reminder */}
              <button
                onClick={() => setShowVoiceModal(true)}
                className="px-3.5 py-2 bg-pink-100 hover:bg-pink-200 text-pink-900 rounded-full font-black text-xs sm:text-sm border-2 border-pink-300 shadow-sm flex items-center gap-1.5 cursor-pointer"
                title="Kies zachte jonge vrouwenstem"
              >
                <span>🌸</span>
                <span>{language === 'nl' ? 'Zachte Juf Stem' : 'Soft Lady Voice'}</span>
              </button>
            </div>

            {/* Grid of 10 Game Modes */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 my-auto pb-2 max-w-5xl">
              {gameCards.map((game) => (
                <button
                  key={game.id}
                  onClick={() => {
                    sounds.playPop();
                    setCurrentMode(game.id);
                    const titleToSpeak = language === 'nl' ? game.titleNl : game.titleEn;
                    sounds.speak(
                      language === 'nl'
                        ? `Laten we ${titleToSpeak} spelen!`
                        : `Let's play ${titleToSpeak}!`,
                      language
                    );
                  }}
                  className={`group relative rounded-[2rem] p-2.5 sm:p-3 bg-gradient-to-br ${game.bgGradient} text-white flex flex-col items-center justify-between shadow-xl cursor-pointer transition-all active:translate-y-2 active:scale-95 hover:scale-[1.02] border-2 border-white/40`}
                  style={{
                    boxShadow: `0 7px 0 ${game.borderShadow}, 0 14px 18px rgba(0,0,0,0.2)`,
                  }}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full mb-1">
                    {language === 'nl' ? game.badgeNl : game.badgeEn}
                  </span>

                  <div className="text-3xl sm:text-4xl my-1 group-hover:scale-110 transition-transform">
                    {game.icon}
                  </div>

                  <div className="text-center">
                    <h3 className="text-sm sm:text-base font-black drop-shadow leading-tight">
                      {language === 'nl' ? game.titleNl : game.titleEn}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-white/85 font-medium leading-tight mt-0.5 hidden sm:block">
                      {language === 'nl' ? game.subtitleNl : game.subtitleEn}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer Parent / Voice / GitHub Pages Deploy Prompt */}
            <div className="w-full flex items-center justify-between text-xs text-white/80 font-bold px-2 py-1">
              <span>
                {language === 'nl'
                  ? '🍂 Herfstwereld & Nederlandse Woordjes voor peuters 📱'
                  : '🍂 Autumn World & Dutch Learning for toddlers 📱'}
              </span>
              <button
                onClick={() => setShowDeployModal(true)}
                className="underline hover:text-white cursor-pointer"
              >
                {language === 'nl'
                  ? 'Ouders & GitHub Pages Handleiding'
                  : 'Grown-Ups & Deploy Guide'}
              </button>
            </div>
          </div>
        )}

        {/* Game 0: Halloween & Alphabet Lore Word Speller */}
        {currentMode === 'lore-speller' && (
          <LoreSpellerGame
            onEarnStar={handleEarnStar}
            onUnlockSticker={handleUnlockSticker}
            language={language}
          />
        )}

        {/* Game 0.2: Toddler Counting Game */}
        {currentMode === 'toddler-counting' && (
          <ToddlerCountingGame onEarnStar={handleEarnStar} language={language} />
        )}

        {/* Game 0.3: Color Grading ABC */}
        {currentMode === 'color-grading' && (
          <ColorGradingGame
            onEarnStar={handleEarnStar}
            onUnlockSticker={handleUnlockSticker}
            language={language}
          />
        )}

        {/* Game 0.4: Alphabet Puzzle Game */}
        {currentMode === 'alphabet-puzzle' && (
          <AlphabetPuzzleGame
            onEarnStar={handleEarnStar}
            onUnlockSticker={handleUnlockSticker}
            language={language}
          />
        )}

        {/* Game 0.45: Halloween Pop Characters Game */}
        {currentMode === 'halloween-pop' && (
          <HalloweenPopGame
            onEarnStar={handleEarnStar}
            onUnlockSticker={handleUnlockSticker}
            language={language}
          />
        )}

        {/* Game 0.5: Alphabet Lore Characters Showcase & Playground */}
        {currentMode === 'lore-characters' && (
          <LoreCharactersGame onEarnStar={handleEarnStar} language={language} />
        )}

        {/* Game 1: Autumn Leaf Catch */}
        {currentMode === 'autumn-leaves' && (
          <AutumnLeavesGame
            onEarnStar={handleEarnStar}
            onUnlockSticker={handleUnlockSticker}
            language={language}
          />
        )}

        {/* Game 2: Puddle Splash & Hop */}
        {currentMode === 'puddle-splash' && (
          <PuddleSplashGame
            onEarnStar={handleEarnStar}
            onUnlockSticker={handleUnlockSticker}
            language={language}
          />
        )}

        {/* Game 3: Dutch World & Autumn Vocabulary */}
        {currentMode === 'dutch-world' && (
          <DutchWorldGame onEarnStar={handleEarnStar} language={language} />
        )}

        {/* Game 4: Letter Friends */}
        {currentMode === 'letter-friends' && (
          <LetterFriendsGame
            onEarnStar={handleEarnStar}
            onUnlockSticker={handleUnlockSticker}
            stars={stars}
            language={language}
          />
        )}

        {/* Game 5: Balloon Pop ABC */}
        {currentMode === 'balloon-pop' && (
          <BalloonPopGame
            onEarnStar={handleEarnStar}
            onUnlockSticker={handleUnlockSticker}
            language={language}
          />
        )}

        {/* Game 6: Feed the Monster */}
        {currentMode === 'monster-snack' && (
          <MonsterSnackGame
            onEarnStar={handleEarnStar}
            onUnlockSticker={handleUnlockSticker}
            language={language}
          />
        )}

        {/* Game 7: Letter Tracing */}
        {currentMode === 'letter-trace' && (
          <LetterTraceGame
            onEarnStar={handleEarnStar}
            onUnlockSticker={handleUnlockSticker}
            language={language}
          />
        )}

        {/* Game 8: Phonics & Picture Match */}
        {currentMode === 'phonics-match' && (
          <PhonicsMatchGame
            onEarnStar={handleEarnStar}
            onUnlockSticker={handleUnlockSticker}
            language={language}
          />
        )}

        {/* Game 9: Musical Piano */}
        {currentMode === 'music-piano' && (
          <MusicalPianoGame onEarnStar={handleEarnStar} language={language} />
        )}

        {/* Game 10: Sticker Book */}
        {currentMode === 'sticker-book' && (
          <StickerBookGame unlockedLetters={unlockedLetters} language={language} />
        )}
      </main>

      {/* Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        currentStyle={voiceStyle}
        onSelectStyle={handleSelectVoiceStyle}
        language={language}
      />

      {/* GitHub Pages Deployment & Grown-Ups Modal */}
      <GitHubPagesModal
        isOpen={showDeployModal}
        onClose={() => setShowDeployModal(false)}
      />
    </div>
  );
}
