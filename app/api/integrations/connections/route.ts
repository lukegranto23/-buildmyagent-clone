import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const subAccountId = url.searchParams.get("subAccountId");

    const connections = await prisma.integrationConnection.findMany({
      where: {
        userId: dbUser.id,
        ...(subAccountId && { subAccountId }),
      },
      include: {
        integration: true,
      },
    });

    return NextResponse.json(connections);
  } catch (error) {
    console.error("Error fetching connections", error);
    return NextResponse.json({ error: "Failed to fetch connections" }, { status: 500 });
  }
}
