import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"
import { isRegistrationEnabled } from "@/lib/platform/settings"

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

export async function POST(request: NextRequest) {
  try {
    // Check if registration is enabled
    const registrationAllowed = await isRegistrationEnabled();
    if (!registrationAllowed) {
      return NextResponse.json(
        { error: "User registration is currently disabled. Please contact an administrator." },
        { status: 403 }
      );
    }

    const body = await request.json()

    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, name, password } = validation.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    // Attribute signup to affiliate if user came from referral link
    const refCode = request.headers.get("x-ref-code") || body.refCode
    if (refCode) {
      try {
        const deviceId = request.headers.get("x-device-id")
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown"

        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/affiliate/attribute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            refCode,
            prospectUserId: user.id,
            deviceId: deviceId || null,
            ip: ip !== "unknown" ? ip : null,
            utm: body.utm || null
          })
        })
      } catch (error) {
        console.error("[Register] Error attributing signup to affiliate:", error)
        // Don't fail registration if affiliate attribution fails
      }
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        user
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}