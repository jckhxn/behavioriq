import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: "USER",
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create user in database
    if (data.user) {
      try {
        await prisma.user.create({
          data: {
            id: data.user.id,
            email,
            name,
            password: "", // No longer needed with Supabase
            role: "USER",
          },
        });
      } catch (dbError: any) {
        // If user already exists in DB, that's okay
        console.log("User might already exist in database:", dbError.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Check your email to confirm your account",
      user: data.user,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during signup" },
      { status: 500 }
    );
  }
}
