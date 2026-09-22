import { ModulePermission, Role, TenantContext } from './types';

export type AccessAction = 'read' | 'write';

/**
 * Erro de autorização (papel insuficiente). A camada de API converte este
 * erro em resposta HTTP 403.
 */
export class AuthorizationError extends Error {
  readonly status = 403;

  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

interface RoleAccess {
  read: ModulePermission[];
  write: ModulePermission[];
}

/**
 * Matriz de papéis → módulos (1ª versão):
 * - OWNER: controle total da organização (catálogo, jogos e administração).
 * - EDITOR: gerencia conteúdo (catálogo e jogos), sem administração.
 * - VIEWER: somente leitura — joga e consulta, não edita nada.
 */
const ROLE_ACCESS: Record<Role, RoleAccess> = {
  SUPER_ADMIN: {
    read: ['CARDAPIO', 'JOGOS', 'ADMIN'],
    write: ['CARDAPIO', 'JOGOS', 'ADMIN'],
  },
  OWNER: {
    read: ['CARDAPIO', 'JOGOS', 'ADMIN'],
    write: ['CARDAPIO', 'JOGOS', 'ADMIN'],
  },
  EDITOR: {
    read: ['CARDAPIO', 'JOGOS'],
    write: ['CARDAPIO', 'JOGOS'],
  },
  VIEWER: {
    read: ['CARDAPIO', 'JOGOS'],
    write: [],
  },
};

/** Normaliza um papel vindo de fora; desconhecidos recebem o menor privilégio. */
export function normalizeRole(value: string | undefined | null): Role {
  if (
    value === 'OWNER' ||
    value === 'EDITOR' ||
    value === 'VIEWER' ||
    value === 'SUPER_ADMIN'
  ) {
    return value;
  }
  return 'VIEWER';
}

/** Verifica se o contexto pode executar `action` no módulo informado. */
export function can(
  ctx: TenantContext,
  module: ModulePermission,
  action: AccessAction
): boolean {
  const access = ROLE_ACCESS[ctx.role] ?? ROLE_ACCESS.VIEWER;
  return access[action].includes(module);
}

/** Leitura no módulo (ex.: listar produtos do catápio). */
export function canRead(ctx: TenantContext, module: ModulePermission): boolean {
  return can(ctx, module, 'read');
}

/** Escrita no módulo (ex.: editar produto). */
export function canWrite(ctx: TenantContext, module: ModulePermission): boolean {
  return can(ctx, module, 'write');
}

/**
 * Exige permissão; lança AuthorizationError (403) quando o papel não basta.
 * Aplicado na camada de serviço — nunca apenas no UI.
 */
export function requirePermission(
  ctx: TenantContext,
  module: ModulePermission,
  action: AccessAction
): void {
  if (!can(ctx, module, action)) {
    throw new AuthorizationError(
      `Permissão negada: papel ${ctx.role} não pode ${action} no módulo ${module}.`
    );
  }
}
