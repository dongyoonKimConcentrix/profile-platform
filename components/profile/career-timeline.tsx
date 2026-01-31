"use client";

import { Briefcase, FileText, FolderKanban } from "lucide-react";

/** 재직이력 1건 (industry = 회사명만) */
export interface EmploymentItem {
  id: string;
  company: string;
}

/** 프로젝트 경력 1건 */
export interface ProjectCareerItem {
  id: string;
  project_name: string;
}

interface CareerTimelineProps {
  /** 재직이력 (profile_projects, industry만) */
  employmentHistory: EmploymentItem[];
  /** 프로젝트 경력 (profile_project_careers) */
  projectCareers: ProjectCareerItem[];
  /** 경력 기술서 (Project Experience 텍스트 그대로, 리스트 형식 표시) */
  careerDescription: string | null;
}

export function CareerTimeline({ employmentHistory, projectCareers, careerDescription }: CareerTimelineProps) {
  const careerLines = careerDescription
    ? careerDescription.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-8">
      {/* 재직이력 (회사명만) */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5" aria-hidden="true" />
          재직이력
        </h3>
        <div className="space-y-2">
          {employmentHistory.length === 0 ? (
            <p className="text-base text-muted-foreground py-2">등록된 재직이력이 없습니다.</p>
          ) : (
            <ul className="list-disc list-outside pl-5 space-y-1 text-base">
              {employmentHistory.map((item) => (
                <li key={item.id} className="font-medium">
                  {item.company}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 프로젝트 경력 */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FolderKanban className="h-5 w-5" aria-hidden="true" />
          프로젝트 경력
        </h3>
        <div className="space-y-2">
          {projectCareers.length === 0 ? (
            <p className="text-base text-muted-foreground py-2">등록된 프로젝트 경력이 없습니다.</p>
          ) : (
            <ul className="list-disc list-outside pl-5 space-y-1 text-base">
              {projectCareers.map((item) => (
                <li key={item.id}>{item.project_name}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 경력 기술서 (프로젝트 경력 텍스트 그대로, 리스트 형식) */}
      <div style={{ display: "none" }}>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" aria-hidden="true" />
          경력 기술서
        </h3>
        <div className="rounded-lg border bg-card p-4">
          {careerLines.length > 0 ? (
            <ul className="list-disc list-outside pl-5 space-y-2 text-base text-muted-foreground">
              {careerLines.map((line, i) => (
                <li key={i} className="whitespace-pre-wrap">
                  {line}
                </li>
              ))}
            </ul>
          ) : careerDescription && careerDescription.trim() ? (
            <p className="text-base text-muted-foreground whitespace-pre-wrap">{careerDescription}</p>
          ) : (
            <p className="text-base text-muted-foreground">등록된 경력 기술서가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
