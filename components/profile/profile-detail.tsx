"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Mail, Phone, Calendar } from "lucide-react";
import Link from "next/link";
import { CapabilityChart } from "./capability-chart";
import { CareerTimeline } from "./career-timeline";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type CapabilityRow = Database["public"]["Tables"]["profile_capabilities"]["Row"];
type ProjectRow = Database["public"]["Tables"]["profile_projects"]["Row"];

const positionLabels: Record<string, string> = {
  frontend: "프론트엔드 개발자",
  backend: "백엔드 개발자",
  fullstack: "풀스택 개발자",
  mobile: "모바일 개발자",
  data: "데이터 엔지니어",
  devops: "DevOps 엔지니어",
};

const experienceLabels: Record<string, string> = {
  junior: "1-3년",
  mid: "3-5년",
  senior: "5-7년",
  expert: "7년 이상",
};

const domainLabels: Record<string, string> = {
  finance: "금융",
  ecommerce: "전자상거래",
  healthcare: "의료",
  education: "교육",
  manufacturing: "제조",
  logistics: "물류",
};

function mapCapabilities(cap: CapabilityRow | null): {
  frontend: number;
  backend: number;
  mobile: number;
  devops: number;
  database: number;
  testing: number;
} {
  if (!cap) {
    return { frontend: 0, backend: 0, mobile: 0, devops: 0, database: 0, testing: 0 };
  }
  return {
    frontend: cap.markup_precision ?? 0,
    backend: cap.js_ts_logic ?? 0,
    mobile: cap.framework_proficiency ?? 0,
    devops: cap.web_optimization ?? 0,
    database: cap.ui_ux_design ?? 0,
    testing: cap.accessibility ?? 0,
  };
}

function mapProjects(rows: ProjectRow[]): {
  id: string;
  name: string;
  role: string;
  period: string;
  description: string;
  technologies: string[];
}[] {
  return rows.map((p) => ({
    id: p.id,
    name: p.project_name,
    role: p.industry,
    period: p.duration,
    description: "",
    technologies: [],
  }));
}

interface ProfileDetailProps {
  profile: ProfileRow;
  capabilities: CapabilityRow | null;
  projects: ProjectRow[];
}

export function ProfileDetail({ profile, capabilities, projects }: ProfileDetailProps) {
  const displayName = profile.name;
  const positionLabel = positionLabels[profile.position] ?? profile.position;
  const experienceLabel = experienceLabels[profile.experience] ?? profile.experience;
  const domains = profile.domain ?? [];
  const domainList = Array.isArray(domains) ? domains : [domains];
  const caps = mapCapabilities(capabilities);
  const career: { id: string; company: string; position: string; period: string; description: string; technologies: string[] }[] = [];
  const projectItems = mapProjects(projects);
  const hasCapabilities = Object.values(caps).some((v) => v > 0);
  const hasCareerOrProjects = career.length > 0 || projectItems.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" aria-label="뒤로 가기">
          <Link href="/list">
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">인력 상세</h1>
          <p className="text-muted-foreground mt-2">
            상세 경력 정보와 AI 분석 결과를 확인하세요.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl">
                    {displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl">{displayName}</CardTitle>
                  <CardDescription className="mt-1">
                    {positionLabel}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-muted-foreground">
                    {profile.email}
                  </span>
                  <Shield className="h-3 w-3 text-muted-foreground ml-auto" aria-label="마스킹 처리됨" />
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-muted-foreground">
                      {profile.phone}
                    </span>
                    <Shield className="h-3 w-3 text-muted-foreground ml-auto" aria-label="마스킹 처리됨" />
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span>경력 {experienceLabel}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">기술 스택</p>
                <div className="flex flex-wrap gap-2">
                  {(profile.skills ?? []).length > 0 ? (
                    profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">등록된 기술 없음</span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">도메인 경험</p>
                <div className="flex flex-wrap gap-2">
                  {domainList.length > 0 ? (
                    domainList.map((d) => (
                      <Badge key={d} variant="outline">
                        {domainLabels[d] ?? d}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">등록된 도메인 없음</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {hasCapabilities && (
            <Card>
              <CardHeader>
                <CardTitle>AI 역량 분석</CardTitle>
                <CardDescription>
                  AI가 분석한 기술 역량 그래프
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CapabilityChart capabilities={caps} />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {hasCareerOrProjects ? (
            <Card>
              <CardHeader>
                <CardTitle>경력 기술서</CardTitle>
                <CardDescription>
                  상세한 경력 및 프로젝트 이력
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CareerTimeline career={career} projects={projectItems} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>경력 기술서</CardTitle>
                <CardDescription>
                  상세한 경력 및 프로젝트 이력
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground py-4">
                  등록된 경력·프로젝트 이력이 없습니다.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
