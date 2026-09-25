import { GameDifficulty } from './game';

/**
 * Tipos do módulo "Base Master".
 *
 * O núcleo é `DRINK → BEBIDA DE BASE`, mas a estrutura já é multi-atributo:
 * cada drink pode render perguntas de outros atributos (método, copo, guarnição)
 * assim que o catálogo os declarar — sem novo motor e sem lista paralela de dados.
 *
 * A lógica vive em `lib/games/base-master.ts`; a pontuação em
 * `lib/scoring/base-master.ts`; a memória de aprendizado em
 * `lib/storage/base-master-progress.ts`.
 */

/** Modos do módulo. `revisao` é acionada pela tela final (erros da rodada). */
export type BaseMasterMode = 'aprender' | 'treinar' | 'desafio' | 'revisao';

/** Rótulos de UI por modo (fonte única para telas e resultados). */
export const BASE_MASTER_MODE_LABELS: Record<BaseMasterMode, string> = {
  aprender: 'Aprender',
  treinar: 'Treinar',
  desafio: 'Desafio',
  revisao: 'Revisão',
};

/** Atributos do drink que o motor sabe transformar em pergunta. */
export type BaseMasterAttributeId = 'bebida-base' | 'metodo' | 'copo' | 'garnish';

/** Descritor de um atributo (rótulo, enunciado e papel no módulo). */
export interface BaseMasterAttributeInfo {
  id: BaseMasterAttributeId;
  /** Rótulo completo exibido na pergunta/revisão. */
  label: string;
  /** Rótulo curto para selos compactos. */
  shortLabel: string;
  /** Enunciado da pergunta. */
  prompt: string;
  /** `true` apenas para a bebida de base (identidade do módulo). */
  core: boolean;
}

/** De onde veio a bebida de base (auditável — nunca inventada). */
export type BaseSpiritSource = 'explicito' | 'ingredientes';

/** Resultado da resolução "drink → bebida de base". */
export interface BaseSpiritResolution {
  /** Nome canônico exibido (ex: "Rum"). */
  spirit: string;
  source: BaseSpiritSource;
  /** Ingrediente do catálogo que originou a resolução (quando derivada). */
  matchedIngredient?: string;
  /** true quando o drink casa com mais de uma bebida de base distinta. */
  ambiguous: boolean;
}

/** Drink elegível: produto real do catálogo com bebida de base resolvida. */
export interface BaseMasterDrink {
  id: string;
  name: string;
  image?: string;
  categoryId: string;
  ingredients: string[];
  baseSpirit: string;
  spiritSource: BaseSpiritSource;
  /** Atributos adicionais declarados no catálogo (opcionais, alimentam perguntas). */
  metodo?: string;
  copo?: string;
  garnish?: string;
}

/** Pergunta do Treinar/Desafio (montada dinamicamente a partir do catálogo). */
export interface BaseMasterQuestion {
  id: string;
  /** Atributo perguntado (ex: `bebida-base`). */
  attribute: BaseMasterAttributeId;
  attributeLabel: string;
  /** Enunciado já pronto (ex: "Qual é a bebida de base do drink?"). */
  prompt: string;
  drinkId: string;
  drinkName: string;
  drinkImage?: string;
  /** Valor correto do atributo para este drink. */
  correctValue: string;
  /** Alternativas embaralhadas — sempre valores reais existentes no catálogo. */
  options: string[];
}

/** Registro de uma resposta (usado na tela final e na persistência). */
export interface BaseMasterAnswerRecord {
  questionId: string;
  attribute: BaseMasterAttributeId;
  attributeLabel: string;
  drinkId: string;
  drinkName: string;
  correctValue: string;
  /** Valor escolhido; `null` quando o tempo acabou. */
  selectedValue: string | null;
  isCorrect: boolean;
  timedOut: boolean;
  answeredInSeconds: number;
  /** Combo após esta resposta (0 = erro/timeout). */
  comboAfter: number;
  basePoints: number;
  comboBonus: number;
  speedBonus: number;
  /** Soma dos itens acima (pontuação bruta desta resposta). */
  pointsEarned: number;
}

export interface BaseMasterConfigState {
  mode: BaseMasterMode;
  /** Perguntas de Treinar/Desafio (`'todas'` = todos os drinks elegíveis). */
  questionCount: number | 'todas';
  /** Segundos por pergunta no Desafio (0 = sem cronômetro). */
  challengeSeconds: number;
  /** Dificuldade: alternativas, tempo sugerido e multiplicador de pontos. */
  difficulty: GameDifficulty;
}

/** Memória de aprendizado por drink (repetição espaçada). */
export interface BaseMasterDrinkProgress {
  drinkId: string;
  /** Quantas vezes foi apresentado no modo Aprender. */
  seen: number;
  correct: number;
  wrong: number;
  lastPlayedAt: string;
}

export type BaseMasterProgressMap = Record<string, BaseMasterDrinkProgress>;

/** Atributo + quantos drinks do catálogo possuem valor para ele (uso na UI). */
export interface BaseMasterAttributeUsage extends BaseMasterAttributeInfo {
  drinksCount: number;
}

/** Resumo da memória de aprendizado exibido na tela de configuração. */
export interface BaseMasterProgressSummary {
  total: number;
  /** Drinks já vistos em Aprender ou respondidos em alguma rodada. */
  reviewed: number;
  /** Drinks em que os erros superam os acertos (prioridade de reforço). */
  struggling: number;
}

export interface BaseMasterMetrics {
  mode: BaseMasterMode;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timedOutAnswers: number;
  accuracy: number;
  bestCombo: number;
  score: number;
  durationSeconds: number;
  avgSecondsPerAnswer: number;
  [key: string]: unknown;
}

export interface BaseMasterScoringBreakdown {
  basePoints: number;
  comboBonus: number;
  speedBonus: number;
  difficultyMultiplier: number;
  finalScore: number;
}

/** Estado visual de uma alternativa (nunca só cor: a UI adiciona ícone/texto). */
export type BaseMasterOptionState =
  | 'idle'
  | 'selected'
  | 'correct'
  | 'incorrect'
  | 'muted';
