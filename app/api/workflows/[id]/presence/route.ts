import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const heartbeatSchema = z.object({
  sessionId: z.string().min(1),
  displayName: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
});

const DELETE_THRESHOLD_MS = 5 * 60 * 1000; // purge if idle >5 minutes
const ACTIVE_WINDOW_MS = 45 * 1000;

export async function GET(_request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  const now = Date.now();
  const activeAfter = new Date(now - ACTIVE_WINDOW_MS);
  const staleBefore = new Date(now - DELETE_THRESHOLD_MS);

  // Clean up stale records asynchronously
  void prisma.workflowPresence.deleteMany({
    where: {
      workflowId: id,
      lastSeen: { lt: staleBefore },
    },
  });

  const presence = await prisma.workflowPresence.findMany({
    where: {
      workflowId: id,
      lastSeen: { gt: activeAfter },
    },
    orderBy: { lastSeen: "desc" },
    select: {
      sessionId: true,
      displayName: true,
      color: true,
      lastSeen: true,
    },
  });

  return NextResponse.json(presence);
}

export async function POST(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const data = heartbeatSchema.parse(await request.json());

    await prisma.workflowPresence.upsert({
      where: {
        workflowId_sessionId: {
          workflowId: id,
          sessionId: data.sessionId,
        },
      },
      update: {
        lastSeen: new Date(),
        ...(data.displayName !== undefined && { displayName: data.displayName ?? null }),
        ...(data.color !== undefined && { color: data.color ?? null }),
      },
      create: {
        workflowId: id,
        sessionId: data.sessionId,
        displayName: data.displayName ?? null,
        color: data.color ?? null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    console.error("Failed to record presence", error);
    return NextResponse.json({ error: "Failed to record presence" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  await prisma.workflowPresence.deleteMany({
    where: {
      workflowId: id,
      sessionId,
    },
  });

  return NextResponse.json({ ok: true });
}

