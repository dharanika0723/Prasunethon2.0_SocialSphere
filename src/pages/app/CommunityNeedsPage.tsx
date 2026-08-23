import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, AlertCircle, Plus, X, TrendingUp, Target } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase, type CommunityNeed } from '@/lib/supabase';
import { CATEGORIES, CATEGORY_MAP } from '@/lib/constants';
import { LoadingState, EmptyState, Badge, ProgressBar } from '@/components/ui';
import { formatNumber } from '@/lib/utils';

const PRIORITY_COLORS = { low: 'gray', medium: 'blue', high: 'amber', critical: 'red' } as const;

export default function CommunityNeedsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [needs, setNeeds] = useState<CommunityNeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', location: '', category: 'education', people_affected: 100, priority: 'medium' as 'low' | 'medium' | 'high' | 'critical', actions: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('community_needs').select('*').order('created_at', { ascending: false });
    setNeeds((data as CommunityNeed[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('community_needs').insert({
      title: form.title, description: form.description, location: form.location,
      category: form.category, people_affected: form.people_affected, priority: form.priority,
      suggested_actions: form.actions.split('\n').map(a => a.trim()).filter(Boolean),
    });
    if (error) { toast(error.message, 'error'); return; }
    toast('Community need published!', 'success');
    setForm({ title: '', description: '', location: '', category: 'education', people_affected: 100, priority: 'medium', actions: '' });
    setShowForm(false);
    load();
  };

  const isOrg = profile?.role !== 'volunteer';

  if (loading) return <LoadingState text="Loading community needs..." />;

  const criticalCount = needs.filter(n => n.priority === 'critical').length;
  const totalAffected = needs.reduce((sum, n) => sum + n.people_affected, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink">Community Need Intelligence</h2>
          <p className="text-gray-500 text-sm mt-1">Identifying and prioritizing community needs across regions.</p>
        </div>
        {isOrg && <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">{showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Report Need</>}</button>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <AlertCircle className="w-6 h-6 text-error-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ink">{criticalCount}</p><p className="text-xs text-gray-500">Critical Needs</p>
        </div>
        <div className="card p-4 text-center">
          <Users className="w-6 h-6 text-primary-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ink">{formatNumber(totalAffected)}</p><p className="text-xs text-gray-500">People Affected</p>
        </div>
        <div className="card p-4 text-center">
          <Target className="w-6 h-6 text-secondary-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ink">{needs.length}</p><p className="text-xs text-gray-500">Total Needs</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <h3 className="font-semibold text-ink">Report a Community Need</h3>
          <div><label className="block text-sm font-medium text-ink mb-1.5">Title</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="e.g., Lack of clean drinking water" /></div>
          <div><label className="block text-sm font-medium text-ink mb-1.5">Description</label><textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field min-h-[80px]" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-ink mb-1.5">Location</label><input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field" placeholder="e.g., Rural Karur" /></div>
            <div><label className="block text-sm font-medium text-ink mb-1.5">Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">{CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-ink mb-1.5">People Affected</label><input type="number" min={1} value={form.people_affected} onChange={e => setForm({ ...form, people_affected: parseInt(e.target.value) || 1 })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-ink mb-1.5">Priority</label><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as 'low' | 'medium' | 'high' | 'critical' })} className="input-field"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
          </div>
          <div><label className="block text-sm font-medium text-ink mb-1.5">Suggested Actions (one per line)</label><textarea value={form.actions} onChange={e => setForm({ ...form, actions: e.target.value })} className="input-field min-h-[60px]" placeholder="Install water purifiers&#10;Organize health camp&#10;Distribute water bottles" /></div>
          <button type="submit" className="btn-primary">Publish Need</button>
        </form>
      )}

      {needs.length === 0 ? (
        <EmptyState icon={MapPin} title="No community needs reported" description="Community needs will appear here as they are identified and published." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {needs.map(n => {
            const cat = CATEGORY_MAP[n.category] ?? { label: n.category, color: 'blue' };
            return (
              <div key={n.id} className={`card p-5 border-l-4 ${n.priority === 'critical' ? 'border-l-error-500' : n.priority === 'high' ? 'border-l-accent-500' : 'border-l-primary-500'}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Badge color="blue">{cat.label}</Badge>
                    <Badge color={PRIORITY_COLORS[n.priority]}>{n.priority}</Badge>
                  </div>
                  {n.status === 'addressed' && <Badge color="green">Addressed</Badge>}
                </div>
                <h3 className="font-semibold text-ink mb-1">{n.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{n.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {n.location}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {formatNumber(n.people_affected)} affected</span>
                </div>
                {n.suggested_actions.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">Suggested Actions</p>
                    <div className="space-y-1">{n.suggested_actions.slice(0, 3).map((a, i) => <p key={i} className="text-xs text-gray-600 flex items-start gap-1.5"><TrendingUp className="w-3 h-3 text-primary-400 mt-0.5 shrink-0" /> {a}</p>)}</div>
                  </div>
                )}
                <Link to="/app/campaigns" className="text-sm text-primary-600 font-medium hover:underline mt-3 inline-block">Create campaign for this need →</Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
