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

function buildGatherResponse(message: string, actionUrl: string) {
  const spoken = escapeXml(message);
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" speechTimeout="auto" action="${escapeXml(actionUrl)}" method="POST">
    <Say voice="Polly.Joanna">${spoken}</Say>
  </Gather>
  <Say voice="Polly.Joanna">I didn't catch that. Let's try again.</Say>
  <Redirect method="POST">${escapeXml(actionUrl)}</Redirect>
</Response>`;
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const agentId = url.searchParams.get("agentId");

  if (!agentId) {
    return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">This line is not configured yet. Please contact support.</Say>
  <Hangup/>
</Response>`);
  }

  const formData = await request.formData();
  const callSid = formData.get("CallSid")?.toString() ?? undefined;
  const callStatus = formData.get("CallStatus")?.toString() ?? "";
  const caller = formData.get("From")?.toString() ?? "Unknown";
  const speechResult = formData.get("SpeechResult")?.toString().trim() ?? "";

  const agentRecord = await prisma.agent.findUnique({ where: { id: agentId } });

  if (!agentRecord) {
    return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">We weren't able to locate the agent for this number.</Say>
  <Hangup/>
</Response>`);
  }

  const agent = hydrateAgentRecord(agentRecord);
  const actionUrl = url.toString();
  const externalId = callSid ? `call:${callSid}` : `call:${agentId}:${caller}`;

  let session = await prisma.conversationSession.findUnique({
    where: { externalId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!session) {
    session = await prisma.conversationSession.create({
      data: {
        agentId: agent.id,
        channel: "voice",
        status: "in-progress",
        externalId,
        metadata: JSON.stringify({ callSid, caller }),
      },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  }

  // If Twilio notifies call completion, mark session and return.
  if (callStatus === "completed" || callStatus === "canceled") {
    await prisma.conversationSession.update({
      where: { id: session.id },
      data: { status: "completed", outcome: callStatus },
    });
    return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Hangup/>
</Response>`);
  }

  // First turn: greet the caller and start gathering.
  if (!speechResult) {
    const greeting = `Hi, you've reached ${agent.offerName}. How can I make things easier for you today?`;

    if (!session.messages.length) {
      await prisma.message.create({
        data: {
          sessionId: session.id,
          role: "assistant",
          content: greeting,
        },
      });
    }

    return xmlResponse(buildGatherResponse(greeting, actionUrl));
  }

  await prisma.message.create({
    data: {
      sessionId: session.id,
      role: "user",
      content: speechResult,
    },
  });

  if (messageRequestsBooking(speechResult)) {
    const result = await bookAppointment({
      agentId: agent.id,
      customerContact: caller,
      channel: "voice",
      source: "voice-runtime",
    });

    if (result.ok) {
      const slotText = formatSlotForSpeech({ start: result.appointment.start, timezone: result.timezone });
      const confirmation = `Perfect. I've scheduled you for ${slotText}. You'll get a reminder shortly.`;

      await prisma.message.create({
        data: {
          sessionId: session.id,
          role: "assistant",
          content: confirmation,
        },
      });

      await prisma.conversationSession.update({
        where: { id: session.id },
        data: {
          status: "completed",
          outcome: "scheduled",
          updatedAt: new Date(),
        },
      });

      return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${escapeXml(confirmation)}</Say>
  <Hangup/>
</Response>`);
    }

    const apology = "I'm not seeing any open slots right now. Would you like me to take a message for the team?";

    await prisma.message.create({
      data: {
        sessionId: session.id,
        role: "assistant",
        content: apology,
      },
    });

    return xmlResponse(buildGatherResponse(apology, actionUrl));
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

  return xmlResponse(buildGatherResponse(reply, actionUrl));
}


