/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameState = 'TITLE_MENU' | 'READY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type DifficultyLevel = 'easy' | 'normal' | 'hard';

export interface CharacterPreset {
  id: string;
  name: string;
  type: 'aviator' | 'falcon' | 'rocket' | 'pixie' | 'couple';
  color: string;
  accentColor: string;
}

export interface BackgroundPreset {
  id: string;
  name: string;
  type: 'sky' | 'sunset' | 'forest' | 'cosmos';
  skyColors: [string, string, string];
  cloudColor: string;
  pipeColor: string;
  pipeHighlight: string;
}

export type BonusType = 'star' | 'heart' | 'coin' | 'gem';

export interface BonusItem {
  id: number;
  x: number;
  y: number;
  radius: number;
  type: BonusType;
  collected: boolean;
  value: number;
  floatOffset: number;
  rotation: number;
}

export interface Obstacle {
  id: number;
  x: number;
  width: number;
  topHeight: number;
  bottomY: number;
  gap: number;
  passed: boolean;
  bonus?: BonusItem;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'star' | 'sparkle' | 'heart';
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  alpha: number;
  color: string;
}

export interface CustomPhotos {
  characterDataUrl: string | null;
  characterFileName: string | null;
  backgroundDataUrl: string | null;
  backgroundFileName: string | null;
  characterBorderColor: string;
}

export interface CustomAudios {
  bgmDataUrl: string | null;
  bgmFileName: string | null;
  gameOverDataUrl: string | null;
  gameOverFileName: string | null;
  bonusDataUrl: string | null;
  bonusFileName: string | null;
}

export interface AudioSettings {
  masterVolume: number; // 0 to 1
  musicVolume: number; // 0 to 1
  sfxVolume: number; // 0 to 1
  isMuted: boolean;
}

export interface GameScore {
  obstacleScore: number;
  bonusPoints: number;
  totalScore: number;
  highScore: number;
  bonusesCollectedCount: number;
}
