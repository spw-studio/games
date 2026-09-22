import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/core/tenancy/context';
import { isDatabaseEnabled } from '@/lib/db/pool';
import {
  IdentityError,
  createOrganization,
  getOrganizationById,
  listOrganizations,
} from '@/lib/db/identity';
import {
  databaseDisabled,
  errorResponse,
  forbidden,
  internalError,
  unauthorized,
} from '@/lib/api/identity-http';

/**
 * GET /api/organizations
 * - SUPER_ADMIN: lista todas as organizações (plataforma).
 * - OWNER/ demais: retorna a própria organização (singleton).
 */
export async function GET() {
  const ctx = await getTenantContext();
  if (!ctx) return unauthorized();
  if (!isDatabaseEnabled()) return databaseDisabled();

  try {
    if (ctx.isSuperAdmin) {
      return NextResponse.json({ data: await listOrganizations() });
    }

    if (!ctx.organizationId) {
      return forbidden();
    }

    const organization = await getOrganizationById(ctx.organizationId);
    return NextResponse.json({ data: organization ? [organization] : [] });
  } catch (error) {
    return errorResponse(error) ?? internalError(error, 'GET /api/organizations');
  }
}

/**
 * POST /api/organizations — cria uma organização (apenas SUPER_ADMIN).
 * Body: { name: string; slug?: string }
 */
export async function POST(request: NextRequest) {
  const ctx = await getTenantContext();
  if (!ctx) return unauthorized();
  if (!ctx.isSuperAdmin) return forbidden();
  if (!isDatabaseEnabled()) return databaseDisabled();

  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    slug?: unknown;
  } | null;

  if (!body || typeof body.name !== 'string' || body.name.trim().length < 2) {
    return NextResponse.json({ error: 'invalid_name' }, { status: 400 });
  }
  if (body.slug !== undefined && typeof body.slug !== 'string') {
    return NextResponse.json({ error: 'invalid_slug' }, { status: 400 });
  }

  try {
    const organization = await createOrganization({
      name: body.name,
      slug: typeof body.slug === 'string' ? body.slug : undefined,
    });
    return NextResponse.json({ data: organization }, { status: 201 });
  } catch (error) {
    if (error instanceof IdentityError && error.code === 'SLUG_CONFLICT') {
      return errorResponse(error) ?? internalError(error, 'POST /api/organizations');
    }
    return internalError(error, 'POST /api/organizations');
  }
}
