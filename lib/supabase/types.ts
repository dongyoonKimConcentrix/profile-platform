export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'super_admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          name_ko: string
          name_en: string | null
          email: string
          phone: string | null
          photo_url: string | null
          job_grade: '사원' | '대리' | '과장' | '차장' | '부장' | '실장' | '이사' | null
          team: string | null
          education_school: string | null
          education: '고졸' | '전문학사' | '학사' | '석사' | '박사' | null
          position_role: '기획자' | '디자이너' | '퍼블리셔' | '프론트엔드개발자' | '백엔드개발자' | null
          industry_experience: string[] | null
          skills: string[]
          career_description: string | null
          match_score: number
          embedding: number[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_ko: string
          name_en?: string | null
          email: string
          phone?: string | null
          photo_url?: string | null
          job_grade?: '사원' | '대리' | '과장' | '차장' | '부장' | '실장' | '이사' | null
          team?: string | null
          education_school?: string | null
          education?: '고졸' | '전문학사' | '학사' | '석사' | '박사' | null
          position_role?: '기획자' | '디자이너' | '퍼블리셔' | '프론트엔드개발자' | '백엔드개발자' | null
          industry_experience?: string[] | null
          skills?: string[]
          career_description?: string | null
          match_score?: number
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name_ko?: string
          name_en?: string | null
          email?: string
          phone?: string | null
          photo_url?: string | null
          job_grade?: '사원' | '대리' | '과장' | '차장' | '부장' | '실장' | '이사' | null
          team?: string | null
          education_school?: string | null
          education?: '고졸' | '전문학사' | '학사' | '석사' | '박사' | null
          position_role?: '기획자' | '디자이너' | '퍼블리셔' | '프론트엔드개발자' | '백엔드개발자' | null
          industry_experience?: string[] | null
          skills?: string[]
          career_description?: string | null
          match_score?: number
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
      }
      profile_capabilities: {
        Row: {
          id: string
          profile_id: string
          markup_precision: number
          js_ts_logic: number
          framework_proficiency: number
          ui_ux_design: number
          web_optimization: number
          accessibility: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          markup_precision?: number
          js_ts_logic?: number
          framework_proficiency?: number
          ui_ux_design?: number
          web_optimization?: number
          accessibility?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          markup_precision?: number
          js_ts_logic?: number
          framework_proficiency?: number
          ui_ux_design?: number
          web_optimization?: number
          accessibility?: number
          created_at?: string
          updated_at?: string
        }
      }
      profile_projects: {
        Row: {
          id: string
          profile_id: string
          industry: string
          project_name: string
          duration: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          industry: string
          project_name: string
          duration: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          industry?: string
          project_name?: string
          duration?: string
          created_at?: string
          updated_at?: string
        }
      }
      profile_project_careers: {
        Row: {
          id: string
          profile_id: string
          project_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          project_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          project_name?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
