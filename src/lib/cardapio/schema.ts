import { z } from 'zod';
import { Category, Product, ProductVariation } from '@/types/cardapio';

const rawCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  nome: z.string().min(1).optional(),
  descricao: z.string().optional(),
  icone: z.string().optional(),
});

const rawVariationSchema = z.object({
  code: z.string().min(1).optional(),
  portion: z.string().min(1).optional(),
  weightDetail: z.string().optional(),
  price: z.number().optional(),
  codigo: z.string().min(1).optional(),
  porcao: z.string().min(1).optional(),
  detalhe_peso: z.string().optional(),
  preco: z.number().optional(),
});

const rawProductSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  dietaryTags: z.array(z.string()).optional(),
  hasVariations: z.boolean().optional(),
  code: z.string().min(1).optional(),
  price: z.number().optional(),
  variations: z.array(rawVariationSchema).optional(),
  accompaniments: z.array(z.string()).optional(),
  ingredients: z.array(z.string()).optional(),

  id_prato: z.string().min(1).optional(),
  nome: z.string().min(1).optional(),
  categoria: z.string().min(1).optional(),
  descricao: z.string().optional(),
  imagem: z.string().optional(),
  tags_alimentares: z.array(z.string()).optional(),
  possui_variacoes: z.boolean().optional(),
  codigo: z.string().min(1).optional(),
  preco: z.number().optional(),
  variacoes: z.array(rawVariationSchema).optional(),
  acompanhamentos: z.array(z.string()).optional(),
  ingredientes: z.array(z.string()).optional(),
});

export const menuCatalogSchema = z.object({
  cardapio: z.object({
    categorias: z.array(rawCategorySchema),
    itens: z.array(rawProductSchema),
  }),
});

export function validateMenuCatalog(data: unknown) {
  const result = menuCatalogSchema.safeParse(data);

  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  }

  const categories = result.data.cardapio.categorias;
  const items = result.data.cardapio.itens;
  const errors: { path: string; message: string }[] = [];
  const categoryIds = new Set(categories.map((category) => category.id));

  for (const item of items) {
    const itemId = item.id ?? item.id_prato ?? 'sem-id';
    const itemCategory = item.categoryId ?? item.categoria ?? '';
    const itemName = item.name ?? item.nome ?? 'Produto';

    if (!itemCategory || !categoryIds.has(itemCategory)) {
      errors.push({
        path: `${itemId}.categoryId`,
        message: `Produto "${itemName}" referencia categoria inexistente: "${itemCategory}".`,
      });
    }

    const description = item.description ?? item.descricao ?? '';
    if (!description.trim()) {
      errors.push({
        path: `${itemId}.description`,
        message: `Produto "${itemName}" deve possuir descrição válida.`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function normalizeLegacyCategory(category: Partial<Category>): Category {
  const id = category.id ?? category.nome ?? 'categoria-sem-id';
  const normalizedName = category.name ?? category.nome ?? id;

  return {
    id,
    name: normalizedName,
    description: category.description ?? category.descricao,
    icon: category.icon ?? category.icone,
    nome: normalizedName,
    descricao: category.description ?? category.descricao ?? '',
    icone: category.icon ?? category.icone,
  };
}

export function normalizeLegacyProduct(product: Partial<Product>): Product {
  const id = product.id ?? product.id_prato ?? 'produto-sem-id';
  const name = product.name ?? product.nome ?? 'Produto sem nome';
  const categoryId = product.categoryId ?? product.categoria ?? 'outros';
  const description = product.description ?? product.descricao ?? '';
  const ingredients = product.ingredients ?? product.ingredientes ?? [];
  const dietaryTags = product.dietaryTags ?? product.tags_alimentares ?? [];
  const variations = product.variations ?? product.variacoes ?? [];
  const accompaniments = product.accompaniments ?? product.acompanhamentos ?? [];

  return {
    id,
    name,
    categoryId,
    description,
    image: product.image ?? product.imagem,
    dietaryTags,
    hasVariations: Boolean(product.hasVariations ?? product.possui_variacoes),
    code: product.code ?? product.codigo,
    price: product.price ?? product.preco,
    variations: variations as ProductVariation[],
    accompaniments,
    ingredients,
    id_prato: id,
    nome: name,
    categoria: categoryId,
    descricao: description,
    imagem: product.image ?? product.imagem,
    tags_alimentares: dietaryTags,
    possui_variacoes: Boolean(product.hasVariations ?? product.possui_variacoes),
    codigo: product.code ?? product.codigo,
    preco: product.price ?? product.preco,
    variacoes: variations as ProductVariation[],
    acompanhamentos: accompaniments,
    ingredientes: ingredients,
  };
}
