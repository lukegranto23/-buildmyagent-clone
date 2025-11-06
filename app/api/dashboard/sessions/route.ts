import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "50");
  const agentId = url.searchParams.get("agentId") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;

  const sessions = await prisma.conversationSession.findMany({
    where: {
      agent: { ownerId: session.user.id },
      ...(agentId && { agentId }),
      ...(status && { status }),
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 200),
    include: {
      agent: {
        select: {
          id: true,
          offerName: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        take: 10,
      },
    },
  });

  return NextResponse.json(sessions);
}

