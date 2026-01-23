import { MainLayout } from "@/components/layout/main-layout";
import { ProfileDetail } from "@/components/profile/profile-detail";

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <MainLayout>
      <ProfileDetail id={id} />
    </MainLayout>
  );
}
