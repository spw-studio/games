/**
 * Controle global de autenticação da plataforma.
 * Permite desativar temporariamente a autenticação para desenvolvimento,
 * testes locais e validação de jogos sem depender do OAuth do Google.
 */
export function isAuthDisabled(): boolean {
  const publicVal = process.env.NEXT_PUBLIC_DISABLE_AUTH?.trim().toLowerCase();
  if (publicVal !== undefined && publicVal !== '') {
    return publicVal === 'true' || publicVal === '1' || publicVal === 'yes';
  }

  const serverVal = process.env.DISABLE_AUTH?.trim().toLowerCase();
  if (serverVal !== undefined && serverVal !== '') {
    return serverVal === 'true' || serverVal === '1' || serverVal === 'yes';
  }

  // Em produção, se não definido explicitamente, a autenticação fica ATIVA (segurança).
  // Em desenvolvimento local, fica DESATIVADA por padrão para testes rápidos.
  return process.env.NODE_ENV !== 'production';
}
