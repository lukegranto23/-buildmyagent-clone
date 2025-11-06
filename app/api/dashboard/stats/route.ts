import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();

  const [
    totalSessions,
    activeSessions,
    completedSessions,
    scheduledAppointments,
    upcomingAppointments,
  ] = await Promise.all([
    prisma.conversationSession.count(),
    prisma.conversationSession.count({ where: { status: "in-progress" } }),
    prisma.conversationSession.count({ where: { status: "completed" } }),
    prisma.appointment.count({ where: { status: "scheduled" } }),
    prisma.appointment.count({
      where: {
        status: { in: ["scheduled", "confirmed"] },
        start: { gte: now },
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

