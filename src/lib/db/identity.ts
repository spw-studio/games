import { randomUUID } from 'node:crypto';
import { Role, getBootstrapOrganizationId } from '../../core/tenancy/types';
import { getPool } from './pool';

/**
 * Repositório de identidade (server-only): usuários, organizações e
 * memberships. Único ponto de acesso ao schema de identidade — as rotas
 * de API e o NextAuth consomem apenas este módulo.
 *
 * Guards de domínio (último OWNER, um-org-por-usuário) vivem AQUI para
 * valerem em qualquer chamador e serem testáveis sem HTTP.
 */

/** Erro de domínio com código — as rotas mapeiam para HTTP. */
export type IdentityErrorCode =
  | 'LAST_OWNER'
  | 'MEMBER_NOT_FOUND'
  | 'USER_MEMBERSHIP_EXISTS'
  | 'SLUG_CONFLICT';

export class IdentityError extends Error {
  readonly code: IdentityErrorCode;

  constructor(code: IdentityErrorCode, message: string) {
    super(message);
    this.name = 'IdentityError';
    this.code = code;
  }
}

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  is_super_admin: boolean;
}

export interface MembershipRow {
  organization_id: string;
  user_id: string;
  role: Role;
}

export interface OrganizationRow {
  id: string;
  name: string;
  slug: string;
}

export interface MemberView {
  userId: string;
  email: string;
  name: string | null;
  role: Role;
  isSuperAdmin: boolean;
}

export interface ResolvedIdentity {
  userId: string;
  organizationId: string | null;
  role: Role | null;
  isSuperAdmin: boolean;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: string }).code === '23505'
  );
}

/** Gera slug URL-safe a partir de um nome. */
export function slugify(value: string): string {
  const base = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'organizacao';
}

// ---------------------------------------------------------------------------
// Usuários
// ---------------------------------------------------------------------------

