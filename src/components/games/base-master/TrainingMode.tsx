'use client';

import { AnswerFeedback } from './AnswerFeedback';
import { AnswerOptions } from './AnswerOptions';
import { BaseMasterHUD } from './BaseMasterHUD';
import { DrinkCard } from './DrinkCard';
import {
  BaseMasterAnswerRecord,
  BaseMasterMode,
  BaseMasterQuestion,
} from '@/types/base-master';

interface TrainingModeProps {
  question: BaseMasterQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedValue: string | null;
  isAnswered: boolean;
  /** Última resposta registrada (para o feedback e os pontos). */
  lastAnswer: BaseMasterAnswerRecord | null;
  score: number;
  combo: number;
  correctAnswers: number;
  incorrectAnswers: number;
  formattedTime: string;
  category?: string;
  /** `treinar` (padrão) ou `revisao` — só muda o rótulo exibido no HUD. */
  mode?: BaseMasterMode;
  onAnswer: (value: string) => void;
  onQuit: () => void;
}

/**
 * Modo Treinar: recuperação do atributo sem pressão de tempo (também usado
 * pela Revisão de erros). O valor permanece oculto até a resposta.
 */
export function TrainingMode({
  question,
  currentIndex,
  totalQuestions,
  selectedValue,
  isAnswered,
  lastAnswer,
  score,
  combo,
  correctAnswers,
  incorrectAnswers,
  formattedTime,
  category,
  mode = 'treinar',
  onAnswer,
  onQuit,
}: TrainingModeProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <BaseMasterHUD
        mode={mode}
        score={score}
        combo={combo}
        correctAnswers={correctAnswers}
        incorrectAnswers={incorrectAnswers}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        formattedTime={formattedTime}
        onQuit={onQuit}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-xl space-y-4">
          <p className="text-center text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Pergunta {Math.min(currentIndex + 1, totalQuestions)} / {totalQuestions}
          </p>

          <div className="flex items-center justify-center gap-2">
            <span className="rounded-full border border-secondary/30 bg-primary-soft px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary">
              {question.attributeLabel}
            </span>
          </div>

          <h1 className="text-center text-lg font-medium text-foreground sm:text-xl">
            {question.prompt}
          </h1>

          <DrinkCard
            key={question.id}
            name={question.drinkName}
            image={question.drinkImage}
            category={category}
            label={question.attributeLabel}
            value={question.correctValue}
            isBaseHidden={!isAnswered}
            size="md"
          />

          <AnswerOptions
            question={question}
            selectedValue={selectedValue}
            isRevealed={isAnswered}
            onSelect={onAnswer}
            columns="two"
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
