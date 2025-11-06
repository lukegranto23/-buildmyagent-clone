import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const [
    totalSessions,
    activeSessions,
    completedSessions,
    scheduledAppointments,
    upcomingAppointments,
  ] = await Promise.all([
    prisma.conversationSession.count({ where: { agent: { ownerId: session.user.id } } }),
    prisma.conversationSession.count({ where: { status: "in-progress", agent: { ownerId: session.user.id } } }),
    prisma.conversationSession.count({ where: { status: "completed", agent: { ownerId: session.user.id } } }),
    prisma.appointment.count({ where: { status: "scheduled", agent: { ownerId: session.user.id } } }),
    prisma.appointment.count({
      where: {
        status: { in: ["scheduled", "confirmed"] },
        start: { gte: now },
        agent: { ownerId: session.user.id },
      },
    }),
  ]);

  return NextResponse.json({
    totalSessions,
    activeSessions,
    completedSessions,
    scheduledAppointments,
    upcomingAppointments,
  });
}

