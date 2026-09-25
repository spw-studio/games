import { GAME_CONFIG } from '@/config/game-config';
import { filterProductsByCategory } from '@/lib/cardapio/pure';
import { normalizeWord } from '@/lib/text/normalize';
import { pickRandomItems, shuffleArray } from '@/lib/utils/shuffle';
import { Product } from '@/types/cardapio';
import { GameDifficulty } from '@/types/game';
import { QuizClue, QuizClueType, QuizConfigState, QuizOption, QuizQuestion } from '@/types/quiz';

/**
 * Motor de perguntas do "Conhecimento Rápido — Quiz de Produtos".
 *
 * Regras 100% puras e independentes da interface: recebem os produtos do
 * catálogo central (`Product`) e devolvem perguntas prontas. Nenhuma lista
 * própria de produtos é mantida aqui — a origem dos dados pode migrar de
 * JSON para API/PostgreSQL sem alterar este módulo.
 */

/** Máscara usada para ocultar o nome do produto nas pistas textuais. */
export const MASKED_NAME = '••••';

const CLUE_LABELS: Record<QuizClueType, string> = {
  descricao: 'Descrição do prato',
  ingredientes: 'Ingredientes da receita',
  codigo: 'Código no cardápio',
  acompanhamentos: 'Acompanhamentos',
  restricao: 'Restrições alimentares',
};

/** Palavras significativas (3+ letras) do nome do produto. */
function buildNameTokens(name: string): Set<string> {
  return new Set(
    name
      .split(/\s+/)
      .map((token) => normalizeWord(token))
      .filter((token) => token.length >= 3)
  );
}

/**
 * Oculta no texto qualquer palavra que pertença ao nome do produto.
 * A descrição do catálogo é usada como pista — nunca como resposta.
 */
export function maskProductName(text: string, productName: string): string {
  if (!text) return '';

  const tokens = buildNameTokens(productName);
  if (tokens.size === 0) return text;

  return text.replace(/\p{L}+/gu, (word) =>
    tokens.has(normalizeWord(word)) ? MASKED_NAME : word
  );
}

/** Pistas que o produto consegue sustentar com os dados existentes. */
export function getAvailableClueTypes(product: Product): QuizClueType[] {
  const types: QuizClueType[] = [];

  if (product.description && product.description.trim().length > 0) types.push('descricao');
  if ((product.ingredients ?? []).filter((item) => item.trim().length > 0).length >= 2) {
    types.push('ingredientes');
  }
  if (product.code && product.code.trim().length > 0) types.push('codigo');
  if ((product.accompaniments ?? []).filter((item) => item.trim().length > 0).length >= 1) {
    types.push('acompanhamentos');
  }
  if ((product.dietaryTags ?? []).filter((item) => item.trim().length > 0).length >= 1) {
    types.push('restricao');
  }

  return types;
}

/** Produto apto a virar pergunta (nome + pelo menos uma pista válida). */
export function isQuizEligibleProduct(product: Product): boolean {
  const hasName = Boolean(product.name && product.name.trim().length > 0);
  return hasName && getAvailableClueTypes(product).length > 0;
}

/** Produtos elegíveis, respeitando a categoria escolhida ('todas' ou vazio = tudo). */
export function filterQuizEligibleProducts(products: Product[], categoryId?: string): Product[] {
  return filterProductsByCategory(products, categoryId).filter(isQuizEligibleProduct);
}

/** Monta a pista da pergunta usando apenas dados reais do catálogo. */
export function buildClue(product: Product, clueType: QuizClueType): QuizClue | null {
  const maxItems = GAME_CONFIG.QUIZ.MAX_CLUE_ITEMS;

  switch (clueType) {
    case 'descricao':
      return {
        type: clueType,
        label: CLUE_LABELS.descricao,
        text: maskProductName(product.description, product.name),
        items: [],
      };

    case 'ingredientes': {
      const ingredients = (product.ingredients ?? [])
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      if (ingredients.length === 0) return null;

      const items = ingredients.slice(0, maxItems);
      return {
        type: clueType,
        label:
          items.length < ingredients.length
            ? `${CLUE_LABELS.ingredientes} (parcial)`
            : CLUE_LABELS.ingredientes,
        text: 'Qual produto do cardápio leva exatamente estes ingredientes no preparo?',
        items,
      };
    }

    case 'codigo': {
      const code = product.code?.trim();
      if (!code) return null;

      return {
        type: clueType,
        label: `${CLUE_LABELS.codigo} ${code}`,
        text: 'Qual produto do cardápio está cadastrado com este código no sistema?',
        items: [`Código ${code}`],
      };
    }

    case 'acompanhamentos': {
      const accompaniments = (product.accompaniments ?? [])
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      if (accompaniments.length === 0) return null;

      return {
        type: clueType,
        label: CLUE_LABELS.acompanhamentos,
        text: 'Este produto é servido acompanhado de:',
        items: accompaniments.slice(0, maxItems),
      };
    }

    case 'restricao': {
      const tags = (product.dietaryTags ?? [])
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      if (tags.length === 0) return null;

      return {
        type: clueType,
        label: CLUE_LABELS.restricao,
        text: 'Atenção às restrições: qual produto do cardápio apresenta estas marcações?',
        items: tags.slice(0, maxItems),
      };
    }

    default:
      return null;
  }
}

