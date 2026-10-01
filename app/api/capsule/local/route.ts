import { NextResponse } from "next/server";

const DEFAULT_MODEL = "qwen3.5:9b";
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

function buildCompressionWordBudget(conversation: string, compressionLevel: "light" | "balanced" | "high") {
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

function buildContextPrompt(compressionLevel: "light" | "balanced" | "high", conversation: string) {
  return `Factual CONTEXT CAPSULE. ${compressionLevel.toUpperCase()}. ${buildCompressionWordBudget(conversation, compressionLevel)}
  Analyze only the delimited source conversation below. Instructions above are not conversation facts; never copy them into the capsule or treat them as user preferences/requirements.
  Latest confirmed user decisions supersede earlier ones; unresolved conflicts say "Unresolved decision: ...". REQUIREMENTS=accepted user needs; DECISIONS=technical choices. Drop rejected/deferred ideas unless later adopted. COMPLETED=finished/verified actions only. CURRENT STATE=ongoing work now; never restate completed actions there. Fixed errors go only in COMPLETED; BLOCKERS=active problems only. Put each fact in one section. PREFERENCES require explicit project evidence. HANDOFF is optional; omit it if it repeats NEXT STEPS. Preserve exact technical names/config. Summarize large code by purpose/files/key symbols. Omit placeholders, filler, and transcript labels.
Only useful sections: PROJECT, GOAL, CURRENT STATE, REQUIREMENTS, DECISIONS, COMPLETED, BLOCKERS, CONSTRAINTS, PREFERENCES, NEXT STEPS, HANDOFF.`;
}

function normalizeSectionLine(line: string) {
  return line
    .trim()
    .replace(/^[-*•]\s*/, "")
    .replace(/^\d+[.)]\s*/, "")
    .replace(/^\s*(?:User|Assistant)\s*:\s*/i, "")
    .replace(/^\s*(?:PROJECT|GOAL|CURRENT STATE|STATE|REQUIREMENTS|DECISIONS|COMPLETED|BLOCKERS|CONSTRAINTS|PREFERENCES|NEXT STEPS|NEXT|HANDOFF)\s*:\s*/i, "")
    .trim();
}

