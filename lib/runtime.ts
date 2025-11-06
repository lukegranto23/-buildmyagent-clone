import type { Agent as AgentRecord, Message as MessageRecord } from "@prisma/client";

import { DEFAULT_MODEL, getOpenAI } from "@/lib/openai";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type RuntimeAgent = {
  id: string;
  name: string;
  offerName: string;
  description: string | null;
  systemPrompt: string;
  ownerNotes: string | null;
  quickWins: string[];
  deliverables: string[];
  talkingPoints: string[];
  supportPackages: { id?: string; label?: string; [key: string]: unknown }[];
  integrations: string[];
  blueprint: Record<string, unknown>;
};

function safeParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn("Failed to parse JSON column", error);
    return fallback;
  }
}

export function hydrateAgentRecord(record: AgentRecord): RuntimeAgent {
  return {
    id: record.id,
    name: record.name,
    offerName: record.offerName,
    description: record.description ?? null,
    systemPrompt: record.systemPrompt,
    ownerNotes: record.ownerNotes ?? null,
    quickWins: safeParse<string[]>(record.quickWins, []),
    deliverables: safeParse<string[]>(record.deliverables, []),
    talkingPoints: safeParse<string[]>(record.talkingPoints, []),
    supportPackages: safeParse(record.supportPackages, []),
    integrations: safeParse<string[]>(record.integrations, []),
    blueprint: safeParse<Record<string, unknown>>(record.blueprint, {}),
  };
}

export function mapMessagesToChat(records: MessageRecord[]): ChatMessage[] {
  return records
    .map((message): ChatMessage => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content,
    }))
    .filter((message) => message.content.trim().length > 0);
}

function buildSystemPrompt(agent: RuntimeAgent) {
  const blueprintSummary = agent.blueprint?.industry
    ? `Industry focus: ${(agent.blueprint.industry as { label?: string })?.label ?? "Main Street"}.`
    : "";
  const quickWins = agent.quickWins.length
    ? `Key wins: ${agent.quickWins.map((win) => win.toLowerCase()).join("; ")}.`
    : "";
  const talkingPoints = agent.talkingPoints.length
    ? `Talking points: ${agent.talkingPoints.join(" | ")}.`
    : "";
  const ownerNotes = agent.ownerNotes ? `Owner notes: ${agent.ownerNotes}` : "";

  return [agent.systemPrompt, blueprintSummary, quickWins, talkingPoints, ownerNotes]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join("\n");
}

function fallbackResponse(agent: RuntimeAgent, lastUserMessage: string | undefined) {
  const quickWin = agent.quickWins[0] ?? "deliver immediate value";
  const reassurance = agent.talkingPoints[0] ?? "We treat every client like family.";
  const leadIn = lastUserMessage ? `You mentioned: "${lastUserMessage}".` : "Let me fill you in.";

  return `Absolutely — I can help you ${quickWin.toLowerCase()}. ${leadIn} ${reassurance}`;
}

export async function generateAgentReply(agent: RuntimeAgent, conversation: ChatMessage[]) {
  const openai = getOpenAI();
  const systemPrompt = buildSystemPrompt(agent);
  const lastUserMessage = [...conversation]
    .reverse()
    .find((message) => message.role === "user")?.content;

  if (!openai) {
    return fallbackResponse(agent, lastUserMessage);
  }

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...conversation.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: 0.6,
      messages,
    });

    const candidate = completion.choices[0]?.message?.content?.trim();

    if (candidate) {
      return candidate;
    }
  } catch (error) {
    console.warn("OpenAI completion failed, using fallback", error);
  }

  return fallbackResponse(agent, lastUserMessage);
}


