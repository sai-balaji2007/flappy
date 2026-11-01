/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DifficultyLevel } from '../types/game';
import { DIFFICULTY_SETTINGS } from '../config/assets';

interface GameOverModalProps {
  isOpen: boolean;
  obstacleScore: number;
  bonusPoints: number;
  totalScore: number;
  highScore: number;
  isNewBest: boolean;
  difficulty: DifficultyLevel;
  onPlayAgain: () => void;
  onGoHome: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  obstacleScore,
  bonusPoints,
  totalScore,
  highScore,
  isNewBest,
  difficulty,
  onPlayAgain,
  onGoHome,
  isMuted,
  onToggleMute,
}) => {
  if (!isOpen) return null;

  // Determine Rank / Badge
  const getRank = (score: number) => {
    if (score >= 250) return { title: 'Master of the Stratosphere', icon: '👑', color: 'text-amber-400' };
    if (score >= 150) return { title: 'Ace Aviator', icon: '🥇', color: 'text-yellow-400' };
    if (score >= 80) return { title: 'Sky Cadet', icon: '🥈', color: 'text-sky-300' };
    if (score >= 30) return { title: 'Cloud Hopper', icon: '🥉', color: 'text-emerald-400' };
    return { title: 'Fledgling Flyer', icon: '🪶', color: 'text-slate-400' };
  };

  const rank = getRank(totalScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-sm flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 px-6 py-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-0.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-rose-100">
              Adventure Ended
            </span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-950/50 text-amber-300">
              {DIFFICULTY_SETTINGS[difficulty].name}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-white drop-shadow-sm">
            GAME OVER
          </h2>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Rank Badge */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 flex items-center justify-center gap-2 text-center">
            <span className="text-xl">{rank.icon}</span>
            <span className={`text-xs font-bold uppercase tracking-wide ${rank.color}`}>
              {rank.title}
            </span>
          </div>

          {/* Scores Breakdown Grid */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            {/* Total Score Highlight */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-semibold text-slate-300">Total Score</span>
              <div className="flex items-center gap-2">
                {isNewBest && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 animate-pulse">
                    NEW BEST!
                  </span>
                )}
                <span className="text-2xl font-black font-display text-amber-300 tabular-nums">
                  {totalScore}
                </span>
              </div>
            </div>

            {/* Obstacle Score */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Obstacles Passed</span>
              <span className="font-bold text-slate-200 tabular-nums">
                {obstacleScore} <span className="text-slate-500 font-normal">({obstacleScore * 10} pts)</span>
              </span>
            </div>

            {/* Bonus Points */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Bonus Collectibles</span>
              <span className="font-bold text-yellow-400 tabular-nums">
                +{bonusPoints} pts
              </span>
            </div>

            {/* Best Score */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400 font-medium">All-Time Best</span>
              <span className="font-bold font-display text-emerald-400 text-sm tabular-nums">
                {highScore}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {/* Play Again (Primary) */}
            <button
              onClick={onPlayAgain}
              className="w-full py-3.5 px-4 rounded-xl font-display font-extrabold text-base text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
              </svg>
              <span>PLAY AGAIN</span>
            </button>

            {/* Home & Audio Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onGoHome}
                className="py-2.5 px-3 rounded-xl font-semibold text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </button>

              <button
                onClick={onToggleMute}
                className="py-2.5 px-3 rounded-xl font-semibold text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isMuted ? (
                  <>
                    <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                    <span>Muted</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    <span>Sound On</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
