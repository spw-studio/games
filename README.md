# Plataforma Gastronômica de Jogos e Aprendizagem 🍽️🧠

Plataforma SaaS multi-empresa de treinamento e capacitação para equipes de restaurantes, baseada em um catálogo de produtos normalizado (`cardapio.json`).

Projetada com arquitetura modular multi-jogos e multi-tenant: cada organização (empresa) possui seus próprios dados, usuários, papéis e configurações, isolados no servidor. Atualmente inclui o **Jogo da Memória Gastronômico**, o **Montar Drink** e o **Caça-Palavras**.

Junto com os jogos, o projeto possui uma camada de identidade persistida em **PostgreSQL** (organizações, usuários e papéis). O banco é opcional em desenvolvimento: sem `DATABASE_URL` a aplicação roda em modo fallback, usando a organização de bootstrap definida em `TENANT_DEFAULT_ORG_ID`.

---

## 1. Descrição do Projeto

A plataforma transforma o cardápio oficial do restaurante na **única fonte de verdade (Single Source of Truth)** para múltiplos jogos de aprendizagem:
- **Treinamento de Salão:** Garçons e atendentes fixam ingredientes, alérgenos, descrições requintadas e detalhes de porções de forma lúdica.
- **Múltiplos Jogos:** A arquitetura desacopla os dados do cardápio, as regras de pontuação, o armazenamento local e as interfaces dos jogos. Novos jogos (como Quiz de Produtos ou Desafio de Preços) podem ser adicionados sem alterar o núcleo da aplicação.
- **Acompanhamento de Desempenho:** Armazenamento local 100% no cliente (`localStorage`) com gráficos de evolução temporal (pontuação, precisão e velocidade) e detecção de recordes pessoais.

---

