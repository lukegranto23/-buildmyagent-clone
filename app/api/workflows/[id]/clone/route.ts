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

export async function POST(_request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  const workflow = await prisma.workflow.findUnique({ where: { id } });

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const baseName = workflow.name?.trim() || "Workflow";
  const copySuffix = " Copy";
  const proposedName = `${baseName}${copySuffix}`;
  const clippedName = proposedName.length > 120 ? `${baseName.slice(0, 120 - copySuffix.length)}${copySuffix}` : proposedName;

  const cloned = await prisma.workflow.create({
    data: {
      agentId: workflow.agentId,
      name: clippedName,
      description: workflow.description,
      nodes: workflow.nodes,
      edges: workflow.edges,
      status: "draft",
      schedule: workflow.schedule,
      metadata: workflow.metadata,
    },
  });

  return NextResponse.json({
    ...cloned,
    nodes: safeParse(cloned.nodes, [] as unknown[]),
    edges: safeParse(cloned.edges, [] as unknown[]),
    metadata: safeParse(cloned.metadata, null as unknown),
  });
}

