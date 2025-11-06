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

export async function GET(request: Request, context: { params: { id: string; versionId: string } }) {
  const { id, versionId } = context.params;
  const url = new URL(request.url);
  const includeCurrent = url.searchParams.get("includeCurrent") === "true";

  const version = await prisma.workflowVersion.findFirst({
    where: { id: versionId, workflowId: id },
  });

  if (!version) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  const workflow = await prisma.workflow.findUnique({
    where: { id },
    select: {
      activeVersionId: true,
      nodes: true,
      edges: true,
      metadata: true,
      updatedAt: true,
    },
  });

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const payload: Record<string, unknown> = {
    version: {
      id: version.id,
      versionNumber: version.versionNumber,
      name: version.name,
      description: version.description,
      notes: version.notes,
      createdAt: version.createdAt,
      isActive: workflow.activeVersionId === version.id,
      nodes: safeParse(version.nodes, [] as unknown[]),
      edges: safeParse(version.edges, [] as unknown[]),
      metadata: safeParse(version.metadata, null as unknown),
    },
  };

  if (includeCurrent) {
    payload.current = {
      nodes: safeParse(workflow.nodes, [] as unknown[]),
      edges: safeParse(workflow.edges, [] as unknown[]),
      metadata: safeParse(workflow.metadata, null as unknown),
      updatedAt: workflow.updatedAt,
      isActive: workflow.activeVersionId === version.id,
    };
  }

  return NextResponse.json(payload);
}

export async function POST(request: Request, context: { params: { id: string; versionId: string } }) {
  const { id, versionId } = context.params;

  try {
    const body = await request.json().catch(() => ({}));
    const action = body?.action;

    const version = await prisma.workflowVersion.findFirst({
      where: { id: versionId, workflowId: id },
    });

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    if (action === "restore") {
      const updated = await prisma.workflow.update({
        where: { id },
        data: {
          nodes: version.nodes,
          edges: version.edges,
          metadata: version.metadata,
          activeVersionId: version.id,
        },
      });

      return NextResponse.json({
        restored: true,
        workflow: {
          ...updated,
          nodes: safeParse(updated.nodes, [] as unknown[]),
          edges: safeParse(updated.edges, [] as unknown[]),
          metadata: safeParse(updated.metadata, null as unknown),
        },
      });
    }

    if (action === "activate") {
      await prisma.workflow.update({
        where: { id },
        data: { activeVersionId: version.id },
      });

      return NextResponse.json({ activated: true });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update workflow version", error);
    return NextResponse.json({ error: "Failed to update workflow version" }, { status: 500 });
  }
}

