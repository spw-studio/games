import { GAME_CONFIG } from '@/config/game-config';
import { DRINK_CATEGORY_ID, filterProductsByCategory } from '@/lib/cardapio/pure';
import { normalizeWord } from '@/lib/text/normalize';
import { shuffleArray } from '@/lib/utils/shuffle';
import {
  BaseMasterAnswerRecord,
  BaseMasterAttributeId,
  BaseMasterAttributeInfo,
  BaseMasterDrink,
  BaseMasterOptionState,
  BaseMasterProgressMap,
  BaseMasterQuestion,
  BaseSpiritResolution,
} from '@/types/base-master';
import { Product } from '@/types/cardapio';

/**
 * Motor do Base Master — 100% puro e independente de React.
 *
 * Responsabilidades: resolver a bebida de base de um produto do catálogo,
 * selecionar drinks elegíveis (priorizando o que o jogador erra mais),
 * gerar perguntas/alternativas de qualquer atributo do drink, decidir a
 * resposta correta e o estado visual das alternativas.
 *
 * A única fonte de dados é o catálogo da aplicação (`Product[]`). O vocabulário
 * de bebidas de base vive em `GAME_CONFIG.BASE_MASTER.SPIRITS` (léxico de
 * destilados, não dados de drink) e os demais atributos são lidos dos campos
 * opcionais do próprio produto (`metodo`, `copo`, `garnish`).
 */

const BASE_MASTER = GAME_CONFIG.BASE_MASTER;

/**
 * Atributos do drink que o motor sabe perguntar.
 * `bebida-base` é o núcleo do módulo; os demais são ativados automaticamente
 * quando o catálogo declara o campo correspondente — sem motor novo.
 */
export const BASE_MASTER_ATTRIBUTES: readonly BaseMasterAttributeInfo[] = [
  {
    id: 'bebida-base',
    label: 'Bebida de base',
    shortLabel: 'Base',
    prompt: 'Qual é a bebida de base do drink?',
    core: true,
  },
  {
    id: 'metodo',
    label: 'Método de preparo',
    shortLabel: 'Método',
    prompt: 'Qual é o método de preparo do drink?',
    core: false,
  },
  {
    id: 'copo',
    label: 'Copo ou taça',
    shortLabel: 'Copo',
    prompt: 'Em que copo ou taça o drink é servido?',
    core: false,
  },
  {
    id: 'garnish',
    label: 'Guarnição',
    shortLabel: 'Guarnição',
    prompt: 'Qual é a guarnição do drink?',
    core: false,
  },
];

/** Descritor do atributo (nunca `undefined`: cai no atributo núcleo). */
export function getAttributeInfo(attributeId: BaseMasterAttributeId): BaseMasterAttributeInfo {
  return (
    BASE_MASTER_ATTRIBUTES.find((attribute) => attribute.id === attributeId) ??
    BASE_MASTER_ATTRIBUTES[0]
  );
}

/** Valor de um atributo para um drink (ou `null` quando não declarado). */
export function getAttributeValue(
  drink: BaseMasterDrink,
  attributeId: BaseMasterAttributeId
): string | null {
  switch (attributeId) {
    case 'bebida-base':
      return drink.baseSpirit?.trim() || null;
    case 'metodo':
      return drink.metodo?.trim() || null;
    case 'copo':
      return drink.copo?.trim() || null;
    case 'garnish':
      return drink.garnish?.trim() || null;
    default:
      return null;
  }
}

/** Atributos com dado válido neste drink (o núcleo sempre que houver base). */
export function getAvailableAttributes(drink: BaseMasterDrink): BaseMasterAttributeInfo[] {
  return BASE_MASTER_ATTRIBUTES.filter((attribute) =>
    Boolean(getAttributeValue(drink, attribute.id))
  );
}

/** Casa a expressão com palavra(s) inteira(s) dentro do texto normalizado. */
function containsWholeWords(haystack: string, needle: string): boolean {
  if (!needle) return false;
  return ` ${haystack} `.includes(` ${needle} `);
}

