/**
 * Controle global de autenticação da plataforma.
 * Permite desativar temporariamente a autenticação para desenvolvimento,
 * testes locais e validação de jogos sem depender do OAuth do Google.
 */
export function isAuthDisabled(): boolean {
  if (process.env.NEXT_PUBLIC_DISABLE_AUTH !== undefined) {
    return process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';
  }
  if (process.env.DISABLE_AUTH !== undefined) {
    return process.env.DISABLE_AUTH === 'true';
  }
  // Padrão: desativado quando solicitado explicitamente
  return true;
}
