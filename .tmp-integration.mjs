import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Teste de integração da Fase 3 (temporário — removido após a execução):
 * sobe um PostgreSQL real embebido, aplica as migrações e exercita o
 * repositório de identidade compilado (os mesmos arquivos de src/).
 */

const require = createRequire(import.meta.url);
const root = path.dirname(fileURLToPath(import.meta.url));

const assert = (cond, msg) => {
  if (!cond) throw new Error(`FALHOU: ${msg}`);
  console.log(`OK: ${msg}`);
};

const expectCode = async (promise, code, msg) => {
  try {
    await promise;
  } catch (error) {
    assert(error?.code === code, `${msg} (code=${error?.code})`);
    return;
  }
  throw new Error(`FALHOU: ${msg} — nenhuma exceção lançada`);
};

async function main() {
  console.log('== 1. PostgreSQL embarcado (temporário, porta 55433) ==');
  const epMod = await import('embedded-postgres');
  const EmbeddedPostgres = epMod.default ?? epMod;
  const server = new EmbeddedPostgres({
    databaseDir: path.join(root, '.tmp-pgdata'),
    user: 'postgres',
    password: 'postgres',
    port: 55433,
    persistent: false,
  });
  await server.initialise();
  await server.start();
  await server.createDatabase('gastronomia_fase3');
  const url = 'postgresql://postgres:postgres@127.0.0.1:55433/gastronomia_fase3';

  try {
    console.log('== 2. Migração SQL (2x para provar idempotência) ==');
    for (let i = 1; i <= 2; i += 1) {
      execFileSync(process.execPath, ['scripts/db-migrate.mjs'], {
        cwd: root,
        env: { ...process.env, DATABASE_URL: url },
        stdio: 'inherit',
      });
    }

    console.log('== 3. Compila pool + repositório de identidade (fonte real de src/) ==');
    const tsc = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc');
    execFileSync(
      process.execPath,
      [
        tsc,
        'src/lib/db/pool.ts',
        'src/lib/db/identity.ts',
        '--outDir', '.tmp-compiled',
        '--module', 'commonjs',
        '--target', 'es2020',
        '--moduleResolution', 'node',
        '--esModuleInterop',
        '--skipLibCheck',
      ],
      { cwd: root, stdio: 'inherit' }
    );

    process.env.DATABASE_URL = url;
    const identity = require('./.tmp-compiled/lib/db/identity.js');

    console.log('== 4. Resolução de sessão + bootstrap ==');
    const id1 = await identity.resolveMembershipForSession({
      email: 'dono@empresa-a.com',
      name: 'Dono A',
    });
    assert(id1.organizationId === 'org-default', 'bootstrap cria a organização padrão');
    assert(id1.role === 'OWNER', 'primeiro usuário vira OWNER');

    const orgs = await identity.listOrganizations();
    assert(orgs.length === 1 && orgs[0].name.length > 0, 'organização padrão persistida');

    const id2 = await identity.resolveMembershipForSession({ email: 'editor@empresa-a.com' });
    assert(
      id2.organizationId === null && id2.role === null,
      'usuário sem convite fica sem organização'
    );

    const repeat = await identity.resolveMembershipForSession({
      email: 'DONO@empresa-a.com',
      name: 'Dono A2',
    });
    assert(repeat.userId === id1.userId, 'upsert idempotente (e-mail case-insensitive)');

    console.log('== 5. Membros e guards de domínio ==');
    await identity.addMember({
      organizationId: 'org-default',
      userId: id2.userId,
      role: 'EDITOR',
    });
    const members = await identity.listMembers('org-default');
    assert(members.length === 2, 'dois membros na organização');
    assert(members[0].role === 'OWNER', 'OWNER ordenado primeiro na listagem');

    await expectCode(
      identity.addMember({ organizationId: 'org-default', userId: id2.userId, role: 'VIEWER' }),
      'USER_MEMBERSHIP_EXISTS',
      'membership duplicada é bloqueada'
    );

    await expectCode(
      identity.changeMemberRole({ organizationId: 'org-default', userId: id1.userId, role: 'VIEWER' }),
      'LAST_OWNER',
      'único OWNER não é rebaixado'
    );

    await expectCode(
      identity.removeMember('org-default', id1.userId),
      'LAST_OWNER',
      'único OWNER não é removido'
    );

    await identity.changeMemberRole({
      organizationId: 'org-default',
      userId: id2.userId,
      role: 'OWNER',
    });
    const owners = (await identity.listMembers('org-default')).filter((m) => m.role === 'OWNER');
    assert(owners.length === 2, 'promoção a OWNER funciona');

    await identity.changeMemberRole({
      organizationId: 'org-default',
      userId: id1.userId,
      role: 'VIEWER',
    });
    const after = await identity.listMembers('org-default');
    assert(
      after.find((m) => m.userId === id1.userId)?.role === 'VIEWER',
      'rebaixamento permitido havendo 2 owners'
    );

    // user1 agora é VIEWER — remoção de membro comum é sempre permitida
    await identity.removeMember('org-default', id1.userId);
    assert(
      (await identity.listMembers('org-default')).length === 1,
      'remoção de membro comum permitida (resta 1 membro)'
    );

    await expectCode(
      identity.removeMember('org-default', id1.userId),
      'MEMBER_NOT_FOUND',
      'membro já removido → MEMBER_NOT_FOUND'
    );

    console.log('== 6. Organizações ==');
    const created = await identity.createOrganization({ name: 'Empresa B' });
    assert(created.slug === 'empresa-b', 'slug gerado a partir do nome');

    await expectCode(
      identity.createOrganization({ name: 'Empresa B!!' }),
      'SLUG_CONFLICT',
      'slug duplicado é bloqueado'
    );

    await identity.ensureBootstrapOrganization(id2.userId);
    assert(
      (await identity.listOrganizations()).length === 2,
      'bootstrap NÃO dispara com base já populada'
    );

    console.log('== TODOS OS TESTES DE IDENTIDADE PASSARAM ==');
  } finally {
    try {
      await server.stop();
    } catch {
      // Servidor já parado — segue a limpeza externa.
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
