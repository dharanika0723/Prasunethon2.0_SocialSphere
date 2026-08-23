import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, Target, X, Brain } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Campaign, type Profile } from '@/lib/supabase';
import { CATEGORIES, CATEGORY_MAP } from '@/lib/constants';
import { calculateMatchScore, getMatchColor } from '@/lib/ai';
import { LoadingState, EmptyState, Badge, ProgressRing } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export default function DiscoverPage() {
  const { profile } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [skill, setSkill] = useState('');

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('campaigns')
      .select('*, organization:profiles!campaigns_organization_id_fkey(*)')
      .in('status', ['published', 'ongoing'])
      .order('created_at', { ascending: false });
    setCampaigns((data as Campaign[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const scoredCampaigns = useMemo(() => {
    if (!profile) return [];
    return campaigns.map(c => {
      const match = calculateMatchScore(profile, c);
      return { ...c, matchScore: match.score, matchReasons: match.reasons };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [campaigns, profile]);

  const filtered = scoredCampaigns.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && c.category !== category) return false;
    if (location && !c.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (skill && !c.required_skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))) return false;
    return true;
  });

  if (loading) return <LoadingState text="Finding campaigns matched to you..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-ink">Discover Campaigns</h2>
        <p className="text-gray-500 text-sm mt-1">AI-ranked opportunities matched to your profile.</p>
      </div>

      {/* Search & filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-10" placeholder="Search campaigns..." />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="input-field lg:w-48">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)}
            className="input-field lg:w-40" placeholder="Location" />
          <input type="text" value={skill} onChange={e => setSkill(e.target.value)}
            className="input-field lg:w-40" placeholder="Skill" />
          {(search || category || location || skill) && (
            <button onClick={() => { setSearch(''); setCategory(''); setLocation(''); setSkill(''); }}
              className="btn-ghost text-sm"><X className="w-4 h-4" /> Clear</button>
          )}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState icon={Target} title="No campaigns found"
          description="Try adjusting your filters or check back later for new opportunities." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(c => {
            const cat = CATEGORY_MAP[c.category] ?? { label: c.category, color: 'blue' };
            const matchInfo = getMatchColor(c.matchScore);
            return (
              <Link key={c.id} to={`/app/campaigns/${c.id}`}
                className="card p-5 hover:shadow-soft transition-all hover:-translate-y-0.5 group">
                <div className="flex items-start gap-4">
                  <ProgressRing value={c.matchScore} size={64} stroke={7} color={c.matchScore >= 85 ? '#22c55e' : c.matchScore >= 70 ? '#2563eb' : '#f59e0b'}
                    label={<div className="text-center"><span className="text-sm font-bold text-ink">{c.matchScore}%</span></div>} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-ink group-hover:text-primary-600 transition-colors line-clamp-2">{c.title}</h3>
                    </div>
                    <div className={`text-xs font-medium ${matchInfo.color} mb-2 flex items-center gap-1`}>
                      <Brain className="w-3 h-3" /> {matchInfo.label}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-3 mb-3">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.location}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(c.start_date)}</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge color="blue">{cat.label}</Badge>
                      {c.required_skills.slice(0, 2).map(s => <Badge key={s} color="gray">{s}</Badge>)}
                      {c.required_skills.length > 2 && <Badge color="gray">+{c.required_skills.length - 2}</Badge>}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
