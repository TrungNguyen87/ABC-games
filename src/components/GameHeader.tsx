import React from 'react';
import { Volume2, VolumeX, Music, RotateCcw, Home, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { Language } from '../types/game';

interface GameHeaderProps {
  onBackToMenu: () => void;
  onRepeatAudio?: () => void;
  stars: number;
  streak: number;
  isMuted: boolean;
  onToggleMute: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  onOpenDeployInfo: () => void;
  onOpenVoiceSettings: () => void;
  language: Language;
  onToggleLanguage: () => void;
  title?: string;
}

export default function GameHeader({
  onBackToMenu,
  onRepeatAudio,
  stars,
  streak,
  isMuted,
  onToggleMute,
  isMusicPlaying,
  onToggleMusic,
  onOpenDeployInfo,
  onOpenVoiceSettings,
  language,
  onToggleLanguage,
  title,
}: GameHeaderProps) {
  return (
    <header className="w-full flex items-center justify-between px-3 sm:px-6 py-2 z-30 select-none">
      {/* Left: Big Home Button + Game Title */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            sounds.playBoing();
            onBackToMenu();
          }}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-2xl flex items-center justify-center font-bold text-lg shadow-[0_5px_0_#b45309] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          title="Back to games"
          aria-label="Back to games"
        >
          <Home className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
        </button>

        {title && (
          <span className="hidden md:inline-block text-xl font-bold text-white drop-shadow-md ml-2">
            {title}
          </span>
        )}
      </div>

      {/* Center: Star counter cluster */}
      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border-2 border-white/40 shadow-sm">
        <span className="text-2xl sm:text-3xl animate-bounce">⭐</span>
        <span className="text-2xl sm:text-3xl font-extrabold text-yellow-300 drop-shadow-[0_2px_0_rgba(0,0,0,0.3)] tabular-nums">
          {stars}
        </span>
        {streak > 1 && (
          <span className="text-xs sm:text-sm font-bold text-white bg-amber-500/80 px-2 py-0.5 rounded-full">
            {streak}x
          </span>
        )}
      </div>

      {/* Right: Language Toggle + Voice Style + Sound Controls + Repeat Audio */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Language Switcher (Dutch / English) */}
        <button
          onClick={() => {
            sounds.playPop();
            onToggleLanguage();
          }}
          className="px-2.5 sm:px-3 h-11 sm:h-12 bg-white/35 hover:bg-white/50 text-slate-900 rounded-2xl flex items-center gap-1.5 font-black text-sm sm:text-base shadow-[0_4px_0_rgba(0,0,0,0.15)] active:translate-y-1 active:shadow-none transition-all cursor-pointer border border-white/40"
          title={language === 'nl' ? 'Switch to English' : 'Schakel naar Nederlands'}
          aria-label="Taal wisselen / Toggle Language"
        >
          <span className="text-lg">{language === 'nl' ? '🇳🇱' : '🇬🇧'}</span>
          <span className="font-extrabold">{language === 'nl' ? 'NL' : 'EN'}</span>
        </button>

        {/* Soft Young Lady Voice Settings button */}
        <button
          onClick={() => {
            sounds.playPop();
            onOpenVoiceSettings();
          }}
          className="w-11 h-11 sm:w-12 sm:h-12 bg-pink-400 hover:bg-pink-300 text-pink-950 rounded-2xl flex items-center justify-center font-bold shadow-[0_4px_0_#9d174d] active:translate-y-1 active:shadow-none transition-all cursor-pointer text-xl"
          title={language === 'nl' ? 'Stem kiezen (Zachte Juf)' : 'Choose voice (Soft Lady)'}
          aria-label="Stem kiezen / Choose Voice"
        >
          🌸
        </button>

        {onRepeatAudio && (
          <button
            onClick={() => {
              sounds.playPop();
              onRepeatAudio();
            }}
            className="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 rounded-2xl flex items-center justify-center font-bold shadow-[0_4px_0_#047857] active:translate-y-1 active:shadow-none transition-all cursor-pointer animate-pulse"
            title="Hear instruction again"
            aria-label="Hear instruction again"
          >
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>
        )}

        {/* Music toggle */}
        <button
          onClick={() => {
            sounds.playPop();
            onToggleMusic();
          }}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-bold transition-all cursor-pointer ${
            isMusicPlaying
              ? 'bg-purple-400 text-purple-950 shadow-[0_4px_0_#6b21a8]'
              : 'bg-white/35 text-slate-800 shadow-[0_4px_0_rgba(0,0,0,0.15)] opacity-80'
          } active:translate-y-1 active:shadow-none`}
          title={isMusicPlaying ? 'Turn music off' : 'Play cheerful music'}
          aria-label={isMusicPlaying ? 'Turn music off' : 'Play cheerful music'}
        >
          <Music className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Mute toggle */}
        <button
          onClick={() => {
            sounds.playPop();
            onToggleMute();
          }}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-bold transition-all cursor-pointer ${
            !isMuted
              ? 'bg-blue-400 text-blue-950 shadow-[0_4px_0_#1e3a8a]'
              : 'bg-rose-400 text-rose-950 shadow-[0_4px_0_#881337]'
          } active:translate-y-1 active:shadow-none`}
          title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </button>

        {/* Parent / GitHub Pages Guide */}
        <button
          onClick={() => {
            sounds.playPop();
            onOpenDeployInfo();
          }}
          className="w-11 h-11 sm:w-12 sm:h-12 bg-white/35 hover:bg-white/50 text-slate-800 rounded-2xl flex items-center justify-center font-bold shadow-[0_4px_0_rgba(0,0,0,0.15)] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          title="Parents Guide & GitHub Pages Deploy"
          aria-label="Parents Guide & GitHub Pages Deploy"
        >
          <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </header>
  );
}
