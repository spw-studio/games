import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

/**
 * Seed operacional (Fase 3):
 * - cria a organização padrão se não existir;
 * - opcionalmente vincula um e-mail como OWNER (onboarding antes do
 *   primeiro login daquele usuário).
 *
 * Uso:
 *   npm run db:seed                      → cria organização padrão
 *   npm run db:seed -- dono@empresa.com  → cria org + vincula OWNER por e-mail
 */

const { Pool } = pg;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvFiles() {
  for (const file of ['.env.local', '.env']) {
    try {
      const content = fs.readFileSync(path.join(root, file), 'utf8');
      for (const line of content.split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (match && !(match[1] in process.env)) {
          process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
        }
      }
    } catch {
      // Arquivo opcional ausente.
    }
  }
}

function slugify(value) {
  return (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'organizacao'
  );
}

async function main() {
  loadEnvFiles();

  const url = process.env.DATABASE_URL;
  if (!url || url.trim() === '') {
    console.error('ERRO: DATABASE_URL não configurado.');
    process.exit(1);
  }

  const ownerEmail = (process.argv[2] || '').trim().toLowerCase() || null;
  const orgId = process.env.TENANT_DEFAULT_ORG_ID || 'org-default';
  const orgName = process.env.TENANT_DEFAULT_ORG_NAME || 'Organização Padrão';

  const pool = new Pool({ connectionString: url });
  try {
    const existing = await pool.query('SELECT id FROM organizations WHERE id = $1', [orgId]);
    if (existing.rows.length === 0) {
      await pool.query(
        'INSERT INTO organizations (id, name, slug) VALUES ($1, $2, $3)',
        [orgId, orgName, slugify(orgName)]
      );
      console.log(`+ organização criada: ${orgId} (${orgName})`);
    } else {
      console.log(`= organização já existe: ${orgId}`);
    }

    if (ownerEmail) {
      const userResult = await pool.query(
        `INSERT INTO users (id, email) VALUES ($1, $2)
         ON CONFLICT (email) DO UPDATE SET updated_at = now()
         RETURNING id`,
        [randomUUID(), ownerEmail]
      );
      const userId = userResult.rows[0].id;

      const membership = await pool.query(
        'SELECT 1 FROM organization_members WHERE user_id = $1',
        [userId]
      );
      if (membership.rows.length === 0) {
        await pool.query(
          `INSERT INTO organization_members (id, organization_id, user_id, role)
           VALUES ($1, $2, $3, 'OWNER')`,
          [randomUUID(), orgId, userId]
        );
        console.log(`+ OWNER vinculado: ${ownerEmail}`);
      } else {
        console.log(`= usuário já possui organização: ${ownerEmail}`);
      }
    } else {
      console.log('(nenhum e-mail informado — use: npm run db:seed -- dono@empresa.com)');
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Falha no seed:', error);
  process.exit(1);
});