/** Remove produtos com nomes equivalentes (evita alternativas repetidas). */
export function dedupeProductsByName(products: Product[]): Product[] {
  const seen = new Set<string>();
  const unique: Product[] = [];

  for (const product of products) {
    const key = normalizeWord(product.name);
    if (key.length === 0 || seen.has(key)) continue;
    seen.add(key);
    unique.push(product);
  }

  return unique;
}

/**
 * Monta as alternativas da pergunta: a resposta correta + distratores reais do
 * catálogo. Em dificuldade difícil os distratores vêm da mesma categoria.
 */
export function buildQuizOptions(
  product: Product,
  catalog: Product[],
  difficulty: GameDifficulty
): QuizOption[] {
  const optionCount =
    GAME_CONFIG.QUIZ.OPTION_COUNT[difficulty] ?? GAME_CONFIG.QUIZ.OPTION_COUNT.medio;
  const correctKey = normalizeWord(product.name);

  const candidates = dedupeProductsByName(
    catalog.filter((item) => item.id !== product.id && normalizeWord(item.name) !== correctKey)
  );

  const sameCategory = candidates.filter((item) => item.categoryId === product.categoryId);
  const source =
    difficulty === 'dificil' && sameCategory.length >= optionCount - 1
      ? sameCategory
      : candidates;

  const distractors = pickRandomItems(source, optionCount - 1);

  return shuffleArray<QuizOption>([
    { productId: product.id, label: product.name },
    ...distractors.map((item) => ({ productId: item.id, label: item.name })),
  ]);
}

/** Escolhe uma pista válida evitando repetir a pista da pergunta anterior. */
function pickClueType(
  product: Product,
  previousClueType: QuizClueType | null
): QuizClueType | null {
  const available = getAvailableClueTypes(product);
  if (available.length === 0) return null;

  const alternatives = available.filter((type) => type !== previousClueType);
  const pool = alternatives.length > 0 ? alternatives : available;

  return shuffleArray(pool)[0] ?? null;
}

/**
 * Gera a sequência de perguntas da partida.
 * Cada pergunta recebe uma pista válida + alternativas reais do catálogo.
 */
export function buildQuizQuestions(products: Product[], config: QuizConfigState): QuizQuestion[] {
  const eligible = filterQuizEligibleProducts(products, config.category);
  if (eligible.length === 0) return [];

  const requested = config.questionCount === 'todas' ? eligible.length : config.questionCount;
  const total = Math.max(1, Math.min(requested, eligible.length));
  const selectedProducts = pickRandomItems(eligible, total);

  const questions: QuizQuestion[] = [];
  let previousClueType: QuizClueType | null = null;

  for (const [index, product] of selectedProducts.entries()) {
    const clueType = pickClueType(product, previousClueType);
    if (!clueType) continue;

    const clue = buildClue(product, clueType);
    if (!clue) continue;

    previousClueType = clueType;

    questions.push({
      id: `${product.id}-${clueType}-${index}`,
      clueType,
      clueLabel: clue.label,
      clueText: clue.text,
      clueItems: clue.items,
      correctProductId: product.id,
      correctProductName: product.name,
      correctProductDescription: product.description,
      correctProductImage: product.image,
      categoryId: product.categoryId,
      options: buildQuizOptions(product, products, config.difficulty),
    });
  }

  return questions;
}

/** Verifica se a alternativa escolhida é a resposta correta da pergunta. */
export function isAnswerCorrect(question: QuizQuestion, optionId: string | null): boolean {
  return optionId !== null && optionId === question.correctProductId;
}

/** Estado visual da alternativa antes/depois da resposta (feedback acessível). */
export function describeOptionState(
  optionId: string,
  question: QuizQuestion,
  selectedOptionId: string | null,
  isAnswered: boolean
): 'idle' | 'selected' | 'correct' | 'incorrect' | 'muted' {
  if (!isAnswered) {
    return selectedOptionId === optionId ? 'selected' : 'idle';
  }
  if (optionId === question.correctProductId) return 'correct';
  if (optionId === selectedOptionId) return 'incorrect';
  return 'muted';
}
