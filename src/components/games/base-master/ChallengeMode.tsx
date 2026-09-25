'use client';

import { AnswerFeedback } from './AnswerFeedback';
import { AnswerOptions } from './AnswerOptions';
import { BaseMasterHUD } from './BaseMasterHUD';
import { DrinkCard } from './DrinkCard';
import { BaseMasterAnswerRecord, BaseMasterQuestion } from '@/types/base-master';

interface ChallengeModeProps {
  question: BaseMasterQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedValue: string | null;
  isAnswered: boolean;
  lastAnswer: BaseMasterAnswerRecord | null;
  score: number;
  combo: number;
  bestCombo: number;
  correctAnswers: number;
  incorrectAnswers: number;
  formattedTime: string;
  secondsLeft: number;
  secondsPerQuestion: number;
  hasTimeLimit: boolean;
  category?: string;
  onAnswer: (value: string) => void;
  onQuit: () => void;
}

/**
 * Modo Desafio: mesma recuperação do Treinar, porém com cronômetro por
 * pergunta, combo em destaque e alternativas compactas.
 */
export function ChallengeMode({
  question,
  currentIndex,
  totalQuestions,
  selectedValue,
  isAnswered,
  lastAnswer,
  score,
  combo,
  bestCombo,
  correctAnswers,
  incorrectAnswers,
  formattedTime,
  secondsLeft,
  secondsPerQuestion,
  hasTimeLimit,
  category,
  onAnswer,
  onQuit,
}: ChallengeModeProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <BaseMasterHUD
        mode="desafio"
        score={score}
        combo={combo}
        correctAnswers={correctAnswers}
        incorrectAnswers={incorrectAnswers}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        formattedTime={formattedTime}
        secondsLeft={secondsLeft}
        secondsPerQuestion={secondsPerQuestion}
        hasTimeLimit={hasTimeLimit}
        onQuit={onQuit}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-2xl space-y-4">
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="font-bold uppercase tracking-widest text-muted-foreground">
              Pergunta {Math.min(currentIndex + 1, totalQuestions)} / {totalQuestions}
            </span>
            {bestCombo >= 2 && (
              <span className="rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-800">
                Melhor combo x{bestCombo}
              </span>
            )}
          </div>

          <DrinkCard
            key={question.id}
            name={question.drinkName}
            image={question.drinkImage}
            category={category}
            label={question.attributeLabel}
            value={question.correctValue}
            isBaseHidden={!isAnswered}
            size="sm"
          />

          <h1 className="text-center text-lg font-medium text-foreground">{question.prompt}</h1>

          <AnswerOptions
            question={question}
            selectedValue={selectedValue}
            isRevealed={isAnswered}
            onSelect={onAnswer}
            columns="four"
          />

          {isAnswered && lastAnswer && (
            <AnswerFeedback
              question={question}
              selectedValue={selectedValue}
              timedOut={lastAnswer.timedOut}
              pointsEarned={lastAnswer.pointsEarned}
              combo={lastAnswer.comboAfter}
            />
          )}
        </div>
      </div>
    </div>
  );
}
