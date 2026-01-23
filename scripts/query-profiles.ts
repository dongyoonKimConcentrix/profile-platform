import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// .env.local 파일 로드
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  process.exit(1)
}

// 서비스 역할 키가 있으면 사용 (RLS 우회), 없으면 anon key 사용
const supabaseKey = supabaseServiceKey || supabaseAnonKey

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY가 필요합니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

if (supabaseServiceKey) {
  console.log('🔑 서비스 역할 키를 사용하여 RLS를 우회합니다.\n')
} else {
  console.log('⚠️  Anon 키를 사용합니다. RLS 정책 때문에 데이터가 보이지 않을 수 있습니다.\n')
}

async function queryProfiles() {
  console.log('🔍 Supabase에서 profiles 테이블 조회 중...\n')

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ 오류 발생:', error.message)
      console.error('상세 정보:', error)
      
      // RLS 정책 오류인 경우 안내
      if (error.message.includes('row-level security') || error.code === '42501') {
        console.error('\n💡 RLS 정책 때문에 데이터를 조회할 수 없습니다.')
        console.error('   해결 방법:')
        console.error('   1. .env.local에 SUPABASE_SERVICE_ROLE_KEY를 추가하세요')
        console.error('   2. 또는 Supabase 대시보드의 Table Editor에서 직접 확인하세요')
        console.error('   3. 또는 관리자로 로그인한 상태에서 /admin 페이지에서 확인하세요')
      }
      return
    }

    if (!data || data.length === 0) {
      console.log('📭 profiles 테이블에 데이터가 없습니다.')
      if (!supabaseServiceKey) {
        console.log('\n💡 참고: RLS 정책 때문에 데이터가 보이지 않을 수 있습니다.')
        console.log('   .env.local에 SUPABASE_SERVICE_ROLE_KEY를 추가하면 RLS를 우회하여 조회할 수 있습니다.')
      }
      return
    }

    console.log(`✅ 총 ${data.length}개의 프로필을 찾았습니다.\n`)
    console.log('='.repeat(80))
    
    data.forEach((profile, index) => {
      console.log(`\n[${index + 1}] 프로필 ID: ${profile.id}`)
      console.log(`   이름: ${profile.name}`)
      console.log(`   이메일: ${profile.email}`)
      console.log(`   전화번호: ${profile.phone || '(없음)'}`)
      console.log(`   직무: ${profile.position}`)
      console.log(`   경력: ${profile.experience}`)
      console.log(`   도메인: ${profile.domain || '(없음)'}`)
      console.log(`   기술 스택: ${profile.skills?.join(', ') || '(없음)'}`)
      console.log(`   매칭 점수: ${profile.match_score}`)
      console.log(`   임베딩: ${profile.embedding ? `${profile.embedding.length}차원 벡터` : '(없음)'}`)
      console.log(`   설명: ${profile.description || '(없음)'}`)
      console.log(`   생성일: ${new Date(profile.created_at).toLocaleString('ko-KR')}`)
      console.log(`   수정일: ${new Date(profile.updated_at).toLocaleString('ko-KR')}`)
      console.log('-'.repeat(80))
    })

    console.log(`\n✅ 조회 완료: 총 ${data.length}개의 프로필\n`)
  } catch (err) {
    console.error('❌ 예상치 못한 오류:', err)
  }
}

queryProfiles()