/** Bebidas de base (nome canônico) às quais um ingrediente pertence. */
export function findSpiritsInIngredient(ingredient: string): string[] {
  const normalized = normalizeWord(ingredient);
  if (!normalized) return [];

  return BASE_MASTER.SPIRITS.filter((spirit) =>
    spirit.aliases.some((alias) => containsWholeWords(normalized, normalizeWord(alias)))
  ).map((spirit) => spirit.name);
}

/**
 * Todos os pares `ingrediente → bebida de base` encontrados no produto.
 * Ex: ["Rum Branco", ...] ⇒ [{ spirit: 'Rum', ingredient: 'Rum Branco' }]
 */
export function findBaseSpiritMatches(
  ingredients: readonly string[]
): Array<{ spirit: string; ingredient: string }> {
  const matches: Array<{ spirit: string; ingredient: string }> = [];

  for (const ingredient of ingredients) {
    const spirits = findSpiritsInIngredient(ingredient);
    // Um mesmo ingrediente aponta para a primeira base reconhecida.
    if (spirits.length > 0) {
      matches.push({ spirit: spirits[0], ingredient });
    }
  }

  return matches;
}

/**
 * Resolve a bebida de base de um produto do catálogo.
 *
 * Precedência:
 * 1. campo opcional explícito `baseSpirit` (JSON: `bebida_base`) — autoritativo;
 * 2. ingredientes reais do produto casados com o vocabulário controlado.
 *
 * Retorna `null` quando não há informação suficiente — nesse caso o drink
 * NUNCA entra na rodada (jamais inferimos pelo nome do drink).
 */
export function resolveBaseSpirit(product: Product): BaseSpiritResolution | null {
  const explicit = product.baseSpirit?.trim();
  if (explicit) {
    return { spirit: explicit, source: 'explicito', ambiguous: false };
  }

  const matches = findBaseSpiritMatches(product.ingredients ?? []);
  if (matches.length === 0) return null;

  const distinctSpirits = Array.from(new Set(matches.map((match) => match.spirit)));

  return {
    spirit: matches[0].spirit,
    source: 'ingredientes',
    matchedIngredient: matches[0].ingredient,
    ambiguous: distinctSpirits.length > 1,
  };
}

/** Drink elegível: nome válido + bebida de base resolvida e não ambígua. */
export function isBaseMasterEligibleProduct(product: Product): boolean {
  if (!product.name || product.name.trim().length === 0) return false;

  const resolution = resolveBaseSpirit(product);
  return Boolean(resolution) && !resolution!.ambiguous;
}

/** Converte um produto do catálogo no modelo do jogo (ou `null` se inelegível). */
export function adaptProductToBaseMasterDrink(product: Product): BaseMasterDrink | null {
  const resolution = resolveBaseSpirit(product);
  if (!resolution || resolution.ambiguous) return null;

  return {
    id: product.id,
    name: product.name,
    image: product.image,
    categoryId: product.categoryId,
    ingredients: product.ingredients ?? [],
    baseSpirit: resolution.spirit,
    spiritSource: resolution.source,
    metodo: product.metodo?.trim() || undefined,
    copo: product.copo?.trim() || undefined,
    garnish: product.garnish?.trim() || undefined,
  };
}

/**
 * Drinks jogáveis do catálogo — usa a MESMA categoria de bebidas dos outros
 * jogos de drink (`DRINK_CATEGORY_ID`) e a mesma função pura de filtro.
 */
export function filterBaseMasterDrinks(
  products: readonly Product[],
  categoryId: string = DRINK_CATEGORY_ID
): BaseMasterDrink[] {
  return filterProductsByCategory([...products], categoryId)
    .map(adaptProductToBaseMasterDrink)
    .filter((drink): drink is BaseMasterDrink => Boolean(drink));
}

