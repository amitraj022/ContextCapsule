import "server-only";
import type { CompressionLevel } from "@/lib/capsule-types";
import {
  CLOUD_PROVIDER_CONFIG,
  type CloudProviderId,
} from "@/lib/cloud-provider-config";

export { CLOUD_PROVIDER_CONFIG, CLOUD_PROVIDER_ORDER } from "@/lib/cloud-provider-config";
export type { CloudModelOption, CloudProviderConfigEntry, CloudProviderId } from "@/lib/cloud-provider-config";

export function getCloudProviderModel(providerId: CloudProviderId, fallbackModel?: string): string {
  const config = CLOUD_PROVIDER_CONFIG[providerId];
  if (fallbackModel && config.models.some((model) => model.id === fallbackModel)) {
    return fallbackModel;
  }
  return config.defaultModel;
}

function buildCompressionWordBudget(conversation: string, compressionLevel: CompressionLevel) {
  const sourceWordCount = conversation.trim().split(/\s+/).filter(Boolean).length;
  const bands = {
    light: [0.6, 0.8],
    balanced: [0.35, 0.6],
    high: [0.2, 0.4],
  } as const;

  if (sourceWordCount < 80) {
    return `Source ~${sourceWordCount} words; preserve necessary facts without forced reduction.`;
  }

  const [minimumRatio, maximumRatio] = bands[compressionLevel];
  const minimum = Math.ceil(sourceWordCount * minimumRatio);
  const maximum = Math.floor(sourceWordCount * maximumRatio);
  return `Target ${minimum}-${maximum} capsule words from ${sourceWordCount}; exceed only for essential facts.`;
}

export function buildCloudCapsulePrompt(compressionLevel: CompressionLevel, conversation: string) {
  return `Factual CONTEXT CAPSULE. ${compressionLevel.toUpperCase()}. ${buildCompressionWordBudget(conversation, compressionLevel)}
Analyze only the delimited source conversation below. Instructions above are not conversation facts; never copy them into the capsule or treat them as user preferences/requirements.
Latest confirmed user decisions supersede earlier ones; unresolved conflicts say "Unresolved decision: ...". REQUIREMENTS=accepted user needs; DECISIONS=technical choices. Drop rejected/deferred ideas unless later adopted. COMPLETED=finished/verified actions only. CURRENT STATE=ongoing work now; never restate completed actions there. Fixed errors go only in COMPLETED; BLOCKERS=active problems only. Put each fact in one section. PREFERENCES require explicit project evidence. HANDOFF is optional; omit it if it repeats NEXT STEPS. Preserve exact technical names/config. Summarize large code by purpose/files/key symbols. Omit placeholders, filler, and transcript labels.
Only useful sections: PROJECT, GOAL, CURRENT STATE, REQUIREMENTS, DECISIONS, COMPLETED, BLOCKERS, CONSTRAINTS, PREFERENCES, NEXT STEPS, HANDOFF.`;
}

