'use client';

import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, Check } from 'lucide-react';
import { DrinkRoundEvaluation, GroupMember, IngredientState } from '@/types/grouping';
import { IngredientOption } from './IngredientOption';

interface IngredientGridProps {
  pool: GroupMember[];
  selectedIds: string[];
  isConfirmed: boolean;
  evaluation: DrinkRoundEvaluation | null;
  isLastDrink: boolean;
  onToggle: (id: string) => void;
  onConfirm: () => void;
  onNext: () => void;
}

export function IngredientGrid({
  pool,
  selectedIds,
  isConfirmed,
  evaluation,
  isLastDrink,
  onToggle,
  onConfirm,
  onNext,
}: IngredientGridProps) {
  // Determina o estado visual de cada ingrediente
  const getItemState = (member: GroupMember): IngredientState => {
    const isSelected = selectedIds.includes(member.id);

    if (!isConfirmed || !evaluation) {
      return isSelected ? 'selected' : 'default';
    }

    // Após confirmação:
    if (isSelected) {
      const isCorrect = evaluation.correctSelected.some((c) => c.id === member.id);
      return isCorrect ? 'correct' : 'incorrect';
    } else {
      const isMissing = evaluation.missingIngredients.some(
        (m) => m.name.toLowerCase().trim() === member.name.toLowerCase().trim()
      );
      return isMissing ? 'missing' : 'default';
    }
  };

  const hasSelection = selectedIds.length > 0;

  return (
    <div className="space-y-6">
      {/* Banner de Feedback Após a Confirmação */}
      {isConfirmed && evaluation && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-3xl p-5 sm:p-6 border shadow-lg transition-all animate-in fade-in slide-in-from-top-4 duration-300 ${
            evaluation.isPerfectMatch
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : evaluation.correctSelected.length > 0 && evaluation.incorrectSelected.length === 0
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-0.5">
              {evaluation.isPerfectMatch ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              ) : evaluation.correctSelected.length > 0 && evaluation.incorrectSelected.length === 0 ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-md">
                  <XCircle className="h-6 w-6" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-bold font-serif">
                {evaluation.isPerfectMatch
                  ? 'ACERTO PERFEITO!'
                  : evaluation.correctSelected.length > 0 && evaluation.incorrectSelected.length === 0
                  ? 'QUASE LÁ! Faltaram ingredientes'
                  : 'INCORRETO! Receita com erros'}
              </h3>

              {/* Detalhes de Acertos, Erros e Faltas */}
              <div className="space-y-1 text-xs sm:text-sm font-medium">
                {evaluation.correctSelected.length > 0 && (
                  <p className="text-emerald-800">
                    <span className="font-bold">✓ Corretos:</span>{' '}
                    {evaluation.correctSelected.map((c) => c.name).join(', ')}
                  </p>
                )}

                {evaluation.incorrectSelected.length > 0 && (
                  <p className="text-rose-800">
                    <span className="font-bold">✗ Incorretos (não pertencem):</span>{' '}
                    {evaluation.incorrectSelected.map((c) => c.name).join(', ')}
                  </p>
                )}

                {evaluation.missingIngredients.length > 0 && (
                  <p className="text-amber-800">
                    <span className="font-bold">⚠ Faltou incluir:</span>{' '}
                    {evaluation.missingIngredients.map((c) => c.name).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Ingredientes Selecionáveis */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-500">
            Ingredientes Disponíveis
          </span>
          <span className="text-xs text-gray-400 font-mono">
            {selectedIds.length} selecionado(s)
          </span>
        </div>

        <div
          role="group"
          aria-label="Lista de ingredientes disponíveis"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {pool.map((member) => (
            <IngredientOption
              key={member.id}
              id={member.id}
              name={member.name}
              state={getItemState(member)}
              disabled={isConfirmed}
              onToggle={onToggle}
            />
          ))}
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="pt-2">
        {!isConfirmed ? (
          <button
            type="button"
            onClick={onConfirm}
            disabled={!hasSelection}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 px-6 text-base font-bold shadow-lg transition-all duration-200 active:scale-[0.98] ${
              hasSelection
                ? 'bg-brand-900 hover:bg-brand-950 text-gold-300 border border-gold-400/40 cursor-pointer shadow-brand-900/20'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Check className="h-5 w-5 stroke-[2.5]" />
            <span>CONFIRMAR DRINK</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-gold-400 hover:brightness-105 text-brand-950 font-bold py-4 px-6 text-base shadow-xl transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <span>{isLastDrink ? 'FINALIZAR PARTIDA' : 'PRÓXIMO DRINK'}</span>
            <ArrowRight className="h-5 w-5 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );
}
