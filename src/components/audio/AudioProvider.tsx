'use client';

import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';

const AUDIO_SETTINGS_KEY = 'gastronomia_games_audio_settings';

type SoundName = 'click' | 'success' | 'error' | 'hint' | 'complete';

interface AudioSettings {
  enabled: boolean;
  volume: number;
}

interface AudioContextValue extends AudioSettings {
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  play: (sound: SoundName) => void;
}

const DEFAULT_SETTINGS: AudioSettings = { enabled: true, volume: 0.35 };
const AudioContext = createContext<AudioContextValue | null>(null);

const SOUND_PATTERNS: Record<SoundName, { frequencies: number[]; duration: number }> = {
  click: { frequencies: [440], duration: 0.06 },
  success: { frequencies: [523.25, 659.25, 783.99], duration: 0.1 },
  error: { frequencies: [220, 164.81], duration: 0.12 },
  hint: { frequencies: [659.25, 783.99], duration: 0.1 },
  complete: { frequencies: [523.25, 659.25, 783.99, 1046.5], duration: 0.12 },
};

export function AudioProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_SETTINGS);
  const soundsRef = useRef<Partial<Record<SoundName, Howl>>>({});

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(AUDIO_SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AudioSettings>;
        setSettings({
          enabled: parsed.enabled ?? DEFAULT_SETTINGS.enabled,
          volume: Math.min(1, Math.max(0, parsed.volume ?? DEFAULT_SETTINGS.volume)),
        });
      }
    } catch {
      // Usa as configurações padrão quando o armazenamento não estiver disponível.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // O áudio continua funcionando mesmo sem persistência local.
    }
  }, [settings]);

  const updateSettings = (next: Partial<AudioSettings>) => {
    setSettings((current) => ({ ...current, ...next }));
  };

  const play = (sound: SoundName) => {
    if (!settings.enabled || typeof window === 'undefined') return;
    const pattern = SOUND_PATTERNS[sound];
    const howl = soundsRef.current[sound] ?? new Howl({
      src: [createToneDataUri(pattern.frequencies, pattern.duration, sound === 'error')],
      format: ['wav'],
      volume: settings.volume,
      preload: true,
    });

    soundsRef.current[sound] = howl;
    howl.volume(settings.volume);
    howl.stop();
    howl.play();
  };

  return (
    <AudioContext.Provider
      value={{
        ...settings,
        setEnabled: (enabled) => updateSettings({ enabled }),
        setVolume: (volume) => updateSettings({ volume: Math.min(1, Math.max(0, volume)) }),
        play,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

function createToneDataUri(frequencies: number[], noteDuration: number, isError: boolean) {
  const sampleRate = 44100;
  const gap = noteDuration * 0.9;
  const totalSamples = Math.ceil(sampleRate * (gap * frequencies.length + 0.04));
  const buffer = new ArrayBuffer(44 + totalSamples * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + totalSamples * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, totalSamples * 2, true);

  for (let sample = 0; sample < totalSamples; sample += 1) {
    const time = sample / sampleRate;
    const index = Math.floor(time / gap);
    const frequency = frequencies[Math.min(index, frequencies.length - 1)];
    const noteTime = time - index * gap;
    const envelope = Math.min(1, noteTime / 0.01) * Math.max(0, 1 - noteTime / noteDuration);
    const wave = isError ? Math.sign(Math.sin(2 * Math.PI * frequency * noteTime)) : Math.sin(2 * Math.PI * frequency * noteTime);
    view.setInt16(44 + sample * 2, wave * envelope * 0.65 * 32767, true);
  }

  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `data:audio/wav;base64,${window.btoa(binary)}`;
}

function writeString(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio deve ser usado dentro de AudioProvider');
  }
  return context;
}

export type { SoundName };
