'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import { ChefHat, Sparkles, UserCheck } from 'lucide-react';

interface PlayerModalProps {
  isOpen: boolean;
  onSave: (nome: string) => void;
  initialName?: string;
  isFirstVisit?: boolean;
}

export function PlayerModal({
  isOpen,
  onSave,
  initialName = '',
  isFirstVisit = true,
}: PlayerModalProps) {
  const [nome, setNome] = useState(initialName);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    inputRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isFirstVisit) {
        onSave(initialName);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [initialName, isFirstVisit, isOpen, onSave]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nome.trim();
    if (!trimmed) {
      setError('Por favor, informe seu nome ou apelido para continuar.');
      return;
    }
    if (trimmed.length < 2) {
      setError('O nome deve ter pelo menos 2 caracteres.');
      return;
    }
    setError('');
    onSave(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" role="presentation">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-surface shadow-2xl border border-border" role="dialog" aria-modal="true" aria-labelledby="player-modal-title">
        {/* Faixa superior com a cor gastronômica #44100D */}
        <div className="bg-primary px-6 py-8 text-center text-primary-foreground relative">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur border border-secondary/40 shadow-inner">
            <ChefHat className="h-9 w-9 text-secondary" />
          </div>
          <h2 id="player-modal-title" className="text-2xl font-serif font-bold tracking-wide text-primary-foreground">
            {isFirstVisit ? 'Boas-vindas ao Treinamento' : 'Editar Perfil'}
          </h2>
          <p className="mt-1 text-sm text-secondary font-light">
            {isFirstVisit
              ? 'Como devemos chamar você nesta jornada de aprendizagem?'
              : 'Atualize o nome de identificação das suas pontuações'}
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="player-name-input"
                className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5"
              >
                Seu Nome ou Como Prefere ser Chamado(a)
              </label>
              <input
                id="player-name-input"
                type="text"
                value={nome}
                ref={inputRef}
                onChange={(e) => {
                  setNome(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ex: Carlos Silva, Mariana..."
                maxLength={30}
                autoFocus
                className="w-full rounded-control border border-border bg-muted px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {error && (
                <p className="mt-1.5 text-xs text-danger font-medium">
                  {error}
                </p>
              )}
            </div>

            <div className="rounded-control bg-muted p-3 border border-border flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
              <p className="text-xs text-foreground leading-relaxed">
                Seus recordes, precisão e conquistas serão salvos no navegador para acompanhar sua evolução diária.
              </p>
            </div>
          </div>

          <div className="mt-6">
            {isFirstVisit && (
              <button
                type="button"
                onClick={() => signIn('google')}
                className="mb-3 w-full flex items-center justify-center gap-2 rounded-control border border-border bg-surface px-5 py-3.5 text-sm font-semibold text-foreground shadow-sm hover:bg-surface-hover active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface text-xs font-bold text-primary shadow-sm">G</span>
                <span>Continuar com Google</span>
              </button>
            )}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-control bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <UserCheck className="w-4 h-4 text-secondary" />
              <span>{isFirstVisit ? 'Entrar na Plataforma' : 'Salvar Nome'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
