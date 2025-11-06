import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { generateAgentReply, hydrateAgentRecord, mapMessagesToChat } from "@/lib/runtime";
import { bookAppointment, formatSlotForSpeech } from "@/lib/scheduling";

const BOOKING_KEYWORDS = ["book", "schedule", "appointment", "reserve", "visit", "service", "time"];

function messageRequestsBooking(message: string) {
  const lowered = message.toLowerCase();
  return BOOKING_KEYWORDS.some((keyword) => lowered.includes(keyword));
}

function xmlResponse(body: string, status = 200) {
  return new NextResponse(body, {
    status,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
    },
  });
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const agentId = url.searchParams.get("agentId");

  if (!agentId) {
    return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>This number has not been configured yet.</Message>
</Response>`);
  }

  const formData = await request.formData();
  const from = formData.get("From")?.toString() ?? "Unknown";
  const body = formData.get("Body")?.toString().trim() ?? "";
  const messageSid = formData.get("MessageSid")?.toString() ?? undefined;

  if (!body) {
    return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Thanks for reaching out. Could you please share a bit more detail?</Message>
</Response>`);
  }

  const agentRecord = await prisma.agent.findUnique({ where: { id: agentId } });

  if (!agentRecord) {
    return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>We were unable to locate the agent configuration.</Message>
</Response>`);
  }

  const agent = hydrateAgentRecord(agentRecord);
  const externalId = `sms:${agentId}:${from}`;

  let session = await prisma.conversationSession.findUnique({
    where: { externalId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!session) {
    session = await prisma.conversationSession.create({
      data: {
        agentId: agent.id,
        channel: "sms",
        status: "in-progress",
        externalId,
        metadata: JSON.stringify({ from, messageSid }),
      },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  }

  await prisma.message.create({
    data: {
      sessionId: session.id,
      role: "user",
      content: body,
    },
  });

  if (messageRequestsBooking(body)) {
    const result = await bookAppointment({
      agentId: agent.id,
      customerName: null,
      customerContact: from,
      channel: "sms",
      source: "sms-runtime",
    });

    if (result.ok) {
      const slotText = formatSlotForSpeech({ start: result.appointment.start, timezone: result.timezone });
      const confirmation = `You're set for ${slotText}. We'll be ready for you! Reply STOP to opt out.`;

      await prisma.message.create({
        data: {
          sessionId: session.id,
          role: "assistant",
          content: confirmation,
        },
      });

      await prisma.conversationSession.update({
        where: { id: session.id },
        data: { status: "completed", outcome: "scheduled", updatedAt: new Date() },
      });

      return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(confirmation)}</Message>
</Response>`);
    }

    const apology = "I don't have an opening right now, but I can flag the team to call you back. Sound good?";

    await prisma.message.create({
      data: {
        sessionId: session.id,
        role: "assistant",
        content: apology,
      },
    });

    return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(apology)}</Message>
</Response>`);
  }

  const messages = await prisma.message.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: "asc" },
  });

  const conversation = mapMessagesToChat(messages);
  const reply = await generateAgentReply(agent, conversation);

  await prisma.message.create({
    data: {
      sessionId: session.id,
      role: "assistant",
      content: reply,
    },
  });

  await prisma.conversationSession.update({
    where: { id: session.id },
    data: {
      status: "in-progress",
      updatedAt: new Date(),
    },
  });

  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(reply)}</Message>
</Response>`);
}


