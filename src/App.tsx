import React, { useState, useEffect } from 'react';
import { GameMode, LetterInfo, Language, VoiceStyle, AppTheme } from './types/game';
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
  const [appTheme, setAppTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('abc_kids_theme') as AppTheme;
    return saved || 'sinterklaas';
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

  useEffect(() => {
    localStorage.setItem('abc_kids_theme', appTheme);
  }, [appTheme]);

  const handleCycleTheme = () => {
    const themes: AppTheme[] = ['sinterklaas', 'christmas', 'halloween', 'autumn', 'classic'];
    const nextIdx = (themes.indexOf(appTheme) + 1) % themes.length;
    const nextTheme = themes[nextIdx];
    setAppTheme(nextTheme);

    const themeNames = {
      sinterklaas: language === 'nl' ? 'Sinterklaas Thema!' : 'Sinterklaas Theme!',
      christmas: language === 'nl' ? 'Kerstmis Thema!' : 'Christmas Theme!',
      halloween: language === 'nl' ? 'Halloween Thema!' : 'Halloween Theme!',
      autumn: language === 'nl' ? 'Herfst Thema!' : 'Autumn Theme!',
      classic: language === 'nl' ? 'Regenboog Thema!' : 'Rainbow Theme!',
    };
    sounds.speak(themeNames[nextTheme], language);
  };

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
      titleNl: '👑 Sint, Kerst & Spellen',
      titleEn: '👑 Sint, Xmas & Spell',
      subtitleNl: 'Sleep letters! Spel Sint, Kerst, Halloween & diertjes!',
      subtitleEn: 'Drag & drop letters! Spell Sint, Christmas & animals!',
      icon: '👑',
      badgeNl: '👑 Sint & Kerst!',
      badgeEn: '👑 Holiday Themes!',
      bgGradient: 'from-amber-600 via-red-600 to-purple-800',
      borderShadow: '#78350f',
    },
    {
      id: 'toddler-counting',
      titleNl: '🔢 Peuter Telspelletje',
      titleEn: '🔢 Toddler Counting',
      subtitleNl: 'Tel pepernoten, cadeautjes, boompjes & spookjes (1-10)!',
      subtitleEn: 'Count holiday cookies, presents, trees & ghosts (1-10)!',
      icon: '🔢',
      badgeNl: '🍪 Sint & Kerst!',
      badgeEn: '🍪 Holiday Themes!',
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
      titleNl: 'Herfst & Feest Vangen',
      titleEn: 'Holiday & Leaf Catch',
      subtitleNl: 'Vang pepernoten, sneeuwvlokken of herfstblaadjes!',
      subtitleEn: 'Catch spiced cookies, snowflakes or autumn leaves!',
      icon: '🍂',
      badgeNl: '🍁 3 Thema\'s!',
      badgeEn: '🍁 3 Themes!',
      bgGradient: 'from-amber-500 via-orange-500 to-amber-700',
      borderShadow: '#b45309',
    },
    {
      id: 'puddle-splash',
      titleNl: 'Plassen & Daken Springen',
      titleEn: 'Puddle & Roof Hopping',
      subtitleNl: 'Rij met Amerigo over de daken of spring in plassen!',
      subtitleEn: 'Ride Amerigo across rooftops or splash in puddles!',
      icon: '🐴',
      badgeNl: '🐴 Amerigo & Sneeuw',
      badgeEn: '🐴 Amerigo & Snow',
      bgGradient: 'from-cyan-400 via-sky-500 to-blue-600',
      borderShadow: '#0369a1',
    },
    {
      id: 'dutch-world',
      titleNl: 'Nederlandse Wereld',
      titleEn: 'Dutch World & Words',
      subtitleNl: 'Sinterklaas, Kerstmis, herfst & Hollandse woordjes!',
      subtitleEn: 'Sinterklaas, Christmas, autumn & Dutch vocab!',
      icon: '🇳🇱',
      badgeNl: '🇳🇱 Sint & Kerst',
      badgeEn: '🇳🇱 Holiday Vocab',
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
      titleNl: 'Ballonnen & Plaatjes',
      titleEn: 'Balloon Pop & Pictures',
      subtitleNl: 'Plop ballonnen en zie het juiste plaatje & woord!',
      subtitleEn: 'Pop balloons & see matched picture & word!',
      icon: '🎈',
      badgeNl: '🎈 Met Plaatjes!',
      badgeEn: '🎈 With Pictures!',
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

  const themeDetails = (() => {
    switch (appTheme) {
      case 'sinterklaas':
        return {
          bgClass: 'bg-gradient-to-b from-red-700 via-amber-700 to-amber-900',
          icon1: '👑',
          icon2: '🎁',
          title: language === 'nl' ? 'ABC Kids & Sinterklaas Feest' : 'ABC Kids & Sinterklaas Feast',
          subtitle: language === 'nl'
            ? 'Pepernoten, het paard van Sinterklaas, pakjes & Nederlandse letterpret!'
            : 'Sinterklaas treats, Amerigo horse, presents & Dutch alphabet fun!',
          ctaPrimaryNl: '👑 SINT WOORDJES SPELLEN! 🎁',
          ctaPrimaryEn: '👑 SINT WORD SPELLER! 🎁',
          ctaPrimarySound: () => {
            sounds.playChime();
            fireConfettiBurst('stars');
            setCurrentMode('lore-speller');
            sounds.speak(
              language === 'nl'
                ? 'Welkom bij Sinterklaas Woordjes Spellen! Sleep de letters naar het woord!'
                : 'Welcome to Sinterklaas Word Speller! Drag the letters into the word!',
              language
            );
          },
          ctaSecondaryNl: '🍪 PEPERNOTEN TELLEN! 🔢',
          ctaSecondaryEn: '🍪 COUNT COOKIES & GIFTS! 🔢',
          ctaSecondarySound: () => {
            sounds.playPop();
            fireConfettiBurst('stars');
            setCurrentMode('toddler-counting');
            sounds.speak(
              language === 'nl'
                ? 'Tel de pepernoten en cadeautjes van Sinterklaas!'
                : 'Count the cookies and holiday presents!',
              language
            );
          },
          textShadow: '0 5px 0 #78350f',
        };
      case 'christmas':
        return {
          bgClass: 'bg-gradient-to-b from-emerald-800 via-teal-900 to-red-950',
          icon1: '🎄',
          icon2: '⭐',
          title: language === 'nl' ? 'ABC Kids & Kerstmis Wonder' : 'ABC Kids & Christmas Wonder',
          subtitle: language === 'nl'
            ? 'Kerstbomen, sneeuwpoppen, kerststerren & magische feestdagen woordjes!'
            : 'Christmas trees, snowmen, holiday bells & magical words!',
          ctaPrimaryNl: '🎄 KERSTMIS WOORDJES! ⭐',
          ctaPrimaryEn: '🎄 CHRISTMAS SPELLER! ⭐',
          ctaPrimarySound: () => {
            sounds.playChime();
            fireConfettiBurst('winter');
            setCurrentMode('lore-speller');
            sounds.speak(
              language === 'nl'
                ? 'Vrolijk Kerstfeest! Laten we magische kerstwoordjes spellen!'
                : 'Merry Christmas! Let us spell holiday words together!',
              language
            );
          },
          ctaSecondaryNl: '🔔 KERSTBOOM TELLEN! 🔢',
          ctaSecondaryEn: '🔔 COUNT XMAS TREES! 🔢',
          ctaSecondarySound: () => {
            sounds.playPop();
            fireConfettiBurst('winter');
            setCurrentMode('toddler-counting');
            sounds.speak(
              language === 'nl'
                ? 'Tel de kerstboompjes en gouden sterren!'
                : 'Count the Christmas trees and golden stars!',
              language
            );
          },
          textShadow: '0 5px 0 #064e3b',
        };
      case 'halloween':
        return {
          bgClass: 'bg-gradient-to-b from-purple-950 via-slate-900 to-orange-950',
          icon1: '🎃',
          icon2: '👻',
          title: language === 'nl' ? 'ABC Kids & Halloween Pret' : 'ABC Kids & Spooky Halloween',
          subtitle: language === 'nl'
            ? 'Vrolijke spookjes, pompoenen en grappige woordjes voor peuters!'
            : 'Friendly ghosts, pumpkins & funny toddler word puzzles!',
          ctaPrimaryNl: '👻 HALLOWEEN SPELLEN! 🎃',
          ctaPrimaryEn: '👻 HALLOWEEN SPELLER! 🎃',
          ctaPrimarySound: () => {
            sounds.playGhost();
            fireConfettiBurst('halloween');
            setCurrentMode('lore-speller');
            sounds.speak(
              language === 'nl'
                ? 'Boe! Welkom bij Halloween Woordjes Spellen!'
                : 'Boo! Welcome to Halloween Word Speller!',
              language
            );
          },
          ctaSecondaryNl: '🎃 TEL DE SPOOKJES! 🍎',
          ctaSecondaryEn: '🎃 COUNT SPOOKY GHOSTS! 🍎',
          ctaSecondarySound: () => {
            sounds.playPop();
            fireConfettiBurst('halloween');
            setCurrentMode('toddler-counting');
            sounds.speak(
              language === 'nl'
                ? 'Tel de vrolijke spookjes en pompoenen!'
                : 'Count the friendly ghosts and pumpkins!',
              language
            );
          },
          textShadow: '0 5px 0 #312e81',
        };
      case 'autumn':
        return {
          bgClass: 'bg-gradient-to-b from-amber-600 via-orange-600 to-amber-900',
          icon1: '🍂',
          icon2: '🍁',
          title: language === 'nl' ? 'ABC Kids & Herfstwereld' : 'ABC Kids & Autumn World',
          subtitle: language === 'nl'
            ? 'Vrolijke herfstspelletjes en Nederlandse woordjes met zachte lieve juf!'
            : 'Fun autumn games & Dutch learning for toddlers with soft gentle voice!',
          ctaPrimaryNl: '🍁 HERFSTBLAADJES VANGEN! 🍂',
          ctaPrimaryEn: '🍁 AUTUMN LEAF CATCH! 🍂',
          ctaPrimarySound: () => {
            sounds.playRustle();
            fireConfettiBurst('autumn');
            setCurrentMode('autumn-leaves');
            sounds.speak(
              language === 'nl'
                ? 'Welkom in het herfstbos! Vang de vallende blaadjes!'
                : 'Welcome to the autumn woods! Catch the falling leaves!',
              language
            );
          },
          ctaSecondaryNl: '👢 PLASSEN SPRINGEN! 💦',
          ctaSecondaryEn: '👢 PUDDLE SPLASH! 💦',
          ctaSecondarySound: () => {
            sounds.playSplash();
            fireConfettiBurst('autumn');
            setCurrentMode('puddle-splash');
            sounds.speak(
              language === 'nl'
                ? 'Plons! Trek je laarzen aan en spring in de plassen!'
                : 'Splash! Put on boots and jump in puddles!',
              language
            );
          },
          textShadow: '0 5px 0 #b45309',
        };
      case 'classic':
      default:
        return {
          bgClass: 'bg-gradient-to-b from-sky-400 via-sky-500 to-blue-600',
          icon1: '🌈',
          icon2: '⭐',
          title: language === 'nl' ? 'ABC Kids & Regenboog Wereld' : 'ABC Kids & Rainbow World',
          subtitle: language === 'nl'
            ? 'Vrolijke leerzame spelletjes en Nederlandse woordjes voor peuters!'
            : 'Cheerful educational games & Dutch learning for happy toddlers!',
          ctaPrimaryNl: '🎈 BALLONNEN PLOPPEN! 🌟',
          ctaPrimaryEn: '🎈 BALLOON POP! 🌟',
          ctaPrimarySound: () => {
            sounds.playPop();
            fireConfettiBurst('rainbow');
            setCurrentMode('balloon-pop');
            sounds.speak(
              language === 'nl'
                ? 'Plop vliegende ballonnen en ontdek letters en plaatjes!'
                : 'Pop balloons and discover letters and pictures!',
              language
            );
          },
          ctaSecondaryNl: '🎨 KLEUR GRADIËNT! 🌈',
          ctaSecondaryEn: '🎨 COLOR GRADING! 🌈',
          ctaSecondarySound: () => {
            sounds.playColorChime(0.6);
            fireConfettiBurst('rainbow');
            setCurrentMode('color-grading');
            sounds.speak(
              language === 'nl'
                ? 'Welkom bij Kleur en Gradiënt Spelletjes!'
                : 'Welcome to Color Grading and Gradient Games!',
              language
            );
          },
          textShadow: '0 5px 0 #0284c7',
        };
    }
  })();

  return (
    <div className={`relative w-screen h-screen overflow-hidden flex flex-col ${themeDetails.bgClass} select-none transition-colors duration-500`}>
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
        appTheme={appTheme}
        onCycleTheme={handleCycleTheme}
      />

      {/* Main Play Area */}
      <main className="relative flex-1 w-full h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] overflow-hidden flex flex-col items-center justify-center p-1 sm:p-2">
        {currentMode === 'menu' && (
          <div className="w-full h-full max-w-5xl mx-auto flex flex-col items-center justify-between py-1 sm:py-2 px-3 sm:px-4 overflow-y-auto scrollbar-none">
            {/* Title Lockup */}
            <div className="flex flex-col items-center text-center mt-0.5">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-3xl sm:text-4xl animate-kid-bounce">{themeDetails.icon1}</span>
                <h1
                  className="text-3xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-lg tracking-wide"
                  style={{ textShadow: themeDetails.textShadow }}
                >
                  {themeDetails.title}
                </h1>
                <span
                  className="text-3xl sm:text-4xl animate-kid-bounce"
                  style={{ animationDelay: '0.3s' }}
                >
                  {themeDetails.icon2}
                </span>
              </div>
              <p className="text-white/95 text-xs sm:text-base font-bold drop-shadow mt-0.5">
                {themeDetails.subtitle}
              </p>
            </div>

            {/* Quick Hero Banner / Play CTA buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 my-1.5">
              {/* Primary Theme Action CTA */}
              <button
                onClick={themeDetails.ctaPrimarySound}
                className="group px-5 sm:px-7 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white rounded-full font-black text-lg sm:text-xl shadow-[0_6px_0_#78350f] active:translate-y-1.5 active:shadow-none transition-all flex items-center gap-2 cursor-pointer animate-pulse-glow"
              >
                <span className="text-2xl animate-kid-bounce">{themeDetails.icon1}</span>
                <span>
                  {language === 'nl' ? themeDetails.ctaPrimaryNl : themeDetails.ctaPrimaryEn}
                </span>
              </button>

              {/* Secondary Theme Action CTA */}
              <button
                onClick={themeDetails.ctaSecondarySound}
                className="group px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-full font-black text-lg sm:text-xl shadow-[0_6px_0_#065f46] active:translate-y-1.5 active:shadow-none transition-all flex items-center gap-2 cursor-pointer animate-kid-wiggle"
              >
                <span className="text-2xl animate-kid-bounce">{themeDetails.icon2}</span>
                <span>
                  {language === 'nl' ? themeDetails.ctaSecondaryNl : themeDetails.ctaSecondaryEn}
                </span>
              </button>

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
                className="group px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white rounded-full font-black text-lg sm:text-xl shadow-[0_6px_0_#881337] active:translate-y-1.5 active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="text-2xl animate-spin">🧩</span>
                <span>
                  {language === 'nl' ? 'LETTER PUZZELS! 🧩' : 'LETTER PUZZLES! 🧩'}
                </span>
              </button>

              {/* Balloon Pop with Pictures CTA */}
              <button
                onClick={() => {
                  sounds.playPop();
                  fireConfettiBurst('rainbow');
                  setCurrentMode('balloon-pop');
                  if (language === 'nl') {
                    sounds.speak('Plop de ballonnen en ontdek letters en plaatjes!', 'nl');
                  } else {
                    sounds.speak('Pop balloons to discover letters and pictures!', 'en');
                  }
                }}
                className="group px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-white rounded-full font-black text-lg sm:text-xl shadow-[0_6px_0_#1e40af] active:translate-y-1.5 active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="text-2xl animate-kid-bounce">🎈</span>
                <span>
                  {language === 'nl' ? 'BALLONNEN & PLAATJES! 🎈' : 'BALLOON POP & WORDS! 🎈'}
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
                  ? '👑 Sinterklaas, 🎄 Kerst, 🎃 Halloween & Nederlandse Woordjes voor peuters 📱'
                  : '👑 Sinterklaas, 🎄 Christmas, 🎃 Halloween & Dutch Learning for toddlers 📱'}
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
            initialTheme={appTheme}
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
