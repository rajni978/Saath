import { useEffect, useState } from 'react';
import { getMedicines, updateMedicine } from '../api/store';

function EditModal({ med, onClose, onSave }) {
  const [form, setForm] = useState({ name: med.name, dose: med.dose, time: med.time, priority: med.priority });
  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.dose.trim() || !form.time) return;
    onSave(form);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-lg border border-[#E2E8F0] w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Edit medicine</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition duration-150" aria-label="Close">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Medicine name</label>
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0F766E]" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dosage</label>
            <input value={form.dose} onChange={e=>setForm({...form,dose:e.target.value})} className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0F766E]" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled time</label>
            <input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})} className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0F766E]" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
            <div className="grid grid-cols-2 gap-3">
              {['critical','normal'].map(p => (
                <button key={p} type="button" onClick={()=>setForm({...form,priority:p})} className={`min-h-[52px] rounded-xl border font-medium capitalize transition duration-150 focus:outline-none focus:ring-2 focus:ring-[#0F766E] ${form.priority===p ? (p==='critical'?'border-red-500 bg-red-50 text-red-700':'border-[#0F766E] bg-teal-50 text-[#0F766E]') : 'border-[#E2E8F0] text-slate-600 hover:bg-slate-50'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 min-h-[52px] border border-[#E2E8F0] rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition duration-150">Cancel</button>
            <button type="submit" className="flex-1 min-h-[52px] bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl font-semibold transition duration-150">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Medicines() {
  const [items, setItems] = useState(getMedicines());
  const [editing, setEditing] = useState(null);
  const load = () => setItems([...getMedicines()]);
  useEffect(() => {
    load();
    const t = setInterval(load, 1500);
    window.addEventListener('saath-update', load);
    return () => { clearInterval(t); window.removeEventListener('saath-update', load); };
  }, []);
  const onSave = (form) => {
    updateMedicine(editing.id, form);
    setEditing(null);
    window.dispatchEvent(new Event('saath-update'));
    load();
  };
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Medicines</h2>
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm divide-y divide-[#E2E8F0]">
        {items.map(m => {
          const critical = m.priority === 'critical';
          return (
            <div key={m.id} className="p-4 flex flex-wrap items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-[#E2E8F0] flex items-center justify-center text-slate-500">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="8" rx="4"/><path d="M12 8v8"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-semibold text-slate-900">{m.name}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${critical ? 'bg-red-50 text-red-700 border-red-100' : 'bg-sky-50 text-sky-700 border-sky-100'}">
                    <span className={`w-2 h-2 rounded-full ${critical?'bg-red-500':'bg-slate-400'}`}></span>
                    {critical ? 'Critical' : 'Normal'}
                  </span>
                </div>
                <div className="text-sm text-slate-500 mt-0.5">{m.dose} · {m.time}</div>
              </div>
              <button onClick={() => setEditing(m)} className="min-h-[52px] px-4 border border-[#E2E8F0] hover:bg-slate-50 active:scale-95 text-slate-700 font-semibold rounded-xl transition duration-150 focus:outline-none focus:ring-2 focus:ring-[#0F766E] flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                Edit
              </button>
            </div>
          );
        })}
      </div>
      {editing && <EditModal med={editing} onClose={() => setEditing(null)} onSave={onSave} />}
    </div>
  );
}
