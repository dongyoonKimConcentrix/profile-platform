"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import Link from "next/link";

// 임시 데이터 (나중에 Supabase에서 가져올 예정)
const recentProfiles = [
  {
    id: "1",
    name: "김**",
    position: "프론트엔드 개발자",
    skills: ["React", "TypeScript", "Next.js"],
    updatedAt: "2시간 전",
    matchScore: 92,
  },
  {
    id: "2",
    name: "이**",
    position: "백엔드 개발자",
    skills: ["Node.js", "Python", "PostgreSQL"],
    updatedAt: "5시간 전",
    matchScore: 88,
  },
  {
    id: "3",
    name: "박**",
    position: "풀스택 개발자",
    skills: ["React", "Node.js", "MongoDB"],
    updatedAt: "1일 전",
    matchScore: 85,
  },
  {
    id: "4",
    name: "최**",
    position: "데이터 엔지니어",
    skills: ["Python", "Spark", "Airflow"],
    updatedAt: "2일 전",
    matchScore: 90,
  },
];

export function RecentUpdates() {
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
          {recentProfiles.map((profile) => (
            <Link
              key={profile.id}
              href={`/profile/${profile.id}`}
              className="block p-4 rounded-lg border hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label={`${profile.name} 프로필 보기`}
            >
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback>
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold truncate">{profile.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {profile.position}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {profile.skills.map((skill) => (
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
                    <span>{profile.updatedAt}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
