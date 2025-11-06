import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: { id: string; executionId: string } }) {
  const { id, executionId } = context.params;

  const execution = await prisma.workflowExecution.findFirst({
    where: {
      id: executionId,
      workflowId: id,
    },
    select: {
      id: true,
      status: true,
      startedAt: true,
      completedAt: true,
      error: true,
      output: true,
      input: true,
      logs: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          level: true,
          message: true,
          nodeId: true,
          data: true,
          createdAt: true,
        },
      },
    },
  });

  if (!execution) {
    return NextResponse.json({ error: "Execution not found" }, { status: 404 });
  }

  const logs = execution.logs.map((log) => ({
    ...log,
    data: log.data ? safeParse(log.data) : null,
  }));

  return NextResponse.json({
    id: execution.id,
    status: execution.status,
    startedAt: execution.startedAt,
    completedAt: execution.completedAt,
    error: execution.error,
    output: execution.output ? safeParse(execution.output) : null,
    input: execution.input ? safeParse(execution.input) : null,
    logs,
  });
}

function safeParse(json: string) {
  try {
    return JSON.parse(json);
  } catch (error) {
    return json;
  }
}