/** Insere ou atualiza o usuário pelo e-mail (fonte de verdade de identidade). */
export async function upsertUser(input: {
  email: string;
  name?: string | null;
  image?: string | null;
}): Promise<UserRow> {
  const pool = getPool();
  const email = input.email.trim().toLowerCase();

  const { rows } = await pool.query<UserRow>(
    `INSERT INTO users (id, email, name, image)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE
       SET name = COALESCE(EXCLUDED.name, users.name),
           image = COALESCE(EXCLUDED.image, users.image),
           updated_at = now()
     RETURNING id, email, name, image, is_super_admin`,
    [randomUUID(), email, input.name ?? null, input.image ?? null]
  );

  return rows[0];
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const pool = getPool();
  const { rows } = await pool.query<UserRow>(
    `SELECT id, email, name, image, is_super_admin FROM users WHERE email = $1`,
    [email.trim().toLowerCase()]
  );
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Organizações
// ---------------------------------------------------------------------------

/**
 * Garante a organização padrão quando a base está vazia (primeiro login).
 * Idempotente e seguro sob corrida: falhas de unicidade são absorvidas.
 */
export async function ensureBootstrapOrganization(userId: string): Promise<void> {
  const pool = getPool();

  const existing = await pool.query<{ id: string }>(
    'SELECT id FROM organizations LIMIT 1'
  );
  if (existing.rows.length > 0) {
    return;
  }

  const orgId = getBootstrapOrganizationId();
  const orgName = process.env.TENANT_DEFAULT_ORG_NAME || 'Organização Padrão';

  try {
    await pool.query(
      `INSERT INTO organizations (id, name, slug) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [orgId, orgName, slugify(orgName)]
    );
    await pool.query(
      `INSERT INTO organization_members (id, organization_id, user_id, role)
       VALUES ($1, $2, $3, 'OWNER')
       ON CONFLICT DO NOTHING`,
      [randomUUID(), orgId, userId]
    );
  } catch (error) {
    // Corrida no primeiro login: outra requisição já criou o bootstrap.
    if (!isUniqueViolation(error)) {
      throw error;
    }
  }
}

export async function listOrganizations(): Promise<OrganizationRow[]> {
  const pool = getPool();
  const { rows } = await pool.query<OrganizationRow>(
    'SELECT id, name, slug FROM organizations ORDER BY name'
  );
  return rows;
}

export async function getOrganizationById(
  id: string
): Promise<OrganizationRow | null> {
  const pool = getPool();
  const { rows } = await pool.query<OrganizationRow>(
    'SELECT id, name, slug FROM organizations WHERE id = $1',
    [id]
  );
  return rows[0] ?? null;
}

/** Cria uma organização (apenas SUPER_ADMIN chama este fluxo via API). */
export async function createOrganization(input: {
  name: string;
  slug?: string;
}): Promise<OrganizationRow> {
  const pool = getPool();
  const name = input.name.trim();
  const slug = slugify(input.slug ?? name);

  try {
    const { rows } = await pool.query<OrganizationRow>(
      `INSERT INTO organizations (id, name, slug) VALUES ($1, $2, $3)
       RETURNING id, name, slug`,
      [randomUUID(), name, slug]
    );
    return rows[0];
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new IdentityError('SLUG_CONFLICT', `Slug "${slug}" já existe.`);
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Memberships
// ---------------------------------------------------------------------------

export async function findMembershipByUserId(
  userId: string
): Promise<MembershipRow | null> {
  const pool = getPool();
  const { rows } = await pool.query<{
    organization_id: string;
    user_id: string;
    role: string;
  }>(
    `SELECT organization_id, user_id, role FROM organization_members WHERE user_id = $1`,
    [userId]
  );
  const row = rows[0];
  return row ? { ...row, role: row.role as Role } : null;
}

export async function findMembershipInOrg(
  organizationId: string,
  userId: string
): Promise<MembershipRow | null> {
  const pool = getPool();
  const { rows } = await pool.query<{
    organization_id: string;
    user_id: string;
    role: string;
  }>(
    `SELECT organization_id, user_id, role
     FROM organization_members
     WHERE organization_id = $1 AND user_id = $2`,
    [organizationId, userId]
  );
  const row = rows[0];
  return row ? { ...row, role: row.role as Role } : null;
}

export async function listMembers(organizationId: string): Promise<MemberView[]> {
  const pool = getPool();
  const { rows } = await pool.query<{
    user_id: string;
    email: string;
    name: string | null;
    role: string;
    is_super_admin: boolean;
  }>(
    `SELECT u.id AS user_id, u.email, u.name, m.role, u.is_super_admin
     FROM organization_members m
     JOIN users u ON u.id = m.user_id
     WHERE m.organization_id = $1
     ORDER BY CASE m.role WHEN 'OWNER' THEN 0 WHEN 'EDITOR' THEN 1 ELSE 2 END, u.email`,
    [organizationId]
  );

  return rows.map((row) => ({
    userId: row.user_id,
    email: row.email,
    name: row.name,
    role: row.role as Role,
    isSuperAdmin: row.is_super_admin,
  }));
}

export async function countOwners(organizationId: string): Promise<number> {
  const pool = getPool();
  const { rows } = await pool.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM organization_members WHERE organization_id = $1 AND role = 'OWNER'`,
    [organizationId]
  );
  return rows[0]?.n ?? 0;
}

/** Vincula um usuário à organização (v1: um usuário em uma organização). */
export async function addMember(input: {
  organizationId: string;
  userId: string;
  role: Role;
}): Promise<void> {
  const pool = getPool();

  const existing = await findMembershipByUserId(input.userId);
  if (existing) {
    throw new IdentityError(
      'USER_MEMBERSHIP_EXISTS',
      'O usuário já pertence a uma organização.'
    );
  }

  try {
    await pool.query(
      `INSERT INTO organization_members (id, organization_id, user_id, role)
       VALUES ($1, $2, $3, $4)`,
      [randomUUID(), input.organizationId, input.userId, input.role]
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new IdentityError(
        'USER_MEMBERSHIP_EXISTS',
        'O usuário já pertence a uma organização.'
      );
    }
    throw error;
  }
}

/** Altera o papel; falha com LAST_OWNER se remover o último OWNER. */
export async function changeMemberRole(input: {
  organizationId: string;
  userId: string;
  role: Role;
}): Promise<void> {
  const current = await findMembershipInOrg(input.organizationId, input.userId);
  if (!current) {
    throw new IdentityError(
      'MEMBER_NOT_FOUND',
      'Membro não encontrado nesta organização.'
    );
  }

  if (current.role === 'OWNER' && input.role !== 'OWNER') {
    const owners = await countOwners(input.organizationId);
    if (owners <= 1) {
      throw new IdentityError(
        'LAST_OWNER',
        'A organização precisa de pelo menos um OWNER.'
      );
    }
  }

  const pool = getPool();
  await pool.query(
    `UPDATE organization_members SET role = $1 WHERE organization_id = $2 AND user_id = $3`,
    [input.role, input.organizationId, input.userId]
  );
}

/** Remove o membro; falha com LAST_OWNER se remover o último OWNER. */
export async function removeMember(
  organizationId: string,
  userId: string
): Promise<void> {
  const current = await findMembershipInOrg(organizationId, userId);
  if (!current) {
    throw new IdentityError(
      'MEMBER_NOT_FOUND',
      'Membro não encontrado nesta organização.'
    );
  }

  if (current.role === 'OWNER') {
    const owners = await countOwners(organizationId);
    if (owners <= 1) {
      throw new IdentityError(
        'LAST_OWNER',
        'A organização precisa de pelo menos um OWNER.'
      );
    }
  }

  const pool = getPool();
  await pool.query(
    `DELETE FROM organization_members WHERE organization_id = $1 AND user_id = $2`,
    [organizationId, userId]
  );
}

// ---------------------------------------------------------------------------
// Resolução de sessão (chamada pelo callback `session` do NextAuth)
// ---------------------------------------------------------------------------

/**
 * Resolve a identidade completa de quem está logando:
 * upsert do usuário → membership → bootstrap automático se a base está vazia.
 *
 * Retorna `organizationId: null` quando o usuário ainda não foi convidado
 * para nenhuma organização (a API responderá 403 nesse caso).
 */
export async function resolveMembershipForSession(input: {
  email: string | null;
  name?: string | null;
  image?: string | null;
}): Promise<ResolvedIdentity> {
  if (!input.email) {
    return {
      userId: 'unknown-user',
      organizationId: null,
      role: null,
      isSuperAdmin: false,
    };
  }

  const user = await upsertUser({
    email: input.email,
    name: input.name ?? null,
    image: input.image ?? null,
  });

  let membership = await findMembershipByUserId(user.id);
  if (!membership) {
    await ensureBootstrapOrganization(user.id);
    membership = await findMembershipByUserId(user.id);
  }

  return {
    userId: user.id,
    organizationId: membership?.organization_id ?? null,
    role: membership?.role ?? null,
    isSuperAdmin: user.is_super_admin,
  };
}
