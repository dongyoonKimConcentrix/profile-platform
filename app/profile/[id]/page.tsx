import { MainLayout } from "@/components/layout/main-layout";
import { ProfileDetail } from "@/components/profile/profile-detail";
import { createClient } from "@/lib/supabase/server";
import { createServerAdminClient } from "@/lib/supabase/server-admin";
import { notFound } from "next/navigation";

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const adminClient = createServerAdminClient();
  const supabase = adminClient ?? (await createClient());

  const [
    { data: profile, error: profileError },
    { data: capabilities },
    { data: projects },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase.from("profile_capabilities").select("*").eq("profile_id", id).maybeSingle(),
    supabase.from("profile_projects").select("*").eq("profile_id", id).order("created_at", { ascending: false }),
  ]);

  if (profileError || !profile) {
    notFound();
  }

  return (
    <MainLayout>
      <ProfileDetail
        profile={profile}
        capabilities={capabilities ?? null}
        projects={projects ?? []}
      />
    </MainLayout>
  );
}
