'use client';

import type { CSSProperties } from 'react';
import { Check, GlassWater } from 'lucide-react';
import { WordSearchGrid } from '@/types/word-search';
import { normalizeForGrid } from '@/lib/games/word-search-engine';
import { WORD_SEARCH_COLORS } from '@/theme/themes';

interface WordListPanelProps {
  drinkName: string;
  drinkDesc?: string;
  drinkImage?: string;
  targetWords: string[];
  grid: WordSearchGrid;
  foundWordIndexes: Set<number>;
}

// Estilo do chip derivado da MESMA paleta do grid (WORD_SEARCH_COLORS),
// garantindo correspondência 1:1 de cores entre o tabuleiro e a lista.
const chipStyle = (index: number): CSSProperties => {
  const color = WORD_SEARCH_COLORS[index % WORD_SEARCH_COLORS.length];
  return {
    backgroundColor: `${color}26`,
    borderColor: `${color}80`,
    color: 'rgb(var(--theme-foreground))',
    textDecoration: 'line-through',
    textDecorationColor: color,
  };
};

export function WordListPanel({
  drinkName,
  drinkDesc,
  drinkImage,
  targetWords,
  grid,
  foundWordIndexes,
}: WordListPanelProps) {
  // Map each target word to its grid word index (if placed)
  const wordIndexMap = new Map<string, number>();
  grid.placedWords.forEach((pw, i) => {
    targetWords.forEach((tw) => {
      if (normalizeForGrid(tw) === pw.normalized) {
        wordIndexMap.set(tw, i);
      }
    });
  });

  const foundCount = targetWords.filter((w) => {
    const idx = wordIndexMap.get(w);
    return idx !== undefined && foundWordIndexes.has(idx);
  }).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Drink Card */}
      <div className="rounded-card border border-border bg-muted overflow-hidden shadow-card">
        {drinkImage && (
          <div className="relative h-32 overflow-hidden">
            <img
              src={drinkImage}
              alt={drinkName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent" />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <GlassWater className="h-4 w-4 text-secondary shrink-0" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">Tema</span>
          </div>
          <h2 className="text-lg font-serif font-bold text-foreground leading-tight">{drinkName}</h2>
          {drinkDesc && (
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-3">{drinkDesc}</p>
          )}
        </div>
      </div>

      {/* Word list */}
      <div className="rounded-card border border-border bg-surface shadow-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ingredientes</h3>
          <span className="text-xs font-bold text-secondary bg-primary-soft rounded-full px-2 py-0.5 border border-brand-100">
            {foundCount}/{targetWords.length}
          </span>
        </div>

        <ul className="space-y-2">
          {targetWords.map((word, index) => {
            const wordIndex = wordIndexMap.get(word);
            const isFound = wordIndex !== undefined && foundWordIndexes.has(wordIndex);
            const isPlaced = wordIndex !== undefined;

            // Cor do chip derivada do índice encontrado (mesma ordem do grid)
            let foundChipStyle: CSSProperties | undefined;
            if (isFound && wordIndex !== undefined) {
              const mapEntry = Array.from(foundWordIndexes).indexOf(wordIndex);
              if (mapEntry >= 0) {
                foundChipStyle = chipStyle(mapEntry);
              }
            }

            return (
              <li
                key={index}
                style={foundChipStyle}
                className={[
                  'flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300',
                  isFound
                    ? 'opacity-80'
                    : isPlaced
                    ? 'border-border bg-muted text-foreground'
                    : 'border-dashed border-border bg-muted/50 text-subtle-foreground text-xs',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span>{word}</span>
                {isFound && (
                  <Check className="h-3.5 w-3.5 shrink-0 opacity-70" />
                )}
                {!isPlaced && (
                  <span className="text-[10px] text-subtle-foreground italic">(não cabe)</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
