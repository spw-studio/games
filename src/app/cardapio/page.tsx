'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sparkles, UtensilsCrossed } from 'lucide-react';
import { Category, Product } from '@/types/cardapio';
import {
  fetchCatalogCategories,
  fetchCatalogProducts,
} from '@/lib/cardapio/client';
import {
  collectDietaryTags,
  excludeProductsByDietaryTag,
  filterProductsByCategory,
  filterProductsBySearch,
} from '@/lib/cardapio/pure';
import { CatalogFilters } from '@/components/cardapio/CatalogFilters';
import { ProductCard } from '@/components/cardapio/ProductCard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { NoticeModal } from '@/components/ui/NoticeModal';

/** Rota protegida: exige sessão (middleware + AppShell) e papel com leitura em CARDAPIO. */
export default function CardapioPage() {
  // Catálogo carregado via API (escopo de tenant e autorização no servidor)
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [catalogError, setCatalogError] = useState(false);

  // Filtros da vitrine
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchCatalogCategories(), fetchCatalogProducts()])
      .then(([fetchedCategories, fetchedProducts]) => {
        if (cancelled) return;
        setCategories(fetchedCategories);
        setProducts(fetchedProducts);
      })
      .catch(() => {
        if (cancelled) return;
        setCatalogError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const categoryNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    (categories ?? []).forEach((category) => {
      map[category.id] = category.name;
    });
    return map;
  }, [categories]);

  // Somente categorias com itens cadastrados viram chips (o JSON possui categorias reservadas)
  const availableCategories = useMemo(
    () =>
      (categories ?? []).filter((category) =>
        (products ?? []).some((product) => product.categoryId === category.id)
      ),
    [categories, products]
  );

  // Itens que passam por busca + restrição alimentar (base das contagens por categoria)
  const searchableProducts = useMemo(() => {
    const found = filterProductsBySearch(products ?? [], searchTerm);
    return excludeProductsByDietaryTag(found, selectedTag || undefined);
  }, [products, searchTerm, selectedTag]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      todas: searchableProducts.length,
    };
    availableCategories.forEach((category) => {
      counts[category.id] = searchableProducts.filter(
        (product) => product.categoryId === category.id
      ).length;
    });
    return counts;
  }, [availableCategories, searchableProducts]);

  const dietaryTags = useMemo(
    () => collectDietaryTags(products ?? []),
    [products]
  );

  const visibleProducts = useMemo(
    () => filterProductsByCategory(searchableProducts, selectedCategory),
    [searchableProducts, selectedCategory]
  );

  const clearFilters = () => {
    setSelectedCategory('todas');
    setSearchTerm('');
    setSelectedTag('');
  };

  const isCatalogLoading = !catalogError && (!categories || !products);
  const hasFilters =
    selectedCategory !== 'todas' || Boolean(searchTerm) || Boolean(selectedTag);

  return (
    <div className="space-y-6 py-2 animate-in fade-in duration-300">
      {isCatalogLoading && <LoadingScreen label="Carregando cardápio..." />}

      {!isCatalogLoading && catalogError && (
        <NoticeModal
          isOpen
          title="Não foi possível carregar o cardápio"
          message="Ocorreu um erro ao buscar categorias e produtos. Verifique sua conexão e tente novamente."
          variant="danger"
          onClose={() => window.location.reload()}
          primaryAction={{
            label: 'Tentar novamente',
            onClick: () => window.location.reload(),
          }}
        />
      )}

      {!isCatalogLoading && !catalogError && (
        <>
          {/* Banner de apresentação */}
          <div className="rounded-3xl bg-gradient-to-r from-brand-900 to-brand-950 p-6 text-white shadow-xl sm:p-8">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-500/20 px-3 py-1 text-xs font-semibold text-gold-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Catálogo Oficial de Produtos</span>
              </div>

              <h1 className="flex items-center gap-3 text-3xl font-serif font-bold tracking-tight sm:text-4xl">
                <UtensilsCrossed className="h-7 w-7 text-gold-300" />
                Cardápio
              </h1>

              <p className="mt-2 text-sm font-light leading-relaxed text-foreground/80">
                Consulte a ficha completa de cada item: foto, descrição gastronômica,
                alérgenos, ingredientes, acompanhamentos e preços por porção. É a mesma
                base de dados usada pelos jogos de treinamento.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wider">
                <span className="rounded-full border border-secondary/30 bg-overlay/10 px-3 py-1 text-secondary">
                  {availableCategories.length} categorias com itens
                </span>
                <span className="rounded-full border border-secondary/30 bg-overlay/10 px-3 py-1 text-secondary">
                  {(products ?? []).length} pratos e bebidas
                </span>
                {selectedTag && (
                  <span className="rounded-full border border-gold-400/40 bg-gold-500/20 px-3 py-1 text-gold-200">
                    Sem {selectedTag}
                  </span>
                )}
              </div>
            </div>
          </div>

          <CatalogFilters
            categories={availableCategories}
            categoryCounts={categoryCounts}
            selectedCategory={selectedCategory}
            onChangeCategory={setSelectedCategory}
            searchTerm={searchTerm}
            onChangeSearchTerm={setSearchTerm}
            dietaryTags={dietaryTags}
            selectedTag={selectedTag}
            onChangeTag={setSelectedTag}
            visibleCount={visibleProducts.length}
            totalCount={(products ?? []).length}
          />

          {visibleProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={categoryNameMap[product.categoryId]}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-card border border-dashed border-border-strong bg-muted/60 p-10 text-center">
              <UtensilsCrossed className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-serif text-lg font-bold text-foreground">
                Nenhum item encontrado
              </p>
              <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                Ajuste a busca, a categoria ou as restrições alimentares para ver outros
                itens do cardápio.
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-control bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-card transition-all hover:bg-primary/90 active:scale-95"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
