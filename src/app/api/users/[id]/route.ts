import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/core/tenancy/context';
import { TenantContext } from '@/core/tenancy/types';
import { requirePermission } from '@/core/tenancy/permissions';
import { isDatabaseEnabled } from '@/lib/db/pool';
import { changeMemberRole, removeMember } from '@/lib/db/identity';
import {
  databaseDisabled,
  errorResponse,
  internalError,
  noOrganization,
  unauthorized,
} from '@/lib/api/identity-http';

const ROLE_VALUES = ['OWNER', 'EDITOR', 'VIEWER'] as const;

type RouteContext = { params: Promise<{ id: string }> };

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
 * PATCH /api/users/[id] — altera o papel de um membro.
 * Body: { role: 'OWNER'|'EDITOR'|'VIEWER' }
 * Guards (último OWNER) aplicados na camada de repositório.
 */
export async function PATCH(request: NextRequest, routeCtx: RouteContext) {
  const ctx = await getTenantContext();
  if (!ctx) return unauthorized();
  if (!isDatabaseEnabled()) return databaseDisabled();

  const { id: userId } = await routeCtx.params;
  const body = (await request.json().catch(() => null)) as { role?: unknown } | null;

  if (!body || typeof body.role !== 'string' || !(ROLE_VALUES as readonly string[]).includes(body.role)) {
    return NextResponse.json({ error: 'invalid_role' }, { status: 400 });
  }

  try {
    requirePermission(ctx, 'ADMIN', 'write');

    const organizationId = resolveMembersOrg(
      ctx,
      request.nextUrl.searchParams.get('organizationId')
    );
    if (!organizationId) return noOrganization();

    await changeMemberRole({
      organizationId,
      userId,
      role: body.role as (typeof ROLE_VALUES)[number],
    });

    return NextResponse.json({ data: { userId, role: body.role } });
  } catch (error) {
    return errorResponse(error) ?? internalError(error, 'PATCH /api/users/[id]');
  }
}

/**
 * DELETE /api/users/[id] — remove o membro da organização.
 * Guard de último OWNER aplicado na camada de repositório.
 */
export async function DELETE(request: NextRequest, routeCtx: RouteContext) {
  const ctx = await getTenantContext();
  if (!ctx) return unauthorized();
  if (!isDatabaseEnabled()) return databaseDisabled();

  const { id: userId } = await routeCtx.params;

  try {
    requirePermission(ctx, 'ADMIN', 'write');

    const organizationId = resolveMembersOrg(
      ctx,
      request.nextUrl.searchParams.get('organizationId')
    );
    if (!organizationId) return noOrganization();

    await removeMember(organizationId, userId);

    return NextResponse.json({ data: { userId, removed: true } });
  } catch (error) {
    return errorResponse(error) ?? internalError(error, 'DELETE /api/users/[id]');
  }
}
