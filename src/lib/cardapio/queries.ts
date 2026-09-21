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
 * Retorna os produtos pertencentes a uma categoria específica.
 * Se categoryId for 'todas' ou vazio, retorna todos os produtos.
 */
export function getProductsByCategory(categoryId?: string): Product[] {
  const all = getAllProducts();
  if (!categoryId || categoryId === 'todas') {
    return all;
  }

  return all.filter((product) => product.categoryId === categoryId);
}

/**
 * Retorna apenas produtos elegíveis para o Jogo da Memória:
 * - Deve ter ID válido
 * - Deve ter descrição não vazia (essencial para a Carta B)
 * - Filtra por categoria opcionalmente
 */
export function getMemoryEligibleProducts(categoryId?: string): Product[] {
  const products = getProductsByCategory(categoryId);
  return products.filter((product) => {
    const hasDescription = Boolean(product.description && product.description.trim().length > 0);
    const hasName = Boolean(product.name && product.name.trim().length > 0);
    return hasDescription && hasName;
  });
}

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
