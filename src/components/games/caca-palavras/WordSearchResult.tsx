'use client';

import { Trophy, RotateCcw, Home, Check, X, Lightbulb, Clock, Target } from 'lucide-react';
import Link from 'next/link';
import { WordSearchGrid } from '@/types/word-search';
import { normalizeForGrid } from '@/lib/games/word-search-engine';

interface WordSearchResultProps {
  drinkName: string;
  targetWords: string[];
  grid: WordSearchGrid;
  foundWordIndexes: Set<number>;
  score: number;
  wrongAttempts: number;
  hintsUsed: number;
  elapsedSeconds: number;
  onPlayAgain: (same?: boolean) => void;
  onRestart: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function WordSearchResult({
  drinkName,
  targetWords,
  grid,
  foundWordIndexes,
  score,
  wrongAttempts,
  hintsUsed,
  elapsedSeconds,
  onPlayAgain,
  onRestart,
}: WordSearchResultProps) {
  // Compute stats
  const wordIndexMap = new Map<string, number>();
  grid.placedWords.forEach((pw, i) => {
    targetWords.forEach((tw) => {
      if (normalizeForGrid(tw) === pw.normalized) {
        wordIndexMap.set(tw, i);
      }
    });
  });

  const placedWords = targetWords.filter((w) => wordIndexMap.has(w));
  const foundCount = placedWords.filter((w) => {
    const idx = wordIndexMap.get(w);
    return idx !== undefined && foundWordIndexes.has(idx);
  }).length;

  const isPerfect = foundCount === placedWords.length && wrongAttempts === 0 && hintsUsed === 0;
  const accuracy = placedWords.length > 0
    ? Math.min(100, Math.round((foundCount / (foundCount + wrongAttempts)) * 100) || 100)
    : 100;

  const gradeLabel =
    isPerfect ? '🏆 Perfeito!'
    : foundCount === placedWords.length ? '✅ Completo!'
    : foundCount >= Math.ceil(placedWords.length * 0.7) ? '👏 Muito bem!'
    : foundCount >= Math.ceil(placedWords.length * 0.4) ? '🙂 Bom progresso!'
    : '📚 Continue praticando!';

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-brand-950 to-brand-900 text-white p-8 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-overlay/10 flex items-center justify-center">
          <Trophy className="h-8 w-8 text-gold-300" />
        </div>
        <div className="text-gold-300 text-sm font-medium uppercase tracking-widest mb-1">Partida encerrada</div>
        <h1 className="text-3xl font-serif font-bold">{gradeLabel}</h1>
        <p className="text-white/60 text-sm mt-1">{drinkName}</p>

        {/* Score */}
        <div className="mt-6 bg-overlay/10 rounded-2xl p-4">
          <div className="text-white/60 text-xs uppercase tracking-wider">Pontuação Final</div>
          <div className="text-4xl font-bold text-gold-300 mt-1">{score.toLocaleString()}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: <Target className="h-4 w-4" />, label: 'Precisão', value: `${accuracy}%`, color: 'text-emerald-600' },
          { icon: <Clock className="h-4 w-4" />, label: 'Tempo', value: formatTime(elapsedSeconds), color: 'text-sky-600' },
          { icon: <X className="h-4 w-4" />, label: 'Erros', value: wrongAttempts, color: wrongAttempts > 0 ? 'text-rose-600' : 'text-subtle-foreground' },
          { icon: <Lightbulb className="h-4 w-4" />, label: 'Dicas', value: hintsUsed, color: hintsUsed > 0 ? 'text-amber-600' : 'text-subtle-foreground' },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface p-3 text-center shadow-sm">
            <div className={`flex justify-center mb-1 ${stat.color}`}>{stat.icon}</div>
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-subtle-foreground font-medium uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Word results */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Ingredientes — {foundCount}/{placedWords.length} encontrados
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {targetWords.map((word, i) => {
            const idx = wordIndexMap.get(word);
            const isFound = idx !== undefined && foundWordIndexes.has(idx);
            const isPlaced = idx !== undefined;

            return (
              <div
                key={i}
                className={[
                  'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                  isFound
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : isPlaced
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : 'border-dashed border-border bg-gray-50 text-subtle-foreground text-xs',
                ].join(' ')}
              >
                {isFound ? (
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                ) : (
                  <X className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                )}
                <span className={isFound ? 'font-medium' : ''}>{word}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onPlayAgain(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary px-4 py-3.5 text-white font-bold text-sm shadow-md transition-all hover:-translate-y-0.5 active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          Novo Drink
        </button>
        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-surface hover:bg-primary-soft px-4 py-3.5 text-foreground font-bold text-sm transition-all hover:-translate-y-0.5 active:scale-95"
        >
          Mudar Config.
        </button>
      </div>

      <Link
        href="/jogos"
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        Voltar aos Jogos
      </Link>
    </div>
  );
}
