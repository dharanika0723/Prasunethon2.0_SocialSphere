import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, CheckCircle2, XCircle, Target, Award } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Application } from '@/lib/supabase';
import { LoadingState, EmptyState, Badge } from '@/components/ui';
import { timeAgo } from '@/lib/utils';

export default function ApplicationsPage() {
  const { profile } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const { data } = await supabase.from('applications')
      .select('*, campaign:campaigns(*)')
      .eq('volunteer_id', profile.id)
      .order('applied_at', { ascending: false });
    setApplications((data as Application[]) ?? []);
    setLoading(false);
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  if (loading) return <LoadingState text="Loading applications..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-ink">My Applications</h2>
        <p className="text-gray-500 text-sm mt-1">Track the status of your campaign applications.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-thin">
        {['all', 'pending', 'accepted', 'rejected', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all capitalize ${filter === f ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}>
            {f}
            {f !== 'all' && <span className="ml-1.5 text-xs opacity-70">({applications.filter(a => a.status === f).length})</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No applications yet"
          description="Apply to campaigns to track your participation here."
          action={<Link to="/app/discover" className="btn-primary text-sm"><Target className="w-4 h-4" /> Discover Campaigns</Link>} />
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.id} className="card p-4">
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  a.status === 'accepted' ? 'bg-secondary-50' : a.status === 'pending' ? 'bg-accent-50' : a.status === 'completed' ? 'bg-primary-50' : 'bg-error-50'
                }`}>
                  {a.status === 'accepted' ? <CheckCircle2 className="w-5 h-5 text-secondary-600" /> :
                   a.status === 'pending' ? <Clock className="w-5 h-5 text-accent-600" /> :
                   a.status === 'completed' ? <Award className="w-5 h-5 text-primary-600" /> :
                   <XCircle className="w-5 h-5 text-error-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/app/campaigns/${a.campaign_id}`}>
                    <h3 className="font-semibold text-ink hover:text-primary-600 transition-colors truncate">{a.campaign?.title}</h3>
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">Applied {timeAgo(a.applied_at)}</p>
                  {a.match_score > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-bold text-secondary-600">{a.match_score}% Match</span>
                      {a.match_reasons.length > 0 && <span className="text-xs text-gray-500 truncate">{a.match_reasons[0]}</span>}
                    </div>
                  )}
                </div>
                <Badge color={a.status === 'accepted' ? 'green' : a.status === 'pending' ? 'amber' : a.status === 'completed' ? 'blue' : 'red'}>{a.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
