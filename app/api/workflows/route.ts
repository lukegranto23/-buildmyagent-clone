import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const workflowSchema = z.object({
  agentId: z.string().optional().nullable(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
  status: z.enum(["draft", "active", "paused"]).default("draft"),
  schedule: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const agentId = url.searchParams.get("agentId");
  const status = url.searchParams.get("status");

  const workflows = await prisma.workflow.findMany({
    where: {
      ownerId: session.user.id,
      ...(agentId && { agentId }),
      ...(status && { status }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { executions: true },
      },
    },
  });

  return NextResponse.json(workflows);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const parsed = workflowSchema.parse(data);

    const workflow = await prisma.workflow.create({
      data: {
        ownerId: session.user.id,
        agentId: parsed.agentId ?? null,
        name: parsed.name,
        description: parsed.description ?? null,
        nodes: JSON.stringify(parsed.nodes),
        edges: JSON.stringify(parsed.edges),
        status: parsed.status,
        schedule: parsed.schedule ?? null,
        metadata: parsed.metadata ? JSON.stringify(parsed.metadata) : null,
      },
    });

    return NextResponse.json(
      {
        ...workflow,
        nodes: parsed.nodes,
        edges: parsed.edges,
        metadata: parsed.metadata,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.issues }, { status: 400 });
    }

    console.error("Failed to create workflow", error);
    return NextResponse.json({ error: "Failed to create workflow" }, { status: 500 });
  }
}

