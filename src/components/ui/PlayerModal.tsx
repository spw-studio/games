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
        <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 px-6 py-8 text-center text-white relative">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur border border-gold-400/40 shadow-inner">
            <ChefHat className="h-9 w-9 text-gold-300" />
          </div>
          <h2 id="player-modal-title" className="text-2xl font-serif font-bold tracking-wide text-white">
            {isFirstVisit ? 'Boas-vindas ao Treinamento' : 'Editar Perfil'}
          </h2>
          <p className="mt-1 text-sm text-gold-200 font-light">
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
                className="block text-xs font-semibold uppercase tracking-wider text-brand-900 mb-1.5"
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
                className="w-full rounded-xl border border-gray-200 bg-cream-50 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-brand-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/20 transition-all"
              />
              {error && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {error}
                </p>
              )}
            </div>

            <div className="rounded-xl bg-gold-50/60 p-3 border border-gold-200/50 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-gold-600 mt-0.5 shrink-0" />
              <p className="text-xs text-brand-900 leading-relaxed">
                Seus recordes, precisão e conquistas serão salvos no navegador para acompanhar sua evolução diária.
              </p>
            </div>
          </div>

          <div className="mt-6">
            {isFirstVisit && (
              <button
                type="button"
                onClick={() => signIn('google')}
                className="mb-3 w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-brand-700 focus:ring-offset-2"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[#4285F4] shadow-sm">G</span>
                <span>Continuar com Google</span>
              </button>
            )}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-800 px-5 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-brand-900 active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-brand-700 focus:ring-offset-2"
            >
              <UserCheck className="w-4 h-4 text-gold-300" />
              <span>{isFirstVisit ? 'Entrar na Plataforma' : 'Salvar Nome'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
