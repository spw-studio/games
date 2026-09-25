'use client';

import { useState } from 'react';
import { AlertCircle, BookOpen, Clock, Flame, HelpCircle, Layers, Play, Zap } from 'lucide-react';
import { GAME_CONFIG } from '@/config/game-config';
import { QUIZ_ALL_CATEGORIES } from '@/hooks/useProductQuiz';
import { Category, Product } from '@/types/cardapio';
import { GameDifficulty } from '@/types/game';
import { QuizConfigState } from '@/types/quiz';

interface QuizConfigScreenProps {
  /** `null` = catálogo ainda carregando; `[]` = catálogo vazio/indisponível. */
  catalog: Product[] | null;
  categories: Category[];
  /** Contagem de produtos elegíveis por categoria (`'todas'` incluso). */
  eligibleCountByCategory: Record<string, number>;
  onStart: (config: QuizConfigState) => void;
}

const QUIZ = GAME_CONFIG.QUIZ;

const DIFFICULTIES: Array<{
  id: GameDifficulty;
  label: string;
  desc: string;
  icon: React.ReactNode;
  meta: string;
}> = [
  {
    id: 'facil',
    label: 'Fácil',
    desc: 'Menos alternativas e mais tempo para cada pista.',
    icon: <BookOpen className="h-5 w-5" />,
    meta: `${QUIZ.OPTION_COUNT.facil} alternativas • ${QUIZ.TIME_PER_QUESTION.facil}s`,
  },
  {
    id: 'medio',
    label: 'Médio',
    desc: 'Equilíbrio clássico entre tempo e distratores.',
    icon: <Zap className="h-5 w-5" />,
    meta: `${QUIZ.OPTION_COUNT.medio} alternativas • ${QUIZ.TIME_PER_QUESTION.medio}s`,
  },
  {
    id: 'dificil',
    label: 'Difícil',
    desc: 'Distratores da mesma categoria e menos tempo.',
    icon: <Flame className="h-5 w-5" />,
    meta: `${QUIZ.OPTION_COUNT.dificil} alternativas • ${QUIZ.TIME_PER_QUESTION.dificil}s`,
  },
];

const QUESTION_OPTIONS: Array<number | 'todas'> = [...QUIZ.QUESTION_COUNTS, 'todas'];