function normalizeCloudResponseText(raw: string) {
  const text = raw
    .replace(/```(?:json|text)?/gi, "")
    .replace(/^(?:Sure|Here is your capsule|Here is the capsule|Here's your capsule|Based on the conversation|Hope this helps|Absolutely|Certainly)\b.*$/gim, "")
    .replace(/^#+\s*CONTEXT CAPSULE\s*$/i, "CONTEXT CAPSULE")
    .replace(/^\s*CONTEXT CAPSULE\s+(?=(?:PROJECT|GOAL|CURRENT STATE|REQUIREMENTS|DECISIONS|COMPLETED|BLOCKERS|CONSTRAINTS|PREFERENCES|NEXT STEPS|HANDOFF)\s*:)/gim, "CONTEXT CAPSULE\n")
    .replace(/\s+(?=(?:PROJECT|GOAL|CURRENT STATE|REQUIREMENTS|DECISIONS|COMPLETED|BLOCKERS|CONSTRAINTS|PREFERENCES|NEXT STEPS|HANDOFF)\s*:)/gi, "\n")
    .replace(/\b(?:User|Assistant)\s*:\s*/gi, "")
    .replace(/\b(?:User|Assistant)\s*:/gi, "")
    .trim();

  if (!text) {
    throw new Error("Empty capsule returned from cloud provider");
  }

  return text;
}

function parseCloudCapsule(raw: string) {
  const text = normalizeCloudResponseText(raw)
    .replace(/\r/g, "")
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^(?:Sure|Here is your capsule|Here is the capsule|Here's your capsule|Based on the conversation|Hope this helps|Absolutely|Certainly)\b/i.test(line));

  const sectionMap: Record<string, string[]> = {
    PROJECT: [],
    GOAL: [],
    CURRENT_STATE: [],
    REQUIREMENTS: [],
    DECISIONS: [],
    COMPLETED: [],
    BLOCKERS: [],
    CONSTRAINTS: [],
    PREFERENCES: [],
    NEXT_STEPS: [],
    HANDOFF: [],
  };

  let currentKey: keyof typeof sectionMap | null = null;
  const isPlaceholder = (item: string) => /^(?:none(?:\s+(?:identified|active|currently|at present|at this time))*|unknown|unspecified|n\/a|not provided)(?:\b|$)/i.test(item.trim());

  for (const line of text) {
    const headingMatch = line.match(/^(PROJECT|GOAL|CURRENT STATE|REQUIREMENTS|DECISIONS|COMPLETED|BLOCKERS|CONSTRAINTS|PREFERENCES|NEXT STEPS|HANDOFF)\s*:?\s*(.*)$/i);
    if (headingMatch) {
      const heading = headingMatch[1].toUpperCase();
      currentKey = heading === "CURRENT STATE" ? "CURRENT_STATE" : heading === "NEXT STEPS" ? "NEXT_STEPS" : heading as keyof typeof sectionMap;
      const inlineContent = headingMatch[2].trim();
      if (currentKey && inlineContent) sectionMap[currentKey].push(inlineContent);
      continue;
    }

    if (/^CONTEXT CAPSULE$/i.test(line)) continue;

    if (!currentKey) continue;
    const cleaned = line
      .replace(/^[-*•]\s*/, "")
      .replace(/^\d+[.)]\s*/, "")
      .replace(/^(?:PROJECT|GOAL|CURRENT STATE|REQUIREMENTS|DECISIONS|COMPLETED|BLOCKERS|CONSTRAINTS|PREFERENCES|NEXT STEPS|HANDOFF)\s*:\s*/i, "")
      .replace(/^(?:User|Assistant)\s*:\s*/i, "")
      .trim();

    if (cleaned) {
      sectionMap[currentKey].push(cleaned);
    }
  }

  return {
    project: isPlaceholder(sectionMap.PROJECT.join(" ").trim()) ? "" : sectionMap.PROJECT.join(" ").trim(),
    goal: isPlaceholder(sectionMap.GOAL.join(" ").trim()) ? "" : sectionMap.GOAL.join(" ").trim(),
    currentState: isPlaceholder(sectionMap.CURRENT_STATE.join(" ").trim()) ? "" : sectionMap.CURRENT_STATE.join(" ").trim(),
    requirements: sectionMap.REQUIREMENTS.filter((item) => item && !isPlaceholder(item)),
    decisions: sectionMap.DECISIONS.filter((item) => item && !isPlaceholder(item)),
    completed: sectionMap.COMPLETED.filter((item) => item && !isPlaceholder(item)),
    blockers: sectionMap.BLOCKERS.filter((item) => item && !isPlaceholder(item) && !/^no\s+(?:(?:current|active|unresolved)\s+)?blockers?(?:\b|$)/i.test(item.trim())),
    constraints: sectionMap.CONSTRAINTS.filter((item) => item && !isPlaceholder(item)),
    preferences: sectionMap.PREFERENCES.filter((item) => item && !isPlaceholder(item)),
    nextSteps: sectionMap.NEXT_STEPS.filter((item) => item && !isPlaceholder(item)),
    handoff: isPlaceholder(sectionMap.HANDOFF.join(" ").trim()) ? "" : sectionMap.HANDOFF.join(" ").trim().split(/\s+/).slice(0, 12).join(" "),
  };
}

export function formatCloudCapsule(raw: string) {
  const parsed = parseCloudCapsule(raw);
  const output = ["CONTEXT CAPSULE"];
  const singleValueSections = [
    ["PROJECT", parsed.project],
    ["GOAL", parsed.goal],
    ["CURRENT STATE", parsed.currentState],
  ] as const;
  const listSections = [
    ["REQUIREMENTS", parsed.requirements],
    ["DECISIONS", parsed.decisions],
    ["COMPLETED", parsed.completed],
    ["BLOCKERS", parsed.blockers],
    ["CONSTRAINTS", parsed.constraints],
    ["PREFERENCES", parsed.preferences],
    ["NEXT STEPS", parsed.nextSteps],
  ] as const;

  for (const [heading, value] of singleValueSections) {
    if (!value) continue;
    output.push("", `${heading}:`, value);
  }

  for (const [heading, items] of listSections) {
    if (!items.length) continue;
    output.push("", `${heading}:`, ...items.map((item) => `- ${item}`));
  }

  if (parsed.handoff) output.push("", "HANDOFF:", parsed.handoff);

  if (output.length === 1) throw new Error("Cloud provider returned an invalid capsule.");
  return output.join("\n");
}

export function buildCloudCapsuleData(raw: string, compressionLevel: CompressionLevel) {
  const parsed = parseCloudCapsule(raw);

  return {
    title: "Context Capsule",
    goal: parsed.goal,
    project: parsed.project,
    importantContext: [parsed.currentState, ...parsed.constraints, parsed.goal].filter(Boolean).slice(0, 2),
    requirements: parsed.requirements,
    decisions: parsed.decisions,
    progress: [...parsed.completed, parsed.currentState].filter(Boolean),
    problems: parsed.blockers,
    files: [],
    preferences: parsed.preferences,
    nextSteps: parsed.nextSteps,
    summary: [parsed.goal, parsed.currentState].filter(Boolean).join(" "),
    handoffInstructions: parsed.handoff,
    compressionLevel,
    compressionLabel: compressionLevel === "light" ? "Light Compression" : compressionLevel === "balanced" ? "Balanced Compression" : "High Compression",
  } as const;
}

export async function callCloudProvider(providerId: CloudProviderId, modelId: string, conversation: string, compressionLevel: CompressionLevel): Promise<string> {
  const prompt = `${buildCloudCapsulePrompt(compressionLevel, conversation)}\n\nSOURCE CONVERSATION (only factual source):\n<<<\n${conversation}\n>>>`;

  if (providerId === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API key is not configured.");

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Gemini request failed (HTTP ${response.status}).`);
    }

    const payload = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = payload.candidates?.map((candidate) => candidate.content?.parts?.map((part) => part.text ?? "").join("\n") ?? "").join("\n") ?? "";
    return normalizeCloudResponseText(text);
  }

  if (providerId === "groq") {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("Groq API key is not configured.");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq request failed (HTTP ${response.status}).`);
    }

    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string | Array<{ type?: string; text?: string }> } }> };
    const content = payload.choices?.[0]?.message?.content;
    const text = typeof content === "string" ? content : Array.isArray(content) ? content.map((part) => part.text ?? "").join("\n") : "";
    return normalizeCloudResponseText(text);
  }

  throw new Error("Invalid cloud provider");
}
