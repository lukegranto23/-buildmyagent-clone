import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function safeParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    return fallback;
  }
}

export async function GET(_request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  const workflow = await prisma.workflow.findUnique({ where: { id } });

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const payload = {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    status: workflow.status,
    agentId: workflow.agentId,
    nodes: safeParse(workflow.nodes, [] as unknown[]),
    edges: safeParse(workflow.edges, [] as unknown[]),
    metadata: safeParse(workflow.metadata, null as unknown),
    schedule: workflow.schedule,
    createdAt: workflow.createdAt,
    updatedAt: workflow.updatedAt,
  };

  const body = JSON.stringify(payload, null, 2);
  const filename = `${workflow.name.replace(/[^a-z0-9-_]+/gi, "-") || "workflow"}-${workflow.id}.json`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

