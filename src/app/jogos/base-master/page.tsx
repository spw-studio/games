'use client';

import { useState } from 'react';
import { BaseMasterConfigScreen } from '@/components/games/base-master/BaseMasterConfigScreen';
import { BaseMasterResult } from '@/components/games/base-master/BaseMasterResult';
import { ChallengeMode } from '@/components/games/base-master/ChallengeMode';
import { LearningMode } from '@/components/games/base-master/LearningMode';
import { TrainingMode } from '@/components/games/base-master/TrainingMode';
import { useImmersiveGame } from '@/components/layout/GameModeProvider';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { NoticeModal } from '@/components/ui/NoticeModal';
import { BASE_MASTER_GAME_ID, useBaseMaster } from '@/hooks/useBaseMaster';
import { getGameById } from '@/lib/games/registry';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { BaseMasterConfigState } from '@/types/base-master';

const baseMasterTheme = getGameById(BASE_MASTER_GAME_ID)?.theme ?? 'default';

function BaseMasterContent() {
  const game = useBaseMaster();
  const [isStartBlocked, setIsStartBlocked] = useState(false);

  // Modo imersivo apenas durante a partida (Treinar/Desafio).
  useImmersiveGame(game.phase === 'treinar' || game.phase === 'desafio');

  const handleStart = (config: BaseMasterConfigState) => {
    if (!game.startGame(config)) {
      setIsStartBlocked(true);
    }
  };

  /** Revisão dirigida dos erros da rodada encerrada. */
  const handleReviewMistakes = () => {
    if (!game.startMistakesReview()) {
      setIsStartBlocked(true);
    }
  };

  // ---- Configuração ----
  if (game.phase === 'config') {
    return (
      <>
        <div className="min-h-[60vh] py-8">
          <BaseMasterConfigScreen
            catalog={game.catalog}
            drinksCount={game.drinksCount}
            spiritsCount={game.spiritsCount}
            availableSpirits={game.availableSpirits}
            attributes={game.attributes}
            progressSummary={game.progressSummary}
            onStart={handleStart}
          />
        </div>

        {!game.catalogReady && <LoadingScreen label="Carregando catálogo..." />}

        <NoticeModal
          isOpen={isStartBlocked}
          variant="warning"
          title="Nenhum drink disponível"
          message="Os drinks do cardápio ainda não têm bebida de base identificada. Cadastre os ingredientes do drink (ou declare a base) para liberar o Base Master."
          onClose={() => setIsStartBlocked(false)}
          primaryAction={{ label: 'Entendi', onClick: () => setIsStartBlocked(false) }}
        />
      </>
    );
  }

  // ---- Aprender ----
  if (game.phase === 'aprender' && game.learningDrink) {
    return (
      <div className="py-6">
        <LearningMode
          drink={game.learningDrink}
          index={game.learningIndex}
          total={game.learningTotal}
          isBaseRevealed={game.isBaseRevealed}
          hasPrevious={game.hasPreviousDrink}
          hasNext={game.hasNextDrink}
          onToggleBase={game.toggleBaseReveal}
          onPrevious={game.goToPreviousDrink}
          onNext={game.goToNextDrink}
          onQuit={game.finishEarly}
        />
      </div>
    );
  }

  // ---- Resultado (Treinar / Desafio) ----
  if (game.phase === 'result' && game.finalMetrics) {
    return (
      <div className="py-8">
        <BaseMasterResult
          metrics={game.finalMetrics}
          answers={game.answers}
          onPlayAgain={game.onPlayAgain}
          onReviewMistakes={handleReviewMistakes}
        />
      </div>
    );
  }

  // ---- Partida ----
  const question = game.currentQuestion;
  if (!question) return null;

  const lastAnswer = game.answers[game.answers.length - 1] ?? null;

  if (game.phase === 'desafio') {
    return (
      <div className="flex min-h-0 flex-1 flex-col p-2 animate-in fade-in duration-300">
        <ChallengeMode
          question={question}
          currentIndex={game.currentIndex}
          totalQuestions={game.totalQuestions}
          selectedValue={game.selectedValue}
          isAnswered={game.isAnswered}
          lastAnswer={lastAnswer}
          score={game.score}
          combo={game.combo}
          bestCombo={game.bestCombo}
          correctAnswers={game.correctAnswers}
          incorrectAnswers={game.incorrectAnswers}
          formattedTime={game.formattedTime}
          secondsLeft={game.secondsLeft}
          secondsPerQuestion={game.secondsPerQuestion}
          hasTimeLimit={game.hasTimeLimit}
          onAnswer={game.answer}
          onQuit={game.finishEarly}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col p-2 animate-in fade-in duration-300">
      <TrainingMode
        question={question}
        currentIndex={game.currentIndex}
        totalQuestions={game.totalQuestions}
        selectedValue={game.selectedValue}
        isAnswered={game.isAnswered}
        lastAnswer={lastAnswer}
        score={game.score}
        combo={game.combo}
        correctAnswers={game.correctAnswers}
        incorrectAnswers={game.incorrectAnswers}
        formattedTime={game.formattedTime}
        mode={game.mode}
        onAnswer={game.answer}
        onQuit={game.finishEarly}
      />
    </div>
  );
}

export default function BaseMasterPage() {
  return (
    <ThemeProvider themeId={baseMasterTheme} className="flex min-h-0 flex-1 flex-col">
      <BaseMasterContent />
    </ThemeProvider>
  );
}
