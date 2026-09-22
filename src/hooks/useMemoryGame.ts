'use client';

import { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CELEBRATION_COLORS } from '@/theme/themes';
import { Product } from '@/types/cardapio';
import {
  GameDifficulty,
  GameResult,
  MemoryCard as IMemoryCard,
  MemoryMetrics,
} from '@/types/game';
import { GAME_CONFIG } from '@/config/game-config';
import { calculateAccuracy, calculateMemoryScore } from '@/lib/scoring/memory';
import { pickRandomItems, shuffleArray } from '@/lib/utils/shuffle';
import { useGameTimer } from './useGameTimer';
import { useAudio } from '@/components/audio/AudioProvider';

interface UseMemoryGameOptions {
  products: Product[];
  category: string;
  pairCount: number;
  difficulty: GameDifficulty;
  playerId: string;
  onFinishGame: (result: GameResult<MemoryMetrics>) => void;
}

/**
 * Estado e regras do Jogo da Memória.
 *
 * Extraídos da UI (`MemoryBoard`) para seguir o padrão dos demais jogos
 * da plataforma (`useDrinkAssembly`, `useWordSearchGame`): hook de jogo +
 * componentes apenas de renderização.
 */
export function useMemoryGame({
  products,
  category,
  pairCount,
  difficulty,
  playerId,
  onFinishGame,
}: UseMemoryGameOptions) {
  // Estado das cartas e da lógica do jogo
  const [cards, setCards] = useState<IMemoryCard[]>([]);
  const [productLookup, setProductLookup] = useState<Record<string, Product>>({});
  const [flippedCards, setFlippedCards] = useState<IMemoryCard[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState<number>(0);
  const [errors, setErrors] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [isCheckingMatch, setIsCheckingMatch] = useState<boolean>(false);
  const [hasStartedFlipping, setHasStartedFlipping] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const timer = useGameTimer();
  const { play } = useAudio();

  // 1. Inicializa o tabuleiro ao montar
  useEffect(() => {
    // Seleciona N produtos aleatórios únicos
    const selected = pickRandomItems(products, pairCount);
    const lookup: Record<string, Product> = {};
    const deck: IMemoryCard[] = [];

    selected.forEach((prod, index) => {
      const productId = prod.id;
      lookup[productId] = prod;

      // Carta A: Imagem
      deck.push({
        id: `${productId}-image-${index}`,
        pairId: productId,
        productId,
        type: 'image',
        isFlipped: false,
        isMatched: false,
      });

      // Carta B: Descrição
      deck.push({
        id: `${productId}-desc-${index}`,
        pairId: productId,
        productId,
        type: 'description',
        isFlipped: false,
        isMatched: false,
      });
    });

    // Embaralha as 2N cartas com Fisher-Yates
    setCards(shuffleArray(deck));
    setProductLookup(lookup);
    setFlippedCards([]);
    setMatchedPairs(new Set());
    setMoves(0);
    setErrors(0);
    setStreak(0);
    setBestStreak(0);
    setIsCheckingMatch(false);
    setHasStartedFlipping(false);
    setIsFinished(false);
    timer.reset();
  }, [products, pairCount]);

  // Calcula a pontuação em tempo real
  const currentScoring = calculateMemoryScore({
    matches: matchedPairs.size,
    errors,
    moves,
    elapsedSeconds: timer.seconds,
    difficulty,
    totalPairs: pairCount,
    bestStreak,
  });

  // Finalização do jogo
  const handleGameComplete = useCallback(
    (
      finalMatches: number,
      finalErrors: number,
      finalMoves: number,
      finalStreak: number
    ) => {
      timer.pause();
      setIsFinished(true);
      play('complete');

      const elapsed = timer.seconds;
      const breakdown = calculateMemoryScore({
        matches: finalMatches,
        errors: finalErrors,
        moves: finalMoves,
        elapsedSeconds: elapsed,
        difficulty,
        totalPairs: pairCount,
        bestStreak: finalStreak,
      });

      const accuracy = calculateAccuracy(finalMatches, finalErrors);

      // Efeito de confetes no sucesso
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: [...CELEBRATION_COLORS],
        });
      } catch {
        // Ignora caso falhe no navegador
      }

      const metrics: MemoryMetrics = {
        totalPairs: pairCount,
        totalCards: pairCount * 2,
        matches: finalMatches,
        errors: finalErrors,
        moves: finalMoves,
        bestStreak: finalStreak,
        avgTimePerMatch:
          finalMatches > 0 ? Number((elapsed / finalMatches).toFixed(1)) : 0,
        efficiencyBonus: breakdown.efficiencyBonus,
        speedBonus: breakdown.speedBonus,
      };

      const result: GameResult<MemoryMetrics> = {
        id: `game-memoria-${Date.now()}`,
        gameId: 'memoria',
        playerId,
        score: breakdown.finalScore,
        accuracy,
        durationSeconds: elapsed,
        difficulty,
        category,
        playedAt: new Date().toISOString(),
        metrics,
      };

      // Pequeno delay para o jogador contemplar a última carta virando
      setTimeout(() => {
        onFinishGame(result);
      }, 1000);
    },
    [timer, difficulty, pairCount, playerId, category, onFinishGame, play]
  );

  // Clique na carta
  const handleCardClick = (clickedCard: IMemoryCard) => {
    // Prevenções essenciais:
    // 1. Bloqueado se estiver checando match
    if (isCheckingMatch) return;
    // 2. Não permite clicar se o jogo terminou
    if (isFinished) return;
    // 3. Não permite clicar em carta já virada ou com match
    if (clickedCard.isFlipped || clickedCard.isMatched) return;
    // 4. Não permite clicar duas vezes na mesma carta
    if (flippedCards.some((c) => c.id === clickedCard.id)) return;

    play('click');

    // Inicia o cronômetro no primeiro clique válido
    if (!hasStartedFlipping) {
      setHasStartedFlipping(true);
      timer.start();
    }

    // Vira a carta selecionada
    const newCards = cards.map((c) =>
      c.id === clickedCard.id ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newFlipped = [...flippedCards, clickedCard];
    setFlippedCards(newFlipped);

    // Se 2 cartas foram viradas, faz a verificação
    if (newFlipped.length === 2) {
      const [cardA, cardB] = newFlipped;
      const newMoves = moves + 1;
      setMoves(newMoves);
      setIsCheckingMatch(true);

      // Regra de Match: mesmo pairId E tipos diferentes (Imagem + Descrição)
      const isMatch = cardA.pairId === cardB.pairId && cardA.type !== cardB.type;

      if (isMatch) {
        // MATCH ENCONTRADO
        play('success');
        const newMatchedPairs = new Set(matchedPairs);
        newMatchedPairs.add(cardA.pairId);
        setMatchedPairs(newMatchedPairs);

        const newMatches = newMatchedPairs.size;
        const newStreak = streak + 1;
        const updatedBestStreak = Math.max(bestStreak, newStreak);
        setStreak(newStreak);
        setBestStreak(updatedBestStreak);

        // Marca as duas cartas permanentemente como matched
        setCards((prev) =>
          prev.map((c) =>
            c.id === cardA.id || c.id === cardB.id
              ? { ...c, isMatched: true, isFlipped: true }
              : c
          )
        );

        setFlippedCards([]);
        setIsCheckingMatch(false);

        // Verifica se todas as cartas foram encontradas
        if (newMatches === pairCount) {
          handleGameComplete(newMatches, errors, newMoves, updatedBestStreak);
        }
      } else {
        // COMBINAÇÃO ERRADA
        play('error');
        const newErrors = errors + 1;
        setErrors(newErrors);
        setStreak(0); // Reinicia o streak de acertos consecutivos

        // Aguarda o delay configurado (800ms) para esconder as cartas novamente
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === cardA.id || c.id === cardB.id
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
          setIsCheckingMatch(false);
        }, GAME_CONFIG.MEMORY_CARD_DELAY);
      }
    }
  };

  return {
    cards,
    productLookup,
    matchedPairs,
    moves,
    errors,
    streak,
    bestStreak,
    isCheckingMatch,
    isFinished,
    timer,
    currentScoring,
    handleCardClick,
    handleGameComplete,
  };
}
