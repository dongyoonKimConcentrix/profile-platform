"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Profile {
  id: string;
  name_ko: string;
  name_en: string | null;
  email: string;
  phone: string | null;
  job_grade: string | null;
  team: string | null;
  education_school: string | null;
  education: string | null;
  position_role: string | null;
  industry_experience: string[] | null;
  skills: string[];
  career_description: string | null;
  match_score: number;
}

interface ProfileListProps {
  /** 서버에서 조회한 프로필 목록. 전달 시 클라이언트에서 별도 조회하지 않음 (RLS 우회용) */
  initialProfiles?: Profile[];
}

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

const getDomainIcon = (domain: string | null): string => {
  if (!domain) return "🏢";
  const iconMap: Record<string, string> = {
    finance: "🏦",
    ecommerce: "🛒",
    healthcare: "🏥",
    education: "🎓",
    manufacturing: "🏭",
    logistics: "🚚",
  };
  return iconMap[domain] || "🏢";
};

const getDomainBgClass = (domain: string | null): string => {
  if (!domain) return "bg-slate-100";
  const bgMap: Record<string, string> = {
    finance: "bg-amber-100",
    ecommerce: "bg-emerald-100",
    healthcare: "bg-red-100",
    education: "bg-blue-100",
    manufacturing: "bg-gray-100",
    logistics: "bg-indigo-100",
  };
  return bgMap[domain] || "bg-slate-100";
};

export function ProfileList({ initialProfiles }: ProfileListProps = {}) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles ?? []);
  const [loading, setLoading] = useState(initialProfiles === undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");

  useEffect(() => {
    if (initialProfiles !== undefined) {
      setLoading(false);
      return;
    }
    const fetchProfiles = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching profiles:", error);
          if (error.message.includes("row-level security") || error.code === "42501") {
            console.warn("RLS 정책 때문에 데이터를 조회할 수 없습니다. 인증이 필요할 수 있습니다.");
          }
          setLoading(false);
          return;
        }

        if (data) {
          setProfiles(data as Profile[]);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [initialProfiles]);

  const handleSearch = () => {
    setActiveSearchQuery(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const filteredProfiles = profiles.filter((profile) => {
    if (!activeSearchQuery) return true;
    const query = activeSearchQuery.toLowerCase();
    return (
      (profile.name_ko || "").toLowerCase().includes(query) ||
      (profile.name_en || "").toLowerCase().includes(query) ||
      (profile.team || "").toLowerCase().includes(query) ||
      positionRoleLabels[profile.position_role || ""]?.toLowerCase().includes(query) ||
      (profile.skills || []).some((skill) => skill.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">인력 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            placeholder="이름, 직무, 기술로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
            aria-label="인력 검색"
          />
        </div>
        <Button
          type="button"
          onClick={handleSearch}
          aria-label="검색 실행"
          className="px-6"
        >
          <Search className="h-4 w-4 mr-2" aria-hidden="true" />
          검색
        </Button>
      </div>

      {profiles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">등록된 인력이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProfiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <Link
                    href={`/profile/${profile.id}`}
                    className="block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg -m-2 p-2"
                    aria-label={`${profile.name_ko} 프로필 보기`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {(profile.name_ko || "?").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{profile.name_ko}{profile.name_en ? ` (${profile.name_en})` : ""}</h3>
                        <p className="text-sm text-muted-foreground">
                          {positionRoleLabels[profile.position_role || ""] || profile.position_role || "-"}
                        </p>
                        {(profile.job_grade || profile.team) && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {[profile.job_grade, profile.team].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {profile.skills && profile.skills.length > 0 ? (
                        profile.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">기술 스택 없음</span>
                      )}
                    </div>
                    {profile.industry_experience && profile.industry_experience.length > 0 && (
                      <div className="pt-3 border-t">
                        <div className="flex flex-wrap gap-2">
                          {profile.industry_experience.map((ind) => (
                            <span key={ind} className={`inline-flex items-center px-2 py-1 rounded ${getDomainBgClass(ind)} text-xs font-medium`}>
                              {getDomainIcon(ind)} {industryLabels[ind] || ind}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProfiles.length === 0 && profiles.length > 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">검색 결과가 없습니다.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
