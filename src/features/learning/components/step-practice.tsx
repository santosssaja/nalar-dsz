"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
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

  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (evaluationResult && feedbackRef.current) {
      feedbackRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [evaluationResult]);

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
    <div className="space-y-4">
      <div className="p-4 sm:p-5 rounded-xl bg-surface-raised border border-border space-y-3.5">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-muted text-accent">
          <span>Tantangan Praktik</span>
          <span>•</span>
          <span>Buktikan Pemahaman</span>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-text">{step.title}</h3>
        <MathRenderer
          content={step.instruction}
          inline
          as="p"
          className="text-xs sm:text-sm font-medium text-text-muted"
        />

        <div className="text-sm text-text pt-2 border-t border-border-subtle leading-relaxed">
          <MathRenderer content={step.content} />
        </div>

        {evaluation && (
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div>
              <label htmlFor="practice-input" className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
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
                  className="w-full sm:w-64 px-3.5 py-2 rounded-lg border border-border bg-surface text-text font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-75"
                  aria-label="Input jawaban angka"
                  required
                />
                {!isSuccess && (
                  <button
                    type="submit"
                    disabled={!inputValue || isSubmitting}
                    className="px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-accent text-surface-raised hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0"
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
            ref={feedbackRef}
            role="status"
            aria-live="polite"
            className={`p-3.5 sm:p-4 rounded-xl border text-sm mt-3 leading-relaxed ${
              isSuccess
                ? "border-success/30 bg-success-muted text-success"
                : "border-danger/30 bg-danger-muted text-text"
            }`}
          >
            <div className="font-semibold mb-1 flex items-center gap-1.5">
              {isSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-success shrink-0" />
                  <span>Jawaban Benar!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-danger shrink-0" />
                  <span>Perlu Diteliti Kembali</span>
                </>
              )}
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
