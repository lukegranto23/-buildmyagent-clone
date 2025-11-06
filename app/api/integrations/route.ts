import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const integrationSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["webhook", "rest", "database", "email", "slack", "twilio", "stripe", "custom"]),
  config: z.record(z.any()),
  credentials: z.record(z.any()).optional(),
  status: z.enum(["active", "inactive", "error"]).default("active"),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const status = url.searchParams.get("status");

    const integrations = await prisma.integration.findMany({
      where: {
        ...(type && { type }),
        ...(status && { status }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(integrations);
  } catch (error) {
    logger.error("Failed to fetch integrations", error);
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = integrationSchema.parse(body);

    // Encrypt credentials before storing (in production, use proper encryption)
    const encryptedCredentials = data.credentials 
      ? JSON.stringify(data.credentials)
      : null;

    const integration = await prisma.integration.create({
      data: {
        name: data.name,
        type: data.type,
        config: JSON.stringify(data.config),
        credentials: encryptedCredentials,
        status: data.status,
      },
    });

    logger.info("Integration created", { 
      integrationId: integration.id, 
      type: integration.type 
    });

    return NextResponse.json(
      {
        ...integration,
        config: data.config,
        // Never return credentials
        credentials: undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("Invalid integration data", { errors: error.issues });
      return NextResponse.json(
        { error: "Invalid payload", details: error.issues },
        { status: 400 }
      );
    }

    logger.error("Failed to create integration", error);
    return NextResponse.json(
      { error: "Failed to create integration" },
      { status: 500 }
    );
  }
}
