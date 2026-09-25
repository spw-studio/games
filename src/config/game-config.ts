import { GameDifficulty } from '@/types/game';

export const GAME_CONFIG = {
  DEFAULT_DIFFICULTY: 'medio' as GameDifficulty,
  DEFAULT_PRODUCT_COUNT: 6,
  AVAILABLE_PAIR_COUNTS: [4, 6, 8, 10, 12],
  MAX_HISTORY: 100,
  MEMORY_CARD_DELAY: 800, // milissegundos para esconder cartas após erro
  ANIMATION_DURATION: 300, // ms da animação flip
  /**
   * Configuração do Caça-Palavras (distratores e formas de grade).
   * Mantida aqui — e não como literais dentro do hook — para que os
   * parâmetros de jogo vivam no módulo de configuração compartilhado.
   */
  WORD_SEARCH: {
    GRID_SIZE: { facil: 12, medio: 15, dificil: 18 } as Record<GameDifficulty, number>,
    DISTRACTOR_COUNT: { facil: 0, medio: 2, dificil: 4 } as Record<GameDifficulty, number>,
    /** Palavras distratorias temáticas (fora do catálogo) para encher a grade. */
    DISTRACTORS: [
      'ABSINTO', 'COINTREAU', 'ANGOSTURA', 'MENTA', 'CURAÇAO',
      'CHAMPANHE', 'VINHO', 'CERVEJA', 'UÍSQUE', 'BRANDY',
    ] as readonly string[],
  },
  /**
   * Configuração do Quiz de Produtos ("Conhecimento Rápido").
   * Centraliza alternativas por pergunta, tempo de resposta e pesos de
   * pontuação — nenhum componente deve declarar esses números diretamente.
   */
  QUIZ: {
    /** Alternativas por pergunta (1 correta + distratores reais do catálogo). */
    OPTION_COUNT: { facil: 3, medio: 4, dificil: 5 } as Record<GameDifficulty, number>,
    /** Tempo máximo de resposta por pergunta, em segundos. */
    TIME_PER_QUESTION: { facil: 30, medio: 20, dificil: 15 } as Record<GameDifficulty, number>,
    /** Quantidades de perguntas oferecidas na tela de configuração. */
    QUESTION_COUNTS: [5, 10, 15] as readonly number[],
    DEFAULT_QUESTION_COUNT: 10,
    /** Máximo de itens auxiliares (ingredientes/acompanhamentos) exibidos na pista. */
    MAX_CLUE_ITEMS: 6,
    /** Intervalo entre a resposta e o avanço automático para a próxima pista. */
    FEEDBACK_DELAY_MS: 1800,
    /** Pontuação base por acerto. */
    POINTS_PER_CORRECT: 120,
    /** Penalidade por erro ou por tempo esgotado. */
    PENALTY_PER_MISS: 40,
    /** Bônus por sequência de acertos. */
    STREAK_BONUS_POINTS: 60,
    STREAK_BONUS_EVERY: 3,
    /** Tempo de referência por pergunta para o bônus de rapidez (segundos). */
    TARGET_SECONDS_PER_QUESTION: 20,
    SPEED_BONUS_FACTOR: 8,
  },
  SCORING: {
    BASE_MATCH_POINTS: 100,
    ERROR_PENALTY: 50,
    DIFFICULTY_MULTIPLIERS: {
      facil: 1.0,
      medio: 1.5,
      dificil: 2.0,
    } as Record<GameDifficulty, number>,
    STREAK_BONUSES: [
      { minStreak: 5, bonus: 100 },
      { minStreak: 4, bonus: 75 },
      { minStreak: 3, bonus: 50 },
      { minStreak: 2, bonus: 25 },
      { minStreak: 1, bonus: 0 },
    ],
    // Parâmetro de velocidade: tempo de referência por par (segundos)
    TARGET_SECONDS_PER_PAIR: 8,
  },
  /**
   * Configuração do Base Master ("drink → bebida de base").
   * Números do jogo vivem aqui; pontos por acerto, bônus de combo e
   * multiplicador de dificuldade são reaproveitados de `SCORING`.
   */
  BASE_MASTER: {
    /** Alternativas por pergunta, por dificuldade (1 correta + bases reais). */
    OPTION_COUNT: { facil: 3, medio: 4, dificil: 5 } as Record<GameDifficulty, number>,
    /** Quantidades de perguntas oferecidas em Treinar/Desafio. */
    QUESTION_COUNTS: [5, 10, 15, 20] as readonly number[],
    DEFAULT_QUESTION_COUNT: 10,
    /** Cronômetro por pergunta no Desafio (0 = sem limite) — configurável na UI. */
    CHALLENGE_SECONDS_OPTIONS: [0, 8, 12, 20] as readonly number[],
    /** Cronômetro padrão sugerido por dificuldade. */
    CHALLENGE_SECONDS: { facil: 20, medio: 12, dificil: 8 } as Record<GameDifficulty, number>,
    DEFAULT_CHALLENGE_SECONDS: 12,
    /** Bônus de rapidez: teto de pontos concedidos pelo tempo restante. */
    MAX_SPEED_BONUS: 50,
    /**
     * Repetição espaçada: pesos que priorizam drinks nunca vistos e com mais
     * erros nas rodadas seguintes (memória de aprendizado local).
     */
    SPACED_REPETITION: {
      NEVER_SEEN_WEIGHT: 4,
      MIN_WEIGHT: 0.2,
      ERROR_RATE_WEIGHT: 2,
      MASTERY_STEP: 0.1,
    },
    /** Intervalo entre a resposta e o avanço automático para o próximo drink. */
    FEEDBACK_DELAY_MS: 1200,
    /**
     * Vocabulário controlado das bebidas de base usadas para resolver
     * `ingrediente → bebida de base`. É apenas o léxico de destilados/vinhos
     * (não contém dados de drinks): `name` é o rótulo canônico exibido e
     * `aliases` são as formas que aparecem nos ingredientes do catálogo.
     * A comparação ignora caixa/acentos e exige palavra inteira.
     */
    SPIRITS: [
      { name: 'Rum', aliases: ['rum', 'rum branco', 'rum ouro', 'rum prata', 'rum escuro', 'rum envelhecido', 'rum carta ouro'] },
      { name: 'Gin', aliases: ['gin', 'gim', 'gin premium', 'gin london dry'] },
      { name: 'Vodka', aliases: ['vodka', 'vodca'] },
      { name: 'Cachaça', aliases: ['cachaça', 'cachaca', 'pinga', 'aguardente de cana'] },
      { name: 'Tequila', aliases: ['tequila', 'tequila prata', 'tequila ouro', 'tequila reposado'] },
      { name: 'Whisky', aliases: ['whisky', 'whiskey', 'uísque', 'uisque'] },
      { name: 'Espumante', aliases: ['espumante', 'prosecco', 'champanhe', 'champagne', 'cava'] },
      { name: 'Vinho', aliases: ['vinho', 'vinho tinto', 'vinho branco', 'vinho rosé'] },
      { name: 'Conhaque', aliases: ['conhaque', 'cognac', 'brandy'] },
      { name: 'Sake', aliases: ['sake', 'saquê', 'saque'] },
    ] as readonly { name: string; aliases: readonly string[] }[],
  },
} as const;
