"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckCircle, Zap, Sparkles, AlertCircle, Loader2, RotateCcw, Info } from "lucide-react";
import { StepContent, ChoiceEvaluationSchema } from "@/content/schema";
import { MathRenderer } from "@/components/ui/katex-math";
import { HintDrawer } from "./hint-drawer";
import { AiPredictAnalysis } from "@/server/ai/types";
import { useAiModel } from "@/features/learning/context/ai-model-context";

export interface StepPredictSavedState {
  selectedOptionId?: string;
  confidence?: "low" | "medium" | "high";
  reasoning?: string;
  useLlm?: boolean;
  submittedFeedback?: {
    status: "correct" | "incorrect";
    text: string;
    chosenLabel?: string;
  } | null;
  llmAnalysis?: AiPredictAnalysis | null;
}

interface StepPredictProps {
  step: StepContent;
  conceptSlug?: string;
  isCompleted: boolean;
  savedState?: StepPredictSavedState;
  onSaveState?: (state: StepPredictSavedState) => void;
  onSubmit: (response: Record<string, unknown>, usedHintsCount: number) => Promise<void>;
  onNext?: () => void;
  onPrevious?: () => void;
  isSubmitting: boolean;
}

export function StepPredict({
  step,
  conceptSlug,
  isCompleted,
  savedState,
  onSaveState,
  onSubmit,
  onNext,
  onPrevious,
  isSubmitting,
}: StepPredictProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    savedState?.selectedOptionId ?? ""
  );
  const [confidence, setConfidence] = useState<"low" | "medium" | "high">(
    savedState?.confidence ?? "medium"
  );
  const [reasoning, setReasoning] = useState<string>(
    savedState?.reasoning ?? ""
  );
  const [useLlm, setUseLlm] = useState<boolean>(
    savedState?.useLlm ?? false
  );
  const [isAnalyzingLlm, setIsAnalyzingLlm] = useState<boolean>(false);
  const [llmAnalysis, setLlmAnalysis] = useState<AiPredictAnalysis | null>(
    savedState?.llmAnalysis ?? null
  );
  const [llmError, setLlmError] = useState<string | null>(null);
  const [usedHintsCount, setUsedHintsCount] = useState<number>(0);

  const { selectedProvider, selectedModel, activeModelLabel } = useAiModel();

  const evaluation =
    step.evaluation?.type === "choice"
      ? ChoiceEvaluationSchema.parse(step.evaluation)
      : null;

  // Reconstruct feedback if completed and option is known but submittedFeedback was missing
  const initialFeedback =
    savedState?.submittedFeedback ??
    (isCompleted && savedState?.selectedOptionId && evaluation
      ? (() => {
          const chosen = evaluation.options.find((o) => o.id === savedState.selectedOptionId);
          if (chosen) {
            return {
              status: (chosen.isCorrect ? "correct" : "incorrect") as "correct" | "incorrect",
              text: chosen.feedback ?? (chosen.isCorrect ? evaluation.feedbackCorrect : "Prediksi tersimpan."),
              chosenLabel: chosen.label,
            };
          }
          return null;
        })()
      : null);

  const [submittedFeedback, setSubmittedFeedback] = useState<{
    status: "correct" | "incorrect";
    text: string;
    chosenLabel?: string;
  } | null>(initialFeedback);

  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (submittedFeedback && feedbackRef.current) {
      feedbackRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [submittedFeedback]);

  const onSaveStateRef = useRef(onSaveState);
  useEffect(() => {
    onSaveStateRef.current = onSaveState;
  });

  const currentStateRef = useRef<StepPredictSavedState>({
    selectedOptionId,
    confidence,
    reasoning,
    useLlm,
    submittedFeedback,
    llmAnalysis,
  });

  useEffect(() => {
    currentStateRef.current = {
      selectedOptionId,
      confidence,
      reasoning,
      useLlm,
      submittedFeedback,
      llmAnalysis,
    };
  }, [selectedOptionId, confidence, reasoning, useLlm, submittedFeedback, llmAnalysis]);

  // Persist state when unmounting or navigating away
  useEffect(() => {
    return () => {
      if (currentStateRef.current) {
        onSaveStateRef.current?.(currentStateRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOptionId || isSubmitting || isAnalyzingLlm) return;

    let newFeedback: {
      status: "correct" | "incorrect";
      text: string;
      chosenLabel?: string;
    } | null = null;

    // 1. Immediate feedback: Prediction evaluation is deterministic and available immediately in step.evaluation
    if (evaluation) {
      const chosen = evaluation.options.find((o) => o.id === selectedOptionId);
      if (chosen) {
        newFeedback = {
          status: chosen.isCorrect ? "correct" : "incorrect",
          text: chosen.feedback ?? (chosen.isCorrect ? evaluation.feedbackCorrect : "Prediksi belum tepat."),
          chosenLabel: chosen.label,
        };
        setSubmittedFeedback(newFeedback);
        onSaveState?.({
          selectedOptionId,
          confidence,
          reasoning,
          useLlm,
          submittedFeedback: newFeedback,
          llmAnalysis,
        });
      }
    }

    let fetchedLlmAnalysis: AiPredictAnalysis | null = null;

    // 2. If user requested LLM analysis, fetch from /api/v1/ai/predict
    setLlmError(null);
    if (useLlm && conceptSlug) {
      setIsAnalyzingLlm(true);
      try {
        const aiRes = await fetch("/api/v1/ai/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conceptSlug,
            stepId: step.id,
            selectedOptionId,
            confidence,
            reasoning: reasoning.trim() || undefined,
            provider: selectedProvider,
            model: selectedModel,
          }),
        });
        const aiJson = await aiRes.json().catch(() => null);
        if (aiRes.ok && aiJson?.data) {
          fetchedLlmAnalysis = aiJson.data;
          setLlmAnalysis(fetchedLlmAnalysis);
          onSaveState?.({
            selectedOptionId,
            confidence,
            reasoning,
            useLlm,
            submittedFeedback: newFeedback,
            llmAnalysis: fetchedLlmAnalysis,
          });
        } else {
          const errorMsg =
            aiJson?.error?.message ||
            (aiRes.status === 429
              ? `Batas kuota atau rate limit model ${activeModelLabel || "AI"} sedang penuh (HTTP 429). Silakan tunggu beberapa saat atau coba model lain.`
              : "Analisis nalar AI tidak dapat dimuat saat ini.");
          setLlmError(errorMsg);
        }
      } catch (err) {
        console.warn("AI Predict analysis request failed:", err);
        setLlmError("Terjadi kendala jaringan saat menghubungi model AI. Hipotesismu tetap berhasil tercatat.");
      } finally {
        setIsAnalyzingLlm(false);
      }
    }

    // 3. Submit attempt in background to record progress and mastery
    await onSubmit({ selectedOptionId, confidence, reasoning, useLlm }, usedHintsCount);
  };

  const handleRetry = () => {
    setSubmittedFeedback(null);
    setLlmAnalysis(null);
    setLlmError(null);
    onSaveStateRef.current?.({
      selectedOptionId,
      confidence,
      reasoning,
      useLlm,
      submittedFeedback: null,
      llmAnalysis: null,
    });
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
            <fieldset className="space-y-2.5" disabled={isSubmitting || !!submittedFeedback}>
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
                  } ${submittedFeedback ? "cursor-default opacity-90" : ""}`}
                >
                  <input
                    type="radio"
                    name="predict-option"
                    value={option.id}
                    checked={selectedOptionId === option.id}
                    onChange={() => setSelectedOptionId(option.id)}
                    disabled={isSubmitting || !!submittedFeedback}
                    className="mt-0.5 w-4 h-4 text-accent focus:ring-accent border-border shrink-0"
                  />
                  <div className="text-xs sm:text-sm flex-1 leading-relaxed">
                    <MathRenderer content={option.label} />
                  </div>
                </label>
              ))}
            </fieldset>

            {!submittedFeedback && (
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

                {/* 4. Opsi Gunakan LLM dengan Warning Sedikit Lama */}
                <div className="p-3 sm:p-3.5 rounded-xl border border-border bg-surface/70 space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="predict-use-llm" className="flex items-center gap-2 cursor-pointer select-none">
                      <Sparkles className={`w-4 h-4 transition-colors ${useLlm ? "text-accent" : "text-text-muted"}`} />
                      <span className="text-xs sm:text-sm font-semibold text-text">
                        Gunakan AI / LLM untuk Analisis Nalar Hipotesis
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      {activeModelLabel && (
                        <span className="hidden sm:inline-block text-3xs font-mono px-2 py-0.5 rounded-full bg-surface-raised border border-border text-text-muted">
                          {activeModelLabel}
                        </span>
                      )}
                      <input
                        id="predict-use-llm"
                        type="checkbox"
                        checked={useLlm}
                        onChange={(e) => setUseLlm(e.target.checked)}
                        disabled={isCompleted || isSubmitting || isAnalyzingLlm}
                        className="w-4 h-4 rounded border-border text-accent focus:ring-accent cursor-pointer"
                      />
                    </div>
                  </div>

                  {useLlm && (
                    <div className="flex items-start gap-2 text-2xs sm:text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-2.5 rounded-lg leading-relaxed animate-in fade-in duration-200">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div>
                          <strong>Perhatian:</strong> Analisis mendalam dengan model <strong>{activeModelLabel || "LLM"}</strong> memerlukan waktu <strong>sedikit lebih lama</strong> (~3–8 detik) karena model AI memproses penalaran, tingkat keyakinan, dan intuisimu secara menyeluruh.
                        </div>
                        <div className="flex items-center gap-1 text-2xs text-text-muted">
                          <Info className="w-3 h-3 text-accent shrink-0" />
                          <span>Kecepatan respons bergantung pada beban server penyedia.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  {onPrevious ? (
                    <button
                      type="button"
                      onClick={onPrevious}
                      disabled={isSubmitting || isAnalyzingLlm}
                      className="px-4 py-2 rounded-lg text-xs font-medium border border-border hover:bg-surface text-text transition-colors disabled:opacity-50"
                    >
                      ← Langkah Sebelumnya
                    </button>
                  ) : (
                    <div />
                  )}
                  <button
                    type="submit"
                    disabled={!selectedOptionId || isSubmitting || isAnalyzingLlm}
                    className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-accent text-surface-raised hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
                  >
                    {isAnalyzingLlm ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        <span>Menganalisis dengan LLM... (sedikit lama)</span>
                      </>
                    ) : isSubmitting ? (
                      "Merekam Prediksi..."
                    ) : (
                      "Kunci & Buka Hasil Prediksi →"
                    )}
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
            role="status"
            aria-live="polite"
            className={`p-4 sm:p-5 rounded-xl border text-sm mt-3 leading-relaxed space-y-3.5 animate-in fade-in ${
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

            {reasoning && (
              <div className="text-xs bg-surface/60 border border-border rounded-lg p-2.5 text-text-muted">
                <span className="font-semibold text-text">Intuisimu saat memprediksi:</span> &ldquo;{reasoning}&rdquo;
              </div>
            )}

            {/* AI LLM Cognitive Analysis Card */}
            {isAnalyzingLlm && (
              <div className="p-3.5 sm:p-4 rounded-xl border border-accent/30 bg-surface/80 flex items-center gap-2.5 text-xs text-text-muted animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-accent shrink-0" />
                <span>Nai sedang menganalisis nalar dan intuisimu (proses LLM membutuhkan sedikit waktu)...</span>
              </div>
            )}

            {llmAnalysis && (
              <div className="p-3.5 sm:p-4 rounded-xl border border-accent/40 bg-surface/90 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-accent">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Analisis Nalar oleh Nai (AI LLM)</span>
                  </span>
                  {llmAnalysis.model && (
                    <span className="text-2xs font-mono px-2 py-0.5 rounded-full bg-surface-raised border border-border text-text-muted">
                      {llmAnalysis.model}
                    </span>
                  )}
                </div>

                {llmAnalysis.notice && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2 leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{llmAnalysis.notice}</span>
                  </div>
                )}

                <div className="text-xs sm:text-sm text-text leading-relaxed">
                  <MathRenderer content={llmAnalysis.cognitiveAnalysis} />
                </div>

                {llmAnalysis.misconceptionAlert && (
                  <div className="text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 text-text leading-relaxed">
                    <strong className="text-amber-700 dark:text-amber-400">Pijakan Konseptual:</strong>{" "}
                    {llmAnalysis.misconceptionAlert}
                  </div>
                )}

                {llmAnalysis.conceptualNudge && (
                  <p className="text-xs font-medium text-accent italic">
                    💡 {llmAnalysis.conceptualNudge}
                  </p>
                )}
              </div>
            )}

            {/* LLM Error or Rate Limit Banner */}
            {llmError && (
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5 leading-relaxed animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-900 dark:text-amber-200">Catatan Analisis AI:</strong>
                  <span>{llmError}</span>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                {onPrevious && (
                  <button
                    type="button"
                    onClick={onPrevious}
                    className="px-4 py-2 rounded-lg text-xs font-medium border border-border hover:bg-surface text-text transition-colors"
                  >
                    ← Langkah Sebelumnya
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleRetry}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 shadow-2xs ${
                    submittedFeedback.status === "incorrect"
                      ? "border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300"
                      : "border-border bg-surface hover:bg-surface-raised text-text-muted"
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    {submittedFeedback.status === "incorrect"
                      ? "Ulangi & Pilih Hipotesis Lain"
                      : "Uji Hipotesis Lain"}
                  </span>
                </button>
              </div>

              {onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-accent text-surface-raised hover:bg-accent-hover transition-colors shadow-sm flex items-center gap-2 ml-auto"
                >
                  <span>Lanjutkan ke Pembuktian Konsep</span>
                  <span>→</span>
                </button>
              )}
            </div>
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
