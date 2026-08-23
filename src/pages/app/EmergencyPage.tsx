import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, MapPin, Users, Plus, X, Activity, Clock, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase, type Emergency } from '@/lib/supabase';
import { LoadingState, EmptyState, Badge, Avatar } from '@/components/ui';
import { timeAgo } from '@/lib/utils';

const EMERGENCY_TYPES = [
  { value: 'flood', label: 'Flood', color: 'blue' },
  { value: 'cyclone', label: 'Cyclone', color: 'blue' },
  { value: 'fire', label: 'Fire', color: 'red' },
  { value: 'medical', label: 'Medical Emergency', color: 'red' },
  { value: 'food_shortage', label: 'Food Shortage', color: 'amber' },
  { value: 'disaster_relief', label: 'Disaster Relief', color: 'amber' },
];

const URGENCY_COLORS = { moderate: 'amber', high: 'amber', critical: 'red' } as const;

export default function EmergencyPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'flood', title: '', description: '', location: '', urgency: 'high' as 'moderate' | 'high' | 'critical', people_affected: 100, required_volunteers: 20, resources: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('emergencies').select('*, organization:profiles(*)').order('created_at', { ascending: false });
    setEmergencies((data as Emergency[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const { error } = await supabase.from('emergencies').insert({
      organization_id: profile.id,
      type: form.type, title: form.title, description: form.description,
      location: form.location, urgency: form.urgency,
      people_affected: form.people_affected, required_volunteers: form.required_volunteers,
      required_resources: form.resources.split(',').map(r => r.trim()).filter(Boolean),
      status: 'active',
    });
    if (error) { toast(error.message, 'error'); return; }
    toast('Emergency alert published!', 'success');
    setShowForm(false);
    setForm({ type: 'flood', title: '', description: '', location: '', urgency: 'high', people_affected: 100, required_volunteers: 20, resources: '' });
    load();
  };

  const handleResolve = async (id: string) => {
    const { error } = await supabase.from('emergencies').update({ status: 'resolved' }).eq('id', id);
    if (error) { toast(error.message, 'error'); return; }
    toast('Emergency marked as resolved', 'success');
    load();
  };

  const isOrg = profile?.role !== 'volunteer';
  if (loading) return <LoadingState text="Loading emergencies..." />;

  const activeCount = emergencies.filter(e => e.status === 'active').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink flex items-center gap-2">Emergency Response {activeCount > 0 && <span className="w-3 h-3 bg-error-500 rounded-full animate-pulse-soft" />}</h2>
          <p className="text-gray-500 text-sm mt-1">Urgent community needs requiring immediate volunteer response.</p>
        </div>
        {isOrg && <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm bg-error-600 hover:bg-error-700 hover:shadow-glow">{showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Publish Alert</>}</button>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4 border-error-200">
          <h3 className="font-semibold text-ink flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-error-600" /> Publish Emergency Alert</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-ink mb-1.5">Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-field">{EMERGENCY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-ink mb-1.5">Urgency</label><select value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value as 'moderate' | 'high' | 'critical' })} className="input-field"><option value="moderate">Moderate</option><option value="high">High</option><option value="critical">Critical</option></select></div>
          </div>
          <div><label className="block text-sm font-medium text-ink mb-1.5">Title</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="e.g., Flash Flood in Karur District" /></div>
          <div><label className="block text-sm font-medium text-ink mb-1.5">Description</label><textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field min-h-[80px]" /></div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-ink mb-1.5">Location</label><input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-ink mb-1.5">People Affected</label><input type="number" min={1} value={form.people_affected} onChange={e => setForm({ ...form, people_affected: parseInt(e.target.value) || 1 })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-ink mb-1.5">Volunteers Needed</label><input type="number" min={1} value={form.required_volunteers} onChange={e => setForm({ ...form, required_volunteers: parseInt(e.target.value) || 1 })} className="input-field" /></div>
          </div>
          <div><label className="block text-sm font-medium text-ink mb-1.5">Required Resources (comma-separated)</label><input value={form.resources} onChange={e => setForm({ ...form, resources: e.target.value })} className="input-field" placeholder="Food packets, blankets, medical kits" /></div>
          <button type="submit" className="btn-primary bg-error-600 hover:bg-error-700">Publish Emergency Alert</button>
        </form>
      )}

      {emergencies.length === 0 ? (
        <EmptyState icon={Shield} title="No emergencies reported" description="All clear. Emergency alerts will appear here when published by organizations." />
      ) : (
        <div className="space-y-4">
          {emergencies.map(e => {
            const typeInfo = EMERGENCY_TYPES.find(t => t.value === e.type) ?? { label: e.type, color: 'red' };
            return (
              <div key={e.id} className={`card p-5 ${e.status === 'active' ? 'border-l-4 border-l-error-500' : 'opacity-75'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${e.status === 'active' ? 'bg-error-100' : 'bg-gray-100'} flex items-center justify-center shrink-0`}>
                    <AlertTriangle className={`w-6 h-6 ${e.status === 'active' ? 'text-error-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-ink">{e.title}</h3>
                      <Badge color="red">{typeInfo.label}</Badge>
                      <Badge color={URGENCY_COLORS[e.urgency]}>{e.urgency} urgency</Badge>
                      <Badge color={e.status === 'active' ? 'red' : 'gray'}>{e.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{e.description}</p>
                    <div className="grid sm:grid-cols-3 gap-3 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500"><MapPin className="w-4 h-4" /> {e.location}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-500"><Users className="w-4 h-4" /> {e.people_affected} affected</div>
                      <div className="flex items-center gap-2 text-sm text-gray-500"><Clock className="w-4 h-4" /> {timeAgo(e.created_at)}</div>
                    </div>
                    {e.required_resources.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {e.required_resources.map(r => <span key={r} className="badge bg-accent-50 text-accent-700">{r}</span>)}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Avatar name={e.organization?.full_name || 'Org'} src={e.organization?.avatar_url} size="sm" />
                        <span className="text-sm text-gray-500">{e.organization?.organization_name || e.organization?.full_name}</span>
                      </div>
                      <div className="flex gap-2">
                        {e.status === 'active' && e.campaign_id && <Link to={`/app/campaigns/${e.campaign_id}`} className="btn-secondary text-sm">Join Response</Link>}
                        {e.status === 'active' && !e.campaign_id && <Link to="/app/discover" className="btn-secondary text-sm">Find Opportunities</Link>}
                        {isOrg && e.organization_id === profile?.id && e.status === 'active' && (
                          <button onClick={() => handleResolve(e.id)} className="btn-ghost text-sm text-secondary-600">Mark Resolved</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
