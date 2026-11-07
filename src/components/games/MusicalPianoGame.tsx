import React, { useState, useEffect, useRef } from 'react';
import { PIANO_KEYS, ABC_SONG_LYRICS_EN, ABC_SONG_LYRICS_NL } from '../../data/alphabetData';
import { Language } from '../../types/game';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { triggerKidCheer } from '../CheerCelebration';
import { Music, Play, Square, Sparkles, Volume2 } from 'lucide-react';

interface MusicalPianoGameProps {
  onEarnStar: () => void;
  language: Language;
}

export default function MusicalPianoGame({ onEarnStar, language }: MusicalPianoGameProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [singAlongIdx, setSingAlongIdx] = useState(0);
  const [instrument, setInstrument] = useState<'piano' | 'xylophone' | 'animal'>('xylophone');
  const songTimerRef = useRef<any>(null);

  const lyrics = language === 'nl' ? ABC_SONG_LYRICS_NL : ABC_SONG_LYRICS_EN;

  useEffect(() => {
    return () => {
      if (songTimerRef.current) clearInterval(songTimerRef.current);
    };
  }, []);

  const handleKeyTap = (key: typeof PIANO_KEYS[0]) => {
    setActiveKey(key.label);
    sounds.playNote(key.freq, instrument === 'xylophone' ? 0.3 : 0.6);

    const wordToSpeak = language === 'nl' ? key.wordNl : key.wordEn;

    if (instrument === 'animal') {
      sounds.speak(wordToSpeak, language);
    } else {
      sounds.speak(key.label, language);
    }

    setTimeout(() => {
      setActiveKey(null);
    }, 200);
  };

  const handleToggleSingAlong = () => {
    if (isPlayingSong) {
      if (songTimerRef.current) clearInterval(songTimerRef.current);
      setIsPlayingSong(false);
      setSingAlongIdx(0);
      sounds.stopSpeaking();
    } else {
      setIsPlayingSong(true);
      setSingAlongIdx(0);

      if (language === 'nl') {
        sounds.speak('Zing het ABC liedje met mij!', 'nl');
      } else {
        sounds.speak('Sing the ABC song with me!', 'en');
      }

      let step = 0;
      songTimerRef.current = setInterval(() => {
        if (step >= lyrics.length) {
          clearInterval(songTimerRef.current);
          setIsPlayingSong(false);
          sounds.playKidsCheer();
          fireConfettiBurst();
          triggerKidCheer({
            message: language === 'nl' ? 'MOOI GEZONGEN!' : 'SUPER SINGER!',
            emoji: '🎶',
          });
          onEarnStar();
          if (language === 'nl') {
            sounds.speak('Hoera! Wat mooi gezongen!', 'nl');
          } else {
            sounds.speak('Hooray! You sang the ABC song!', 'en');
          }
          return;
        }

        const lyric = lyrics[step];
        setSingAlongIdx(step);

        lyric.notes.forEach((f, i) => {
          setTimeout(() => {
            sounds.playNote(f, 0.35);
          }, i * 220);
        });

        sounds.speak(lyric.chunk, language);

        step++;
      }, 2600);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-2 px-3 sm:px-6 max-w-4xl mx-auto select-none">
      {/* Top Banner & Mode Toggle */}
      <div className="w-full flex flex-col items-center mt-1">
        <div className="flex items-center gap-3 mb-2">
          {/* Instrument Selector */}
          <div className="bg-white/30 backdrop-blur-md p-1 rounded-full flex gap-1 border border-white/50">
            <button
              onClick={() => {
                setInstrument('xylophone');
                sounds.playPop();
              }}
              className={`px-3 py-1 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer ${
                instrument === 'xylophone'
                  ? 'bg-yellow-400 text-yellow-950 shadow-sm'
                  : 'text-white hover:text-white/80'
              }`}
            >
              🔔 {language === 'nl' ? 'Xylofoon' : 'Xylophone'}
            </button>
            <button
              onClick={() => {
                setInstrument('piano');
                sounds.playPop();
              }}
              className={`px-3 py-1 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer ${
                instrument === 'piano'
                  ? 'bg-yellow-400 text-yellow-950 shadow-sm'
                  : 'text-white hover:text-white/80'
              }`}
            >
              🎹 Piano
            </button>
            <button
              onClick={() => {
                setInstrument('animal');
                sounds.playPop();
              }}
              className={`px-3 py-1 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer ${
                instrument === 'animal'
                  ? 'bg-yellow-400 text-yellow-950 shadow-sm'
                  : 'text-white hover:text-white/80'
              }`}
            >
              🦁 {language === 'nl' ? 'Dierenpraat' : 'Animal Talk'}
            </button>
          </div>

          {/* Sing Along Button */}
          <button
            onClick={handleToggleSingAlong}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-sm transition-all shadow-md active:scale-95 cursor-pointer ${
              isPlayingSong
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-emerald-400 text-emerald-950 hover:bg-emerald-300'
            }`}
          >
            {isPlayingSong ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>{language === 'nl' ? 'Stop Liedje' : 'Stop Song'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{language === 'nl' ? 'Zing ABC Liedje! 🎶' : 'Sing ABC Song! 🎶'}</span>
              </>
            )}
          </button>
        </div>

        {/* Bouncing Lyrics Display during Sing Along */}
        {isPlayingSong && (
          <div className="bg-white/40 backdrop-blur-md px-8 py-2.5 rounded-full border-2 border-white shadow-xl flex items-center gap-3 animate-kid-bounce">
            <span className="text-3xl animate-spin">⭐</span>
            <span className="text-2xl sm:text-3xl font-black text-white drop-shadow">
              {lyrics[singAlongIdx]?.chunk || (language === 'nl' ? 'ABC Zingen!' : 'Singing ABCs!')}
            </span>
            <span className="text-3xl">🎵</span>
          </div>
        )}
      </div>

      {/* The Musical Rainbow Piano / Xylophone */}
      <div className="w-full flex-1 flex items-center justify-center my-2">
        <div className="w-full max-w-3xl flex items-end justify-center gap-1.5 sm:gap-3 p-3 sm:p-5 bg-amber-900/40 backdrop-blur-md rounded-[2.5rem] border-4 border-amber-300/60 shadow-2xl">
          {PIANO_KEYS.map((key, idx) => {
            const isHit = activeKey === key.label;
            const heightPercent = 95 - idx * 4;
            const wordDisplay = language === 'nl' ? key.wordNl : key.wordEn;

            return (
              <button
                key={key.label}
                onClick={() => handleKeyTap(key)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleKeyTap(key);
                }}
                style={{
                  height: `${heightPercent}%`,
                  backgroundColor: key.color,
                  boxShadow: isHit
                    ? '0 0 0 rgba(0,0,0,0)'
                    : `0 8px 0 rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4)`,
                }}
                className={`flex-1 min-w-[38px] sm:min-w-[70px] max-w-[85px] h-60 sm:h-72 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-between py-4 text-white font-black cursor-pointer transition-all duration-100 select-none
                  ${isHit ? 'translate-y-2 scale-95 brightness-125' : 'hover:brightness-110 active:translate-y-2'}
                `}
              >
                <div className="w-3 h-3 rounded-full bg-white/40 shadow-inner" />

                <div className="flex flex-col items-center my-auto">
                  <span className="text-3xl sm:text-5xl font-black drop-shadow">
                    {key.label}
                  </span>
                  <span className="text-2xl sm:text-3xl mt-1 drop-shadow">
                    {key.emoji}
                  </span>
                  <span className="text-xs font-bold opacity-90 hidden sm:block">
                    {wordDisplay}
                  </span>
                </div>

                <div className="w-3 h-3 rounded-full bg-black/20" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom prompt */}
      <div className="text-white font-extrabold text-sm sm:text-base drop-shadow mb-1">
        {language === 'nl'
          ? 'Tik op de vrolijke toetsen en speel je eigen muziek! 🎵🎹'
          : 'Tap the colorful bars to play your own ABC songs! 🎵🎹'}
      </div>
    </div>
  );
}
