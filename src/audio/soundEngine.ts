/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioSettings, CustomAudios } from '../types/game';
import { BACKGROUND_MUSIC } from '../config/assets';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private bgmAudioEl: HTMLAudioElement | null = null;
  private previewAudioEl: HTMLAudioElement | null = null;
  private previewType: 'bgm' | 'gameOver' | 'bonus' | null = null;

  // Synthesized BGM fallback state
  private synthBgmInterval: number | null = null;
  private synthBgmNoteIndex = 0;
  private synthBgmGain: GainNode | null = null;
  private isSynthBgmRunning = false;

  private settings: AudioSettings = {
    masterVolume: 0.8,
    musicVolume: 0.8,
    sfxVolume: 0.9,
    isMuted: false,
  };

  private customAudios: CustomAudios = {
    bgmDataUrl: null,
    bgmFileName: null,
    gameOverDataUrl: null,
    gameOverFileName: null,
    bonusDataUrl: null,
    bonusFileName: null,
  };

  private isAudioUnlocked = false;

  constructor() {
    // AudioContext will be initialized or resumed on the first user interaction
  }

  public setSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (newSettings.isMuted !== undefined) {
      this.setMuted(newSettings.isMuted);
    } else {
      this.applyVolumeUpdates();
    }
  }

  public setMuted(muted: boolean) {
    this.settings.isMuted = muted;
    if (this.bgmAudioEl) {
      this.bgmAudioEl.muted = muted;
      this.bgmAudioEl.volume = muted ? 0 : 0.8;
    }
    if (this.synthBgmGain && this.ctx) {
      this.synthBgmGain.gain.setValueAtTime(muted ? 0 : 0.16, this.ctx.currentTime);
    }
    if (this.previewAudioEl) {
      this.previewAudioEl.muted = muted;
      this.previewAudioEl.volume = muted ? 0 : 0.8;
    }
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public setCustomAudios(audios: CustomAudios) {
    this.customAudios = { ...audios };
  }

  public getCustomAudios(): CustomAudios {
    return { ...this.customAudios };
  }

  /**
   * Unlock AudioContext on first user gesture (click, tap, keypress)
   */
  public async unlockAudio(): Promise<boolean> {
    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      this.isAudioUnlocked = true;
      return true;
    } catch {
      return false;
    }
  }

  private getEffectiveMusicVolume(): number {
    if (this.settings.isMuted) return 0;
    return Math.max(0, Math.min(1, this.settings.masterVolume * this.settings.musicVolume));
  }

  private getEffectiveSfxVolume(): number {
    if (this.settings.isMuted) return 0;
    return Math.max(0, Math.min(1, this.settings.masterVolume * this.settings.sfxVolume));
  }

  private applyVolumeUpdates() {
    const musicVol = this.getEffectiveMusicVolume();

    // Update HTMLAudio BGM volume & mute
    if (this.bgmAudioEl) {
      this.bgmAudioEl.muted = this.settings.isMuted;
      this.bgmAudioEl.volume = this.settings.isMuted ? 0 : musicVol;
    }

    // Update Synthesized BGM volume
    if (this.synthBgmGain && this.ctx) {
      this.synthBgmGain.gain.setValueAtTime(this.settings.isMuted ? 0 : musicVol * 0.18, this.ctx.currentTime);
    }

    if (this.previewAudioEl) {
      const vol = this.previewType === 'bgm' ? musicVol : this.getEffectiveSfxVolume();
      this.previewAudioEl.muted = this.settings.isMuted;
      this.previewAudioEl.volume = this.settings.isMuted ? 0 : vol;
    }
  }

  /**
   * Lazy-initializes and configures the single HTMLAudioElement for BACKGROUND_MUSIC
   */
  private initBgmAudio(): HTMLAudioElement {
    if (!this.bgmAudioEl) {
      this.bgmAudioEl = new Audio();
      this.bgmAudioEl.loop = true;
      this.bgmAudioEl.preload = 'auto';
      this.bgmAudioEl.onerror = (e) => {
        console.warn('Background music track failed to load, falling back to synth BGM:', e);
        this.startSynthBgm();
      };
    }

    const currentSrc = this.bgmAudioEl.src;
    const targetSrc = BACKGROUND_MUSIC;
    if (!currentSrc || !currentSrc.endsWith(targetSrc)) {
      this.bgmAudioEl.src = targetSrc;
    }
    this.bgmAudioEl.loop = true;
    this.bgmAudioEl.muted = this.settings.isMuted;
    this.bgmAudioEl.volume = this.settings.isMuted ? 0 : 0.8;
    return this.bgmAudioEl;
  }

  /**
   * Start Background Music:
   * Plays the fixed developer-configured BACKGROUND_MUSIC in a loop.
   * If fromBeginning is true, restarts the track from 0:00.
   */
  public async startBGM(fromBeginning = true) {
    await this.unlockAudio();
    this.stopSynthBgm();

    const audio = this.initBgmAudio();

    if (fromBeginning) {
      try {
        audio.currentTime = 0;
      } catch {
        // Safe ignore if audio metadata not yet loaded
      }
    }

    audio.muted = this.settings.isMuted;
    audio.volume = this.settings.isMuted ? 0 : 0.8;

    try {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (err) {
      console.warn('Could not autoplay background music, attempting synth fallback:', err);
      this.startSynthBgm();
    }
  }

  /**
   * Stop Background Music: pauses and resets track position to beginning
   */
  public stopBGM() {
    if (this.bgmAudioEl) {
      this.bgmAudioEl.pause();
      try {
        this.bgmAudioEl.currentTime = 0;
      } catch {
        // Safe ignore
      }
    }
    this.stopSynthBgm();
  }

  /**
   * Pause Background Music: pauses playback without resetting position
   */
  public pauseBGM() {
    if (this.bgmAudioEl) {
      this.bgmAudioEl.pause();
    }
    this.stopSynthBgm();
  }

  /**
   * Resume Background Music: continues playback from where it was paused
   */
  public async resumeBGM() {
    await this.unlockAudio();
    if (this.bgmAudioEl && this.bgmAudioEl.src) {
      this.bgmAudioEl.muted = this.settings.isMuted;
      this.bgmAudioEl.volume = this.settings.isMuted ? 0 : 0.8;
      try {
        const playPromise = this.bgmAudioEl.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        return;
      } catch (err) {
        console.warn('Could not resume BGM audio, trying synth:', err);
      }
    }
    this.startSynthBgm();
  }

  /**
   * Synthesized upbeat arcade background tune
   */
  private startSynthBgm() {
    if (this.isSynthBgmRunning) return;
    if (!this.ctx) return;

    this.isSynthBgmRunning = true;
    this.synthBgmNoteIndex = 0;

    // Melody: pentatonic adventure progression (C4, E4, G4, A4, B4, C5)
    // Frequencies:
    const C4 = 261.63;
    const D4 = 293.66;
    const E4 = 329.63;
    const G4 = 392.00;
    const A4 = 440.00;
    const B4 = 493.88;
    const C5 = 523.25;
    const D5 = 587.33;
    const E5 = 659.25;

    const melody: number[] = [
      C4, E4, G4, C5,  A4, G4, E4, D4,
      C4, E4, G4, E5,  D5, C5, A4, B4,
      C4, G4, E5, D5,  C5, A4, G4, E4,
      D4, E4, G4, A4,  B4, C5, D5, C5,
    ];

    const bassLine: number[] = [
      130.81, 130.81, 164.81, 164.81, 174.61, 174.61, 196.00, 196.00,
      130.81, 130.81, 164.81, 164.81, 174.61, 174.61, 196.00, 196.00,
      146.83, 146.83, 164.81, 164.81, 174.61, 174.61, 196.00, 196.00,
      130.81, 130.81, 164.81, 164.81, 174.61, 174.61, 130.81, 130.81,
    ];

    const bpm = 138;
    const intervalMs = (60 / bpm / 2) * 1000; // 16th-like swing step

    this.synthBgmGain = this.ctx.createGain();
    this.synthBgmGain.gain.setValueAtTime(this.getEffectiveMusicVolume() * 0.16, this.ctx.currentTime);
    this.synthBgmGain.connect(this.ctx.destination);

    this.synthBgmInterval = window.setInterval(() => {
      if (!this.ctx || !this.isSynthBgmRunning || this.settings.isMuted) return;

      const now = this.ctx.currentTime;
      const noteFreq = melody[this.synthBgmNoteIndex % melody.length];
      const bassFreq = bassLine[this.synthBgmNoteIndex % bassLine.length];

      // Lead note
      if (noteFreq > 0) {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(noteFreq, now);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.3, now + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + (intervalMs / 1000) * 0.85);

        osc.connect(noteGain);
        if (this.synthBgmGain) noteGain.connect(this.synthBgmGain);

        osc.start(now);
        osc.stop(now + (intervalMs / 1000) * 0.9);
      }

      // Bass note every other beat
      if (this.synthBgmNoteIndex % 2 === 0 && bassFreq > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bassGain.gain.setValueAtTime(0.001, now);
        bassGain.gain.linearRampToValueAtTime(0.4, now + 0.02);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + (intervalMs / 1000) * 1.5);

        bassOsc.connect(bassGain);
        if (this.synthBgmGain) bassGain.connect(this.synthBgmGain);

        bassOsc.start(now);
        bassOsc.stop(now + (intervalMs / 1000) * 1.6);
      }

      this.synthBgmNoteIndex++;
    }, intervalMs);
  }

  private stopSynthBgm() {
    this.isSynthBgmRunning = false;
    if (this.synthBgmInterval !== null) {
      clearInterval(this.synthBgmInterval);
      this.synthBgmInterval = null;
    }
    if (this.synthBgmGain) {
      try {
        this.synthBgmGain.disconnect();
      } catch {
        // Safe ignore
      }
      this.synthBgmGain = null;
    }
  }

  /**
   * Play Flap / Jump SFX (Whoosh chirp)
   */
  public playFlapSound() {
    if (this.settings.isMuted) return;
    this.unlockAudio();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const sfxVol = this.getEffectiveSfxVolume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.12);

      gain.gain.setValueAtTime(sfxVol * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio context might be restricted
    }
  }

  /**
   * Play Bonus Collection SFX (Custom uploaded audio or sweet sparkle chime)
   */
  public playBonusSound() {
    if (this.settings.isMuted) return;
    this.unlockAudio();

    const sfxVol = this.getEffectiveSfxVolume();

    // Check if custom bonus audio uploaded
    if (this.customAudios.bonusDataUrl) {
      try {
        const audio = new Audio(this.customAudios.bonusDataUrl);
        audio.volume = sfxVol;
        audio.play().catch(() => {});
        return;
      } catch (err) {
        console.warn('Custom bonus audio failed, falling back to synth chime:', err);
      }
    }

    // Default Fallback: Synthesized sparkle arpeggio (C5 - E5 - G5 - C6)
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

      frequencies.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteTime = now + idx * 0.045;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(sfxVol * 0.35, noteTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.25);
      });
    } catch {
      // Safe fallback
    }
  }

  /**
   * Play Game Over SFX (Custom uploaded audio or downward comical game over boing/slide)
   */
  public playGameOverSound() {
    if (this.settings.isMuted) return;
    this.unlockAudio();

    const sfxVol = this.getEffectiveSfxVolume();

    // Custom uploaded Game Over sound
    if (this.customAudios.gameOverDataUrl) {
      try {
        const audio = new Audio(this.customAudios.gameOverDataUrl);
        audio.volume = sfxVol;
        audio.play().catch(() => {});
        return;
      } catch (err) {
        console.warn('Custom game over audio failed, using synth game over sound:', err);
      }
    }

    // Default Fallback: Descending comical synth slide with soft thud
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.55);

      gain.gain.setValueAtTime(sfxVol * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.7);

      // Low thump
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(110, now);
      subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

      subGain.gain.setValueAtTime(sfxVol * 0.45, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);

      subOsc.start(now);
      subOsc.stop(now + 0.5);
    } catch {
      // Ignore
    }
  }

  /**
   * Audio Preview testing in Customize modal
   */
  public async previewAudio(type: 'bgm' | 'gameOver' | 'bonus'): Promise<boolean> {
    await this.unlockAudio();

    if (this.previewAudioEl) {
      this.previewAudioEl.pause();
      this.previewAudioEl = null;
    }

    if (this.previewType === type) {
      // Toggle off if currently playing
      this.previewType = null;
      this.stopSynthBgm();
      return false;
    }

    this.previewType = type;

    if (type === 'bgm') {
      if (this.customAudios.bgmDataUrl) {
        try {
          this.previewAudioEl = new Audio(this.customAudios.bgmDataUrl);
          this.previewAudioEl.volume = this.getEffectiveMusicVolume();
          this.previewAudioEl.onended = () => {
            this.previewType = null;
            this.previewAudioEl = null;
          };
          await this.previewAudioEl.play();
          return true;
        } catch {
          // fallback to synth
        }
      }
      this.startSynthBgm();
      return true;
    } else if (type === 'gameOver') {
      this.stopSynthBgm();
      this.playGameOverSound();
      this.previewType = null;
      return true;
    } else if (type === 'bonus') {
      this.stopSynthBgm();
      this.playBonusSound();
      this.previewType = null;
      return true;
    }

    return false;
  }

  public stopPreview() {
    if (this.previewAudioEl) {
      this.previewAudioEl.pause();
      this.previewAudioEl = null;
    }
    this.stopSynthBgm();
    this.previewType = null;
  }

  public isPreviewing(type: 'bgm' | 'gameOver' | 'bonus'): boolean {
    return this.previewType === type;
  }

  public cleanup() {
    this.stopBGM();
    this.stopPreview();
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {
        // Safe
      }
      this.ctx = null;
    }
  }
}

export const soundEngine = new SoundEngine();
