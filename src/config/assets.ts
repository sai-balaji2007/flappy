/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * =======================================================================
 * DEVELOPER-CONTROLLED ASSET REFERENCES
 * =======================================================================
 * Easily replace the flying person character, background image, or
 * background music by updating the paths below to your new asset file paths.
 */
export const PLAYER_IMAGE = '/assets/aistudio/Picsart_26-11-01_15-35-33-980_46cc8eef.png';
export const BACKGROUND_IMAGE = '/assets/aistudio/WhatsApp_Image_2026-11-01_at_3.39.17_PM_0a1bbcef.jpeg';
export const BACKGROUND_MUSIC = '/assets/aistudio/Jum_jum_Tara_Jilebi_theyra_Chinnoda_b7f93b06.mp3';

export const GAME_ASSETS = {
  characterImage: PLAYER_IMAGE,
  backgroundImage: BACKGROUND_IMAGE,
  backgroundMusic: BACKGROUND_MUSIC,
  characterBorderColor: '#F59E0B',
};

/**
 * GAMEPLAY DIFFICULTY PROFILES
 * Tuned to provide a genuinely fun, forgiving, and beginner-friendly experience.
 */
export interface DifficultyConfig {
  name: string;
  description: string;
  baseSpeed: number;        // Obstacle movement speed (px/frame)
  gapSize: number;          // Vertical clearance between top and bottom obstacles
  obstacleDistance: number; // Horizontal distance between consecutive obstacles
  gravity: number;          // Downward gravitational acceleration
  flapStrength: number;     // Upward impulse on flap
  maxFallSpeed: number;     // Terminal fall velocity
  hitboxRatio: number;      // Hitbox scale relative to visual size (e.g. 0.65 = 65% for extra forgiveness)
  speedRampPerObstacle: number; // Gradual speed increase per obstacle
  maxSpeedBonus: number;    // Maximum speed bonus
}

export const DIFFICULTY_SETTINGS: Record<'easy' | 'normal' | 'hard', DifficultyConfig> = {
  easy: {
    name: 'Easy',
    description: 'Relaxed flight, very slow obstacles, and wide open gaps.',
    baseSpeed: 1.8,
    gapSize: 215,
    obstacleDistance: 290,
    gravity: 0.23,
    flapStrength: -5.6,
    maxFallSpeed: 5.8,
    hitboxRatio: 0.65, // Highly forgiving: 65% collision radius
    speedRampPerObstacle: 0.015,
    maxSpeedBonus: 0.9,
  },
  normal: {
    name: 'Normal',
    description: 'Balanced arcade pace with comfortable obstacle clearances.',
    baseSpeed: 2.3,
    gapSize: 185,
    obstacleDistance: 260,
    gravity: 0.27,
    flapStrength: -6.2,
    maxFallSpeed: 6.8,
    hitboxRatio: 0.72,
    speedRampPerObstacle: 0.025,
    maxSpeedBonus: 1.3,
  },
  hard: {
    name: 'Hard',
    description: 'Challenging speed and tighter gaps for seasoned aviators.',
    baseSpeed: 2.9,
    gapSize: 160,
    obstacleDistance: 235,
    gravity: 0.32,
    flapStrength: -6.8,
    maxFallSpeed: 7.8,
    hitboxRatio: 0.80,
    speedRampPerObstacle: 0.035,
    maxSpeedBonus: 1.8,
  },
};
