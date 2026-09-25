'use client';

import { CheckCircle2, TimerOff, XCircle } from 'lucide-react';
import { useImmersiveGame } from '@/components/layout/GameModeProvider';
import { QuizClueCard } from '@/components/games/quiz/QuizClueCard';
import { QuizConfigScreen } from '@/components/games/quiz/QuizConfigScreen';
import { QuizHUD } from '@/components/games/quiz/QuizHUD';
import { QuizOptionsGrid } from '@/components/games/quiz/QuizOptionsGrid';
import { QuizResult } from '@/components/games/quiz/QuizResult';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { QUIZ_GAME_ID, useProductQuiz } from '@/hooks/useProductQuiz';
import { getGameById } from '@/lib/games/registry';
import { ThemeProvider } from '@/theme/ThemeProvider';

const quizTheme = getGameById(QUIZ_GAME_ID)?.theme ?? 'default';

function QuizContent() {
  const game = useProductQuiz();

  // Modo imersivo: durante a partida a navbar/rodapé somem e o quiz ocupa a tela.
  useImmersiveGame(game.phase === 'playing');

  // ---- Configuração ----
  if (game.phase === 'config') {
    return (
      <>
        <div className="min-h-[60vh] py-8">
          <QuizConfigScreen
            catalog={game.catalog}
            categories={game.categories}
            eligibleCountByCategory={game.eligibleCountByCategory}
            onStart={(config) => {
              game.startGame(config);
            }}
          />
        </div>
        {game.catalog === null && <LoadingScreen label="Carregando catálogo..." />}
      </>
    );
  }

  // ---- Resultado ----
  if (game.phase === 'result' && game.finalMetrics) {
    return (
      <div className="py-8">
        <QuizResult
          score={game.score}
          metrics={game.finalMetrics}
          answers={game.answers}
          questions={game.questions}
          onPlayAgain={game.onPlayAgain}
        />
      </div>
    );
  }

  // ---- Partida ----
  const question = game.currentQuestion;
  if (!question) return null;

  const lastAnswer = game.answers[game.answers.length - 1];
  const feedback = !game.isAnswered || !lastAnswer
    ? null
    : lastAnswer.isCorrect
      ? {
          icon: <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />,
          text: `Correto! ${question.correctProductName} é a resposta.`,
          className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        }
      : lastAnswer.timedOut
        ? {
            icon: <TimerOff className="h-5 w-5 shrink-0 text-rose-500" />,
            text: `Tempo esgotado! A resposta era ${question.correctProductName}.`,
            className: 'border-amber-200 bg-amber-50 text-amber-800',
          }
        : {
            icon: <XCircle className="h-5 w-5 shrink-0 text-rose-600" />,
            text: `Não foi dessa vez. A resposta era ${question.correctProductName}.`,
            className: 'border-rose-200 bg-rose-50 text-rose-700',
          };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-2 animate-in fade-in duration-300">
      <QuizHUD
        currentIndex={game.currentIndex}
        totalQuestions={game.totalQuestions}
        score={game.score}
        streak={game.streak}
        correctAnswers={game.correctAnswers}
        formattedTime={game.formattedTime}
        onQuit={game.finishEarly}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain">
        <QuizClueCard
          question={question}
          secondsLeft={game.secondsLeft}
          timePerQuestion={game.config.timePerQuestion}
          hasTimeLimit={game.hasTimeLimit}
          isAnswered={game.isAnswered}
        />

        <QuizOptionsGrid
          question={question}
          selectedOptionId={game.selectedOptionId}
          isAnswered={game.isAnswered}
          onSelect={game.answer}
        />

        {/* Feedback da resposta — anunciado por leitores de tela */}
        <div aria-live="polite" role="status" className="min-h-[3rem]">
          {feedback && (
            <div
              className={`flex items-center gap-2 rounded-control border px-4 py-3 text-sm font-semibold ${feedback.className} animate-in fade-in duration-200`}
            >
              {feedback.icon}
              <span>{feedback.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <ThemeProvider themeId={quizTheme} className="flex min-h-0 flex-1 flex-col">
      <QuizContent />
    </ThemeProvider>
  );
}
