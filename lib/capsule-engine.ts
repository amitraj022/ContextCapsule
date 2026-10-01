import type { CapsuleData, CompressionLevel, GenerationResult } from "@/lib/capsule-types";

const normalizeText = (value: string) => value.replace(/\s+/g, " ").trim();

export const countWords = (value: string) => {
  const normalized = normalizeText(value);
  return normalized ? normalized.split(/\s+/).filter(Boolean).length : 0;
};

const fillerPhrases = [
  "okay",
  "ok",
  "sure",
  "thanks",
  "thank you",
  "great",
  "perfect",
  "got it",
  "understood",
  "yes",
  "that is good",
  "that's good",
  "sounds good",
  "fine",
];

const compactSentence = (value: string) => normalizeText(value).replace(/^[-*•\d.)]+\s*/, "").trim();

const splitSentences = (value: string) =>
  Array.from(new Set((value.match(/[^.!?]+[.!?]?/g) ?? []).map((sentence) => compactSentence(sentence)).filter(Boolean)));

const sentenceKey = (value: string) => normalizeText(value).toLowerCase();

const isLikelyFillerSentence = (value: string) => {
  const cleaned = normalizeText(value).toLowerCase();
  if (!cleaned) return false;

  const startsWithFiller = fillerPhrases.some((phrase) => cleaned === phrase || cleaned.startsWith(`${phrase} `));
  if (!startsWithFiller) return false;

  return !/(goal|objective|need|want|build|create|launch|fix|improve|project|task|feature|requirement|constraint|decision|progress|status|issue|problem|risk|review|test|prototype|dashboard|workflow|app|module|route|page|context|design)/i.test(value);
};