/** Valores distintos de um atributo entre os drinks (ordem alfabética pt-BR). */
export function listAvailableAttributeValues(
  drinks: readonly BaseMasterDrink[],
  attributeId: BaseMasterAttributeId
): string[] {
  const values = new Set<string>();

  for (const drink of drinks) {
    const value = getAttributeValue(drink, attributeId);
    if (value) values.add(value);
  }

  return Array.from(values).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/** Bebidas de base distintas disponíveis na rodada, em ordem alfabética. */
export function listAvailableSpirits(drinks: readonly BaseMasterDrink[]): string[] {
  return listAvailableAttributeValues(drinks, 'bebida-base');
}

/**
 * Peso de prioridade de um drink (repetição espaçada):
 * - nunca praticado → peso máximo (entra na frente);
 * - praticado → sobe com a taxa de erro e cai conforme os acertos acumulam.
 * Os parâmetros vivem em `GAME_CONFIG.BASE_MASTER.SPACED_REPETITION`.
 */
export function getDrinkWeight(
  drinkId: string,
  progress: BaseMasterProgressMap = {}
): number {
  const tuned = BASE_MASTER.SPACED_REPETITION;
  const entry = progress[drinkId];
  if (!entry) return tuned.NEVER_SEEN_WEIGHT;

  const attempts = entry.correct + entry.wrong;
  const errorRate = attempts > 0 ? entry.wrong / attempts : 0;
  const masteryDiscount = Math.min(1, entry.correct * tuned.MASTERY_STEP);

  return Math.max(tuned.MIN_WEIGHT, 1 + errorRate * tuned.ERROR_RATE_WEIGHT - masteryDiscount);
}

/**
 * Ordem de uma rodada: amostragem ponderada sem reposição
 * (Efraimidis–Spirakis), sem repetir drinks e priorizando o que precisa de
 * reforço — na primeira rodada (sem histórico) equivale a um sorteio uniforme.
 */
export function orderDrinksForRound(
  drinks: readonly BaseMasterDrink[],
  progress: BaseMasterProgressMap = {},
  count: number | 'todas' = 'todas'
): BaseMasterDrink[] {
  const keyed = drinks.map((drink) => ({
    drink,
    key: Math.pow(Math.random(), 1 / getDrinkWeight(drink.id, progress)),
  }));

  keyed.sort((a, b) => b.key - a.key);
  const ordered = keyed.map((item) => item.drink);

  if (count === 'todas') return ordered;
  return ordered.slice(0, Math.max(0, Math.min(count, ordered.length)));
}

/** Sequência do modo Aprender: todos os drinks, priorizando os não revisados. */
export function buildLearningSequence(
  drinks: readonly BaseMasterDrink[],
  progress: BaseMasterProgressMap = {}
): BaseMasterDrink[] {
  return orderDrinksForRound(drinks, progress, 'todas');
}

/** Compara valores de atributo ignorando caixa/acentos. */
export function isSameValue(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return normalizeWord(a) === normalizeWord(b);
}

/**
 * Monta as alternativas de uma pergunta:
 * 1 valor correto + valores REAIS do catálogo para o mesmo atributo.
 * Se o catálogo tiver poucos valores distintos, usa apenas os existentes —
 * nunca cria uma opção fictícia para preencher a lista.
 */
export function buildBaseMasterOptions(
  value: string,
  availableValues: readonly string[],
  optionCount: number = BASE_MASTER.OPTION_COUNT.medio
): string[] {
  const distractors = availableValues.filter((option) => !isSameValue(option, value));
  const totalDistractors = Math.max(0, Math.min(optionCount - 1, distractors.length));
  const chosen = shuffleArray(distractors).slice(0, totalDistractors);

  return shuffleArray([value, ...chosen]);
}

export interface BuildBaseMasterQuestionsOptions {
  count: number | 'todas';
  /** Total de alternativas por pergunta (padrão: dificuldade média). */
  optionCount?: number;
  /** Histórico de aprendizado usado para priorizar drinks. */
  progress?: BaseMasterProgressMap;
  /** Restringe aos atributos informados (ex: revisão de erros). */
  attributes?: BaseMasterAttributeId[];
}

/** Monta uma pergunta de um atributo específico de um drink. */
export function buildBaseMasterQuestion(
  drink: BaseMasterDrink,
  attributeId: BaseMasterAttributeId,
  availableValues: readonly string[],
  optionCount: number = BASE_MASTER.OPTION_COUNT.medio,
  suffix: string | number = 0
): BaseMasterQuestion {
  const attribute = getAttributeInfo(attributeId);
  const value = getAttributeValue(drink, attributeId) ?? '';

  return {
    id: `base-master_${drink.id}_${attributeId}_${suffix}`,
    attribute: attribute.id,
    attributeLabel: attribute.label,
    prompt: attribute.prompt,
    drinkId: drink.id,
    drinkName: drink.name,
    drinkImage: drink.image,
    correctValue: value,
    options: buildBaseMasterOptions(value, availableValues, optionCount),
  };
}

/**
 * Gera as perguntas do Treinar/Desafio a partir do catálogo.
 * Ordem aleatória ponderada, sem drinks repetidos, e — quando o catálogo já
 * declara outros atributos (método/copo/guarnição) — uma pergunta por atributo
 * disponível, embaralhadas entre si.
 */
export function buildBaseMasterQuestions(
  drinks: readonly BaseMasterDrink[],
  options: BuildBaseMasterQuestionsOptions
): BaseMasterQuestion[] {
  const optionCount = options.optionCount ?? BASE_MASTER.OPTION_COUNT.medio;
  const selectedDrinks = orderDrinksForRound(
    drinks,
    options.progress ?? {},
    options.count
  );

  const questions: BaseMasterQuestion[] = [];

  for (const drink of selectedDrinks) {
    const attributeIds = getAvailableAttributes(drink)
      .map((attribute) => attribute.id)
      .filter(
        (attributeId) => !options.attributes || options.attributes.includes(attributeId)
      );

    for (const attributeId of shuffleArray(attributeIds)) {
      questions.push(
        buildBaseMasterQuestion(
          drink,
          attributeId,
          listAvailableAttributeValues(drinks, attributeId),
          optionCount,
          questions.length
        )
      );
    }
  }

  if (typeof options.count !== 'number') return questions;
  return questions.slice(0, Math.max(0, options.count));
}

/**
 * Revisão dirigida: uma pergunta para cada erro da rodada anterior
 * (botão "Revisar meus erros" na tela final).
 */
export function buildMistakesReviewQuestions(
  drinks: readonly BaseMasterDrink[],
  answers: readonly BaseMasterAnswerRecord[],
  optionCount: number = BASE_MASTER.OPTION_COUNT.medio
): BaseMasterQuestion[] {
  const visited = new Set<string>();
  const questions: BaseMasterQuestion[] = [];

  for (const answer of answers) {
    if (answer.isCorrect) continue;

    const key = `${answer.drinkId}::${answer.attribute}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const drink = drinks.find((item) => item.id === answer.drinkId);
    if (!drink || !getAttributeValue(drink, answer.attribute)) continue;

    questions.push(
      buildBaseMasterQuestion(
        drink,
        answer.attribute,
        listAvailableAttributeValues(drinks, answer.attribute),
        optionCount,
        questions.length
      )
    );
  }

  return shuffleArray(questions);
}

/** Acerto: o valor escolhido é o valor do atributo (comparação normalizada). */
export function isBaseMasterAnswerCorrect(
  question: BaseMasterQuestion,
  selectedValue: string | null
): boolean {
  return isSameValue(question.correctValue, selectedValue);
}

/** Estado visual de uma alternativa, antes e depois da revelação. */
export function describeBaseMasterOptionState(
  option: string,
  question: BaseMasterQuestion,
  selectedValue: string | null,
  isRevealed: boolean
): BaseMasterOptionState {
  const isCorrectOption = isSameValue(option, question.correctValue);
  const isSelectedOption = isSameValue(option, selectedValue);

  if (!isRevealed) {
    return isSelectedOption ? 'selected' : 'idle';
  }
  if (isCorrectOption) return 'correct';
  if (isSelectedOption) return 'incorrect';
  return 'muted';
}

/** Rótulos de feedback usados pela UI (evita strings espalhadas no JSX). */
export function describeBaseMasterAnswer(
  question: BaseMasterQuestion,
  selectedValue: string | null,
  timedOut: boolean
): { isCorrect: boolean; title: string; message: string } {
  const isCorrect = !timedOut && isBaseMasterAnswerCorrect(question, selectedValue);
  const message = `${question.attributeLabel} de ${question.drinkName}: ${question.correctValue}.`;

  if (isCorrect) {
    return { isCorrect: true, title: 'Correto!', message };
  }

  return {
    isCorrect: false,
    title: timedOut ? 'Tempo esgotado' : 'Incorreto',
    message,
  };
}
