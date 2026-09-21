export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;

  // Legacy compatibility
  nome: string;
  descricao?: string;
  icone?: string;
}

export interface ProductVariation {
  code: string;
  portion: string;
  weightDetail?: string;
  price: number;

  // Legacy compatibility
  codigo: string;
  porcao: string;
  detalhe_peso?: string;
  preco: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  image?: string;
  dietaryTags: string[];
  hasVariations: boolean;
  code?: string;
  price?: number;
  variations?: ProductVariation[];
  accompaniments?: string[];
  ingredients?: string[];

  // Legacy compatibility
  id_prato: string;
  nome: string;
  categoria: string;
  descricao: string;
  imagem?: string;
  tags_alimentares: string[];
  possui_variacoes: boolean;
  codigo?: string;
  preco?: number;
  variacoes?: ProductVariation[];
  acompanhamentos?: string[];
  ingredientes?: string[];
}

export interface CardapioRaw {
  cardapio: {
    categorias: Category[];
    itens: Product[];
  };
}

export interface NormalizedCardapio {
  categorias: Category[];
  itens: Product[];
  categoryMap: Record<string, Category>;
  productMap: Record<string, Product>;
}

export interface CatalogValidationResult {
  isValid: boolean;
  warnings: string[];
  missingCategoryItems: string[];
  missingDescriptionItems: string[];
}

export interface CatalogSummary {
  totalCategories: number;
  totalItems: number;
  validItems: number;
  invalidItems: number;
}

export type MenuCategory = Category;
export type MenuProduct = Product;
export type MenuVariation = ProductVariation;
export type MenuSource = CardapioRaw;
