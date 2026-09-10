import { GameDefinition } from '@/types/game';

export const REGISTERED_GAMES: GameDefinition[] = [
  {
    id: 'memoria',
    nome: 'Jogo da Memória',
    descricao: 'Associe cada prato à sua descrição gastronômica detalhada.',
    rota: '/jogos/memoria',
    ativo: true,
    dificuldadePadrao: 'medio',
    icone: 'Brain',
    categoria: 'Cardápio & Memória',
  },
  {
    id: 'quiz-produtos',
    nome: 'Quiz de Produtos',
    descricao: 'Identifique pratos através de pistas, ingredientes e códigos.',
    rota: '/jogos/quiz',
    ativo: false,
    dificuldadePadrao: 'medio',
    icone: 'HelpCircle',
    categoria: 'Conhecimento Rápido',
  },
  {
    id: 'desafio-precos',
    nome: 'Desafio de Preços e Porções',
    descricao: 'Adivinhe os valores e as gramaturas das porções para 2 e 4 pessoas.',
    rota: '/jogos/precos',
    ativo: false,
    dificuldadePadrao: 'dificil',
    icone: 'BadgeDollarSign',
    categoria: 'Operação & Salão',
  },
  {
    id: 'associacao-ingredientes',
    nome: 'Associação de Ingredientes',
    descricao: 'Conecte cada receita aos seus alérgenos e ingredientes nobres.',
    rota: '/jogos/ingredientes',
    ativo: false,
    dificuldadePadrao: 'medio',
    icone: 'Utensils',
    categoria: 'Segurança Alimentar',
  },
];
