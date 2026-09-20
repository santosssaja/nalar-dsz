"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckCircle, Lightbulb, Circle } from "lucide-react";
import Image from "next/image";
import { StepContent } from "@/content/schema";
import { MathRenderer } from "@/components/ui/katex-math";
import { ExplainEvaluationOutput } from "@/server/services/explain-evaluator";

export interface StepExplainSavedState {
  explanation?: string;
  evaluation?: ExplainEvaluationOutput | null;
}

interface StepExplainProps {
  step: StepContent;
  conceptSlug: string;
  rubricCriteria?: Array<{ id: string; name: string; description: string }>;
  isCompleted: boolean;
  savedState?: StepExplainSavedState;
  onSaveState?: (state: StepExplainSavedState) => void;
  onCompleted: () => void;
  onPrevious?: () => void;
}

export function StepExplain({
  step,
  conceptSlug,
  rubricCriteria,
  isCompleted,
  savedState,
  onSaveState,
  onCompleted,
  onPrevious,
}: StepExplainProps) {
  const [explanation, setExplanation] = useState(savedState?.explanation ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<ExplainEvaluationOutput | null>(
    savedState?.evaluation ?? null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (evaluation && feedbackRef.current) {
      feedbackRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [evaluation]);

  const onSaveStateRef = useRef(onSaveState);
  useEffect(() => {
    onSaveStateRef.current = onSaveState;
  });

  const currentStateRef = useRef<StepExplainSavedState>({
    explanation,
    evaluation,
  });

  useEffect(() => {
    currentStateRef.current = { explanation, evaluation };
  }, [explanation, evaluation]);

  useEffect(() => {
    return () => {
      if (currentStateRef.current) {
        onSaveStateRef.current?.(currentStateRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (explanation.trim().length < 10) {
      setErrorMessage("Tuliskan penjelasan minimal 10 karakter agar dapat dievaluasi oleh Nai.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/v1/ai/explain-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conceptSlug,
          stepId: step.id,
          explanation: explanation.trim(),
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setEvaluation(json.data);
      } else {
        setErrorMessage(json.error?.message ?? "Gagal mengevaluasi penjelasan.");
      }
    } catch {
      setErrorMessage("Terjadi gangguan jaringan saat menghubungi evaluator.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-surface-raised border border-border space-y-4 shadow-sm">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-muted text-accent capitalize">
          <span>Jelaskan Kembali (Explain)</span>
          <span>•</span>
          <span>Langkah {step.sortOrder}</span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-text">{step.title}</h3>
        <MathRenderer
          content={step.instruction}
          inline
          as="p"
          className="text-xs sm:text-sm font-medium text-text-muted"
        />
      </div>

      {/* Prompt / Context */}
      <div className="text-sm text-text border-t border-border-subtle pt-3 leading-relaxed">
        <MathRenderer content={step.content} />
      </div>

      {/* Rubric Criteria Preview */}
      <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Kriteria Evaluasi Nai
        </h4>
        <ul className="text-xs text-text-muted space-y-1 list-disc list-inside">
          {rubricCriteria && rubricCriteria.length > 0 ? (
            rubricCriteria.map((c) => (
              <li key={c.id}>
                <span className="font-semibold text-text">{c.name}</span>: {c.description}
              </li>
            ))
          ) : (
            <>
              <li>Penalaran konsep utama secara mandiri</li>
              <li>Kejelasan hubungan sebab-akibat</li>
              <li>Ketepatan penggunaan istilah sains</li>
            </>
          )}
        </ul>
      </div>

      {/* Form Input */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label
            htmlFor="explain-input"
            className="block text-xs font-semibold text-text mb-1"
          >
            Tuliskan penjelasanmu dengan kata-katamu sendiri:
          </label>
          <textarea
            id="explain-input"
            rows={4}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            disabled={isSubmitting || (evaluation?.passed ?? false)}
            placeholder="Contoh: Turunan berawal dari mencari kemiringan garis yang menghubungkan dua titik pada kurva. Ketika jarak kedua titik (h) didekatkan hingga limit h mendekati nol, garis potong tersebut berputar menjadi garis singgung di satu titik tunggal..."
            className="w-full p-3 rounded-lg bg-surface border border-border text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60 resize-y"
          />
          <div className="flex justify-between items-center text-xs text-text-muted mt-1">
            <span>Minimal 10 karakter</span>
            <span>{explanation.length} karakter</span>
          </div>
        </div>

        {errorMessage && (
          <div role="alert" className="p-3 rounded-lg bg-danger-muted border border-danger/20 text-danger text-xs">
            {errorMessage}
          </div>
        )}

        {/* Feedback Section */}
        {evaluation && (
          <div
            ref={feedbackRef}
            role="status"
            aria-live="polite"
            className={`p-4 sm:p-5 rounded-xl border space-y-3.5 ${
              evaluation.passed
                ? "bg-success-muted border-success/30 text-success-fg"
                : "bg-surface border-border text-text"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {evaluation.passed ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <Lightbulb className="w-5 h-5 text-warning" />
                )}
                <span className="font-bold text-sm">
                  {evaluation.passed
                    ? "Pemahaman Terverifikasi!"
                    : "Umpan Balik Perbaikan"}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface border border-border">
                Skor: {evaluation.totalScore}/100
              </span>
            </div>

            {/* Nai Guidance Box */}
            <div className="p-3 rounded-lg bg-surface/80 border border-border-subtle text-xs leading-relaxed space-y-1">
              <span className="font-semibold text-accent flex items-center gap-1.5">
                <Image
                  src="/figma-assets/logo-nalar.webp"
                  alt="Nai"
                  width={18}
                  height={18}
                  className="w-4 h-4 object-contain shrink-0"
                />
                <span>Ulasan Nai:</span>
              </span>
              <p className="text-text">{evaluation.naiGuidance}</p>
            </div>

            {/* Criteria Breakdown */}
            <div className="space-y-2 pt-2 border-t border-border-subtle">
              <h5 className="text-xs font-bold text-text-muted">
                Detail Rubrik:
              </h5>
              <div className="space-y-1.5">
                {evaluation.criteriaResults.map((c) => (
                  <div
                    key={c.criterionId}
                    className="flex items-start gap-2 text-xs"
                  >
                    <span className="mt-0.5">
                      {c.passed ? (
                        <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                    </span>
                    <div>
                      <span className="font-medium text-text">{c.name}: </span>
                      <span className="text-text-muted">{c.feedback}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 gap-3">
          {onPrevious ? (
            <button
              type="button"
              onClick={onPrevious}
              className="px-4 py-2 rounded-lg text-xs font-medium border border-border hover:bg-surface text-text transition-colors"
            >
              ← Langkah Sebelumnya
            </button>
          ) : evaluation && !evaluation.passed ? (
            <button
              type="button"
              onClick={() => setEvaluation(null)}
              className="px-4 py-2 rounded-lg text-xs font-medium border border-border hover:bg-surface text-text transition-colors"
            >
              Ubah & Coba Lagi
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {evaluation && !evaluation.passed && onPrevious && (
              <button
                type="button"
                onClick={() => setEvaluation(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium border border-border hover:bg-surface text-text transition-colors"
              >
                Ubah & Coba Lagi
              </button>
            )}

            {evaluation?.passed || isCompleted ? (
              <button
                type="button"
                onClick={onCompleted}
                className="px-6 py-2.5 rounded-lg text-sm font-medium bg-accent text-surface-raised hover:bg-accent-hover transition-colors shadow-sm"
              >
                Lanjutkan →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || explanation.trim().length < 10}
                className="px-6 py-2.5 rounded-lg text-sm font-medium bg-accent text-surface-raised hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mengevaluasi...
                  </>
                ) : (
                  "Evaluasi dengan Nai"
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
