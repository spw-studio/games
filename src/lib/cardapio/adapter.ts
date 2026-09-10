import rawCardapio from '@/data/cardapio.json';
import { CardapioRaw, Category, NormalizedCardapio, Product } from '@/types/cardapio';

/**
 * Normaliza os dados do cardápio bruto, indexando por mapas para buscas O(1)
 * e garantindo a consistência das categorias e itens.
 */
export function normalizeCardapio(data?: CardapioRaw): NormalizedCardapio {
  const source = data || (rawCardapio as unknown as CardapioRaw);
  const categorias: Category[] = source?.cardapio?.categorias || [];
  const itens: Product[] = source?.cardapio?.itens || [];

  const categoryMap: Record<string, Category> = {};
  for (const cat of categorias) {
    if (cat && cat.id) {
      categoryMap[cat.id] = {
        ...cat,
        nome: cat.nome || cat.id,
      };
    }
  }

  const productMap: Record<string, Product> = {};
  const validProducts: Product[] = [];

  for (const item of itens) {
    if (item && item.id_prato) {
      // Normalização e garantia de integridade
      const normalizedItem: Product = {
        id_prato: item.id_prato,
        nome: item.nome || 'Produto sem nome',
        categoria: item.categoria || 'outros',
        descricao: item.descricao || '',
        imagem: item.imagem || '',
        tags_alimentares: Array.isArray(item.tags_alimentares) ? item.tags_alimentares : [],
        possui_variacoes: Boolean(item.possui_variacoes),
        codigo: item.codigo,
        preco: item.preco,
        variacoes: Array.isArray(item.variacoes) ? item.variacoes : [],
        acompanhamentos: Array.isArray(item.acompanhamentos) ? item.acompanhamentos : [],
      };

      productMap[item.id_prato] = normalizedItem;
      validProducts.push(normalizedItem);
    }
  }

  return {
    categorias,
    itens: validProducts,
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
