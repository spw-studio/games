'use client';

import { useWordSearchGame } from '@/hooks/useWordSearchGame';
import { WordSearchConfig } from '@/components/games/caca-palavras/WordSearchConfig';
import { WordSearchHUD } from '@/components/games/caca-palavras/WordSearchHUD';
import { WordSearchGridBoard } from '@/components/games/caca-palavras/WordSearchGridBoard';
import { WordListPanel } from '@/components/games/caca-palavras/WordListPanel';
import { WordSearchResult } from '@/components/games/caca-palavras/WordSearchResult';
import { normalizeForGrid } from '@/lib/games/word-search-engine';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { getGameById } from '@/lib/games/registry';

const wordSearchTheme = getGameById('caca-palavras')?.theme ?? 'default';

export default function CacaPalavrasPage() {
  const game = useWordSearchGame();

  if (game.phase === 'config') {
    return (
      <ThemeProvider themeId={wordSearchTheme}>
      <div className="min-h-[60vh] flex items-center justify-center py-8">
        <WordSearchConfig onStart={game.startGame} />
      </div>
      </ThemeProvider>
    );
  }

  if (game.phase === 'result') {
    return (
      <ThemeProvider themeId={wordSearchTheme}>
      <div className="py-8">
        <WordSearchResult
          drinkName={game.currentDrinkName}
          targetWords={game.targetWords}
          grid={game.grid!}
          foundWordIndexes={game.foundWordIndexes}
          score={game.score}
          wrongAttempts={game.wrongAttempts}
          hintsUsed={game.hintsUsed}
          elapsedSeconds={game.elapsedSeconds}
          onPlayAgain={game.onPlayAgain}
          onRestart={game.onRestart}
        />
      </div>
      </ThemeProvider>
    );
  }

  if (!game.grid) return null;

  // Count target words placed & found
  const wordIndexMap = new Map<string, number>();
  game.grid.placedWords.forEach((pw, i) => {
    game.targetWords.forEach((tw) => {
      if (normalizeForGrid(tw) === pw.normalized) {
        wordIndexMap.set(tw, i);
      }
    });
  });

  const placedTargetCount = game.targetWords.filter((w) => wordIndexMap.has(w)).length;
  const foundTargetCount = game.targetWords.filter((w) => {
    const idx = wordIndexMap.get(w);
    return idx !== undefined && game.foundWordIndexes.has(idx);
  }).length;

  const canHint = game.targetWords.some((w) => {
    const idx = wordIndexMap.get(w);
    return idx !== undefined && !game.foundWordIndexes.has(idx);
  });

  return (
    <ThemeProvider themeId={wordSearchTheme}>
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* HUD */}
      <WordSearchHUD
        foundCount={foundTargetCount}
        totalCount={placedTargetCount}
        score={game.score}
        streak={game.streak}
        formattedTime={game.formattedTime}
        hintsUsed={game.hintsUsed}
        wrongAttempts={game.wrongAttempts}
        onHint={game.useHint}
        onQuit={game.onRestart}
        canHint={canHint}
      />

      {/* Main layout: Grid (left) + Word list (right) */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Grid — scrollable horizontally on small screens */}
        <div className="flex-1 flex justify-center overflow-x-auto">
          <WordSearchGridBoard
            grid={game.grid}
            foundCells={game.foundCells}
            foundWordIndexes={game.foundWordIndexes}
            selectionPreviewCells={game.selectionPreviewCells}
            wrongFlash={game.wrongFlash}
            onCellMouseDown={game.handleCellMouseDown}
            onCellMouseEnter={game.handleCellMouseEnter}
            onCellMouseUp={game.handleCellMouseUp}
            onGridMouseLeave={game.handleGridMouseLeave}
          />
        </div>

        {/* Word list sidebar */}
        <div className="w-full lg:w-72 shrink-0">
          <WordListPanel
            drinkName={game.currentDrinkName}
            drinkDesc={game.currentDrinkDesc}
            drinkImage={game.currentDrinkImage}
            targetWords={game.targetWords}
            grid={game.grid}
            foundWordIndexes={game.foundWordIndexes}
          />
        </div>
      </div>
    </div>
    </ThemeProvider>
  );
}
