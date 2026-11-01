/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DifficultyLevel } from '../types/game';
import { DIFFICULTY_SETTINGS, PLAYER_IMAGE, BACKGROUND_IMAGE } from '../config/assets';

interface HomeScreenProps {
  onStartGame: () => void;
  onOpenInstructions: () => void;
  highScore: number;
  obstacleBest: number;
  bonusBest: number;
  difficulty: DifficultyLevel;
  onSelectDifficulty: (difficulty: DifficultyLevel) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  onOpenInstructions,
  highScore,
  obstacleBest,
  bonusBest,
  difficulty,
  onSelectDifficulty,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div
      style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}
      className="relative w-full h-full mx-auto flex flex-col justify-between items-center p-4 sm:p-6 text-white bg-cover bg-center overflow-hidden select-none"
    >
      {/* Dark overlay scrim for high contrast and readability */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px] pointer-events-none" />

      {/* Decorative ambient glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <header className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-sky-400">
            Arcade Flight 2D
          </span>
        </div>

        {/* Audio Mute Quick Toggle */}
        <button
          onClick={onToggleMute}
          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer"
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? (
            <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
          <span className="text-xs font-medium">{isMuted ? 'Muted' : 'Sound On'}</span>
        </button>
      </header>

      {/* Main Hero & Character Showcase */}
      <div className="flex flex-col items-center justify-center my-auto z-10 w-full text-center">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-md">
          OUR FLYING
          <span className="block text-3xl sm:text-4xl text-sky-300 font-extrabold mt-1">
            ADVENTURE
          </span>
        </h1>

        <p className="text-sm text-slate-300 mt-1.5 max-w-xs font-medium">
          Soar through campus obstacles, grab bonus stars, and reach for new heights!
        </p>

        {/* Person Flying Character Showcase (Natural PNG Shape, Enlarged & Prominent) */}
        <div className="relative my-3 flex flex-col items-center">
          {/* Subtle warm backlight glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* Full transparent character image - natural PNG silhouette without circular crop, increased size */}
          <div className="relative z-10 flex items-center justify-center animate-float">
            <img
              src={PLAYER_IMAGE}
              alt="Flying Character"
              className="h-36 sm:h-44 w-auto max-w-[200px] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)] select-none pointer-events-none"
            />
          </div>

          {/* Ready badge */}
          <div className="mt-1 z-10 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-[11px] font-black px-3.5 py-0.5 rounded-full shadow-md uppercase tracking-wider">
            Ready to Fly
          </div>
        </div>

        {/* DIFFICULTY SELECTOR (Easy, Normal, Hard) */}
        <div className="w-full max-w-xs mt-2 mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5 px-1 font-semibold text-slate-300">
            <span>Flight Difficulty:</span>
            <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
              {DIFFICULTY_SETTINGS[difficulty].name}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/90 border border-slate-700/80 rounded-xl">
            {(['easy', 'normal', 'hard'] as DifficultyLevel[]).map((level) => {
              const isSelected = difficulty === level;
              return (
                <button
                  key={level}
                  onClick={() => onSelectDifficulty(level)}
                  className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all capitalize ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {level === 'easy' ? '🌱 Easy' : level === 'normal' ? '⚡ Normal' : '🔥 Hard'}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 mt-1 px-1 text-center font-medium">
            {DIFFICULTY_SETTINGS[difficulty].description}
          </p>
        </div>

        {/* Best Score Summary Banner */}
        <div className="w-full max-w-xs bg-slate-900/75 border border-slate-700/70 backdrop-blur-md rounded-xl p-3 shadow-lg flex items-center justify-around text-center">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Best Total
            </div>
            <div className="text-xl font-bold font-display text-amber-300 tabular-nums">
              {highScore}
            </div>
          </div>
          <div className="w-px h-8 bg-slate-700/80" />
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Obstacles
            </div>
            <div className="text-base font-bold font-display text-slate-200 tabular-nums">
              {obstacleBest}
            </div>
          </div>
          <div className="w-px h-8 bg-slate-700/80" />
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Bonus Pts
            </div>
            <div className="text-base font-bold font-display text-yellow-400 tabular-nums">
              +{bonusBest}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Actions */}
      <footer className="w-full flex flex-col gap-2.5 z-10">
        {/* Primary CTA: Start Game */}
        <button
          onClick={onStartGame}
          className="w-full py-4 px-6 rounded-xl font-display font-extrabold text-lg text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <svg className="w-6 h-6 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>START GAME</span>
        </button>

        {/* How to Play Rules */}
        <button
          onClick={onOpenInstructions}
          className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm text-slate-300 bg-slate-900/80 hover:bg-slate-800 hover:text-white border border-slate-700/80 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
        >
          <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>How to Play</span>
        </button>
      </footer>
    </div>
  );
};
