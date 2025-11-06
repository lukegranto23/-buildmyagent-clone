import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  config: z.record(z.any()).optional(),
  credentials: z.record(z.any()).optional(),
  status: z.enum(["active", "inactive", "error"]).optional(),
});

export async function GET(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const integration = await prisma.integration.findUnique({
      where: { id },
    });

    if (!integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...integration,
      config: JSON.parse(integration.config),
      credentials: undefined, // Never expose credentials
    });
  } catch (error) {
    logger.error("Failed to fetch integration", error, { integrationId: id });
    return NextResponse.json(
      { error: "Failed to fetch integration" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const updateData: any = {
      ...(data.name && { name: data.name }),
      ...(data.config && { config: JSON.stringify(data.config) }),
      ...(data.status && { status: data.status }),
      updatedAt: new Date(),
    };

    if (data.credentials) {
      updateData.credentials = JSON.stringify(data.credentials);
    }

    const integration = await prisma.integration.update({
      where: { id },
      data: updateData,
    });

    logger.info("Integration updated", { integrationId: id });

    return NextResponse.json({
      ...integration,
      config: JSON.parse(integration.config),
      credentials: undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", details: error.issues },
        { status: 400 }
      );
    }

    logger.error("Failed to update integration", error, { integrationId: id });
    return NextResponse.json(
      { error: "Failed to update integration" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    await prisma.integration.delete({
      where: { id },
    });

    logger.info("Integration deleted", { integrationId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete integration", error, { integrationId: id });
    return NextResponse.json(
      { error: "Failed to delete integration" },
      { status: 500 }
    );
  }
}
