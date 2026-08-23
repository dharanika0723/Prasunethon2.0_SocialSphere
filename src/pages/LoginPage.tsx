import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshake, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    setLoading(false);
    if (signInError) {
      setError(signInError);
    } else {
      toast('Welcome back to SocialSphere!', 'success');
      navigate('/app/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -left-20 w-96 h-96 bg-secondary-400/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col justify-center px-12 text-white">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">SocialSphere</span>
          </Link>
          <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
          <p className="text-white/80 text-lg max-w-md">Sign in to continue creating social impact, discover new campaigns, and track your contributions.</p>
          <div className="mt-12 space-y-4">
            {['AI-powered campaign matching', 'Track your impact score in real time', 'Join the community of changemakers'].map(item => (
              <div key={item} className="flex items-center gap-3 text-white/90">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"><ArrowRight className="w-3 h-3" /></div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-surface">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2 justify-center">
              <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-ink">SocialSphere</span>
            </Link>
          </div>
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-ink mb-1">Sign In</h2>
            <p className="text-gray-500 text-sm mb-6">Enter your credentials to access your dashboard.</p>
            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-error-50 text-error-700 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="input-field pl-10" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-6">
              New to SocialSphere? <Link to="/register" className="text-primary-600 font-medium hover:underline">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
