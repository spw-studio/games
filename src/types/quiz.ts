import { GameDifficulty } from './game';

/**
 * Tipos do jogo "Conhecimento Rápido — Quiz de Produtos".
 * A lógica é independente da interface: as perguntas são montadas a partir do
 * catálogo central (`Product`) e consumidas apenas pela UI.
 */

/** Origem da pista usada para identificar o produto. */
export type QuizClueType =
  | 'descricao'
  | 'ingredientes'
  | 'codigo'
  | 'acompanhamentos'
  | 'restricao';

/** Pista já higienizada (sem revelar o nome do produto). */
export interface QuizClue {
  type: QuizClueType;
  /** Rótulo exibido no selo da pista. */
  label: string;
  /** Texto da pista. */
  text: string;
  /** Itens auxiliares (ingredientes, acompanhamentos, restrições). */
  items: string[];
}

/** Alternativa de resposta — sempre um produto real do catálogo. */
export interface QuizOption {
  productId: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  clueType: QuizClueType;
  clueLabel: string;
  clueText: string;
  clueItems: string[];
  correctProductId: string;
  correctProductName: string;
  correctProductDescription: string;
  correctProductImage?: string;
  categoryId: string;
  options: QuizOption[];
}

export interface QuizConfigState {
  /** Quantidade de perguntas da partida (`'todas'` = catálogo filtrado inteiro). */
  questionCount: number | 'todas';
  difficulty: GameDifficulty;
  /** `'todas'` ou o id de uma categoria do catálogo. */
  category: string;
  /** Tempo máximo por pergunta em segundos (0 = sem limite). */
  timePerQuestion: number;
}

export interface QuizAnswerRecord {
  questionId: string;
  /** Produto correto da pergunta (usado na revisão da partida). */
  correctProductId: string;
  correctProductName: string;
  /** Alternativa escolhida; `null` quando o tempo terminou. */
  selectedOptionId: string | null;
  isCorrect: boolean;
  timedOut: boolean;
  answeredInSeconds: number;
  clueType: QuizClueType;
}

export interface QuizMetrics {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timedOutAnswers: number;
  accuracy: number;
  bestStreak: number;
  durationSeconds: number;
  avgSecondsPerQuestion: number;
  [key: string]: unknown;
}

export interface QuizScoringBreakdown {
  correctPoints: number;
  streakBonus: number;
  timeBonus: number;
  incorrectPenalty: number;
  difficultyMultiplier: number;
  finalScore: number;
}
