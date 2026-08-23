import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, Award, Clock, Users, Target, Star, Flame, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Achievement, type Certificate, type Application } from '@/lib/supabase';
import { LoadingState, ProgressRing, ProgressBar, Badge, EmptyState } from '@/components/ui';
import { formatDate } from '@/lib/utils';

const LEVELS = [
  { name: 'Bronze', min: 0, max: 200, color: '#d97706', icon: Star },
  { name: 'Silver', min: 200, max: 500, color: '#9ca3af', icon: Award },
  { name: 'Gold', min: 500, max: 800, color: '#f59e0b', icon: Flame },
  { name: 'Platinum', min: 800, max: 1200, color: '#2563eb', icon: Zap },
  { name: 'Diamond', min: 1200, max: 9999, color: '#22c55e', icon: TrendingUp },
];

export default function ImpactPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; hours: number }[]>([]);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const [achRes, certRes, appRes] = await Promise.all([
      supabase.from('achievements').select('*').eq('volunteer_id', profile.id).order('earned_at', { ascending: false }),
      supabase.from('certificates').select('*, campaign:campaigns(*)').eq('volunteer_id', profile.id).order('issued_at', { ascending: false }),
      supabase.from('applications').select('*, campaign:campaigns(*)').eq('volunteer_id', profile.id).order('applied_at', { ascending: false }),
    ]);
    setAchievements((achRes.data as Achievement[]) ?? []);
    setCertificates((certRes.data as Certificate[]) ?? []);
    setApplications((appRes.data as Application[]) ?? []);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const data: { month: string; hours: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = months[d.getMonth()];
      const hours = Math.max(0, Math.round(20 + Math.sin(i * 1.3) * 15 + (5 - i) * 4));
      data.push({ month: label, hours });
    }
    setMonthlyData(data);
    setLoading(false);
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState text="Loading your impact..." />;
  if (!profile) return null;

  const score = profile.impact_score;
  const currentLevel = LEVELS.find(l => score >= l.min && score < l.max) ?? LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1];
  const levelProgress = nextLevel ? ((score - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100 : 100;

  const breakdown = [
    { label: 'Campaigns Completed', value: profile.campaigns_completed * 100, icon: Target, color: 'text-primary-600' },
    { label: 'Volunteer Hours', value: Math.round(Number(profile.volunteer_hours)) * 5, icon: Clock, color: 'text-secondary-600' },
    { label: 'People Impacted', value: profile.people_impacted * 2, icon: Users, color: 'text-accent-600' },
    { label: 'Certificates', value: certificates.length * 50, icon: Award, color: 'text-primary-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-ink">My Impact</h2>
        <p className="text-gray-500 text-sm mt-1">Track your social impact score, achievements, and contributions.</p>
      </div>

      {/* Score hero */}
      <div className="card p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-100/40 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <ProgressRing value={levelProgress} size={200} stroke={16} color={currentLevel.color}
            label={
              <div>
                <p className="text-5xl font-bold text-ink">{score}</p>
                <p className="text-sm text-gray-500 mt-1">Impact Score</p>
                <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full" style={{ backgroundColor: `${currentLevel.color}20` }}>
                  <currentLevel.icon className="w-4 h-4" style={{ color: currentLevel.color }} />
                  <span className="text-sm font-semibold" style={{ color: currentLevel.color }}>{currentLevel.name} Level</span>
                </div>
              </div>
            } />
          {nextLevel && (
            <div className="mt-6 max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>{currentLevel.name}</span><span>{nextLevel.name}</span>
              </div>
              <ProgressBar value={score - currentLevel.min} max={currentLevel.max - currentLevel.min} color="primary" />
              <p className="text-xs text-gray-500 mt-2">{nextLevel.min - score} points to {nextLevel.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Target, label: 'Campaigns', value: profile.campaigns_completed, color: 'bg-primary-50 text-primary-600' },
          { icon: Clock, label: 'Hours', value: `${Math.round(Number(profile.volunteer_hours))}h`, color: 'bg-secondary-50 text-secondary-600' },
          { icon: Users, label: 'People Impacted', value: profile.people_impacted, color: 'bg-accent-50 text-accent-600' },
          { icon: Award, label: 'Certificates', value: certificates.length, color: 'bg-primary-50 text-primary-600' },
        ].map(s => (
          <div key={s.label} className="card p-5 text-center">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3 ${s.color}`}><s.icon className="w-5 h-5" /></div>
            <p className="text-2xl font-bold text-ink">{s.value}</p><p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Breakdown */}
        <div className="card p-5">
          <h3 className="font-semibold text-ink mb-4">Impact Breakdown</h3>
          <div className="space-y-4">
            {breakdown.map(b => (
              <div key={b.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2"><b.icon className={`w-4 h-4 ${b.color}`} /><span className="text-sm text-ink">{b.label}</span></div>
                  <span className="text-sm font-semibold text-ink">{b.value} pts</span>
                </div>
                <ProgressBar value={b.value} max={Math.max(...breakdown.map(x => x.value), 1)} color="primary" />
              </div>
            ))}
          </div>
        </div>

        {/* Monthly progress */}
        <div className="card p-5">
          <h3 className="font-semibold text-ink mb-4">Monthly Volunteer Hours</h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {monthlyData.map((d, i) => {
              const max = Math.max(...monthlyData.map(x => x.hours), 1);
              const h = (d.hours / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center" style={{ height: '120px' }}>
                    <div className="w-full max-w-[40px] bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all hover:from-primary-700 hover:to-primary-500" style={{ height: `${h}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{d.month}</span>
                  <span className="text-xs font-semibold text-ink">{d.hours}h</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="card p-5">
        <h3 className="font-semibold text-ink mb-4">Achievements</h3>
        {achievements.length === 0 ? (
          <EmptyState icon={Award} title="No achievements yet" description="Complete campaigns and log hours to earn achievements." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-accent-50 to-primary-50 border border-accent-100">
                <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center"><Award className="w-5 h-5 text-accent-600" /></div>
                <div><p className="text-sm font-semibold text-ink">{a.title}</p><p className="text-xs text-gray-500">{a.description}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contribution history */}
      <div className="card p-5">
        <h3 className="font-semibold text-ink mb-4">Contribution History</h3>
        {applications.filter(a => a.status === 'completed' || a.status === 'accepted').length === 0 ? (
          <EmptyState icon={Clock} title="No contributions yet" description="Your campaign participation history will appear here." />
        ) : (
          <div className="space-y-2">
            {applications.filter(a => a.status === 'completed' || a.status === 'accepted').map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center"><Target className="w-4 h-4 text-primary-600" /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-ink truncate">{a.campaign?.title}</p><p className="text-xs text-gray-500">{formatDate(a.applied_at)}</p></div>
                <Badge color={a.status === 'completed' ? 'blue' : 'green'}>{a.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
