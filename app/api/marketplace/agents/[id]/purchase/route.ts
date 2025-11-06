import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { useCredits } from "@/lib/credits";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const agent = await prisma.agent.findUnique({
      where: { id: params.id },
    });

    if (!agent || !agent.isPublic || !agent.marketplacePrice) {
      return NextResponse.json({ error: "Agent not available for purchase" }, { status: 404 });
    }

    // Check if user already owns this agent
    if (agent.userId === dbUser.id) {
      return NextResponse.json({ error: "You already own this agent" }, { status: 400 });
    }

    // Use credits to purchase
    try {
      await useCredits(
        dbUser.id,
        agent.marketplacePrice,
        `Purchased agent: ${agent.name}`,
        { agentId: agent.id }
      );
    } catch (error) {
      if (error instanceof Error && error.message === "Insufficient credits") {
        return NextResponse.json({ error: "Insufficient credits" }, { status: 400 });
      }
      throw error;
    }

    // Create a copy of the agent for the user
    const purchasedAgent = await prisma.agent.create({
      data: {
        name: agent.name,
        offerName: agent.offerName,
        clientName: agent.clientName,
        industryId: agent.industryId,
        roleId: agent.roleId,
        toneId: agent.toneId,
        description: agent.description,
        systemPrompt: agent.systemPrompt,
        blueprint: agent.blueprint,
        quickWins: agent.quickWins,
        deliverables: agent.deliverables,
        talkingPoints: agent.talkingPoints,
        salesScripts: agent.salesScripts,
        handoffChecklist: agent.handoffChecklist,
        integrations: agent.integrations,
        supportPackages: agent.supportPackages,
        priceSetup: agent.priceSetup,
        priceRetainer: agent.priceRetainer,
        ownerNotes: agent.ownerNotes,
        status: "draft",
        userId: dbUser.id,
        isPublic: false,
      },
    });

    return NextResponse.json({ agent: purchasedAgent, message: "Agent purchased successfully" });
  } catch (error) {
    console.error("Error purchasing agent", error);
    return NextResponse.json({ error: "Failed to purchase agent" }, { status: 500 });
  }
}
