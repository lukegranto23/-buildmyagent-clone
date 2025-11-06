import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookAppointment } from "@/lib/scheduling";

const createAppointmentSchema = z.object({
  customerName: z.string().optional().nullable(),
  customerContact: z.string().optional().nullable(),
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  channel: z.string().default("manual"),
  notes: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
});

export async function GET(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  const url = new URL(request.url);

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = url.searchParams.get("status") ?? undefined;
  const limit = Number(url.searchParams.get("limit") ?? "50");
  const after = url.searchParams.get("after");

  const agent = await prisma.agent.findFirst({ where: { id, ownerId: session.user.id } });

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      agentId: id,
      status: status ? { equals: status } : undefined,
      start: after ? { gte: new Date(after) } : undefined,
    },
    orderBy: { start: "asc" },
    take: Math.min(limit, 200),
  });

  return NextResponse.json(appointments);
}

export async function POST(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma.agent.findFirst({ where: { id, ownerId: session.user.id } });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const payload = createAppointmentSchema.parse(await request.json());

    if (payload.start && payload.end) {
      const start = new Date(payload.start);
      const end = new Date(payload.end);

      const overlapping = await prisma.appointment.findFirst({
        where: {
          agentId: id,
          status: { in: ["scheduled", "confirmed"] },
          OR: [
            {
              start: { lte: start },
              end: { gt: start },
            },
            {
              start: { lt: end },
              end: { gte: end },
            },
            {
              start: { gte: start },
              end: { lte: end },
            },
          ],
        },
      });

      if (overlapping) {
        return NextResponse.json({ error: "conflict" }, { status: 409 });
      }

      const appointment = await prisma.appointment.create({
        data: {
          agentId: id,
          customerName: payload.customerName ?? null,
          customerContact: payload.customerContact ?? null,
          start,
          end,
          channel: payload.channel ?? "manual",
          status: "scheduled",
          notes: payload.notes ?? null,
          source: payload.source ?? "manual",
        },
      });

      return NextResponse.json(appointment, { status: 201 });
    }

    const result = await bookAppointment({
      agentId: id,
      customerName: payload.customerName,
      customerContact: payload.customerContact,
      channel: payload.channel ?? "manual",
      source: payload.source ?? "manual",
      notes: payload.notes ?? null,
    });

    if (!result.ok) {
      return NextResponse.json({ error: "no-availability" }, { status: 409 });
    }

    return NextResponse.json(result.appointment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.issues }, { status: 400 });
    }

    console.error("Failed to create appointment", error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}


