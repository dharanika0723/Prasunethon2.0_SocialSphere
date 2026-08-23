import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Target, Plus, Search, MapPin, Calendar, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Campaign } from '@/lib/supabase';
import { CATEGORIES, CATEGORY_MAP } from '@/lib/constants';
import { LoadingState, EmptyState, Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export default function CampaignsPage() {
  const { profile } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadCampaigns = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const isOrg = profile.role !== 'volunteer';
    let query = supabase.from('campaigns').select('*, organization:profiles!campaigns_organization_id_fkey(*)');
    if (isOrg) {
      query = query.eq('organization_id', profile.id);
    } else {
      query = query.in('status', ['published', 'ongoing', 'completed']);
    }
    query = query.order('created_at', { ascending: false });
    const { data } = await query;
    setCampaigns((data as Campaign[]) ?? []);
    setLoading(false);
  }, [profile]);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const filtered = campaigns.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  if (loading) return <LoadingState text="Loading campaigns..." />;

  const isOrg = profile?.role !== 'volunteer';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink">{isOrg ? 'My Campaigns' : 'Browse Campaigns'}</h2>
          <p className="text-gray-500 text-sm mt-1">{isOrg ? 'Manage and track your organization\'s campaigns.' : 'Explore all active campaigns on SocialSphere.'}</p>
        </div>
        {isOrg && <Link to="/app/campaigns/create" className="btn-primary text-sm"><Plus className="w-4 h-4" /> New Campaign</Link>}
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-10" placeholder="Search campaigns..." />
        </div>
        {isOrg && (
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field sm:w-44">
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Target} title="No campaigns found"
          description={isOrg ? "Create your first campaign to start finding volunteers." : "Check back soon for new campaigns."}
          action={isOrg ? <Link to="/app/campaigns/create" className="btn-primary text-sm"><Plus className="w-4 h-4" /> Create Campaign</Link> : undefined} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => {
            const cat = CATEGORY_MAP[c.category] ?? { label: c.category, color: 'blue' };
            return (
              <Link key={c.id} to={`/app/campaigns/${c.id}`}
                className="card p-5 hover:shadow-soft transition-all hover:-translate-y-0.5 group">
                <div className="flex items-center justify-between mb-3">
                  <Badge color="blue">{cat.label}</Badge>
                  <Badge color={c.status === 'published' ? 'green' : c.status === 'completed' ? 'gray' : c.status === 'ongoing' ? 'blue' : 'amber'}>{c.status}</Badge>
                </div>
                <h3 className="font-semibold text-ink group-hover:text-primary-600 transition-colors mb-2 line-clamp-2">{c.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{c.description}</p>
                <div className="space-y-1.5 text-xs text-gray-500">
                  <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.location}</p>
                  <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(c.start_date)} — {formatDate(c.end_date)}</p>
                  <p className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.required_volunteers} volunteers needed</p>
                </div>
                {c.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
                    {c.required_skills.slice(0, 3).map(s => <Badge key={s} color="gray">{s}</Badge>)}
                    {c.required_skills.length > 3 && <Badge color="gray">+{c.required_skills.length - 3}</Badge>}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
