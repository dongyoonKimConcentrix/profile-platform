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
          name: string
          email: string
          phone: string | null
          position: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'data' | 'devops'
          experience: 'junior' | 'mid' | 'senior' | 'expert'
          domain: ('finance' | 'ecommerce' | 'healthcare' | 'education' | 'manufacturing' | 'logistics')[] | null
          skills: string[]
          description: string | null
          match_score: number
          embedding: number[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          position: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'data' | 'devops'
          experience: 'junior' | 'mid' | 'senior' | 'expert'
          domain?: ('finance' | 'ecommerce' | 'healthcare' | 'education' | 'manufacturing' | 'logistics')[] | null
          skills?: string[]
          description?: string | null
          match_score?: number
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          position?: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'data' | 'devops'
          experience?: 'junior' | 'mid' | 'senior' | 'expert'
          domain?: ('finance' | 'ecommerce' | 'healthcare' | 'education' | 'manufacturing' | 'logistics')[] | null
          skills?: string[]
          description?: string | null
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
    }
  }
}
