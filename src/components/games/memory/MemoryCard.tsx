'use client';

import { MemoryCard as IMemoryCard } from '@/types/game';
import { Product } from '@/types/cardapio';
import { ProductImage } from '@/components/ui/ProductImage';
import { ChefHat, CheckCircle2, FileText, Sparkles } from 'lucide-react';

interface MemoryCardProps {
  card: IMemoryCard;
  product: Product;
  categoryName?: string;
  onClick: (card: IMemoryCard) => void;
  disabled?: boolean;
}

export function MemoryCard({
  card,
  product,
  categoryName,
  onClick,
  disabled = false,
}: MemoryCardProps) {
  const isFlipped = card.isFlipped || card.isMatched;

  // Rótulos de acessibilidade solicitados no requisito 36
  let ariaLabel = 'Revelar carta oculta';
  if (isFlipped) {
    if (card.type === 'image') {
      ariaLabel = `Carta de imagem do ${product.name}`;
    } else {
      ariaLabel = `Carta de descrição do ${product.name}`;
    }
  }

  const handleClick = () => {
    if (disabled || isFlipped || card.isMatched) return;
    onClick(card);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className="group relative h-full w-full min-h-0 min-w-0 cursor-pointer select-none [perspective:1000px]"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isFlipped ? -1 : 0}
      role="button"
      aria-label={ariaLabel}
      aria-pressed={isFlipped}
      aria-disabled={disabled || card.isMatched}
    >
      <div
        className={`relative h-full w-full rounded-xl sm:rounded-2xl shadow-sm transition-transform duration-300 [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : 'hover:-translate-y-0.5 active:scale-98'
        } ${card.isMatched ? 'ring-2 ring-emerald-500 shadow-emerald-500/20 shadow-md' : ''}`}
      >
        {/* =========================================================
            FACE FRONTAL (CARTA OCULTA)
            Mostra o padrão da marca usando os tokens do tema
        ========================================================= */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border-2 border-primary/70 bg-primary p-1.5 sm:p-2 md:p-3 text-center text-primary-foreground shadow-inner [backface-visibility:hidden]">
          {/* Padrão geométrico requintado */}
          <div className="absolute inset-1 sm:inset-1.5 rounded-lg sm:rounded-xl border border-secondary/25 opacity-70 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(var(--theme-secondary)_1px,transparent_1px)] [background-size:12px_12px] sm:[background-size:16px_16px] opacity-15 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center min-h-0">
            <div className="flex h-7 w-7 sm:h-9 sm:w-9 md:h-11 md:w-11 items-center justify-center rounded-lg sm:rounded-xl bg-primary-foreground/5 border border-secondary/40 shadow-inner group-hover:scale-105 transition-transform shrink-0">
              <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-secondary" />
            </div>
            <span className="mt-1 sm:mt-1.5 font-serif text-[9px] sm:text-xs font-semibold tracking-widest text-secondary uppercase truncate max-w-full px-1">
              GASTRONOMIA
            </span>
            <div className="hidden sm:flex mt-0.5 items-center gap-1 text-[8px] sm:text-[9px] text-primary-foreground/60 uppercase tracking-widest">
              <Sparkles className="w-2.5 h-2.5 text-secondary" />
              <span>Toque para virar</span>
            </div>
          </div>
        </div>

        {/* =========================================================
            FACE TRASEIRA (CARTA REVELADA)
            [transform:rotateY(180deg)]
        ========================================================= */}
        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-secondary/30 bg-surface shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {/* Badge de Match quando o par já foi encontrado */}
          {card.isMatched && (
            <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 z-20 flex items-center gap-0.5 sm:gap-1 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold text-white shadow-md animate-in fade-in zoom-in-75">
              <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">PAR</span>
            </div>
          )}

          {card.type === 'image' ? (
            /* CARTA TIPO A: IMAGEM DO PRODUTO */
            <div className="relative flex h-full w-full min-h-0 flex-col bg-muted">
              <div className="relative min-h-0 flex-1 w-full overflow-hidden">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  category={product.categoryId}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex shrink-0 flex-col justify-center px-1.5 py-0.5 sm:py-1 text-center bg-surface border-t border-border">
                <span className="font-serif text-[9px] sm:text-xs font-bold text-primary truncate leading-tight block">
                  {product.name}
                </span>
                <span className="hidden sm:block text-[8px] sm:text-[9px] uppercase tracking-wider text-secondary font-semibold truncate">
                  {categoryName || product.categoryId}
                </span>
              </div>
            </div>
          ) : (
            /* CARTA TIPO B: DESCRIÇÃO DO PRODUTO */
            <div className="flex h-full w-full min-h-0 flex-col justify-between bg-muted/60 p-1.5 sm:p-2 md:p-2.5 text-left border-t-2 sm:border-t-4 border-primary">
              <div className="flex items-center justify-between gap-1 border-b border-border pb-1 shrink-0">
                <div className="flex items-center gap-1 min-w-0 text-primary">
                  <FileText className="w-3 h-3 text-secondary shrink-0" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary truncate">
                    {product.name}
                  </span>
                </div>
                {categoryName && (
                  <span className="hidden md:inline-block rounded bg-muted px-1 py-0.2 text-[8px] sm:text-[9px] font-semibold text-primary border border-border shrink-0 truncate max-w-[80px]">
                    {categoryName}
                  </span>
                )}
              </div>

              {/* Descrição textual do prato */}
              <div className="my-auto min-h-0 flex-1 overflow-y-auto pr-0.5 py-0.5 scrollbar-thin">
                <p className="text-[9px] sm:text-[11px] md:text-xs text-foreground leading-tight sm:leading-relaxed font-normal">
                  {product.description}
                </p>
                {(product.accompaniments ?? []).length > 0 && (
                  <div className="hidden sm:block pt-0.5 truncate">
                    <span className="text-[8px] sm:text-[9px] font-semibold text-primary">Acomp: </span>
                    <span className="text-[8px] sm:text-[9px] text-muted-foreground italic">
                      {(product.accompaniments ?? []).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-0.5 sm:pt-1 text-[8px] sm:text-[9px] text-muted-foreground shrink-0">
                <span className="italic text-secondary font-medium truncate pr-1">
                  Associe à foto
                </span>
                {product.price !== undefined && (
                  <span className="font-semibold text-primary shrink-0">
                    R$ {product.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
