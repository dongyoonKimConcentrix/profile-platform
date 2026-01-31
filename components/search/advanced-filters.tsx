"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface Filters {
  job_grade: string;
  education: string;
  position_role: string;
  industry_experience: string;
  skills: string[];
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
  const [skillsInput, setSkillsInput] = useState(() =>
    filters.skills.length > 0 ? filters.skills.join(", ") : ""
  );

  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleSkillsChange = (value: string) => {
    setSkillsInput(value);
    const skillsArray = value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    onFiltersChange({ ...filters, skills: skillsArray });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="job_grade">직급</Label>
          <Select
            value={filters.job_grade}
            onValueChange={(value) => updateFilter("job_grade", value)}
          >
            <SelectTrigger id="job_grade" aria-label="직급 선택" className="w-full">
              <SelectValue placeholder="직급을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="사원">사원</SelectItem>
              <SelectItem value="대리">대리</SelectItem>
              <SelectItem value="과장">과장</SelectItem>
              <SelectItem value="차장">차장</SelectItem>
              <SelectItem value="부장">부장</SelectItem>
              <SelectItem value="실장">실장</SelectItem>
              <SelectItem value="이사">이사</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="education">최종학력</Label>
          <Select
            value={filters.education}
            onValueChange={(value) => updateFilter("education", value)}
          >
            <SelectTrigger id="education" aria-label="최종학력 선택" className="w-full">
              <SelectValue placeholder="최종학력을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="고졸">고졸</SelectItem>
              <SelectItem value="전문학사">전문학사</SelectItem>
              <SelectItem value="학사">학사</SelectItem>
              <SelectItem value="석사">석사</SelectItem>
              <SelectItem value="박사">박사</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="position_role">직무</Label>
          <Select
            value={filters.position_role}
            onValueChange={(value) => updateFilter("position_role", value)}
          >
            <SelectTrigger id="position_role" aria-label="직무 선택" className="w-full">
              <SelectValue placeholder="직무를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="기획자">기획자</SelectItem>
              <SelectItem value="디자이너">디자이너</SelectItem>
              <SelectItem value="퍼블리셔">퍼블리셔</SelectItem>
              <SelectItem value="프론트엔드개발자">프론트엔드 개발자</SelectItem>
              <SelectItem value="백엔드개발자">백엔드 개발자</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry_experience">산업군 경험</Label>
          <Select
            value={filters.industry_experience}
            onValueChange={(value) => updateFilter("industry_experience", value)}
          >
            <SelectTrigger id="industry_experience" aria-label="산업군 선택" className="w-full">
              <SelectValue placeholder="산업군을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="금융">금융</SelectItem>
              <SelectItem value="이커머스">이커머스</SelectItem>
              <SelectItem value="헬스케어">헬스케어</SelectItem>
              <SelectItem value="교육">교육</SelectItem>
              <SelectItem value="제조">제조</SelectItem>
              <SelectItem value="물류">물류</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2">
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
