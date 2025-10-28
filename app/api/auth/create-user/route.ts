import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/auth/create-user
 * Creates a user in the database from Supabase Auth credentials
 * Called after email confirmation to sync user to database
 */
export async function POST(request: NextRequest) {
  try {
    const { id, email, name } = await request.json();

    if (!id || !email) {
      return NextResponse.json(
        { error: "id and email are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (existingUser) {
      // User already exists, just return it
      return NextResponse.json({
        success: true,
        message: "User already exists",
        user: existingUser,
      });
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        id,
        email,
        name: name || email.split("@")[0],
        role: "USER",
      },
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("[auth/create-user] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to create user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
