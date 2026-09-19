import { createHash } from "crypto";
import { StepContent } from "./schema";

export interface ContentVersionRef {
  id: string;
  checksum: string;
  payload: StepContent;
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sortValue(item));
  }
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(record).sort()) {
      sorted[key] = sortValue(record[key]);
    }
    return sorted;
  }
  return value;
}

export function checksumOfStep(step: StepContent): string {
  return createHash("sha256")
    .update(stableStringify(step))
    .digest("hex");
}

export function contentVersionIdOfStep(step: StepContent): string {
  return uuidFromChecksum(checksumOfStep(step));
}

export function contentVersionOfStep(step: StepContent): ContentVersionRef {
  const checksum = checksumOfStep(step);
  return {
    id: uuidFromChecksum(checksum),
    checksum,
    payload: step,
  };
}

function uuidFromChecksum(hex: string): string {
  const chars = hex.slice(0, 32).split("");
  chars[12] = "5";
  const clkSeq = parseInt(chars[16], 16);
  chars[16] = ((clkSeq & 0x3) | 0x8).toString(16);
  const u = chars.join("");
  return `${u.slice(0, 8)}-${u.slice(8, 12)}-${u.slice(12, 16)}-${u.slice(16, 20)}-${u.slice(20, 32)}`;
}