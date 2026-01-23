"use client";

import { Badge } from "@/components/ui/badge";
import { Briefcase, Calendar, Code } from "lucide-react";

interface CareerItem {
  id: string;
  company: string;
  position: string;
  period: string;
  description: string;
  technologies: string[];
}

interface ProjectItem {
  id: string;
  name: string;
  role: string;
  period: string;
  description: string;
  technologies: string[];
}

interface CareerTimelineProps {
  career: CareerItem[];
  projects: ProjectItem[];
}

export function CareerTimeline({ career, projects }: CareerTimelineProps) {
  return (
    <div className="space-y-8">
      {/* 경력 이력 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5" aria-hidden="true" />
          경력 이력
        </h3>
        <div className="space-y-6">
          {career.map((item, index) => (
            <div
              key={item.id}
              className="relative pl-8 pb-6 border-l-2 border-border last:border-l-0 last:pb-0"
            >
              <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-primary border-2 border-background" />
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h4 className="font-semibold">{item.company}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.position}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    <span>{item.period}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.technologies.map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 주요 프로젝트 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Code className="h-5 w-5" aria-hidden="true" />
          주요 프로젝트
        </h3>
        <div className="space-y-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-4 rounded-lg border bg-card"
            >
              <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                <div>
                  <h4 className="font-semibold">{project.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {project.role}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  <span>{project.period}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
