'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAudio } from '@/components/audio/AudioProvider';
import { GAME_CONFIG } from '@/config/game-config';
import { Category, Product } from '@/types/cardapio';
import { GameResult } from '@/types/game';
import { QuizAnswerRecord, QuizConfigState, QuizMetrics, QuizQuestion } from '@/types/quiz';
import { fetchCatalogCategories, fetchCatalogProducts } from '@/lib/cardapio/client';
import { buildQuizQuestions, filterQuizEligibleProducts, isAnswerCorrect } from '@/lib/games/quiz';
import { buildQuizMetrics, calculateQuizAccuracy, calculateQuizScore } from '@/lib/scoring/quiz';
import { formatTimeMMSS } from '@/lib/statistics/calculations';
import { useGameStorage } from './useGameStorage';
import { usePlayer } from './usePlayer';

/** Identificador do jogo salvo em `localStorage` (histórico, recordes e perfil). */
export const QUIZ_GAME_ID = 'quiz-produtos';

/** Valor de categoria que representa "todas as categorias do catálogo". */
export const QUIZ_ALL_CATEGORIES = 'todas';

const QUIZ = GAME_CONFIG.QUIZ;

type QuizPhase = 'config' | 'playing' | 'result';

function countAnswers(answers: QuizAnswerRecord[]) {
  return {
    correct: answers.filter((answer) => answer.isCorrect).length,
    incorrect: answers.filter((answer) => !answer.isCorrect && !answer.timedOut).length,
    timedOut: answers.filter((answer) => answer.timedOut).length,
  };
}

/**
 * Orquestra o "Conhecimento Rápido — Quiz de Produtos":
 * catálogo → geração de perguntas → respostas → métricas/recordes.
 *
 * Todas as regras vivem em `lib/games/quiz` e `lib/scoring/quiz`; o hook apenas
 * controla o fluxo de telas e o tempo.
 */
