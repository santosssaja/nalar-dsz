"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { ConceptContent, StepContent } from "@/content/schema";
import { ConceptMasterySnapshot } from "@/server/services/mastery-engine";
import { MathRenderer } from "@/components/ui/katex-math";
import { StepPredict } from "./step-predict";
import { StepExplore } from "./step-explore";
import { StepPractice } from "./step-practice";
import { StepExplain } from "./step-explain";
import { LessonSummary } from "./lesson-summary";
import { NaiTutorDrawer } from "./nai-tutor-drawer";
import { TeachModeModal } from "./teach-mode-modal";
import { EvaluationResult } from "@/server/services/evaluator";
import {
  queueOutboxEvent,
  flushOutbox,
  getPendingOutboxEvents,
} from "../lib/outbox";

interface LessonPlayerProps {
  concept: ConceptContent;
  initialProgress: ConceptMasterySnapshot | null;
  moduleSlug: string;
}

export function LessonPlayer({
  concept,
  initialProgress,
  moduleSlug,
}: LessonPlayerProps) {
  const steps = concept.steps;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [masterySnapshot, setMasterySnapshot] = useState<ConceptMasterySnapshot | null>(
    initialProgress
  );
  const [isFinished, setIsFinished] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isTeachModeOpen, setIsTeachModeOpen] = useState(false);

  const currentStep: StepContent = steps[currentStepIndex];
  const isCurrentCompleted = completedStepIds.includes(currentStep?.id);

  // Generate or retrieve persistent UUID idempotency key per step
  const [stepIdempotencyKeys] = useState<Map<string, string>>(() => new Map());

  const getIdempotencyKey = (stepId: string) => {
    let key = stepIdempotencyKeys.get(stepId);
    if (!key) {
      key =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : "a0000000-0000-4000-8000-" +
            Math.random().toString(16).substring(2, 14).padEnd(12, "0");
      stepIdempotencyKeys.set(stepId, key);
    }
    return key;
  };

  // Check online status & check outbox on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);

      const handleOnline = async () => {
        setIsOffline(false);
        const res = await flushOutbox();
        if (res.synced > 0) {
          setPendingSyncCount(0);
        }
      };

      const handleOffline = () => {
        setIsOffline(true);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      getPendingOutboxEvents().then((events) => {
        setPendingSyncCount(events.length);
      });

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  // Automatically reset scroll to top on every step transition and completion
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [currentStepIndex, isFinished]);

  const handleStepSubmit = async (
    response: Record<string, unknown>,
    usedHintsCount = 0
  ): Promise<EvaluationResult | null> => {
    setIsSubmitting(true);
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        throw new Error("Koneksi offline");
      }

      const res = await fetch("/api/v1/attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": getIdempotencyKey(currentStep.id),
        },
        body: JSON.stringify({
          stepId: currentStep.id,
          response,
          usedHintsCount,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        const { evaluation, progress } = json.data;

        if (evaluation.status === "correct" || currentStep.kind === "predict") {
          if (!completedStepIds.includes(currentStep.id)) {
            setCompletedStepIds((prev) => [...prev, currentStep.id]);
          }
        }

        if (progress) {
          setMasterySnapshot({
            ...progress.dimensions,
            status: progress.status,
          });
        }

        return evaluation;
      } else {
        console.error("Submission failed:", json.error);
        return null;
      }
    } catch (err) {
      console.warn("Attempt submission offline or failed, queuing into outbox:", err);
      // Queue into IndexedDB outbox for local-first resilience
      await queueOutboxEvent(currentStep.id, response, usedHintsCount);
      setIsOffline(true);
      setPendingSyncCount((prev) => prev + 1);

      if (!completedStepIds.includes(currentStep.id)) {
        setCompletedStepIds((prev) => [...prev, currentStep.id]);
      }

      return {
        status: "correct",
        feedback: "Jawaban tersimpan aman di perangkat (Mode Offline). Progres akan disinkronkan saat kembali online.",
        misconceptionCodes: [],
        availableHintLevel: "orientation",
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (!completedStepIds.includes(currentStep.id)) {
      setCompletedStepIds((prev) => [...prev, currentStep.id]);
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  if (isFinished) {
    return (
      <LessonSummary
        concept={concept}
        masterySnapshot={masterySnapshot}
        moduleSlug={moduleSlug}
      />
    );
  }

  const progressPercentage = Math.round(
    ((currentStepIndex + 1) / steps.length) * 100
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-5">
      {/* Top Navigation & Stepper */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="min-w-0">
          <Link
            href={`/modules/${moduleSlug}`}
            className="text-xs text-text-muted hover:text-text transition-colors flex items-center gap-1"
          >
            ← Keluar ke Modul
          </Link>
          <h2 className="text-sm sm:text-base font-bold text-text truncate mt-0.5">{concept.title}</h2>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Teach Mode trigger */}
          <button
            type="button"
            onClick={() => setIsTeachModeOpen(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border hover:border-accent hover:bg-surface-raised text-text transition-all flex items-center gap-1.5 shadow-2xs"
            title="Uji pemahamanmu dengan mengajarkan konsep ini kepada Nai"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ajari Nai</span>
          </button>

          {/* Offline indicator */}
          {isOffline && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="hidden sm:inline">Offline {pendingSyncCount > 0 ? `(${pendingSyncCount})` : ""}</span>
            </div>
          )}

          <div className="text-right">
            <span className="text-xs font-semibold text-text-muted">
              Langkah {currentStepIndex + 1} dari {steps.length}
            </span>
            <div
              className="w-24 sm:w-36 h-1.5 rounded-full bg-surface border border-border mt-1 overflow-hidden"
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progres pelajaran: ${progressPercentage}%`}
            >
              <div
                className="h-full bg-accent transition-all duration-300 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Step Content Renderer */}
      {currentStep.kind === "predict" ? (
        <StepPredict
          step={currentStep}
          isCompleted={isCurrentCompleted}
          onSubmit={async (resp, hintsCount) => {
            await handleStepSubmit(resp, hintsCount);
          }}
          onNext={handleNextStep}
          onPrevious={handlePreviousStep}
          isSubmitting={isSubmitting}
        />
      ) : currentStep.kind === "explore" ? (
        <StepExplore
          step={currentStep}
          conceptSlug={concept.slug}
          isCompleted={isCurrentCompleted}
          onCompleted={handleNextStep}
        />
      ) : currentStep.kind === "practice" ? (
        <StepPractice
          step={currentStep}
          isCompleted={isCurrentCompleted}
          onSubmit={handleStepSubmit}
          isSubmitting={isSubmitting}
          onNext={handleNextStep}
        />
      ) : currentStep.kind === "explain" ? (
        <StepExplain
          step={currentStep}
          conceptSlug={concept.slug}
          rubricCriteria={concept.rubric?.criteria}
          isCompleted={isCurrentCompleted}
          onCompleted={handleNextStep}
        />
      ) : (
        /* encounter, understand, retrieve, etc. */
        <div className="p-4 sm:p-5 rounded-xl bg-surface-raised border border-border space-y-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-muted text-accent capitalize">
              <span>{currentStep.kind}</span>
              <span>•</span>
              <span>Langkah {currentStep.sortOrder}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-text">{currentStep.title}</h3>
            <MathRenderer
              content={currentStep.instruction}
              inline
              as="p"
              className="text-xs sm:text-sm font-medium text-text-muted"
            />
          </div>

          <div className="text-sm text-text border-t border-border-subtle pt-3 leading-relaxed">
            <MathRenderer content={currentStep.content} />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={handlePreviousStep}
              disabled={currentStepIndex === 0}
              className="px-3.5 py-2 rounded-lg text-xs font-medium border border-border hover:bg-surface text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Langkah Sebelumnya
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-accent text-surface-raised hover:bg-accent-hover transition-colors shadow-sm"
            >
              Lanjutkan →
            </button>
          </div>
        </div>
      )}

      {/* Teach Mode Modal */}
      <TeachModeModal
        concept={concept}
        isOpen={isTeachModeOpen}
        onClose={() => setIsTeachModeOpen(false)}
      />

      {/* Floating AI Socratic Tutor Nai */}
      <NaiTutorDrawer
        conceptSlug={concept.slug}
        stepId={currentStep?.id}
        stepTitle={currentStep?.title}
      />
    </div>
  );
}
