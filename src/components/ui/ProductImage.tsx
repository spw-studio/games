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
        className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 text-gold-200 border border-gold-500/20 shadow-inner ${className}`}
        aria-label={`Ilustração para ${alt}`}
      >
        {/* Padrão de fundo sutil gastronômico */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C89D5C_1px,transparent_1px)] [background-size:12px_12px]" />
        
        <div className="relative z-10 flex flex-col items-center p-3 text-center">
          <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-400/30 flex items-center justify-center mb-2 shadow-sm">
            {isBebida ? (
              <Wine className="w-6 h-6 text-gold-300" />
            ) : (
              <Utensils className="w-6 h-6 text-gold-300" />
            )}
          </div>
          <span className="text-xs font-medium text-cream-100 line-clamp-2 max-w-[140px] leading-tight">
            {alt}
          </span>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-gold-400 font-serif tracking-widest uppercase">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Exclusivo</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-cream-200 ${className}`}>
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
