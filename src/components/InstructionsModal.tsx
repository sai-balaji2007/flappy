/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold font-display text-white">How to Play</h2>
            <p className="text-xs text-slate-400">Rules & Flight Controls</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Controls */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
              Flight Controls
            </span>
            <div className="mt-2.5 space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="font-semibold text-white">Flap / Fly Up:</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300">SPACE or MOUSE CLICK</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="font-semibold text-white">Mobile Tap:</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300">TAP ANYWHERE</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="font-semibold text-white">Keyboard Alt:</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-200">↑ Arrow or W</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="font-semibold text-white">Pause Game:</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-200">ESC or P</span>
              </div>
            </div>
          </div>

          {/* Difficulty Levels */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
              Difficulty Levels
            </span>
            <div className="mt-2.5 space-y-1.5 text-xs text-slate-300">
              <div>
                <strong className="text-amber-300">Easy (Default):</strong> Very slow obstacles, gentle gravity, and wide open gaps. Perfect for relaxed flight.
              </div>
              <div>
                <strong className="text-sky-300">Normal:</strong> Moderate arcade speed with comfortable obstacle clearance.
              </div>
              <div>
                <strong className="text-rose-400">Hard:</strong> Faster obstacles and tighter gaps for experienced players.
              </div>
            </div>
          </div>

          {/* Scoring */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs uppercase tracking-wider font-bold text-sky-400">
              Scoring System
            </span>
            <div className="mt-2.5 space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-base">🚀</span>
                <div>
                  <span className="font-semibold text-white">Obstacles:</span> Each pipe column you successfully navigate adds <span className="text-emerald-400 font-bold">+1 Obstacle</span> (+10 pts to total score).
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base">⭐</span>
                <div>
                  <span className="font-semibold text-white">Bonuses:</span> Grab stars, hearts, coins, or gems in the gaps for an instant <span className="text-amber-400 font-bold">+10 Bonus Points</span> and sparkle chime!
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base">🏆</span>
                <div>
                  <span className="font-semibold text-white">Total Score:</span> (Obstacles × 10) + Bonus Points. Highest total is saved automatically!
                </div>
              </div>
            </div>
          </div>

          {/* Soundtrack & Audio */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs uppercase tracking-wider font-bold text-yellow-400">
              Soundtrack & Audio
            </span>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              Enjoy the high-energy flying soundtrack as you soar through campus! You can toggle between <strong className="text-white">Sound On</strong> and <strong className="text-white">Muted</strong> at any time using the quick sound button on the screen.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-md cursor-pointer"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
