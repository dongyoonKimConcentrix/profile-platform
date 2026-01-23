"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Briefcase, Users, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// 임시 데이터
const matchingProjects = [
  {
    id: "1",
    name: "금융권 모바일 앱 개발",
    requiredSkills: ["React Native", "TypeScript", "금융 도메인"],
    matchedCandidates: 12,
    matchRate: 85,
    status: "진행중",
  },
  {
    id: "2",
    name: "전자상거래 플랫폼 구축",
    requiredSkills: ["Next.js", "Node.js", "PostgreSQL"],
    matchedCandidates: 8,
    matchRate: 78,
    status: "진행중",
  },
  {
    id: "3",
    name: "데이터 분석 플랫폼",
    requiredSkills: ["Python", "Spark", "ML"],
    matchedCandidates: 5,
    matchRate: 72,
    status: "계획중",
  },
];

export function ProjectMatchingSummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>프로젝트 매칭 요약</CardTitle>
        <CardDescription>
          현재 진행 중인 프로젝트와 매칭된 인력을 확인하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {matchingProjects.map((project) => (
            <div
              key={project.id}
              className="p-4 rounded-lg border space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    <h3 className="font-semibold truncate">{project.name}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" aria-hidden="true" />
                      {project.matchedCandidates}명 매칭
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" aria-hidden="true" />
                      {project.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-2 py-1 bg-secondary rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">매칭률</span>
                  <span className="font-medium">{project.matchRate}%</span>
                </div>
                <Progress value={project.matchRate} className="h-2" />
              </div>
            </div>
          ))}
          <Button asChild variant="outline" className="w-full">
            <Link href="/search">전체 프로젝트 보기</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
