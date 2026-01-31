/**
 * 사용자 화면 테스트 계정 1개 생성 (Supabase Auth).
 * 사용: npx tsx scripts/create-test-user.ts
 * .env.local 또는 .env에 NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 필요.
 */
import { config } from "dotenv";

config();
config({ path: ".env.local", override: true });
import { createClient } from "@supabase/supabase-js";

const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "test1234!";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 를 .env.local 에 설정하세요.");
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });

  if (error) {
    if (error.message?.includes("already") || error.message?.toLowerCase().includes("already been registered")) {
      console.log("이미 존재하는 계정입니다. 아래 계정으로 /login 에서 로그인하세요.");
    } else {
      console.error("생성 실패:", error.message);
      process.exit(1);
    }
  } else {
    console.log("테스트 계정이 생성되었습니다.");
  }

  console.log("  이메일:", TEST_EMAIL);
  console.log("  비밀번호:", TEST_PASSWORD);
  console.log("  로그인: /login 에서 위 계정으로 로그인하세요.");
}

main();
