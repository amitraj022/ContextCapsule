export type { CapsuleData, CompressionLevel } from "@/lib/capsule-types";
export {
  generateCapsule,
  generateLocalCapsule,
  formatCapsule,
  buildHandoffPrompt,
  getConversationStats,
} from "@/lib/capsule-engine";

import type { CapsuleData, CompressionLevel } from "@/lib/capsule-types";
import { buildHandoffPrompt, formatCapsule, generateLocalCapsule } from "@/lib/capsule-engine";

export function buildCapsuleFromText(text: string, compressionLevel: CompressionLevel = "balanced"): CapsuleData {
  return generateLocalCapsule(text, compressionLevel).capsule;
}

export function serializeCapsule(capsule: CapsuleData) {
  return formatCapsule(capsule);
}

export function buildCapsuleHandoffPrompt(capsule: CapsuleData) {
  return buildHandoffPrompt(capsule);
}
