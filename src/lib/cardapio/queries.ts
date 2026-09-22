import { Category, Product } from '@/types/cardapio';
import { getNormalizedCardapio } from './adapter';
import { validateCatalogData } from './validation';

/**
 * Retorna todos os produtos do cardápio normalizado.
 */
export function getAllProducts(): Product[] {
  const { itens } = getNormalizedCardapio();
  return [...itens];
}

/**
 * Busca um produto específico pelo ID do prato.
 */
export function getProductById(id: string): Product | undefined {
  const { productMap } = getNormalizedCardapio();
  return productMap[id] ?? Object.values(productMap).find((item) => item.id === id);
}

/**
 * Retorna todas as categorias disponíveis no cardápio.
 */
export function getCategories(): Category[] {
  const { categorias } = getNormalizedCardapio();
  return [...categorias];
}

/**
 * Busca uma categoria específica pelo ID da categoria.
 */
export function getCategoryById(id: string): Category | undefined {
  const { categoryMap } = getNormalizedCardapio();
  return categoryMap[id];
}

/**
 * RETIRADO desta camada: `getProductsByCategory` e
 * `getMemoryEligibleProducts` migraram para `pure.ts` (funções puras,
 * compartilhadas entre API e componentes). Esta camada é server-only.
 */

/**
 * Validação de catálogo: verifica itens com inconsistências
 * (ex: sem preço, sem imagem, categoria não cadastrada).
 */
export function validateCatalog(): {
  warnings: string[];
  missingCategoryItems: string[];
  missingDescriptionItems: string[];
} {
  const { itens, categorias } = getNormalizedCardapio();
  const { warnings, missingCategoryItems, missingDescriptionItems } = validateCatalogData({
    cardapio: { categorias, itens },
  });

  return { warnings, missingCategoryItems, missingDescriptionItems };
}
