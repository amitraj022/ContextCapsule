"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { CapsuleEditor } from "@/components/capsule/CapsuleEditor";
import { CapsuleResult } from "@/components/capsule/CapsuleResult";
import { ConversationInput } from "@/components/capsule/ConversationInput";
import { ProcessingState } from "@/components/capsule/ProcessingState";
import { formatCapsule, getConversationStats, serializeCapsule } from "@/components/capsule/capsuleUtils";
import { PROCESSING_MODE_DETAILS, buildCapsuleGenerationConfig, generateCapsuleWithProvider, type GenerationSource } from "@/lib/ai-provider";
import { CLOUD_PROVIDER_CONFIG, CLOUD_PROVIDER_ORDER, type CloudProviderId } from "@/lib/cloud-provider-config";
import type { AIProcessingMode, CapsuleData, CapsuleGenerationConfig, CompressionLevel } from "@/lib/capsule-types";
import { ThemeToggle } from "@/components/ThemeProvider";

type CreateStatus = "idle" | "processing" | "generated" | "error";

const sampleConversation = `User: I want to build a lightweight project dashboard for our product team.
AI: We can start by mapping the core workflow and the user goals.
User: The app should help us track tasks, decisions, blockers, and project progress in a minimal interface.
AI: That makes sense. We need a dark-first design and a clean structure so the team can scan status quickly.
User: Also the project should support collaboration notes, upcoming tasks, and a review flow before shipping.
AI: We also need to preserve context when work is handed off between AI tools.
User: The main goal is to continue from where we left off without re-explaining the whole project.
AI: We will define the feature around a Context Capsule that summarizes the important details and actions.
User: The prototype should track the goal, requirements, technical context, and next steps.
AI: Good. We can keep the current logic local and run it in the browser to validate the UX before adding any API integrations.
User: We should avoid using external AI APIs right now. We need a local prototype that works without any paid services.
AI: We will build a structured local engine and keep the final output clean enough for another AI assistant to continue the work.
User: After that, we can replace the local heuristic engine with a real AI-powered version later.
AI: Great. We should also add a sample conversation, validation states, and simple copy/download functionality before finalizing the product flow.`;

/**
 * Product state (UI only): Local AI / Ollama is temporarily unavailable.
 * The Ollama integration and the /api/capsule/local route are intentionally
 * kept intact — set this to false to re-enable the existing local flow.
 */
const LOCAL_AI_COMING_SOON = true;

