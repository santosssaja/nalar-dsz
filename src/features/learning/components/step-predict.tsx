"use client";

import React, { useState } from "react";
import { StepContent, ChoiceEvaluationSchema } from "@/content/schema";
import { MathRenderer } from "@/components/ui/katex-math";
import { HintDrawer } from "./hint-drawer";

interface StepPredictProps {
  step: StepContent;
  isCompleted: boolean;
  onSubmit: (response: Record<string, unknown>, usedHintsCount: number) => Promise<void>;
  isSubmitting: boolean;
}

export function StepPredict({
  step,
  isCompleted,
  onSubmit,
  isSubmitting,
}: StepPredictProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [usedHintsCount, setUsedHintsCount] = useState<number>(0);
  const [submittedFeedback, setSubmittedFeedback] = useState<{
    status: "correct" | "incorrect";
    text: string;
  } | null>(null);

  const evaluation =
    step.evaluation?.type === "choice"
      ? ChoiceEvaluationSchema.parse(step.evaluation)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOptionId || isSubmitting) return;

    await onSubmit({ selectedOptionId }, usedHintsCount);

    if (evaluation) {
      const chosen = evaluation.options.find((o) => o.id === selectedOptionId);
      if (chosen) {
        setSubmittedFeedback({
          status: chosen.isCorrect ? "correct" : "incorrect",
          text: chosen.feedback ?? (chosen.isCorrect ? evaluation.feedbackCorrect : "Prediksi belum tepat."),
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl bg-surface-raised border border-border space-y-4">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-muted text-accent">
          <span>Active Before Passive</span>
          <span>•</span>
          <span>Buat Prediksimu</span>
        </div>

        <h3 className="text-xl font-bold text-text">{step.title}</h3>
        <p className="text-sm font-medium text-text-muted">{step.instruction}</p>

        <div className="text-sm text-text pt-2 border-t border-border-subtle">
          <MathRenderer content={step.content} />
        </div>

        {evaluation && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <fieldset className="space-y-3" disabled={isCompleted || isSubmitting}>
              <legend className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Pilih Jawaban yang Menurutmu Benar:
              </legend>

              {evaluation.options.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedOptionId === option.id
                      ? "border-accent bg-accent-muted/20 text-text font-medium"
                      : "border-border bg-surface hover:bg-surface-raised text-text-muted"
                  } ${isCompleted ? "cursor-default opacity-90" : ""}`}
                >
                  <input
                    type="radio"
                    name="predict-option"
                    value={option.id}
                    checked={selectedOptionId === option.id}
                    onChange={() => setSelectedOptionId(option.id)}
                    className="mt-1 w-4 h-4 text-accent focus:ring-accent border-border"
                  />
                  <div className="text-sm flex-1">
                    <MathRenderer content={option.label} />
                  </div>
                </label>
              ))}
            </fieldset>

            {!isCompleted && (
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!selectedOptionId || isSubmitting}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium bg-accent text-surface-raised hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isSubmitting ? "Menyimpan Prediksi..." : "Kirim Prediksi"}
                </button>
              </div>
            )}
          </form>
        )}

        {submittedFeedback && (
          <div
            className={`p-4 rounded-xl border text-sm mt-4 leading-relaxed ${
              submittedFeedback.status === "correct"
                ? "border-success/30 bg-success-muted text-success"
                : "border-warning/30 bg-warning-muted text-text"
            }`}
          >
            <div className="font-semibold mb-1">
              {submittedFeedback.status === "correct"
                ? "✓ Prediksi Tepat!"
                : "ℹ Refleksi Prediksi:"}
            </div>
            <div>{submittedFeedback.text}</div>
          </div>
        )}
      </div>

      <HintDrawer
        hints={step.hints}
        stepId={step.id}
        onHintRequested={(_level, count) => setUsedHintsCount(count)}
      />
    </div>
  );
}
