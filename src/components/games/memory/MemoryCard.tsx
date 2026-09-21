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
      className="group relative h-48 sm:h-56 md:h-64 w-full cursor-pointer select-none [perspective:1000px]"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isFlipped ? -1 : 0}
      role="button"
      aria-label={ariaLabel}
      aria-pressed={isFlipped}
      aria-disabled={disabled || card.isMatched}
    >
      <div
        className={`relative h-full w-full rounded-2xl shadow-md transition-transform duration-300 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : 'group-hover:-translate-y-1'
          } ${card.isMatched ? 'ring-2 ring-emerald-500 shadow-emerald-500/20 shadow-lg' : ''}`}
      >
        {/* =========================================================
            FACE FRONTAL (CARTA OCULTA)
            Mostra o padrão nobre da marca em #44100D com ouro
        ========================================================= */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-brand-700 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 p-4 text-center text-white shadow-inner [backface-visibility:hidden]">
          {/* Padrão geométrico requintado */}
          <div className="absolute inset-2 rounded-xl border border-gold-500/25 opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(#C89D5C_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-white/5 border border-gold-400/40 shadow-inner group-hover:scale-110 transition-transform">
              <ChefHat className="h-6 w-6 sm:h-7 sm:w-7 text-gold-300" />
            </div>
            <span className="mt-2.5 font-serif text-xs sm:text-sm font-semibold tracking-widest text-gold-200 uppercase">
              GASTRONOMIA
            </span>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-cream-200/60 uppercase tracking-widest">
              <Sparkles className="w-2.5 h-2.5 text-gold-400" />
              <span>Toque para virar</span>
            </div>
          </div>
        </div>

        {/* =========================================================
            FACE TRASEIRA (CARTA REVELADA)
            [transform:rotateY(180deg)]
        ========================================================= */}
        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-gold-400/30 bg-white shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {/* Badge de Match quando o par já foi encontrado */}
          {card.isMatched && (
            <div className="absolute top-2 right-2 z-20 flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md animate-in fade-in zoom-in-75">
              <CheckCircle2 className="w-3 h-3" />
              <span>PAR ENCONTRADO</span>
            </div>
          )}

          {card.type === 'image' ? (
            /* CARTA TIPO A: IMAGEM DO PRODUTO */
            <div className="relative flex h-full w-full flex-col justify-between bg-cream-50">
              <div className="relative h-32 sm:h-40 md:h-44 w-full">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  category={product.categoryId}
                  className="h-full w-full"
                />
              </div>
              <div className="flex flex-1 flex-col justify-center px-3 py-2 text-center bg-white border-t border-cream-200">
                <span className="font-serif text-xs sm:text-sm font-bold text-brand-900 line-clamp-2 leading-tight">
                  {product.name}
                </span>
                <span className="mt-0.5 text-[10px] uppercase tracking-wider text-gold-600 font-semibold">
                  Categoria: {product.categoryId}
                </span>
              </div>
            </div>
          ) : (
            /* CARTA TIPO B: DESCRIÇÃO DO PRODUTO */
            <div className="flex h-full w-full flex-col justify-between bg-cream-50/60 p-3 sm:p-4 text-left border-t-4 border-brand-800">
              <div className="flex items-center justify-between gap-1 border-b border-cream-200 pb-1.5">
                <div className="flex items-center gap-1.5 text-brand-800">
                  <FileText className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand-900">
                    {product.name}
                  </span>
                </div>

              </div>

              {/* Descrição textual do prato */}
              <div className="my-auto overflow-y-auto pr-1 py-1 space-y-1">
                {categoryName && (
                  <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[9px] font-semibold text-brand-800 border border-brand-200 shrink-0">
                    {categoryName}
                  </span>
                )}
                <p className="text-[11px] sm:text-xs text-gray-700 leading-relaxed font-normal">

                  {product.description}
                </p>
                {(product.accompaniments ?? []).length > 0 && (
                  <div className="pt-0.5">
                    <span className="text-[10px] font-semibold text-brand-900">Acomp: </span>
                    <span className="text-[10px] text-gray-600 italic">
                      {(product.accompaniments ?? []).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-cream-200 pt-1.5 text-[10px] text-gray-500">
                <span className="italic text-gold-700 font-medium">Associe à foto correspondente</span>
                {product.preco && (
                  <span className="font-semibold text-brand-900">
                    R$ {product.preco.toFixed(2)}
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
