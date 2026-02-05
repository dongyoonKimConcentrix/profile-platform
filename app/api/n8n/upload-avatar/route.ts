import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient } from "@/lib/supabase/server-admin";

const BUCKET = "avatars";
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.N8N_AVATAR_UPLOAD_SECRET;
    if (secret) {
      const headerSecret = request.headers.get("x-n8n-avatar-secret");
      if (headerSecret !== secret) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const supabase = createServerAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Server configuration error (Supabase not configured)" },
        { status: 500 }
      );
    }

    const body = await request.json();
    let imageBase64 = body?.image;
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing image (base64)" },
        { status: 400 }
      );
    }
    // data URL인 경우 순수 base64만 추출 (예: data:image/jpeg;base64,/9j/4A...)
    if (imageBase64.startsWith("data:")) {
      const match = imageBase64.match(/^data:image\/\w+;base64,(.+)$/s);
      imageBase64 = match ? match[1].trim() : imageBase64;
    }

    const buf = Buffer.from(imageBase64, "base64");
    if (buf.length > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "Image too large (max 5MB)" },
        { status: 400 }
      );
    }

    const mimeType = (body?.mimeType as string) || "image/png";
    const ext = mimeType === "image/jpeg" ? "jpg" : mimeType.split("/")[1] || "png";
    const fileName = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, buf, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
    });
  } catch (err) {
    console.error("upload-avatar error:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
