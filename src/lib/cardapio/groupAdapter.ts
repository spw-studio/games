import { Product } from '@/types/cardapio';
import { Group, GroupMember } from '@/types/grouping';
import { getNormalizedCardapio } from './adapter';

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
 * Retorna todos os grupos de drinks válidos e jogáveis do catálogo.
 * Um drink é elegível se possuir pelo menos 2 ingredientes cadastrados.
 */
export function getDrinkGroups(categoryId?: string): Group[] {
  const { itens } = getNormalizedCardapio();

  const filtered = itens.filter((item) => {
    const currentCategory = item.categoryId;
    const isCategoryMatch =
      !categoryId ||
      categoryId === 'todas' ||
      currentCategory === categoryId ||
      currentCategory === 'drinks';
    const ingredients = item.ingredients ?? [];
    const hasIngredients = ingredients.length >= 2;
    return isCategoryMatch && hasIngredients;
  });

  return filtered.map(adaptProductToGroup);
}

/**
 * Extrai todos os nomes únicos de ingredientes disponíveis no catálogo.
 * Usado pelo motor para selecionar ingredientes distratores autênticos.
 */
export function getAllDistinctIngredients(groups?: Group[]): string[] {
  const sourceGroups = groups && groups.length > 0 ? groups : getDrinkGroups();
  const set = new Set<string>();

  for (const g of sourceGroups) {
    for (const m of g.members) {
      if (m.name && m.name.trim().length > 0) {
        set.add(m.name.trim());
      }
    }
  }

  return Array.from(set);
}

/**
 * Adaptador futuro: Pratos e Acompanhamentos
 * Permite usar o mesmo motor para montar guarnições de pratos principais.
 */
export function getDishAcompanhamentosGroups(): Group[] {
  const { itens } = getNormalizedCardapio();

  return itens
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
