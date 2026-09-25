'use client';

import { useState } from 'react';
import {
  AlertCircle,
  Flame,
  GraduationCap,
  Layers,
  Martini,
  Play,
  Repeat,
  Target,
  Wine,
} from 'lucide-react';
import { GAME_CONFIG } from '@/config/game-config';
import {
  BaseMasterAttributeUsage,
  BaseMasterConfigState,
  BaseMasterMode,
  BaseMasterProgressSummary,
} from '@/types/base-master';
import { GameDifficulty } from '@/types/game';
import { Product } from '@/types/cardapio';

interface BaseMasterConfigScreenProps {
  /** `null` = catálogo ainda carregando; `[]` = catálogo vazio/indisponível. */
  catalog: Product[] | null;
  /** Drinks com bebida de base resolvida (derivada do catálogo). */
  drinksCount: number;
  spiritsCount: number;
  availableSpirits: string[];
  /** Atributos do drink disponíveis no catálogo atual (base sempre incluso). */
  attributes: BaseMasterAttributeUsage[];
  /** Memória de aprendizado (drinks revisados / a reforçar). */
  progressSummary: BaseMasterProgressSummary;
  onStart: (config: BaseMasterConfigState) => void;
}

const BASE_MASTER = GAME_CONFIG.BASE_MASTER;

const DIFFICULTIES: Array<{
  id: GameDifficulty;
  label: string;
  description: string;
}> = [
  {
    id: 'facil',
    label: 'Fácil',
    description: 'Menos alternativas e mais tempo para pensar.',
  },
  {
    id: 'medio',
    label: 'Médio',
    description: 'Equilíbrio entre alternativas, tempo e pontos.',
  },
  {
    id: 'dificil',
    label: 'Difícil',
    description: 'Mais alternativas, menos tempo e mais pontos.',
  },
];

const MODES: Array<{
  id: BaseMasterMode;
  title: string;
  description: string;
  highlight: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'aprender',
    title: 'Aprender',
    description: 'Veja a associação drink → bebida de base, no seu ritmo, sem pressão.',
    highlight: 'Sem pontuação',
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    id: 'treinar',
    title: 'Treinar',
    description: 'Escolha a base correta de cada drink e receba feedback imediato.',
    highlight: 'Pontos e combo',
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: 'desafio',
    title: 'Desafio',
    description: 'Recupere a base de cada drink contra o cronômetro.',
    highlight: 'Pontos, combo e tempo',
    icon: <Flame className="h-5 w-5" />,
  },
];

const QUESTION_OPTIONS: Array<number | 'todas'> = [...BASE_MASTER.QUESTION_COUNTS, 'todas'];

/**
 * Tela de configuração do Base Master: escolha do modo, quantidade de perguntas
 * e cronômetro do Desafio. Os números vêm de `GAME_CONFIG.BASE_MASTER`.
 */
