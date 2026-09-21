import rawCardapio from '@/data/cardapio.json';
import { CardapioRaw, Category, NormalizedCardapio, Product } from '@/types/cardapio';
import { validateMenuCatalog } from './schema';

function normalizeCategory(category?: Partial<Category>): Category | null {
  if (!category || !category.id) {
    return null;
  }

  const name = category.name ?? category.nome ?? category.id;
  const description = category.description ?? category.descricao;
  const icon = category.icon ?? category.icone;

  return {
    id: category.id,
    name,
    description,
    icon,
    nome: name,
    descricao: description ?? '',
    icone: icon,
  };
}

function normalizeProduct(item?: Partial<Product>): Product | null {
  if (!item || (!item.id && !item.id_prato)) {
    return null;
  }

  const id = item.id ?? item.id_prato ?? '';
  const name = item.name ?? item.nome ?? 'Produto sem nome';
  const categoryId = item.categoryId ?? item.categoria ?? 'outros';
  const description = item.description ?? item.descricao ?? '';
  const image = item.image ?? item.imagem ?? '';
  const dietaryTags = Array.isArray(item.dietaryTags)
    ? item.dietaryTags
    : Array.isArray(item.tags_alimentares)
      ? item.tags_alimentares
      : [];
  const hasVariations = Boolean(item.hasVariations ?? item.possui_variacoes);
  const code = item.code ?? item.codigo;
  const price = item.price ?? item.preco;
  const variations = Array.isArray(item.variations)
    ? item.variations
    : Array.isArray(item.variacoes)
      ? item.variacoes
      : [];
  const accompaniments = Array.isArray(item.accompaniments)
    ? item.accompaniments
    : Array.isArray(item.acompanhamentos)
      ? item.acompanhamentos
      : [];
  const ingredients = Array.isArray(item.ingredients)
    ? item.ingredients
    : Array.isArray(item.ingredientes)
      ? item.ingredientes
      : [];

  return {
    id,
    name,
    categoryId,
    description,
    image,
    dietaryTags,
    hasVariations,
    code,
    price,
    variations,
    accompaniments,
    ingredients,
    id_prato: id,
    nome: name,
    categoria: categoryId,
    descricao: description,
    imagem: image,
    tags_alimentares: dietaryTags,
    possui_variacoes: hasVariations,
    codigo: code,
    preco: price,
    variacoes: variations,
    acompanhamentos: accompaniments,
    ingredientes: ingredients,
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
    categoryMap[cat.id] = {
      ...cat,
      name: cat.name || cat.nome || cat.id,
      nome: cat.nome || cat.name || cat.id,
    };
  }

  const productMap: Record<string, Product> = {};
  for (const item of itens) {
    productMap[item.id] = item;
    if (item.id_prato && item.id_prato !== item.id) {
      productMap[item.id_prato] = item;
    }
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
