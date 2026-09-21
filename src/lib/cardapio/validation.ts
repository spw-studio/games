import { CardapioRaw, CatalogValidationResult, Category, Product } from '@/types/cardapio';

type CatalogInput =
  | CardapioRaw
  | {
      cardapio: {
        categorias: Category[];
        itens: Product[];
      };
    };

function toLegacyCategory(category: Category) {
  return {
    id: category.id,
    nome: category.name,
    descricao: category.description ?? '',
    icone: category.icon,
  };
}

function toLegacyProduct(item: Product) {
  return {
    id_prato: item.id,
    nome: item.name,
    categoria: item.categoryId,
    descricao: item.description,
    imagem: item.image ?? '',
    tags_alimentares: item.dietaryTags ?? [],
    possui_variacoes: item.hasVariations,
    codigo: item.code,
    preco: item.price,
    variacoes: (item.variations ?? []).map((variation) => ({
      codigo: variation.code,
      porcao: variation.portion,
      detalhe_peso: variation.weightDetail,
      preco: variation.price,
    })),
    acompanhamentos: item.accompaniments ?? [],
    ingredientes: item.ingredients ?? [],
  };
}

export function validateCatalogData(data?: CatalogInput): CatalogValidationResult {
  const source = data ?? { cardapio: { categorias: [], itens: [] } };
  const categorias = (source.cardapio?.categorias ?? []).map((category) =>
    'name' in category ? toLegacyCategory(category) : category
  );
  const itens = (source.cardapio?.itens ?? []).map((item) =>
    'name' in item ? toLegacyProduct(item) : item
  );

  const warnings: string[] = [];
  const missingCategoryItems: string[] = [];
  const missingDescriptionItems: string[] = [];
  const categoryMap = new Map(
    categorias
      .filter((category) => Boolean(category?.id))
      .map((category) => [category.id, category])
  );

  for (const item of itens) {
    if (!item || !item.id_prato) {
      continue;
    }

    if (!categoryMap.has(item.categoria)) {
      missingCategoryItems.push(item.id_prato);
      warnings.push(
        `Produto "${item.nome || item.id_prato}" (${item.id_prato}) possui categoria inexistente: "${item.categoria || 'indefinida'}".`
      );
    }

    if (!item.descricao || item.descricao.trim() === '') {
      missingDescriptionItems.push(item.id_prato);
      warnings.push(`Produto "${item.nome || item.id_prato}" (${item.id_prato}) não possui descrição cadastrada.`);
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    missingCategoryItems,
    missingDescriptionItems,
  };
}

export function getCatalogSummary(data?: CatalogInput) {
  const source = data ?? { cardapio: { categorias: [], itens: [] } };
  const categorias = source.cardapio?.categorias ?? [];
  const itens = source.cardapio?.itens ?? [];

  const validation = validateCatalogData(source);

  return {
    totalCategories: categorias.length,
    totalItems: itens.length,
    validItems: Math.max(itens.length - validation.missingCategoryItems.length - validation.missingDescriptionItems.length, 0),
    invalidItems: validation.missingCategoryItems.length + validation.missingDescriptionItems.length,
  };
}
