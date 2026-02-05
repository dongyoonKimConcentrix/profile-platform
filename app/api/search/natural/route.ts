/**
 * 자연어 검색 API
 * - 임베딩: n8n에서 프로필별로 추출된 전체 텍스트(text)로 생성되며, 경력/기술/산업/재직이력/프로젝트 내용을 포함합니다.
 * - 산업군: DB에 한글(금융) 또는 영어(Finance)로 저장돼 있어도 쿼리(금융권, financial 등)와 매칭되도록 한/영 매핑을 사용합니다.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServerAdminClient } from '@/lib/supabase/server-admin';

type ProfileRecord = Record<string, unknown> & {
  industry_experience?: string[] | null;
  position_role?: string | null;
  job_grade?: string | null;
  education?: string | null;
  match_score?: number;
};

/** 쿼리에서 추출한 산업 키(한글) -> DB에 저장될 수 있는 값들 (한글 + 영어). 산업군이 영어로 저장된 경우에도 매칭 */
const INDUSTRY_QUERY_TO_DB_VALUES: Record<string, string[]> = {
  금융: ['금융', 'Finance', 'financial', '금융권', 'Banking', 'banking'],
  이커머스: ['이커머스', 'E-commerce', 'ecommerce', 'e-commerce', '전자상거래'],
  헬스케어: ['헬스케어', 'Healthcare', 'healthcare', '의료', 'Medical'],
  교육: ['교육', 'Education', 'education', '에듀'],
  제조: ['제조', 'Manufacturing', 'manufacturing', '제조업'],
  물류: ['물류', 'Logistics', 'logistics', '로지스틱스'],
};

/** 자연어 쿼리에서 산업군 키워드 추출 (금융, 이커머스 등) -> DB industry_experience 값 후보(한글 키) */
function extractIndustryFromQuery(query: string): string[] {
  const industries: string[] = [];
  if (/금융|금융권|은행|증권|보험|financial|finance|banking/.test(query)) industries.push('금융');
  if (/이커머스|전자상거래|쇼핑몰|e-commerce|ecommerce/.test(query)) industries.push('이커머스');
  if (/의료|헬스케어|병원|헬스|healthcare|medical/.test(query)) industries.push('헬스케어');
  if (/교육|에듀|education/.test(query)) industries.push('교육');
  if (/제조|제조업|공장|manufacturing/.test(query)) industries.push('제조');
  if (/물류|로지스틱스|배송|logistics/.test(query)) industries.push('물류');
  return [...new Set(industries)];
}

/** 추출된 산업 키들에 대응하는 DB 검색용 값 목록 (한글+영어 모두 포함) */
function getIndustryDbValuesForQuery(query: string): string[] {
  const keys = extractIndustryFromQuery(query);
  const values = new Set<string>();
  for (const k of keys) {
    const list = INDUSTRY_QUERY_TO_DB_VALUES[k];
    if (list) list.forEach((v) => values.add(v));
  }
  return [...values];
}

/** 자연어 쿼리에서 직무 추출 (퍼블리셔, 디자이너 등) -> DB position_role 값 */
function extractPositionRoleFromQuery(query: string): string | null {
  if (/퍼블리셔|퍼블리싱|퍼블\b/.test(query)) return '퍼블리셔';
  if (/디자이너|디자인\b/.test(query)) return '디자이너';
  if (/기획자|기획\b/.test(query)) return '기획자';
  if (/프론트엔드|프론트\b|프론트엔드개발자/.test(query)) return '프론트엔드개발자';
  if (/백엔드|백엔드개발자/.test(query)) return '백엔드개발자';
  return null;
}

/** 자연어 쿼리에서 직급 추출 -> DB job_grade 값 */
function extractJobGradeFromQuery(query: string): string | null {
  const map: Record<string, string> = {
    사원: '사원', 대리: '대리', 과장: '과장', 차장: '차장',
    부장: '부장', 실장: '실장', 이사: '이사',
  };
  for (const [keyword, value] of Object.entries(map)) {
    if (new RegExp(keyword).test(query)) return value;
  }
  return null;
}

/** 자연어 쿼리에서 학력 추출 -> DB education 값 */
function extractEducationFromQuery(query: string): string | null {
  if (/박사|PhD|phd/.test(query)) return '박사';
  if (/석사|硕士|master|MBA/.test(query)) return '석사';
  if (/학사|学士|bachelor|대졸/.test(query)) return '학사';
  if (/전문학사|전문대/.test(query)) return '전문학사';
  if (/고졸|고등학교/.test(query)) return '고졸';
  return null;
}

/** 추출된 산업·직무·직급·학력 조건에 맞는 프로필만 필터링 (embedding/키워드 결과 공통). 산업은 한/영 모두 매칭 */
function applyNaturalLanguageFilters(
  profiles: ProfileRecord[],
  query: string
): ProfileRecord[] {
  const industryKeys = extractIndustryFromQuery(query);
  const allowedIndustryValues = getIndustryDbValuesForQuery(query);
  const positionRole = extractPositionRoleFromQuery(query);
  const jobGrade = extractJobGradeFromQuery(query);
  const education = extractEducationFromQuery(query);
  if (industryKeys.length === 0 && !positionRole && !jobGrade && !education) return profiles;
  return profiles.filter((p) => {
    if (industryKeys.length > 0) {
      const exp = (p.industry_experience as string[] | undefined) ?? [];
      const expLower = Array.isArray(exp) ? exp.map((s) => String(s).toLowerCase()) : [];
      const hasIndustry = allowedIndustryValues.some(
        (v) => expLower.includes(v.toLowerCase())
      );
      if (!hasIndustry) return false;
    }
    if (positionRole && (p.position_role as string | null) !== positionRole) return false;
    if (jobGrade && (p.job_grade as string | null) !== jobGrade) return false;
    if (education && (p.education as string | null) !== education) return false;
    return true;
  });
}

