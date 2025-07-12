export interface Skill {
    id: number;
    name: string;
    description?: string;
    is_approved: boolean;
    created_at: string;
  }
  
  export interface SkillBase {
    id: number;
    name: string;
    description?: string;
  }
  
  export interface SkillCreate {
    name: string;
    description?: string;
  }
  
  export interface SkillUpdate {
    name?: string;
    description?: string;
    is_approved?: boolean;
  }
  
  export interface SkillSearchResult {
    skills: SkillBase[];
    total: number;
    page: number;
    per_page: number;
    has_more: boolean;
  }
  
  export interface SkillSearchParams {
    q?: string;
    page?: number;
    per_page?: number;
  }
  
  export interface SkillStats {
    total_skills: number;
    approved_skills: number;
    pending_skills: number;
    most_popular: SkillBase[];
  }