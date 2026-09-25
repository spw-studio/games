'use client';

import { ReactNode } from 'react';
import { Wine } from 'lucide-react';
import { ProductImage } from '@/components/ui/ProductImage';

interface DrinkCardProps {
  /** Nome do drink vindo do catálogo (nunca reescrito). */
  name: string;
  image?: string;
  /** Categoria do produto — usada pelo `ProductImage` para escolher o ícone. */
  category?: string;
  /** Rótulo do atributo exibido (ex: "Bebida de base"). */
  label?: string;
  /** Valor do atributo (ex: "Rum"). */
  value?: string | null;
  /** Quando `true`, o valor fica oculto (Treinar/Desafio antes da resposta). */
  isBaseHidden?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

const IMAGE_HEIGHT: Record<NonNullable<DrinkCardProps['size']>, string> = {
  sm: 'h-28 sm:h-32',
  md: 'h-40 sm:h-48',
  lg: 'h-48 sm:h-56',
};

/**
 * Cartão do drink: imagem do catálogo (com fallback do `ProductImage` quando
 * não existe imagem) + nome + valor do atributo resolvido.
 */
export function DrinkCard({
  name,
  image,
  category,
  label = 'Bebida de base',
  value,
  isBaseHidden = false,
  size = 'md',
  children,
}: DrinkCardProps) {
  const hasValue = Boolean(value);

  return (
    <article className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
      <div className={`relative w-full ${IMAGE_HEIGHT[size]}`}>
        <ProductImage src={image} alt={name} category={category} className="h-full w-full" />
      </div>

      <div className="p-4 text-center sm:p-5">
        <h2 className="font-serif text-xl font-bold leading-tight text-foreground sm:text-2xl">
          {name}
        </h2>

        {hasValue && (
          <div className="mt-3 rounded-control border border-border bg-muted px-4 py-3">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <Wine className="h-3 w-3" aria-hidden="true" />
              {label}
            </div>

            <div
              className={`mt-1 font-serif text-2xl font-black tracking-wide sm:text-3xl ${
                isBaseHidden ? 'select-none text-foreground blur-[6px]' : 'text-secondary'
              }`}
              aria-hidden={isBaseHidden}
            >
              {isBaseHidden ? '•••••' : value}
            </div>

            {isBaseHidden && (
              <span className="sr-only">{label} oculta até a resposta</span>
            )}
          </div>
        )}

        {children}
      </div>
    </article>
  );
}
