"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckCircle, Zap } from "lucide-react";
import { StepContent, ChoiceEvaluationSchema } from "@/content/schema";
import { MathRenderer } from "@/components/ui/katex-math";
import { HintDrawer } from "./hint-drawer";

interface StepPredictProps {
  step: StepContent;
  isCompleted: boolean;
  onSubmit: (response: Record<string, unknown>, usedHintsCount: number) => Promise<void>;
  onNext?: () => void;
  onPrevious?: () => void;
  isSubmitting: boolean;
}

export function StepPredict({
  step,
  isCompleted,
  onSubmit,
  onNext,
  onPrevious,
  isSubmitting,
}: StepPredictProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [confidence, setConfidence] = useState<"low" | "medium" | "high">("medium");
  const [reasoning, setReasoning] = useState<string>("");
  const [usedHintsCount, setUsedHintsCount] = useState<number>(0);
  const [submittedFeedback, setSubmittedFeedback] = useState<{
    status: "correct" | "incorrect";
    text: string;
    chosenLabel?: string;
  } | null>(null);

  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (submittedFeedback && feedbackRef.current) {
      feedbackRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [submittedFeedback]);

  const evaluation =
    step.evaluation?.type === "choice"
      ? ChoiceEvaluationSchema.parse(step.evaluation)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOptionId || isSubmitting) return;

    await onSubmit({ selectedOptionId, confidence, reasoning }, usedHintsCount);

    if (evaluation) {
      const chosen = evaluation.options.find((o) => o.id === selectedOptionId);
      if (chosen) {
        setSubmittedFeedback({
          status: chosen.isCorrect ? "correct" : "incorrect",
          text: chosen.feedback ?? (chosen.isCorrect ? evaluation.feedbackCorrect : "Prediksi belum tepat."),
          chosenLabel: chosen.label,
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-5 rounded-xl bg-surface-raised border border-border space-y-3.5">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-muted text-accent">
          <span>Prediction Engine</span>
          <span>•</span>
          <span>Active Before Passive</span>
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
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <fieldset className="space-y-2.5" disabled={isCompleted || isSubmitting}>
              <legend className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                1. Pilih Hipotesis / Prediksimu:
              </legend>

              {evaluation.options.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-start gap-2.5 p-3 sm:p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedOptionId === option.id
                      ? "border-accent bg-accent-muted/20 text-text font-medium shadow-2xs"
                      : "border-border bg-surface hover:bg-surface-raised text-text-muted"
                  } ${isCompleted ? "cursor-default opacity-90" : ""}`}
                >
                  <input
                    type="radio"
                    name="predict-option"
                    value={option.id}
                    checked={selectedOptionId === option.id}
                    onChange={() => setSelectedOptionId(option.id)}
                    className="mt-0.5 w-4 h-4 text-accent focus:ring-accent border-border shrink-0"
                  />
                  <div className="text-xs sm:text-sm flex-1 leading-relaxed">
                    <MathRenderer content={option.label} />
                  </div>
                </label>
              ))}
            </fieldset>

            {!isCompleted && !submittedFeedback && (
              <div className="space-y-4 pt-2 border-t border-border-subtle">
                {/* Confidence selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted block">
                    2. Seberapa Yakin Kamu dengan Prediksi Ini?
                  </label>
                  <div className="flex items-center gap-2">
                    {[
                      { val: "low", label: "Eksploratif / Ragu" },
                      { val: "medium", label: "Cukup Yakin" },
                      { val: "high", label: "Sangat Yakin" },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setConfidence(item.val as "low" | "medium" | "high")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          confidence === item.val
                            ? "bg-accent text-surface-raised border-accent font-semibold shadow-2xs"
                            : "bg-surface hover:bg-surface-raised border-border text-text-muted"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Reasoning */}
                <div className="space-y-1.5">
                  <label htmlFor="predict-reasoning" className="text-xs font-semibold text-text-muted block">
                    3. Alasan atau Intuisimu (Opsional):
                  </label>
                  <input
                    id="predict-reasoning"
                    type="text"
                    placeholder="Mengapa menurutmu opsi tersebut yang terjadi?"
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg bg-surface border border-border text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!selectedOptionId || isSubmitting}
                    className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-accent text-surface-raised hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isSubmitting ? "Menganalisis Prediksi..." : "Kunci & Buka Hasil Prediksi →"}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

        {/* The Reveal Moment & Cognitive Feedback */}
        {submittedFeedback && (
          <div
            ref={feedbackRef}
            className={`p-4 sm:p-5 rounded-xl border text-sm mt-3 leading-relaxed space-y-3 animate-in fade-in ${
              submittedFeedback.status === "correct"
                ? "border-success/40 bg-success-muted/30 text-text"
                : "border-warning/40 bg-warning-muted/20 text-text"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-2 text-sm">
                {submittedFeedback.status === "correct" ? (
                  <span className="text-success flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Prediksi Sesuai (Mental Model Match)</span>
                  </span>
                ) : (
                  <span className="text-warning flex items-center gap-1.5">
                    <Zap className="w-4 h-4 shrink-0" />
                    <span>Kejutan Prediksi (Prediction Mismatch)</span>
                  </span>
                )}
              </span>
              <span className="text-xs font-mono text-text-muted capitalize">
                Keyakinan: {confidence === "high" ? "Tinggi" : confidence === "medium" ? "Sedang" : "Ragu"}
              </span>
            </div>

            {submittedFeedback.status === "incorrect" && (
              <p className="text-xs text-text-muted">
                <strong>Peluang Belajar:</strong> Rasa kaget ketika prediksi berbeda dari kenyataan adalah saat terbaik otak merestrukturisasi pemahaman.
              </p>
            )}

            <div className="text-sm pt-1">
              <MathRenderer content={submittedFeedback.text} />
            </div>

            {onNext && (
              <div className="pt-3 border-t border-border-subtle flex justify-end">
                <button
                  type="button"
                  onClick={onNext}
                  className="px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-accent text-surface-raised hover:bg-accent-hover transition-colors shadow-sm flex items-center gap-2"
                >
                  <span>Lanjutkan ke Pembuktian Konsep</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        )}

        {isCompleted && !submittedFeedback && onNext && (
          <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
            {onPrevious ? (
              <button
                type="button"
                onClick={onPrevious}
                className="px-4 py-2 rounded-lg text-xs font-medium border border-border hover:bg-surface text-text transition-colors"
              >
                ← Langkah Sebelumnya
              </button>
            ) : <div />}
            <button
              type="button"
              onClick={onNext}
              className="px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-accent text-surface-raised hover:bg-accent-hover transition-colors shadow-sm"
            >
              Lanjutkan →
            </button>
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
