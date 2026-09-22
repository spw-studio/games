import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/core/tenancy/context';
import { TenantContext } from '@/core/tenancy/types';
import { requirePermission } from '@/core/tenancy/permissions';
import { isDatabaseEnabled } from '@/lib/db/pool';
import { addMember, findUserByEmail, listMembers, upsertUser } from '@/lib/db/identity';
import {
  databaseDisabled,
  errorResponse,
  forbidden,
  internalError,
  noOrganization,
  unauthorized,
} from '@/lib/api/identity-http';

const ROLE_VALUES = ['OWNER', 'EDITOR', 'VIEWER'] as const;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Organização-alvo dos membros: a do contexto; SUPER_ADMIN pode
 * especificar outra (o pedido de org do cliente só é honrado para
 * quem já é autorizado em todas).
 */
function resolveMembersOrg(
  ctx: TenantContext,
  requested: string | null
): string | null {
  if (ctx.isSuperAdmin && requested && requested.trim() !== '') {
    return requested.trim();
  }
  return ctx.organizationId;
}

/**
 * GET /api/users — membros da organização.
 * QUERY `organizationId` (apenas SUPER_ADMIN) opcional para cross-org.
 */
export async function GET(request: NextRequest) {
  const ctx = await getTenantContext();
  if (!ctx) return unauthorized();
  if (!isDatabaseEnabled()) return databaseDisabled();

  try {
    requirePermission(ctx, 'ADMIN', 'read');

    const organizationId = resolveMembersOrg(
      ctx,
      request.nextUrl.searchParams.get('organizationId')
    );
    if (!organizationId) return noOrganization();

    return NextResponse.json({ data: await listMembers(organizationId) });
  } catch (error) {
    return errorResponse(error) ?? internalError(error, 'GET /api/users');
  }
}

/**
 * POST /api/users — convida/adiciona um membro por e-mail.
 * Body: { email: string; role: 'OWNER'|'EDITOR'|'VIEWER'; organizationId?: string; name?: string }
 * O usuário entra de fato ao fazer login com este e-mail (upsert no primeiro acesso).
 */
export async function POST(request: NextRequest) {
  const ctx = await getTenantContext();
  if (!ctx) return unauthorized();
  if (!isDatabaseEnabled()) return databaseDisabled();

  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    role?: unknown;
    organizationId?: unknown;
    name?: unknown;
  } | null;

  if (!body || typeof body.email !== 'string' || !EMAIL_PATTERN.test(body.email.trim().toLowerCase())) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }
  if (typeof body.role !== 'string' || !(ROLE_VALUES as readonly string[]).includes(body.role)) {
    return NextResponse.json({ error: 'invalid_role' }, { status: 400 });
  }

  try {
    requirePermission(ctx, 'ADMIN', 'write');

    const organizationId = resolveMembersOrg(
      ctx,
      typeof body.organizationId === 'string' ? body.organizationId : null
    );
    if (!organizationId) return noOrganization();

    const email = body.email.trim().toLowerCase();
    const role = body.role as (typeof ROLE_VALUES)[number];

    const user =
      (await findUserByEmail(email)) ??
      (await upsertUser({
        email,
        name: typeof body.name === 'string' ? body.name : null,
      }));

    await addMember({ organizationId, userId: user.id, role });

    return NextResponse.json(
      { data: { userId: user.id, email, role } },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error) ?? internalError(error, 'POST /api/users');
  }
}
