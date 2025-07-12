export interface User {
  id: number;
  name: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  is_public: boolean;
  availability: string;
  is_banned: boolean;
  is_admin: boolean;
  created_at: string;
  offered_skills: Skill[];
  wanted_skills: Skill[];
}

export interface UserPublic {
  id: number;
  name: string;
  bio?: string;
  avatar_url?: string;
  availability: string;
  offered_skills: Skill[];
  wanted_skills: Skill[];
}

export interface UserProfile extends User {}

export interface UserSearch extends UserPublic {}

export interface UserRegister {
  name: string;
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserUpdate {
  name?: string;
  bio?: string;
  is_public?: boolean;
  availability?: string;
  offered_skill_ids?: number[];
  wanted_skill_ids?: number[];
}

export interface Skill {
  id: number;
  name: string;
  description?: string;
}