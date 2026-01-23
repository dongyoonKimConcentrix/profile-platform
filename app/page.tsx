import { MainLayout } from "@/components/layout/main-layout";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentUpdates } from "@/components/dashboard/recent-updates";
import { ProjectMatchingSummary } from "@/components/dashboard/project-matching-summary";

export default function Home() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
          <p className="text-muted-foreground mt-2">
            전체 인력 현황과 프로젝트 매칭 정보를 한눈에 확인하세요.
          </p>
        </div>

        <DashboardStats />

        <div className="grid gap-6 md:grid-cols-2">
          <RecentUpdates />
          <ProjectMatchingSummary />
        </div>
      </div>
    </MainLayout>
  );
}