export default function CreatePage() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<CreateStatus>("idle");
  const [activeStage, setActiveStage] = useState(0);
  const [capsule, setCapsule] = useState<CapsuleData | null>(null);
  const [capsuleText, setCapsuleText] = useState("");
  const [generationSource, setGenerationSource] = useState<GenerationSource | null>(null);
  const [copyStatus, setCopyStatus] = useState("Ready");
  const copyStatusTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProcessingMode, setSelectedProcessingMode] = useState<AIProcessingMode>(LOCAL_AI_COMING_SOON ? "cloud" : "local");
  const [selectedCompressionLevel, setSelectedCompressionLevel] = useState<CompressionLevel>("balanced");
  const [selectedCloudProvider, setSelectedCloudProvider] = useState<CloudProviderId>("gemini");
  const [selectedCloudModel, setSelectedCloudModel] = useState<string>(CLOUD_PROVIDER_CONFIG.gemini.defaultModel);
  const [localAiStatus, setLocalAiStatus] = useState<{ available: boolean; modelAvailable: boolean; model: string; error?: string }>({
    available: false,
    modelAvailable: false,
    model: "qwen3.5:9b",
    error: "Local AI is not available",
  });
  const [cloudProviderStatus, setCloudProviderStatus] = useState<Record<string, { configured: boolean; label: string; defaultModel: string; health?: "working" | "failed" }>>({});

  const stats = useMemo(() => getConversationStats(input), [input]);
  const processingConfig = useMemo<CapsuleGenerationConfig>(
    () => buildCapsuleGenerationConfig(selectedProcessingMode, selectedCompressionLevel, selectedCloudProvider, selectedCloudModel),
    [selectedProcessingMode, selectedCompressionLevel, selectedCloudProvider, selectedCloudModel],
  );
  const configuredCloudProviderCount = CLOUD_PROVIDER_ORDER.filter((provider) => cloudProviderStatus[provider]?.configured).length;
  const workingCloudProviderCount = CLOUD_PROVIDER_ORDER.filter((provider) => cloudProviderStatus[provider]?.health === "working").length;
  const failedCloudProviderCount = CLOUD_PROVIDER_ORDER.filter((provider) => cloudProviderStatus[provider]?.health === "failed").length;
  const cloudStatusLabel = configuredCloudProviderCount === 0 || (workingCloudProviderCount === 0 && failedCloudProviderCount === configuredCloudProviderCount)
    ? "Not configured"
    : workingCloudProviderCount > 0 && failedCloudProviderCount > 0
      ? "Partially configured"
      : "Connected";

  useEffect(() => () => {
    if (copyStatusTimeout.current) clearTimeout(copyStatusTimeout.current);
  }, []);

  useEffect(() => {
    if (selectedProcessingMode !== "local") return;

    let isCurrent = true;

    fetch("/api/capsule/local", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as { available?: boolean; modelAvailable?: boolean; model?: string; error?: string };
        if (!isCurrent) return;
        setLocalAiStatus({
          available: Boolean(data.available),
          modelAvailable: Boolean(data.modelAvailable),
          model: data.model || "qwen3.5:9b",
          error: data.error,
        });
      })
      .catch(() => {
        if (!isCurrent) return;
        setLocalAiStatus({ available: false, modelAvailable: false, model: "qwen3.5:9b", error: "Local AI is not available" });
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedProcessingMode]);

  useEffect(() => {
    let isCurrent = true;

    fetch("/api/capsule/cloud", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as { providers?: Record<string, { configured: boolean; label: string; defaultModel: string }> };
        if (!isCurrent) return;
        setCloudProviderStatus(data.providers ?? {});
      })
      .catch(() => {
        if (!isCurrent) return;
        setCloudProviderStatus({});
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    if (status !== "processing") return;

    const timers = [
      window.setTimeout(() => setActiveStage(0), 250),
      window.setTimeout(() => setActiveStage(1), 700),
      window.setTimeout(() => setActiveStage(2), 1400),
      window.setTimeout(() => setActiveStage(3), 2200),
      window.setTimeout(async () => {
        try {
          const result = await generateCapsuleWithProvider(input.trim(), processingConfig);
          const generated = result.capsule;
          const text = result.portableText || serializeCapsule(generated);
          if (processingConfig.processingMode === "cloud" && processingConfig.cloudProvider) {
            const provider = processingConfig.cloudProvider;
            setCloudProviderStatus((current) => ({
              ...current,
              [provider]: {
                configured: true,
                label: CLOUD_PROVIDER_CONFIG[provider].label,
                defaultModel: CLOUD_PROVIDER_CONFIG[provider].defaultModel,
                health: "working",
              },
            }));
          }
          setCapsule(generated);
          setCapsuleText(text);
          setGenerationSource(result.source);
          setStatus("generated");
          setCopyStatus("Capsule ready");
          setIsEditing(false);
        } catch (error) {
          if (processingConfig.processingMode === "cloud" && processingConfig.cloudProvider) {
            const provider = processingConfig.cloudProvider;
            setCloudProviderStatus((current) => ({
              ...current,
              [provider]: {
                configured: current[provider]?.configured ?? true,
                label: CLOUD_PROVIDER_CONFIG[provider].label,
                defaultModel: CLOUD_PROVIDER_CONFIG[provider].defaultModel,
                health: "failed",
              },
            }));
          }
          setStatus("error");
          setErrorMessage(error instanceof Error ? error.message : "AI generation failed. Please try again.");
        }
      }, 3100),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [input, processingConfig, status]);

  const handleCreate = () => {
    const trimmed = input.trim();

    if (!trimmed) {
      setStatus("error");
      setErrorMessage("Please paste a conversation before creating a capsule.");
      return;
    }

    if (trimmed.length < 30) {
      setStatus("error");
      setErrorMessage("This conversation is too short to build a useful capsule. Add more context and try again.");
      return;
    }

    if (LOCAL_AI_COMING_SOON && selectedProcessingMode === "local") {
      setStatus("error");
      setErrorMessage("Local AI is coming soon. Please choose Cloud AI to create a capsule.");
      return;
    }

    if (selectedProcessingMode === "cloud") {
      const providerConfig = cloudProviderStatus[selectedCloudProvider];
      if (!providerConfig?.configured) {
        setStatus("error");
        setErrorMessage(`${CLOUD_PROVIDER_CONFIG[selectedCloudProvider].label} API key is not configured.`);
        return;
      }
    }

    try {
      setCapsule(null);
      setCapsuleText("");
      setGenerationSource(null);
      setErrorMessage("");
      setActiveStage(0);
      setCopyStatus("Analyzing conversation...");
      setStatus("processing");
      setIsEditing(false);
    } catch {
      setStatus("error");
      setErrorMessage("Unexpected generation error. Please try again.");
    }
  };

  const handleClear = () => {
    setInput("");
    setCapsule(null);
    setCapsuleText("");
    setGenerationSource(null);
    setStatus("idle");
    setActiveStage(0);
    setCopyStatus("Ready");
    setErrorMessage("");
    setIsEditing(false);
  };

  const handleUseSample = () => {
    setInput(sampleConversation);
    setStatus("idle");
    setCapsule(null);
    setCapsuleText("");
    setGenerationSource(null);
    setErrorMessage("");
    setCopyStatus("Ready");
    setIsEditing(false);
  };

  const handleCreateNew = () => {
    setCapsule(null);
    setCapsuleText("");
    setGenerationSource(null);
    setInput("");
    setStatus("idle");
    setActiveStage(0);
    setCopyStatus("Ready");
    setErrorMessage("");
    setIsEditing(false);
  };

  const handleCopyCapsule = async () => {
    try {
      await navigator.clipboard.writeText(capsuleText);
      setCopyStatus("Copied!");
    } catch {
      setCopyStatus("Clipboard unavailable. Try again.");
    }

    if (copyStatusTimeout.current) clearTimeout(copyStatusTimeout.current);
    copyStatusTimeout.current = setTimeout(() => setCopyStatus("Capsule ready"), 1800);
  };

  const handleDownload = () => {
    if (!capsuleText) {
      setStatus("error");
      setErrorMessage("There is no capsule to download yet.");
      return;
    }

    try {
      const slug = (capsule?.title || "context-capsule")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "context-capsule";

      const blob = new Blob([capsuleText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `context-capsule-${slug}.txt`;
      anchor.click();
      URL.revokeObjectURL(url);
      setCopyStatus("Downloaded");
    } catch {
      setStatus("error");
      setErrorMessage("Could not create the download file.");
    }
  };

  const handleEditorSave = (nextCapsule: CapsuleData) => {
    setCapsule(nextCapsule);
    setCapsuleText(formatCapsule(nextCapsule));
    setIsEditing(false);
    setCopyStatus("Capsule updated");
  };

  const handleRegenerate = () => {
    setCapsule(null);
    setCapsuleText("");
    setErrorMessage("");
    setActiveStage(0);
    setCopyStatus("Generating capsule...");
    setStatus("processing");
    setIsEditing(false);
  };

  const createDisabled = !input.trim() || status === "processing";

  return (
      <main className="page-shell min-h-screen bg-[var(--background)] text-[var(--text)]">
        <div className="aurora" aria-hidden="true" />
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <header className="glass-card scroll-reveal mb-8 flex items-center justify-between gap-3 rounded-full border px-4 py-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 text-base font-medium tracking-[-0.04em] text-[var(--text)]">
                <span className="glass-card flex h-8 w-8 items-center justify-center rounded-xl border text-[var(--muted-strong)]">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                ContextCapsule
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/"
                className="glass-interactive rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-2 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--text)]"
              >
                Back to Home
              </Link>
              <ThemeToggle />
            </div>
          </header>

          <div className="mx-auto max-w-5xl pb-12">
            <div className="scroll-reveal mb-8 text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Portable project memory</p>
              <h1 className="mt-3 text-4xl font-semibold text-[var(--text)] sm:text-5xl">
                Create a Context Capsule
              </h1>
              <p className="mt-4 text-base leading-7 text-[var(--muted)]">
                Paste a conversation and turn it into a compact, portable context capsule for another AI.
              </p>
            </div>

            {status === "error" ? (
              <div className="glass-card mb-6 rounded-[28px] border p-4 text-sm leading-7 text-[var(--muted-strong)]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Error</p>
                <p className="mt-2">{errorMessage}</p>
              </div>
            ) : null}

            {status === "idle" || status === "error" ? (
              <div className="space-y-6">
                <ConversationInput value={input} onChange={setInput} onClear={handleClear} onUseSample={handleUseSample} />

                <div className="glass-card space-y-4 rounded-[28px] border p-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">AI processing</p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {(["local", "cloud"] as const).map((mode) => {
                      const option = PROCESSING_MODE_DETAILS[mode];
                      const isLocalDisabled = mode === "local" && LOCAL_AI_COMING_SOON;
                      const isSelected = !isLocalDisabled && selectedProcessingMode === mode;
                      const isLocalConnected = mode === "local" && !LOCAL_AI_COMING_SOON && localAiStatus.available;
                      const displayStatus = mode === "local"
                        ? LOCAL_AI_COMING_SOON
                          ? "Coming soon"
                          : localAiStatus.available
                            ? "Connected"
                            : "Not connected"
                        : cloudStatusLabel;
                      const modeCardClass = isLocalDisabled
                        ? "cursor-not-allowed border-[var(--border)] bg-[var(--panel-soft)] opacity-70"
                        : [
                            "glass-interactive",
                            isSelected
                              ? "border-[var(--ring)] bg-[var(--panel-soft)] shadow-[0_12px_30px_var(--shadow)]"
                              : "border-[var(--border)] bg-[var(--panel-soft)] hover:border-[var(--ring)]",
                          ].join(" ");

                      return (
                        <button
                          key={mode}
                          type="button"
                          aria-pressed={isSelected}
                          disabled={isLocalDisabled}
                          aria-disabled={isLocalDisabled}
                          aria-label={
                            isLocalDisabled
                              ? `${option.label} processing option — coming soon, not selectable`
                              : `${option.label} processing option`
                          }
                          onClick={() => {
                            if (isLocalDisabled) return;
                            setSelectedProcessingMode(mode);
                          }}
                          className={[
                            "rounded-[22px] border px-4 py-4 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
                            modeCardClass,
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-medium tracking-[-0.04em] text-[var(--text)]">{option.label}</div>
                              <div className="mt-2 text-xs leading-5 text-[var(--muted)]">{option.description}</div>
                              <div className="mt-2 text-xs leading-5 text-[var(--muted)]">
                                {isLocalDisabled
                                  ? "Not available yet — private, on-device processing is on the way."
                                  : option.secondary}
                              </div>
                              {isLocalDisabled ? (
                                <div className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                                  Select Cloud AI to create a capsule
                                </div>
                              ) : mode === "local" ? (
                                <div className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                                  {localAiStatus.available
                                    ? `Model: ${localAiStatus.model}${localAiStatus.modelAvailable ? "" : " (not available)"}`
                                    : "Model: qwen3.5:9b"}
                                </div>
                              ) : null}
                            </div>
                            <span
                              className={[
                                "inline-flex items-center rounded-full border px-2 py-1 text-[9px] uppercase tracking-[0.16em]",
                                isLocalDisabled
                                  ? "border-[var(--border)] bg-[var(--panel)] text-[var(--muted-strong)]"
                                  : isSelected || isLocalConnected
                                    ? "border-[var(--ring)] bg-[var(--panel)] text-[var(--text)]"
                                    : "border-[var(--border)] bg-[var(--panel)] text-[var(--muted)]",
                              ].join(" ")}
                            >
                              {displayStatus}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedProcessingMode === "cloud" ? (
                  <div className="glass-card space-y-4 rounded-[28px] border p-4">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Cloud model</p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                        Provider
                        <select
                          value={selectedCloudProvider}
                          onChange={(event) => {
                            const provider = event.target.value as CloudProviderId;
                            setSelectedCloudProvider(provider);
                            setSelectedCloudModel(CLOUD_PROVIDER_CONFIG[provider].defaultModel);
                          }}
                          className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-2.5 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--ring)]"
                        >
                          {CLOUD_PROVIDER_ORDER.map((provider) => (
                            <option key={provider} value={provider}>
                              {CLOUD_PROVIDER_CONFIG[provider].label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="space-y-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                        Model
                        <select
                          value={selectedCloudModel}
                          onChange={(event) => setSelectedCloudModel(event.target.value)}
                          className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-2.5 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--ring)]"
                        >
                          {CLOUD_PROVIDER_CONFIG[selectedCloudProvider].models.map((model) => (
                            <option key={model.id} value={model.id}>
                              {model.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {cloudProviderStatus[selectedCloudProvider] ? (
                      cloudProviderStatus[selectedCloudProvider].configured ? (
                        <p className="text-xs text-[var(--muted)]">
                          {cloudProviderStatus[selectedCloudProvider].health === "failed"
                            ? `${CLOUD_PROVIDER_CONFIG[selectedCloudProvider].label} did not respond successfully.`
                            : `${CLOUD_PROVIDER_CONFIG[selectedCloudProvider].label} is connected.`}
                        </p>
                      ) : (
                        <p className="text-xs text-[var(--muted-strong)]">{CLOUD_PROVIDER_CONFIG[selectedCloudProvider].label} API key is not configured.</p>
                      )
                    ) : (
                      <p className="text-xs text-[var(--muted)]">Cloud provider is ready to validate using the configured environment variables.</p>
                    )}
                  </div>
                ) : null}

                  <div className="glass-card space-y-4 rounded-[28px] border p-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Compression level</p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {[
                      { value: "light", label: "Light", description: "Preserve more details" },
                      { value: "balanced", label: "Balanced", description: "Recommended balance" },
                      { value: "high", label: "High", description: "Smallest useful capsule" },
                    ].map((option) => {
                      const isSelected = selectedCompressionLevel === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setSelectedCompressionLevel(option.value as CompressionLevel)}
                          className={[
                            "glass-interactive rounded-[22px] border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
                            isSelected
                              ? "border-[var(--ring)] bg-[var(--panel-soft)] shadow-[0_12px_30px_var(--shadow)]"
                              : "border-[var(--border)] bg-[var(--panel-soft)] hover:border-[var(--ring)]",
                          ].join(" ")}
                        >
                          <div className="text-sm font-medium tracking-[-0.04em] text-[var(--text)]">{option.label}</div>
                          <div className="mt-1 text-xs leading-5 text-[var(--muted)]">{option.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                    <span>{stats.chars} chars</span>
                    <span>{stats.words} words</span>
                    <span>{stats.approxTokens} est. tokens</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={createDisabled}
                    className="glass-interactive inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--button-primary-bg)] px-5 py-3 text-sm font-medium text-[var(--button-primary-text)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Create Capsule
                  </button>
                </div>
              </div>
            ) : null}

            {status === "processing" ? (
              <div className="space-y-6">
                <ProcessingState activeStage={activeStage} />
              </div>
            ) : null}

            {status === "generated" && capsule ? (
              <div className="space-y-6">
                <div className="glass-card rounded-[28px] border p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Processing</p>
                      <p className="mt-2 text-base font-medium tracking-[-0.04em] text-[var(--text)]">
                        {PROCESSING_MODE_DETAILS[selectedProcessingMode].label}
                        {selectedProcessingMode === "cloud"
                          ? ` • ${CLOUD_PROVIDER_CONFIG[selectedCloudProvider].label}`
                          : generationSource === "ollama"
                            ? " • Local runtime"
                            : " • Prototype fallback"}
                      </p>
                    </div>
                    <div className="rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                      Compression: {selectedCompressionLevel === "light" ? "Light Compression" : selectedCompressionLevel === "balanced" ? "Balanced Compression" : "High Compression"}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {selectedProcessingMode === "local"
                      ? LOCAL_AI_COMING_SOON
                        ? "Local AI is coming soon. Cloud AI is available now."
                        : localAiStatus.available
                          ? `Local AI connected. Model: ${localAiStatus.model}`
                          : "Local AI is not connected yet. Using prototype fallback for now."
                      : cloudProviderStatus[selectedCloudProvider]?.configured
                        ? `Cloud AI enabled. Provider: ${CLOUD_PROVIDER_CONFIG[selectedCloudProvider].label}. Model: ${selectedCloudModel}`
                        : `${CLOUD_PROVIDER_CONFIG[selectedCloudProvider].label} API key is not configured.`}
                  </p>
                </div>

                {isEditing ? (
                  <CapsuleEditor capsule={capsule} onSave={handleEditorSave} onCancel={() => setIsEditing(false)} />
                ) : (
                  <CapsuleResult
                    capsule={capsule}
                    capsuleText={capsuleText}
                    originalStats={getConversationStats(input)}
                    finalStats={getConversationStats(capsuleText)}
                    onCopy={handleCopyCapsule}
                    onDownload={handleDownload}
                    onCreateNew={handleCreateNew}
                    onEdit={() => setIsEditing(true)}
                    onTextChange={setCapsuleText}
                    copyStatus={copyStatus}
                    compressionLevel={selectedCompressionLevel}
                    onCompressionChange={setSelectedCompressionLevel}
                    onRegenerate={handleRegenerate}
                  />
                )}
              </div>
            ) : null}
          </div>
        </div>
      </main>
  );
}
