-- 프로필 사진 URL 컬럼 추가 (업로드 파일에서 추출한 사진 또는 수동 등록)
alter table public.profiles add column if not exists photo_url text;

comment on column public.profiles.photo_url is '인력 프로필 사진 URL (Supabase Storage 등)';
