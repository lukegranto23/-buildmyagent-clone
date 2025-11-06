import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const MAX_LIMIT = 50;

export async function GET(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const parsedLimit = Number(limitParam ?? "10");
  const limit = Math.min(Math.max(Number.isFinite(parsedLimit) ? parsedLimit : 10, 1), MAX_LIMIT);

  const executions = await prisma.workflowExecution.findMany({
    where: { workflowId: id },
    orderBy: { startedAt: "desc" },
    take: limit,
    select: {
      id: true,
      status: true,
      startedAt: true,
      completedAt: true,
      error: true,
      output: true,
      input: true,
      workflowId: true,
    },
  });

  const normalized = executions.map((execution) => ({
    ...execution,
    input: execution.input ? safeParse(execution.input) : null,
    output: execution.output ? safeParse(execution.output) : null,
  }));

  return NextResponse.json(normalized);
}

function safeParse(json: string) {
  try {
    return JSON.parse(json);
  } catch (error) {
    return json;
  }
}


