import { Product } from '@/types/cardapio';
import { Group, GroupMember } from '@/types/grouping';

/**
 * Operações PURAS sobre o catálogo — seguras para o cliente e para o servidor.
 *
 * Este é o único módulo de `lib/cardapio` que os componentes de UI podem
 * importar. Acesso ao JSON bruto (`adapter.ts`/`queries.ts`) é restrito à
 * camada server (serviço + Route Handlers), garantindo que o catálogo não
 * seja embutido no bundle do navegador.
 */

/** Id da categoria de bebidas alcoólicas no catálogo. */
export const DRINK_CATEGORY_ID = 'drinks';

/** Filtra produtos por categoria; 'todas'/vazio retorna a lista inteira. */
export function filterProductsByCategory(
  products: Product[],
  categoryId?: string
): Product[] {
  if (!categoryId || categoryId === 'todas') {
    return [...products];
  }
  return products.filter((product) => product.categoryId === categoryId);
}

/**
 * Filtra produtos elegíveis para o Jogo da Memória:
 * - ID válido e nome preenchido
 * - descrição não vazia (essencial para a carta B)
 */
export function filterMemoryEligibleProducts(
  products: Product[],
  categoryId?: string
): Product[] {
  return filterProductsByCategory(products, categoryId).filter((product) => {
    const hasDescription = Boolean(
      product.description && product.description.trim().length > 0
    );
    const hasName = Boolean(product.name && product.name.trim().length > 0);
    return hasDescription && hasName;
  });
}

/**
 * Converte um produto do catálogo no modelo genérico de Group.
 * Mapeia os ingredientes para membros do grupo (GroupMember).
 */
export function adaptProductToGroup(product: Product): Group {
  const rawIngredients = product.ingredients ?? [];

  const members: GroupMember[] = rawIngredients.map((ingName, idx) => ({
    id: `${product.id}_ing_${idx}`,
    name: ingName.trim(),
    isDistractor: false,
  }));

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    image: product.image,
    category: product.categoryId,
    members,
  };
}

/**
 * Retorna os grupos de drinks jogáveis do catálogo.
 * Um drink é elegível se possuir pelo menos 2 ingredientes cadastrados.
 * Mantém a regra histórica: produtos da categoria de drinks sempre são
 * incluídos, mesmo quando outra categoria é solicitada.
 */
export function buildDrinkGroups(
  products: Product[],
  categoryId?: string
): Group[] {
  const filtered = products.filter((item) => {
    const isCategoryMatch =
      !categoryId ||
      categoryId === 'todas' ||
      item.categoryId === categoryId ||
      item.categoryId === DRINK_CATEGORY_ID;
    const ingredients = item.ingredients ?? [];
    return isCategoryMatch && ingredients.length >= 2;
  });

  return filtered.map(adaptProductToGroup);
}

/**
 * Extrai todos os nomes únicos de ingredientes dos grupos informados.
 * Usado pelo motor para selecionar ingredientes distratores autênticos.
 */
export function getAllDistinctIngredients(groups: Group[]): string[] {
  const set = new Set<string>();

  for (const group of groups) {
    for (const member of group.members) {
      if (member.name && member.name.trim().length > 0) {
        set.add(member.name.trim());
      }
    }
  }

  return Array.from(set);
}

/**
 * Adaptador de pratos e acompanhamentos (extensão futura do motor):
 * permite usar a mesma estrutura para montar guarnições de pratos.
 */
export function buildDishAcompanhamentosGroups(products: Product[]): Group[] {
  return products
    .filter((item) => Array.isArray(item.accompaniments) && item.accompaniments.length >= 1)
    .map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      image: item.image,
      category: item.categoryId,
      members: (item.accompaniments ?? []).map((acomp, idx) => ({
        id: `${item.id}_acomp_${idx}`,
        name: acomp.trim(),
        isDistractor: false,
      })),
    }));
}
