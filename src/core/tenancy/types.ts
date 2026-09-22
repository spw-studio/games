/**
 * Conceitos de multi-tenancy da plataforma.
 *
 * Convenção de nomenclatura: toda entidade pertencente a uma empresa
 * carrega `organizationId` como campo raiz. O tenant NUNCA é derivado de
 * dados enviados pelo cliente — apenas da identidade autenticada
 * (ver `getTenantContext` em `./context`).
 */

/**
 * Papéis de usuário.
 * - SUPER_ADMIN: papel de PLATAFORMA (gerencia organizações); não depende
 *   de membership em nenhuma empresa.
 * - OWNER / EDITOR / VIEWER: papéis de conteúdo DENTRO de uma organização.
 */
export type Role = 'OWNER' | 'EDITOR' | 'VIEWER' | 'SUPER_ADMIN';

/** Módulos/produtos da plataforma que podem ser autorizados por papel. */
export type ModulePermission = 'CARDAPIO' | 'JOGOS' | 'ADMIN';

/**
 * Contexto de tenant resolvido no servidor a partir da sessão autenticada.
 * Toda consulta/serviço que lê ou escreve dados de empresa recebe este contexto.
 */
export interface TenantContext {
  userId: string;
  /**
   * Organização do contexto. `null` = usuário autenticado sem membership:
   * apenas SUPER_ADMIN opera nesse estado e serviços de domínio devem
   * exigir organização (respondendo 403).
   */
  organizationId: string | null;
  role: Role;
  isSuperAdmin: boolean;
}

/** Organização (empresa) atendida pela plataforma SaaS. */
export interface Organization {
  id: string;
  name: string;
  slug: string;
}

/**
 * Organização usada enquanto não existem memberships persistidos.
 * O JWT autenticado recebe este id no callback `jwt` do NextAuth e o
 * adapter do catálogo carimba os dados com o mesmo valor — garantindo
 * consistência entre identidade e dados.
 * Substituir por lookup em `organization_member` quando houver banco.
 */
export const DEFAULT_ORGANIZATION_ID = 'org-default';

/**
 * Id da organização de bootstrap. Configurável via `TENANT_DEFAULT_ORG_ID`
 * para permitir troca sem deploy. Usada APENAS em ambiente server-side.
 */
export function getBootstrapOrganizationId(): string {
  return process.env.TENANT_DEFAULT_ORG_ID || DEFAULT_ORGANIZATION_ID;
}