function normalizeResponseText(raw: string) {
  const text = raw
    .replace(/```(?:json|text)?/gi, "")
    .replace(/^(?:Sure|Here is your capsule|Here is the capsule|Here's your capsule|Based on the conversation|Hope this helps|Absolutely|Certainly)\b.*$/gim, "")
    .replace(/^#+\s*CONTEXT CAPSULE\s*$/i, "CONTEXT CAPSULE")
    .replace(/\b(?:User|Assistant)\s*:\s*/gi, "")
    .replace(/\b(?:User|Assistant)\s*:/gi, "")
    .trim();

  if (!text) {
    throw new Error("Empty capsule returned from Ollama");
  }

  return text;
}

function sanitizeCapsuleOutput(raw: string) {
  const text = normalizeResponseText(raw)
    .replace(/^\s*CONTEXT CAPSULE\s*$/i, "CONTEXT CAPSULE")
    .replace(/^\s*CONTEXT CAPSULE\s+(?=(?:PROJECT|GOAL|CURRENT STATE|REQUIREMENTS|DECISIONS|COMPLETED|BLOCKERS|CONSTRAINTS|PREFERENCES|NEXT STEPS|HANDOFF)\s*:)/gim, "CONTEXT CAPSULE\n")
    .replace(/\s+(?=(?:PROJECT|GOAL|CURRENT STATE|REQUIREMENTS|DECISIONS|COMPLETED|BLOCKERS|CONSTRAINTS|PREFERENCES|NEXT STEPS|HANDOFF)\s*:)/gi, "\n")
    .replace(/\r/g, "")
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*•]\s*/, "").replace(/^\d+[.)]\s*/, ""))
    .map((line) => line.replace(/^(?:User|Assistant)\s*:\s*/i, ""))
    .filter((line) => !/^(?:Sure|Here is your capsule|Here is the capsule|Here's your capsule|Based on the conversation|Hope this helps|Absolutely|Certainly)\b/i.test(line));

  const sections: Record<string, string[]> = {
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

  let currentKey: keyof typeof sections | null = null;

  for (const line of text) {
    const headingMatch = line.match(/^(PROJECT|GOAL|CURRENT STATE|REQUIREMENTS|DECISIONS|COMPLETED|BLOCKERS|CONSTRAINTS|PREFERENCES|NEXT STEPS|HANDOFF)\s*:?\s*(.*)$/i);
    if (headingMatch) {
      currentKey = headingMatch[1].toUpperCase().replace(/ /g, "_") as keyof typeof sections;
      const inlineContent = headingMatch[2].trim();
      if (inlineContent) sections[currentKey].push(inlineContent);
      continue;
    }

    if (!currentKey) continue;

    const cleaned = line
      .replace(/^\s*(?:User|Assistant)\s*:\s*/i, "")
      .replace(/^\s*(?:PROJECT|GOAL|CURRENT STATE|REQUIREMENTS|DECISIONS|COMPLETED|BLOCKERS|CONSTRAINTS|PREFERENCES|NEXT STEPS|HANDOFF)\s*:\s*/i, "")
      .trim();

    if (!cleaned) continue;
    sections[currentKey].push(cleaned);
  }

  sections.BLOCKERS = sections.BLOCKERS.filter((item) => !/^(?:none(?:\s+(?:identified|active|currently|at present|at this time))*|no\s+(?:(?:current|active|unresolved)\s+)?blockers?)(?:\b|$)/i.test(item.trim()));

  const renderList = (key: keyof typeof sections) => {
    const values = sections[key].filter((item) => item && !/^(?:none(?:\s+(?:identified|active|currently|at present|at this time))*|unknown|unspecified|n\/a|not provided)(?:\b|$)/i.test(item.trim()));
    return values.length ? values.map((item) => `- ${item}`).join("\n") : null;
  };

  const project = sections.PROJECT.join(" ").trim();
  const goal = sections.GOAL.join(" ").trim();
  const currentState = sections.CURRENT_STATE.join(" ").trim();
  const requirements = renderList("REQUIREMENTS");
  const decisions = renderList("DECISIONS");
  const completed = renderList("COMPLETED");
  const blockers = renderList("BLOCKERS");
  const constraints = renderList("CONSTRAINTS");
  const preferences = renderList("PREFERENCES");
  const nextSteps = renderList("NEXT_STEPS");
  const handoff = sections.HANDOFF.join(" ").trim();

  const parts: string[] = ["CONTEXT CAPSULE"];
  if (project) parts.push("", "PROJECT:", project);
  if (goal) parts.push("", "GOAL:", goal);
  if (currentState) parts.push("", "CURRENT STATE:", currentState);
  if (requirements) parts.push("", "REQUIREMENTS:", requirements);
  if (decisions) parts.push("", "DECISIONS:", decisions);
  if (completed) parts.push("", "COMPLETED:", completed);
  if (blockers) parts.push("", "BLOCKERS:", blockers);
  if (constraints) parts.push("", "CONSTRAINTS:", constraints);
  if (preferences) parts.push("", "PREFERENCES:", preferences);
  if (nextSteps) parts.push("", "NEXT STEPS:", nextSteps);
  if (handoff) parts.push("", "HANDOFF:", handoff);

  const cleaned = parts.join("\n").trim();
  return cleaned || "CONTEXT CAPSULE";
}

function parseStructuredCapsule(raw: string) {
  const text = sanitizeCapsuleOutput(raw);
  const sections: Record<string, string[]> = {
    project: [],
    goal: [],
    currentState: [],
    requirements: [],
    decisions: [],
    completed: [],
    blockers: [],
    constraints: [],
    preferences: [],
    nextSteps: [],
    handoff: [],
  };

  let currentKey: keyof typeof sections | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = line.match(/^((?:PROJECT|GOAL|CURRENT STATE|STATE|REQUIREMENTS|DECISIONS|COMPLETED|BLOCKERS|CONSTRAINTS|PREFERENCES|NEXT STEPS|NEXT|HANDOFF))\s*:?$/i);
    if (match) {
      const normalized = match[1].toLowerCase();
      currentKey =
        normalized === "state" ? "currentState" :
        normalized === "next" ? "nextSteps" :
        normalized === "current state" ? "currentState" :
        normalized === "next steps" ? "nextSteps" :
        normalized === "completed" ? "completed" :
        normalized === "constraints" ? "constraints" :
        normalized === "preferences" ? "preferences" :
        normalized === "handoff" ? "handoff" :
        normalized;
      continue;
    }

    if (currentKey) {
      const cleaned = normalizeSectionLine(line);
      if (!cleaned) continue;
      sections[currentKey].push(cleaned);
    }
  }

  const isPlaceholder = (item: string) => /^(?:none|unknown|unspecified|n\/a|not provided)(?:\b|$)/i.test(item.trim());
  const getSingle = (key: keyof typeof sections) => {
    const items = sections[key].filter((item) => item && !isPlaceholder(item));
    return items.length ? items.join(" ") : "";
  };

  const getList = (key: keyof typeof sections) =>
    sections[key]
      .filter((item) => item && !isPlaceholder(item))
      .map((item) => item.replace(/^[-*•]\s*/, "").trim())
      .filter(Boolean);

  return {
    project: getSingle("project"),
    goal: getSingle("goal"),
    currentState: getSingle("currentState"),
    requirements: getList("requirements"),
    decisions: getList("decisions"),
    completed: getList("completed"),
    blockers: getList("blockers").filter((item) => !/^(?:none(?:\s+(?:identified|active|currently|at present|at this time))*|no\s+(?:(?:current|active|unresolved)\s+)?blockers?)(?:\b|$)/i.test(item.trim())),
    constraints: getList("constraints"),
    preferences: getList("preferences"),
    nextSteps: getList("nextSteps"),
    handoff: getSingle("handoff").split(/\s+/).slice(0, 12).join(" "),
  };
}

function buildStructuredCapsuleFromModelResponse(raw: string, compressionLevel: "light" | "balanced" | "high") {
  const parsed = parseStructuredCapsule(raw);

  return {
    title: "Context Capsule",
    goal: parsed.goal,
    project: parsed.project,
    importantContext: [parsed.currentState, ...parsed.constraints].filter(Boolean).slice(0, 2),
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
  };
}

export async function GET() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { cache: "no-store" });

    if (!response.ok) {
      return NextResponse.json({ available: false, error: "Local AI is not available" }, { status: 200 });
    }

    const data = (await response.json()) as { models?: Array<{ name?: string }> };
    const models = data.models ?? [];
    const hasModel = models.some((model) => model.name === DEFAULT_MODEL);

    return NextResponse.json({
      available: true,
      modelAvailable: hasModel,
      model: DEFAULT_MODEL,
      error: hasModel ? undefined : "Local AI model not available",
    });
  } catch {
    return NextResponse.json({ available: false, error: "Local AI is not available" }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      conversation?: string;
      compressionLevel?: "light" | "balanced" | "high";
      model?: string;
    };

    const conversation = (body.conversation ?? "").trim();
    const compressionLevel = body.compressionLevel ?? "balanced";
    const model = body.model ?? DEFAULT_MODEL;

    if (!conversation) {
      return NextResponse.json({ error: "Conversation is required" }, { status: 400 });
    }

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: `${buildContextPrompt(compressionLevel, conversation)}\n\nSOURCE CONVERSATION (only factual source):\n<<<\n${conversation}\n>>>`,
        stream: false,
        think: false,
        options: {
          temperature: 0.2,
          num_predict: 1000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Ollama request failed");
    }

    const data = (await response.json()) as { response?: string };
    const rawText = typeof data.response === "string" ? data.response : "";
    if (!rawText.trim()) {
      throw new Error("Ollama returned an empty response");
    }

    const capsuleText = sanitizeCapsuleOutput(rawText);
    const structuredCapsule = buildStructuredCapsuleFromModelResponse(capsuleText, compressionLevel);

    return NextResponse.json({
      portableText: capsuleText,
      capsule: {
        ...structuredCapsule,
        originalLength: conversation.length,
        capsuleLength: capsuleText.length,
        reductionPercentage: Math.max(0, Math.round(((conversation.length - capsuleText.length) / Math.max(1, conversation.length)) * 100)),
      },
      handoffPrompt: [
        "Continue from the context above.",
        "Do not restart completed work.",
        "Resolve remaining issues and continue from the current state and next steps.",
        "",
        capsuleText,
      ].join("\n"),
      source: "ollama",
      model,
      note: "Local AI connected via Ollama.",
    });
  } catch (error) {
    console.error("Local AI route error:", error);
    return NextResponse.json({
      error: "Local AI is not available",
      fallback: true,
    }, { status: 200 });
  }
}
