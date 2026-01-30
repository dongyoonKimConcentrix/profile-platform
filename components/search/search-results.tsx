"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Briefcase, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  position: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'data' | 'devops';
  experience: 'junior' | 'mid' | 'senior' | 'expert';
  domain: ('finance' | 'ecommerce' | 'healthcare' | 'education' | 'manufacturing' | 'logistics')[] | null;
  skills: string[];
  description: string | null;
  match_score: number;
}

interface SearchResultsProps {
  results: Profile[];
  loading: boolean;
  error: string | null;
}

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

export function SearchResults({ results, loading, error }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
        <span className="ml-3 text-muted-foreground">검색 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">검색 결과</h2>
          <span className="text-sm text-muted-foreground">검색 결과가 없습니다</span>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">검색 조건에 맞는 프로필을 찾을 수 없습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">검색 결과</h2>
        <span className="text-sm text-muted-foreground">
          총 {results.length}명
        </span>
      </div>

      <div className="space-y-6">
        {results.map((result) => (
          <Card key={result.id} className="hover:shadow-lg transition-all border border-slate-100">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 좌측: 기본 정보 */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                  <div className="flex items-start gap-4 mb-6">
                    <Avatar className="h-16 w-16 border border-slate-200">
                      <AvatarFallback className="text-lg bg-indigo-100 text-indigo-700">
                        {result.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800 mb-1">
                            {result.name}
                          </h3>
                          <p className="text-sm text-slate-600 mb-2">
                            {positionLabels[result.position] || result.position} · {experienceLabels[result.experience] || result.experience}
                          </p>
                          {result.email && (
                            <p className="text-xs text-slate-500">{result.email}</p>
                          )}
                        </div>
                        {result.match_score > 0 && (
                          <Badge
                            variant="default"
                            className="text-sm px-3 py-1 bg-indigo-600 text-white"
                          >
                            <TrendingUp className="h-3 w-3 mr-1" aria-hidden="true" />
                            {result.match_score}점
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* 도메인 경험 */}
                  {result.domain && result.domain.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">도메인 경험</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.domain.map((d) => (
                          <Badge key={d} variant="outline" className="text-xs">
                            {domainLabels[d] || d}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 우측: 상세 정보 */}
                <div className="space-y-6">
                  {/* 설명 */}
                  {result.description && (
                    <Card className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
                      <CardContent className="p-0">
                        <h4 className="font-bold text-indigo-900 mb-2">프로필 설명</h4>
                        <p className="text-sm text-indigo-800 leading-relaxed">
                          {result.description}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* 기술 스택 */}
                  {result.skills && result.skills.length > 0 && (
                    <Card className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <CardContent className="p-0">
                        <h4 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">기술 스택</h4>
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
                  )}

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
