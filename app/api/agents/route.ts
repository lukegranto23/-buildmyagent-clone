import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { prisma } from "@/lib/prisma";
import { hydrateAgentRecord } from "@/lib/runtime";

const salesScriptsSchema = z.object({
  phone: z.string(),
  sms: z.string(),
  email: z.string(),
  printBlurb: z.string(),
});

const agentPayloadSchema = z.object({
  name: z.string().min(1, "Agent name is required"),
  offerName: z.string().min(1, "Offer name is required"),
  clientName: z.string().optional().nullable(),
  industryId: z.string().min(1),
  roleId: z.string().min(1),
  toneId: z.string().min(1),
  description: z.string().optional().nullable(),
  systemPrompt: z.string().min(1, "System prompt is required"),
  blueprint: z.any(),
  quickWins: z.array(z.string()),
  deliverables: z.array(z.string()),
  talkingPoints: z.array(z.string()),
  salesScripts: salesScriptsSchema,
  handoffChecklist: z.array(z.string()),
  integrations: z.array(z.string()),
  supportPackages: z.array(z.any()),
  priceSetup: z.number(),
  priceRetainer: z.number(),
  ownerNotes: z.string().optional().nullable(),
  status: z.string().optional(),
});

function safeStringify(value: unknown) {
  return JSON.stringify(value ?? null);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const agents = await prisma.agent.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(agents.map(hydrateAgentRecord));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const parsed = agentPayloadSchema.parse(data);

    const agent = await prisma.agent.create({
      data: {
        userId,
        name: parsed.name,
        offerName: parsed.offerName,
        clientName: parsed.clientName ?? null,
        industryId: parsed.industryId,
        roleId: parsed.roleId,
        toneId: parsed.toneId,
        description: parsed.description ?? null,
        systemPrompt: parsed.systemPrompt,
        blueprint: safeStringify(parsed.blueprint),
        quickWins: safeStringify(parsed.quickWins),
        deliverables: safeStringify(parsed.deliverables),
        talkingPoints: safeStringify(parsed.talkingPoints),
        salesScripts: safeStringify(parsed.salesScripts),
        handoffChecklist: safeStringify(parsed.handoffChecklist),
        integrations: safeStringify(parsed.integrations),
        supportPackages: safeStringify(parsed.supportPackages),
        priceSetup: parsed.priceSetup,
        priceRetainer: parsed.priceRetainer,
        ownerNotes: parsed.ownerNotes ?? null,
        status: parsed.status ?? "draft",
      },
    });

    return NextResponse.json(hydrateAgentRecord(agent), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.issues }, { status: 400 });
    }

    console.error("Failed to create agent", error);
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
  }
}


