"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Profile {
  id: string;
  name: string;
  email: string;
  position: string;
  experience: string;
  domain: string | string[] | null;
  skills: string[];
  match_score: number;
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

export function AdminProfileList() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching profiles:", error);
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
  }, []);

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
      profile.name.toLowerCase().includes(query) ||
      positionLabels[profile.position]?.toLowerCase().includes(query) ||
      profile.skills.some((skill) => skill.toLowerCase().includes(query))
    );
  });

  const handleDelete = (id: string) => {
    setProfileToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!profileToDelete) return;

    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", profileToDelete);

      if (error) {
        console.error("Delete error:", error);
        alert("삭제 중 오류가 발생했습니다: " + error.message);
        setDeleting(false);
        return;
      }

      // 목록에서 제거
      setProfiles(profiles.filter((p) => p.id !== profileToDelete));
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
      router.refresh();
    } catch (err) {
      console.error("Error:", err);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              placeholder="이름, 직무, 기술로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 w-full"
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
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/profiles/new">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            인력 등록
          </Link>
        </Button>
      </div>

      {profiles.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">등록된 인력이 없습니다.</p>
          <Button asChild>
            <Link href="/admin/profiles/new">
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              첫 인력 등록하기
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProfiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {profile.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{profile.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {positionLabels[profile.position] || profile.position}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        경력 {experienceLabels[profile.experience] || profile.experience}
                      </p>
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
                  {profile.domain && (() => {
                    const domains = Array.isArray(profile.domain) ? profile.domain : [profile.domain];
                    return (
                      <div className="pt-3 border-t mb-4">
                        <div className="flex flex-wrap gap-2">
                          {domains.map((domain) => (
                            <div key={domain} className="flex items-center">
                              <span
                                className={`w-8 h-8 flex items-center justify-center ${getDomainBgClass(domain)} rounded-lg text-lg mr-2`}
                                aria-hidden="true"
                              >
                                {getDomainIcon(domain)}
                              </span>
                              <p className="text-sm font-bold text-slate-800">
                                {domainLabels[domain] || domain}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Link href={`/admin/profiles/${profile.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" aria-hidden="true" />
                        수정
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(profile.id)}
                      aria-label={`${profile.name} 삭제`}
                    >
                      <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
                      삭제
                    </Button>
                  </div>
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>인력 삭제 확인</DialogTitle>
            <DialogDescription>
              정말로 이 인력을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setProfileToDelete(null);
              }}
              disabled={deleting}
            >
              취소
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                  삭제 중...
                </>
              ) : (
                "삭제"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
