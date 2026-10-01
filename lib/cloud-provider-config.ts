export type CloudProviderId = "gemini" | "groq";

export type CloudModelOption = {
  label: string;
  id: string;
};

export type CloudProviderConfigEntry = {
  label: string;
  defaultModel: string;
  models: CloudModelOption[];
};

export const CLOUD_PROVIDER_ORDER: CloudProviderId[] = ["gemini", "groq"];

export const CLOUD_PROVIDER_CONFIG: Record<CloudProviderId, CloudProviderConfigEntry> = {
  gemini: {
    label: "Google Gemini",
    defaultModel: "gemini-3.5-flash-lite",
    models: [
      { label: "Gemini 3.5 Flash-Lite", id: "gemini-3.5-flash-lite" },
      { label: "Gemini 3.8 Flash", id: "gemini-3.8-flash" },
      { label: "Gemini 3.7 Flash", id: "gemini-3.7-flash" },
    ],
  },
  groq: {
    label: "Groq",
    defaultModel: "openai/gpt-oss-20b",
    models: [
      { label: "GPT-OSS 20B", id: "openai/gpt-oss-20b" },
      { label: "GPT-OSS 120B", id: "openai/gpt-oss-120b" },
      { label: "Qwen 3.8 27B", id: "qwen/qwen3.8-27b" },
    ],
  },
};
