import { useEffect, useState } from 'react';
import { getProfile, setNotifyMode } from '../api/store';

export default function Settings({ auth }) {
  const [profile, setProfile] = useState(getProfile());
  const [msg, setMsg] = useState('');
  useEffect(()=>{ const load=()=>setProfile(getProfile()); load(); const t=setInterval(load,1500); return ()=>clearInterval(t); }, []);
  const setMode = (mode) => {
    try { setNotifyMode(mode); setProfile(getProfile()); setMsg('Notification preference updated.'); }
    catch (e) { setMsg(e.message); }
  };
  const isElder = auth.role === 'elder';
  const Option = ({ value, title, desc }) => {
    const selected = profile.notifyMode === value;
    return (
      <button onClick={()=>setMode(value)} disabled={!isElder} className={`w-full p-4 rounded-2xl text-left border transition duration-150 focus:outline-none focus:ring-2 focus:ring-[#0F766E] ${selected?'border-[#0F766E] bg-teal-50':'border-[#E2E8F0] bg-white hover:border-slate-300'} ${!isElder?'opacity-60 cursor-not-allowed':''}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold text-slate-900">{title}</div>
            <div className="text-sm text-slate-500 mt-1">{desc}</div>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${selected?'border-[#0F766E]':'border-slate-300'}`}>
            {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#0F766E]"></div>}
          </div>
        </div>
      </button>
    );
  };
  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-5 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Notification preference</h3>
          <p className="text-sm text-slate-500 mt-1">Critical medicines always escalate.</p>
        </div>
        {msg && <div className="p-3 rounded-xl bg-teal-50 text-[#0F766E] border border-teal-100 text-sm font-medium">{msg}</div>}
        <div className="grid gap-3">
          <Option value="important" title="Only Important Ones" desc="Alert family only for critical medicines." />
          <Option value="all" title="All Missed Pills" desc="Alert family for every missed medicine." />
        </div>
        {!isElder && <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3">Only Mrs. Sharma can change this.</div>}
      </div>
    </div>
  );
}
