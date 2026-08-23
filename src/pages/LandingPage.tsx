import { Link } from 'react-router-dom';
import {
  HeartHandshake, Sparkles, Brain, Target, AlertTriangle, TrendingUp,
  Users, Building2, GraduationCap, Users2, Landmark, ArrowRight,
  ShieldCheck, MessageSquare, Award, MapPin, Zap, Star, Quote,
} from 'lucide-react';
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/lib/constants';
import { ProgressRing } from '@/components/ui';

const stats = [
  { label: 'Active Volunteers', value: '12,480+', icon: Users },
  { label: 'Campaigns Completed', value: '3,260+', icon: Target },
  { label: 'People Impacted', value: '847K+', icon: TrendingUp },
  { label: 'Partner Organizations', value: '520+', icon: Building2 },
];

const roles = [
  { key: 'volunteer', icon: HeartHandshake },
  { key: 'ngo', icon: Building2 },
  { key: 'college', icon: GraduationCap },
  { key: 'company', icon: Users2 },
  { key: 'government', icon: Landmark },
] as const;

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Volunteer, Chennai',
    text: 'SocialSphere matched me with a teaching campaign in my neighborhood. The AI matching was spot on — I found a cause I care about within minutes.',
    score: 92,
  },
  {
    name: 'Rahul Verma',
    role: 'NGO Director, Bangalore',
    text: 'The AI Campaign Planner saved us hours. It generated a complete campaign plan with task breakdown and impact projections. We published in record time.',
    score: 88,
  },
  {
    name: 'Dr. Anita Reddy',
    role: 'College Coordinator, Hyderabad',
    text: 'Managing 200+ student volunteers was effortless. Attendance tracking and certificate generation are built right in. Impactful and professional.',
    score: 95,
  },
];

