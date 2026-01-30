import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServerAdminClient } from '@/lib/supabase/server-admin';

export async function POST(request: NextRequest) {
  try {
    const { position, skills, experience, domain } = await request.json();

    const adminClient = createServerAdminClient();
    const supabase = adminClient ?? (await createClient());
    let query = supabase.from('profiles').select('*');

    // 필터 적용
    if (position && position.trim() !== '') {
      query = query.eq('position', position);
    }

    if (experience && experience.trim() !== '') {
      query = query.eq('experience', experience);
    }

    if (domain && domain.trim() !== '') {
      // domain은 배열이므로 contains 연산자 사용
      query = query.contains('domain', [domain]);
    }

    if (skills && Array.isArray(skills) && skills.length > 0) {
      // skills 배열 중 하나라도 포함하는 프로필 검색
      // Supabase에서는 배열 필드에 대해 overlaps 연산자 사용
      query = query.overlaps('skills', skills);
    }

    // 결과 제한
    query = query.limit(50);

    const { data: profiles, error } = await query;

    if (error) {
      console.error('필터 검색 에러:', error);
      return NextResponse.json(
        { error: '프로필 검색에 실패했습니다.' },
        { status: 500 }
      );
    }

    // match_score는 기본값 0으로 설정 (필터 검색에서는 유사도 점수 없음)
    const results = (profiles || []).map((profile) => ({
      ...profile,
      match_score: profile.match_score || 0,
    }));

    return NextResponse.json({
      results,
      count: results.length,
    });

  } catch (error) {
    console.error('필터 검색 에러:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
