'use client';

import { AlertTriangle, ChefHat, ListTree } from 'lucide-react';
import { Product } from '@/types/cardapio';
import { ProductImage } from '@/components/ui/ProductImage';
import { formatCurrency } from '@/lib/utils/currency';

interface ProductCardProps {
  product: Product;
  /** Nome legível da categoria (fallback: `categoryId`). */
  categoryName?: string;
}

/**
 * Cartão de produto da vitrine do cardápio.
 *
 * Apresenta imagem (com fallback elegante de `<ProductImage />`), categoria,
 * descrição, alérgenos (`dietaryTags`), ingredientes e preços — respeitando
 * tanto o preço único quanto a lista de variações/porções.
 */
export function ProductCard({ product, categoryName }: ProductCardProps) {
  const variations = product.variations ?? [];
  const dietaryTags = product.dietaryTags ?? [];
  const accompaniments = product.accompaniments ?? [];
  const ingredients = product.ingredients ?? [];
  const hasVariations = variations.length > 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card transition-all hover:border-primary/40 hover:shadow-elevated">
      {/* Imagem com selos de categoria e código */}
      <div className="relative h-44 w-full sm:h-52">
        <ProductImage
          src={product.image}
          alt={product.name}
          category={product.categoryId}
          className="h-full w-full"
        />

        <span className="absolute left-3 top-3 z-10 rounded-full border border-secondary/30 bg-primary/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary backdrop-blur-sm">
          {categoryName || product.categoryId}
        </span>

        {product.code && (
          <span className="absolute right-3 top-3 z-10 rounded-full border border-border bg-surface/90 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground backdrop-blur-sm">
            Cód. {product.code}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="font-serif text-base font-bold leading-tight text-foreground sm:text-lg">
          {product.name}
        </h3>

        {product.description && (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {product.description}
          </p>
        )}

        {/* Alérgenos e restrições alimentares */}
        {dietaryTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {dietaryTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-900"
              >
                <AlertTriangle className="h-3 w-3 text-amber-600" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Ingredientes (expansível para não poluir o cartão) */}
        {ingredients.length > 0 && (
          <details className="group/ingredients mt-3">
            <summary className="flex cursor-pointer items-center gap-1.5 text-[11px] font-semibold text-primary">
              <ListTree className="h-3.5 w-3.5 text-secondary" />
              <span>Ingredientes ({ingredients.length})</span>
            </summary>
            <ul className="mt-2 flex flex-wrap gap-1">
              {ingredients.map((ingredient) => (
                <li
                  key={ingredient}
                  className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  {ingredient}
                </li>
              ))}
            </ul>
          </details>
        )}

        {accompaniments.length > 0 && (
          <p className="mt-2 text-[11px] leading-relaxed text-secondary">
            <span className="font-semibold">Acompanhamentos: </span>
            <span className="italic">{accompaniments.join(' · ')}</span>
          </p>
        )}

        {/* Preços: variações/porções ou preço único */}
        <div className="mt-auto border-t border-border pt-3">
          {hasVariations ? (
            <ul className="space-y-1.5">
              {variations.map((variation) => (
                <li
                  key={variation.code}
                  className="flex items-baseline justify-between gap-3 text-xs"
                >
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {variation.portion}
                    </span>
                    {variation.weightDetail ? ` · ${variation.weightDetail}` : ''}
                  </span>
                  <span className="whitespace-nowrap font-serif font-bold text-primary">
                    {formatCurrency(variation.price)}
                  </span>
                </li>
              ))}
            </ul>
          ) : product.price !== undefined ? (
            <div className="flex items-baseline justify-between">
              <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                <ChefHat className="h-3.5 w-3.5 text-secondary" />
                Preço
              </span>
              <span className="font-serif text-lg font-bold text-primary">
                {formatCurrency(product.price)}
              </span>
            </div>
          ) : (
            <span className="text-[11px] italic text-subtle-foreground">
              Preço sob consulta
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
