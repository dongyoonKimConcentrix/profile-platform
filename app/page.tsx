import { MainLayout } from "@/components/layout/main-layout";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentUpdates } from "@/components/dashboard/recent-updates";
import { ProjectMatchingSummary } from "@/components/dashboard/project-matching-summary";
import { createClient } from "@/lib/supabase/server";
import { createServerAdminClient } from "@/lib/supabase/server-admin";

const DOMAIN_LABELS: Record<string, string> = {
  finance: "금융",
  ecommerce: "전자상거래",
  healthcare: "의료",
  education: "교육",
  manufacturing: "제조",
  logistics: "물류",
};

export default async function Home() {
  const adminClient = createServerAdminClient();
  const supabase = adminClient ?? (await createClient());

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: totalCount },
    { count: newThisMonth },
    { data: recentProfiles },
    { data: allProfiles },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfMonth),
    supabase
      .from("profiles")
      .select("id, name, position, skills, updated_at, match_score")
      .order("updated_at", { ascending: false })
      .limit(4),
    supabase.from("profiles").select("domain"),
  ]);

  const domainStats: { domain: string; label: string; count: number }[] = [];
  const domainCounts: Record<string, number> = {};
  if (allProfiles) {
    for (const row of allProfiles as { domain?: string[] | null }[]) {
      const domains = row.domain ?? [];
      const list = Array.isArray(domains) ? domains : [domains];
      for (const d of list) {
        domainCounts[d] = (domainCounts[d] ?? 0) + 1;
      }
    }
    for (const [domain, count] of Object.entries(domainCounts)) {
      domainStats.push({ domain, label: DOMAIN_LABELS[domain] ?? domain, count });
    }
    domainStats.sort((a, b) => b.count - a.count);
  }

  const total = totalCount ?? 0;
  const newCount = newThisMonth ?? 0;
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const { count: prevMonthCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gte("created_at", prevMonthStart)
    .lt("created_at", startOfMonth);
  const prevNew = prevMonthCount ?? 0;
  const trendNew = prevNew > 0 ? `+${Math.round(((newCount - prevNew) / prevNew) * 100)}%` : (newCount > 0 ? "+100%" : "-");

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
          <p className="text-muted-foreground mt-2">
            전체 인력 현황과 프로젝트 매칭 정보를 한눈에 확인하세요.
          </p>
        </div>

        <DashboardStats
          totalCount={total}
          newThisMonth={newCount}
          trendNew={trendNew}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <RecentUpdates recentProfiles={recentProfiles ?? []} />
          <ProjectMatchingSummary domainStats={domainStats} />
        </div>
      </div>
    </MainLayout>
  );
}
