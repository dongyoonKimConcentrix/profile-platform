"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Briefcase, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DomainStat {
  domain: string;
  label: string;
  count: number;
}

interface ProjectMatchingSummaryProps {
  domainStats: DomainStat[];
}

export function ProjectMatchingSummary({ domainStats }: ProjectMatchingSummaryProps) {
  const total = domainStats.reduce((sum, d) => sum + d.count, 0);
  const maxCount = Math.max(...domainStats.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>도메인별 인력 현황</CardTitle>
        <CardDescription>
          도메인별 등록 인력 수를 확인하고 검색에서 필터할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {domainStats.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">등록된 도메인 데이터가 없습니다.</p>
          ) : (
            domainStats.map((item) => (
              <div
                key={item.domain}
                className="p-4 rounded-lg border space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                      <h3 className="font-semibold truncate">{item.label}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" aria-hidden="true" />
                        {item.count}명
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">비율</span>
                    <span className="font-medium">{total > 0 ? Math.round((item.count / total) * 100) : 0}%</span>
                  </div>
                  <Progress value={total > 0 ? (item.count / maxCount) * 100 : 0} className="h-2" />
                </div>
              </div>
            ))
          )}
          <Button asChild variant="outline" className="w-full">
            <Link href="/search">검색 / 필터로 인력 찾기</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
