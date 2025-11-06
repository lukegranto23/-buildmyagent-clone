import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hydrateAgentRecord } from "@/lib/runtime";

export async function GET(_request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  const agentRecord = await prisma.agent.findUnique({ where: { id } });

  if (!agentRecord) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  return NextResponse.json(hydrateAgentRecord(agentRecord));
}

export async function DELETE(_request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  await prisma.agent.delete({ where: { id } }).catch((error) => {
    console.error("Failed to delete agent", error);
  });

  return NextResponse.json({ ok: true });
}


