"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, TrendingUp, Briefcase } from "lucide-react";

interface DashboardStatsProps {
  totalCount: number;
  newThisMonth: number;
  trendNew: string;
}

export function DashboardStats({
  totalCount,
  newThisMonth,
  trendNew,
}: DashboardStatsProps) {
  const stats = [
    {
      title: "전체 인력",
      value: String(totalCount),
      description: "등록된 총 인력 수",
      icon: Users,
      trend: "-",
    },
    {
      title: "신규 등록",
      value: String(newThisMonth),
      description: "이번 달 신규 등록",
      icon: UserPlus,
      trend: trendNew,
    },
    {
      title: "활성 프로젝트",
      value: "-",
      description: "진행 중인 프로젝트 (준비 중)",
      icon: Briefcase,
      trend: "-",
    },
    {
      title: "매칭 성공률",
      value: "-",
      description: "AI 추천 매칭 성공률 (준비 중)",
      icon: TrendingUp,
      trend: "-",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              {stat.trend !== "-" && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  {stat.trend} 전월 대비
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
