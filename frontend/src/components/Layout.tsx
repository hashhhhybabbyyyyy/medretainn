import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Hospital,
  LayoutDashboard,
  Users,
  Layers,
  MessageSquare,
  BarChart3,
  Search,
  Bell,
  Settings,
  ChevronRight,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import { getUser, getHIMSConnections } from '../api';

interface LayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const location = useLocation();
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = getUser();
  const [himsInfo, setHimsInfo] = useState<any>(null);

  // Global keyboard shortcut for search
  useEffect(() => {
    // Fetch HIMS connection info for the sidebar
    (async () => {
      try {
        const conn = await getHIMSConnections();
        if (conn && conn.connections && conn.connections.length > 0) setHimsInfo(conn.connections[0]);
      } catch (e) {
        // ignore
      }
    })();

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setShowGlobalSearch(true);
      }
      if (event.key === 'Escape') setShowGlobalSearch(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { path: '/', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { path: '/connect-hims', label: 'Connect HIMS', icon: <Hospital size={20} /> },
    { path: '/patients', label: 'Patient Registry', icon: <Users size={20} /> },
    { path: '/batches', label: 'Outreach Batches', icon: <Layers size={20} /> },
    { path: '/messages', label: 'Communication Log', icon: <MessageSquare size={20} /> },
    { path: '/analytics', label: 'Risk Intelligence', icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#000] text-white selection:bg-[#00d48a]/30 selection:text-black">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-[#070707] border-r border-white/5 flex flex-col z-[1000] transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-20'}`}>
        {/* Brand Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className={`flex items-center gap-4 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 scale-0'}`}>
            <div className="w-12 h-12 rounded-2xl bg-[#07110f] flex items-center justify-center border border-[#003927] shadow-[0_0_20px_-5px_rgba(0,212,136,0.12)]">
              <Hospital className="text-[#00d48a] w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-white leading-none">MedRetain</div>
              <div className="text-[10px] font-bold text-[#00d48a] tracking-[0.2em] uppercase mt-1">Retention</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 hover:text-white transition-colors">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Global Search Quick Access */}
        <div className={`p-6 px-4 mb-4 mt-8 transition-all ${sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
          <button onClick={() => setShowGlobalSearch(true)} className="w-full flex items-center justify-between px-4 py-3 bg-white/3 hover:bg-white/6 border border-white/5 rounded-2xl transition-all duration-300 group">
            <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200">
              <Search size={18} />
              <span className="text-sm font-bold">Quick Search</span>
            </div>
            <div className="px-1.5 py-0.5 bg-[#07110f] text-[10px] font-mono text-slate-400 rounded border border-white/5 tracking-tighter">⌘K</div>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all relative group ${isActive ? 'bg-[#003927] text-white shadow-xl' : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]'}`}>
                <div className={`transition-all ${isActive ? 'scale-110 rotate-0' : 'scale-100 group-hover:scale-110 group-hover:rotate-3'}`}>
                  {item.icon}
                </div>
                <span className={`${sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'} transition-all duration-300`}>{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* System Settings & User */}
        <div className="p-6 border-t border-white/5 space-y-3">
          {sidebarOpen && user && (
            <div className="px-4 py-3 bg-white/[0.02] rounded-2xl border border-white/5 mb-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Signed in as</div>
              <div className="text-sm font-bold text-white truncate">{user.full_name || user.username || 'Admin'}</div>
              <div className="text-[10px] text-slate-500 truncate">{user.role || 'CRM Administrator'}</div>
              {himsInfo && (
                <div className="mt-2 text-[11px] text-slate-400">
                  <div className="font-medium text-sm text-[#00d48a]">{himsInfo.hims_name}</div>
                  <div className="text-xs">{himsInfo.hospital_id}</div>
                </div>
              )}
            </div>
          )}
          <button className="flex items-center gap-4 text-slate-500 hover:text-white transition-colors px-4 py-2">
            <Bell size={18} />
            {sidebarOpen && <span className="text-sm font-bold">Notifications</span>}
          </button>
          {onLogout && (
            <button onClick={onLogout} className="flex items-center gap-4 text-slate-500 hover:text-rose-400 transition-colors px-4 py-2 w-full">
              <LogOut size={18} />
              {sidebarOpen && <span className="text-sm font-bold">Sign Out</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'} p-10 min-h-screen relative`}>
        {/* Minimal background accents */}
        <div className="fixed top-0 right-1/4 w-[600px] h-[600px] bg-[#002417]/5 rounded-full blur-[160px] pointer-events-none" />
        <div className="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-[#002417]/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>

      {/* Modals */}
      <GlobalSearch isOpen={showGlobalSearch} onClose={() => setShowGlobalSearch(false)} />
    </div>
  );
};

export default Layout;
