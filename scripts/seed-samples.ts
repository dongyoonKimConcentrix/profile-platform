import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const sampleProfiles = [
  {
    name: '김철수',
    email: 'chulsoo.kim@example.com',
    phone: '010-1111-2222',
    position: 'backend',
    experience: 'senior',
    domain: ['finance'],
    skills: ['Node.js', 'PostgreSQL', 'Redis', 'Docker'],
    description: '10년차 백엔드 개발자입니다. 대규모 트래픽 처리 및 데이터베이스 최적화 경험이 풍부합니다.'
  },
  {
    name: '이영희',
    email: 'younghee.lee@example.com',
    phone: '010-3333-4444',
    position: 'frontend',
    experience: 'mid',
    domain: ['ecommerce'],
    skills: ['React', 'Next.js', 'Tailwind CSS', 'Zustand'],
    description: 'UI/UX에 관심이 많은 5년차 프론트엔드 개발자입니다. 사용자 중심의 인터페이스 구현을 즐깁니다.'
  },
  {
    name: '박지민',
    email: 'jimin.park@example.com',
    phone: '010-5555-6666',
    position: 'fullstack',
    experience: 'expert',
    domain: ['healthcare'],
    skills: ['React', 'Node.js', 'Python', 'AWS'],
    description: '풀스택 개발자로 다양한 스타트업에서 기술 리딩을 담당했습니다. 의료 데이터 처리 시스템 구축 경험이 있습니다.'
  }
]

async function seedData() {
  console.log('🚀 샘플 데이터 생성을 시작합니다...\n')

  for (const profile of sampleProfiles) {
    console.log(`👤 ${profile.name} 프로필 생성 중...`)
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single()

    if (profileError) {
      console.error(`❌ ${profile.name} 생성 실패:`, profileError.message)
      continue
    }

    console.log(`✅ ${profile.name} 생성 완료 (ID: ${profileData.id})`)

    // 역량 데이터 생성
    const capabilities = {
      profile_id: profileData.id,
      markup_precision: Math.floor(Math.random() * 30) + 70,
      js_ts_logic: Math.floor(Math.random() * 30) + 70,
      framework_proficiency: Math.floor(Math.random() * 30) + 70,
      ui_ux_design: Math.floor(Math.random() * 30) + 70,
      web_optimization: Math.floor(Math.random() * 30) + 70,
      accessibility: Math.floor(Math.random() * 30) + 70
    }

    const { error: capError } = await supabase
      .from('profile_capabilities')
      .insert([capabilities])

    if (capError) {
      console.error(`❌ ${profile.name} 역량 데이터 생성 실패:`, capError.message)
    } else {
      console.log(`📊 ${profile.name} 역량 데이터 생성 완료`)
    }
    console.log('--------------------------------------------------')
  }

  console.log('\n✨ 모든 샘플 데이터 생성이 완료되었습니다.')
}

seedData()
