import { AdminLayout } from "@/components/admin/admin-layout";
import { ProfileForm } from "@/components/admin/profile-form";

export default function NewProfilePage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">인력 등록</h1>
          <p className="text-muted-foreground mt-2">
            새로운 인력을 등록하세요.
          </p>
        </div>

        <ProfileForm />
      </div>
    </AdminLayout>
  );
}
