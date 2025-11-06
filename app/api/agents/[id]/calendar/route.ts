import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCalendarConfig } from "@/lib/scheduling";

const availabilityWindowSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
});

const availabilityDaySchema = z.object({
  day: z.number().int().min(0).max(6),
  windows: z.array(availabilityWindowSchema).nonempty(),
});

const calendarPayloadSchema = z.object({
  timezone: z.string().default("America/Chicago"),
  meetingDuration: z.number().int().min(10).max(240).default(30),
  bufferBefore: z.number().int().min(0).max(120).default(10),
  bufferAfter: z.number().int().min(0).max(120).default(10),
  availability: z.array(availabilityDaySchema).min(1),
});

export async function GET(_request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  const agent = await prisma.agent.findUnique({ where: { id } });

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const config = await getCalendarConfig(id);

  return NextResponse.json(config);
}

export async function POST(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const agent = await prisma.agent.findUnique({ where: { id } });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const data = await request.json();
    const parsed = calendarPayloadSchema.parse(data);

    const record = await prisma.calendarConfig.upsert({
      where: { agentId: id },
      update: {
        timezone: parsed.timezone,
        meetingDuration: parsed.meetingDuration,
        bufferBefore: parsed.bufferBefore,
        bufferAfter: parsed.bufferAfter,
        availability: JSON.stringify(parsed.availability),
      },
      create: {
        agentId: id,
        timezone: parsed.timezone,
        meetingDuration: parsed.meetingDuration,
        bufferBefore: parsed.bufferBefore,
        bufferAfter: parsed.bufferAfter,
        availability: JSON.stringify(parsed.availability),
      },
    });

    return NextResponse.json({
      timezone: record.timezone,
      meetingDuration: record.meetingDuration,
      bufferBefore: record.bufferBefore,
      bufferAfter: record.bufferAfter,
      availability: parsed.availability,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.issues }, { status: 400 });
    }

    console.error("Failed to update calendar config", error);
    return NextResponse.json({ error: "Failed to update calendar config" }, { status: 500 });
  }
}


