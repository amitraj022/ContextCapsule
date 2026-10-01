import { generateLocalCapsule } from "@/lib/capsule-engine";
import { CLOUD_PROVIDER_CONFIG, type CloudProviderId } from "@/lib/cloud-provider-config";
import type {
  AIProcessingMode,
  CapsuleGenerationConfig,
  CompressionLevel,
  GenerationResult,
} from "@/lib/capsule-types";

export const DEFAULT_LOCAL_MODEL = "qwen3.5:9b";
export const DEFAULT_CLOUD_PROVIDER: CloudProviderId = "gemini";

export type GenerationSource = "ollama" | "gemini" | "groq" | "fallback";

export type GenerationWithMetadata = GenerationResult & {
  source: GenerationSource;
  model?: string;
  note?: string;
};

export const PROCESSING_MODE_DETAILS: Record<
  AIProcessingMode,
  {
    label: string;
    shortLabel: string;
    description: string;
    secondary: string;
    status: string;
    infoText: string;
  }
> = {
  local: {
    label: "Local AI",
    shortLabel: "Local AI",
    description: "Run the AI model on your own computer.",
    secondary: "More private. Requires a supported local AI runtime.",
    status: "Not connected",
    infoText: "Local AI runtime is not connected yet. Using prototype fallback for now.",
  },
  cloud: {
    label: "Cloud AI",
    shortLabel: "Cloud AI",
    description: "Use an online AI provider through an API.",
    secondary: "Requires an API key.",
    status: "Not configured",
    infoText: "Cloud AI requires a configured provider and valid API key. Using prototype fallback until configured.",
  },
};

export interface AIProvider {
  readonly mode: AIProcessingMode;
  readonly displayName: string;
  readonly statusLabel: string;
  readonly infoText: string;
  generate(conversation: string, compressionLevel: CompressionLevel): Promise<GenerationWithMetadata> | GenerationWithMetadata;
}

class LocalFallbackProvider implements AIProvider {
  readonly mode: AIProcessingMode = "local";
  readonly displayName = "Local AI";
  readonly statusLabel = "Not connected";
  readonly infoText = "Local AI runtime is not connected yet. Using prototype fallback for now.";

  async generate(conversation: string, compressionLevel: CompressionLevel): Promise<GenerationWithMetadata> {
    const fallback = generateLocalCapsule(conversation, compressionLevel);
    return {
      ...fallback,
      source: "fallback",
      note: "Local AI unavailable — using built-in compression.",
      model: DEFAULT_LOCAL_MODEL,
    };
  }
}

class CloudFallbackProvider implements AIProvider {
  readonly mode: AIProcessingMode = "cloud";
  readonly displayName = "Cloud AI";
  readonly statusLabel = "Not configured";
  readonly infoText = "Cloud AI requires a configured provider and valid API key. Using prototype fallback until configured.";

  async generate(conversation: string, compressionLevel: CompressionLevel): Promise<GenerationWithMetadata> {
    const fallback = generateLocalCapsule(conversation, compressionLevel);
    return {
      ...fallback,
      source: "fallback",
      note: "Cloud AI integration not configured yet.",
      model: DEFAULT_CLOUD_PROVIDER,
    };
  }
}

export const localAIProvider = new LocalFallbackProvider();
export const cloudAIProvider = new CloudFallbackProvider();

export function getProviderForMode(mode: AIProcessingMode): AIProvider {
  return mode === "local" ? localAIProvider : cloudAIProvider;
}

export function buildCapsuleGenerationConfig(
  processingMode: AIProcessingMode,
  compressionLevel: CompressionLevel,
  cloudProvider: CloudProviderId = DEFAULT_CLOUD_PROVIDER,
  cloudModel?: string,
): CapsuleGenerationConfig {
  return {
    processingMode,
    compressionLevel,
    cloudProvider,
    cloudModel: cloudModel ?? CLOUD_PROVIDER_CONFIG[cloudProvider].defaultModel,
  };
}

export async function generateCapsuleWithProvider(
  conversation: string,
  config: CapsuleGenerationConfig,
): Promise<GenerationWithMetadata> {
  if (config.processingMode === "cloud") {
    try {
      const provider = config.cloudProvider ?? DEFAULT_CLOUD_PROVIDER;
      const model = config.cloudModel ?? CLOUD_PROVIDER_CONFIG[provider].defaultModel;
      const response = await fetch("/api/capsule/cloud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation,
          compression: config.compressionLevel,
          provider,
          model,
        }),
      });

      const data = (await response.json().catch(() => null)) as (GenerationWithMetadata & {
        meta?: { source?: GenerationSource; model?: string; compression?: CompressionLevel; fallback?: boolean };
        error?: string;
      }) | null;

      if (!response.ok) {
        throw new Error(data?.error || "Cloud AI request failed.");
      }

      if (!data?.portableText || !data?.capsule) {
        throw new Error("Cloud AI returned an invalid capsule.");
      }

      if (data.meta?.fallback !== false || data.meta?.source !== provider || data.meta?.model !== model || data.meta?.compression !== config.compressionLevel) {
        throw new Error("Cloud AI response did not match the selected provider, model, and compression.");
      }

      return {
        ...data,
        source: data.meta?.source ?? provider,
        model: data.meta?.model ?? model,
        note: `Cloud AI connected via ${CLOUD_PROVIDER_CONFIG[provider].label}.`,
      };
    } catch (error) {
      throw error instanceof Error ? error : new Error("Cloud AI request failed.");
    }
  }

  try {
    const response = await fetch("/api/capsule/local", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation,
        compressionLevel: config.compressionLevel,
        model: DEFAULT_LOCAL_MODEL,
      }),
    });

    if (!response.ok) {
      throw new Error("Local AI request failed");
    }

    const data = (await response.json()) as GenerationWithMetadata & { model?: string; note?: string };

    if (!data?.portableText || !data?.capsule) {
      throw new Error("Local AI response missing capsule data");
    }

    return {
      ...data,
      source: "ollama",
      model: data.model ?? DEFAULT_LOCAL_MODEL,
      note: "Local AI connected via Ollama.",
    };
  } catch {
    const fallback = generateLocalCapsule(conversation, config.compressionLevel);
    return {
      ...fallback,
      source: "fallback",
      note: "Local AI unavailable — using built-in compression.",
      model: DEFAULT_LOCAL_MODEL,
    };
  }
}
