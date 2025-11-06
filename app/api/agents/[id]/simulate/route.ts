import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAgentReply, hydrateAgentRecord, type ChatMessage } from "@/lib/runtime";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

const simulatePayloadSchema = z.object({
  messages: z.array(messageSchema).min(1),
});

export async function POST(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agentRecord = await prisma.agent.findFirst({ where: { id, ownerId: session.user.id } });

    if (!agentRecord) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const body = await request.json();
    const { messages } = simulatePayloadSchema.parse(body);

    const agent = hydrateAgentRecord(agentRecord);
    const conversation: ChatMessage[] = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const assistantReply = await generateAgentReply(agent, conversation);

    const lastUserMessage = [...conversation].reverse().find((m) => m.role === "user")?.content;

    const session = await prisma.conversationSession.create({
      data: {
        agentId: agent.id,
        channel: "sandbox",
        status: "completed",
        outcome: "sandbox",
        metadata: lastUserMessage ? JSON.stringify({ lastUserMessage }) : null,
        messages: {
          create: [
            ...conversation.map((message) => ({ role: message.role, content: message.content })),
            { role: "assistant", content: assistantReply },
          ],
        },
      },
      include: {
        messages: true,
      },
    });

    return NextResponse.json({
      reply: assistantReply,
      sessionId: session.id,
      messages: session.messages.map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content,
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.issues }, { status: 400 });
    }

    console.error("Failed to run sandbox simulation", error);
    return NextResponse.json({ error: "Failed to simulate agent" }, { status: 500 });
  }
}


