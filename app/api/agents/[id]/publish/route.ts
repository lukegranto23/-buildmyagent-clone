import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
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

    const agent = await prisma.agent.findUnique({
      where: { id: params.id },
    });

    if (!agent || agent.userId !== dbUser.id) {
      return NextResponse.json({ error: "Agent not found or unauthorized" }, { status: 404 });
    }

    const { isPublic, marketplacePrice } = await request.json();

    const updatedAgent = await prisma.agent.update({
      where: { id: params.id },
      data: {
        isPublic: isPublic ?? false,
        marketplacePrice: marketplacePrice ?? null,
        status: isPublic ? "active" : agent.status,
      },
    });

    return NextResponse.json(updatedAgent);
  } catch (error) {
    console.error("Error publishing agent", error);
    return NextResponse.json({ error: "Failed to publish agent" }, { status: 500 });
  }
}
