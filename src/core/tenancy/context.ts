import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TenantContext } from './types';
import { normalizeRole } from './permissions';

/**
 * Resolve o TenantContext a partir da sessão autenticada (server-only).
 *
 * A sessão é montada no callback `session` do NextAuth (Fase 3), que
 * consulta as memberships no banco quando `DATABASE_URL` está ativo.
 * NUNCA aceite `organizationId` enviado pelo cliente em query/body/headers.
 *
 * - Sem sessão → null (a API responde 401).
 * - Com sessão sem organização → contexto com `organizationId: null`
 *   (serviços de domínio respondem 403; SUPER_ADMIN segue permitido).
 */
export async function getTenantContext(): Promise<TenantContext | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    return null;
  }

  const isSuperAdmin = user.isSuperAdmin === true;

  return {
    userId: user.userId ?? user.email ?? 'unknown-user',
    organizationId: user.organizationId ?? null,
    role: isSuperAdmin ? 'SUPER_ADMIN' : normalizeRole(user.role),
    isSuperAdmin,
  };
}
