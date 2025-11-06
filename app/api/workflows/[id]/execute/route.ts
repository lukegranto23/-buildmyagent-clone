import { NextResponse } from "next/server";

import { executeWorkflow } from "@/lib/workflow-engine";

export async function POST(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const body = await request.json();
    const input = body.input || {};

    const result = await executeWorkflow(id, input);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to execute workflow", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to execute workflow" },
      { status: 500 }
    );
  }
}