export function QuizConfigScreen({
  catalog,
  categories,
  eligibleCountByCategory,
  onStart,
}: QuizConfigScreenProps) {
  const [questionCount, setQuestionCount] = useState<number | 'todas'>(
    QUIZ.DEFAULT_QUESTION_COUNT
  );
  const [difficulty, setDifficulty] = useState<GameDifficulty>(GAME_CONFIG.DEFAULT_DIFFICULTY);
  const [category, setCategory] = useState<string>(QUIZ_ALL_CATEGORIES);

  const isLoading = catalog === null;
  const isCatalogEmpty = catalog !== null && catalog.length === 0;
  const eligibleCount = eligibleCountByCategory[category] ?? 0;
  const canStart = !isLoading && !isCatalogEmpty && eligibleCount > 0;

  const handleStart = () => {
    if (!canStart) return;

    onStart({
      questionCount,
      difficulty,
      category,
      timePerQuestion: QUIZ.TIME_PER_QUESTION[difficulty],
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="relative overflow-hidden rounded-card border border-secondary/20 bg-primary p-8 text-center text-primary-foreground shadow-elevated">
        <div className="absolute inset-0 bg-[radial-gradient(#C89D5C_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-gold-400/40 bg-overlay/10 text-gold-300 shadow-xl backdrop-blur-md">
            <HelpCircle className="h-8 w-8" />
          </div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-500/20 px-3.5 py-1 text-xs font-semibold text-gold-300">
            <Layers className="h-3.5 w-3.5" />
            <span>Conhecimento Rápido</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Quiz de Produtos
          </h1>
          <p className="mt-2 max-w-lg text-sm font-light leading-relaxed text-foreground/90 sm:text-base">
            Uma pista é revelada — descrição, ingredientes, código, acompanhamentos ou
            restrições. Identifique o produto certo antes que o tempo acabe!
          </p>
        </div>
      </div>

      {/* Como jogar */}
      <div className="rounded-card border border-border bg-muted p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-secondary">
          Como jogar
        </h2>
        <ul className="space-y-2 text-sm text-foreground">
          {[
            'Leia a pista e escolha o produto correto entre as alternativas reais do cardápio.',
            'Acertos ganham pontos; erros e tempo esgotado são penalizados.',
            'Sequências de acertos e respostas rápidas rendem bônus extras.',
            'A dificuldade define o número de alternativas e o tempo por pergunta.',
          ].map((tip, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {index + 1}
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 1. Categoria */}
      <fieldset className="space-y-3">
        <legend className="block text-sm font-bold uppercase tracking-wider text-foreground">
          1. Categoria do cardápio
        </legend>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory(QUIZ_ALL_CATEGORIES)}
            aria-pressed={category === QUIZ_ALL_CATEGORIES}
            className={`rounded-control border-2 px-4 py-2.5 text-sm font-semibold transition-all active:scale-95 ${
              category === QUIZ_ALL_CATEGORIES
                ? 'border-primary bg-primary text-primary-foreground shadow-card'
                : 'border-border bg-surface text-foreground hover:border-primary/40'
            }`}
          >
            Todas
            <span className="ml-2 text-xs opacity-70">
              {eligibleCountByCategory[QUIZ_ALL_CATEGORIES] ?? 0}
            </span>
          </button>

          {categories.map((item) => {
            const count = eligibleCountByCategory[item.id] ?? 0;
            const isDisabled = !isLoading && count === 0;
            const isSelected = category === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                disabled={isDisabled}
                aria-pressed={isSelected}
                className={`rounded-control border-2 px-4 py-2.5 text-sm font-semibold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground shadow-card'
                    : 'border-border bg-surface text-foreground hover:border-primary/40'
                }`}
              >
                {item.name}
                <span className="ml-2 text-xs opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-subtle-foreground">
          O número ao lado da categoria indica produtos com pistas válidas disponíveis.
        </p>
      </fieldset>

      {/* 2. Quantidade de perguntas */}
      <fieldset className="space-y-3">
        <legend className="block text-sm font-bold uppercase tracking-wider text-foreground">
          2. Perguntas por partida
        </legend>
        <div className="flex flex-wrap gap-2">
          {QUESTION_OPTIONS.map((option) => {
            const exceedsCatalog =
              option !== 'todas' && eligibleCount > 0 && option > eligibleCount;
            const isSelected = questionCount === option;

            return (
              <button
                key={String(option)}
                type="button"
                onClick={() => setQuestionCount(option)}
                disabled={exceedsCatalog}
                aria-pressed={isSelected}
                className={`rounded-control border-2 px-4 py-2.5 text-sm font-semibold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground shadow-card'
                    : 'border-border bg-surface text-foreground hover:border-primary/40'
                }`}
              >
                {option === 'todas' ? 'Todas' : option}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 3. Dificuldade */}
      <fieldset className="space-y-3">
        <legend className="block text-sm font-bold uppercase tracking-wider text-foreground">
          3. Dificuldade
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {DIFFICULTIES.map((item) => {
            const isSelected = difficulty === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setDifficulty(item.id)}
                aria-pressed={isSelected}
                className={`flex flex-col justify-between rounded-2xl border-2 p-4 text-left transition-all active:scale-95 ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground shadow-card'
                    : 'border-border bg-surface text-foreground hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-serif font-bold">
                    {item.icon}
                    {item.label}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                      isSelected
                        ? 'border border-gold-400/40 bg-gold-500/20 text-gold-300'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {GAME_CONFIG.SCORING.DIFFICULTY_MULTIPLIERS[item.id]}x
                  </span>
                </div>
                <p
                  className={`mt-2 text-xs leading-relaxed ${
                    isSelected ? 'text-foreground/90' : 'text-muted-foreground'
                  }`}
                >
                  {item.desc}
                </p>
                <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold opacity-80">
                  <Clock className="h-3 w-3" />
                  {item.meta}
                </p>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Estados do catálogo */}
      {isCatalogEmpty && (
        <div className="flex items-start gap-3 rounded-card border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Não foi possível carregar o cardápio. Verifique a conexão e tente novamente.
          </span>
        </div>
      )}

      {!isLoading && !isCatalogEmpty && eligibleCount === 0 && (
        <div className="flex items-start gap-3 rounded-card border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Nenhum produto desta categoria possui pistas válidas. Escolha outra categoria.
          </span>
        </div>
      )}

      {/* Iniciar */}
      <button
        type="button"
        onClick={handleStart}
        disabled={!canStart}
        className="flex w-full items-center justify-center gap-3 rounded-control border-2 border-secondary/30 bg-primary px-6 py-4 text-lg font-bold text-secondary shadow-elevated transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Play className="h-5 w-5 fill-gold-300 text-gold-300" />
        <span>{isLoading ? 'Carregando cardápio...' : 'INICIAR PARTIDA'}</span>
      </button>
    </div>
  );
}
