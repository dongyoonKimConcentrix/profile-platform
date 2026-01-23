"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, TrendingUp, Briefcase } from "lucide-react";

const stats = [
  {
    title: "전체 인력",
    value: "156",
    description: "등록된 총 인력 수",
    icon: Users,
    trend: "+12%",
  },
  {
    title: "신규 등록",
    value: "8",
    description: "이번 달 신규 등록",
    icon: UserPlus,
    trend: "+3",
  },
  {
    title: "활성 프로젝트",
    value: "24",
    description: "진행 중인 프로젝트",
    icon: Briefcase,
    trend: "+5",
  },
  {
    title: "매칭 성공률",
    value: "87%",
    description: "AI 추천 매칭 성공률",
    icon: TrendingUp,
    trend: "+2%",
  },
];

export function DashboardStats() {
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
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                {stat.trend} 전월 대비
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
