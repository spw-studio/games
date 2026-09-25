export interface Category {
  id: string;
  /** Organização (tenant) dona da categoria. */
  organizationId: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface RawCategory {
  id: string;
  nome: string;
  descricao?: string;
  icone?: string;
}

export interface ProductVariation {
  code: string;
  portion: string;
  weightDetail?: string;
  price: number;
}

export interface RawProductVariation {
  codigo: string;
  porcao: string;
  detalhe_peso?: string;
  preco: number;
}

export interface Product {
  id: string;
  /** Organização (tenant) dona do produto — escopo de isolamento. */
  organizationId: string;
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
  ingredients: string[];
  /**
   * Bebida alcoólica de base do drink (JSON: `bebida_base`). Campo OPCIONAL e
   * autoritativo quando presente — os jogos que dependem da base (ex: Base
   * Master) usam este valor; na ausência dele a base é derivada dos
   * `ingredients` reais do catálogo.
   */
  baseSpirit?: string;
  /** Método de preparo (JSON: `metodo`) — opcional; alimenta perguntas do Base Master. */
  metodo?: string;
  /** Copo/taça de serviço (JSON: `copo`) — opcional. */
  copo?: string;
  /** Guarnição do drink (JSON: `garnish`) — opcional. */
  garnish?: string;
}

export interface RawProduct {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  imagem?: string;
  tags_alimentares: string[];
  possui_variacoes: boolean;
  codigo?: string;
  preco?: number;
  variacoes?: RawProductVariation[];
  acompanhamentos?: string[];
  ingredientes: string[];
  /** Bebida alcoólica de base (opcional) — ver `Product.baseSpirit`. */
  bebida_base?: string;
  baseSpirit?: string;
  /** Atributos opcionais do drink usados pelo Base Master. */
  metodo?: string;
  copo?: string;
  garnish?: string;
}

export interface CardapioRaw {
  cardapio: {
    categorias: RawCategory[];
    itens: RawProduct[];
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
