'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Wine, Sparkles } from 'lucide-react';
import { Group } from '@/types/grouping';

interface DrinkCardProps {
  drink: Group;
}

export function DrinkCard({ drink }: DrinkCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-card bg-surface border border-border shadow-elevated transition-all duration-300">
      {/* Banner / Cabeçalho com paleta #44100D */}
      <div className="relative h-52 sm:h-64 w-full bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#C89D5C_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />

        {drink.image && !imageError ? (
          <div className="relative h-full w-full">
            <Image
              src={drink.image}
              alt={drink.name}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, 500px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
        ) : (
          /* Fallback visual gastronômico nobre quando não há imagem física */
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-overlay/10 border-2 border-gold-400/40 text-gold-300 shadow-2xl backdrop-blur-sm mb-3 animate-in zoom-in-90 duration-300">
              <Wine className="h-10 w-10" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-300/90">
              Coquetelaria Oficial
            </span>
          </div>
        )}

        {/* Badge da categoria */}
        <div className="absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-md px-3 py-1 text-xs font-semibold text-gold-300 border border-gold-400/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Receita Clássica</span>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-6 sm:p-8 space-y-3 bg-surface">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary">
            Monte este drink
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
            {drink.name}
          </h2>
        </div>

        {drink.description && (
          <p className="text-sm sm:text-base text-muted-foreground font-light leading-relaxed">
            {drink.description}
          </p>
        )}

        <div className="pt-2 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Ingredientes necessários:{' '}
            <strong className="text-foreground font-bold font-mono">
              {drink.members.length}
            </strong>
          </span>
          <span className="text-cream-400">•</span>
          <span className="text-subtle-foreground">Selecione todos para acertar</span>
        </div>
      </div>
    </div>
  );
}
