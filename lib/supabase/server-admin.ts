import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * 서버 전용 Supabase 클라이언트 (Service Role).
 * RLS를 우회하여 비로그인 사용자 화면에서도 프로필을 조회할 수 있게 합니다.
 * 절대 클라이언트 번들에 포함되거나 브라우저에서 호출하면 안 됩니다.
 */
export function createServerAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
  }

  if (serviceRoleKey) {
    return createClient<Database>(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return null;
}
