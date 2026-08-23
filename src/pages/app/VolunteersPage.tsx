import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckCircle2, XCircle, Award, ClipboardList, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase, type Application, type Attendance, type Certificate } from '@/lib/supabase';
import { LoadingState, EmptyState, Badge, Avatar } from '@/components/ui';
import { formatDate, timeAgo } from '@/lib/utils';

export default function VolunteersPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10));
  const [attHours, setAttHours] = useState(4);
  const [attStatus, setAttStatus] = useState<'present' | 'absent' | 'excused'>('present');
  const [tab, setTab] = useState<'applications' | 'attendance'>('applications');

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const { data: camps } = await supabase.from('campaigns').select('id').eq('organization_id', profile.id);
    const campIds = (camps ?? []).map(c => c.id);
    if (campIds.length === 0) { setApplications([]); setLoading(false); return; }
    const { data } = await supabase.from('applications')
      .select('*, campaign:campaigns(*), volunteer:profiles(*)')
      .in('campaign_id', campIds)
      .order('applied_at', { ascending: false });
    setApplications((data as Application[]) ?? []);
    setLoading(false);
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  const loadAttendance = useCallback(async (appId: string) => {
    const { data } = await supabase.from('attendance').select('*').eq('application_id', appId).order('date', { ascending: false });
    setAttendance((data as Attendance[]) ?? []);
  }, []);

  const handleDecision = async (appId: string, status: 'accepted' | 'rejected' | 'completed') => {
    const { error } = await supabase.from('applications').update({ status, decision_at: new Date().toISOString() }).eq('id', appId);
    if (error) { toast(error.message, 'error'); return; }
    const app = applications.find(a => a.id === appId);
    if (app?.volunteer_id) {
      await supabase.from('notifications').insert({
        user_id: app.volunteer_id, type: 'application',
        title: `Application ${status}`, body: `Your application to "${app.campaign?.title}" has been ${status}.`,
        link: '/app/applications',
      });
      if (status === 'completed') {
        await issueCertificate(app);
      }
    }
    toast(`Application ${status}`, 'success');
    load();
    if (selectedApp?.id === appId) setSelectedApp(null);
  };

  const issueCertificate = async (app: Application) => {
    if (!app.volunteer_id || !app.campaign_id) return;
    const certNum = `SS-${Date.now().toString(36).toUpperCase()}`;
    const { error } = await supabase.from('certificates').insert({
      volunteer_id: app.volunteer_id,
      campaign_id: app.campaign_id,
      certificate_number: certNum,
      hours: Number(app.volunteer?.volunteer_hours) || 4,
      people_impacted: app.campaign?.people_impacted || 0,
    });
    if (!error) {
      await supabase.from('notifications').insert({
        user_id: app.volunteer_id, type: 'certificate',
        title: 'Certificate Earned!', body: `You earned a certificate for "${app.campaign?.title}".`,
        link: '/app/certificates',
      });
      await supabase.from('profiles').update({
        impact_score: (app.volunteer?.impact_score ?? 0) + 100,
        campaigns_completed: (app.volunteer?.campaigns_completed ?? 0) + 1,
      }).eq('id', app.volunteer_id);
    }
  };

  const handleAddAttendance = async () => {
    if (!selectedApp) return;
    const { error } = await supabase.from('attendance').insert({
      application_id: selectedApp.id,
      date: attDate,
      hours: attHours,
      status: attStatus,
    });
    if (error) { toast(error.message, 'error'); return; }
    if (attStatus === 'present') {
      await supabase.from('profiles').update({
        volunteer_hours: (selectedApp.volunteer?.volunteer_hours ?? 0) + attHours,
        impact_score: (selectedApp.volunteer?.impact_score ?? 0) + Math.round(attHours * 2),
      }).eq('id', selectedApp.volunteer_id);
    }
    toast('Attendance recorded', 'success');
    loadAttendance(selectedApp.id);
  };

  if (loading) return <LoadingState text="Loading volunteers..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-ink">Volunteer Management</h2>
        <p className="text-gray-500 text-sm mt-1">Review applications, mark attendance, and issue certificates.</p>
      </div>

      {applications.length === 0 ? (
        <EmptyState icon={Users} title="No applications yet"
          description="Applications from volunteers will appear here once they apply to your campaigns." />
      ) : selectedApp ? (
        <div className="space-y-4">
          <button onClick={() => setSelectedApp(null)} className="text-sm text-primary-600 font-medium hover:underline">← Back to list</button>
          <div className="card p-5">
            <div className="flex items-center gap-4 mb-4">
              <Avatar name={selectedApp.volunteer?.full_name || 'V'} src={selectedApp.volunteer?.avatar_url} size="lg" />
              <div className="flex-1">
                <h3 className="font-semibold text-ink">{selectedApp.volunteer?.full_name}</h3>
                <p className="text-sm text-gray-500">{selectedApp.volunteer?.location}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge color="green">{selectedApp.match_score}% match</Badge>
                  <Badge color={selectedApp.status === 'accepted' ? 'green' : selectedApp.status === 'pending' ? 'amber' : 'gray'}>{selectedApp.status}</Badge>
                </div>
              </div>
            </div>
            <Link to={`/app/campaigns/${selectedApp.campaign_id}`} className="text-sm text-primary-600 hover:underline">{selectedApp.campaign?.title}</Link>

            <div className="flex gap-2 mt-4 mb-4">
              <button onClick={() => setTab('applications')} className={`px-4 py-2 text-sm font-medium rounded-xl ${tab === 'applications' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Actions</button>
              <button onClick={() => { setTab('attendance'); loadAttendance(selectedApp.id); }} className={`px-4 py-2 text-sm font-medium rounded-xl ${tab === 'attendance' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Attendance</button>
            </div>

            {tab === 'applications' && (
              <div className="flex flex-wrap gap-2">
                {selectedApp.status === 'pending' && (
                  <>
                    <button onClick={() => handleDecision(selectedApp.id, 'accepted')} className="btn-secondary text-sm"><CheckCircle2 className="w-4 h-4 text-secondary-600" /> Accept</button>
                    <button onClick={() => handleDecision(selectedApp.id, 'rejected')} className="btn-secondary text-sm"><XCircle className="w-4 h-4 text-error-600" /> Reject</button>
                  </>
                )}
                {selectedApp.status === 'accepted' && (
                  <button onClick={() => handleDecision(selectedApp.id, 'completed')} className="btn-primary text-sm"><Award className="w-4 h-4" /> Mark Completed & Issue Certificate</button>
                )}
              </div>
            )}

            {tab === 'attendance' && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-3">
                  <div><label className="block text-xs text-gray-500 mb-1">Date</label><input type="date" value={attDate} onChange={e => setAttDate(e.target.value)} className="input-field" /></div>
                  <div><label className="block text-xs text-gray-500 mb-1">Hours</label><input type="number" min={0} max={24} value={attHours} onChange={e => setAttHours(Number(e.target.value) || 0)} className="input-field" /></div>
                  <div><label className="block text-xs text-gray-500 mb-1">Status</label>
                    <select value={attStatus} onChange={e => setAttStatus(e.target.value as 'present' | 'absent' | 'excused')} className="input-field">
                      <option value="present">Present</option><option value="absent">Absent</option><option value="excused">Excused</option>
                    </select>
                  </div>
                </div>
                <button onClick={handleAddAttendance} className="btn-primary text-sm"><ClipboardList className="w-4 h-4" /> Record Attendance</button>
                <div className="space-y-2">
                  {attendance.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No attendance records yet.</p> : attendance.map(a => (
                    <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-ink">{formatDate(a.date)}</span>
                      <span className="text-sm text-gray-500">{a.hours}h</span>
                      <Badge color={a.status === 'present' ? 'green' : a.status === 'excused' ? 'amber' : 'red'}>{a.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map(a => (
            <div key={a.id} className="card p-4 flex items-center gap-4">
              <Avatar name={a.volunteer?.full_name || 'V'} src={a.volunteer?.avatar_url} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink truncate">{a.volunteer?.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{a.campaign?.title} · {timeAgo(a.applied_at)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-secondary-600">{a.match_score}% match</span>
                  {a.volunteer?.skills?.slice(0, 2).map(s => <span key={s} className="badge bg-gray-100 text-gray-600">{s}</span>)}
                </div>
              </div>
              <Badge color={a.status === 'accepted' ? 'green' : a.status === 'pending' ? 'amber' : a.status === 'completed' ? 'blue' : 'red'}>{a.status}</Badge>
              <button onClick={() => setSelectedApp(a)} className="btn-ghost text-sm">Manage</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
