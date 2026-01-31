import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
  "text/plain",
];

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (!adminRow || (adminRow.role !== "admin" && adminRow.role !== "super_admin")) {
    return NextResponse.json(
      { success: false, error: "관리자만 사용할 수 있습니다." },
      { status: 403 }
    );
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { success: false, error: "N8N 워크플로우 URL이 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return NextResponse.json(
        { success: false, error: "업로드할 파일이 없습니다." },
        { status: 400 }
      );
    }

    const type = file.type || "";
    const allowed =
      ALLOWED_TYPES.some((t) => type.includes(t)) ||
      /\.(pdf|docx?|pptx?|txt)$/i.test(file.name);
    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error:
            "지원 형식이 아닙니다. PDF, DOC/DOCX, PPT/PPTX, TXT만 업로드 가능합니다.",
        },
        { status: 400 }
      );
    }

    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    const n8nForm = new FormData();
    n8nForm.append("file", blob, file.name);

    const res = await fetch(webhookUrl, {
      method: "POST",
      body: n8nForm,
      headers: {
        // Content-Type은 FormData가 자동 설정
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        {
          success: false,
          error: `n8n 워크플로우 오류: ${res.status} ${text.slice(0, 200)}`,
        },
        { status: 502 }
      );
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json({
      success: true,
      message: "파일이 n8n 워크플로우로 전송되었습니다.",
      ...data,
    });
  } catch (err) {
    console.error("n8n upload error:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error ? err.message : "파일 전송 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
