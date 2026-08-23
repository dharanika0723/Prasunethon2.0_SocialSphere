import { useEffect, useState, useCallback } from 'react';
import { Award, Download, Calendar, Clock, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Certificate } from '@/lib/supabase';
import { LoadingState, EmptyState } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export default function CertificatesPage() {
  const { profile } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const { data } = await supabase.from('certificates')
      .select('*, campaign:campaigns(*)').eq('volunteer_id', profile.id).order('issued_at', { ascending: false });
    setCertificates((data as Certificate[]) ?? []);
    setLoading(false);
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState text="Loading certificates..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-ink">My Certificates</h2>
        <p className="text-gray-500 text-sm mt-1">Certificates earned through your volunteer participation.</p>
      </div>

      {certificates.length === 0 ? (
        <EmptyState icon={Award} title="No certificates yet" description="Complete campaigns to earn certificates. They are issued automatically when an organization marks your participation as completed." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {certificates.map(c => (
            <div key={c.id} className="card overflow-hidden">
              <div className="gradient-hero p-5 text-white relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <Award className="w-8 h-8 mb-3" />
                <p className="text-xs uppercase tracking-wider opacity-80">Certificate of Participation</p>
                <p className="text-lg font-bold mt-1">{profile?.full_name}</p>
              </div>
              <div className="p-5 space-y-3">
                <div><p className="text-xs text-gray-500">Campaign</p><p className="text-sm font-semibold text-ink">{c.campaign?.title}</p></div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-gray-50 rounded-lg"><Clock className="w-4 h-4 text-primary-500 mx-auto mb-1" /><p className="text-sm font-bold text-ink">{c.hours}h</p><p className="text-xs text-gray-500">Hours</p></div>
                  <div className="p-2 bg-gray-50 rounded-lg"><Users className="w-4 h-4 text-secondary-500 mx-auto mb-1" /><p className="text-sm font-bold text-ink">{c.people_impacted}</p><p className="text-xs text-gray-500">Impacted</p></div>
                  <div className="p-2 bg-gray-50 rounded-lg"><Calendar className="w-4 h-4 text-accent-500 mx-auto mb-1" /><p className="text-sm font-bold text-ink">{formatDate(c.issued_at).split(' ')[0]}</p><p className="text-xs text-gray-500">Issued</p></div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400 font-mono">{c.certificate_number}</span>
                  <button onClick={() => window.print()} className="btn-secondary text-sm"><Download className="w-4 h-4" /> Download</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
