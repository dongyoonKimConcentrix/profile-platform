"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Sparkles, Filter, Loader2 } from "lucide-react";
import { AdvancedFilters } from "./advanced-filters";

interface SearchInterfaceProps {
  onSearchResults: (results: any[], loading: boolean, error: string | null) => void;
}

export function SearchInterface({ onSearchResults }: SearchInterfaceProps) {
  const [searchMode, setSearchMode] = useState<"natural" | "filter">("natural");
  const [naturalQuery, setNaturalQuery] = useState("");
  const [filters, setFilters] = useState({
    position: "",
    skills: [] as string[],
    experience: "",
    domain: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    onSearchResults([], true, null);

    try {
      if (searchMode === "natural") {
        // 자연어 검색
        if (!naturalQuery.trim()) {
          onSearchResults([], false, "검색어를 입력해주세요.");
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/search/natural", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: naturalQuery }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "검색에 실패했습니다.");
        }

        const data = await response.json();
        onSearchResults(data.results || [], false, null);
      } else {
        // 필터 검색
        const response = await fetch("/api/search/filter", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(filters),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "검색에 실패했습니다.");
        }

        const data = await response.json();
        onSearchResults(data.results || [], false, null);
      }
    } catch (error) {
      console.error("검색 에러:", error);
      onSearchResults(
        [],
        false,
        error instanceof Error ? error.message : "검색 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
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
            <Button 
              onClick={handleSearch} 
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                  검색 중...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" aria-hidden="true" />
                  검색하기
                </>
              )}
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
