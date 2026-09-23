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
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useImmersiveGame } from '@/components/layout/GameModeProvider';
import { useState } from 'react';

const wordSearchTheme = getGameById('caca-palavras')?.theme ?? 'default';

function CacaPalavrasContent() {
  const game = useWordSearchGame();
  const [isStarting, setIsStarting] = useState(false);

  // Modo imersivo: durante a partida a navbar/rodapé somem e a grade ocupa
  // 100% da tela, sem barra de rolagem da página.
  useImmersiveGame(game.phase === 'playing');

  const handleStartGame = (config: Parameters<typeof game.startGame>[0]) => {
    setIsStarting(true);
    window.setTimeout(() => {
      game.startGame(config);
      setIsStarting(false);
    }, 350);
  };

  if (game.phase === 'config') {
    return (
      <>
        <div className="min-h-[60vh] flex items-center justify-center py-8">
          <WordSearchConfig onStart={handleStartGame} />
        </div>
        {!game.isCatalogReady && <LoadingScreen label="Carregando catálogo..." />}
        {isStarting && <LoadingScreen label="Preparando o caça-palavras..." />}
      </>
    );
  }

  if (game.phase === 'result') {
    return (
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
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-2 animate-in fade-in duration-300">
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

      {/* Main layout: Grid (left) + Word list (right) — a grade ocupa a altura
          restante da partida; rolagem só quando o conteúdo não cabe na tela */}
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain lg:flex-row lg:items-start lg:overflow-visible">
        {/* Grid — scrollable horizontally on small screens */}
        <div className="flex min-h-0 w-full justify-center overflow-x-auto lg:flex-1 lg:items-start lg:overflow-y-auto">
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
        <div className="w-full shrink-0 lg:max-h-full lg:w-72 lg:overflow-y-auto">
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
  );
}

export default function CacaPalavrasPage() {
  return (
    <ThemeProvider themeId={wordSearchTheme} className="flex min-h-0 flex-1 flex-col">
      <CacaPalavrasContent />
    </ThemeProvider>
  );
}
