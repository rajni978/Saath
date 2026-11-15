import { useEffect, useState } from 'react';
import { getAppointments, claimAppointment } from '../api/store';

export default function Appointments() {
  const [items, setItems] = useState(getAppointments());
  const load = () => setItems([...getAppointments()]);
  useEffect(()=>{ load(); const t=setInterval(load,1500); window.addEventListener('saath-update',load); return ()=>{clearInterval(t); window.removeEventListener('saath-update',load);} }, []);
  const claim = (id) => { claimAppointment(id); load(); };
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Appointments</h2>
      <div className="space-y-3">
        {items.map(a => {
          const dt = new Date(a.datetime);
          return (
            <div key={a.id} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-5 flex flex-wrap items-center gap-4">
              <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-3 text-center min-w-[72px]">
                <div className="text-[#0F766E] font-semibold text-xs uppercase">{dt.toLocaleString([], {month:'short'})}</div>
                <div className="text-2xl font-bold text-slate-900">{dt.getDate()}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-semibold text-slate-900">{a.doctor}</div>
                <div className="text-sm text-slate-500">{dt.toLocaleString([], {weekday:'short', hour:'2-digit', minute:'2-digit'})}</div>
                {a.claimedBy && <div className="text-sm text-green-700 font-medium mt-1">✓ {a.claimedBy} will take her</div>}
              </div>
              {!a.claimedBy ? (
                <button onClick={()=>claim(a.id)} className="min-h-[52px] bg-[#0F766E] hover:bg-[#115E59] active:scale-95 text-white font-semibold px-5 rounded-xl transition duration-150 focus:outline-none focus:ring-2 focus:ring-teal-300">I'll take her</button>
              ) : (
                <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-2 rounded-lg">Confirmed</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
