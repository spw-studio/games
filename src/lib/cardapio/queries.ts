import { Category, Product } from '@/types/cardapio';
import { getNormalizedCardapio } from './adapter';

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
  return productMap[id];
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
  return all.filter((product) => product.categoria === categoryId);
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
    const hasDescription = Boolean(product.descricao && product.descricao.trim().length > 0);
    const hasName = Boolean(product.nome && product.nome.trim().length > 0);
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
  const { itens, categoryMap } = getNormalizedCardapio();
  const warnings: string[] = [];
  const missingCategoryItems: string[] = [];
  const missingDescriptionItems: string[] = [];

  for (const item of itens) {
    if (!categoryMap[item.categoria]) {
      missingCategoryItems.push(item.id_prato);
      warnings.push(`Produto "${item.nome}" (${item.id_prato}) possui categoria inexistente: "${item.categoria}"`);
    }
    if (!item.descricao || item.descricao.trim() === '') {
      missingDescriptionItems.push(item.id_prato);
      warnings.push(`Produto "${item.nome}" (${item.id_prato}) não possui descrição cadastrada.`);
    }
  }

  return { warnings, missingCategoryItems, missingDescriptionItems };
}
