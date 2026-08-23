import { useState } from 'react';
import { User, MapPin, Save, Shield, Star, Briefcase, Globe, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { Avatar, Badge, LoadingState } from '@/components/ui';
import { ROLE_LABELS, SKILL_OPTIONS, INTEREST_OPTIONS, LANGUAGE_OPTIONS } from '@/lib/constants';

export default function ProfilePage() {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    bio: profile?.bio ?? '',
    location: profile?.location ?? '',
    skills: profile?.skills ?? [],
    interests: profile?.interests ?? [],
    languages: profile?.languages ?? [],
    availability: profile?.availability ?? '',
    organization_name: profile?.organization_name ?? '',
    organization_type: profile?.organization_type ?? '',
    avatar_url: profile?.avatar_url ?? '',
  });

  if (!profile) return <LoadingState text="Loading profile..." />;

  const isVolunteer = profile.role === 'volunteer';

  const toggleArray = (key: 'skills' | 'interests' | 'languages', value: string) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(x => x !== value) : [...prev[key], value],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile(form);
    setSaving(false);
    if (error) { toast(error, 'error'); return; }
    toast('Profile updated successfully!', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-ink">My Profile</h2>
        <p className="text-gray-500 text-sm mt-1">Keep your profile up to date for better AI matching.</p>
      </div>

      {/* Profile header */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Avatar name={profile.full_name || 'User'} src={profile.avatar_url} size="xl" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-ink">{profile.full_name}</h3>
              {profile.verified && <Badge color="green"><Shield className="w-3 h-3" /> Verified</Badge>}
            </div>
            <p className="text-sm text-gray-500 capitalize">{ROLE_LABELS[profile.role]}</p>
            {profile.location && <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {profile.location}</p>}
            {isVolunteer && (
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1"><Star className="w-4 h-4 text-accent-500" /><span className="text-sm font-semibold text-ink">{profile.impact_score}</span><span className="text-xs text-gray-500">Impact Score</span></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editable fields */}
      <div className="card p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">{isVolunteer ? 'Full Name' : 'Contact Name'}</label>
            <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Location</label>
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field" placeholder="City, State" />
          </div>
        </div>

        {!isVolunteer && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Organization Name</label>
              <input value={form.organization_name} onChange={e => setForm({ ...form, organization_name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Organization Type</label>
              <input value={form.organization_type} onChange={e => setForm({ ...form, organization_type: e.target.value })} className="input-field" placeholder="Non-profit, Government, Corporate" />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Bio</label>
          <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="input-field min-h-[80px]" placeholder="Tell the community about yourself..." />
        </div>

        {isVolunteer && (
          <>
            <div>
              <label className="block text-sm font-medium text-ink mb-2 flex items-center gap-1"><Briefcase className="w-4 h-4 text-gray-400" /> Skills</label>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map(s => {
                  const sel = form.skills.includes(s);
                  return <button key={s} type="button" onClick={() => toggleArray('skills', s)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${sel ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>{s}</button>;
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2 flex items-center gap-1"><Star className="w-4 h-4 text-gray-400" /> Interests</label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(s => {
                  const sel = form.interests.includes(s);
                  return <button key={s} type="button" onClick={() => toggleArray('interests', s)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${sel ? 'bg-secondary-500 text-white border-secondary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-secondary-300'}`}>{s}</button>;
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2 flex items-center gap-1"><Globe className="w-4 h-4 text-gray-400" /> Languages</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map(s => {
                  const sel = form.languages.includes(s);
                  return <button key={s} type="button" onClick={() => toggleArray('languages', s)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${sel ? 'bg-accent-500 text-white border-accent-500' : 'bg-white text-gray-600 border-gray-200 hover:border-accent-300'}`}>{s}</button>;
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5 flex items-center gap-1"><Clock className="w-4 h-4 text-gray-400" /> Availability</label>
              <select value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })} className="input-field">
                <option value="">Select availability</option>
                <option>Weekends</option><option>Weekdays</option><option>Full-time</option><option>Evenings</option><option>Flexible</option>
              </select>
            </div>
          </>
        )}

        <button onClick={handleSave} disabled={saving} className="btn-primary w-full sm:w-auto">
          {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Profile</>}
        </button>
      </div>
    </div>
  );
}
