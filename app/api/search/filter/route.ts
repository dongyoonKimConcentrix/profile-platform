import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServerAdminClient } from '@/lib/supabase/server-admin';

export async function POST(request: NextRequest) {
  try {
    const { job_grade, education, position_role, industry_experience, skills } =
      await request.json();

    const adminClient = createServerAdminClient();
    const supabase = adminClient ?? (await createClient());
    let query = supabase.from('profiles').select('*');

    // 필터 적용 (새 스키마: job_grade, education, position_role, industry_experience, skills)
    if (job_grade && String(job_grade).trim() !== '') {
      query = query.eq('job_grade', job_grade);
    }

    if (education && String(education).trim() !== '') {
      query = query.eq('education', education);
    }

    if (position_role && String(position_role).trim() !== '') {
      query = query.eq('position_role', position_role);
    }

    if (industry_experience && Array.isArray(industry_experience) && industry_experience.length > 0) {
      query = query.overlaps('industry_experience', industry_experience);
    } else if (industry_experience && typeof industry_experience === 'string' && industry_experience.trim() !== '') {
      query = query.contains('industry_experience', [industry_experience]);
    }

    if (skills && Array.isArray(skills) && skills.length > 0) {
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
