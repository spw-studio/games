'use client';

import { Check, GlassWater } from 'lucide-react';
import { WordSearchGrid } from '@/types/word-search';
import { normalizeForGrid } from '@/lib/games/word-search-engine';

interface WordListPanelProps {
  drinkName: string;
  drinkDesc?: string;
  drinkImage?: string;
  targetWords: string[];
  grid: WordSearchGrid;
  foundWordIndexes: Set<number>;
}

// Colors matching HIGHLIGHT_COLORS in the hook (same order)
const WORD_COLORS = [
  'bg-emerald-100 text-emerald-800 border-emerald-300 line-through decoration-emerald-500',
  'bg-sky-100 text-sky-800 border-sky-300 line-through decoration-sky-500',
  'bg-amber-100 text-amber-800 border-amber-300 line-through decoration-amber-500',
  'bg-rose-100 text-rose-800 border-rose-300 line-through decoration-rose-500',
  'bg-violet-100 text-violet-800 border-violet-300 line-through decoration-violet-500',
  'bg-teal-100 text-teal-800 border-teal-300 line-through decoration-teal-500',
  'bg-orange-100 text-orange-800 border-orange-300 line-through decoration-orange-500',
  'bg-pink-100 text-pink-800 border-pink-300 line-through decoration-pink-500',
  'bg-lime-100 text-lime-800 border-lime-300 line-through decoration-lime-500',
  'bg-cyan-100 text-cyan-800 border-cyan-300 line-through decoration-cyan-500',
];

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

  // Track which "found word index" corresponds to which color
  const foundIndexColorMap = new Map<number, string>();
  let colorCounter = 0;
  for (const idx of foundWordIndexes) {
    foundIndexColorMap.set(idx, WORD_COLORS[colorCounter % WORD_COLORS.length]);
    colorCounter++;
  }

  const foundCount = targetWords.filter((w) => {
    const idx = wordIndexMap.get(w);
    return idx !== undefined && foundWordIndexes.has(idx);
  }).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Drink Card */}
      <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-cream-50 overflow-hidden shadow-sm">
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
            <GlassWater className="h-4 w-4 text-brand-700 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">Tema</span>
          </div>
          <h2 className="text-lg font-serif font-bold text-brand-950 leading-tight">{drinkName}</h2>
          {drinkDesc && (
            <p className="mt-1.5 text-xs text-gray-500 leading-relaxed line-clamp-3">{drinkDesc}</p>
          )}
        </div>
      </div>

      {/* Word list */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Ingredientes</h3>
          <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5 border border-brand-100">
            {foundCount}/{targetWords.length}
          </span>
        </div>

        <ul className="space-y-2">
          {targetWords.map((word, index) => {
            const wordIndex = wordIndexMap.get(word);
            const isFound = wordIndex !== undefined && foundWordIndexes.has(wordIndex);
            const isPlaced = wordIndex !== undefined;

            // Get the found color for this word
            let foundColorClass = '';
            if (isFound && wordIndex !== undefined) {
              const mapEntry = Array.from(foundWordIndexes).indexOf(wordIndex);
              if (mapEntry >= 0) {
                foundColorClass = WORD_COLORS[mapEntry % WORD_COLORS.length];
              }
            }

            return (
              <li
                key={index}
                className={[
                  'flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300',
                  isFound
                    ? `${foundColorClass} opacity-80`
                    : isPlaced
                    ? 'border-gray-200 bg-gray-50 text-gray-700'
                    : 'border-dashed border-gray-200 bg-gray-50/50 text-gray-400 text-xs',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span>{word}</span>
                {isFound && (
                  <Check className="h-3.5 w-3.5 shrink-0 opacity-70" />
                )}
                {!isPlaced && (
                  <span className="text-[10px] text-gray-400 italic">(não cabe)</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