/** embedding 검색 결과가 없을 때 키워드 기반 폴백 (산업·직무 AND 조건, career_description 보조) */
async function keywordFallbackSearch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  query: string,
  limit: number = 20
): Promise<ProfileRecord[]> {
  const industryKeys = extractIndustryFromQuery(query);
  const industryDbValues = getIndustryDbValuesForQuery(query); // 한글+영어 DB 값 목록
  const positionRole = extractPositionRoleFromQuery(query);
  const jobGrade = extractJobGradeFromQuery(query);
  const education = extractEducationFromQuery(query);
  const hasStructuredFilters = industryKeys.length > 0 || positionRole || jobGrade || education;
  const seenIds = new Set<string>();
  const results: ProfileRecord[] = [];

  const addEq = (q: ReturnType<typeof supabase.from>) => {
    let builder = q;
    if (positionRole) builder = builder.eq('position_role', positionRole);
    if (jobGrade) builder = builder.eq('job_grade', jobGrade);
    if (education) builder = builder.eq('education', education);
    return builder;
  };

  // 1) 산업군 + 직무 + 직급 + 학력 반영 (AND). 산업은 한/영 모두 조회 (DB에 Finance 또는 금융 저장 시 모두 매칭)
  if (industryDbValues.length > 0) {
    for (const dbVal of industryDbValues) {
      let q = supabase.from('profiles').select('*').contains('industry_experience', [dbVal]).limit(limit);
      q = addEq(q);
      const { data: rows } = await q;
      for (const p of rows || []) {
        if (p?.id && !seenIds.has(p.id)) {
          seenIds.add(p.id);
          results.push({ ...p, match_score: (p.match_score as number) ?? 85 });
        }
      }
    }
  }

  if (hasStructuredFilters && industryDbValues.length === 0) {
    let q = supabase.from('profiles').select('*').limit(limit);
    q = addEq(q);
    const { data: rows } = await q;
    for (const p of rows || []) {
      if (p?.id && !seenIds.has(p.id)) {
        seenIds.add(p.id);
        results.push({ ...p, match_score: (p.match_score as number) ?? 85 });
      }
    }
  }

  // 2) 구조화된 조건(산업·직무·직급·학력)이 없을 때만 career_description 키워드로 보조
  if (!hasStructuredFilters) {
    const keywords = query.replace(/\s+/g, ' ').trim().split(/\s/).filter((s) => s.length >= 2);
    for (const kw of keywords.slice(0, 3)) {
      const { data: byDesc } = await supabase
        .from('profiles')
        .select('*')
        .ilike('career_description', `%${kw}%`)
        .limit(limit);
      for (const p of byDesc || []) {
        if (p?.id && !seenIds.has(p.id)) {
          seenIds.add(p.id);
          results.push({ ...p, match_score: (p.match_score as number) ?? 80 });
        }
      }
    }
  }

  return applyNaturalLanguageFilters(results, query).slice(0, limit);
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: '검색어를 입력해주세요.' },
        { status: 400 }
      );
    }

    const adminClient = createServerAdminClient();
    const supabase = adminClient ?? (await createClient());
    let results: Array<Record<string, unknown> & { match_score?: number }> = [];
    let usedFallback = false;

    // 1) OpenAI embedding 검색 (키가 있고, RPC 또는 embedding 있는 프로필이 있을 때만 의미 있음)
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (openaiApiKey) {
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: query,
        }),
      });

      if (embeddingResponse.ok) {
        const embeddingData = await embeddingResponse.json();
        const queryEmbedding = embeddingData.data[0].embedding as number[];

        const { data: rpcProfiles, error: searchError } = await supabase.rpc('match_profiles', {
          query_embedding: queryEmbedding,
          match_threshold: 0.5,
          match_count: 20,
        });

        if (!searchError && rpcProfiles && rpcProfiles.length > 0) {
          const filtered = applyNaturalLanguageFilters(rpcProfiles as ProfileRecord[], query);
          return NextResponse.json({
            results: filtered,
            count: filtered.length,
          });
        }

        // RPC 없거나 결과 없음 -> embedding 있는 프로필만 수동 유사도 계산
        const { data: allProfiles, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .not('embedding', 'is', null)
          .limit(100);

        if (!fetchError && allProfiles && allProfiles.length > 0) {
          const withScore = allProfiles
            .map((profile) => {
              const emb = profile.embedding;
              if (!emb || !Array.isArray(emb)) return null;
              let dot = 0, na = 0, nb = 0;
              for (let i = 0; i < queryEmbedding.length; i++) {
                dot += queryEmbedding[i] * emb[i];
                na += queryEmbedding[i] ** 2;
                nb += emb[i] ** 2;
              }
              const sim = na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
              return { ...profile, match_score: Math.round(sim * 100) };
            })
            .filter((p): p is NonNullable<typeof p> => p !== null)
            .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
            .slice(0, 20);
          if (withScore.length > 0) {
            const filtered = applyNaturalLanguageFilters(withScore as ProfileRecord[], query);
            return NextResponse.json({ results: filtered, count: filtered.length });
          }
        }
        usedFallback = true;
      }
    } else {
      usedFallback = true;
    }

    // 2) embedding 검색 결과 없음 → 키워드 폴백 (금융권 → industry_experience, career_description 텍스트 검색)
    results = await keywordFallbackSearch(supabase, query, 20);

    return NextResponse.json({
      results,
      count: results.length,
      usedKeywordFallback: usedFallback,
    });
  } catch (error) {
    console.error('자연어 검색 에러:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