const steps = [
  { icon: Users, title: 'Create Your Profile', desc: 'Sign up as a volunteer or organization and build your profile with skills, interests, and goals.' },
  { icon: Brain, title: 'AI Matches You', desc: 'Our AI engine analyzes your profile and matches you with the most relevant campaigns and opportunities.' },
  { icon: Target, title: 'Participate & Track', desc: 'Apply to campaigns, participate, log your hours, and watch your impact score grow in real time.' },
  { icon: Award, title: 'Earn Recognition', desc: 'Receive certificates, achievements, and build a verified portfolio of social impact.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-ink">SocialSphere</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
            <a href="#how" className="hover:text-primary-600 transition-colors">How It Works</a>
            <a href="#roles" className="hover:text-primary-600 transition-colors">For You</a>
            <a href="#stories" className="hover:text-primary-600 transition-colors">Stories</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute top-20 -right-20 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 -left-20 w-96 h-96 bg-secondary-200/30 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" /> AI-Powered Social Impact Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-ink leading-tight text-balance mb-6">
              Turn Your Skills Into <span className="gradient-text">Social Impact</span>.
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl text-balance">
              SocialSphere connects people, organizations, and communities to create measurable change. Discover campaigns, get AI-matched, and track your real-world impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary text-base px-7 py-3">
                Find Opportunities <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/register" className="btn-secondary text-base px-7 py-3">
                Create Impact
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-8 text-sm text-gray-500">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-secondary-500" /> Verified Organizations</div>
              <div className="flex items-center gap-2"><Brain className="w-4 h-4 text-primary-500" /> AI Smart Matching</div>
            </div>
          </div>
          <div className="relative animate-slide-up animate-delay-200">
            <div className="card p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-ink">AI Match Found</p>
                    <p className="text-xs text-gray-500">Rural Education Drive — Karur</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-secondary-600">95%</span>
              </div>
              <div className="bg-secondary-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-secondary-800">
                  <strong>Strong match</strong> because you have Teaching + Communication skills and the campaign is in Karur, matching your location.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="badge bg-primary-100 text-primary-700">Teaching</span>
                <span className="badge bg-secondary-100 text-secondary-700">Communication</span>
                <span className="badge bg-accent-100 text-accent-700">Weekends</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">Impact Score: <strong className="text-ink">850</strong></span>
                <ProgressRing value={85} size={44} stroke={5} color="#22c55e" label={<span className="text-xs font-bold text-secondary-600">85%</span>} />
              </div>
            </div>
            <div className="card p-4 absolute -bottom-6 -left-6 hidden sm:block shadow-glow-green animate-fade-in animate-delay-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-impact flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Certificate Earned</p>
                  <p className="text-xs text-gray-500">120 volunteer hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
                <s.icon className="w-6 h-6 text-primary-600" />
              </div>
              <p className="text-3xl font-bold text-ink mb-1">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ink mb-3">How SocialSphere Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">From profile to impact in four simple steps. AI-powered throughout.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.title} className="card p-6 hover:shadow-soft transition-all hover:-translate-y-1">
                <div className="relative mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                </div>
                <h3 className="font-semibold text-ink mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ink mb-3">Platform Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Everything you need to discover, coordinate, and measure social impact.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* AI Matching */}
            <FeatureCard icon={Brain} color="primary" title="AI Volunteer Matching"
              desc="Our AI engine matches volunteers to campaigns based on skills, interests, location, languages, and availability — with transparent match scores and explanations." />
            {/* Community Need Intelligence */}
            <FeatureCard icon={MapPin} color="accent" title="Community Need Intelligence"
              desc="Discover high-priority community needs across education, healthcare, environment, and more. See people affected, priority levels, and suggested actions." />
            {/* AI Campaign Planner */}
            <FeatureCard icon={Sparkles} color="secondary" title="AI Campaign Planner"
              desc="Organizations input a goal and AI generates a complete campaign plan — title, description, required skills, task breakdown, timeline, and expected impact." />
            {/* Emergency Response */}
            <FeatureCard icon={AlertTriangle} color="error" title="Emergency Response"
              desc="Publish and respond to urgent community crises — floods, cyclones, fires, medical emergencies. Coordinate volunteers and resources in real time." />
            {/* Impact Score */}
            <FeatureCard icon={TrendingUp} color="primary" title="Impact Score System"
              desc="A meaningful score that reflects campaigns completed, hours logged, people impacted, and skills contributed. Track progress with visual analytics." />
            {/* Community */}
            <FeatureCard icon={MessageSquare} color="secondary" title="Community & Communication"
              desc="Share achievements, post updates, chat with teams, and stay notified with real-time alerts about campaigns, applications, and opportunities." />
          </div>
        </div>
      </section>

      {/* AI Matching deep dive */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-4">
              <Brain className="w-4 h-4" /> AI Volunteer Matching
            </div>
            <h2 className="text-3xl font-bold text-ink mb-4">Find Campaigns That Actually Fit You</h2>
            <p className="text-gray-600 mb-6">No more scrolling through irrelevant opportunities. Our matching engine analyzes your complete profile and ranks campaigns by how well they align with who you are.</p>
            <ul className="space-y-3">
              {['Skill-based matching with transparent scores', 'Location and language alignment', 'Availability-aware scheduling', 'Previous participation learning', 'Explainable match reasoning'].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-ink">
                  <div className="w-5 h-5 rounded-full bg-secondary-100 flex items-center justify-center shrink-0">
                    <Star className="w-3 h-3 text-secondary-600" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6 shadow-soft">
            <div className="space-y-3">
              {[
                { title: 'Rural Education Drive', loc: 'Karur', score: 95, color: '#22c55e' },
                { title: 'Health Awareness Camp', loc: 'Madurai', score: 82, color: '#2563eb' },
                { title: 'Tree Plantation Drive', loc: 'Coimbatore', score: 71, color: '#f59e0b' },
              ].map(c => (
                <div key={c.title} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <ProgressRing value={c.score} size={56} stroke={6} color={c.color}
                    label={<span className="text-xs font-bold" style={{ color: c.color }}>{c.score}%</span>} />
                  <div className="flex-1">
                    <p className="font-semibold text-ink text-sm">{c.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.loc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Score */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 flex justify-center">
            <div className="card p-8 shadow-soft text-center max-w-sm w-full">
              <ProgressRing value={85} size={180} stroke={14} color="#2563eb"
                label={
                  <div>
                    <p className="text-4xl font-bold text-ink">850</p>
                    <p className="text-sm text-gray-500">Impact Score</p>
                    <span className="badge bg-accent-100 text-accent-700 mt-2">Gold Level</span>
                  </div>
                } />
              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100">
                <div><p className="text-lg font-bold text-ink">12</p><p className="text-xs text-gray-500">Campaigns</p></div>
                <div><p className="text-lg font-bold text-ink">240h</p><p className="text-xs text-gray-500">Hours</p></div>
                <div><p className="text-lg font-bold text-ink">1.2K</p><p className="text-xs text-gray-500">Impacted</p></div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-50 text-accent-700 rounded-full text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4" /> Impact Score
            </div>
            <h2 className="text-3xl font-bold text-ink mb-4">Your Social Impact, Quantified</h2>
            <p className="text-gray-600 mb-6">SocialSphere turns your volunteering into a meaningful, trackable score. Every campaign, hour, and life touched contributes to your growth from Bronze to Diamond level.</p>
            <div className="space-y-2">
              {[
                { level: 'Bronze', range: '0 – 200', color: 'bg-amber-200' },
                { level: 'Silver', range: '200 – 500', color: 'bg-gray-300' },
                { level: 'Gold', range: '500 – 800', color: 'bg-accent-400' },
                { level: 'Platinum', range: '800 – 1200', color: 'bg-primary-300' },
                { level: 'Diamond', range: '1200+', color: 'bg-secondary-400' },
              ].map(l => (
                <div key={l.level} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${l.color}`} />
                  <span className="text-sm font-medium text-ink flex-1">{l.level}</span>
                  <span className="text-sm text-gray-500">{l.range}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Response */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl gradient-emergency p-8 lg:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-sm font-medium mb-4">
                  <AlertTriangle className="w-4 h-4" /> Emergency Response
                </div>
                <h2 className="text-3xl font-bold mb-4">Rapid Response for Community Crises</h2>
                <p className="text-white/90 mb-6">When disasters strike, every minute counts. SocialSphere's emergency module lets organizations publish urgent needs and mobilize volunteers instantly — floods, cyclones, fires, medical emergencies, and more.</p>
                <Link to="/register" className="inline-flex items-center gap-2 bg-white text-error-600 font-semibold px-6 py-3 rounded-xl hover:bg-error-50 transition-colors">
                  Join the Response Network <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Zap, label: 'Instant Mobilization', desc: 'Publish emergencies in seconds' },
                  { icon: Users, label: 'Volunteer Matching', desc: 'AI routes nearby volunteers' },
                  { icon: MapPin, label: 'Location Tracking', desc: 'See affected areas at a glance' },
                  { icon: ShieldCheck, label: 'Verified Coordination', desc: 'Only authorized orgs can publish' },
                ].map(item => (
                  <div key={item.label} className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                    <item.icon className="w-6 h-6 mb-2" />
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-white/80">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ink mb-3">Built for Every Role in the Ecosystem</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Tailored dashboards and tools for each type of user in the social impact space.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {roles.map(r => (
              <div key={r.key} className="card p-6 text-center hover:shadow-soft hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                  <r.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="font-semibold text-ink mb-2">{ROLE_LABELS[r.key]}</h3>
                <p className="text-xs text-gray-500">{ROLE_DESCRIPTIONS[r.key]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="stories" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ink mb-3">Impact Stories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Real experiences from the SocialSphere community.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="card p-6">
                <Quote className="w-8 h-8 text-primary-200 mb-3" />
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">{t.text}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="font-semibold text-ink text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-accent-400 text-accent-400" />
                    <span className="text-sm font-semibold text-ink">{t.score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl gradient-hero p-8 lg:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary-400/20 rounded-full translate-y-1/2 -translate-x-1/3" />
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Create Impact?</h2>
              <p className="text-white/90 mb-8 max-w-xl mx-auto">Join thousands of volunteers and organizations building stronger communities with SocialSphere.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-7 py-3 rounded-xl hover:bg-primary-50 transition-colors">
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white font-semibold px-7 py-3 rounded-xl hover:bg-white/25 transition-colors">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">SocialSphere</span>
              </div>
              <p className="text-sm">Connect. Volunteer. Create Impact. The AI-powered social impact ecosystem.</p>
            </div>
            <div>
              <p className="text-white font-semibold mb-3">Platform</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#roles" className="hover:text-white transition-colors">For You</a></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-3">Community</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#stories" className="hover:text-white transition-colors">Impact Stories</a></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Volunteer</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Organizations</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-3">Connect</p>
              <ul className="space-y-2 text-sm">
                <li>support@socialsphere.app</li>
                <li>Available nationwide</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-sm text-center">
            <p>&copy; 2026 SocialSphere. Built for social impact.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, color, title, desc }: {
  icon: typeof HeartHandshake; color: 'primary' | 'secondary' | 'accent' | 'error'; title: string; desc: string;
}) {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-secondary-50 text-secondary-600',
    accent: 'bg-accent-50 text-accent-600',
    error: 'bg-error-50 text-error-600',
  };
  return (
    <div className="card p-6 hover:shadow-soft transition-all hover:-translate-y-1">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-semibold text-ink mb-2 text-lg">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}
