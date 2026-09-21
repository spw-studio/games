'use client';

import { Check, Plus, X, AlertTriangle } from 'lucide-react';
import { IngredientState } from '@/types/grouping';

interface IngredientOptionProps {
  id: string;
  name: string;
  state: IngredientState;
  disabled?: boolean;
  onToggle: (id: string) => void;
}

export function IngredientOption({
  id,
  name,
  state,
  disabled = false,
  onToggle,
}: IngredientOptionProps) {
  const isSelected = state === 'selected';

  const handleClick = () => {
    if (!disabled) {
      onToggle(id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onToggle(id);
    }
  };

  // Configuração visual de acordo com o estado
  let buttonClasses =
    'relative flex items-center justify-between gap-3 px-4 py-3 rounded-control font-medium text-sm sm:text-base transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-secondary select-none shadow-card ';
  let icon = null;
  let labelPrefix = '';

  switch (state) {
    case 'correct':
      buttonClasses +=
        'bg-emerald-50 border-2 border-emerald-500 text-emerald-900 font-semibold shadow-emerald-100';
      icon = <Check className="h-5 w-5 text-emerald-600 stroke-[3]" aria-hidden="true" />;
      break;

    case 'incorrect':
      buttonClasses +=
        'bg-rose-50 border-2 border-rose-400 text-rose-900 line-through opacity-85 shadow-rose-100';
      icon = <X className="h-5 w-5 text-rose-600 stroke-[3]" aria-hidden="true" />;
      break;

    case 'missing':
      buttonClasses +=
        'bg-amber-50 border-2 border-dashed border-amber-500 text-amber-900 font-semibold animate-pulse';
      icon = (
        <AlertTriangle className="h-5 w-5 text-amber-600 stroke-[2.5]" aria-hidden="true" />
      );
      labelPrefix = 'Faltou: ';
      break;

    case 'selected':
      buttonClasses +=
        'bg-brand-900 border-2 border-brand-950 text-gold-300 font-semibold shadow-md transform -translate-y-0.5';
      icon = <Check className="h-5 w-5 text-gold-300 stroke-[3]" aria-hidden="true" />;
      break;

    case 'default':
    default:
      buttonClasses +=
        'bg-surface border-2 border-border hover:border-primary/60 hover:bg-surface-hover text-foreground active:scale-95';
      icon = <Plus className="h-5 w-5 text-gray-400 group-hover:text-brand-800" aria-hidden="true" />;
      break;
  }

  if (disabled && state !== 'missing' && state !== 'correct' && state !== 'incorrect') {
    buttonClasses += ' opacity-50 cursor-not-allowed';
  } else if (!disabled) {
    buttonClasses += ' cursor-pointer';
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isSelected}
      aria-label={`${labelPrefix}${name} - ${state}`}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={buttonClasses}
    >
      <span className="truncate text-left">
        {labelPrefix && (
          <span className="text-xs uppercase font-bold tracking-wider text-amber-700 block">
            {labelPrefix}
          </span>
        )}
        <span>{name}</span>
      </span>

      <span className="flex-shrink-0">{icon}</span>
    </button>
  );
}
