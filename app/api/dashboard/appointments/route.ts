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
  const limit = Number(url.searchParams.get("limit") ?? "20");
  const agentId = url.searchParams.get("agentId") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const after = url.searchParams.get("after");
  const showPast = url.searchParams.get("showPast") === "true";

  const now = new Date();

  const appointments = await prisma.appointment.findMany({
    where: {
      agent: { ownerId: session.user.id },
      ...(agentId && { agentId }),
      ...(status && { status }),
      ...(after ? { start: { gte: new Date(after) } } : !showPast ? { start: { gte: now } } : {}),
    },
    orderBy: { start: "asc" },
    take: Math.min(limit, 200),
  });

  return NextResponse.json(appointments);
}

