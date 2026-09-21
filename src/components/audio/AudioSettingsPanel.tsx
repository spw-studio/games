'use client';

import { Volume2, VolumeX, X } from 'lucide-react';
import { useAudio } from './AudioProvider';

interface AudioSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AudioSettingsPanel({ isOpen, onClose }: AudioSettingsPanelProps) {
  const { enabled, volume, setEnabled, setVolume, play } = useAudio();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30 p-4 pt-20 backdrop-blur-sm" role="presentation" onMouseDown={onClose}>
      <section
        className="w-full max-w-sm rounded-card border border-border bg-surface p-5 shadow-elevated"
        role="dialog"
        aria-modal="true"
        aria-labelledby="audio-settings-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 id="audio-settings-title" className="text-lg font-bold text-foreground">
              Configurações de som
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Controle os efeitos sonoros da plataforma e dos jogos.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-control text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Fechar configurações de som"
            title="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-control border border-border bg-muted p-4">
            <span>
              <span className="block text-sm font-semibold text-foreground">Efeitos sonoros</span>
              <span className="mt-1 block text-xs text-muted-foreground">Sons de interação, acertos e erros</span>
            </span>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => {
                setEnabled(event.target.checked);
                if (event.target.checked) play('click');
              }}
              className="h-5 w-5 accent-primary"
            />
          </label>

          <div className={enabled ? 'space-y-2' : 'space-y-2 opacity-50'}>
            <div className="flex items-center justify-between text-sm font-semibold text-foreground">
              <label htmlFor="audio-volume">Volume</label>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input
              id="audio-volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              disabled={!enabled}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <VolumeX className="h-4 w-4" aria-hidden="true" />
              <button
                type="button"
                onClick={() => play('click')}
                disabled={!enabled}
                className="text-xs font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Volume2 className="mr-1 inline h-3.5 w-3.5" />
                Testar som
              </button>
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
