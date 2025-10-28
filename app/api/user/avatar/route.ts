import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

/**
 * GET /api/user/avatar
 * Get current user's avatar URL
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { avatarUrl: true },
    });

    return NextResponse.json({
      avatarUrl: userData?.avatarUrl || null,
    });
  } catch (error) {
    console.error("Avatar fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch avatar" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/avatar
 * Upload new avatar (FormData with 'file' field)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only image files (JPEG, PNG, WebP, GIF) are allowed" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = ALLOWED_EXTENSIONS.find((ext) =>
      file.name.toLowerCase().endsWith(ext)
    ) || ".jpg";
    const fileName = `avatars/${user.id}/${timestamp}${fileExt}`;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true, // Overwrite if exists
      });

    if (uploadError) {
      console.error("Supabase storage error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName);

    // Update user's avatarUrl in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: publicUrl },
      select: { avatarUrl: true, id: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Avatar uploaded successfully",
        avatarUrl: updatedUser.avatarUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/avatar
 * Delete user's avatar
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { avatarUrl: true },
    });

    if (!userData?.avatarUrl) {
      return NextResponse.json(
        { error: "No avatar to delete" },
        { status: 400 }
      );
    }

    // Extract file path from public URL
    // Format: https://xxx.supabase.co/storage/v1/object/public/avatars/path/to/file
    const urlParts = userData.avatarUrl.split("/storage/v1/object/public/");
    if (urlParts.length < 2) {
      return NextResponse.json(
        { error: "Invalid avatar URL format" },
        { status: 400 }
      );
    }

    const filePath = urlParts[1];

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from("avatars")
      .remove([filePath]);

    if (deleteError) {
      console.error("Supabase delete error:", deleteError);
      // Continue even if file deletion fails
    }

    // Clear avatar URL from database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: null },
      select: { id: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Avatar deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Avatar delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete avatar" },
      { status: 500 }
    );
  }
}
