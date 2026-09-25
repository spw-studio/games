'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAudio } from '@/components/audio/AudioProvider';
import { GAME_CONFIG } from '@/config/game-config';
import { fetchCatalogProducts } from '@/lib/cardapio/client';
import { DRINK_CATEGORY_ID } from '@/lib/cardapio/pure';
import {
  BASE_MASTER_ATTRIBUTES,
  buildBaseMasterQuestions,
  buildLearningSequence,
  buildMistakesReviewQuestions,
  filterBaseMasterDrinks,
  getAttributeValue,
  isBaseMasterAnswerCorrect,
  listAvailableSpirits,
} from '@/lib/games/base-master';
import {
  applyBaseMasterProgress,
  loadBaseMasterProgress,
  saveBaseMasterProgress,
  summarizeBaseMasterProgress,
  type BaseMasterProgressUpdate,
} from '@/lib/storage/base-master-progress';
import {
  buildBaseMasterMetrics,
  calculateBaseMasterScore,
  countBaseMasterAnswers,
  scoreBaseMasterAnswer,
} from '@/lib/scoring/base-master';
import { formatTimeMMSS } from '@/lib/statistics/calculations';
import {
  BaseMasterAnswerRecord,
  BaseMasterAttributeUsage,
  BaseMasterConfigState,
  BaseMasterDrink,
  BaseMasterMetrics,
  BaseMasterMode,
  BaseMasterProgressMap,
  BaseMasterQuestion,
} from '@/types/base-master';
import { Product } from '@/types/cardapio';
import { GameResult } from '@/types/game';
import { useGameStorage } from './useGameStorage';
import { usePlayer } from './usePlayer';

/** Identificador do jogo salvo em `localStorage` (histórico, recordes e perfil). */
export const BASE_MASTER_GAME_ID = 'base-master';

const BASE_MASTER = GAME_CONFIG.BASE_MASTER;

/** Resolução do cronômetro do Desafio (décimos de segundo). */
const COUNTDOWN_TICK_MS = 100;

export type BaseMasterPhase = 'config' | 'aprender' | 'treinar' | 'desafio' | 'result';

/** Fase de UI por modo: a revisão de erros reutiliza a tela do Treinar. */
const MODE_PHASE: Record<BaseMasterMode, BaseMasterPhase> = {
  aprender: 'aprender',
  treinar: 'treinar',
  desafio: 'desafio',
  revisao: 'treinar',
};

/** Atributo + quantos drinks do catálogo possuem valor para ele. */

/**
 * Orquestra o módulo "Base Master".
 *
 * Toda a regra vive em `lib/games/base-master` (catálogo → drinks elegíveis →
 * perguntas/alternativas/atributos) e em `lib/scoring/base-master` (pontos e
 * combo). O hook apenas controla fases, tempo, memória de aprendizado, áudio e
 * persistência — nenhum dado de drink é declarado aqui.
 */
