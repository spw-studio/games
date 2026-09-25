import type { ComponentType } from 'react';
import { BadgeDollarSign, Brain, HelpCircle, Martini, Search, Utensils, Wine } from 'lucide-react';

type IconType = ComponentType<{ className?: string }>;

/**
 * Mapa único `GameDefinition.icone` → ícone Lucide.
 * Substitui o `renderGameIcon` (switch) que estava duplicado na Home e na
 * página de jogos — com divergência de casos entre eles (a Home não tinha
 * o ícone do Caça-Palavras).
 */
const GAME_ICONS: Record<string, IconType> = {
  Brain,
  HelpCircle,
  BadgeDollarSign,
  Wine,
  Search,
  Utensils,
  Martini,
};

interface GameIconProps {
  /** Nome do ícone declarado em `GameDefinition.icone`. */
  name: string;
  className?: string;
}

export function GameIcon({ name, className }: GameIconProps) {
  const Icon = GAME_ICONS[name] ?? Utensils;
  return <Icon className={className} />;
}
