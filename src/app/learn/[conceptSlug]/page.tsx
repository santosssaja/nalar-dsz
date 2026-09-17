import React from "react";
import { notFound } from "next/navigation";
import { getConceptBySlug } from "@/content/loader";
import { resolveActor } from "@/server/auth/actor-resolver";
import { getLearnerConceptProgress } from "@/server/services/learning-service";
import { LessonPlayer } from "@/features/learning/components/lesson-player";

export const dynamic = "force-dynamic";

export default async function LearnConceptPage({
  params,
}: {
  params: Promise<{ conceptSlug: string }>;
}) {
  const { conceptSlug } = await params;
  const concept = getConceptBySlug(conceptSlug);

  if (!concept) {
    notFound();
  }

  const actor = await resolveActor();
  const progress = await getLearnerConceptProgress(actor, concept.id);

  return (
    <div className="py-2">
      <LessonPlayer
        concept={concept}
        initialProgress={progress}
        moduleSlug="turunan"
      />
    </div>
  );
}
