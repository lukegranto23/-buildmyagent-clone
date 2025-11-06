import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const integrations = await prisma.integration.findMany({
      where: { status: "active" },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(integrations);
  } catch (error) {
    console.error("Error fetching integrations", error);
    return NextResponse.json({ error: "Failed to fetch integrations" }, { status: 500 });
  }
}
