/**
 * Rotas públicas (não exigem sessão).
 *
 * Compartilhado entre o middleware (server) e o AppShell (client) para
 * manter uma única definição de política de acesso por rota — evitando que
 * as duas camadas divergam.
 */
const PUBLIC_PATHS = ['/jogos'] as const;

export function isPublicPath(pathname: string): boolean {
  return (PUBLIC_PATHS as readonly string[]).includes(pathname);
}
