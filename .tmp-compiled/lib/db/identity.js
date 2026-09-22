"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityError = void 0;
exports.slugify = slugify;
exports.upsertUser = upsertUser;
exports.findUserByEmail = findUserByEmail;
exports.ensureBootstrapOrganization = ensureBootstrapOrganization;
exports.listOrganizations = listOrganizations;
exports.getOrganizationById = getOrganizationById;
exports.createOrganization = createOrganization;
exports.findMembershipByUserId = findMembershipByUserId;
exports.findMembershipInOrg = findMembershipInOrg;
exports.listMembers = listMembers;
exports.countOwners = countOwners;
exports.addMember = addMember;
exports.changeMemberRole = changeMemberRole;
exports.removeMember = removeMember;
exports.resolveMembershipForSession = resolveMembershipForSession;
const node_crypto_1 = require("node:crypto");
const types_1 = require("../../core/tenancy/types");
const pool_1 = require("./pool");
class IdentityError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'IdentityError';
        this.code = code;
    }
}
exports.IdentityError = IdentityError;
function isUniqueViolation(error) {
    return (typeof error === 'object' &&
        error !== null &&
        error.code === '23505');
}
/** Gera slug URL-safe a partir de um nome. */
function slugify(value) {
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
async function upsertUser(input) {
    const pool = (0, pool_1.getPool)();
    const email = input.email.trim().toLowerCase();
    const { rows } = await pool.query(`INSERT INTO users (id, email, name, image)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE
       SET name = COALESCE(EXCLUDED.name, users.name),
           image = COALESCE(EXCLUDED.image, users.image),
           updated_at = now()
     RETURNING id, email, name, image, is_super_admin`, [(0, node_crypto_1.randomUUID)(), email, input.name ?? null, input.image ?? null]);
    return rows[0];
}
async function findUserByEmail(email) {
    const pool = (0, pool_1.getPool)();
    const { rows } = await pool.query(`SELECT id, email, name, image, is_super_admin FROM users WHERE email = $1`, [email.trim().toLowerCase()]);
    return rows[0] ?? null;
}
// ---------------------------------------------------------------------------
// Organizações
// ---------------------------------------------------------------------------
/**
 * Garante a organização padrão quando a base está vazia (primeiro login).
 * Idempotente e seguro sob corrida: falhas de unicidade são absorvidas.
 */
async function ensureBootstrapOrganization(userId) {
    const pool = (0, pool_1.getPool)();
    const existing = await pool.query('SELECT id FROM organizations LIMIT 1');
    if (existing.rows.length > 0) {
        return;
    }
    const orgId = (0, types_1.getBootstrapOrganizationId)();
    const orgName = process.env.TENANT_DEFAULT_ORG_NAME || 'Organização Padrão';
    try {
        await pool.query(`INSERT INTO organizations (id, name, slug) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`, [orgId, orgName, slugify(orgName)]);
        await pool.query(`INSERT INTO organization_members (id, organization_id, user_id, role)
       VALUES ($1, $2, $3, 'OWNER')
       ON CONFLICT DO NOTHING`, [(0, node_crypto_1.randomUUID)(), orgId, userId]);
    }
    catch (error) {
        // Corrida no primeiro login: outra requisição já criou o bootstrap.
        if (!isUniqueViolation(error)) {
            throw error;
        }
    }
}
async function listOrganizations() {
    const pool = (0, pool_1.getPool)();
    const { rows } = await pool.query('SELECT id, name, slug FROM organizations ORDER BY name');
    return rows;
}
async function getOrganizationById(id) {
    const pool = (0, pool_1.getPool)();
    const { rows } = await pool.query('SELECT id, name, slug FROM organizations WHERE id = $1', [id]);
    return rows[0] ?? null;
}
/** Cria uma organização (apenas SUPER_ADMIN chama este fluxo via API). */
async function createOrganization(input) {
    const pool = (0, pool_1.getPool)();
    const name = input.name.trim();
    const slug = slugify(input.slug ?? name);
    try {
        const { rows } = await pool.query(`INSERT INTO organizations (id, name, slug) VALUES ($1, $2, $3)
       RETURNING id, name, slug`, [(0, node_crypto_1.randomUUID)(), name, slug]);
        return rows[0];
    }
    catch (error) {
        if (isUniqueViolation(error)) {
            throw new IdentityError('SLUG_CONFLICT', `Slug "${slug}" já existe.`);
        }
        throw error;
    }
}
// ---------------------------------------------------------------------------
// Memberships
// ---------------------------------------------------------------------------
async function findMembershipByUserId(userId) {
    const pool = (0, pool_1.getPool)();
    const { rows } = await pool.query(`SELECT organization_id, user_id, role FROM organization_members WHERE user_id = $1`, [userId]);
    const row = rows[0];
    return row ? { ...row, role: row.role } : null;
}
async function findMembershipInOrg(organizationId, userId) {
    const pool = (0, pool_1.getPool)();
    const { rows } = await pool.query(`SELECT organization_id, user_id, role
     FROM organization_members
     WHERE organization_id = $1 AND user_id = $2`, [organizationId, userId]);
    const row = rows[0];
    return row ? { ...row, role: row.role } : null;
}
async function listMembers(organizationId) {
    const pool = (0, pool_1.getPool)();
    const { rows } = await pool.query(`SELECT u.id AS user_id, u.email, u.name, m.role, u.is_super_admin
     FROM organization_members m
     JOIN users u ON u.id = m.user_id
     WHERE m.organization_id = $1
     ORDER BY CASE m.role WHEN 'OWNER' THEN 0 WHEN 'EDITOR' THEN 1 ELSE 2 END, u.email`, [organizationId]);
    return rows.map((row) => ({
        userId: row.user_id,
        email: row.email,
        name: row.name,
        role: row.role,
        isSuperAdmin: row.is_super_admin,
    }));
}
async function countOwners(organizationId) {
    const pool = (0, pool_1.getPool)();
    const { rows } = await pool.query(`SELECT count(*)::int AS n FROM organization_members WHERE organization_id = $1 AND role = 'OWNER'`, [organizationId]);
    return rows[0]?.n ?? 0;
}
/** Vincula um usuário à organização (v1: um usuário em uma organização). */
async function addMember(input) {
    const pool = (0, pool_1.getPool)();
    const existing = await findMembershipByUserId(input.userId);
    if (existing) {
        throw new IdentityError('USER_MEMBERSHIP_EXISTS', 'O usuário já pertence a uma organização.');
    }
    try {
        await pool.query(`INSERT INTO organization_members (id, organization_id, user_id, role)
       VALUES ($1, $2, $3, $4)`, [(0, node_crypto_1.randomUUID)(), input.organizationId, input.userId, input.role]);
    }
    catch (error) {
        if (isUniqueViolation(error)) {
            throw new IdentityError('USER_MEMBERSHIP_EXISTS', 'O usuário já pertence a uma organização.');
        }
        throw error;
    }
}
/** Altera o papel; falha com LAST_OWNER se remover o último OWNER. */
async function changeMemberRole(input) {
    const current = await findMembershipInOrg(input.organizationId, input.userId);
    if (!current) {
        throw new IdentityError('MEMBER_NOT_FOUND', 'Membro não encontrado nesta organização.');
    }
    if (current.role === 'OWNER' && input.role !== 'OWNER') {
        const owners = await countOwners(input.organizationId);
        if (owners <= 1) {
            throw new IdentityError('LAST_OWNER', 'A organização precisa de pelo menos um OWNER.');
        }
    }
    const pool = (0, pool_1.getPool)();
    await pool.query(`UPDATE organization_members SET role = $1 WHERE organization_id = $2 AND user_id = $3`, [input.role, input.organizationId, input.userId]);
}
/** Remove o membro; falha com LAST_OWNER se remover o último OWNER. */
async function removeMember(organizationId, userId) {
    const current = await findMembershipInOrg(organizationId, userId);
    if (!current) {
        throw new IdentityError('MEMBER_NOT_FOUND', 'Membro não encontrado nesta organização.');
    }
    if (current.role === 'OWNER') {
        const owners = await countOwners(organizationId);
        if (owners <= 1) {
            throw new IdentityError('LAST_OWNER', 'A organização precisa de pelo menos um OWNER.');
        }
    }
    const pool = (0, pool_1.getPool)();
    await pool.query(`DELETE FROM organization_members WHERE organization_id = $1 AND user_id = $2`, [organizationId, userId]);
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
async function resolveMembershipForSession(input) {
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