## 2. Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React Server & Client Components)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/) (Tipagem estrita para produtos, cartas e métricas)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com CSS Variables e tokens semânticos de tema
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Visualização de Dados:** [Recharts](https://recharts.org/) (Gráficos de evolução temporal)
- **Animações e Efeitos:** CSS 3D Transforms (Flip de cartas da memória) e [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Áudio:** [Howler.js](https://howlerjs.com/) com efeitos sonoros gerados em memória e controle global de volume
- **Persistência (cliente):** `localStorage` com abstração à prova de SSR e Hydration Mismatch (perfil, histórico e recordes)
- **Persistência (servidor):** PostgreSQL via [`pg`](https://node-postgres.com/) — organizações, usuários, papéis e memberships (opcional em dev)
- **Autenticação:** NextAuth (v4) com provedor Google, sessão JWT contendo `organizationId` e `role`
- **Autorização:** matriz papel × módulo própria (`src/core/tenancy/permissions.ts`), sem biblioteca externa
- **Validação:** Zod (payloads de API e catálogo normalizado)
- **Multi-tenancy:** `src/core/tenancy/` + `src/middleware.ts` + política única de rotas públicas em `src/core/routes.ts`

---

## 3. Instalação

Clone ou acerte o diretório do projeto e instale as dependências:

```bash
cd Games
npm install
```

---

## 4. Execução em Desenvolvimento

Para iniciar o servidor local de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para utilizar a aplicação.

---

## 5. Login com Google (opcional)

O projeto possui autenticação Google via NextAuth. Para habilitá-la:

1. Crie um projeto no [Google Cloud Console](https://console.cloud.google.com/), configure a tela de consentimento OAuth e crie um cliente OAuth do tipo **Aplicativo da Web**.
2. Em **Origens JavaScript autorizadas**, adicione `http://localhost:3000`.
3. Em **URIs de redirecionamento autorizados**, adicione `http://localhost:3000/api/auth/callback/google`.
4. Copie `.env.example` para `.env.local` e preencha `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `NEXTAUTH_SECRET`.
5. Reinicie o servidor de desenvolvimento.

Em produção, substitua os endereços locais pelo domínio publicado e configure as mesmas variáveis no provedor de hospedagem. A autenticação é opcional para executar os jogos; o histórico de partidas continua armazenado localmente no navegador.

## 6. Build de Produção

Para validar os tipos TypeScript e compilar a versão estática otimizada:

```bash
npm run build
npm run start
```

## 7. Sistema de Temas

O visual utiliza um tema global aplicado no layout raiz e overrides opcionais por jogo. A implementação está em `src/theme/` e usa somente CSS Variables, Tailwind CSS e React.

O fluxo é:

```text
Tema global
  ↓
Override opcional do jogo
  ↓
ThemeProvider
  ↓
Componentes da plataforma e do jogo
```

Os tokens principais incluem `background`, `foreground`, `surface`, `primary`, `secondary`, `border`, `muted`, `success`, `warning`, `danger`, além de radius e sombras.

O registro de jogos pode declarar um tema:

```ts
{
  id: 'memoria',
  nome: 'Jogo da Memória',
  rota: '/jogos/memoria',
  theme: 'memoria'
}
```

Quando `theme` não é informado, o jogo utiliza automaticamente o tema `default`. Um tema específico precisa sobrescrever somente os tokens diferentes do tema global.

## 8. Áudio e Configurações

Os jogos possuem efeitos sonoros para interações, acertos, erros, dicas e conclusão de partida. O áudio é controlado pelo `AudioProvider` e utiliza Howler.js sem arquivos externos de áudio: os efeitos curtos são gerados como tons WAV em memória.

O usuário pode:

- Abrir **Configurações de som** pelo botão de ajustes na barra superior.
- Ativar ou desativar os efeitos sonoros globalmente.
- Ajustar o volume e testar o som pelo painel.
- Usar o botão de volume diretamente no HUD durante uma partida.

As preferências são persistidas no `localStorage` do navegador.

Perfis locais usam `authType: 'local'` e um identificador aleatório. Perfis autenticados pelo Google usam `authType: 'google'` e um identificador estável da conta. O histórico continua local e não é sincronizado entre dispositivos.

## 9. Como Adicionar um Novo Produto

Qualquer novo produto deve ser adicionado **apenas** no arquivo `src/data/cardapio.json`. **Nenhum código React precisa ser alterado.**

Exemplo de inserção no array `cardapio.itens`:

```json
{
  "id": "camarao-taiba",
  "nome": "Camarão Taíba",
  "categoria": "camaroes",
  "descricao": "Camarões flambados com cognac e molho cremoso de queijo emmental com risoto de maçã verde e amêndoas laminadas.",
  "imagem": "/images/cardapio/camarao-taiba.jpg",
  "tags_alimentares": ["Glúten", "Crustáceos", "Lactose"],
  "acompanhamentos": [
    "Risoto de maçã verde",
    "Amêndoas laminadas tostadas"
  ],
  "possui_variacoes": true,
  "variacoes": [
    {
      "codigo": "3095",
      "porcao": "2 Pessoas",
      "detalhe_peso": "240g de Camarão",
      "preco": 218.00
    }
  ]
}
```

> **Importante:**
> - O campo `"categoria"` deve conter o **ID da categoria** (ex: `"camaroes"`), e **não** o nome visual.
> - Preservar todos os campos (`codigo`, `preco`, `variacoes`, `tags_alimentares`, `acompanhamentos`, `porcao`, `detalhe_peso`).
> - Produtos sem descrição válida não serão selecionados pelo Jogo da Memória.

---

## 10. Como Adicionar uma Nova Categoria

Basta adicionar a categoria ao array `cardapio.categorias` em `src/data/cardapio.json`:

```json
{
  "id": "massas",
  "nome": "Massas & Risotos"
}
```

Em seguida, associe `"categoria": "massas"` aos pratos correspondentes.

A nova categoria aparecerá **automaticamente** no seletor do Jogo da Memória e nos filtros da aplicação.

---

## 11. Como Adicionar Imagens dos Pratos

1. Adicione o arquivo de imagem no diretório:
   ```
   public/images/cardapio/nome-do-prato.jpg
   ```
2. No item do `cardapio.json`, configure:
   ```json
   "imagem": "/images/cardapio/nome-do-prato.jpg"
   ```
3. Caso a imagem não exista ou falhe no carregamento, o componente `<ProductImage />` exibe automaticamente um monograma gastronômico requintado com ícone e nome do prato, garantindo que o jogo **nunca quebre**.

---

## 12. Como Adicionar um Novo Jogo

A plataforma foi construída para permitir a inclusão de novos jogos seguindo o princípio Open/Closed:

1. **Defina a rota do jogo:** Crie a pasta e página em `src/app/jogos/[novo-jogo]/page.tsx`.
2. **Crie a lógica do jogo:** Implemente os componentes e a regra de interação em `src/components/games/[novo-jogo]/`.
3. **Crie o motor de pontuação (se aplicável):** Crie `src/lib/scoring/[novo-jogo].ts`.
4. **Cadastre no Game Registry:** Adicione a definição em `src/data/games.ts` ou via `lib/games/registry.ts`:
   ```ts
   {
     id: "quiz-produtos",
     nome: "Quiz de Produtos",
     descricao: "Identifique pratos através de pistas e ingredientes.",
     rota: "/jogos/quiz",
     ativo: true,
     icone: "HelpCircle",
     categoria: "Conhecimento Rápido",
     theme: "default"
   }
   ```
   Use um tema específico somente quando o jogo precisar de uma identidade própria. Nesse caso, adicione apenas os overrides necessários em `src/theme/themes.ts`.
5. **Consuma os produtos:** Em componentes cliente, use `fetchCatalogProducts()`/`fetchCatalogCategories()` de `lib/cardapio/client.ts` (a API aplica autenticação, papel e isolamento de tenant) e opere com as funções puras de `lib/cardapio/pure.ts`. No servidor (Route Handlers/serviços), use `lib/cardapio/service.ts` ou `queries.ts`.
6. **Persista os resultados:** Chame `recordResult(result)` do hook `useGameStorage()`. A Home e a página de Perfil exibirão automaticamente o jogo ativo e suas estatísticas.

---

## 13. Como Funciona o localStorage

A camada de persistência reside centralizada em `src/lib/storage/`:
- `keys.ts`: Chaves centralizadas:
  - `gastronomia_games_player_profile`: Perfil do jogador (`id`, `nome`, datas).
  - `gastronomia_games_history`: Array com as últimas 100 partidas concluídas.
  - `gastronomia_games_records`: Registro de recordes pessoais (pontuação, tempo, precisão).
  - `gastronomia_games_last_result`: Resultado da partida mais recente.
- `storage.ts`: Wrapper seguro com verificação `typeof window !== 'undefined'`, prevenindo erros de execução durante Server-Side Rendering (SSR).

---

## 14. Como Limpar os Dados Locais

Você pode limpar os dados locais de duas formas:
1. **Pela Interface:** Acesse a página **Desempenho** (`/perfil`) e clique no botão **"Zerar Histórico"**.
2. **Pelo Navegador:** Abra o DevTools (`F12`), vá na aba `Application` > `Storage` > `Local Storage` e limpe os registros de `gastronomia_games_*`.

---

## 15. Como Fazer Deploy na Vercel

A aplicação não requer banco de dados externo. Os jogos funcionam sem login, mas o login Google exige as variáveis de ambiente descritas na seção de autenticação.

A área administrativa publicada em produção fica em **https://games-ivory-five.vercel.app/admin/membros** — os requisitos de acesso e as variáveis necessárias estão na seção 17.

1. Faça push do código para o GitHub/GitLab.
2. Acesse [vercel.com](https://vercel.com) e clique em **"Add New Project"**.
3. Importe o repositório.
4. O framework **Next.js** será detectado automaticamente.
5. Clique em **Deploy**. A compilação gerará as rotas estáticas prontas para distribuição global via CDN.
6. Configure as **Environment Variables** do projeto na Vercel: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (domínio publicado) e, para a área administrativa, `DATABASE_URL` e `SUPER_ADMIN_EMAILS` (ver seção 17).

---

## 16. Estrutura de Pastas

```
src/
├── app/
│   ├── globals.css               # Estilos globais Tailwind e classes 3D
│   ├── layout.tsx                # Layout raiz com SEO e AppShell
│   ├── page.tsx                  # Home / Dashboard inicial
│   ├── jogos/
│   │   ├── page.tsx              # Hub com vitrine de jogos
│   │   ├── caca-palavras/
│   │   │   └── page.tsx          # Página do Caça-Palavras
│   │   ├── memoria/
│   │   │   └── page.tsx          # Página do Jogo da Memória
│   │   ├── montar-drink/
│   │   │   └── page.tsx          # Página do Montar Drink
│   │   └── resultado/
│   │       └── page.tsx          # Tela de resultado e novo recorde
│   ├── admin/
│   │   └── membros/
│   │       └── page.tsx          # Gestão de equipe da organização
│   ├── api/
│   │   ├── auth/[...nextauth]/    # Endpoint do NextAuth
│   │   ├── catalog/               # Produtos e categorias (tenant-scoped)
│   │   ├── organizations/         # Lista/criação de organizações (SUPER_ADMIN)
│   │   ├── session/org/           # Contexto de tenant da sessão (org, papel, flags)
│   │   └── users/                 # Membros da organização (convite, papel, remoção)
│   └── perfil/
│       └── page.tsx              # Perfil, gráficos Recharts e histórico
├── components/
│   ├── games/
│   │   │   ├── caca-palavras/    # Configuração, HUD, grade, lista e resultado
│   │   │   ├── memory/           # Tabuleiro, cartas, configuração e HUD
│   │   │   └── montar-drink/     # Configuração, jogo, ingredientes e resultado
│   ├── layout/
│   │   └── AppShell.tsx          # Shell cliente com Navbar e Footer
│   ├── audio/
│   │   ├── AudioProvider.tsx     # Estado global e reprodução via Howler
│   │   ├── AudioSettingsPanel.tsx # Painel global de áudio
│   │   └── GameSoundToggle.tsx   # Toggle de som nos HUDs dos jogos
│   └── ui/
│       ├── Navbar.tsx            # Cabeçalho com marca e identificação
│       ├── PlayerModal.tsx       # Modal de boas-vindas / edição de nome
│       └── ProductImage.tsx      # Fallback elegante de imagens
├── config/
│   └── game-config.ts            # Parâmetros e limites globais
├── core/
│   ├── routes.ts                 # Política de rotas públicas (server + client)
│   └── tenancy/                  # Organization, TenantContext, papéis e permissões
├── data/
│   ├── cardapio.json             # Catálogo normalizado (Fonte de Verdade)
│   └── games.ts                  # Definições centrais de jogos
├── theme/
│   ├── ThemeProvider.tsx          # Injeta tokens CSS do tema ativo
│   ├── resolve-theme.ts           # Combina tema global e override do jogo
│   ├── themes.ts                  # Tokens globais e overrides
│   └── types.ts                   # Tipos dos tokens de tema
├── hooks/
│   ├── useGameStorage.ts         # Hook reativo para histórico e recordes
│   ├── useGameTimer.ts           # Cronômetro seguro com cleanup
│   └── usePlayer.ts              # Perfil do jogador e gatilho de modal
├── lib/
│   ├── cardapio/
│   │   ├── adapter.ts            # Normalizador Raw→Product (server-only)
│   │   ├── queries.ts            # Consultas ao JSON (server-only)
│   │   ├── service.ts            # Serviço com autorização + escopo de tenant
│   │   ├── client.ts             # Cliente HTTP do catálogo (client-only)
│   │   └── pure.ts               # Funções puras compartilhadas (client-safe)
│   ├── games/
│   │   ├── drinkAssembly.ts      # Regras do Montar Drink
│   │   ├── registry.ts           # Registro dinâmico de jogos
│   │   └── word-search-engine.ts # Motor do Caça-Palavras
│   ├── scoring/
│   │   └── memory.ts             # Motor matemático de pontuação
│   ├── statistics/
│   │   └── calculations.ts       # Agregações e séries temporais Recharts
│   ├── storage/
│   │   ├── history.ts            # Persistência de histórico
│   │   ├── keys.ts               # Constantes de chaves
│   │   ├── player.ts             # Persistência de perfil
│   │   ├── records.ts            # Recordes pessoais
│   │   └── storage.ts            # Wrapper SSR-safe
│   └── utils/
│       └── shuffle.ts            # Fisher-Yates shuffle
└── types/
    ├── cardapio.ts               # Tipos Category, Product, CardapioRaw
    ├── game.ts                   # Tipos GameResult, MemoryCard, etc.
    ├── next-auth.d.ts            # Sessão NextAuth com organizationId + role
    ├── player.ts                 # Tipos PlayerProfile
    └── statistics.ts             # Tipos de estatísticas e séries Recharts
public/
└── images/
  ├── bg/                       # Padrões e fundos da plataforma
  └── cardapio/                 # Fotos dos pratos e drinks
migrations/
└── 001_identity.sql            # Organizations, users e organization_members (Fase 3)
scripts/
├── db-migrate.mjs              # Migrador SQL idempotente (npm run db:migrate)
├── db-seed.mjs                 # Cria a organização padrão e vincula OWNER (npm run db:seed)
└── setup-images.mjs            # Utilitário de preparação de imagens
```

---

## 17. Como Acessar a Página de Admin

A administração da plataforma fica em **`/admin/membros`** (gestão de equipe da organização). Não existe página na raiz `admin`, portanto `/admin` isolado responde **404**.

| Ambiente | URL |
|---|---|
| Local | http://localhost:3000/admin/membros |
| Produção (Vercel) | https://games-ivory-five.vercel.app/admin/membros |

### Quem pode acessar

A tela é restrita a **`OWNER`** e **`SUPER_ADMIN`**:

| Camada | Regra | Arquivo |
|---|---|---|
| Middleware | Exige sessão — `/admin/*` não é rota pública | `src/middleware.ts`, `src/core/routes.ts` |
| Página | `session.user.role === 'OWNER'` ou `session.user.isSuperAdmin === true`; caso contrário exibe "Acesso restrito" | `src/app/admin/membros/page.tsx` |
| API | `requirePermission(ctx, 'ADMIN', 'read'/'write')` sobre a matriz papel × módulo | `src/app/api/users/route.ts`, `src/core/tenancy/permissions.ts` |

Existem dois caminhos para chegar à tela:

1. **Direto pela URL** — `/admin/membros`.
2. **Pela interface** — clique no **avatar** na barra superior e depois em **"Equipe"**; o item só é exibido para OWNER/SUPER_ADMIN.

### Pré-requisitos e modos de execução

| Cenário | `DATABASE_URL` | Papel na sessão | Resultado |
|---|---|---|---|
| Fallback (padrão em dev) | não definido | todo login recebe `org-default` + `OWNER` | A página abre, mas `GET /api/users` responde **503 `database_disabled`** e a lista de membros não carrega |
| Banco ativo + usuário convidado | definido | lido de `organization_members` | Fluxo completo: listar, convidar, alterar papel e remover |
| Banco ativo + usuário sem membership | definido | `undefined` | **"Acesso restrito"** |
| `SUPER_ADMIN_EMAILS` preenchido | qualquer | `SUPER_ADMIN` (plataforma) | Abre a tela; sem membership mostra "Sem organização associada" e as ações de membro retornam `no_organization` |

### Habilitando a área de admin com banco de dados

1. Adicione as variáveis em `.env.local` (e nas **Environment Variables** do projeto na Vercel):
   ```bash
   DATABASE_URL=postgres://usuario:senha@host:5432/banco
   TENANT_DEFAULT_ORG_ID=org-default            # opcional (padrão: org-default)
   TENANT_DEFAULT_ORG_NAME=Organização Padrão   # opcional
   SUPER_ADMIN_EMAILS=seu-email@gmail.com       # opcional — papel de plataforma
   ```
2. Aplique as migrações e o seed:
   ```bash
   npm run db:migrate                        # aplica migrations/001_identity.sql
   npm run db:seed -- seu-email@gmail.com    # cria a organização padrão e vincula o e-mail como OWNER
   ```
3. Reinicie o servidor (`npm run dev`) e faça login com o **mesmo e-mail** cadastrado no seed.
4. Acesse `http://localhost:3000/admin/membros`.

> SUPER_ADMIN opera qualquer organização: as APIs `GET/POST /api/organizations` e `GET /api/users?organizationId=...` existem para esse papel (hoje sem interface própria — uso via API).

### APIs usadas pela tela

| Método | Rota | Função |
|---|---|---|
| GET | `/api/session/org` | Contexto de tenant da sessão (organização, papel, `isSuperAdmin`) |
| GET | `/api/users` | Lista os membros da organização (`organizationId` opcional para SUPER_ADMIN) |
| POST | `/api/users` | Convida/adiciona membro por e-mail com papel OWNER, EDITOR ou VIEWER |
| PATCH | `/api/users/[id]` | Altera o papel do membro |
| DELETE | `/api/users/[id]` | Remove o membro da organização |
| GET/POST | `/api/organizations` | Lista/cria organizações (apenas SUPER_ADMIN) |

### Solução de problemas

| Sintoma | Causa provável | Como resolver |
|---|---|---|
| Redireciona para `/jogos?authRequired=1` | Sem sessão ativa | Faça login com Google e navegue novamente para `/admin/membros` (o modal de login retorna para `/jogos`) |
| "Acesso restrito" | Papel diferente de OWNER e sem `isSuperAdmin` | Rode `npm run db:seed -- seu-email@gmail.com` ou inclua o e-mail em `SUPER_ADMIN_EMAILS` |
| "Banco de dados não configurado..." | `DATABASE_URL` vazio (modo fallback) | Defina `DATABASE_URL` e rode `npm run db:migrate` |
| Erro `no_organization` (403) | SUPER_ADMIN sem membership na organização alvo | Informe `organizationId` no payload (permitido apenas a SUPER_ADMIN) ou vincule o usuário a uma organização |
| 404 em `/admin` | Não existe página na raiz de `admin` | Use `/admin/membros` |

---

## Apêndice A. Multi-tenancy & API interna (Fase 2)

A plataforma foi preparada para operar como SaaS multi-empresa **sem alterar o `package.json`** (nenhuma dependência foi instalada, removida ou alterada).

### Conceitos e papéis

| Conceito | Arquivo | Papel na arquitetura |
|---|---|---|
| `Organization` / `organizationId` | `src/core/tenancy/types.ts` | Convenção de nomenclatura de toda entidade de empresa |
| `TenantContext` | `src/core/tenancy/context.ts` | Resolvido **no servidor** a partir da sessão — nunca aceito do cliente |
| `Role` | `OWNER`, `EDITOR`, `VIEWER` | Matriz papel × módulo em `src/core/tenancy/permissions.ts` |
| Módulos | `CARDAPIO`, `JOGOS`, `ADMIN` | Permissões `read`/`write` por papel |

### Regras de isolamento

1. O `organizationId` entra no JWT pelo callback `jwt` de `src/lib/auth.ts` (bootstrap: `TENANT_DEFAULT_ORG_ID`; com `DATABASE_URL` ativo, o callback `session` resolve a membership real em `organization_members`).
2. Toda rota de API resolve o tenant com `getTenantContext()` — `401` sem sessão, `403` sem papel.
3. `Product` e `Category` carregam `organizationId`; o serviço (`lib/cardapio/service.ts`) filtra por ele antes de responder.
4. Componentes cliente **nunca** importam `cardapio.json` — consomem `lib/cardapio/client.ts` (HTTP) e `lib/cardapio/pure.ts` (funções puras). O JSON é importado apenas por `lib/cardapio/adapter.ts` (server-only).

### Endpoints

| Método | Rota | Requisito |
|---|---|---|
| GET | `/api/catalog/products?categoryId=` | sessão + leitura em `CARDAPIO` |
| GET | `/api/catalog/categories` | sessão + leitura em `CARDAPIO` |

### Variáveis de ambiente (`.env.example`)

- `TENANT_DEFAULT_ORG_ID` — organização de bootstrap (padrão `org-default`).
- `AUTH_EMAIL_ALLOWLIST` — lista branca opcional de e-mails, separados por vírgula (vazio = comportamento histórico).

### Endpoints de identidade (Fase 3)

Além do catálogo, a camada de identidade expõe as rotas usadas pela administração — requisitos e detalhes na **seção 17**:

| Método | Rota | Requisito |
|---|---|---|
| GET | `/api/session/org` | sessão |
| GET | `/api/users?organizationId=` | sessão + `ADMIN:read` (`organizationId` apenas para SUPER_ADMIN) |
| POST | `/api/users` | sessão + `ADMIN:write` |
| PATCH/DELETE | `/api/users/[id]` | sessão + `ADMIN:write` |
| GET/POST | `/api/organizations` | sessão (criação apenas para SUPER_ADMIN) |

### Próximos passos (ainda não implementados)

> A persistência de identidade em PostgreSQL (`organizations`, `users`, `organization_members`) já está implementada — ver seção 17.

- `GET/POST /api/results` — histórico de partidas por empresa (hoje: `localStorage`).
- `GET /api/games` — módulos contratados por organização (entitlements).
- Troca JSON → PostgreSQL alterando apenas `lib/cardapio/queries.ts`; as camadas `service` e UI permanecem inalteradas.
