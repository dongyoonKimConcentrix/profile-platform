"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Building2, Car, ShoppingCart, Briefcase } from "lucide-react";
import Link from "next/link";
import { CapabilityRadarChart } from "./capability-radar-chart";

// 임시 데이터
const searchResults = [
  {
    id: "1",
    name: "김**",
    position: "프론트엔드 개발자",
    skills: ["HTML5/CSS3", "TypeScript", "React/Next.js", "Tailwind CSS", "웹 접근성"],
    experience: "5년",
    domain: "금융",
    matchScore: 95,
    matchReason: "이 개발자는 마크업 정밀도가 매우 높으며, 복잡한 디자인 가이드를 코드로 구현하는 능력이 뛰어납니다. 특히 금융권 대규모 고도화 프로젝트 경험을 보유하여 안정적인 결과물 도출이 가능합니다.",
    capabilities: {
      markupPrecision: 95,
      jsTsLogic: 88,
      frameworkProficiency: 92,
      uiUxDesign: 85,
      webOptimization: 90,
      accessibility: 98,
    },
    industryProjects: [
      { industry: "금융", project: "S은행 모바일 뱅킹 고도화 마크업", duration: "24개월", icon: Building2, color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
      { industry: "자동차", project: "H자동차 멤버십 웹 서비스 구축", duration: "12개월", icon: Car, color: "bg-red-100 text-red-700 border-red-300" },
      { industry: "이커머스", project: "L사 쇼핑몰 통합 검색 결과 UI 개발", duration: "8개월", icon: ShoppingCart, color: "bg-green-100 text-green-700 border-green-300" },
    ],
  },
  {
    id: "2",
    name: "이**",
    position: "풀스택 개발자",
    skills: ["React", "Node.js", "PostgreSQL", "AWS"],
    experience: "7년",
    domain: "금융",
    matchScore: 88,
    matchReason: "금융권 프로젝트 2건, 풀스택 경험 풍부, 인프라 구축 경험",
    capabilities: {
      markupPrecision: 75,
      jsTsLogic: 92,
      frameworkProficiency: 90,
      uiUxDesign: 80,
      webOptimization: 88,
      accessibility: 82,
    },
    industryProjects: [
      { industry: "금융", project: "하나은행 시스템", duration: "18개월", icon: Building2, color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
      { industry: "금융", project: "카카오뱅크 API", duration: "12개월", icon: Building2, color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    ],
  },
  {
    id: "3",
    name: "박**",
    position: "프론트엔드 개발자",
    skills: ["React", "Vue.js", "JavaScript"],
    experience: "3년",
    domain: "전자상거래",
    matchScore: 75,
    matchReason: "React 경험 보유, 금융 도메인 경험은 제한적",
    capabilities: {
      markupPrecision: 80,
      jsTsLogic: 85,
      frameworkProficiency: 88,
      uiUxDesign: 82,
      webOptimization: 75,
      accessibility: 78,
    },
    industryProjects: [
      { industry: "이커머스", project: "쿠팡 마켓플레이스", duration: "10개월", icon: ShoppingCart, color: "bg-green-100 text-green-700 border-green-300" },
    ],
  },
  {
    id: "4",
    name: "최**",
    position: "백엔드 개발자",
    skills: ["Java", "Spring Boot", "Oracle"],
    experience: "6년",
    domain: "금융",
    matchScore: 82,
    matchReason: "금융권 백엔드 경험 풍부, 프론트엔드 경험은 제한적",
    capabilities: {
      markupPrecision: 60,
      jsTsLogic: 90,
      frameworkProficiency: 85,
      uiUxDesign: 65,
      webOptimization: 80,
      accessibility: 70,
    },
    industryProjects: [
      { industry: "금융", project: "NH농협은행 시스템", duration: "20개월", icon: Building2, color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    ],
  },
];

export function SearchResults() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">검색 결과</h2>
        <span className="text-sm text-muted-foreground">
          총 {searchResults.length}명
        </span>
      </div>

      <div className="space-y-6">
        {searchResults.map((result) => (
          <Card key={result.id} className="hover:shadow-lg transition-all border border-slate-100">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 좌측: 레이더 차트 영역 */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex items-center justify-center">
                  <div className="w-full">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-12 w-12 border border-slate-200">
                        <AvatarFallback className="text-base bg-indigo-100 text-indigo-700">
                          {result.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">
                              {result.name}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {result.position} · {result.experience}
                            </p>
                          </div>
                          <Badge
                            variant="default"
                            className="text-sm px-2 py-1 bg-indigo-600 text-white"
                          >
                            <TrendingUp className="h-3 w-3 mr-1" aria-hidden="true" />
                            {result.matchScore}점
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-3 text-slate-700">퍼블리셔/FE 상세 역량</h4>
                      <CapabilityRadarChart capabilities={result.capabilities} />
                    </div>
                  </div>
                </div>

                {/* 우측: 역량 상세 텍스트 영역 */}
                <div className="space-y-6">
                  {/* AI 코멘트 */}
                  <Card className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
                    <CardContent className="p-0">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2" aria-hidden="true">🤖</span>
                        <h4 className="font-bold text-indigo-900">AI 추천 코멘트</h4>
                      </div>
                      <p className="text-sm text-indigo-800 italic leading-relaxed">
                        "{result.matchReason}"
                      </p>
                    </CardContent>
                  </Card>

                  {/* 기술 키워드 */}
                  <Card className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <CardContent className="p-0">
                      <h4 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">검증된 기술 키워드</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.skills.map((skill, index) => {
                          let badgeClass = "px-3 py-1 rounded-full text-xs";
                          if (index === 0) {
                            badgeClass += " bg-indigo-100 text-indigo-700 font-semibold";
                          } else if (index === 2) {
                            badgeClass += " bg-blue-100 text-blue-700 font-semibold";
                          } else {
                            badgeClass += " bg-slate-100 text-slate-700";
                          }
                          return (
                            <span key={skill} className={badgeClass}>
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 프로젝트 수행 이력 */}
                  <Card className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <CardContent className="p-0">
                      <h4 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">산업군별 수행 프로젝트</h4>
                      <div className="space-y-3">
                        {result.industryProjects.map((project, index) => {
                          const isLast = index === result.industryProjects.length - 1;
                          const iconEmoji = project.industry === "금융" ? "🏦" : project.industry === "자동차" ? "🚗" : "🛒";
                          const iconBgClass = project.industry === "금융" 
                            ? "bg-amber-100" 
                            : project.industry === "자동차"
                            ? "bg-blue-100"
                            : "bg-emerald-100";
                          const durationBgClass = project.industry === "금융"
                            ? "bg-amber-50 text-amber-600"
                            : project.industry === "자동차"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-emerald-50 text-emerald-600";
                          const industryLabel = project.industry === "금융" 
                            ? "금융 (Banking)"
                            : project.industry === "자동차"
                            ? "자동차 (Automotive)"
                            : "이커머스 (E-commerce)";
                          
                          return (
                            <div key={index} className={!isLast ? "border-b border-slate-50 pb-3" : ""}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <span className={`w-8 h-8 flex items-center justify-center ${iconBgClass} rounded-lg text-lg mr-3`} aria-hidden="true">
                                    {iconEmoji}
                                  </span>
                                  <div>
                                    <p className="text-sm font-bold text-slate-800">{industryLabel}</p>
                                    <p className="text-xs text-slate-500">{project.project}</p>
                                  </div>
                                </div>
                                <span className={`text-xs font-semibold ${durationBgClass} px-2 py-1 rounded`}>
                                  {project.duration}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Link href={`/profile/${result.id}`}>
                      <Briefcase className="h-4 w-4 mr-2" aria-hidden="true" />
                      상세 보기
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
