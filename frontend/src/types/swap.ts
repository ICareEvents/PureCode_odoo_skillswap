import { Skill } from './user';

export type SwapStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

export interface SwapRequest {
  id: number;
  requester_id: number;
  responder_id: number;
  requester_name: string;
  responder_name: string;
  offered_skill: Skill;
  wanted_skill: Skill;
  status: SwapStatus;
  message?: string;
  created_at: string;
  has_rating: boolean;
}

export interface SwapRequestCreate {
  responder_id: number;
  offered_skill_id: number;
  wanted_skill_id: number;
  message?: string;
}

export interface SwapRequestUpdate {
  status: SwapStatus;
}

export interface MySwaps {
  pending: SwapRequest[];
  accepted: SwapRequest[];
  completed: SwapRequest[];
  history: SwapRequest[];
}

export interface Rating {
  id: number;
  swap_id: number;
  rater_id: number;
  rated_id: number;
  rater_name: string;
  rated_name: string;
  stars: number;
  comment?: string;
  created_at: string;
}

export interface RatingCreate {
  swap_id: number;
  rated_id: number;
  stars: number;
  comment?: string;
}