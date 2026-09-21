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
  const id = category.id ?? 'categoria-sem-id';
  const normalizedName = category.name ?? id;

  return {
    id,
    name: normalizedName,
    description: category.description,
    icon: category.icon,
  };
}

export function normalizeLegacyProduct(product: Partial<Product>): Product {
  const id = product.id ?? 'produto-sem-id';
  const name = product.name ?? 'Produto sem nome';
  const categoryId = product.categoryId ?? 'outros';
  const description = product.description ?? '';
  const ingredients = product.ingredients ?? [];
  const dietaryTags = product.dietaryTags ?? [];
  const variations = product.variations ?? [];
  const accompaniments = product.accompaniments ?? [];

  return {
    id,
    name,
    categoryId,
    description,
    image: product.image,
    dietaryTags,
    hasVariations: Boolean(product.hasVariations),
    code: product.code,
    price: product.price,
    variations: variations as ProductVariation[],
    accompaniments,
    ingredients,
  };
}
