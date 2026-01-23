"use client";

import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";

interface Capabilities {
  frontend: number;
  backend: number;
  mobile: number;
  devops: number;
  database: number;
  testing: number;
}

interface CapabilityChartProps {
  capabilities: Capabilities;
}

const capabilityLabels: Record<keyof Capabilities, string> = {
  frontend: "프론트엔드",
  backend: "백엔드",
  mobile: "모바일",
  devops: "DevOps",
  database: "데이터베이스",
  testing: "테스팅",
};

export function CapabilityChart({ capabilities }: CapabilityChartProps) {
  return (
    <div className="space-y-4">
      {(Object.keys(capabilities) as Array<keyof Capabilities>).map((key) => (
        <div key={key} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`capability-${key}`} className="text-sm font-medium">
              {capabilityLabels[key]}
            </Label>
            <span className="text-sm text-muted-foreground">
              {capabilities[key]}%
            </span>
          </div>
          <Progress
            id={`capability-${key}`}
            value={capabilities[key]}
            className="h-2"
            aria-label={`${capabilityLabels[key]} 역량: ${capabilities[key]}%`}
          />
        </div>
      ))}
    </div>
  );
}
