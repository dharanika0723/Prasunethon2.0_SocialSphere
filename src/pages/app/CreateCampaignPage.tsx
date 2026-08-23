import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ArrowLeft, Check, Edit3, Save, Wand2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase, type Campaign } from '@/lib/supabase';
import { CATEGORIES, SKILL_OPTIONS, LANGUAGE_OPTIONS } from '@/lib/constants';
import { generateCampaignPlan, type GeneratedCampaign } from '@/lib/ai';
import { LoadingState } from '@/components/ui';

export default function CreateCampaignPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  const [step, setStep] = useState<'input' | 'generated' | 'review'>('input');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedCampaign | null>(null);

  const [form, setForm] = useState({
    goal: '',
    location: '',
    targetCommunity: '',
    requiredVolunteers: 10,
    skills: [] as string[],
    duration: '4 weeks',
    category: 'education',
    languages: [] as string[],
    campaignType: 'standard' as 'standard' | 'emergency' | 'csr',
  });

  const [final, setFinal] = useState({
    title: '',
    description: '',
    required_skills: [] as string[],
    start_date: '',
    end_date: '',
    image_url: '',
  });

  const loadCampaign = useCallback(async () => {
    if (!editId) return;
    setLoading(true);
    const { data } = await supabase.from('campaigns').select('*').eq('id', editId).maybeSingle();
    if (data) {
      const c = data as Campaign;
      setForm({
        goal: c.goal,
        location: c.location,
        targetCommunity: c.target_community,
        requiredVolunteers: c.required_volunteers,
        skills: c.required_skills,
        duration: '4 weeks',
        category: c.category,
        languages: c.languages,
        campaignType: c.campaign_type,
      });
      setFinal({
        title: c.title,
        description: c.description,
        required_skills: c.required_skills,
        start_date: c.start_date ?? '',
        end_date: c.end_date ?? '',
        image_url: c.image_url ?? '',
      });
      setStep('review');
    }
    setLoading(false);
  }, [editId]);

  useEffect(() => { loadCampaign(); }, [loadCampaign]);

  const handleGenerate = () => {
    if (!form.goal || !form.location || !form.targetCommunity) {
      toast('Please fill in goal, location, and target community.', 'error');
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      const plan = generateCampaignPlan({
        goal: form.goal,
        location: form.location,
        targetCommunity: form.targetCommunity,
        requiredVolunteers: form.requiredVolunteers,
        skills: form.skills,
        duration: form.duration,
      });
      setGenerated(plan);
      setFinal({
        title: plan.title,
        description: plan.description,
        required_skills: plan.required_skills,
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        image_url: '',
      });
      setGenerating(false);
      setStep('generated');
    }, 1200);
  };

  const handlePublish = async (status: 'draft' | 'published') => {
    if (!profile) return;
    if (!final.title || !final.description) {
      toast('Title and description are required.', 'error');
      return;
    }
    setLoading(true);
    const payload = {
      organization_id: profile.id,
      title: final.title,
      description: final.description,
      goal: form.goal,
      category: form.category,
      location: form.location,
      target_community: form.targetCommunity,
      required_volunteers: form.requiredVolunteers,
      required_skills: final.required_skills,
      languages: form.languages,
      start_date: final.start_date || null,
      end_date: final.end_date || null,
      status,
      campaign_type: form.campaignType,
      image_url: final.image_url || null,
    };

    if (editId) {
      const { error } = await supabase.from('campaigns').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editId);
      setLoading(false);
      if (error) { toast(error.message, 'error'); return; }
      toast(status === 'published' ? 'Campaign updated and published!' : 'Campaign saved as draft.', 'success');
      navigate(`/app/campaigns/${editId}`);
    } else {
      const { data, error } = await supabase.from('campaigns').insert(payload).select().single();
      setLoading(false);
      if (error) { toast(error.message, 'error'); return; }
      toast(status === 'published' ? 'Campaign published!' : 'Campaign saved as draft.', 'success');
      navigate(`/app/campaigns/${data.id}`);
    }
  };

  if (loading) return <LoadingState text="Loading campaign..." />;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <Link to="/app/campaigns" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-ink">
        <ArrowLeft className="w-4 h-4" /> Back to Campaigns
      </Link>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-ink">{editId ? 'Edit Campaign' : 'AI Campaign Planner'}</h2>
          <p className="text-gray-500 text-sm">Tell us your goal and let AI generate a complete campaign plan.</p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {['input', 'generated', 'review'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step === s || (i === 0 && step !== 'input') || (i === 1 && step === 'review')
                ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {(i === 0 && step !== 'input') || (i === 1 && step === 'review') ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            {i < 2 && <div className="w-8 h-0.5 bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Step 1: Input */}
      {step === 'input' && (
        <div className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Campaign Goal *</label>
            <textarea value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}
              className="input-field min-h-[80px]" placeholder="e.g., Teach digital skills to rural women in Karur" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Location *</label>
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                className="input-field" placeholder="e.g., Karur, Tamil Nadu" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Target Community *</label>
              <input value={form.targetCommunity} onChange={e => setForm({ ...form, targetCommunity: e.target.value })}
                className="input-field" placeholder="e.g., Rural Women" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Campaign Type</label>
              <select value={form.campaignType} onChange={e => setForm({ ...form, campaignType: e.target.value as 'standard' | 'emergency' | 'csr' })} className="input-field">
                <option value="standard">Standard</option>
                <option value="csr">CSR Initiative</option>
                <option value="emergency">Emergency Response</option>
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Required Volunteers</label>
              <input type="number" min={1} value={form.requiredVolunteers} onChange={e => setForm({ ...form, requiredVolunteers: parseInt(e.target.value) || 1 })}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Duration</label>
              <select value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="input-field">
                <option>1 week</option><option>2 weeks</option><option>4 weeks</option><option>8 weeks</option><option>3 months</option><option>6 months</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Required Skills</label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map(s => {
                const sel = form.skills.includes(s);
                return (
                  <button key={s} type="button" onClick={() => setForm({ ...form, skills: sel ? form.skills.filter(x => x !== s) : [...form.skills, s] })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${sel ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Languages</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map(l => {
                const sel = form.languages.includes(l);
                return (
                  <button key={l} type="button" onClick={() => setForm({ ...form, languages: sel ? form.languages.filter(x => x !== l) : [...form.languages, l] })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${sel ? 'bg-secondary-500 text-white border-secondary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-secondary-300'}`}>
                    {l}
                  </button>
                );
              })}
            </div>
          </div>
          <button onClick={handleGenerate} disabled={generating} className="btn-primary w-full">
            {generating ? 'AI is generating your plan...' : <><Wand2 className="w-4 h-4" /> Generate Campaign with AI</>}
          </button>
        </div>
      )}

      {/* Step 2: Generated */}
      {step === 'generated' && generated && (
        <div className="space-y-4">
          <div className="card p-5 bg-primary-50/50 border-primary-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-ink">AI-Generated Campaign Plan</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Review the generated plan below. You can edit everything before publishing.</p>
          </div>

          <div className="card p-5">
            <h4 className="text-xs font-medium text-gray-500 mb-1">Generated Title</h4>
            <p className="text-lg font-semibold text-ink mb-4">{generated.title}</p>
            <h4 className="text-xs font-medium text-gray-500 mb-1">Description</h4>
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">{generated.description}</p>
            <h4 className="text-xs font-medium text-gray-500 mb-1">Required Skills</h4>
            <div className="flex flex-wrap gap-2 mb-4">{generated.required_skills.map(s => <span key={s} className="badge bg-primary-100 text-primary-700">{s}</span>)}</div>
            <h4 className="text-xs font-medium text-gray-500 mb-1">Volunteer Requirements</h4>
            <p className="text-sm text-gray-700 mb-4">{generated.volunteer_requirements}</p>
            <h4 className="text-xs font-medium text-gray-500 mb-1">Suggested Timeline</h4>
            <p className="text-sm text-gray-700 mb-4">{generated.suggested_timeline}</p>
            <h4 className="text-xs font-medium text-gray-500 mb-2">Task Breakdown</h4>
            <ul className="space-y-2 mb-4">
              {generated.task_breakdown.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                  {t}
                </li>
              ))}
            </ul>
            <h4 className="text-xs font-medium text-gray-500 mb-1">Expected Impact</h4>
            <p className="text-sm text-gray-700">{generated.expected_impact}</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('input')} className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Back</button>
            <button onClick={() => setStep('review')} className="btn-primary flex-1">
              <Edit3 className="w-4 h-4" /> Edit & Review <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Edit */}
      {step === 'review' && (
        <div className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Campaign Title</label>
            <input value={final.title} onChange={e => setFinal({ ...final, title: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Description</label>
            <textarea value={final.description} onChange={e => setFinal({ ...final, description: e.target.value })} className="input-field min-h-[120px]" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Start Date</label>
              <input type="date" value={final.start_date} onChange={e => setFinal({ ...final, start_date: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">End Date</label>
              <input type="date" value={final.end_date} onChange={e => setFinal({ ...final, end_date: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Required Skills</label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map(s => {
                const sel = final.required_skills.includes(s);
                return (
                  <button key={s} type="button" onClick={() => setFinal({ ...final, required_skills: sel ? final.required_skills.filter(x => x !== s) : [...final.required_skills, s] })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${sel ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setStep('generated')} className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Back</button>
            <button onClick={() => handlePublish('draft')} disabled={loading} className="btn-secondary flex-1">
              <Save className="w-4 h-4" /> Save as Draft
            </button>
            <button onClick={() => handlePublish('published')} disabled={loading} className="btn-primary flex-1">
              {loading ? 'Publishing...' : <><Sparkles className="w-4 h-4" /> Publish Campaign</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
