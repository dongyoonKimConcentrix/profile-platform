import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServerAdminClient } from '@/lib/supabase/server-admin';

/** 자연어 쿼리에서 도메인 키워드 추출 (금융권, 이커머스 등) -> Supabase domain 값 */
function extractDomainFromQuery(query: string): ('finance' | 'ecommerce' | 'healthcare' | 'education' | 'manufacturing' | 'logistics')[] {
  const domains: ('finance' | 'ecommerce' | 'healthcare' | 'education' | 'manufacturing' | 'logistics')[] = [];
  if (/금융|금융권|은행|증권|보험/.test(query)) domains.push('finance');
  if (/이커머스|전자상거래|쇼핑몰/.test(query)) domains.push('ecommerce');
  if (/의료|헬스케어|병원|헬스/.test(query)) domains.push('healthcare');
  if (/교육|에듀/.test(query)) domains.push('education');
  if (/제조|제조업|공장/.test(query)) domains.push('manufacturing');
  if (/물류|로지스틱스|배송/.test(query)) domains.push('logistics');
  return [...new Set(domains)];
}

/** embedding 검색 결과가 없을 때 키워드 기반 폴백 검색 (domain, description 텍스트) */
async function keywordFallbackSearch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  query: string,
  limit: number = 20
) {
  const domainValues = extractDomainFromQuery(query);
  const seenIds = new Set<string>();
  const results: Array<Record<string, unknown> & { match_score?: number }> = [];

  // 1) 도메인으로 검색 (금융 -> finance 등)
  if (domainValues.length > 0) {
    for (const domain of domainValues) {
      const { data: byDomain } = await supabase
        .from('profiles')
        .select('*')
        .contains('domain', [domain])
        .limit(limit);
      for (const p of byDomain || []) {
        if (p?.id && !seenIds.has(p.id)) {
          seenIds.add(p.id);
          results.push({ ...p, match_score: p.match_score ?? 85 });
        }
      }
    }
  }

  // 2) 설명(description)에 검색어 포함된 프로필 추가 (금융, 경험 등)
  const keywords = query.replace(/\s+/g, ' ').trim().split(/\s/).filter((s) => s.length >= 2);
  for (const kw of keywords.slice(0, 3)) {
    const { data: byDesc } = await supabase
      .from('profiles')
      .select('*')
      .ilike('description', `%${kw}%`)
      .limit(limit);
    for (const p of byDesc || []) {
      if (p?.id && !seenIds.has(p.id)) {
        seenIds.add(p.id);
        results.push({ ...p, match_score: p.match_score ?? 80 });
      }
    }
  }

  return results.slice(0, limit);
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
          return NextResponse.json({
            results: rpcProfiles,
            count: rpcProfiles.length,
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
            return NextResponse.json({ results: withScore, count: withScore.length });
          }
        }
        usedFallback = true;
      }
    } else {
      usedFallback = true;
    }

    // 2) embedding 검색 결과 없음 → 키워드 폴백 (금융권 → domain finance, description 텍스트 검색)
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
