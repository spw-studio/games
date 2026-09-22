import { Pool } from 'pg';

/**
 * Infraestrutura de banco (server-only).
 *
 * Postgres é ativado pela variável `DATABASE_URL`. Quando ausente, a
 * aplicação opera em MODO FALLBACK: a identidade usa o bootstrap da
 * Fase 2 (organização padrão + OWNER), mantendo dev/build funcionando
 * sem servidor de banco. Nunca crie o Pool fora de `getPool()` — a
 * inicialização é preguiçosa para não quebrar builds sem env.
 */

let pool: Pool | null = null;

export function getDatabaseUrl(): string | null {
  const url = process.env.DATABASE_URL;
  return url && url.trim() !== '' ? url.trim() : null;
}

/** true quando o PostgreSQL está habilitado para esta execução. */
export function isDatabaseEnabled(): boolean {
  return getDatabaseUrl() !== null;
}

/** Pool singleton (máx. 10 conexões — suficiente para ~10 empresas). */
export function getPool(): Pool {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error('DATABASE_URL não configurado — banco de dados desabilitado.');
  }

  if (!pool) {
    pool = new Pool({
      connectionString: url,
      max: 10,
      idleTimeoutMillis: 30_000,
    });

    // OBRIGATÓRIO: sem este listener, a queda de uma conexão ociosa emite
    // 'error' no Pool sem consumidor e DERRUBA o processo do servidor
    // (Next.js) inteiro. Com o listener, o pool simplesmente descarta a
    // conexão morta e cria uma nova na próxima consulta.
    pool.on('error', (error) => {
      console.error('[db] Erro em conexão ociosa do pool (recuperável):', error);
    });
  }

  return pool;
}
