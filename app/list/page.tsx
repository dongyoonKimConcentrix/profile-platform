import { MainLayout } from "@/components/layout/main-layout";
import { ProfileList } from "@/components/profile/profile-list";

export default function ListPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">인력 목록</h1>
          <p className="text-muted-foreground mt-2">
            등록된 모든 인력을 확인하세요.
          </p>
        </div>

        <ProfileList />
      </div>
    </MainLayout>
  );
}
