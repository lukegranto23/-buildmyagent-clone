import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCredits, addCredits, useCredits } from "@/lib/credits";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

    const url = new URL(request.url);
    const subAccountId = url.searchParams.get("subAccountId") || undefined;

    const credits = await getCredits(dbUser.id, subAccountId);

    return NextResponse.json({ credits });
  } catch (error) {
    console.error("Error fetching credits", error);
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 });
  }
}

const addCreditsSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(["purchase", "refund", "bonus"]),
  description: z.string().optional(),
  subAccountId: z.string().optional(),
});

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
    const parsed = addCreditsSchema.parse(data);

    const transaction = await addCredits(
      dbUser.id,
      parsed.amount,
      parsed.type,
      parsed.description,
      undefined,
      parsed.subAccountId
    );

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.issues }, { status: 400 });
    }

    console.error("Error adding credits", error);
    return NextResponse.json({ error: "Failed to add credits" }, { status: 500 });
  }
}

const useCreditsSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
  subAccountId: z.string().optional(),
});

export async function PUT(request: Request) {
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
    const parsed = useCreditsSchema.parse(data);

    const transaction = await useCredits(
      dbUser.id,
      parsed.amount,
      parsed.description,
      undefined,
      parsed.subAccountId
    );

    return NextResponse.json(transaction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.issues }, { status: 400 });
    }

    if (error instanceof Error && error.message === "Insufficient credits") {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 400 });
    }

    console.error("Error using credits", error);
    return NextResponse.json({ error: "Failed to use credits" }, { status: 500 });
  }
}
