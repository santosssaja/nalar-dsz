"use client";

import React, { useState } from "react";
import { StepContent, NumericEvaluationSchema } from "@/content/schema";
import { MathRenderer } from "@/components/ui/katex-math";
import { HintDrawer } from "./hint-drawer";
import { EvaluationResult } from "@/server/services/evaluator";

interface StepPracticeProps {
  step: StepContent;
  isCompleted: boolean;
  onSubmit: (response: Record<string, unknown>, usedHintsCount: number) => Promise<EvaluationResult | null>;
  isSubmitting: boolean;
  onNext: () => void;
}

export function StepPractice({
  step,
  isCompleted,
  onSubmit,
  isSubmitting,
  onNext,
}: StepPracticeProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const [usedHintsCount, setUsedHintsCount] = useState<number>(0);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);

  const evaluation =
    step.evaluation?.type === "numeric"
      ? NumericEvaluationSchema.parse(step.evaluation)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue || isSubmitting) return;

    const numVal = parseFloat(inputValue);
    if (isNaN(numVal)) return;

    const result = await onSubmit({ value: numVal }, usedHintsCount);
    if (result) {
      setEvaluationResult(result);
    }
  };

  const isSuccess = isCompleted || evaluationResult?.status === "correct";

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl bg-surface-raised border border-border space-y-4">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-muted text-accent">
          <span>Tantangan Praktik</span>
          <span>•</span>
          <span>Buktikan Pemahaman</span>
        </div>

        <h3 className="text-xl font-bold text-text">{step.title}</h3>
        <p className="text-sm font-medium text-text-muted">{step.instruction}</p>

        <div className="text-sm text-text pt-2 border-t border-border-subtle">
          <MathRenderer content={step.content} />
        </div>

        {evaluation && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <label htmlFor="practice-input" className="block text-xs font-semibold text-text-muted uppercase mb-2">
                Jawabanmu:
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="practice-input"
                  type="number"
                  step="any"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isSuccess || isSubmitting}
                  placeholder="Ketik angka hasil..."
                  className="w-full sm:w-64 px-4 py-2.5 rounded-lg border border-border bg-surface text-text font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-75"
                  aria-label="Input jawaban angka"
                  required
                />
                {!isSuccess && (
                  <button
                    type="submit"
                    disabled={!inputValue || isSubmitting}
                    className="px-6 py-2.5 rounded-lg text-sm font-medium bg-accent text-surface-raised hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0"
                  >
                    {isSubmitting ? "Memeriksa..." : "Periksa Jawaban"}
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Feedback Section */}
        {evaluationResult && (
          <div
            className={`p-4 rounded-xl border text-sm mt-4 leading-relaxed ${
              isSuccess
                ? "border-success/30 bg-success-muted text-success"
                : "border-danger/30 bg-danger-muted text-text"
            }`}
          >
            <div className="font-semibold mb-1">
              {isSuccess ? "✓ Jawaban Benar!" : "✗ Perlu Diteliti Kembali"}
            </div>
            <div>{evaluationResult.feedback}</div>

            {evaluationResult.misconceptionCodes.length > 0 && (
              <div className="mt-2 pt-2 border-t border-danger/20 text-xs text-text-muted">
                <span className="font-semibold text-text">Pola Kesalahan Terdeteksi: </span>
                <span>{evaluationResult.misconceptionCodes.join(", ")}</span>
              </div>
            )}
          </div>
        )}

        {isSuccess && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onNext}
              className="px-6 py-2.5 rounded-lg text-sm font-medium bg-accent text-surface-raised hover:bg-accent-hover transition-colors shadow-sm"
            >
              Lanjutkan ke Langkah Berikutnya →
            </button>
          </div>
        )}
      </div>

      {!isSuccess && (
        <HintDrawer
          hints={step.hints}
          stepId={step.id}
          onHintRequested={(_level, count) => setUsedHintsCount(count)}
        />
      )}
    </div>
  );
}
