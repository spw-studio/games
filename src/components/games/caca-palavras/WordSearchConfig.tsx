'use client';

import { useState } from 'react';
import { Play, Search, Zap, BookOpen, Flame } from 'lucide-react';
import { GameDifficulty } from '@/types/game';
import { WordSearchConfigState } from '@/types/word-search';

interface WordSearchConfigProps {
  onStart: (config: WordSearchConfigState) => void;
}

const DIFFICULTIES: { id: GameDifficulty; label: string; desc: string; icon: React.ReactNode; gridInfo: string }[] = [
  {
    id: 'facil',
    label: 'Fácil',
    desc: 'Grade 12×12, apenas palavras normais, sem distrações.',
    icon: <BookOpen className="h-5 w-5" />,
    gridInfo: '12×12 • Sem distrações',
  },
  {
    id: 'medio',
    label: 'Médio',
    desc: 'Grade 15×15 com 2 palavras extras de distração.',
    icon: <Zap className="h-5 w-5" />,
    gridInfo: '15×15 • 2 distrações',
  },
  {
    id: 'dificil',
    label: 'Difícil',
    desc: 'Grade 18×18 com 4 distrações e palavras invertidas.',
    icon: <Flame className="h-5 w-5" />,
    gridInfo: '18×18 • 4 distrações',
  },
];

export function WordSearchConfig({ onStart }: WordSearchConfigProps) {
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medio');

  const handleStart = () => {
    onStart({ difficulty, category: 'drinks' });
  };

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-control bg-primary shadow-card mb-2">
          <Search className="h-8 w-8 text-secondary" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-brand-950">Caça-Palavras</h1>
        <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
          Um drink é sorteado e seus ingredientes ficam escondidos na grade.
          Encontre todos arrastando o dedo (ou o cursor) sobre as letras!
        </p>
      </div>

      {/* Instructions */}
      <div className="rounded-card bg-muted border border-border p-4 space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-700 mb-3">Como jogar</h2>
        <ul className="text-sm text-brand-900 space-y-2">
          {[
            'Um drink é sorteado como tema da rodada.',
            'Cada ingrediente está escondido na grade de letras.',
            'Clique e arraste para selecionar uma palavra.',
            'Palavras podem estar em qualquer direção — até na diagonal!',
            'Use a dica se travar (custa pontos).',
          ].map((tip, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-brand-800 text-white text-[10px] font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Difficulty */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Dificuldade</h2>
        <div className="grid grid-cols-3 gap-3">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              onClick={() => setDifficulty(d.id)}
              className={[
                'flex flex-col items-center gap-2 rounded-control border-2 p-3 text-center transition-all duration-200',
                difficulty === d.id
                  ? 'border-brand-800 bg-brand-50 shadow-md'
                  : 'border-border bg-surface hover:border-primary/50',
              ].join(' ')}
            >
              <div
                className={[
                  'w-10 h-10 rounded-control flex items-center justify-center',
                  difficulty === d.id
                    ? 'bg-brand-800 text-gold-300'
                    : 'bg-gray-100 text-gray-500',
                ].join(' ')}
              >
                {d.icon}
              </div>
              <div>
                <div className={`text-sm font-bold ${difficulty === d.id ? 'text-brand-900' : 'text-gray-700'}`}>
                  {d.label}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">{d.gridInfo}</div>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center">
          {DIFFICULTIES.find((d) => d.id === difficulty)?.desc}
        </p>
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        className="w-full flex items-center justify-center gap-3 rounded-control bg-primary hover:bg-primary/90 px-6 py-4 text-primary-foreground font-bold text-base shadow-card transition-all hover:shadow-elevated hover:-translate-y-0.5 active:scale-95"
      >
        <Play className="h-5 w-5 fill-white" />
        Sortear Drink e Jogar
      </button>
    </div>
  );
}
