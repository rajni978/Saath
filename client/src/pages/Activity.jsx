import { useEffect, useState } from 'react';
import { getActivity } from '../api/store';

export default function Activity() {
  const [items, setItems] = useState(getActivity());
  useEffect(()=>{ const load=()=>setItems([...getActivity()]); load(); const t=setInterval(load,1500); window.addEventListener('saath-update',load); return ()=>{clearInterval(t); window.removeEventListener('saath-update',load);} }, []);
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Activity</h2>
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
        {items.length===0 && <div className="p-5 text-slate-500">No activity yet.</div>}
        <div className="divide-y divide-[#E2E8F0]">
          {items.map(a => (
            <div key={a.id} className="p-4 flex items-start justify-between gap-4">
              <div className="text-sm text-slate-700">{a.text}</div>
              <div className="text-xs text-slate-500 shrink-0">{new Date(a.at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
