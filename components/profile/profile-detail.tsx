"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Mail, Phone, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { CapabilityChart } from "./capability-chart";
import { CareerTimeline } from "./career-timeline";

// 임시 데이터 (나중에 Supabase에서 가져올 예정)
const profileData = {
  id: "1",
  name: "김**",
  maskedName: "김**",
  position: "프론트엔드 개발자",
  email: "kim***@example.com",
  phone: "010-****-****",
  location: "서울",
  experience: "5년",
  domain: "금융",
  matchScore: 95,
  skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Zustand"],
  capabilities: {
    frontend: 95,
    backend: 60,
    mobile: 40,
    devops: 50,
    database: 55,
    testing: 75,
  },
  career: [
    {
      id: "1",
      company: "A금융그룹",
      position: "시니어 프론트엔드 개발자",
      period: "2022.03 - 현재",
      description: "KB카드 모바일 앱 개발 및 유지보수, React Native 기반 하이브리드 앱 개발",
      technologies: ["React Native", "TypeScript", "Redux"],
    },
    {
      id: "2",
      company: "B은행",
      position: "프론트엔드 개발자",
      period: "2020.01 - 2022.02",
      description: "신한은행 웹뱅킹 시스템 개발, React 기반 SPA 구축",
      technologies: ["React", "TypeScript", "Next.js"],
    },
    {
      id: "3",
      company: "C스타트업",
      position: "주니어 프론트엔드 개발자",
      period: "2019.01 - 2019.12",
      description: "전자상거래 플랫폼 프론트엔드 개발",
      technologies: ["React", "JavaScript", "CSS"],
    },
  ],
  projects: [
    {
      id: "1",
      name: "KB카드 모바일 앱",
      role: "리드 개발자",
      period: "2022.03 - 2023.12",
      description: "React Native 기반 모바일 앱 개발, 사용자 100만+ 달성",
      technologies: ["React Native", "TypeScript", "Redux"],
    },
    {
      id: "2",
      name: "신한은행 웹뱅킹",
      role: "프론트엔드 개발자",
      period: "2020.06 - 2022.02",
      description: "Next.js 기반 웹뱅킹 시스템 구축, 성능 최적화",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    },
  ],
};

export function ProfileDetail({ id }: { id: string }) {
  const [profile] = useState(profileData);

  // 나중에 Supabase에서 id를 사용하여 데이터 가져오기
  // useEffect(() => {
  //   fetchProfile(id).then(setProfile);
  // }, [id]);

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
        {/* 좌측: 기본 정보 */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl">
                    {profile.maskedName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl">{profile.maskedName}</CardTitle>
                  <CardDescription className="mt-1">
                    {profile.position}
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
                    {profile.phone}
                  </span>
                  <Shield className="h-3 w-3 text-muted-foreground ml-auto" aria-label="마스킹 처리됨" />
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span>경력 {profile.experience}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">기술 스택</p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">도메인 경험</p>
                <Badge variant="outline">{profile.domain}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI 역량 분석</CardTitle>
              <CardDescription>
                AI가 분석한 기술 역량 그래프
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CapabilityChart capabilities={profile.capabilities} />
            </CardContent>
          </Card>
        </div>

        {/* 우측: 경력 상세 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>경력 기술서</CardTitle>
              <CardDescription>
                상세한 경력 및 프로젝트 이력
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CareerTimeline career={profile.career} projects={profile.projects} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
