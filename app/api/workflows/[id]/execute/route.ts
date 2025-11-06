import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { executeWorkflow } from "@/lib/workflow-engine";

export async function POST(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workflow = await prisma.workflow.findFirst({ where: { id, ownerId: session.user.id } });
    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const body = await request.json();
    const input = body.input || {};

    const result = await executeWorkflow(workflow.id, input);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to execute workflow", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to execute workflow" },
      { status: 500 }
    );
  }
}

