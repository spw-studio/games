import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

/**
 * Migrador SQL mínimo (Fase 3):
 * - carrega .env/.env.local sem dependências externas;
 * - aplica migrations/*.sql em ordem alfabética, uma transação por arquivo;
 * - rastreia arquivos aplicados em schema_migrations (idempotente).
 *
 * Uso: npm run db:migrate   (requer DATABASE_URL)
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
      // Arquivo de env opcional ausente — segue com o processo.
    }
  }
}

async function main() {
  loadEnvFiles();

  const url = process.env.DATABASE_URL;
  if (!url || url.trim() === '') {
    console.error('ERRO: DATABASE_URL não configurado. Defina em .env.local antes de migrar.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();

  try {
    await client.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         id TEXT PRIMARY KEY,
         applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
       )`
    );

    const migrationsDir = path.join(root, 'migrations');
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT 1 FROM schema_migrations WHERE id = $1',
        [file]
      );
      if (rows.length > 0) {
        console.log(`= '${file}' já aplicada`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`+ '${file}' aplicada com sucesso`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    console.log('Migrações concluídas.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Falha na migração:', error);
  process.exit(1);
});
