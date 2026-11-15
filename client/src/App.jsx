import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Appointments from './pages/Appointments';
import Activity from './pages/Activity';
import Settings from './pages/Settings';
import Demo from './pages/Demo';
import { session, logout as doLogout, getDashboard, fastForward, reset } from './api/store';

function useAuth() {
  const [auth, setAuth] = useState(() => session());
  const login = (data) => { setAuth({ role: data.role, name: data.name, elderName: data.elderName }); };
  const logout = () => { doLogout(); setAuth(null); };
  return { auth, login, logout };
}

function NavIcon({ name, className="w-5 h-5" }) {
  const p = { fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round" };
  if (name==='dashboard') return <svg className={className} viewBox="0 0 24 24" {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
  if (name==='meds') return <svg className={className} viewBox="0 0 24 24" {...p}><rect x="3" y="8" width="18" height="8" rx="4"/><path d="M12 8v8"/></svg>;
  if (name==='appt') return <svg className={className} viewBox="0 0 24 24" {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
  if (name==='activity') return <svg className={className} viewBox="0 0 24 24" {...p}><path d="M4 6h16M4 12h16M4 18h10"/></svg>;
  if (name==='settings') return <svg className={className} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.1a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.1a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.1a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.1a1 1 0 0 0-.9.6z"/></svg>;
  if (name==='demo') return <svg className={className} viewBox="0 0 24 24" {...p}><path d="M13 2L3 14h7l-1 8 10-12h-7z"/></svg>;
  return null;
}

const NAV = [
  { to:'/', label:'Dashboard', icon:'dashboard' },
  { to:'/medicines', label:'Medicines', icon:'meds' },
  { to:'/appointments', label:'Appointments', icon:'appt' },
  { to:'/activity', label:'Activity', icon:'activity' },
  { to:'/settings', label:'Settings', icon:'settings' },
  { to:'/demo', label:'Demo', icon:'demo' },
];

function Layout({ auth, logout, children }) {
  const loc = useLocation();
  const nav = useNavigate();
  const [now, setNow] = useState(() => getDashboard().now);
  useEffect(() => { const t = setInterval(() => setNow(getDashboard().now), 1000); return () => clearInterval(t); }, []);
  const initials = (auth.name || 'U').split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase();
  const doReset = () => { reset(); logout(); nav('/login'); };
  const doSwitch = () => { logout(); nav('/login'); };
  const dt = new Date(now);
  const timeStr = dt.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  const dateStr = dt.toLocaleDateString([], { weekday:'short', month:'short', day:'numeric' });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-[#E2E8F0] flex-col z-30">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-[#E2E8F0]">
          <svg className="w-7 h-7 text-[#0F766E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.35-9.5-8.5A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6.5C19 16.65 12 21 12 21z"/></svg>
          <span className="text-xl font-bold text-slate-900">Saath</span>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-auto">
          {NAV.map(n => {
            const active = loc.pathname === n.to;
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${active?'bg-teal-50 text-[#0F766E]':'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <NavIcon name={n.icon} /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#E2E8F0]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-sm font-semibold">{initials}</div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">{auth.name}</div>
              <div className="text-xs text-slate-500 capitalize">{auth.role}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={doSwitch} className="flex-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 py-2 rounded-lg transition-colors duration-150">Switch user</button>
            <button onClick={doReset} className="flex-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 py-2 rounded-lg transition-colors duration-150">Reset</button>
          </div>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 pb-20 lg:pb-0">
        <header className="h-16 bg-white/80 backdrop-blur border-b border-[#E2E8F0] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="lg:hidden flex items-center gap-2">
              <svg className="w-6 h-6 text-[#0F766E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.35-9.5-8.5A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6.5C19 16.65 12 21 12 21z"/></svg>
            </div>
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">Mrs. Sharma's Care Circle</h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-[#E2E8F0] px-3 py-1.5 rounded-full text-slate-700">
              <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              <span className="font-medium">{timeStr}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">{dateStr}</span>
            </div>
            <div className="lg:hidden flex gap-1">
              <button onClick={doSwitch} className="text-xs px-2 py-1.5 rounded-lg border border-[#E2E8F0] text-slate-600">Switch</button>
              <button onClick={doReset} className="text-xs px-2 py-1.5 rounded-lg border border-[#E2E8F0] text-slate-600">Reset</button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      <button onClick={() => { fastForward(30); window.dispatchEvent(new Event('saath-update')); }} className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-semibold text-sm px-4 py-3 rounded-full shadow-lg flex items-center gap-2 transition duration-150 focus:outline-none focus:ring-4 focus:ring-orange-200 min-h-[52px]">
        <span>⏩ Fast-forward 30 min</span><span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Demo</span>
      </button>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#E2E8F0] z-40">
        <div className="grid grid-cols-6">
          {NAV.map(n => {
            const active = loc.pathname === n.to;
            return (
              <Link key={n.to} to={n.to} className={`flex flex-col items-center py-2.5 text-[11px] font-medium transition-colors duration-150 ${active?'text-[#0F766E]':'text-slate-500'}`}>
                <NavIcon name={n.icon} className="w-5 h-5 mb-0.5" />
                <span className="truncate max-w-full px-1">{n.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  const { auth, login, logout } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={auth ? <Navigate to="/" /> : <Login onLogin={login} />} />
        <Route path="/*" element={!auth ? <Navigate to="/login" /> : (
          <Layout auth={auth} logout={logout}>
            <Routes>
              <Route path="/" element={<Dashboard auth={auth} />} />
              <Route path="/medicines" element={<Medicines />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/settings" element={<Settings auth={auth} />} />
              <Route path="/demo" element={<Demo />} />
            </Routes>
          </Layout>
        )} />
      </Routes>
    </BrowserRouter>
  );
}
