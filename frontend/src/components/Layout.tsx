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
import { getUser } from '../api';

interface LayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const location = useLocation();
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = getUser();

  // Global keyboard shortcut for search
  useEffect(() => {
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
    { path: '/patients', label: 'Patient Registry', icon: <Users size={20} /> },
    { path: '/batches', label: 'Outreach Batches', icon: <Layers size={20} /> },
    { path: '/messages', label: 'Communication Log', icon: <MessageSquare size={20} /> },
    { path: '/analytics', label: 'Risk Intelligence', icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#05070a] text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-[#0a0d12] border-r border-white/5 flex flex-col z-[1000] transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-20'}`}>
        {/* Brand Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className={`flex items-center gap-4 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 scale-0'}`}>
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20 shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)]">
              <Hospital className="text-blue-500 w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-white leading-none">Tathya</div>
              <div className="text-[10px] font-bold text-blue-500 tracking-[0.2em] uppercase mt-1">Retention Engine</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 hover:text-white transition-colors">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Global Search Quick Access */}
        <div className={`p-6 px-4 mb-4 mt-8 transition-all ${sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
          <button onClick={() => setShowGlobalSearch(true)} className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all duration-300 group shadow-lg shadow-black/20">
            <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-300">
              <Search size={18} />
              <span className="text-sm font-bold">Quick Search</span>
            </div>
            <div className="px-1.5 py-0.5 bg-slate-800 text-[10px] font-mono text-slate-500 rounded border border-white/5 tracking-tighter">⌘K</div>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all relative group ${isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]'}`}>
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
            <div className="px-4 py-3 bg-white/[0.03] rounded-2xl border border-white/5 mb-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Signed in as</div>
              <div className="text-sm font-bold text-white truncate">{user.full_name || user.username || 'Admin'}</div>
              <div className="text-[10px] text-slate-500 truncate">{user.role || 'CRM Administrator'}</div>
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
        {/* Background Orbs */}
        <div className="fixed top-0 right-1/4 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none" />
        <div className="fixed bottom-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />

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
