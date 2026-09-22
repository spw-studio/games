import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { Role, getBootstrapOrganizationId } from '@/core/tenancy/types';
import { isDatabaseEnabled } from '@/lib/db/pool';
import { resolveMembershipForSession } from '@/lib/db/identity';

/** Papel usado no fallback sem banco (comportamento da Fase 2). */
const BOOTSTRAP_ROLE: Role = 'OWNER';

/** SUPER_ADMIN de plataforma por e-mail (complementa o flag no banco). */
function isSuperAdminEmail(email: string | null | undefined): boolean {
  const list = process.env.SUPER_ADMIN_EMAILS;
  if (!list || !email) return false;
  return list
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
  },
  callbacks: {
    /**
     * Lista branca opcional de e-mails (ex.: contas corporativas).
     * Defina AUTH_EMAIL_ALLOWLIST=email1,email2 para restringir o login.
     */
    async signIn({ user }) {
      const allowlist = process.env.AUTH_EMAIL_ALLOWLIST;
      if (!allowlist || allowlist.trim() === '') {
        return true;
      }

      const allowed = allowlist
        .split(',')
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean);
      const email = (user.email || '').toLowerCase();

      return email !== '' && allowed.includes(email);
    },

    /** Marca o identificador estável no JWT (usado no fallback sem banco). */
    async jwt({ token, user }) {
      if (user?.email && !token.userId) {
        token.userId = `email:${user.email.toLowerCase()}`;
      }
      return token;
    },

    /**
     * Fase 3 — resolve a identidade de tenant AQUI, no servidor:
     *
     * Com banco (DATABASE_URL): membership real em `organization_members`;
     * o bootstrap (org padrão + OWNER) acontece apenas quando a base de
     * organizações está vazia. Usuário sem convite → organizationId null
     * (serviços respondem 403).
     *
     * Sem banco/erro de banco: fallback = organização padrão + OWNER
     * (comportamento da Fase 2) para manter dev/build operacionais.
     *
     * O organizationId NUNCA vem do cliente.
     */
    async session({ session, token }) {
      if (!session.user) return session;

      const email = session.user.email ?? null;
      session.user.userId =
        (typeof token.userId === 'string' && token.userId) ||
        (email ? `email:${email.toLowerCase()}` : undefined);
      session.user.isSuperAdmin = isSuperAdminEmail(email);

      if (isDatabaseEnabled()) {
        try {
          const identity = await resolveMembershipForSession({
            email,
            name: session.user.name,
            image: session.user.image ?? null,
          });

          session.user.userId = identity.userId;
          session.user.organizationId = identity.organizationId;
          session.user.role = identity.role ?? undefined;
          session.user.isSuperAdmin =
            identity.isSuperAdmin || session.user.isSuperAdmin === true;
          return session;
        } catch (error) {
          console.error(
            '[auth] Falha ao resolver identidade no banco; usando fallback de bootstrap.',
            error
          );
        }
      }

      session.user.organizationId = getBootstrapOrganizationId();
      session.user.role = BOOTSTRAP_ROLE;
      return session;
    },
  },
};
