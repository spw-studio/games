'use client';

import { ListFilter, Search, ShieldAlert, X } from 'lucide-react';
import { Category } from '@/types/cardapio';

interface CatalogFiltersProps {
  categories: Category[];
  /** Quantidade de itens visíveis por categoria (chave `todas` = total). */
  categoryCounts: Record<string, number>;
  selectedCategory: string;
  onChangeCategory: (categoryId: string) => void;
  searchTerm: string;
  onChangeSearchTerm: (term: string) => void;
  /** Tags alimentares disponíveis no catálogo (alérgenos/restrições). */
  dietaryTags: string[];
  selectedTag: string;
  onChangeTag: (tag: string) => void;
  visibleCount: number;
  totalCount: number;
}

/**
 * Barra de filtros da vitrine do cardápio:
 * busca livre, filtro por categoria e restrições alimentares.
 */
export function CatalogFilters({
  categories,
  categoryCounts,
  selectedCategory,
  onChangeCategory,
  searchTerm,
  onChangeSearchTerm,
  dietaryTags,
  selectedTag,
  onChangeTag,
  visibleCount,
  totalCount,
}: CatalogFiltersProps) {
  return (
    <section
      className="space-y-4 rounded-card border border-border bg-surface p-4 shadow-card sm:p-5"
      aria-label="Filtros do cardápio"
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
        {/* Busca livre por nome, código, ingrediente ou descrição */}
        <div>
          <label
            htmlFor="catalog-search"
            className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground"
          >
            Buscar no cardápio
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="catalog-search"
              type="search"
              value={searchTerm}
              onChange={(event) => onChangeSearchTerm(event.target.value)}
              placeholder="Ex.: camarão, moqueca, código 1234..."
              className="w-full rounded-control border border-border bg-muted py-3 pl-10 pr-10 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onChangeSearchTerm('')}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Restrições alimentares (oculta pratos que contenham a tag) */}
        <div>
          <label
            htmlFor="catalog-restriction"
            className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-secondary" />
            Ocultar pratos com
          </label>
          <select
            id="catalog-restriction"
            value={selectedTag}
            onChange={(event) => onChangeTag(event.target.value)}
            className="w-full rounded-control border border-border bg-muted px-4 py-3 text-sm font-medium text-foreground focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 lg:w-56"
          >
            <option value="">Nenhuma restrição</option>
            {dietaryTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtro por categoria */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
            <ListFilter className="h-3.5 w-3.5 text-secondary" />
            Categoria
          </span>
          <span className="text-[11px] font-medium text-muted-foreground">
            Exibindo <strong className="text-foreground">{visibleCount}</strong> de{' '}
            {totalCount} itens
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChangeCategory('todas')}
            aria-pressed={selectedCategory === 'todas'}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedCategory === 'todas'
                ? 'border-primary bg-primary-soft text-foreground ring-1 ring-primary'
                : 'border-border bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground'
            }`}
          >
            Todas ({categoryCounts.todas ?? 0})
          </button>

          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onChangeCategory(category.id)}
                aria-pressed={isSelected}
                title={category.description}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'border-primary bg-primary-soft text-foreground ring-1 ring-primary'
                    : 'border-border bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                }`}
              >
                {category.name} ({categoryCounts[category.id] ?? 0})
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
