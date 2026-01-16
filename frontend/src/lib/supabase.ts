import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  username: string;
  recycling_currency: number;
  trash_currency: number;
  compost_currency: number;
  total_items_logged: number;
  created_at: string;
  updated_at: string;
}

export interface LoggedItem {
  id: string;
  user_id: string;
  item_name: string;
  category: 'compost' | 'plastic' | 'paper' | 'metal' | 'glass' | 'organic' | 'landfill';
  recyclable: boolean;
  confidence?: number;
  description?: string;
  recycling_earned: number;
  trash_earned: number;
  compost_earned: number;
  image_data?: string;
  created_at: string;
}

export interface Reward {
  id: string;
  name: string;
  description?: string;
  recycling_cost: number;
  trash_cost: number;
  compost_cost: number;
  icon?: string;
  category?: string;
  created_at: string;
}

export interface UserReward {
  id: string;
  user_id: string;
  reward_id: string;
  redeemed_at: string;
}