const sentenceSimilarity = (left: string, right: string) => {
  const leftTokens = normalizeText(left).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  const rightTokens = normalizeText(right).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);

  if (!leftTokens.length || !rightTokens.length) return 0;

  const overlap = leftTokens.filter((token) => rightTokens.includes(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;

  return union === 0 ? 0 : overlap / union;
};

const dedupeSimilarSentences = (items: string[]) => {
  const unique: string[] = [];

  for (const item of items) {
    const normalized = compactSentence(item);
    if (!normalized) continue;

    const duplicate = unique.some((candidate) => {
      const candidateText = compactSentence(candidate);
      if (!candidateText) return false;
      if (sentenceKey(candidateText) === sentenceKey(normalized)) return true;
      return sentenceSimilarity(candidateText, normalized) >= 0.7;
    });

    if (!duplicate) unique.push(normalized);
  }

  return unique;
};

const shortenItem = (value: string, maxLength = 120) => {
  const text = compactSentence(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
};

const selectItems = (sentences: string[], keywords: RegExp[], limit: number, maxLength = 140) => {
  const matches: string[] = [];

  for (const sentence of sentences) {
    const normalized = compactSentence(sentence);
    if (!normalized || isLikelyFillerSentence(normalized)) continue;
    if (!keywords.some((pattern) => pattern.test(normalized))) continue;

    const key = sentenceKey(normalized);
    if (matches.some((item) => sentenceKey(item) === key)) continue;

    matches.push(shortenItem(normalized, maxLength));
    if (matches.length >= limit) break;
  }

  return matches;
};

const selectFallback = (sentences: string[], limit: number, maxLength = 140) => {
  const matches: string[] = [];

  for (const sentence of sentences) {
    const normalized = compactSentence(sentence);
    if (!normalized || isLikelyFillerSentence(normalized)) continue;
    const key = sentenceKey(normalized);
    if (matches.some((item) => sentenceKey(item) === key)) continue;

    matches.push(shortenItem(normalized, maxLength));
    if (matches.length >= limit) break;
  }

  return matches;
};

const buildSummary = (goal: string, progress: string[], nextSteps: string[], decisions: string[], problems: string[], maxParts = 3) => {
  const parts = [goal, ...progress.slice(0, 2), ...nextSteps.slice(0, 2), ...decisions.slice(0, 1), ...problems.slice(0, 1)]
    .map((item) => compactSentence(item)).filter(Boolean);

  return dedupeSimilarSentences(parts).slice(0, maxParts).join(" ");
};

const estimateReduction = (originalLength: number, capsuleLength: number) => {
  if (originalLength <= 0) return 0;
  return Math.round(((originalLength - capsuleLength) / originalLength) * 100);
};

export function getCompressionSummary(originalText: string, capsuleText: string) {
  const originalLength = normalizeText(originalText).length;
  const capsuleLength = normalizeText(capsuleText).length;
  const originalWords = countWords(originalText);
  const capsuleWords = countWords(capsuleText);
  const reduction = estimateReduction(originalLength, capsuleLength);

  if (capsuleLength > originalLength) {
    return {
      percentage: 0,
      label: "Expanded",
      originalLength,
      capsuleLength,
      originalWords,
      capsuleWords,
      reduction,
    };
  }

  if (reduction <= 5) {
    return {
      percentage: Math.max(0, reduction),
      label: "Minimal compression",
      originalLength,
      capsuleLength,
      originalWords,
      capsuleWords,
      reduction,
    };
  }

  return {
    percentage: reduction,
    label: `${Math.max(1, reduction)}% smaller`,
    originalLength,
    capsuleLength,
    originalWords,
    capsuleWords,
    reduction,
  };
}

const compressionProfiles = {
  light: {
    requirementLimit: 2,
    decisionLimit: 1,
    progressLimit: 1,
    problemLimit: 1,
    contextLimit: 1,
    nextLimit: 1,
    summaryParts: 2,
    itemLength: 100,
    label: "Light Compression",
    description: "Preserve more details",
  },
  balanced: {
    requirementLimit: 1,
    decisionLimit: 1,
    progressLimit: 1,
    problemLimit: 1,
    contextLimit: 1,
    nextLimit: 1,
    summaryParts: 2,
    itemLength: 120,
    label: "Balanced Compression",
    description: "Recommended balance",
  },
  high: {
    requirementLimit: 1,
    decisionLimit: 1,
    progressLimit: 1,
    problemLimit: 1,
    contextLimit: 1,
    nextLimit: 1,
    summaryParts: 2,
    itemLength: 90,
    label: "High Compression",
    description: "Smallest useful capsule",
  },
} as const;

export function generateLocalCapsule(conversation: string, compressionLevel: CompressionLevel = "balanced"): GenerationResult {
  const profile = compressionProfiles[compressionLevel];
  const trimmed = normalizeText(conversation);
  const originalLength = trimmed.length;
  const filtered = dedupeSimilarSentences(
    splitSentences(trimmed)
      .map((sentence) => compactSentence(sentence))
      .filter((sentence) => Boolean(sentence) && !isLikelyFillerSentence(sentence)),
  );

  const goal =
    selectItems(filtered, [/goal|objective|want|need|plan|build|create|launch|fix|improve|aim|target/i], 1)[0] ||
    filtered[0] ||
    "Continue from the current state without restarting the project.";

  const project =
    selectItems(filtered, [/project|task|feature|component|module|app|dashboard|workflow|prototype|system|route|page/i], 1)[0] ||
    "Current work";

  const requirements = selectItems(filtered, [/must|need|require|constraint|deadline|avoid|prefer|only|should|target|format|style|local|prototype|team|user|design/i], profile.requirementLimit, profile.itemLength);
  const decisions = selectItems(filtered, [/decide|decision|decided|prefer|priority|recommend|choose|keep|agree|we will|we need to|we decided/i], profile.decisionLimit, profile.itemLength);
  const progress = selectItems(filtered, [/currently|progress|status|done|completed|working|draft|prototype|implemented|updated|active|in progress/i], profile.progressLimit, profile.itemLength);
  const problems = selectItems(filtered, [/problem|issue|bug|error|blocked|blocking|risk|unclear|question|stuck|limitation|gap|missing|uncertain/i], profile.problemLimit, profile.itemLength);
  const files = selectItems(filtered, [/file|component|function|module|route|page|lib|api|schema|config|hook|context|service/i], profile.contextLimit, profile.itemLength);
  const preferences = selectItems(filtered, [/prefer|like|wants|needs|style|tone|design|layout|minimal|dark|light|clean|premium|simple/i], profile.contextLimit, profile.itemLength);
  const nextSteps = selectItems(filtered, [/next|then|after|continue|review|validate|finalize|implement|ship|test|move forward|follow up/i], profile.nextLimit, profile.itemLength);

  const remaining = filtered.filter(
    (sentence) =>
      ![
        goal,
        project,
        ...requirements,
        ...decisions,
        ...progress,
        ...problems,
        ...files,
        ...preferences,
        ...nextSteps,
      ].includes(sentence),
  );

  const importantContext = selectFallback(remaining.slice(0, 6), profile.contextLimit, profile.itemLength);
  const summary = buildSummary(goal, progress, nextSteps, decisions, problems, profile.summaryParts) || `${goal}. ${progress[0] || "Work is underway."} ${nextSteps[0] || "Continue from the current state."}`;
  const handoffInstructions = "Continue from the current state above. Do not restart completed work.";
  const shortConversation = originalLength < 220 || countWords(conversation) < 30;

  const capsule: CapsuleData = {
    title: trimTitle(trimmed),
    goal,
    project,
    importantContext: importantContext.length ? importantContext : ["Current context is ready for continuation."],
    requirements: requirements.length ? requirements : ["Keep the current direction and avoid unnecessary scope expansion."],
    decisions: decisions.length ? decisions : ["Continue from the current state and validate the next action."],
    progress: progress.length ? progress : ["Work is active and moving toward the next milestone."],
    problems: problems.length ? problems : ["No critical blocker was identified in the provided conversation."],
    files: files.length ? files : ["No concrete file references were included in the source text."],
    preferences: preferences.length ? preferences : ["Minimal, clear, and actionable execution remains preferred."],
    nextSteps: nextSteps.length ? nextSteps : ["Review the current state and continue with the next required action."],
    summary,
    handoffInstructions,
    originalLength,
    capsuleLength: 0,
    reductionPercentage: 0,
    compressionLevel,
    compressionLabel: profile.label,
  };

  const portableText = formatCapsule(capsule);
  const handoffPrompt = buildHandoffPrompt(capsule);
  const capsuleLength = portableText.length;
  const reductionPercentage = estimateReduction(originalLength, capsuleLength);

  return {
    capsule: {
      ...capsule,
      capsuleLength,
      reductionPercentage,
    },
    portableText,
    handoffPrompt,
  };
}

export function generateCapsule(conversation: string): GenerationResult {
  return generateLocalCapsule(conversation, "balanced");
}

function trimTitle(value: string) {
  const cleaned = normalizeText(value);
  const firstSentence = splitSentences(cleaned)[0] || "Context Capsule";
  return firstSentence.length > 60 ? `${firstSentence.slice(0, 57)}...` : firstSentence;
}

export function formatCapsule(capsule: CapsuleData): string {
  const goal = compactSentence(capsule.goal || "Current context is ready to continue.");
  const project = compactSentence(capsule.project || "Current work");
  const requirements = capsule.requirements.map((item) => compactSentence(item)).filter(Boolean);
  const decisions = capsule.decisions.map((item) => compactSentence(item)).filter(Boolean);
  const progress = capsule.progress.map((item) => compactSentence(item)).filter(Boolean);
  const context = capsule.importantContext.map((item) => compactSentence(item)).filter(Boolean);
  const problems = capsule.problems.map((item) => compactSentence(item)).filter(Boolean);
  const next = capsule.nextSteps.map((item) => compactSentence(item)).filter(Boolean);
  const level = capsule.compressionLevel ?? "balanced";

  const requirementText = requirements.slice(0, level === "light" ? 2 : 1).join("; ") || "Keep scope tight.";
  const decisionText = decisions.slice(0, level === "light" ? 1 : 1).join("; ") || "Maintain the current direction.";
  const progressText = progress.slice(0, 1).join("; ") || "Work is active.";
  const contextText = context.slice(0, level === "light" ? 1 : 1).join("; ") || "Current context is ready for continuation.";
  const problemText = problems.slice(0, 1).join("; ") || "No blocker identified.";
  const nextText = next.slice(0, level === "light" ? 2 : 1).join("; ") || "Continue from the current state.";

  if (level === "light") {
    return [
      `Goal: ${goal}`,
      `Status: ${progressText}`,
      `Requirements: ${requirementText}`,
      `Context: ${contextText}`,
      `Decisions: ${decisionText}`,
      `Next: ${nextText}`,
      `Handoff: ${compactSentence(capsule.handoffInstructions || "Continue from the current state without restarting completed work.")}`,
    ].join(" | ");
  }

  return [
    `Goal: ${goal}`,
    `Status: ${progressText}`,
    `Requirements: ${requirementText}`,
    problemText !== "No blocker identified." ? `Issues: ${problemText}` : null,
    project !== goal ? `Project: ${project}` : null,
    `Next: ${nextText}`,
    `Handoff: ${compactSentence(capsule.handoffInstructions || "Continue from the current state without restarting completed work.")}`,
  ]
    .filter(Boolean)
    .join(" | ");
}

export function buildHandoffPrompt(capsule: CapsuleData): string {
  return [
    "Continue from the context above.",
    "Do not restart completed work.",
    "Resolve remaining issues and continue from the current state and next steps.",
    "",
    formatCapsule(capsule),
  ].join("\n");
}

export function getConversationStats(input: string) {
  const trimmed = input.trim();
  const words = countWords(trimmed);
  const chars = trimmed.length;
  const approxTokens = Math.max(1, Math.ceil(chars / 4));

  return { words, chars, approxTokens };
}
