import { GameDifficulty } from './game';

export interface GroupMember {
  id: string;
  name: string;
  image?: string;
  quantity?: string;
  unit?: string;
  isDistractor?: boolean;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  image?: string;
  category?: string;
  members: GroupMember[];
}

export type IngredientState = 'default' | 'selected' | 'correct' | 'incorrect' | 'missing';

export interface DrinkAssemblyMetrics {
  totalDrinks: number;
  completedDrinks: number;
  correctDrinks: number;
  incorrectDrinks: number;
  matches: number;
  errors: number;
  accuracy: number;
  totalIngredientsSelected: number;
  correctIngredients: number;
  incorrectIngredients: number;
  missingIngredients: number;
  bestStreak: number;
  durationSeconds: number;
  [key: string]: unknown;
}

export interface DrinkAssemblyScoringBreakdown {
  baseScore: number;
  correctIngredientsScore: number;
  incorrectPenalty: number;
  missingPenalty: number;
  streakBonus: number;
  speedBonus: number;
  difficultyMultiplier: number;
  finalScore: number;
}

export interface DrinkRoundEvaluation {
  isPerfectMatch: boolean;
  correctSelected: GroupMember[];
  incorrectSelected: GroupMember[];
  missingIngredients: GroupMember[];
}

export interface DrinkAssemblyConfigState {
  drinkCount: number | 'todos';
  difficulty: GameDifficulty;
  category: string;
}
