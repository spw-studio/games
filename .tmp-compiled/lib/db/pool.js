"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseUrl = getDatabaseUrl;
exports.isDatabaseEnabled = isDatabaseEnabled;
exports.getPool = getPool;
const pg_1 = require("pg");
/**
 * Infraestrutura de banco (server-only).
 *
 * Postgres é ativado pela variável `DATABASE_URL`. Quando ausente, a
 * aplicação opera em MODO FALLBACK: a identidade usa o bootstrap da
 * Fase 2 (organização padrão + OWNER), mantendo dev/build funcionando
 * sem servidor de banco. Nunca crie o Pool fora de `getPool()` — a
 * inicialização é preguiçosa para não quebrar builds sem env.
 */
let pool = null;
function getDatabaseUrl() {
    const url = process.env.DATABASE_URL;
    return url && url.trim() !== '' ? url.trim() : null;
}
/** true quando o PostgreSQL está habilitado para esta execução. */
function isDatabaseEnabled() {
    return getDatabaseUrl() !== null;
}
/** Pool singleton (máx. 10 conexões — suficiente para ~10 empresas). */
function getPool() {
    const url = getDatabaseUrl();
    if (!url) {
        throw new Error('DATABASE_URL não configurado — banco de dados desabilitado.');
    }
    if (!pool) {
        pool = new pg_1.Pool({
            connectionString: url,
            max: 10,
            idleTimeoutMillis: 30000,
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
