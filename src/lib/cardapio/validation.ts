import { CardapioRaw, CatalogValidationResult } from '@/types/cardapio';

export function validateCatalogData(data?: CardapioRaw): CatalogValidationResult {
  const source = data ?? { cardapio: { categorias: [], itens: [] } };
  const categorias = source.cardapio?.categorias ?? [];
  const itens = source.cardapio?.itens ?? [];

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

export function getCatalogSummary(data?: CardapioRaw) {
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
