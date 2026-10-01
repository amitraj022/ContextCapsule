import { NextResponse } from "next/server";
import {
  CLOUD_PROVIDER_CONFIG,
  CLOUD_PROVIDER_ORDER,
  buildCloudCapsuleData,
  callCloudProvider,
  formatCloudCapsule,
  getCloudProviderModel,
} from "@/lib/cloud-providers";
import type { CloudProviderId } from "@/lib/cloud-provider-config";
import type { CompressionLevel } from "@/lib/capsule-types";

const API_KEY_CONFIGURED: Record<CloudProviderId, boolean> = {
  gemini: Boolean(process.env.GEMINI_API_KEY),
  groq: Boolean(process.env.GROQ_API_KEY),
};

function getProviderStatus() {
  return Object.fromEntries(
    CLOUD_PROVIDER_ORDER.map((provider) => {
      const config = CLOUD_PROVIDER_CONFIG[provider];
      return [provider, {
        configured: API_KEY_CONFIGURED[provider],
        label: config.label,
        defaultModel: config.defaultModel,
      }];
    }),
  );
}

export async function GET() {
  return NextResponse.json({
    providers: getProviderStatus(),
    defaultProvider: "gemini",
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      conversation?: string;
      compression?: CompressionLevel;
      compressionLevel?: CompressionLevel;
      provider?: string;
      model?: string;
    };

    const conversation = (body.conversation ?? "").trim();
    if (!conversation) {
      return NextResponse.json({ error: "Conversation is required" }, { status: 400 });
    }

    const compressionLevel = body.compression ?? body.compressionLevel ?? "balanced";
    if (!["light", "balanced", "high"].includes(compressionLevel)) {
      return NextResponse.json({ error: "Invalid compression level" }, { status: 400 });
    }
    const providerId = (body.provider ?? "gemini") as CloudProviderId;
    const providerConfig = CLOUD_PROVIDER_CONFIG[providerId];

    if (!providerConfig) {
      return NextResponse.json({ error: "Invalid cloud provider", provider: body.provider }, { status: 400 });
    }

    const modelId = getCloudProviderModel(providerId, body.model ?? providerConfig.defaultModel);
    if (!API_KEY_CONFIGURED[providerId]) {
      const friendlyError = {
        gemini: "Gemini API key is not configured.",
        groq: "Groq API key is not configured.",
      }[providerId];

      return NextResponse.json({
        error: friendlyError,
        fallback: false,
      }, { status: 401 });
    }

    const rawText = await callCloudProvider(providerId, modelId, conversation, compressionLevel);
    const extractedText = formatCloudCapsule(rawText);
    const generatedCapsule = buildCloudCapsuleData(extractedText, compressionLevel);

    return NextResponse.json({
      portableText: extractedText,
      capsule: {
        ...generatedCapsule,
        originalLength: conversation.length,
        capsuleLength: extractedText.length,
        reductionPercentage: Math.max(0, Math.round(((conversation.length - extractedText.length) / Math.max(1, conversation.length)) * 100)),
      },
      handoffPrompt: [
        "Continue from the context above.",
        "Do not restart completed work.",
        "Resolve remaining issues and continue from the current state and next steps.",
        "",
        extractedText,
      ].join("\n"),
      meta: {
        source: providerId,
        model: modelId,
        compression: compressionLevel,
        fallback: false,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const safeProviderError = /^(?:Google Gemini|Groq) request failed \(HTTP [45]\d\d\)\.$/.test(message)
      ? message
      : "Cloud AI request failed.";
    return NextResponse.json({
      error: safeProviderError,
      fallback: false,
    }, { status: 502 });
  }
}
