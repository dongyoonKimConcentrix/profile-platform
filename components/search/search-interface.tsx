"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Sparkles, Filter } from "lucide-react";
import { AdvancedFilters } from "./advanced-filters";

export function SearchInterface() {
  const [searchMode, setSearchMode] = useState<"natural" | "filter">("natural");
  const [naturalQuery, setNaturalQuery] = useState("");
  const [filters, setFilters] = useState({
    position: "",
    skills: [] as string[],
    experience: "",
    domain: "",
  });

  const handleSearch = () => {
    // 검색 로직 (나중에 Supabase 연동 시 구현)
    console.log("Search:", searchMode === "natural" ? naturalQuery : filters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>검색 옵션</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={searchMode}
          onValueChange={(value) => setSearchMode(value as "natural" | "filter")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="natural" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              자연어 검색
            </TabsTrigger>
            <TabsTrigger value="filter" className="flex items-center gap-2">
              <Filter className="h-4 w-4" aria-hidden="true" />
              필터 검색
            </TabsTrigger>
          </TabsList>

          <TabsContent value="natural" className="space-y-4 mt-0">
            <div className="space-y-2">
              <Label htmlFor="natural-query">
                자연어로 검색어를 입력하세요
              </Label>
              <Textarea
                id="natural-query"
                placeholder="예: 금융권 프로젝트 경험이 있는 React 개발자"
                value={naturalQuery}
                onChange={(e) => setNaturalQuery(e.target.value)}
                rows={3}
                className="resize-none"
                aria-describedby="natural-query-help"
              />
              <p
                id="natural-query-help"
                className="text-sm text-muted-foreground"
              >
                AI가 자연어로 입력한 요구사항을 분석하여 최적의 인력을 추천합니다.
              </p>
            </div>
            <Button onClick={handleSearch} className="w-full sm:w-auto">
              <Search className="h-4 w-4 mr-2" aria-hidden="true" />
              검색하기
            </Button>
          </TabsContent>

          <TabsContent value="filter" className="mt-0">
            <AdvancedFilters filters={filters} onFiltersChange={setFilters} onSearch={handleSearch} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
