import { NextResponse } from "next/server";
import { z } from "zod";

import { executeWorkflow } from "@/lib/workflow-engine";
import { logger } from "@/lib/logger";

const executeSchema = z.object({
  input: z.record(z.any()).optional().default({}),
});

export async function POST(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const body = await request.json();
    const { input } = executeSchema.parse(body);

    logger.info("Executing workflow", { workflowId: id });

    const result = await executeWorkflow(id, input);

    logger.info("Workflow execution completed", { 
      workflowId: id, 
      executionId: result.executionId 
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("Invalid workflow execution input", { workflowId: id, errors: error.issues });
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    logger.error("Failed to execute workflow", error, { workflowId: id });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to execute workflow" },
      { status: 500 }
    );
  }
}

