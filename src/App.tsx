/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AudioSettings,
  CustomAudios,
  DifficultyLevel,
  GameState,
} from './types/game';
import { storage } from './utils/storage';
import { soundEngine } from './audio/soundEngine';
import { HomeScreen } from './components/HomeScreen';
import { GameCanvas } from './components/GameCanvas';
import { InstructionsModal } from './components/InstructionsModal';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');

  // Difficulty Level (Default is 'easy')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');

  // Scores
  const [highScore, setHighScore] = useState<number>(0);
  const [obstacleBest, setObstacleBest] = useState<number>(0);
  const [bonusBest, setBonusBest] = useState<number>(0);

  const [currentScore, setCurrentScore] = useState({
    obstacleScore: 0,
    bonusPoints: 0,
    totalScore: 0,
  });
  const [isNewBest, setIsNewBest] = useState<boolean>(false);

  // Audio Settings (Mute state preserved in localStorage)
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    masterVolume: 0.8,
    musicVolume: 0.8,
    sfxVolume: 0.9,
    isMuted: false,
  });

  // Modals
  const [isInstructionsOpen, setIsInstructionsOpen] = useState<boolean>(false);

  // Initialize stored data on mount
  useEffect(() => {
    const savedHighScore = storage.getHighScore();
    const savedObsBest = storage.getObstacleBest();
    const savedBonusBest = storage.getBonusBest();
    const savedAudioSettings = storage.getAudioSettings();
    const savedDifficulty = storage.getDifficulty();

    setHighScore(savedHighScore);
    setObstacleBest(savedObsBest);
    setBonusBest(savedBonusBest);
    setAudioSettings(savedAudioSettings);
    setDifficulty(savedDifficulty);

    soundEngine.setSettings(savedAudioSettings);

    return () => {
      soundEngine.cleanup();
    };
  }, []);

  // Update Audio Settings (Mute toggle)
  const handleUpdateAudioSettings = (settings: AudioSettings) => {
    setAudioSettings(settings);
    storage.setAudioSettings(settings);
    soundEngine.setSettings(settings);
  };

  // Select Difficulty Level
  const handleSelectDifficulty = (level: DifficultyLevel) => {
    setDifficulty(level);
    storage.setDifficulty(level);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const updated = { ...audioSettings, isMuted: !audioSettings.isMuted };
    handleUpdateAudioSettings(updated);
  };

  // Start Game (User gesture initializes BGM and starts playback from beginning)
  const handleStartGame = async () => {
    await soundEngine.unlockAudio();
    soundEngine.startBGM(true);
    setIsNewBest(false);
    setCurrentScore({ obstacleScore: 0, bonusPoints: 0, totalScore: 0 });
    setGameState('PLAYING');
  };

  // Score update from Canvas
  const handleScoreUpdate = useCallback(
    (stats: { obstacleScore: number; bonusPoints: number; totalScore: number }) => {
      setCurrentScore(stats);
    },
    []
  );

  // Game Over trigger from Canvas
  const handleGameOver = useCallback(
    (stats: { obstacleScore: number; bonusPoints: number; totalScore: number }) => {
      setCurrentScore(stats);

      let newRecord = false;
      if (stats.totalScore > highScore) {
        setHighScore(stats.totalScore);
        storage.setHighScore(stats.totalScore);
        newRecord = true;
      }

      if (stats.obstacleScore > obstacleBest) {
        setObstacleBest(stats.obstacleScore);
        storage.setObstacleBest(stats.obstacleScore);
      }

      if (stats.bonusPoints > bonusBest) {
        setBonusBest(stats.bonusPoints);
        storage.setBonusBest(stats.bonusPoints);
      }

      setIsNewBest(newRecord);
      setGameState('GAME_OVER');
    },
    [highScore, obstacleBest, bonusBest]
  );

  // Pause / Resume Toggle
  const handlePauseToggle = () => {
    if (gameState === 'PLAYING') {
      soundEngine.pauseBGM();
      setGameState('PAUSED');
    } else if (gameState === 'PAUSED') {
      soundEngine.resumeBGM();
      setGameState('PLAYING');
    }
  };

  // Play Again (Restart Run - starts background music from beginning)
  const handlePlayAgain = async () => {
    await soundEngine.unlockAudio();
    soundEngine.startBGM(true);
    setIsNewBest(false);
    setCurrentScore({ obstacleScore: 0, bonusPoints: 0, totalScore: 0 });
    setGameState('PLAYING');
  };

  // Return to Home (Stops background music)
  const handleGoHome = () => {
    soundEngine.stopBGM();
    setGameState('TITLE_MENU');
  };

  return (
    <main className="w-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-950 flex flex-col items-center justify-center p-0 sm:p-3 select-none">
      {/* Responsive arcade container maintaining strict 440:700 game aspect ratio without distortion */}
      <div
        className="relative flex items-center justify-center overflow-hidden shadow-2xl rounded-none sm:rounded-2xl border-0 sm:border border-slate-800/80 bg-slate-950"
        style={{
          aspectRatio: '440 / 700',
          height: '100%',
          maxHeight: '100%',
          maxWidth: '100%',
          width: 'auto',
        }}
      >
        {gameState === 'TITLE_MENU' ? (
          <HomeScreen
            onStartGame={handleStartGame}
            onOpenInstructions={() => setIsInstructionsOpen(true)}
            highScore={highScore}
            obstacleBest={obstacleBest}
            bonusBest={bonusBest}
            difficulty={difficulty}
            onSelectDifficulty={handleSelectDifficulty}
            isMuted={audioSettings.isMuted}
            onToggleMute={handleToggleMute}
          />
        ) : (
          <GameCanvas
            gameState={gameState}
            difficulty={difficulty}
            onGameOver={handleGameOver}
            onScoreUpdate={handleScoreUpdate}
            onPauseToggle={handlePauseToggle}
            isMuted={audioSettings.isMuted}
            onMuteToggle={handleToggleMute}
          />
        )}

        {/* MODAL: Instructions */}
        <InstructionsModal
          isOpen={isInstructionsOpen}
          onClose={() => setIsInstructionsOpen(false)}
        />

        {/* MODAL: Pause Screen */}
        <PauseModal
          isOpen={gameState === 'PAUSED'}
          onResume={() => {
            soundEngine.resumeBGM();
            setGameState('PLAYING');
          }}
          onRestart={handlePlayAgain}
          onGoHome={handleGoHome}
          isMuted={audioSettings.isMuted}
          onToggleMute={handleToggleMute}
        />

        {/* MODAL: Game Over Screen */}
        <GameOverModal
          isOpen={gameState === 'GAME_OVER'}
          obstacleScore={currentScore.obstacleScore}
          bonusPoints={currentScore.bonusPoints}
          totalScore={currentScore.totalScore}
          highScore={highScore}
          isNewBest={isNewBest}
          difficulty={difficulty}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
          isMuted={audioSettings.isMuted}
          onToggleMute={handleToggleMute}
        />
      </div>
    </main>
  );
}
