import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Calendar, Users, Target, Brain, ArrowLeft, CheckCircle2,
  Clock, Building2, Edit, Trash2, Send, X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase, type Campaign, type Application } from '@/lib/supabase';
import { CATEGORY_MAP } from '@/lib/constants';
import { calculateMatchScore, getMatchColor } from '@/lib/ai';
import { LoadingState, EmptyState, Badge, Avatar, ProgressRing } from '@/components/ui';
import { formatDate, timeAgo } from '@/lib/utils';

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [myApplication, setMyApplication] = useState<Application | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  const loadCampaign = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data } = await supabase
      .from('campaigns')
      .select('*, organization:profiles!campaigns_organization_id_fkey(*)')
      .eq('id', id)
      .maybeSingle();
    setCampaign(data as Campaign | null);

    if (profile && data) {
      const c = data as Campaign;
      if (profile.role === 'volunteer') {
        const { data: app } = await supabase.from('applications')
          .select('*').eq('campaign_id', c.id).eq('volunteer_id', profile.id).maybeSingle();
        setMyApplication(app as Application | null);
      } else if (c.organization_id === profile.id) {
        const { data: apps } = await supabase.from('applications')
          .select('*, volunteer:profiles(*)').eq('campaign_id', c.id).order('applied_at', { ascending: false });
        setApplications((apps as Application[]) ?? []);
      }
    }
    setLoading(false);
  }, [id, profile]);

  useEffect(() => { loadCampaign(); }, [loadCampaign]);

  const handleApply = async () => {
    if (!profile || !campaign) return;
    setApplying(true);
    const match = calculateMatchScore(profile, campaign);
    const { error } = await supabase.from('applications').insert({
      campaign_id: campaign.id,
      volunteer_id: profile.id,
      match_score: match.score,
      match_reasons: match.reasons,
      status: 'pending',
    });
    setApplying(false);
    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Application submitted successfully!', 'success');
      await supabase.from('notifications').insert({
        user_id: campaign.organization_id,
        type: 'application',
        title: 'New application received',
        body: `${profile.full_name} applied to "${campaign.title}" with ${match.score}% match`,
        link: '/app/volunteers',
      });
      loadCampaign();
    }
  };

  const handleDelete = async () => {
    if (!campaign || !confirm('Delete this campaign? This cannot be undone.')) return;
    const { error } = await supabase.from('campaigns').delete().eq('id', campaign.id);
    if (error) { toast(error.message, 'error'); return; }
    toast('Campaign deleted', 'success');
    navigate('/app/campaigns');
  };

  const handleDecision = async (appId: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase.from('applications').update({ status, decision_at: new Date().toISOString() }).eq('id', appId);
    if (error) { toast(error.message, 'error'); return; }
    const app = applications.find(a => a.id === appId);
    if (app?.volunteer_id) {
      await supabase.from('notifications').insert({
        user_id: app.volunteer_id,
        type: 'application',
        title: `Application ${status}`,
        body: `Your application to "${campaign?.title}" has been ${status}.`,
        link: '/app/applications',
      });
    }
    toast(`Application ${status}`, status === 'accepted' ? 'success' : 'info');
    loadCampaign();
  };

  if (loading) return <LoadingState text="Loading campaign..." />;
  if (!campaign) return <EmptyState icon={Target} title="Campaign not found" description="This campaign may have been removed." />;

  const cat = CATEGORY_MAP[campaign.category] ?? { label: campaign.category, color: 'blue' };
  const isOwner = profile?.id === campaign.organization_id;
  const isVolunteer = profile?.role === 'volunteer';
  const match = isVolunteer && profile ? calculateMatchScore(profile, campaign) : null;
  const matchInfo = match ? getMatchColor(match.score) : null;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <Link to="/app/campaigns" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-ink">
        <ArrowLeft className="w-4 h-4" /> Back to Campaigns
      </Link>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge color="blue">{cat.label}</Badge>
              <Badge color={campaign.status === 'published' ? 'green' : campaign.status === 'completed' ? 'gray' : 'amber'}>{campaign.status}</Badge>
              {campaign.campaign_type === 'emergency' && <Badge color="red"><Target className="w-3 h-3" /> Emergency</Badge>}
              {campaign.campaign_type === 'csr' && <Badge color="accent">CSR</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-ink mb-2">{campaign.title}</h1>
            <p className="text-gray-600">{campaign.goal}</p>
          </div>
          {isOwner && (
            <div className="flex gap-2 shrink-0">
              <Link to={`/app/campaigns/create?id=${campaign.id}`} className="btn-ghost text-sm"><Edit className="w-4 h-4" /> Edit</Link>
              <button onClick={handleDelete} className="btn-ghost text-sm text-error-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
        </div>

        {/* Match score for volunteers */}
        {isVolunteer && match && matchInfo && (
          <div className="flex items-center gap-4 bg-primary-50 rounded-xl p-4 mb-4">
            <ProgressRing value={match.score} size={72} stroke={8} color={match.score >= 85 ? '#22c55e' : match.score >= 70 ? '#2563eb' : '#f59e0b'}
              label={<span className="text-lg font-bold text-ink">{match.score}%</span>} />
            <div>
              <p className={`font-semibold ${matchInfo.color} flex items-center gap-1`}><Brain className="w-4 h-4" /> {matchInfo.label}</p>
              <ul className="text-sm text-gray-600 mt-1 space-y-0.5">
                {match.reasons.slice(0, 2).map((r, i) => <li key={i}>• {r}</li>)}
              </ul>
            </div>
          </div>
        )}

        <p className="text-gray-700 leading-relaxed mb-4">{campaign.description}</p>

        {/* Info grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <InfoItem icon={MapPin} label="Location" value={campaign.location} />
          <InfoItem icon={Calendar} label="Start Date" value={formatDate(campaign.start_date)} />
          <InfoItem icon={Calendar} label="End Date" value={formatDate(campaign.end_date)} />
          <InfoItem icon={Users} label="Volunteers" value={`${campaign.required_volunteers} needed`} />
        </div>

        {campaign.target_community && (
          <div className="mb-4"><p className="text-xs text-gray-500 mb-1">Target Community</p><p className="text-sm text-ink">{campaign.target_community}</p></div>
        )}

        {campaign.required_skills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-2">{campaign.required_skills.map(s => <Badge key={s} color="primary">{s}</Badge>)}</div>
          </div>
        )}
        {campaign.languages.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Languages</p>
            <div className="flex flex-wrap gap-2">{campaign.languages.map(l => <Badge key={l} color="secondary">{l}</Badge>)}</div>
          </div>
        )}

        {/* Organization */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <Avatar name={campaign.organization?.full_name || 'Organization'} src={campaign.organization?.avatar_url} />
          <div>
            <p className="text-sm font-semibold text-ink">{campaign.organization?.organization_name || campaign.organization?.full_name}</p>
            <p className="text-xs text-gray-500">{campaign.organization?.verified && <span className="text-secondary-600">Verified Organization</span>}</p>
          </div>
        </div>

        {/* Apply button */}
        {isVolunteer && !isOwner && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {myApplication ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-5 h-5 ${myApplication.status === 'accepted' ? 'text-secondary-500' : myApplication.status === 'pending' ? 'text-accent-500' : 'text-error-500'}`} />
                  <span className="text-sm font-medium text-ink">Application {myApplication.status}</span>
                </div>
                <Link to="/app/applications" className="text-sm text-primary-600 font-medium hover:underline">View status</Link>
              </div>
            ) : (
              <button onClick={handleApply} disabled={applying} className="btn-primary w-full sm:w-auto">
                {applying ? 'Applying...' : <>Apply Now <Send className="w-4 h-4" /></>}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Applications for org owner */}
      {isOwner && (
        <div className="card p-5">
          <h3 className="font-semibold text-ink mb-4">Volunteer Applications ({applications.length})</h3>
          {applications.length === 0 ? (
            <EmptyState icon={Users} title="No applications yet" description="Applications from volunteers will appear here once they apply." />
          ) : (
            <div className="space-y-3">
              {applications.map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <Avatar name={a.volunteer?.full_name || 'Volunteer'} src={a.volunteer?.avatar_url} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{a.volunteer?.full_name}</p>
                    <p className="text-xs text-gray-500">{timeAgo(a.applied_at)} · {a.match_score}% match</p>
                  </div>
                  <Badge color={a.status === 'accepted' ? 'green' : a.status === 'pending' ? 'amber' : a.status === 'completed' ? 'blue' : 'red'}>{a.status}</Badge>
                  {a.status === 'pending' && (
                    <div className="flex gap-1">
                      <button onClick={() => handleDecision(a.id, 'accepted')} className="px-3 py-1.5 text-xs font-medium text-secondary-700 bg-secondary-50 rounded-lg hover:bg-secondary-100">Accept</button>
                      <button onClick={() => handleDecision(a.id, 'rejected')} className="px-3 py-1.5 text-xs font-medium text-error-700 bg-error-50 rounded-lg hover:bg-error-100">Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-ink truncate">{value}</p>
      </div>
    </div>
  );
}
