/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioSettings, CustomAudios, CustomPhotos } from '../types/game';

const HIGH_SCORE_KEY = 'our_flying_adventure_high_score';
const OBSTACLE_BEST_KEY = 'our_flying_adventure_obstacle_best';
const BONUS_BEST_KEY = 'our_flying_adventure_bonus_best';
const AUDIO_SETTINGS_KEY = 'our_flying_adventure_audio_settings';
const CUSTOM_PHOTOS_KEY = 'our_flying_adventure_custom_photos';
const CUSTOM_AUDIOS_KEY = 'our_flying_adventure_custom_audios';
const SELECTED_PRESET_KEY = 'our_flying_adventure_character_preset';
const SELECTED_THEME_KEY = 'our_flying_adventure_theme_preset';
const DIFFICULTY_KEY = 'our_flying_adventure_difficulty';

export const storage = {
  getDifficulty(): 'easy' | 'normal' | 'hard' {
    try {
      const val = localStorage.getItem(DIFFICULTY_KEY);
      if (val === 'easy' || val === 'normal' || val === 'hard') {
        return val;
      }
    } catch {
      // ignore
    }
    return 'easy'; // Default is Easy
  },

  setDifficulty(level: 'easy' | 'normal' | 'hard'): void {
    try {
      localStorage.setItem(DIFFICULTY_KEY, level);
    } catch {
      // ignore
    }
  },
  getHighScore(): number {
    try {
      const val = localStorage.getItem(HIGH_SCORE_KEY);
      return val ? parseInt(val, 10) || 0 : 0;
    } catch {
      return 0;
    }
  },

  setHighScore(score: number): void {
    try {
      localStorage.setItem(HIGH_SCORE_KEY, score.toString());
    } catch {
      // safe ignore
    }
  },

  getObstacleBest(): number {
    try {
      const val = localStorage.getItem(OBSTACLE_BEST_KEY);
      return val ? parseInt(val, 10) || 0 : 0;
    } catch {
      return 0;
    }
  },

  setObstacleBest(score: number): void {
    try {
      localStorage.setItem(OBSTACLE_BEST_KEY, score.toString());
    } catch {
      // safe ignore
    }
  },

  getBonusBest(): number {
    try {
      const val = localStorage.getItem(BONUS_BEST_KEY);
      return val ? parseInt(val, 10) || 0 : 0;
    } catch {
      return 0;
    }
  },

  setBonusBest(score: number): void {
    try {
      localStorage.setItem(BONUS_BEST_KEY, score.toString());
    } catch {
      // safe ignore
    }
  },

  getAudioSettings(): AudioSettings {
    const defaults: AudioSettings = {
      masterVolume: 0.8,
      musicVolume: 0.7,
      sfxVolume: 0.9,
      isMuted: false,
    };
    try {
      const val = localStorage.getItem(AUDIO_SETTINGS_KEY);
      if (val) {
        return { ...defaults, ...JSON.parse(val) };
      }
    } catch {
      // ignore
    }
    return defaults;
  },

  setAudioSettings(settings: AudioSettings): void {
    try {
      localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  },

  getCustomPhotos(): CustomPhotos {
    const defaults: CustomPhotos = {
      characterDataUrl: null,
      characterFileName: null,
      backgroundDataUrl: null,
      backgroundFileName: null,
      characterBorderColor: '#F59E0B',
    };
    try {
      const val = localStorage.getItem(CUSTOM_PHOTOS_KEY);
      if (val) {
        return { ...defaults, ...JSON.parse(val) };
      }
    } catch {
      // ignore
    }
    return defaults;
  },

  setCustomPhotos(photos: CustomPhotos): void {
    try {
      localStorage.setItem(CUSTOM_PHOTOS_KEY, JSON.stringify(photos));
    } catch {
      // Quota limit might trigger on huge data URLs, in which case in-memory works
      console.warn('Storage quota reached for custom photos, keeping in memory.');
    }
  },

  getCustomAudios(): CustomAudios {
    const defaults: CustomAudios = {
      bgmDataUrl: null,
      bgmFileName: null,
      gameOverDataUrl: null,
      gameOverFileName: null,
      bonusDataUrl: null,
      bonusFileName: null,
    };
    try {
      const val = localStorage.getItem(CUSTOM_AUDIOS_KEY);
      if (val) {
        return { ...defaults, ...JSON.parse(val) };
      }
    } catch {
      // ignore
    }
    return defaults;
  },

  setCustomAudios(audios: CustomAudios): void {
    try {
      localStorage.setItem(CUSTOM_AUDIOS_KEY, JSON.stringify(audios));
    } catch {
      console.warn('Storage quota reached for custom audio files, keeping in memory.');
    }
  },

  getSelectedCharacterPreset(): string {
    try {
      return localStorage.getItem(SELECTED_PRESET_KEY) || 'aviator';
    } catch {
      return 'aviator';
    }
  },

  setSelectedCharacterPreset(id: string): void {
    try {
      localStorage.setItem(SELECTED_PRESET_KEY, id);
    } catch {
      // ignore
    }
  },

  getSelectedThemePreset(): string {
    try {
      return localStorage.getItem(SELECTED_THEME_KEY) || 'sky';
    } catch {
      return 'sky';
    }
  },

  setSelectedThemePreset(id: string): void {
    try {
      localStorage.setItem(SELECTED_THEME_KEY, id);
    } catch {
      // ignore
    }
  },
};
