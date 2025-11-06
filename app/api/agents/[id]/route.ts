import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { hydrateAgentRecord } from "@/lib/runtime";

const jsonColumns = [
  "blueprint",
  "quickWins",
  "deliverables",
  "talkingPoints",
  "salesScripts",
  "handoffChecklist",
  "integrations",
  "supportPackages",
] as const;

const agentUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    offerName: z.string().min(1).optional(),
    clientName: z.string().optional().nullable(),
    industryId: z.string().min(1).optional(),
    roleId: z.string().min(1).optional(),
    toneId: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    systemPrompt: z.string().optional(),
    blueprint: z.any().optional(),
    quickWins: z.array(z.string()).optional(),
    deliverables: z.array(z.string()).optional(),
    talkingPoints: z.array(z.string()).optional(),
    salesScripts: z
      .object({
        phone: z.string(),
        sms: z.string(),
        email: z.string(),
        printBlurb: z.string(),
      })
      .optional(),
    handoffChecklist: z.array(z.string()).optional(),
    integrations: z.array(z.string()).optional(),
    supportPackages: z.array(z.any()).optional(),
    priceSetup: z.number().optional(),
    priceRetainer: z.number().optional(),
    ownerNotes: z.string().optional().nullable(),
    status: z.string().optional(),
  })
  .strict();

export async function GET(_request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  const agentRecord = await prisma.agent.findUnique({ where: { id } });

  if (!agentRecord) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  return NextResponse.json(hydrateAgentRecord(agentRecord));
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const existing = await prisma.agent.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const payload = agentUpdateSchema.parse(await request.json());

    const jsonData: Record<string, string> = {};

    for (const key of jsonColumns) {
      if (key in payload) {
        const value = payload[key as keyof typeof payload];
        jsonData[key] = JSON.stringify(value ?? null);
      }
    }

    const updateData = {
      ...(payload.name !== undefined && { name: payload.name }),
      ...(payload.offerName !== undefined && { offerName: payload.offerName }),
      ...(payload.clientName !== undefined && { clientName: payload.clientName }),
      ...(payload.industryId !== undefined && { industryId: payload.industryId }),
      ...(payload.roleId !== undefined && { roleId: payload.roleId }),
      ...(payload.toneId !== undefined && { toneId: payload.toneId }),
      ...(payload.description !== undefined && { description: payload.description }),
      ...(payload.systemPrompt !== undefined && { systemPrompt: payload.systemPrompt }),
      ...(payload.ownerNotes !== undefined && { ownerNotes: payload.ownerNotes }),
      ...(payload.priceSetup !== undefined && { priceSetup: payload.priceSetup }),
      ...(payload.priceRetainer !== undefined && { priceRetainer: payload.priceRetainer }),
      ...(payload.status !== undefined && { status: payload.status }),
      ...jsonData,
    } satisfies Parameters<typeof prisma.agent.update>[0]["data"];

    const updated = await prisma.agent.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(hydrateAgentRecord(updated));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.issues }, { status: 400 });
    }

    console.error("Failed to update agent", error);
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  await prisma.agent.delete({ where: { id } }).catch((error) => {
    console.error("Failed to delete agent", error);
  });

  return NextResponse.json({ ok: true });
}


