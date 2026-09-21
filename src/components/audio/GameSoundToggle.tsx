'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useAudio } from './AudioProvider';

export function GameSoundToggle() {
  const { enabled, setEnabled, play } = useAudio();

  return (
    <button
      type="button"
      onClick={() => {
        const nextEnabled = !enabled;
        setEnabled(nextEnabled);
        if (nextEnabled) play('click');
      }}
      className="flex h-9 w-9 items-center justify-center rounded-control border border-border bg-surface text-muted-foreground transition-colors hover:bg-surface-hover hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label={enabled ? 'Desligar efeitos sonoros' : 'Ligar efeitos sonoros'}
      title={enabled ? 'Desligar efeitos sonoros' : 'Ligar efeitos sonoros'}
      aria-pressed={enabled}
    >
      {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}
