"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import Link from "next/link";

const positionRoleLabels: Record<string, string> = {
  기획자: "기획자",
  디자이너: "디자이너",
  퍼블리셔: "퍼블리셔",
  프론트엔드개발자: "프론트엔드 개발자",
  백엔드개발자: "백엔드 개발자",
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString("ko-KR");
}

interface RecentProfile {
  id: string;
  name_ko: string;
  position_role: string | null;
  skills: string[];
  updated_at: string;
  match_score: number;
}

interface RecentUpdatesProps {
  recentProfiles: RecentProfile[];
}

export function RecentUpdates({ recentProfiles }: RecentUpdatesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 업데이트 프로필</CardTitle>
        <CardDescription>
          최근에 업데이트된 인력 프로필을 확인하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">최근 업데이트된 프로필이 없습니다.</p>
          ) : (
          recentProfiles.map((profile) => (
            <Link
              key={profile.id}
              href={`/profile/${profile.id}`}
              className="block p-4 rounded-lg border hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label={`${profile.name_ko} 프로필 보기`}
            >
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback>
                    {profile.name_ko.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold truncate">{profile.name_ko}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {positionRoleLabels[profile.position_role ?? ""] ?? profile.position_role ?? "-"}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(profile.skills ?? []).slice(0, 5).map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    <span>{formatRelativeTime(profile.updated_at)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
