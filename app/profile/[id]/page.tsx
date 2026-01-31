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
    { data: capabilities, error: capabilitiesError },
    { data: projects, error: projectsError },
    { data: projectCareers, error: projectCareersError },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase.from("profile_capabilities").select("*").eq("profile_id", id).maybeSingle(),
    supabase.from("profile_projects").select("*").eq("profile_id", id).order("created_at", { ascending: false }),
    supabase.from("profile_project_careers").select("*").eq("profile_id", id).order("created_at", { ascending: false }),
  ]);

  if (profileError || !profile) {
    notFound();
  }
  if (projectsError) {
    console.error("[profile] profile_projects 조회 실패:", projectsError);
  }
  if (projectCareersError) {
    console.error("[profile] profile_project_careers 조회 실패:", projectCareersError);
  }

  return (
    <MainLayout>
      <ProfileDetail
        profile={profile}
        capabilities={capabilities ?? null}
        projects={projects ?? []}
        projectCareers={projectCareers ?? []}
      />
    </MainLayout>
  );
}
