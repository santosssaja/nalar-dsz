import type { LucideIcon } from "lucide-react";

export type LabStationId =
  | "number-line"
  | "fraction-ratio"
  | "pattern-exponent"
  | "calculus"
  | "vector"
  | "projectile"
  | "newton-dynamics"
  | "oscillation"
  | "periodic-atom"
  | "chemical-bonding"
  | "matter"
  | "biology"
  | "cell-structure"
  | "biological-energy";

export interface LabStation {
  id: LabStationId;
  title: string;
  domain: string;
  domainSlug: string;
  badgeColor: string;
  icon: LucideIcon;
  description: string;
  moduleSlug: string;
  moduleTitle: string;
}
