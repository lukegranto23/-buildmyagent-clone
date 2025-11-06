import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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
  try {
    const user = await getCurrentUser();
    const url = new URL(request.url);
    const agentId = url.searchParams.get("agentId");
    const status = url.searchParams.get("status");
    const subAccountId = url.searchParams.get("subAccountId");

    const workflows = await prisma.workflow.findMany({
      where: {
        ...(user ? { userId: user.id } : {}),
        ...(agentId && { agentId }),
        ...(status && { status }),
        ...(subAccountId && { subAccountId }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { executions: true },
        },
      },
    });

    return NextResponse.json(workflows);
  } catch (error) {
    console.error("Error fetching workflows", error);
    return NextResponse.json({ error: "Failed to fetch workflows" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = await request.json();
    const parsed = workflowSchema.parse(data);

    const workflow = await prisma.workflow.create({
      data: {
        agentId: parsed.agentId ?? null,
        userId: dbUser.id,
        subAccountId: data.subAccountId || null,
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

