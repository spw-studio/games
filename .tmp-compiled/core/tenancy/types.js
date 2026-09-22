"use strict";
/**
 * Conceitos de multi-tenancy da plataforma.
 *
 * Convenção de nomenclatura: toda entidade pertencente a uma empresa
 * carrega `organizationId` como campo raiz. O tenant NUNCA é derivado de
 * dados enviados pelo cliente — apenas da identidade autenticada
 * (ver `getTenantContext` em `./context`).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ORGANIZATION_ID = void 0;
exports.getBootstrapOrganizationId = getBootstrapOrganizationId;
/**
 * Organização usada enquanto não existem memberships persistidos.
 * O JWT autenticado recebe este id no callback `jwt` do NextAuth e o
 * adapter do catálogo carimba os dados com o mesmo valor — garantindo
 * consistência entre identidade e dados.
 * Substituir por lookup em `organization_member` quando houver banco.
 */
exports.DEFAULT_ORGANIZATION_ID = 'org-default';
/**
 * Id da organização de bootstrap. Configurável via `TENANT_DEFAULT_ORG_ID`
 * para permitir troca sem deploy. Usada APENAS em ambiente server-side.
 */
function getBootstrapOrganizationId() {
    return process.env.TENANT_DEFAULT_ORG_ID || exports.DEFAULT_ORGANIZATION_ID;
}
