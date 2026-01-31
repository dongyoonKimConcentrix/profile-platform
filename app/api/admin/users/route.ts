import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerAdminClient } from "@/lib/supabase/server-admin";

/**
 * 관리자 전용: 사용자 계정 생성 (Supabase Auth).
 * 회원가입 페이지 없이 관리자가 이메일/비밀번호로 계정을 생성해 전달합니다.
 */
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

  const adminClient = createServerAdminClient();
  if (!adminClient) {
    return NextResponse.json(
      { success: false, error: "서버 설정(SUPABASE_SERVICE_ROLE_KEY)이 필요합니다." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "이메일과 비밀번호를 입력하세요." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "비밀번호는 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const { data: newUser, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      const msg =
        error.message?.includes("already been registered") ||
        error.message?.toLowerCase().includes("already exists")
          ? "이미 등록된 이메일입니다."
          : error.message || "계정 생성에 실패했습니다.";
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "사용자 계정이 생성되었습니다. 해당 이메일/비밀번호로 로그인할 수 있습니다.",
      user_id: newUser.user?.id,
      email: newUser.user?.email,
    });
  } catch (err) {
    console.error("admin create user error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "계정 생성 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
