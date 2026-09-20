import { Product } from '@/types/cardapio';
import { Group, GroupMember } from '@/types/grouping';
import { getNormalizedCardapio } from './adapter';

/**
 * Converte um produto do catálogo no modelo genérico de Group.
 * Mapeia os ingredientes para membros do grupo (GroupMember).
 */
export function adaptProductToGroup(product: Product): Group {
  const rawIngredients = Array.isArray(product.ingredientes) ? product.ingredientes : [];

  const members: GroupMember[] = rawIngredients.map((ingName, idx) => ({
    id: `${product.id_prato}_ing_${idx}`,
    name: ingName.trim(),
    isDistractor: false,
  }));

  return {
    id: product.id_prato,
    name: product.nome,
    description: product.descricao,
    image: product.imagem,
    category: product.categoria,
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
    const isCategoryMatch =
      !categoryId || categoryId === 'todas' || item.categoria === categoryId || item.categoria === 'drinks';
    const hasIngredients = Array.isArray(item.ingredientes) && item.ingredientes.length >= 2;
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
    .filter((item) => Array.isArray(item.acompanhamentos) && item.acompanhamentos.length >= 1)
    .map((item) => ({
      id: item.id_prato,
      name: item.nome,
      description: item.descricao,
      image: item.imagem,
      category: item.categoria,
      members: (item.acompanhamentos || []).map((acomp, idx) => ({
        id: `${item.id_prato}_acomp_${idx}`,
        name: acomp.trim(),
        isDistractor: false,
      })),
    }));
}
