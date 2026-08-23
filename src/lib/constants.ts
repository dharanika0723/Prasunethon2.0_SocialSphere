import {
  GraduationCap, Building2, Users2, Landmark, HeartHandshake,
} from 'lucide-react';
import type { Role } from '@/lib/supabase';

export const ROLE_LABELS: Record<Role, string> = {
  volunteer: 'Volunteer',
  ngo: 'NGO',
  college: 'College',
  company: 'Company',
  government: 'Government',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  volunteer: 'Discover opportunities, get matched with campaigns, and track your social impact.',
  ngo: 'Create campaigns, find volunteers, manage applications, and measure campaign impact.',
  college: 'Manage student volunteers, campaigns, participation, and certificates.',
  company: 'Create CSR initiatives, engage employees, and track corporate social impact.',
  government: 'Publish community initiatives, monitor participation, and analyze community needs.',
};

export const ROLE_DASHBOARD_PATHS: Record<Role, string> = {
  volunteer: '/app/dashboard',
  ngo: '/app/dashboard',
  college: '/app/dashboard',
  company: '/app/dashboard',
  government: '/app/dashboard',
};

export const ROLE_ICONS: Record<Role, typeof HeartHandshake> = {
  volunteer: HeartHandshake,
  ngo: Building2,
  college: GraduationCap,
  company: Users2,
  government: Landmark,
};

export const CATEGORIES = [
  { value: 'education', label: 'Education', color: 'blue' },
  { value: 'healthcare', label: 'Healthcare', color: 'red' },
  { value: 'environment', label: 'Environment', color: 'green' },
  { value: 'food', label: 'Food', color: 'amber' },
  { value: 'disaster_relief', label: 'Disaster Relief', color: 'orange' },
  { value: 'digital_literacy', label: 'Digital Literacy', color: 'cyan' },
  { value: 'women_empowerment', label: 'Women Empowerment', color: 'pink' },
  { value: 'rural_development', label: 'Rural Development', color: 'emerald' },
] as const;

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.value, c]));

export const SKILL_OPTIONS = [
  'Teaching', 'Communication', 'First Aid', 'Medical', 'Engineering',
  'Photography', 'Writing', 'Social Media', 'Project Management',
  'Web Development', 'Graphic Design', 'Data Analysis', 'Public Speaking',
  'Event Management', 'Counseling', 'Logistics', 'Driving', 'Cooking',
  'Translation', 'Legal Aid', 'Accounting', 'Training',
];

export const LANGUAGE_OPTIONS = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam',
  'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Urdu', 'Spanish', 'French',
];

export const INTEREST_OPTIONS = [
  'Education', 'Healthcare', 'Environment', 'Food Security',
  'Disaster Relief', 'Technology', 'Women Rights', 'Child Welfare',
  'Rural Development', 'Urban Planning', 'Animal Welfare', 'Arts & Culture',
];
