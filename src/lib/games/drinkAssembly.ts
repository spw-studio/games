import { GameDifficulty } from '@/types/game';
import { DrinkRoundEvaluation, Group, GroupMember } from '@/types/grouping';

/**
 * Embaralha um array utilizando o algoritmo de Fisher-Yates (Knuth Shuffle).
 * Garante distribuição uniforme e aleatória sem viés.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Seleciona drinks para a partida sem repetição na mesma sessão.
 */
export function selectMatchDrinks(allDrinks: Group[], count: number | 'todos'): Group[] {
  const shuffled = shuffleArray(allDrinks);
  if (count === 'todos' || typeof count !== 'number') {
    return shuffled;
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Determina o número de distratores de acordo com o nível de dificuldade.
 * EASY: poucos (2 a 3)
 * MEDIUM: intermediário (4 a 5)
 * HARD: vários (6 a 8)
 */
export function getDistractorCount(difficulty: GameDifficulty): number {
  switch (difficulty) {
    case 'facil':
      return 3;
    case 'medio':
      return 5;
    case 'dificil':
      return 7;
    default:
      return 4;
  }
}

export interface DrinkRoundData {
  targetDrink: Group;
  pool: GroupMember[];
}

/**
 * Gera a rodada para um drink:
 * Mistura os ingredientes reais da receita com ingredientes incorretos (distratores)
 * extraídos de outros drinks do catálogo, e embaralha tudo via Fisher-Yates.
 */
export function generateDrinkRound(
  targetDrink: Group,
  allAvailableIngredients: string[],
  difficulty: GameDifficulty
): DrinkRoundData {
  const targetNames = new Set(
    targetDrink.members.map((m) => m.name.toLowerCase().trim())
  );

  // Filtra apenas ingredientes do catálogo que NÃO pertencem ao drink atual
  const potentialDistractors = allAvailableIngredients.filter(
    (name) => !targetNames.has(name.toLowerCase().trim())
  );

  // Embaralha os distratores candidatos e pega a quantidade definida pela dificuldade
  const shuffledDistractors = shuffleArray(potentialDistractors);
  const distractorCount = Math.min(
    getDistractorCount(difficulty),
    shuffledDistractors.length
  );
  const chosenDistractors = shuffledDistractors.slice(0, distractorCount);

  // Cria os GroupMembers distratores com IDs únicos para a rodada
  const distractorMembers: GroupMember[] = chosenDistractors.map(
    (name, idx) => ({
      id: `distractor_${targetDrink.id}_${idx}`,
      name,
      isDistractor: true,
    })
  );

  // Junta os membros verdadeiros com os distratores e embaralha tudo
  const pool = shuffleArray([...targetDrink.members, ...distractorMembers]);

  return {
    targetDrink,
    pool,
  };
}

/**
 * Compara a seleção do jogador com a receita oficial.
 * A resposta é 100% correta SE E SOMENTE SE:
 * ingredientes selecionados == ingredientes corretos (independente da ordem).
 */
export function evaluateDrinkSelection(
  targetDrink: Group,
  selectedIds: string[],
  pool: GroupMember[]
): DrinkRoundEvaluation {
  const targetNames = new Set(
    targetDrink.members.map((m) => m.name.toLowerCase().trim())
  );

  // Ingredientes selecionados pelo jogador nesta rodada
  const selectedMembers = pool.filter((p) => selectedIds.includes(p.id));

  // Acertos: selecionados que fazem parte da receita
  const correctSelected = selectedMembers.filter((s) =>
    targetNames.has(s.name.toLowerCase().trim())
  );

  // Erros: selecionados que NÃO fazem parte da receita (intrusos)
  const incorrectSelected = selectedMembers.filter(
    (s) => !targetNames.has(s.name.toLowerCase().trim())
  );

  // Faltantes: itens da receita que NÃO foram selecionados
  const missingIngredients = targetDrink.members.filter(
    (m) =>
      !selectedMembers.some(
        (s) => s.name.toLowerCase().trim() === m.name.toLowerCase().trim()
      )
  );

  const isPerfectMatch =
    incorrectSelected.length === 0 &&
    missingIngredients.length === 0 &&
    correctSelected.length === targetDrink.members.length;

  return {
    isPerfectMatch,
    correctSelected,
    incorrectSelected,
    missingIngredients,
  };
}
