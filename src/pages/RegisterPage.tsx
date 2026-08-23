import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshake, Mail, Lock, User, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_ICONS } from '@/lib/constants';
import type { Role } from '@/lib/supabase';

const roles: Role[] = ['volunteer', 'ngo', 'college', 'company', 'government'];

export default function RegisterPage() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('volunteer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error: signUpError } = await signUp(email, password, fullName, role);
    setLoading(false);
    if (signUpError) {
      setError(signUpError);
    } else {
      toast('Account created! Welcome to SocialSphere.', 'success');
      navigate('/app/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-surface overflow-y-auto">
        <div className="w-full max-w-2xl py-8">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-ink">SocialSphere</span>
            </Link>
            <h1 className="text-2xl font-bold text-ink mb-1">Create Your Account</h1>
            <p className="text-gray-500 text-sm">Join the social impact ecosystem today.</p>
          </div>
          <div className="card p-8">
            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-error-50 text-error-700 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            <div className="mb-6">
              <label className="block text-sm font-medium text-ink mb-3">I am a...</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {roles.map(r => {
                  const Icon = ROLE_ICONS[r];
                  return (
                    <button key={r} type="button" onClick={() => setRole(r)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        role === r ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}>
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{ROLE_LABELS[r]}</span>
                      {role === r && <Check className="w-3 h-3 text-primary-600" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">{ROLE_DESCRIPTIONS[role]}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                    className="input-field pl-10" placeholder={role === 'volunteer' ? 'John Doe' : 'Organization name'} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="input-field pl-10" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                    className="input-field pl-10" placeholder="At least 6 characters" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Creating account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account? <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
      <div className="hidden lg:flex w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-secondary-400/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl font-bold mb-4">Turn Your Skills Into Social Impact</h1>
          <p className="text-white/80 text-lg max-w-md mb-12">Join thousands of volunteers and organizations creating measurable change in their communities.</p>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { value: '12,480+', label: 'Active Volunteers' },
              { value: '3,260+', label: 'Campaigns Completed' },
              { value: '847K+', label: 'People Impacted' },
              { value: '520+', label: 'Organizations' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-white/80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
