import { AdminLayout } from "@/components/admin/admin-layout";
import { ProfileForm } from "@/components/admin/profile-form";

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">인력 수정</h1>
          <p className="text-muted-foreground mt-2">
            인력 정보를 수정하세요.
          </p>
        </div>

        <ProfileForm profileId={id} />
      </div>
    </AdminLayout>
  );
}
