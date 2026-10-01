import type { CloudProviderId } from "@/lib/cloud-provider-config";

export type AIProcessingMode = "local" | "cloud";

export type CompressionLevel = "light" | "balanced" | "high";

export interface CapsuleGenerationConfig {
  processingMode: AIProcessingMode;
  compressionLevel: CompressionLevel;
  cloudProvider?: CloudProviderId;
  cloudModel?: string;
}

export type CapsuleSection = string[];

export type CapsuleData = {
  title: string;
  goal: string;
  project: string;
  importantContext: string[];
  requirements: string[];
  decisions: string[];
  progress: string[];
  problems: string[];
  files: string[];
  preferences: string[];
  nextSteps: string[];
  summary: string;
  handoffInstructions: string;
  originalLength: number;
  capsuleLength: number;
  reductionPercentage: number;
  compressionLevel: CompressionLevel;
  compressionLabel: string;
};

export type GenerationResult = {
  capsule: CapsuleData;
  portableText: string;
  handoffPrompt: string;
};
