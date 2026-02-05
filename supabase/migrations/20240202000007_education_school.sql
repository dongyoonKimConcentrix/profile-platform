-- 학력: 학교명(학력 수준) 구분 저장
-- education: 고졸/전문학사/학사/석사/박사 (기존 유지)
-- education_school: 학교명 (예: 연세대학교 신문방송학과)

alter table public.profiles add column if not exists education_school text;
