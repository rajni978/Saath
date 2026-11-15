import { useEffect, useState } from 'react';
import { fastForward, reset, getNotifications } from '../api/store';

function fmt(d) { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

export default function Demo() {
  const [msg, setMsg] = useState('');
  const [notes, setNotes] = useState(getNotifications());
  const [open, setOpen] = useState(null);
  const refresh = () => setNotes([...getNotifications()]);
  useEffect(()=>{ const t=setInterval(refresh,1500); window.addEventListener('saath-update',refresh); return ()=>{clearInterval(t); window.removeEventListener('saath-update',refresh);} }, []);
  const doFast = () => { fastForward(30); setMsg('Fast-forwarded 30 minutes and ran escalation checks.'); window.dispatchEvent(new Event('saath-update')); refresh(); };
  const doReset = () => { reset(); window.location.href='/login'; };
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Demo</h2>
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-5 space-y-4">
        <p className="text-sm text-slate-500">Simulate missed medication and escalation. Notifications are shown in-app with clear reasons.</p>
        {msg && <div className="p-3 rounded-xl bg-teal-50 text-[#0F766E] border border-teal-100 text-sm font-medium">{msg}</div>}
        <div className="flex flex-wrap gap-3">
          <button onClick={doFast} className="min-h-[52px] bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-semibold px-5 rounded-xl transition duration-150 focus:outline-none focus:ring-2 focus:ring-orange-300">⏩ Fast-forward 30 min</button>
          <button onClick={doReset} className="min-h-[52px] bg-white border border-red-200 text-red-600 hover:bg-red-50 active:scale-95 font-semibold px-5 rounded-xl transition duration-150 focus:outline-none focus:ring-2 focus:ring-red-200">Reset demo data</button>
        </div>
      </div>
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
        <div className="px-5 py-4 border-b border-[#E2E8F0]"><h3 className="text-base font-semibold text-slate-900">Simulated emails</h3></div>
        <div className="p-2">
          {notes.length===0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">All quiet. Saath will tell you if something needs attention.</div>
          ) : notes.map(n => {
            const urgent = /critical|all helpers/i.test((n.subject||'') + (n.reason||''));
            const isOpen = open === n.id;
            return (
              <button key={n.id} onClick={()=>setOpen(isOpen?null:n.id)} className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition duration-150 focus:outline-none focus:ring-2 focus:ring-[#0F766E] animate-slide-in">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-xs font-semibold shrink-0">SC</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 truncate">{n.subject}</span>
                      {urgent && <span className="text-[10px] font-semibold bg-red-50 text-red-700 px-2 py-0.5 rounded-full">Urgent</span>}
                      <span className="ml-auto text-xs text-slate-500 shrink-0">{fmt(n.at)}</span>
                    </div>
                    <div className="text-xs text-slate-500 truncate">{n.reason}</div>
                    {isOpen && <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg space-y-1"><div><b>To:</b> {n.to}</div><div><b>Subject:</b> {n.subject}</div><div><b>Reason:</b> {n.reason}</div></div>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
