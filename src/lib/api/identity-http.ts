import { NextResponse } from 'next/server';
import { AuthorizationError } from '@/core/tenancy/permissions';
import { IdentityError } from '@/lib/db/identity';

/** Respostas HTTP padronizadas da camada de API de identidade. */

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
}

export function forbidden(): NextResponse {
  return NextResponse.json({ error: 'forbidden' }, { status: 403 });
}

export function noOrganization(): NextResponse {
  return NextResponse.json({ error: 'no_organization' }, { status: 403 });
}

export function databaseDisabled(): NextResponse {
  return NextResponse.json({ error: 'database_disabled' }, { status: 503 });
}

/**
 * Mapeia erros de domínio (AuthorizationError/IdentityError) para HTTP.
 * Retorna null para erros não reconhecidos (caller decide o 500).
 */
export function errorResponse(error: unknown): NextResponse | null {
  if (error instanceof AuthorizationError) {
    return forbidden();
  }

  if (error instanceof IdentityError) {
    switch (error.code) {
      case 'LAST_OWNER':
        return NextResponse.json({ error: 'LAST_OWNER' }, { status: 400 });
      case 'USER_MEMBERSHIP_EXISTS':
        return NextResponse.json({ error: 'USER_MEMBERSHIP_EXISTS' }, { status: 409 });
      case 'MEMBER_NOT_FOUND':
        return NextResponse.json({ error: 'MEMBER_NOT_FOUND' }, { status: 404 });
      case 'SLUG_CONFLICT':
        return NextResponse.json({ error: 'SLUG_CONFLICT' }, { status: 409 });
    }
  }

  return null;
}

export function internalError(error: unknown, scope: string): NextResponse {
  console.error(`[${scope}]`, error);
  return NextResponse.json({ error: 'internal_error' }, { status: 500 });
}
