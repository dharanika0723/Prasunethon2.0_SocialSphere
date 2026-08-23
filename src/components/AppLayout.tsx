import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate, Navigate, Outlet } from 'react-router-dom';
import {
  HeartHandshake, LayoutDashboard, Compass, Target, Users, MessageSquare,
  Bell, MapPin, AlertTriangle, Sparkles, User, LogOut, Menu, X, Search,
  Bot, Award, TrendingUp, Settings, ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Notification } from '@/lib/supabase';
import { ROLE_LABELS, ROLE_ICONS } from '@/lib/constants';
import { Avatar } from '@/components/ui';
import { timeAgo } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard', roles: ['volunteer', 'ngo', 'college', 'company', 'government'] },
  { label: 'Discover', icon: Compass, path: '/app/discover', roles: ['volunteer'] },
  { label: 'Campaigns', icon: Target, path: '/app/campaigns', roles: ['volunteer', 'ngo', 'college', 'company', 'government'] },
  { label: 'Applications', icon: Users, path: '/app/applications', roles: ['volunteer'] },
  { label: 'My Volunteers', icon: Users, path: '/app/volunteers', roles: ['ngo', 'college', 'company', 'government'] },
  { label: 'Community Needs', icon: MapPin, path: '/app/needs', roles: ['volunteer', 'ngo', 'college', 'company', 'government'] },
  { label: 'Emergency', icon: AlertTriangle, path: '/app/emergency', roles: ['volunteer', 'ngo', 'college', 'company', 'government'] },
  { label: 'Community', icon: MessageSquare, path: '/app/community', roles: ['volunteer', 'ngo', 'college', 'company', 'government'] },
  { label: 'Messages', icon: MessageSquare, path: '/app/messages', roles: ['volunteer', 'ngo', 'college', 'company', 'government'] },
  { label: 'Impact', icon: TrendingUp, path: '/app/impact', roles: ['volunteer'] },
  { label: 'Certificates', icon: Award, path: '/app/certificates', roles: ['volunteer'] },
  { label: 'AI Assistant', icon: Bot, path: '/app/assistant', roles: ['volunteer', 'ngo', 'college', 'company', 'government'] },
  { label: 'Profile', icon: User, path: '/app/profile', roles: ['volunteer', 'ngo', 'college', 'company', 'government'] },
];

export default function AppLayout() {
  const { profile, signOut, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!profile) return;
    setNotifLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifications((data as Notification[]) ?? []);
    setNotifLoading(false);
  }, [profile]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    setSidebarOpen(false);
    setNotifOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  const items = navItems.filter(item => item.roles.includes(profile.role));
  const unreadCount = notifications.filter(n => !n.read).length;
  const RoleIcon = ROLE_ICONS[profile.role];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const markAllRead = async () => {
    if (!profile) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id);
    loadNotifications();
  };

  const currentLabel = items.find(i => location.pathname.startsWith(i.path))?.label ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-100 flex flex-col transition-transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <HeartHandshake className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-ink">SocialSphere</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3 space-y-1">
          {items.map(item => {
            const active = location.pathname === item.path || (item.path !== '/app/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-ink'
                }`}>
                <item.icon className="w-5 h-5 shrink-0" />
                {item.label}
                {item.label === 'Emergency' && <span className="ml-auto w-2 h-2 bg-error-500 rounded-full animate-pulse-soft" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
            <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center">
              <RoleIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-ink truncate">{profile.full_name || profile.email}</p>
              <p className="text-xs text-gray-500">{ROLE_LABELS[profile.role]}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center gap-3 px-4 sm:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 max-w-md">
            <h1 className="font-semibold text-ink text-base sm:text-lg hidden sm:block">{currentLabel}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 w-80 bg-white rounded-2xl shadow-soft border border-gray-100 animate-scale-in overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="font-semibold text-ink text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-primary-600 font-medium hover:underline">Mark all read</button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto scrollbar-thin">
                      {notifLoading ? (
                        <div className="p-4 space-y-2">
                          <div className="skeleton h-12 w-full" /><div className="skeleton h-12 w-full" />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-400">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-primary-50/50' : ''}`}>
                            <div className="flex items-start gap-2">
                              {!n.read && <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 shrink-0" />}
                              <div className={n.read ? 'pl-4' : ''}>
                                <p className="text-sm font-medium text-ink">{n.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile menu */}
            <div className="relative">
              <button onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                <Avatar name={profile.full_name || profile.email} src={profile.avatar_url} size="sm" />
                <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
              </button>
              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 w-56 bg-white rounded-2xl shadow-soft border border-gray-100 animate-scale-in overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-ink truncate">{profile.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                    </div>
                    <div className="py-1">
                      <Link to="/app/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link to="/app/assistant" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                        <Bot className="w-4 h-4" /> AI Assistant
                      </Link>
                      <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error-600 hover:bg-error-50">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
