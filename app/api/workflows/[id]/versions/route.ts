import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  const workflow = await prisma.workflow.findUnique({
    where: { id },
    select: {
      id: true,
      activeVersionId: true,
      versions: {
        orderBy: { versionNumber: "desc" },
        select: {
          id: true,
          versionNumber: true,
          name: true,
          description: true,
          notes: true,
          createdAt: true,
        },
      },
    },
  });

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const { activeVersionId } = workflow;
  const summaries = workflow.versions.map((version) => ({
    ...version,
    isActive: version.id === activeVersionId,
  }));

  return NextResponse.json(summaries);
}

export async function POST(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const workflow = await prisma.workflow.findUnique({ where: { id } });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const notes = typeof body?.notes === "string" ? body.notes : undefined;
    const name = typeof body?.name === "string" ? body.name : undefined;
    const activate = body?.activate === true;

    const lastVersion = await prisma.workflowVersion.findFirst({
      where: { workflowId: id },
      orderBy: { versionNumber: "desc" },
      select: { versionNumber: true },
    });

    const nextVersionNumber = (lastVersion?.versionNumber ?? 0) + 1;

    const version = await prisma.workflowVersion.create({
      data: {
        workflowId: id,
        versionNumber: nextVersionNumber,
        name: name ?? `Version ${nextVersionNumber}`,
        description: workflow.description,
        notes,
        nodes: workflow.nodes,
        edges: workflow.edges,
        metadata: workflow.metadata,
      },
    });

    if (activate) {
      await prisma.workflow.update({
        where: { id },
        data: { activeVersionId: version.id },
      });
    }

    return NextResponse.json({
      ...version,
      isActive: activate,
    });
  } catch (error) {
    console.error("Failed to create workflow version", error);
    return NextResponse.json({ error: "Failed to create version" }, { status: 500 });
  }
}

