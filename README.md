# Plataforma Gastronômica de Jogos e Aprendizagem 🍽️🧠

Plataforma web completa de treinamento e capacitação para equipes de restaurantes, baseada em um catálogo de produtos normalizado (`cardapio.json`).

Projetada com uma arquitetura modular multi-jogos e independente de banco de dados externo. Atualmente inclui o **Jogo da Memória Gastronômico**, o **Montar Drink** e o **Caça-Palavras**.

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
- **Persistência:** `localStorage` com abstração à prova de SSR e Hydration Mismatch
- **Autenticação opcional:** NextAuth com provedor Google
- **Validação:** Zod

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

## 9. Como Adicionar um Novo Produto

Qualquer novo produto deve ser adicionado **apenas** no arquivo `src/data/cardapio.json`. **Nenhum código React precisa ser alterado.**

Exemplo de inserção no array `cardapio.itens`:

```json
{
  "id_prato": "camarao-taiba",
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
5. **Consuma os produtos:** Use `getAllProducts()` ou `getProductsByCategory()` de `lib/cardapio/queries.ts`.
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

1. Faça push do código para o GitHub/GitLab.
2. Acesse [vercel.com](https://vercel.com) e clique em **"Add New Project"**.
3. Importe o repositório.
4. O framework **Next.js** será detectado automaticamente.
5. Clique em **Deploy**. A compilação gerará as rotas estáticas prontas para distribuição global via CDN.

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
│   ├── api/
│   │   └── auth/[...nextauth]/    # Endpoint do NextAuth
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
│   │   ├── adapter.ts            # Normalizador de dados brutos
│   │   └── queries.ts            # Consultas (getAllProducts, etc.)
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
    ├── player.ts                 # Tipos PlayerProfile
    └── statistics.ts             # Tipos de estatísticas e séries Recharts
public/
└── images/
  ├── bg/                       # Padrões e fundos da plataforma
  └── cardapio/                 # Fotos dos pratos e drinks
```
