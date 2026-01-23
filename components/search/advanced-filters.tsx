"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface Filters {
  position: string;
  skills: string[];
  experience: string;
  domain: string;
}

interface AdvancedFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onSearch: () => void;
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  onSearch,
}: AdvancedFiltersProps) {
  // skillsInput을 완전히 독립적으로 관리 (초기값만 filters에서 가져옴)
  const [skillsInput, setSkillsInput] = useState(() => 
    filters.skills.length > 0 ? filters.skills.join(", ") : ""
  );

  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleSkillsChange = (value: string) => {
    // 입력값을 그대로 유지 (쉼표 포함)
    setSkillsInput(value);
    // 배열로 변환하여 저장 (검색 시 사용)
    const skillsArray = value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    // skills 배열만 업데이트
    onFiltersChange({ ...filters, skills: skillsArray });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="position">직무</Label>
          <Select
            value={filters.position}
            onValueChange={(value) => updateFilter("position", value)}
          >
            <SelectTrigger id="position" aria-label="직무 선택" className="w-full">
              <SelectValue placeholder="직무를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frontend">프론트엔드 개발자</SelectItem>
              <SelectItem value="backend">백엔드 개발자</SelectItem>
              <SelectItem value="fullstack">풀스택 개발자</SelectItem>
              <SelectItem value="mobile">모바일 개발자</SelectItem>
              <SelectItem value="data">데이터 엔지니어</SelectItem>
              <SelectItem value="devops">DevOps 엔지니어</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">경력</Label>
          <Select
            value={filters.experience}
            onValueChange={(value) => updateFilter("experience", value)}
          >
            <SelectTrigger id="experience" aria-label="경력 선택" className="w-full">
              <SelectValue placeholder="경력을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="junior">1-3년</SelectItem>
              <SelectItem value="mid">3-5년</SelectItem>
              <SelectItem value="senior">5-7년</SelectItem>
              <SelectItem value="expert">7년 이상</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="domain">도메인 경험</Label>
          <Select
            value={filters.domain}
            onValueChange={(value) => updateFilter("domain", value)}
          >
            <SelectTrigger id="domain" aria-label="도메인 선택" className="w-full">
              <SelectValue placeholder="도메인을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="finance">금융</SelectItem>
              <SelectItem value="ecommerce">전자상거래</SelectItem>
              <SelectItem value="healthcare">의료</SelectItem>
              <SelectItem value="education">교육</SelectItem>
              <SelectItem value="manufacturing">제조</SelectItem>
              <SelectItem value="logistics">물류</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="skills">기술 스택 (쉼표로 구분)</Label>
          <Input
            id="skills"
            type="text"
            placeholder="예: React, TypeScript, Node.js"
            value={skillsInput}
            onChange={(e) => handleSkillsChange(e.target.value)}
            aria-describedby="skills-help"
            className="w-full"
          />
          <p id="skills-help" className="text-sm text-muted-foreground">
            여러 기술을 쉼표로 구분하여 입력하세요.
          </p>
        </div>
      </div>

      <Button onClick={onSearch} className="w-full sm:w-auto">
        <Search className="h-4 w-4 mr-2" aria-hidden="true" />
        검색하기
      </Button>
    </div>
  );
}