export function useProductQuiz() {
  const { player } = usePlayer();
  const { recordResult } = useGameStorage();
  const { play } = useAudio();

  const [phase, setPhase] = useState<QuizPhase>('config');
  const [config, setConfig] = useState<QuizConfigState>({
    questionCount: QUIZ.DEFAULT_QUESTION_COUNT,
    difficulty: GAME_CONFIG.DEFAULT_DIFFICULTY,
    category: QUIZ_ALL_CATEGORIES,
    timePerQuestion: QUIZ.TIME_PER_QUESTION[GAME_CONFIG.DEFAULT_DIFFICULTY],
  });

  // Catálogo carregado via API (escopo de tenant aplicado no servidor)
  const [catalogProducts, setCatalogProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetchCatalogProducts()
      .then((products) => {
        if (!cancelled) setCatalogProducts(products);
      })
      .catch(() => {
        // Catálogo indisponível: a configuração exibe o estado vazio controlado.
        if (!cancelled) setCatalogProducts([]);
      });

    fetchCatalogCategories()
      .then((list) => {
        if (!cancelled) setCategories(list);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const products = useMemo(() => catalogProducts ?? [], [catalogProducts]);

  /** Produtos elegíveis por categoria — usado pela tela de configuração. */
  const eligibleCountByCategory = useMemo(() => {
    const map: Record<string, number> = {
      [QUIZ_ALL_CATEGORIES]: filterQuizEligibleProducts(products).length,
    };

    for (const category of categories) {
      map[category.id] = filterQuizEligibleProducts(products, category.id).length;
    }

    return map;
  }, [products, categories]);

  // ---- Sessão em andamento ----
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswerRecord[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finalMetrics, setFinalMetrics] = useState<QuizMetrics | null>(null);

  const sessionStartedAtRef = useRef(0);
  const questionStartedAtRef = useRef(0);
  // Trava contra respostas duplicadas (clique repetido + tempo esgotado).
  const hasAnsweredRef = useRef(false);

  const currentQuestion = questions[currentIndex] ?? null;
  const totalQuestions = questions.length;
  const hasTimeLimit = config.timePerQuestion > 0;
  const { correct: correctAnswers, incorrect: incorrectAnswers } = useMemo(
    () => countAnswers(answers),
    [answers]
  );

  const computeScore = useCallback(
    (records: QuizAnswerRecord[], durationSeconds: number, streakValue: number) => {
      const { correct, incorrect, timedOut } = countAnswers(records);

      return calculateQuizScore({
        correctAnswers: correct,
        incorrectAnswers: incorrect,
        timedOutAnswers: timedOut,
        bestStreak: streakValue,
        elapsedSeconds: durationSeconds,
        answeredQuestions: records.length,
        difficulty: config.difficulty,
      }).finalScore;
    },
    [config.difficulty]
  );

  /** Encerra a sessão, consolida as métricas, pontua e persiste o resultado. */
  const finishSession = useCallback(
    (records: QuizAnswerRecord[], streakValue: number) => {
      const durationSeconds = Math.max(
        1,
        Math.round((Date.now() - sessionStartedAtRef.current) / 1000)
      );
      const { correct, incorrect, timedOut } = countAnswers(records);
      const accuracy = calculateQuizAccuracy(correct, totalQuestions);
      const finalScore = computeScore(records, durationSeconds, streakValue);

      const metrics = buildQuizMetrics({
        totalQuestions,
        correctAnswers: correct,
        incorrectAnswers: incorrect,
        timedOutAnswers: timedOut,
        bestStreak: streakValue,
        durationSeconds,
      });

      setFinalMetrics(metrics);
      setScore(finalScore);
      setPhase('result');

      if (records.length > 0) {
        const result: GameResult<QuizMetrics> = {
          id: `quiz_${Date.now()}`,
          gameId: QUIZ_GAME_ID,
          playerId: player?.id || 'local-player',
          score: finalScore,
          accuracy,
          durationSeconds,
          difficulty: config.difficulty,
          category: config.category,
          playedAt: new Date().toISOString(),
          metrics,
        };

        recordResult(result);
      }
    },
    [
      computeScore,
      config.category,
      config.difficulty,
      player?.id,
      recordResult,
      totalQuestions,
    ]
  );

  /** Registra a resposta (ou o tempo esgotado) da pergunta atual. */
  const registerAnswer = useCallback(
    (optionId: string | null) => {
      if (phase !== 'playing' || !currentQuestion || hasAnsweredRef.current) return;

      hasAnsweredRef.current = true;

      const isCorrect = isAnswerCorrect(currentQuestion, optionId);
      const record: QuizAnswerRecord = {
        questionId: currentQuestion.id,
        correctProductId: currentQuestion.correctProductId,
        correctProductName: currentQuestion.correctProductName,
        selectedOptionId: optionId,
        isCorrect,
        timedOut: optionId === null,
        answeredInSeconds: Math.max(
          0,
          Math.round((Date.now() - questionStartedAtRef.current) / 1000)
        ),
        clueType: currentQuestion.clueType,
      };

      const nextAnswers = [...answers, record];
      const nextStreak = isCorrect ? streak + 1 : 0;
      const nextBestStreak = Math.max(bestStreak, nextStreak);

      setAnswers(nextAnswers);
      setSelectedOptionId(optionId);
      setIsAnswered(true);
      setStreak(nextStreak);
      setBestStreak(nextBestStreak);
      setScore(computeScore(nextAnswers, elapsedSeconds, nextBestStreak));
      play(isCorrect ? 'success' : 'error');
    },
    [
      answers,
      bestStreak,
      computeScore,
      currentQuestion,
      elapsedSeconds,
      phase,
      play,
      streak,
    ]
  );

  /** Avança para a próxima pista ou encerra a partida. */
  const advance = useCallback(() => {
    if (!isAnswered) return;

    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalQuestions) {
      finishSession(answers, bestStreak);
      return;
    }

    hasAnsweredRef.current = false;
    setCurrentIndex(nextIndex);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setSecondsLeft(config.timePerQuestion);
    questionStartedAtRef.current = Date.now();
  }, [
    answers,
    bestStreak,
    config.timePerQuestion,
    currentIndex,
    finishSession,
    isAnswered,
    totalQuestions,
  ]);

  // Cronômetro: tempo total da partida + contagem regressiva da pergunta.
  useEffect(() => {
    if (phase !== 'playing' || isAnswered) return;

    const interval = window.setInterval(() => {
      setElapsedSeconds((previous) => previous + 1);
      if (hasTimeLimit) {
        setSecondsLeft((previous) => Math.max(0, previous - 1));
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [phase, isAnswered, hasTimeLimit]);

  // Tempo esgotado: contabiliza a pergunta sem resposta e segue o fluxo normal.
  useEffect(() => {
    if (phase !== 'playing' || isAnswered || !hasTimeLimit || secondsLeft > 0) return;
    registerAnswer(null);
  }, [phase, isAnswered, hasTimeLimit, secondsLeft, registerAnswer]);

  // Avanço automático após o feedback — curto e cancelado ao desmontar.
  useEffect(() => {
    if (phase !== 'playing' || !isAnswered) return;

    const timeout = window.setTimeout(advance, QUIZ.FEEDBACK_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [phase, isAnswered, advance]);

  /** Inicia uma partida com a configuração escolhida (false se catálogo vazio). */
  const startGame = useCallback(
    (nextConfig: QuizConfigState): boolean => {
      const built = buildQuizQuestions(products, nextConfig);
      if (built.length === 0) return false;

      setConfig(nextConfig);
      setQuestions(built);
      setCurrentIndex(0);
      setAnswers([]);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setSecondsLeft(nextConfig.timePerQuestion);
      setElapsedSeconds(0);
      setScore(0);
      setStreak(0);
      setBestStreak(0);
      setFinalMetrics(null);
      hasAnsweredRef.current = false;
      sessionStartedAtRef.current = Date.now();
      questionStartedAtRef.current = Date.now();
      setPhase('playing');
      return true;
    },
    [products]
  );

  /**
   * Responde a pergunta atual.
   * `null` força o tempo esgotado (usado apenas pela UI de teste/edge cases).
   */
  const answer = useCallback(
    (optionId: string | null) => {
      if (isAnswered) return;
      registerAnswer(optionId);
    },
    [isAnswered, registerAnswer]
  );

  /** Encerra a partida antes da última pergunta (salva o progresso atual). */
  const finishEarly = useCallback(() => {
    if (answers.length > 0) {
      finishSession(answers, bestStreak);
      return;
    }
    setPhase('config');
  }, [answers, bestStreak, finishSession]);

  /** Volta para a tela de configuração limpando a sessão atual. */
  const restart = useCallback(() => {
    setQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setFinalMetrics(null);
    hasAnsweredRef.current = false;
    setPhase('config');
  }, []);

  /**
   * Jogar novamente: `sameConfig = true` mantém as configurações atuais;
   * `false` volta para a tela de configuração (mesmo contrato dos demais jogos).
   */
  const onPlayAgain = useCallback(
    (sameConfig: boolean) => {
      if (sameConfig && startGame(config)) return;
      restart();
    },
    [config, restart, startGame]
  );

  return {
    phase,
    config,
    setConfig,
    catalog: catalogProducts,
    categories,
    eligibleCountByCategory,
    questions,
    currentIndex,
    currentQuestion,
    totalQuestions,
    answers,
    selectedOptionId,
    isAnswered,
    secondsLeft,
    elapsedSeconds,
    formattedTime: formatTimeMMSS(elapsedSeconds),
    score,
    streak,
    bestStreak,
    correctAnswers,
    incorrectAnswers,
    finalMetrics,
    startGame,
    answer,
    advance,
    finishEarly,
    restart,
    onPlayAgain,
    hasTimeLimit,
  };
}
