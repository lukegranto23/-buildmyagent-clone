import { addMinutes, isBefore, isEqual } from "date-fns";

import { prisma } from "@/lib/prisma";

type AvailabilityWindow = {
  start: string; // HH:mm
  end: string; // HH:mm
};

type AvailabilityConfig = {
  day: number; // 0-6 (Sunday=0)
  windows: AvailabilityWindow[];
};

type CalendarConfig = {
  timezone: string;
  meetingDuration: number;
  bufferBefore: number;
  bufferAfter: number;
  availability: AvailabilityConfig[];
};

const DEFAULT_AVAILABILITY: AvailabilityConfig[] = [
  { day: 1, windows: [{ start: "09:00", end: "17:00" }] },
  { day: 2, windows: [{ start: "09:00", end: "17:00" }] },
  { day: 3, windows: [{ start: "09:00", end: "17:00" }] },
  { day: 4, windows: [{ start: "09:00", end: "17:00" }] },
  { day: 5, windows: [{ start: "09:00", end: "15:00" }] },
];

function parseAvailability(json: string | null | undefined): AvailabilityConfig[] {
  if (!json) return DEFAULT_AVAILABILITY;
  try {
    const parsed = JSON.parse(json) as AvailabilityConfig[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_AVAILABILITY;
    }
    return parsed;
  } catch (error) {
    console.warn("Failed to parse availability", error);
    return DEFAULT_AVAILABILITY;
  }
}

export async function getCalendarConfig(agentId: string): Promise<CalendarConfig> {
  const record = await prisma.calendarConfig.findUnique({ where: { agentId } });

  return {
    timezone: record?.timezone ?? "America/Chicago",
    meetingDuration: record?.meetingDuration ?? 30,
    bufferBefore: record?.bufferBefore ?? 10,
    bufferAfter: record?.bufferAfter ?? 10,
    availability: parseAvailability(record?.availability),
  };
}

function timeStringToDate(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map((v) => parseInt(v, 10));
  const clone = new Date(date);
  clone.setHours(hours, minutes, 0, 0);
  return clone;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

export async function findNextAvailableSlot(agentId: string, from: Date = new Date()) {
  const config = await getCalendarConfig(agentId);
  const appointments = await prisma.appointment.findMany({
    where: {
      agentId,
      status: { in: ["scheduled", "confirmed"] },
      end: { gte: from },
    },
    orderBy: { start: "asc" },
  });

  const appointmentWindows = appointments.map((appointment) => ({
    start: appointment.start,
    end: appointment.end,
  }));

  const searchLimit = 30; // days ahead
  const now = from;

  for (let dayOffset = 0; dayOffset <= searchLimit; dayOffset += 1) {
    const candidateDate = new Date(now.getTime());
    candidateDate.setDate(now.getDate() + dayOffset);
    const weekday = candidateDate.getDay();

    const availability = config.availability.find((entry) => entry.day === weekday);
    if (!availability) continue;

    for (const window of availability.windows) {
      const windowStart = timeStringToDate(candidateDate, window.start);
      const windowEnd = timeStringToDate(candidateDate, window.end);

      if (isBefore(windowEnd, now) || isEqual(windowEnd, now)) continue;

      let slotStart = windowStart < now ? new Date(now.getTime()) : windowStart;

      // apply buffer before
      slotStart = addMinutes(slotStart, config.bufferBefore);

      while (isBefore(addMinutes(slotStart, config.meetingDuration), windowEnd)) {
        const slotEnd = addMinutes(slotStart, config.meetingDuration + config.bufferAfter);

        const hasConflict = appointmentWindows.some((appointment) =>
          overlaps(slotStart, slotEnd, appointment.start, appointment.end)
        );

        if (!hasConflict) {
          return {
            start: slotStart,
            end: addMinutes(slotStart, config.meetingDuration),
            timezone: config.timezone,
          };
        }

        slotStart = addMinutes(slotStart, config.meetingDuration);
      }
    }
  }

  return null;
}

export async function bookAppointment(options: {
  agentId: string;
  customerName?: string | null;
  customerContact?: string | null;
  channel: string;
  source?: string | null;
  notes?: string | null;
}) {
  const config = await getCalendarConfig(options.agentId);
  const slot = await findNextAvailableSlot(options.agentId);

  if (!slot) {
    return { ok: false as const, reason: "no-slot" };
  }

  const appointment = await prisma.appointment.create({
    data: {
      agentId: options.agentId,
      customerName: options.customerName ?? null,
      customerContact: options.customerContact ?? null,
      start: slot.start,
      end: slot.end,
      channel: options.channel,
      status: "scheduled",
      source: options.source ?? "runtime",
      notes: options.notes ?? null,
    },
  });

  return { ok: true as const, appointment, slot, timezone: config.timezone };
}

export function formatSlotForSpeech(slot: { start: Date; timezone: string }) {
  return slot.start.toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: slot.timezone,
  });
}


