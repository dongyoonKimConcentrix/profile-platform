import { MainLayout } from "@/components/layout/main-layout";
import { SearchInterface } from "@/components/search/search-interface";
import { SearchResults } from "@/components/search/search-results";

export default function SearchPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">인력 검색</h1>
          <p className="text-muted-foreground mt-2">
            자연어 프롬프트 또는 상세 조건으로 인력을 검색하세요.
          </p>
        </div>

        <SearchInterface />

        <SearchResults />
      </div>
    </MainLayout>
  );
}
