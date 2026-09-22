import { Product, Category } from '@/types/cardapio';

/**
 * Cliente HTTP do catálogo (client-only).
 *
 * Os componentes consomem o catálogo por estas funções — nunca importando
 * `cardapio.json` diretamente. O servidor aplica autenticação, papel e
 * isolamento de tenant antes de responder.
 */

interface CatalogResponse<T> {
  data: T;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Falha ao carregar catálogo (${response.status}).`);
  }

  const body = (await response.json()) as CatalogResponse<T>;
  return body.data;
}

/** Lista os produtos do catálogo da organização autenticada. */
export async function fetchCatalogProducts(categoryId?: string): Promise<Product[]> {
  const query = categoryId
    ? `?categoryId=${encodeURIComponent(categoryId)}`
    : '';
  return getJson<Product[]>(`/api/catalog/products${query}`);
}

/** Lista as categorias do catálogo da organização autenticada. */
export async function fetchCatalogCategories(): Promise<Category[]> {
  return getJson<Category[]>('/api/catalog/categories');
}
