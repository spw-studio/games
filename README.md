# Plataforma Gastronômica de Jogos e Aprendizagem 🍽️🧠

Plataforma web completa de treinamento e capacitação para equipes de restaurantes, baseada em um catálogo de produtos normalizado (`cardapio.json`).

Projetada com uma arquitetura modular multi-jogos e independente de banco de dados externo, iniciando com o **Jogo da Memória Gastronômico** (associação entre a foto do prato e sua descrição detalhada).

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
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com paleta gastronômica nobre (`#44100D` como cor primária e acentos dourados)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Visualização de Dados:** [Recharts](https://recharts.org/) (Gráficos de evolução temporal)
- **Animações e Efeitos:** CSS 3D Transforms (Flip de cartas da memória) e [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Persistência:** `localStorage` com abstração à prova de SSR e Hydration Mismatch

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

## 5. Build de Produção

Para validar os tipos TypeScript e compilar a versão estática otimizada:

```bash
npm run build
npm run start
```

---

## 6. Como Adicionar um Novo Produto

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

## 7. Como Adicionar uma Nova Categoria

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

## 8. Como Adicionar Imagens dos Pratos

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

## 9. Como Adicionar um Novo Jogo

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
     categoria: "Conhecimento Rápido"
   }
   ```
5. **Consuma os produtos:** Use `getAllProducts()` ou `getProductsByCategory()` de `lib/cardapio/queries.ts`.
6. **Persista os resultados:** Chame `recordResult(result)` do hook `useGameStorage()`. A Home e a página de Perfil exibirão automaticamente o jogo ativo e suas estatísticas.

---

## 10. Como Funciona o localStorage

A camada de persistência reside centralizada em `src/lib/storage/`:
- `keys.ts`: Chaves centralizadas:
  - `gastronomia_games_player_profile`: Perfil do jogador (`id`, `nome`, datas).
  - `gastronomia_games_history`: Array com as últimas 100 partidas concluídas.
  - `gastronomia_games_records`: Registro de recordes pessoais (pontuação, tempo, precisão).
  - `gastronomia_games_last_result`: Resultado da partida mais recente.
- `storage.ts`: Wrapper seguro com verificação `typeof window !== 'undefined'`, prevenindo erros de execução durante Server-Side Rendering (SSR).

---

## 11. Como Limpar os Dados Locais

Você pode limpar os dados locais de duas formas:
1. **Pela Interface:** Acesse a página **Desempenho** (`/perfil`) e clique no botão **"Zerar Histórico"**.
2. **Pelo Navegador:** Abra o DevTools (`F12`), vá na aba `Application` > `Storage` > `Local Storage` e limpe os registros de `gastronomia_games_*`.

---

## 12. Como Fazer Deploy na Vercel

A aplicação não requer variáveis de ambiente obrigatórias, nem banco de dados externo, operando de forma 100% autônoma no frontend.

1. Faça push do código para o GitHub/GitLab.
2. Acesse [vercel.com](https://vercel.com) e clique em **"Add New Project"**.
3. Importe o repositório.
4. O framework **Next.js** será detectado automaticamente.
5. Clique em **Deploy**. A compilação gerará as rotas estáticas prontas para distribuição global via CDN.

---

## 13. Estrutura de Pastas

```
src/
├── app/
│   ├── globals.css               # Estilos globais Tailwind e classes 3D
│   ├── layout.tsx                # Layout raiz com SEO e AppShell
│   ├── page.tsx                  # Home / Dashboard inicial
│   ├── jogos/
│   │   ├── page.tsx              # Hub com vitrine de jogos
│   │   ├── memoria/
│   │   │   └── page.tsx          # Página do Jogo da Memória
│   │   └── resultado/
│   │       └── page.tsx          # Tela de resultado e novo recorde
│   └── perfil/
│       └── page.tsx              # Perfil, 3 gráficos Recharts e histórico
├── components/
│   ├── games/
│   │   └── memory/
│   │       ├── MemoryBoard.tsx   # Motor do jogo e grid responsivo
│   │       ├── MemoryCard.tsx    # Carta com animação flip 3D e ARIA
│   │       ├── MemoryConfig.tsx  # Configuração com categorias dinâmicas
│   │       └── MemoryHUD.tsx     # HUD em tempo real (pontos, pares, tempo)
│   ├── layout/
│   │   └── AppShell.tsx          # Shell cliente com Navbar e Footer
│   └── ui/
│       ├── Navbar.tsx            # Cabeçalho com marca e identificação
│       ├── PlayerModal.tsx       # Modal de boas-vindas / edição de nome
│       └── ProductImage.tsx      # Fallback elegante de imagens
├── config/
│   └── game-config.ts            # Parâmetros e limites globais
├── data/
│   ├── cardapio.json             # Catálogo normalizado (Fonte de Verdade)
│   └── games.ts                  # Definições centrais de jogos
├── hooks/
│   ├── useGameStorage.ts         # Hook reativo para histórico e recordes
│   ├── useGameTimer.ts           # Cronômetro seguro com cleanup
│   └── usePlayer.ts              # Perfil do jogador e gatilho de modal
├── lib/
│   ├── cardapio/
│   │   ├── adapter.ts            # Normalizador de dados brutos
│   │   └── queries.ts            # Consultas (getAllProducts, etc.)
│   ├── games/
│   │   └── registry.ts           # Registro dinâmico de jogos
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
    └── cardapio/                 # Diretório de fotos dos pratos
```
