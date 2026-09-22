import { Category, Product } from '@/types/cardapio';
import { TenantContext } from '@/core/tenancy/types';
import { AuthorizationError, requirePermission } from '@/core/tenancy/permissions';
import { getAllProducts, getCategories } from './queries';
import { filterProductsByCategory } from './pure';

/**
 * Serviço do catálogo (server-only).
 *
 * Camada onde autorização (papel do usuário) e isolamento de tenant
 * (`organizationId`) são aplicados ANTES de qualquer dado chegar à API.
 *
 * Futura troca JSON → PostgreSQL = trocar a implementação de `queries.ts`.
 * Esta camada e os componentes permanecem inalterados.
 */

/**
 * Exige organização no contexto — guarda de isolamento de tenant.
 * SUPER_ADMIN sem membership também é bloqueado aqui (não há dados
 * de empresa a servir); a API de organizações trata esse caso.
 */
function requireOrganizationId(ctx: TenantContext): string {
  if (!ctx.organizationId) {
    throw new AuthorizationError('Usuário não possui organização associada.');
  }
  return ctx.organizationId;
}

/** Produtos do catálogo escopados para a organização do contexto. */
export function listProducts(
  ctx: TenantContext,
  options: { categoryId?: string } = {}
): Product[] {
  requirePermission(ctx, 'CARDAPIO', 'read');
  const organizationId = requireOrganizationId(ctx);

  const scoped = getAllProducts().filter(
    (product) => product.organizationId === organizationId
  );

  return filterProductsByCategory(scoped, options.categoryId);
}

/** Categorias do catálogo escopadas para a organização do contexto. */
export function listCategories(ctx: TenantContext): Category[] {
  requirePermission(ctx, 'CARDAPIO', 'read');
  const organizationId = requireOrganizationId(ctx);

  return getCategories().filter(
    (category) => category.organizationId === organizationId
  );
}
