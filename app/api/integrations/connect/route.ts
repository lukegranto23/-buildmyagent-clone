import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { integrationId, credentials, subAccountId } = await request.json();

    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    // Check if connection already exists
    const existing = await prisma.integrationConnection.findFirst({
      where: {
        userId: dbUser.id,
        integrationId,
        subAccountId: subAccountId || null,
      },
    });

    if (existing) {
      // Update existing connection
      const updated = await prisma.integrationConnection.update({
        where: { id: existing.id },
        data: {
          credentials: credentials ? JSON.stringify(credentials) : null,
          status: "active",
          updatedAt: new Date(),
        },
      });

      return NextResponse.json(updated);
    }

    // Create new connection
    const connection = await prisma.integrationConnection.create({
      data: {
        userId: dbUser.id,
        subAccountId: subAccountId || null,
        integrationId,
        credentials: credentials ? JSON.stringify(credentials) : null,
        status: "active",
      },
    });

    return NextResponse.json(connection, { status: 201 });
  } catch (error) {
    console.error("Error connecting integration", error);
    return NextResponse.json({ error: "Failed to connect integration" }, { status: 500 });
  }
}
