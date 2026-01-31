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
type ProjectCareerRow = Database["public"]["Tables"]["profile_project_careers"]["Row"];

const positionRoleLabels: Record<string, string> = {
  기획자: "기획자",
  디자이너: "디자이너",
  퍼블리셔: "퍼블리셔",
  프론트엔드개발자: "프론트엔드 개발자",
  백엔드개발자: "백엔드 개발자",
};

const industryLabels: Record<string, string> = {
  finance: "금융",
  ecommerce: "이커머스",
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

/** profile_projects → 재직이력 (industry = 회사명만) */
function mapToEmploymentHistory(rows: ProjectRow[]): { id: string; company: string }[] {
  return rows.map((p) => ({
    id: p.id,
    company: p.industry || "",
  }));
}

interface ProfileDetailProps {
  profile: ProfileRow;
  capabilities: CapabilityRow | null;
  projects: ProjectRow[];
  projectCareers: ProjectCareerRow[];
}

export function ProfileDetail({ profile, capabilities, projects, projectCareers }: ProfileDetailProps) {
  const displayName = profile.name_ko + (profile.name_en ? ` (${profile.name_en})` : "");
  const positionLabel = positionRoleLabels[profile.position_role ?? ""] ?? profile.position_role ?? "-";
  const industries = profile.industry_experience ?? [];
  const industryList = Array.isArray(industries) ? industries : [industries];
  const caps = mapCapabilities(capabilities);
  const employmentHistory = mapToEmploymentHistory(projects);
  const projectCareerList = projectCareers.map((p) => ({ id: p.id, project_name: p.project_name }));
  const hasCapabilities = Object.values(caps).some((v) => v > 0);

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
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-muted-foreground">
                    전화번호
                  </span>
                  <span className="font-semibold text-foreground">
                    {profile.phone || "-"}
                  </span>
                  {profile.phone && (
                    <Shield className="h-3 w-3 text-muted-foreground ml-auto" aria-label="마스킹 처리됨" />
                  )}
                </div>
                {(profile.job_grade || profile.team || profile.education) && (
                  <div className="space-y-2 text-sm">
                    {profile.job_grade && (
                      <div>
                        <span className="text-muted-foreground">직급 </span>
                        <span className="font-semibold text-foreground">{profile.job_grade}</span>
                      </div>
                    )}
                    {profile.team && (
                      <div>
                        <span className="text-muted-foreground">소속 </span>
                        <span className="font-semibold text-foreground">{profile.team}</span>
                      </div>
                    )}
                    {(profile.education_school || profile.education) && (
                      <div>
                        <span className="text-muted-foreground">학력 </span>
                        <span className="font-semibold text-foreground">
                          {profile.education_school && profile.education
                            ? `${profile.education_school}(${profile.education})`
                            : profile.education_school || profile.education || "-"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
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
                <p className="text-sm font-medium mb-2">산업군 경험</p>
                <div className="flex flex-wrap gap-2">
                  {industryList.length > 0 ? (
                    industryList.map((d) => (
                      <Badge key={d} variant="outline">
                        {industryLabels[d] ?? d}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">등록된 산업군 없음</span>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">경력 기술서</CardTitle>
              <CardDescription className="text-base">
                재직이력 및 경력 기술서 (프로젝트 경력)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CareerTimeline
                employmentHistory={employmentHistory}
                projectCareers={projectCareerList}
                careerDescription={profile.career_description ?? null}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
