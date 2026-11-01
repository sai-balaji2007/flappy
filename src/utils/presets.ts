/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BackgroundPreset, CharacterPreset } from '../types/game';

export const CHARACTER_PRESETS: CharacterPreset[] = [
  {
    id: 'aviator',
    name: 'Sky Ace',
    type: 'aviator',
    color: '#F59E0B',
    accentColor: '#EF4444',
  },
  {
    id: 'falcon',
    name: 'Solar Falcon',
    type: 'falcon',
    color: '#EAB308',
    accentColor: '#F97316',
  },
  {
    id: 'rocket',
    name: 'Cosmo Jet',
    type: 'rocket',
    color: '#3B82F6',
    accentColor: '#06B6D4',
  },
  {
    id: 'pixie',
    name: 'Star Pixie',
    type: 'pixie',
    color: '#EC4899',
    accentColor: '#8B5CF6',
  },
  {
    id: 'couple',
    name: 'Adventure Duo',
    type: 'couple',
    color: '#F43F5E',
    accentColor: '#FB7185',
  },
];

export const THEME_PRESETS: BackgroundPreset[] = [
  {
    id: 'sky',
    name: 'Daybreak Skies',
    type: 'sky',
    skyColors: ['#38BDF8', '#7DD3FC', '#BAE6FD'],
    cloudColor: 'rgba(255, 255, 255, 0.85)',
    pipeColor: '#10B981',
    pipeHighlight: '#34D399',
  },
  {
    id: 'sunset',
    name: 'Neon Cyber Sunset',
    type: 'sunset',
    skyColors: ['#4C1D95', '#C026D3', '#F97316'],
    cloudColor: 'rgba(253, 224, 71, 0.4)',
    pipeColor: '#8B5CF6',
    pipeHighlight: '#C084FC',
  },
  {
    id: 'forest',
    name: 'Enchanted Grove',
    type: 'forest',
    skyColors: ['#064E3B', '#047857', '#10B981'],
    cloudColor: 'rgba(167, 243, 208, 0.35)',
    pipeColor: '#854D0E',
    pipeHighlight: '#A16207',
  },
  {
    id: 'cosmos',
    name: 'Starry Nebula',
    type: 'cosmos',
    skyColors: ['#090D16', '#1E1B4B', '#312E81'],
    cloudColor: 'rgba(192, 132, 252, 0.25)',
    pipeColor: '#0284C7',
    pipeHighlight: '#38BDF8',
  },
];
