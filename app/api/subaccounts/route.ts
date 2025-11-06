import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const subAccountSchema = z.object({
  name: z.string().min(1),
  credits: z.number().optional().default(0),
});

export async function GET(request: Request) {
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

    const subAccounts = await prisma.subAccount.findMany({
      where: { ownerId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(subAccounts);
  } catch (error) {
    console.error("Error fetching sub-accounts", error);
    return NextResponse.json({ error: "Failed to fetch sub-accounts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const data = await request.json();
    const parsed = subAccountSchema.parse(data);

    const subAccount = await prisma.subAccount.create({
      data: {
        ownerId: dbUser.id,
        name: parsed.name,
        credits: parsed.credits,
      },
    });

    return NextResponse.json(subAccount, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.issues }, { status: 400 });
    }

    console.error("Error creating sub-account", error);
    return NextResponse.json({ error: "Failed to create sub-account" }, { status: 500 });
  }
}
