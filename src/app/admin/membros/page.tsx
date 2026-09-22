'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AlertCircle, CheckCircle2, MailPlus, Trash2, Users } from 'lucide-react';

type Role = 'OWNER' | 'EDITOR' | 'VIEWER';

interface Member {
  userId: string;
  email: string;
  name: string | null;
  role: Role;
  isSuperAdmin: boolean;
}

interface Notice {
  kind: 'success' | 'error';
  text: string;
}

const ROLE_LABELS: Record<Role, string> = {
  OWNER: 'Owner',
  EDITOR: 'Editor',
  VIEWER: 'Viewer',
};

/** Mensagens legíveis para os códigos de erro das APIs. */
const ERROR_MESSAGES: Record<string, string> = {
  LAST_OWNER: 'A organização precisa manter pelo menos um OWNER.',
  USER_MEMBERSHIP_EXISTS: 'Este usuário já pertence a outra organização.',
  MEMBER_NOT_FOUND: 'Membro não encontrado nesta organização.',
  no_organization: 'Você não possui organização associada.',
  forbidden: 'Você não tem permissão para gerenciar a equipe.',
  database_disabled:
    'Banco de dados não configurado. Defina DATABASE_URL e rode npm run db:migrate.',
};

/**
 * Gestão de equipe da organização (Fase 3).
 * OWNER e SUPER_ADMIN convidam por e-mail, alteram papéis e removem
 * membros. O servidor é a autoridade: aqui só espelhamos os códigos de erro.
 */
export default function MembrosPage() {
  const { status, data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organization, setOrganization] = useState<{
    id: string;
    name: string;
    slug: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('VIEWER');
  const [inviting, setInviting] = useState(false);

  const canManage =
    session?.user?.role === 'OWNER' || session?.user?.isSuperAdmin === true;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      try {
        const orgRes = await fetch('/api/session/org');
        if (orgRes.ok) {
          const body = await orgRes.json();
          setOrganizationId(body.data.organizationId);
          setOrganization(body.data.organization ?? null);
        }
      } catch {
        // Falha ao carregar contexto não bloqueia a tela de equipe.
      }

      if (!canManage) return;

      const res = await fetch('/api/users');
      if (res.ok) {
        const body = await res.json();
        setMembers(body.data);
        setNotice(null);
      } else {
        const body = await res.json().catch(() => ({}));
        setNotice({
          kind: 'error',
          text:
            ERROR_MESSAGES[body.error] ||
            `Falha ao carregar a equipe (${res.status}).`,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [canManage]);

  useEffect(() => {
    if (status === 'authenticated') {
      void load();
    }
  }, [status, load]);

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;

    setInviting(true);
    setNotice(null);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: inviteRole }),
      });
      const body = await res.json().catch(() => ({}));

      if (res.ok) {
        setNotice({
          kind: 'success',
          text: `${email} adicionado como ${ROLE_LABELS[inviteRole]}.`,
        });
        setInviteEmail('');
        await load();
      } else {
        setNotice({
          kind: 'error',
          text: ERROR_MESSAGES[body.error] || `Falha ao adicionar (${res.status}).`,
        });
      }
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId: string, role: Role) => {
    setNotice(null);
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    const body = await res.json().catch(() => ({}));

    if (res.ok) {
      setNotice({ kind: 'success', text: `Papel atualizado para ${ROLE_LABELS[role]}.` });
      await load();
    } else {
      setNotice({
        kind: 'error',
        text: ERROR_MESSAGES[body.error] || `Falha ao atualizar (${res.status}).`,
      });
    }
  };

  const handleRemove = async (member: Member) => {
    if (!window.confirm(`Remover ${member.email} da organização?`)) return;

    setNotice(null);
    const res = await fetch(`/api/users/${member.userId}`, { method: 'DELETE' });
    const body = await res.json().catch(() => ({}));

    if (res.ok) {
      setNotice({ kind: 'success', text: 'Membro removido.' });
      await load();
    } else {
      setNotice({
        kind: 'error',
        text: ERROR_MESSAGES[body.error] || `Falha ao remover (${res.status}).`,
      });
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando equipe...</p>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="mx-auto max-w-md rounded-card border border-border bg-surface p-8 text-center">
        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-danger" />
        <h1 className="text-lg font-bold text-foreground">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Apenas OWNER e SUPER_ADMIN podem gerenciar a equipe da organização.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-2 animate-in fade-in duration-300">
      {/* Cabeçalho com contexto da organização */}
      <div className="rounded-3xl bg-gradient-to-r from-brand-950 to-brand-900 p-6 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-gold-300" />
          <div className="min-w-0">
            <h1 className="font-serif text-2xl font-extrabold">Equipe</h1>
            <p className="truncate text-xs text-foreground/80">
              {organization
                ? `${organization.name} · ${organization.id}`
                : organizationId ?? 'Sem organização associada'}
            </p>
          </div>
        </div>
      </div>

      {/* Avisos de sucesso/erro */}
      {notice && (
        <div
          className={`flex items-start gap-2 rounded-control border p-3 text-sm ${
            notice.kind === 'success'
              ? 'border-success/40 bg-success/10 text-success'
              : 'border-danger/40 bg-danger/10 text-danger'
          }`}
          role="status"
        >
          {notice.kind === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Convite por e-mail */}
      <form
        onSubmit={handleInvite}
        className="rounded-card border border-border bg-surface p-4 sm:p-6"
      >
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-secondary">
          Adicionar membro
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="email@empresa.com"
            required
            className="flex-1 rounded-control border border-border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as Role)}
            className="rounded-control border border-border bg-muted px-3 py-2.5 text-sm text-foreground"
            aria-label="Papel do novo membro"
          >
            <option value="VIEWER">Viewer</option>
            <option value="EDITOR">Editor</option>
            <option value="OWNER">Owner</option>
          </select>
          <button
            type="submit"
            disabled={inviting || !organizationId}
            className="flex items-center justify-center gap-2 rounded-control bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <MailPlus className="h-4 w-4" />
            {inviting ? 'Adicionando...' : 'Adicionar'}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          O usuário entra de fato ao fazer login com este e-mail (Google).
        </p>
      </form>

      {/* Lista de membros */}
      <div className="rounded-card border border-border bg-surface p-4 sm:p-6">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-secondary">
          Membros ({members.length})
        </h2>

        {members.length === 0 ? (
          <p className="py-6 text-center text-sm italic text-muted-foreground">
            Nenhum membro carregado.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {members.map((member) => (
              <li
                key={member.userId}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {member.name || member.email}
                    {member.isSuperAdmin && (
                      <span className="ml-2 rounded bg-gold-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gold-300">
                        Super
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    onChange={(e) =>
                      handleRoleChange(member.userId, e.target.value as Role)
                    }
                    className="rounded-control border border-border bg-muted px-2 py-1.5 text-xs text-foreground"
                    aria-label={`Papel de ${member.email}`}
                  >
                    <option value="OWNER">Owner</option>
                    <option value="EDITOR">Editor</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemove(member)}
                    aria-label={`Remover ${member.email}`}
                    className="rounded-control border border-border p-2 text-danger hover:bg-danger/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
