import React from 'react';

export enum VoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}

export interface VoiceOption {
  id: VoiceName;
  name: string;
  gender: 'Male' | 'Female';
  description: string;
}

export interface GeneratedAudio {
  id: string;
  text: string;
  voice: VoiceName;
  timestamp: number;
  blobUrl: string;
  duration: number; // in seconds
}

export interface GenerationState {
  isGenerating: boolean;
  error: string | null;
}

export type AIActionType = 'polish' | 'expand' | 'summarize' | 'translate' | 'fix' | 'style_promo' | 'style_story';

export interface AIAction {
  id: AIActionType;
  label: string;
  icon?: React.ReactNode;
  prompt: string;
}