export function useBaseMaster() {
  const { player } = usePlayer();
  const { recordResult } = useGameStorage();
  const { play } = useAudio();

  const [phase, setPhase] = useState<BaseMasterPhase>('config');
  const [config, setConfig] = useState<BaseMasterConfigState>({
    mode: 'aprender',
    questionCount: BASE_MASTER.DEFAULT_QUESTION_COUNT,
    challengeSeconds: BASE_MASTER.DEFAULT_CHALLENGE_SECONDS,
    difficulty: GAME_CONFIG.DEFAULT_DIFFICULTY,
  });

  // Catálogo carregado via API (escopo de tenant aplicado no servidor)
  const [catalogProducts, setCatalogProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchCatalogProducts()
      .then((products) => {
        if (!cancelled) setCatalogProducts(products);
      })
      .catch(() => {
        if (!cancelled) setCatalogProducts([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /** Drinks jogáveis derivados do catálogo (bebida de base resolvida). */
  const drinks = useMemo(
    () => (catalogProducts ? filterBaseMasterDrinks(catalogProducts, DRINK_CATEGORY_ID) : []),
    [catalogProducts]
  );

  /** Bebidas de base distintas disponíveis — origem das alternativas. */
  const availableSpirits = useMemo(() => listAvailableSpirits(drinks), [drinks]);

  /** Atributos com dado no catálogo atual (base sempre; demais quando declarados). */
  const attributes = useMemo<BaseMasterAttributeUsage[]>(
    () =>
      BASE_MASTER_ATTRIBUTES.map((attribute) => ({
        ...attribute,
        drinksCount: drinks.filter((drink) => Boolean(getAttributeValue(drink, attribute.id))).length,
      })),
    [drinks]
  );

  /** Total de alternativas por pergunta conforme a dificuldade escolhida. */
  const optionCount = BASE_MASTER.OPTION_COUNT[config.difficulty] ?? BASE_MASTER.OPTION_COUNT.medio;

  // ---- Memória de aprendizado (repetição espaçada) ----
  const [progress, setProgress] = useState<BaseMasterProgressMap>({});
  const progressRef = useRef<BaseMasterProgressMap>({});
  const learningSeenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const stored = loadBaseMasterProgress();
    progressRef.current = stored;
    setProgress(stored);
  }, []);

  /** Aplica um lote de eventos ao histórico e persiste (merge puro + storage). */
  const applyProgress = useCallback((updates: BaseMasterProgressUpdate[]) => {
    if (updates.length === 0) return;

    const next = applyBaseMasterProgress(progressRef.current, updates);
    progressRef.current = next;
    saveBaseMasterProgress(next);
    setProgress(next);
  }, []);

  const progressSummary = useMemo(
    () => summarizeBaseMasterProgress(progress, drinks.map((drink) => drink.id)),
    [drinks, progress]
  );

  // ---- Modo Aprender ----
  const [learningDrinks, setLearningDrinks] = useState<BaseMasterDrink[]>([]);
  const [learningIndex, setLearningIndex] = useState(0);
  const [isBaseRevealed, setIsBaseRevealed] = useState(true);

  // ---- Modos Treinar / Desafio / Revisão ----
  const [questions, setQuestions] = useState<BaseMasterQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState<BaseMasterAnswerRecord[]>([]);
  const [rawPoints, setRawPoints] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [finalMetrics, setFinalMetrics] = useState<BaseMasterMetrics | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Refs: leituras atuais dentro de timers/effects sem re-criar intervalos
  const hasAnsweredRef = useRef(false);
  const sessionStartedAtRef = useRef(0);
  const questionStartedAtRef = useRef(0);
  const answersRef = useRef<BaseMasterAnswerRecord[]>([]);
  const comboRef = useRef(0);
  const bestComboRef = useRef(0);
  const rawPointsRef = useRef(0);

  const currentQuestion = questions[currentIndex] ?? null;
  const totalQuestions = questions.length;
  const learningDrink = learningDrinks[learningIndex] ?? null;
  const hasTimeLimit = config.mode === 'desafio' && config.challengeSeconds > 0;
  const hasMistakes = answers.some((answer) => !answer.isCorrect);

  /** Pontuação exibida = bruta × multiplicador de dificuldade (mesma do resultado). */
  const score = useMemo(
    () => calculateBaseMasterScore(rawPoints, config.difficulty),
    [rawPoints, config.difficulty]
  );

  const { correctAnswers, incorrectAnswers, timedOutAnswers } = useMemo(
    () => countBaseMasterAnswers(answers),
    [answers]
  );

  const formattedTime = formatTimeMMSS(elapsedSeconds);

  /** Encerra a rodada: consolida métricas, pontua e persiste o resultado. */
  const finishSession = useCallback(
    (records: BaseMasterAnswerRecord[], bestComboValue: number, rawPointsValue: number) => {
      const durationSeconds = Math.max(
        1,
        Math.round((Date.now() - sessionStartedAtRef.current) / 1000)
      );
      const tally = countBaseMasterAnswers(records);
      const finalScore = calculateBaseMasterScore(rawPointsValue, config.difficulty);

      const metrics = buildBaseMasterMetrics({
        mode: config.mode,
        totalQuestions: questions.length,
        correctAnswers: tally.correctAnswers,
        incorrectAnswers: tally.incorrectAnswers,
        timedOutAnswers: tally.timedOutAnswers,
        bestCombo: bestComboValue,
        score: finalScore,
        durationSeconds,
      });

      setFinalMetrics(metrics);
      setElapsedSeconds(durationSeconds);
      setPhase('result');
      play('complete');

      if (records.length > 0) {
        const result: GameResult<BaseMasterMetrics> = {
          id: `base_master_${Date.now()}`,
          gameId: BASE_MASTER_GAME_ID,
          playerId: player?.id || 'local-player',
          score: finalScore,
          accuracy: metrics.accuracy,
          durationSeconds,
          difficulty: config.difficulty,
          category: DRINK_CATEGORY_ID,
          playedAt: new Date().toISOString(),
          metrics,
        };

        recordResult(result);
      }
    },
    [config.difficulty, config.mode, play, player?.id, questions.length, recordResult]
  );

  /**
   * Registra a resposta da pergunta atual.
   * `null` representa tempo esgotado (somente no Desafio com cronômetro).
   */
  const registerAnswer = useCallback(
    (value: string | null) => {
      if (!currentQuestion || hasAnsweredRef.current) return;

      hasAnsweredRef.current = true;

      const timedOut = value === null;
      const isCorrect = !timedOut && isBaseMasterAnswerCorrect(currentQuestion, value);
      const answeredInSeconds = Math.max(
        1,
        Math.round((Date.now() - questionStartedAtRef.current) / 1000)
      );

      // Combo: sobe no acerto, zera no erro/tempo esgotado.
      const nextCombo = isCorrect ? comboRef.current + 1 : 0;
      const points = scoreBaseMasterAnswer({
        isCorrect,
        comboAfter: nextCombo,
        secondsLeft: hasTimeLimit ? secondsLeft : 0,
        secondsPerQuestion: config.challengeSeconds,
      });

      const record: BaseMasterAnswerRecord = {
        questionId: currentQuestion.id,
        attribute: currentQuestion.attribute,
        attributeLabel: currentQuestion.attributeLabel,
        drinkId: currentQuestion.drinkId,
        drinkName: currentQuestion.drinkName,
        correctValue: currentQuestion.correctValue,
        selectedValue: value,
        isCorrect,
        timedOut,
        answeredInSeconds,
        comboAfter: nextCombo,
        basePoints: points.basePoints,
        comboBonus: points.comboBonus,
        speedBonus: points.speedBonus,
        pointsEarned: points.pointsEarned,
      };

      comboRef.current = nextCombo;
      if (nextCombo > bestComboRef.current) bestComboRef.current = nextCombo;
      rawPointsRef.current += points.pointsEarned;
      answersRef.current = [...answersRef.current, record];

      // Memória de aprendizado: alimenta a repetição espaçada da próxima rodada.
      applyProgress([{ drinkId: currentQuestion.drinkId, isCorrect }]);

      setSelectedValue(value);
      setIsAnswered(true);
      setCombo(nextCombo);
      setBestCombo(bestComboRef.current);
      setRawPoints(rawPointsRef.current);
      setAnswers(answersRef.current);

      play(isCorrect ? 'success' : 'error');
    },
    [applyProgress, config.challengeSeconds, currentQuestion, hasTimeLimit, play, secondsLeft]
  );

  /** Avança para o próximo drink ou encerra a rodada na última pergunta. */
  const advanceQuestion = useCallback(() => {
    const isLastQuestion = currentIndex >= questions.length - 1;

    if (isLastQuestion) {
      finishSession(answersRef.current, bestComboRef.current, rawPointsRef.current);
      return;
    }

    setCurrentIndex((index) => index + 1);
    setSelectedValue(null);
    setIsAnswered(false);
    hasAnsweredRef.current = false;
    questionStartedAtRef.current = Date.now();
    setSecondsLeft(config.challengeSeconds);
  }, [config.challengeSeconds, currentIndex, finishSession, questions.length]);

  // Cronômetro total (Treinar/Desafio/Revisão): tempo decorrido da rodada.
  useEffect(() => {
    if (phase !== 'treinar' && phase !== 'desafio') return;

    const interval = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [phase]);

  // Cronômetro por pergunta (Desafio) — precisão de décimos para o HUD.
  useEffect(() => {
    if (phase !== 'desafio' || !hasTimeLimit || isAnswered) return;

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        const next = Math.round((current - COUNTDOWN_TICK_MS / 1000) * 10) / 10;
        return next < 0 ? 0 : next;
      });
    }, COUNTDOWN_TICK_MS);

    return () => window.clearInterval(interval);
  }, [phase, hasTimeLimit, isAnswered]);

  // Tempo esgotado: registra a pergunta como não respondida.
  useEffect(() => {
    if (phase !== 'desafio' || !hasTimeLimit || isAnswered || secondsLeft > 0) return;

    registerAnswer(null);
  }, [phase, hasTimeLimit, isAnswered, secondsLeft, registerAnswer]);

  // Avanço automático após o feedback (mantém o ritmo do treino).
  useEffect(() => {
    if ((phase !== 'treinar' && phase !== 'desafio') || !isAnswered) return;

    const timeout = window.setTimeout(advanceQuestion, BASE_MASTER.FEEDBACK_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [phase, isAnswered, advanceQuestion]);

  // Memória do Aprender: registra cada drink apresentado (uma vez por visita).
  useEffect(() => {
    if (phase !== 'aprender' || !learningDrink) return;
    if (learningSeenRef.current.has(learningDrink.id)) return;

    learningSeenRef.current.add(learningDrink.id);
    applyProgress([{ drinkId: learningDrink.id, seen: true }]);
  }, [applyProgress, learningDrink, phase]);

  /**
   * Inicia a rodada no modo escolhido.
   * Retorna `false` quando o catálogo não possui drinks com base resolvida.
   */
  const startGame = useCallback(
    (nextConfig: BaseMasterConfigState): boolean => {
      if (drinks.length === 0) return false;

      const nextOptionCount =
        BASE_MASTER.OPTION_COUNT[nextConfig.difficulty] ?? BASE_MASTER.OPTION_COUNT.medio;

      const built =
        nextConfig.mode === 'aprender'
          ? []
          : buildBaseMasterQuestions(drinks, {
              count: nextConfig.questionCount,
              optionCount: nextOptionCount,
              progress: progressRef.current,
            });

      if (nextConfig.mode !== 'aprender' && built.length === 0) return false;

      setConfig(nextConfig);
      setQuestions(built);
      setLearningDrinks(
        nextConfig.mode === 'aprender' ? buildLearningSequence(drinks, progressRef.current) : []
      );
      setLearningIndex(0);
      learningSeenRef.current = new Set();
      setIsBaseRevealed(true);
      setCurrentIndex(0);
      setSelectedValue(null);
      setIsAnswered(false);
      setAnswers([]);
      answersRef.current = [];
      setRawPoints(0);
      rawPointsRef.current = 0;
      setCombo(0);
      comboRef.current = 0;
      setBestCombo(0);
      bestComboRef.current = 0;
      setFinalMetrics(null);
      setElapsedSeconds(0);
      setSecondsLeft(nextConfig.challengeSeconds);
      hasAnsweredRef.current = false;
      sessionStartedAtRef.current = Date.now();
      questionStartedAtRef.current = Date.now();
      setPhase(MODE_PHASE[nextConfig.mode]);
      play('click');

      return true;
    },
    [drinks, play]
  );

  /**
   * Revisão dirigida: nova rodada somente com os erros da rodada encerrada
   * (reutiliza a tela do Treinar, sem cronômetro).
   */
  const startMistakesReview = useCallback((): boolean => {
    const review = buildMistakesReviewQuestions(drinks, answersRef.current, optionCount);
    if (review.length === 0) return false;

    setConfig((current) => ({ ...current, mode: 'revisao' }));
    setQuestions(review);
    setLearningDrinks([]);
    setCurrentIndex(0);
    setSelectedValue(null);
    setIsAnswered(false);
    setAnswers([]);
    answersRef.current = [];
    setRawPoints(0);
    rawPointsRef.current = 0;
    setCombo(0);
    comboRef.current = 0;
    setBestCombo(0);
    bestComboRef.current = 0;
    setFinalMetrics(null);
    setElapsedSeconds(0);
    setSecondsLeft(0);
    hasAnsweredRef.current = false;
    sessionStartedAtRef.current = Date.now();
    questionStartedAtRef.current = Date.now();
    setPhase('treinar');
    play('click');

    return true;
  }, [drinks, optionCount, play]);

  // ---- Navegação do modo Aprender ----
  const goToNextDrink = useCallback(() => {
    setLearningIndex((index) => Math.min(index + 1, learningDrinks.length - 1));
    setIsBaseRevealed(true);
    play('click');
  }, [learningDrinks.length, play]);

  const goToPreviousDrink = useCallback(() => {
    setLearningIndex((index) => Math.max(index - 1, 0));
    setIsBaseRevealed(true);
    play('click');
  }, [play]);

  /** Alterna a visibilidade da base (opcional no modo Aprender). */
  const toggleBaseReveal = useCallback(() => {
    setIsBaseRevealed((current) => !current);
  }, []);

  /** Resposta do jogador (Treinar/Desafio/Revisão) — ignora cliques repetidos. */
  const answer = useCallback(
    (value: string) => {
      if (isAnswered) return;
      registerAnswer(value);
    },
    [isAnswered, registerAnswer]
  );

  /** Encerra a rodada antes do fim (salva o progresso atual). */
  const finishEarly = useCallback(() => {
    if (phase === 'aprender') {
      setPhase('config');
      return;
    }

    if (answersRef.current.length > 0) {
      finishSession(answersRef.current, bestComboRef.current, rawPointsRef.current);
      return;
    }

    setPhase('config');
  }, [finishSession, phase]);

  /** Volta para a tela de configuração limpando a sessão atual. */
  const restart = useCallback(() => {
    setQuestions([]);
    setAnswers([]);
    answersRef.current = [];
    setCurrentIndex(0);
    setSelectedValue(null);
    setIsAnswered(false);
    setIsBaseRevealed(true);
    setFinalMetrics(null);
    hasAnsweredRef.current = false;
    // A revisão é um modo derivado: volta para o Treinar ao sair da rodada.
    setConfig((current) =>
      current.mode === 'revisao' ? { ...current, mode: 'treinar' } : current
    );
    setPhase('config');
  }, []);

  /**
   * Jogar novamente: `sameConfig = true` repete a rodada com a mesma
   * configuração; `false` volta para a tela de ajustes (contrato dos demais jogos).
   */
  const onPlayAgain = useCallback(
    (sameConfig: boolean) => {
      if (sameConfig && startGame(config.mode === 'revisao' ? { ...config, mode: 'treinar' } : config)) {
        return;
      }
      restart();
    },
    [config, restart, startGame]
  );

  return {
    // Catálogo / elegibilidade
    catalog: catalogProducts,
    drinks,
    availableSpirits,
    attributes,
    drinksCount: drinks.length,
    spiritsCount: availableSpirits.length,
    catalogReady: catalogProducts !== null,

    // Configuração e fases
    phase,
    mode: config.mode,
    config,
    setConfig,
    optionCount,
    startGame,
    startMistakesReview,
    restart,
    onPlayAgain,
    finishEarly,

    // Memória de aprendizado
    progress,
    progressSummary,

    // Modo Aprender
    learningDrinks,
    learningTotal: learningDrinks.length,
    learningIndex,
    learningDrink,
    isBaseRevealed,
    toggleBaseReveal,
    goToNextDrink,
    goToPreviousDrink,
    hasPreviousDrink: learningIndex > 0,
    hasNextDrink: learningIndex < learningDrinks.length - 1,

    // Modos Treinar / Desafio / Revisão
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions,
    selectedValue,
    isAnswered,
    answers,
    hasMistakes,
    answer,
    advanceQuestion,

    // HUD
    score,
    rawPoints,
    combo,
    bestCombo,
    correctAnswers,
    incorrectAnswers,
    timedOutAnswers,
    secondsLeft,
    secondsPerQuestion: config.challengeSeconds,
    hasTimeLimit,
    elapsedSeconds,
    formattedTime,

    // Resultado
    finalMetrics,
  };
}
