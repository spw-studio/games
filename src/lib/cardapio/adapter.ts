import rawCardapio from '@/data/cardapio.json';
import { CardapioRaw, Category, NormalizedCardapio, Product, RawProduct, RawCategory, ProductVariation } from '@/types/cardapio';
import { validateMenuCatalog } from './schema';

function normalizeCategory(category?: RawCategory): Category | null {
  if (!category || !category.id) {
    return null;
  }

  return {
    id: category.id,
    name: category.nome || category.id,
    description: category.descricao,
    icon: category.icone,
  };
}

function normalizeProduct(item?: RawProduct): Product | null {
  if (!item || !item.id) {
    return null;
  }

  const productVariations: ProductVariation[] = (item.variacoes ?? []).map((variation) => ({
    code: variation.codigo,
    portion: variation.porcao,
    weightDetail: variation.detalhe_peso,
    price: variation.preco,
  }));

  return {
    id: item.id,
    name: item.nome || 'Produto sem nome',
    categoryId: item.categoria || 'outros',
    description: item.descricao || '',
    image: item.imagem || '',
    dietaryTags: item.tags_alimentares ?? [],
    hasVariations: Boolean(item.possui_variacoes),
    code: item.codigo,
    price: item.preco,
    variations: productVariations,
    accompaniments: item.acompanhamentos ?? [],
    ingredients: item.ingredientes ?? [],
  };
}

/**
 * Normaliza os dados do cardápio bruto, indexando por mapas para buscas O(1)
 * e garantindo a consistência das categorias e itens.
 */
export function normalizeCardapio(data?: CardapioRaw): NormalizedCardapio {
  const source = data || (rawCardapio as unknown as CardapioRaw);
  const validation = validateMenuCatalog(source);

  if (!validation.valid) {
    console.warn('Catalog validation failed:', validation.errors);
  }

  const categorias = (source?.cardapio?.categorias || [])
    .map(normalizeCategory)
    .filter((category): category is Category => Boolean(category));

  const itens = (source?.cardapio?.itens || [])
    .map(normalizeProduct)
    .filter((item): item is Product => Boolean(item));

  const categoryMap: Record<string, Category> = {};
  for (const cat of categorias) {
    categoryMap[cat.id] = cat;
  }

  const productMap: Record<string, Product> = {};
  for (const item of itens) {
    productMap[item.id] = item;
  }

  return {
    categorias,
    itens,
    categoryMap,
    productMap,
  };
}

// Singleton de cardápio normalizado em memória
let cachedNormalizedCardapio: NormalizedCardapio | null = null;

export function getNormalizedCardapio(): NormalizedCardapio {
  if (!cachedNormalizedCardapio) {
    cachedNormalizedCardapio = normalizeCardapio();
  }
  return cachedNormalizedCardapio;
}
