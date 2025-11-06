import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
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

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workflow = await prisma.workflow.findFirst({ where: { id, ownerId: session.user.id } });

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...workflow,
    nodes: safeParse(workflow.nodes, []),
    edges: safeParse(workflow.edges, []),
    metadata: safeParse(workflow.metadata, null),
    activeVersionId: workflow.activeVersionId,
  });
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.workflow.findFirst({ where: { id, ownerId: session.user.id } });

    if (!existing) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const data = await request.json();
    const workflow = await prisma.workflow.update({
      where: { id: existing.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.nodes && { nodes: JSON.stringify(data.nodes) }),
        ...(data.edges && { edges: JSON.stringify(data.edges) }),
        ...(data.status && { status: data.status }),
        ...(data.schedule !== undefined && { schedule: data.schedule }),
        ...(data.metadata !== undefined && { metadata: data.metadata ? JSON.stringify(data.metadata) : null }),
        ...(data.activeVersionId !== undefined && { activeVersionId: data.activeVersionId }),
      },
    });

    return NextResponse.json({
      ...workflow,
      nodes: safeParse(workflow.nodes, []),
      edges: safeParse(workflow.edges, []),
      metadata: safeParse(workflow.metadata, null),
      activeVersionId: workflow.activeVersionId,
    });
  } catch (error) {
    console.error("Failed to update workflow", error);
    return NextResponse.json({ error: "Failed to update workflow" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.workflow.findFirst({ where: { id, ownerId: session.user.id } });

  if (!existing) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  await prisma.workflow.delete({ where: { id: existing.id } }).catch((error) => {
    console.error("Failed to delete workflow", error);
  });

  return NextResponse.json({ ok: true });
}

