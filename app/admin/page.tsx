import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminProfileList } from "@/components/admin/admin-profile-list";

export default function AdminPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">인력 관리</h1>
          <p className="text-muted-foreground mt-2">
            등록된 인력을 관리하고 수정할 수 있습니다.
          </p>
        </div>

        <AdminProfileList />
      </div>
    </AdminLayout>
  );
}
