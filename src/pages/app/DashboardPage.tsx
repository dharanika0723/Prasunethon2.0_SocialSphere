import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Target, Users, Clock, TrendingUp, Award, AlertTriangle, Sparkles,
  ArrowRight, CheckCircle2, Calendar, MapPin, MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Campaign, type Application, type Emergency, type Notification } from '@/lib/supabase';
import { StatCard, EmptyState, LoadingState, ProgressBar, Badge } from '@/components/ui';
import { ROLE_LABELS, CATEGORY_MAP } from '@/lib/constants';
import { timeAgo } from '@/lib/utils';

export default function DashboardPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ campaigns: 0, applications: 0, activeEmergencies: 0, hours: 0 });
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recommendations, setRecommendations] = useState<Campaign[]>([]);

  const loadDashboard = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const isOrg = profile.role !== 'volunteer';

    const queries = [
      supabase.from('campaigns').select('*, organization:profiles!campaigns_organization_id_fkey(*)')
        .eq(isOrg ? 'organization_id' : 'status', isOrg ? profile.id : 'published')
        .order('created_at', { ascending: false }).limit(5),
    ] as const;

    const [campRes] = await Promise.all(queries);
    const allCampaigns = (campRes.data as Campaign[]) ?? [];
    setRecentCampaigns(allCampaigns);

    if (isOrg) {
      const campIds = allCampaigns.map(c => c.id);
      const { data: apps } = await supabase.from('applications').select('*, campaign:campaigns(*), volunteer:profiles(*)')
        .in('campaign_id', campIds).order('applied_at', { ascending: false }).limit(5);
      setRecentApps((apps as Application[]) ?? []);
      setStats(prev => ({ ...prev, campaigns: allCampaigns.length, applications: (apps as Application[])?.length ?? 0 }));
    } else {
      const { data: myApps } = await supabase.from('applications').select('*, campaign:campaigns(*)')
        .eq('volunteer_id', profile.id).order('applied_at', { ascending: false }).limit(5);
      setRecentApps((myApps as Application[]) ?? []);
      setRecommendations(allCampaigns.slice(0, 3));
      setStats(prev => ({
        ...prev,
        campaigns: (myApps as Application[])?.filter(a => a.status === 'accepted' || a.status === 'completed').length ?? 0,
        applications: (myApps as Application[])?.length ?? 0,
        hours: Number(profile.volunteer_hours) || 0,
      }));
    }

    const { data: emgs } = await supabase.from('emergencies').select('*, organization:profiles(*)')
      .eq('status', 'active').order('created_at', { ascending: false }).limit(3);
    setEmergencies((emgs as Emergency[]) ?? []);

    const { data: notifs } = await supabase.from('notifications').select('*')
      .eq('user_id', profile.id).order('created_at', { ascending: false }).limit(5);
    setNotifications((notifs as Notification[]) ?? []);

    setLoading(false);
  }, [profile]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  if (loading) return <LoadingState text="Loading your dashboard..." />;
  if (!profile) return null;

  const isVolunteer = profile.role === 'volunteer';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink">Welcome back, {profile.full_name?.split(' ')[0] || 'there'}!</h2>
          <p className="text-gray-500 text-sm mt-1">
            {isVolunteer
              ? "Here's your impact overview and latest opportunities."
              : `Manage your campaigns and volunteers from your ${ROLE_LABELS[profile.role]} dashboard.`}
          </p>
        </div>
        {!isVolunteer && (
          <Link to="/app/campaigns/create" className="btn-primary text-sm">
            <Sparkles className="w-4 h-4" /> Create Campaign
          </Link>
        )}
        {isVolunteer && (
          <Link to="/app/discover" className="btn-primary text-sm">
            <Target className="w-4 h-4" /> Discover Campaigns
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} label={isVolunteer ? "Active Campaigns" : "Total Campaigns"} value={stats.campaigns} color="primary" />
        <StatCard icon={Users} label={isVolunteer ? "Applications Sent" : "Applications"} value={stats.applications} color="secondary" />
        <StatCard icon={Clock} label="Volunteer Hours" value={isVolunteer ? `${stats.hours}h` : `${profile.volunteer_hours}h`} color="accent" />
        <StatCard icon={TrendingUp} label="Impact Score" value={profile.impact_score} color="primary" trend={isVolunteer ? getLevel(profile.impact_score) : undefined} />
      </div>

      {/* Emergency banner */}
      {emergencies.length > 0 && (
        <div className="rounded-2xl bg-error-50 border border-error-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-error-600" />
            <h3 className="font-semibold text-error-800">Active Emergencies</h3>
            <Link to="/app/emergency" className="ml-auto text-sm text-error-600 font-medium hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {emergencies.map(e => (
              <Link key={e.id} to="/app/emergency" className="flex items-center gap-3 bg-white rounded-xl p-3 hover:shadow-card transition-shadow">
                <div className="w-9 h-9 rounded-lg bg-error-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-error-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{e.title}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.location} · {e.people_affected} affected</p>
                </div>
                <Badge color="red">{e.urgency}</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent campaigns / activities */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink">{isVolunteer ? 'Recommended for You' : 'Your Campaigns'}</h3>
              <Link to="/app/campaigns" className="text-sm text-primary-600 font-medium hover:underline">View all</Link>
            </div>
            {recentCampaigns.length === 0 ? (
              <EmptyState icon={Target} title="No campaigns yet"
                description={isVolunteer ? "Discover campaigns matched to your profile." : "Create your first campaign to get started."}
                action={<Link to={isVolunteer ? '/app/discover' : '/app/campaigns/create'} className="btn-primary text-sm">
                  {isVolunteer ? 'Discover' : 'Create Campaign'} <ArrowRight className="w-4 h-4" />
                </Link>} />
            ) : (
              <div className="space-y-3">
                {recentCampaigns.map(c => {
                  const cat = CATEGORY_MAP[c.category] ?? { label: c.category, color: 'blue' };
                  return (
                    <Link key={c.id} to={`/app/campaigns/${c.id}`}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className={`w-11 h-11 rounded-xl bg-${cat.color}-50 flex items-center justify-center shrink-0`}>
                        <Target className={`w-5 h-5 text-${cat.color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{c.title}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {c.location} · <Calendar className="w-3 h-3" /> {c.start_date || 'TBD'}
                        </p>
                      </div>
                      <Badge color={c.status === 'published' ? 'green' : c.status === 'completed' ? 'gray' : 'amber'}>
                        {c.status}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Applications */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink">{isVolunteer ? 'My Applications' : 'Recent Applications'}</h3>
              <Link to={isVolunteer ? '/app/applications' : '/app/volunteers'} className="text-sm text-primary-600 font-medium hover:underline">View all</Link>
            </div>
            {recentApps.length === 0 ? (
              <EmptyState icon={Users} title="No applications"
                description={isVolunteer ? "Apply to campaigns to track your participation." : "Applications from volunteers will appear here."} />
            ) : (
              <div className="space-y-2">
                {recentApps.map(a => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{a.campaign?.title || 'Campaign'}</p>
                      <p className="text-xs text-gray-500">{timeAgo(a.applied_at)}</p>
                    </div>
                    {isVolunteer && a.match_score > 0 && (
                      <span className="text-sm font-bold text-secondary-600">{a.match_score}%</span>
                    )}
                    <Badge color={a.status === 'accepted' ? 'green' : a.status === 'pending' ? 'amber' : a.status === 'completed' ? 'blue' : 'red'}>
                      {a.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: impact + notifications */}
        <div className="space-y-6">
          {isVolunteer && (
            <div className="card p-5">
              <h3 className="font-semibold text-ink mb-4">Impact Score</h3>
              <div className="text-center mb-4">
                <p className="text-4xl font-bold gradient-text">{profile.impact_score}</p>
                <p className="text-sm text-gray-500 mt-1">{getLevel(profile.impact_score)} Level</p>
              </div>
              <ProgressBar value={profile.impact_score} max={1200} color="primary" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{getLevel(profile.impact_score)}</span>
                <span>Next: {getNextLevel(profile.impact_score)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center"><p className="text-lg font-bold text-ink">{profile.campaigns_completed}</p><p className="text-xs text-gray-500">Done</p></div>
                <div className="text-center"><p className="text-lg font-bold text-ink">{Math.round(Number(profile.volunteer_hours))}h</p><p className="text-xs text-gray-500">Hours</p></div>
                <div className="text-center"><p className="text-lg font-bold text-ink">{profile.people_impacted}</p><p className="text-xs text-gray-500">Impacted</p></div>
              </div>
              <Link to="/app/impact" className="btn-secondary w-full mt-4 text-sm">View Full Impact <ArrowRight className="w-4 h-4" /></Link>
            </div>
          )}

          <div className="card p-5">
            <h3 className="font-semibold text-ink mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary-500" /> Notifications</h3>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No notifications</p>
            ) : (
              <div className="space-y-2">
                {notifications.map(n => (
                  <div key={n.id} className={`p-3 rounded-xl ${!n.read ? 'bg-primary-50' : 'bg-gray-50'}`}>
                    <p className="text-sm font-medium text-ink">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getLevel(score: number): string {
  if (score >= 1200) return 'Diamond';
  if (score >= 800) return 'Platinum';
  if (score >= 500) return 'Gold';
  if (score >= 200) return 'Silver';
  return 'Bronze';
}

function getNextLevel(score: number): string {
  if (score >= 1200) return 'Max';
  if (score >= 800) return 'Diamond';
  if (score >= 500) return 'Platinum';
  if (score >= 200) return 'Gold';
  return 'Silver';
}
