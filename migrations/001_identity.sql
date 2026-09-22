-- Fase 3: identidade persistida (organizações, usuários e memberships)
-- Convenção: toda entidade de empresa usa `organization_id` como âncora de isolamento.

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  image TEXT,
  -- SUPER_ADMIN de plataforma (gerencia organizações); papéis de conteúdo ficam em organization_members
  is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Papel DENTRO da organização: OWNER | EDITOR | VIEWER
  role TEXT NOT NULL CHECK (role IN ('OWNER', 'EDITOR', 'VIEWER')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fase 3 (v1): um usuário pertence a uma organização por vez.
-- Índice único deliberado para o piloto; remover para suportar multi-org por usuário.
CREATE UNIQUE INDEX IF NOT EXISTS organization_members_user_id_key
  ON organization_members (user_id);

CREATE INDEX IF NOT EXISTS organization_members_organization_id_idx
  ON organization_members (organization_id);

CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
