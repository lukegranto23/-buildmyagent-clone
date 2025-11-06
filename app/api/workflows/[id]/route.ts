import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function safeParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function GET(_request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  const workflow = await prisma.workflow.findUnique({ where: { id } });

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...workflow,
    nodes: safeParse(workflow.nodes, []),
    edges: safeParse(workflow.edges, []),
    metadata: safeParse(workflow.metadata, null),
  });
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const data = await request.json();
    const workflow = await prisma.workflow.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.nodes && { nodes: JSON.stringify(data.nodes) }),
        ...(data.edges && { edges: JSON.stringify(data.edges) }),
        ...(data.status && { status: data.status }),
        ...(data.schedule !== undefined && { schedule: data.schedule }),
        ...(data.metadata !== undefined && { metadata: data.metadata ? JSON.stringify(data.metadata) : null }),
      },
    });

    return NextResponse.json({
      ...workflow,
      nodes: safeParse(workflow.nodes, []),
      edges: safeParse(workflow.edges, []),
      metadata: safeParse(workflow.metadata, null),
    });
  } catch (error) {
    console.error("Failed to update workflow", error);
    return NextResponse.json({ error: "Failed to update workflow" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  await prisma.workflow.delete({ where: { id } }).catch((error) => {
    console.error("Failed to delete workflow", error);
  });

  return NextResponse.json({ ok: true });
}

