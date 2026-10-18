'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Utensils, Wine, Sparkles } from 'lucide-react';

interface ProductImageProps {
  src?: string;
  alt: string;
  category?: string;
  className?: string;
}

export function ProductImage({
  src,
  alt,
  category = '',
  className = '',
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  // Se não houver src ou se falhar ao carregar, exibe o placeholder elegante
  const isBebida = category.toLowerCase().includes('bebida');

  if (!src || hasError) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden bg-primary text-secondary border border-secondary/20 shadow-inner ${className}`}
        aria-label={`Ilustração para ${alt}`}
      >
        {/* Padrão de fundo sutil gastronômico */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(var(--theme-secondary)_1px,transparent_1px)] [background-size:12px_12px]" />
        
        <div className="relative z-10 flex flex-col items-center p-1 sm:p-2 text-center">
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center mb-0.5 sm:mb-1.5 shadow-card shrink-0">
            {isBebida ? (
              <Wine className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-secondary" />
            ) : (
              <Utensils className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-secondary" />
            )}
          </div>
          <span className="text-[9px] sm:text-xs font-medium text-primary-foreground line-clamp-1 max-w-[120px] leading-tight">
            {alt}
          </span>
          <div className="hidden sm:flex mt-0.5 items-center gap-1 text-[9px] text-secondary font-serif tracking-widest uppercase">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Exclusivo</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-muted ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
