import { DefaultSession } from 'next-auth';
import { Role } from '@/core/tenancy/types';

declare module 'next-auth' {
  interface Session {
    user: {
      /** Id estável do usuário (id no banco quando `DATABASE_URL` ativo). */
      userId?: string;
      /** Organização (tenant) da sessão — null = sem membership. */
      organizationId?: string | null;
      /** Papel na organização (ausente para SUPER_ADMIN sem membership). */
      role?: Role;
      /** SUPER_ADMIN de plataforma (gerencia organizações). */
      isSuperAdmin?: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    organizationId?: string | null;
    role?: Role;
    isSuperAdmin?: boolean;
  }
}
