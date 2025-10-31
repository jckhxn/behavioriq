import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

/**
 * POST /api/auth/create-user
 * Creates a user in the database from Supabase Auth credentials
 * Called after email confirmation to sync user to database
 *
 * Body: { id, email, name, password }
 */
export async function POST(request: NextRequest) {
  try {
    const { id, email, name, password } = await request.json();

    if (!id || !email) {
      return NextResponse.json(
        { error: "id and email are required" },
        { status: 400 }
      );
    }

    // Check if user already exists by Supabase ID
    let existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (existingUser) {
      // User with this Supabase ID already exists
      return NextResponse.json({
        success: true,
        message: "User already exists",
        user: existingUser,
      });
    }

    // Also check if email already exists (from failed signup attempt or duplicate)
    const emailExists = await prisma.user.findUnique({
      where: { email },
    });

    if (emailExists) {
      // Email is taken but Supabase ID doesn't match
      // This is unusual - likely a duplicate signup. Link to existing user
      console.warn(
        `[auth/create-user] Email ${email} already exists with different ID. Existing: ${emailExists.id}, New: ${id}`
      );

      // Update the existing user with the new Supabase ID and password
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          id, // Update to match the new Supabase ID
          name: name || emailExists.name || email.split("@")[0],
          password: password
            ? await bcrypt.hash(password, 12)
            : emailExists.password,
        },
      });

      return NextResponse.json({
        success: true,
        message: "User linked to existing email",
        user: updatedUser,
      });
    }

    // Hash the password if provided
    let hashedPassword = "supabase-auth-placeholder"; // Default if no password
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        id,
        email,
        name: name || email.split("@")[0],
        role: "USER",
        password: hashedPassword,
      },
    });

    // TODO: Check for anonymous payments with affiliate refCodes matching this email
    // When found, create AffiliateAttribution linking refCode to new userId
    // This requires storing customer email in payment metadata from Stripe checkout

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
