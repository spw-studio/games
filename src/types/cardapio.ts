export interface Category {
  id: string;
  nome: string;
  descricao?: string;
  icone?: string;
}

export interface ProductVariation {
  codigo: string;
  porcao: string;
  detalhe_peso?: string;
  preco: number;
}

export interface Product {
  id_prato: string;
  nome: string;
  categoria: string; // ID da categoria (ex: "camaroes")
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
