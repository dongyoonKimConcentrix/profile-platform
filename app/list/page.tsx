import { MainLayout } from "@/components/layout/main-layout";
import { ProfileList } from "@/components/profile/profile-list";
import { createClient } from "@/lib/supabase/server";
import { createServerAdminClient } from "@/lib/supabase/server-admin";

export default async function ListPage() {
  const adminClient = createServerAdminClient();
  const supabase = adminClient ?? (await createClient());

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">인력 목록</h1>
          <p className="text-muted-foreground mt-2">
            등록된 모든 인력을 확인하세요.
          </p>
        </div>

        <ProfileList initialProfiles={profiles ?? []} />
      </div>
    </MainLayout>
  );
}