export function BaseMasterConfigScreen({
  catalog,
  drinksCount,
  spiritsCount,
  availableSpirits,
  attributes,
  progressSummary,
  onStart,
}: BaseMasterConfigScreenProps) {
  const [mode, setMode] = useState<BaseMasterMode>('aprender');
  const [difficulty, setDifficulty] = useState<GameDifficulty>(GAME_CONFIG.DEFAULT_DIFFICULTY);
  const [questionCount, setQuestionCount] = useState<number | 'todas'>(
    BASE_MASTER.DEFAULT_QUESTION_COUNT
  );
  const [challengeSeconds, setChallengeSeconds] = useState<number>(
    BASE_MASTER.CHALLENGE_SECONDS[GAME_CONFIG.DEFAULT_DIFFICULTY]
  );

  const isLoading = catalog === null;
  const hasDrinks = drinksCount > 0;
  const canStart = !isLoading && hasDrinks;
  const selectedMode = MODES.find((item) => item.id === mode) ?? MODES[0];
  const optionCount = BASE_MASTER.OPTION_COUNT[difficulty] ?? BASE_MASTER.OPTION_COUNT.medio;
  const suggestedSeconds = BASE_MASTER.CHALLENGE_SECONDS[difficulty];
  const availableAttributes = attributes.filter((attribute) => attribute.drinksCount > 0);

  /** A dificuldade também sugere o cronômetro padrão do Desafio. */
  const handleDifficultyChange = (next: GameDifficulty) => {
    setDifficulty(next);
    setChallengeSeconds(BASE_MASTER.CHALLENGE_SECONDS[next] ?? BASE_MASTER.DEFAULT_CHALLENGE_SECONDS);
  };

  const handleStart = () => {
    if (!canStart) return;

    onStart({ mode, questionCount, challengeSeconds, difficulty });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="relative overflow-hidden rounded-card border border-secondary/20 bg-primary p-8 text-center text-primary-foreground shadow-elevated">
        <div className="absolute inset-0 bg-[radial-gradient(#C89D5C_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-gold-400/40 bg-overlay/10 text-gold-300 shadow-xl backdrop-blur-md">
            <Martini className="h-8 w-8" />
          </div>

          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-500/20 px-3.5 py-1 text-xs font-semibold text-gold-300">
            <Wine className="h-3.5 w-3.5" />
            <span>Drinks & Coquetelaria</span>
          </div>

          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">Base Master</h1>

          <p className="mt-2 max-w-lg text-sm font-light leading-relaxed text-foreground/90 sm:text-base">
            Treine a memória do bar: memorize e recupere a bebida alcoólica de base de
            cada drink do cardápio.
          </p>
        </div>
      </div>

      {/* Modos */}
      <fieldset className="space-y-3">
        <legend className="block text-sm font-bold uppercase tracking-wider text-foreground">
          1. Modo de jogo
        </legend>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {MODES.map((item) => {
            const isSelected = mode === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                aria-pressed={isSelected}
                className={`flex flex-col justify-between rounded-2xl border-2 p-4 text-left transition-all active:scale-95 ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground shadow-card'
                    : 'border-border bg-surface text-foreground hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="font-serif text-base font-bold">{item.title}</span>
                </div>

                <p
                  className={`mt-2 text-xs leading-relaxed ${
                    isSelected ? 'text-foreground/90' : 'text-muted-foreground'
                  }`}
                >
                  {item.description}
                </p>

                <span
                  className={`mt-3 inline-flex w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    isSelected
                      ? 'border border-gold-400/40 bg-gold-500/20 text-gold-300'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {item.highlight}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Dificuldade */}
      <fieldset className="space-y-3">
        <legend className="block text-sm font-bold uppercase tracking-wider text-foreground">
          2. Dificuldade
        </legend>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {DIFFICULTIES.map((item) => {
            const isSelected = difficulty === item.id;
            const multiplier = GAME_CONFIG.SCORING.DIFFICULTY_MULTIPLIERS[item.id];

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleDifficultyChange(item.id)}
                aria-pressed={isSelected}
                className={`flex flex-col justify-between rounded-2xl border-2 p-4 text-left transition-all active:scale-95 ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground shadow-card'
                    : 'border-border bg-surface text-foreground hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-base font-bold">{item.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                      isSelected
                        ? 'border border-gold-400/40 bg-gold-500/20 text-gold-300'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {multiplier}x
                  </span>
                </div>

                <p
                  className={`mt-2 text-xs leading-relaxed ${
                    isSelected ? 'text-foreground/90' : 'text-muted-foreground'
                  }`}
                >
                  {item.description}
                </p>

                <p className="mt-2 text-[11px] font-semibold opacity-80">
                  {BASE_MASTER.OPTION_COUNT[item.id]} alternativas •{' '}
                  {BASE_MASTER.CHALLENGE_SECONDS[item.id]}s sugeridos
                </p>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Quantidade de perguntas (Treinar / Desafio) */}
      {mode !== 'aprender' && (
        <fieldset className="space-y-3">
          <legend className="block text-sm font-bold uppercase tracking-wider text-foreground">
            3. Perguntas da rodada
          </legend>

          <div className="flex flex-wrap gap-2">
            {QUESTION_OPTIONS.map((option) => {
              const exceedsCatalog =
                option !== 'todas' && hasDrinks && option > drinksCount;
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

          <p className="text-xs text-subtle-foreground">
            Cada drink aparece uma única vez por rodada, em ordem sorteada.
          </p>
        </fieldset>
      )}

      {/* Cronômetro (Desafio) */}
      {mode === 'desafio' && (
        <fieldset className="space-y-3">
          <legend className="block text-sm font-bold uppercase tracking-wider text-foreground">
            4. Tempo por pergunta
          </legend>

          <div className="flex flex-wrap gap-2">
            {BASE_MASTER.CHALLENGE_SECONDS_OPTIONS.map((option) => {
              const isSelected = challengeSeconds === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setChallengeSeconds(option)}
                  aria-pressed={isSelected}
                  className={`rounded-control border-2 px-4 py-2.5 text-sm font-semibold transition-all active:scale-95 ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground shadow-card'
                      : 'border-border bg-surface text-foreground hover:border-primary/40'
                  }`}
                >
                  {option === 0 ? 'Sem limite' : `${option}s`}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-subtle-foreground">
            Respostas rápidas rendem bônus de rapidez; ao estourar o tempo o combo zera.
            Sugestão para {DIFFICULTIES.find((item) => item.id === difficulty)?.label.toLowerCase()}:{' '}
            {suggestedSeconds}s.
          </p>
        </fieldset>
      )}

      {/* Resumo do catálogo (fonte real dos desafios) */}
      <div className="rounded-card border border-border bg-muted p-4">
        <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-secondary">
          Baseado no cardápio
        </h2>

        <p className="text-sm text-foreground">
          <span className="font-bold">{drinksCount}</span> drinks com bebida de base
          identificada em <span className="font-bold">{spiritsCount}</span>{' '}
          {spiritsCount === 1 ? 'base distinta' : 'bases distintas'}
          {hasDrinks ? ':' : '.'}
        </p>

        {availableSpirits.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2" aria-label="Bebidas de base disponíveis">
            {availableSpirits.map((spirit) => (
              <li
                key={spirit}
                className="rounded-full border border-secondary/30 bg-surface px-3 py-1 text-xs font-semibold text-foreground"
              >
                {spirit}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 text-xs text-subtle-foreground">
          As alternativas são sempre valores reais deste conjunto — nunca opções inventadas.
          Cada pergunta traz {optionCount} alternativas na dificuldade escolhida.
        </p>

        {availableAttributes.length > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <Layers className="h-3 w-3" aria-hidden="true" />
              Atributos perguntados
            </div>
            <ul className="mt-2 flex flex-wrap gap-2" aria-label="Atributos disponíveis">
              {availableAttributes.map((attribute) => (
                <li
                  key={attribute.id}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-foreground"
                >
                  {attribute.label}
                  <span className="ml-1.5 text-[10px] opacity-70">
                    {attribute.drinksCount}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 border-t border-border pt-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <Repeat className="h-3 w-3" aria-hidden="true" />
            Memória de aprendizado
          </div>
          <p className="mt-2 text-sm text-foreground">
            <span className="font-bold">{progressSummary.reviewed}</span> de{' '}
            {progressSummary.total} drinks já revisados
            {progressSummary.struggling > 0 && (
              <>
                {' '}
                • <span className="font-bold text-warning">{progressSummary.struggling}</span> com
                mais erros que acertos
              </>
            )}
            .
          </p>
          <p className="mt-1 text-xs text-subtle-foreground">
            As rodadas priorizam automaticamente os drinks nunca vistos e os que você erra mais.
          </p>
        </div>
      </div>

      {/* Estados do catálogo */}
      {!isLoading && !hasDrinks && (
        <div className="flex items-start gap-3 rounded-card border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Nenhum drink disponível para este jogo.</span>
        </div>
      )}

      {!isLoading && hasDrinks && spiritsCount === 1 && (
        <div className="flex items-start gap-3 rounded-card border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Há apenas uma bebida de base no cardápio: as perguntas terão uma única
            alternativa até que outros drinks sejam cadastrados.
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
        <span>
          {isLoading
            ? 'Carregando cardápio...'
            : `INICIAR ${selectedMode.title.toUpperCase()}`}
        </span>
      </button>
    </div>
  );
}
