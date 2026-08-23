import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Role = 'volunteer' | 'ngo' | 'college' | 'company' | 'government';

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  skills: string[];
  interests: string[];
  languages: string[];
  availability: string | null;
  organization_name: string | null;
  organization_type: string | null;
  verified: boolean;
  impact_score: number;
  volunteer_hours: number;
  people_impacted: number;
  campaigns_completed: number;
  created_at: string;
};

export type Campaign = {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  goal: string;
  category: string;
  location: string;
  target_community: string;
  required_volunteers: number;
  required_skills: string[];
  languages: string[];
  start_date: string | null;
  end_date: string | null;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  campaign_type: 'standard' | 'emergency' | 'csr';
  people_impacted: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  organization?: Profile;
};

export type Application = {
  id: string;
  campaign_id: string;
  volunteer_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  match_score: number;
  match_reasons: string[];
  applied_at: string;
  decision_at: string | null;
  campaign?: Campaign;
  volunteer?: Profile;
};

export type Attendance = {
  id: string;
  application_id: string;
  date: string;
  hours: number;
  status: 'present' | 'absent' | 'excused';
  notes: string;
};

export type Certificate = {
  id: string;
  volunteer_id: string;
  campaign_id: string;
  certificate_number: string;
  hours: number;
  people_impacted: number;
  issued_at: string;
  campaign?: Campaign;
};

export type Post = {
  id: string;
  author_id: string;
  content: string;
  type: 'achievement' | 'update' | 'story' | 'question';
  campaign_id: string | null;
  image_url: string | null;
  likes: number;
  created_at: string;
  author?: Profile;
  comments?: Comment[];
  liked_by_me?: boolean;
};

export type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Profile;
};

export type Conversation = {
  id: string;
  type: 'direct' | 'group' | 'campaign';
  campaign_id: string | null;
  created_at: string;
  members?: Profile[];
  messages?: Message[];
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: Profile;
};

export type Notification = {
  id: string;
  user_id: string;
  type: 'application' | 'campaign' | 'match' | 'message' | 'certificate' | 'emergency' | 'community';
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  created_at: string;
};

export type CommunityNeed = {
  id: string;
  category: string;
  title: string;
  description: string;
  location: string;
  people_affected: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  suggested_actions: string[];
  status: 'open' | 'addressed';
  created_at: string;
};

export type Emergency = {
  id: string;
  organization_id: string;
  type: 'flood' | 'cyclone' | 'fire' | 'medical' | 'food_shortage' | 'disaster_relief';
  title: string;
  description: string;
  location: string;
  urgency: 'moderate' | 'high' | 'critical';
  people_affected: number;
  required_volunteers: number;
  required_resources: string[];
  status: 'active' | 'resolved';
  campaign_id: string | null;
  created_at: string;
  organization?: Profile;
};

export type Achievement = {
  id: string;
  volunteer_id: string;
  type: string;
  title: string;
  description: string;
  earned_at: string;
};
