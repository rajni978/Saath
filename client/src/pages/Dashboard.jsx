import { useEffect, useState } from 'react';
import { getDashboard, logDose, getAppointments, claimAppointment, getNotifications } from '../api/store';

function greeting(nowIso) {
  const h = new Date(nowIso).getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
function fmt(d) { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

function StatusChip({ status }) {
  const m = {
    pending: 'bg-amber-50 text-amber-700',
    taken: 'bg-green-50 text-green-700',
    skipped: 'bg-slate-100 text-slate-600',
    missed: 'bg-red-50 text-red-700',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${m[status] || m.pending}`}>{status}</span>;
}

function AlertItem({ n }) {
  const [open, setOpen] = useState(false);
  const urgent = /critical|all helpers/i.test((n.subject||'') + (n.reason||''));
  return (
    <button onClick={() => setOpen(o=>!o)} className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition duration-150 focus:outline-none focus:ring-2 focus:ring-[#0F766E]">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-xs font-semibold shrink-0">SC</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 truncate">{n.subject}</span>
            {urgent && <span className="text-[10px] font-semibold bg-red-50 text-red-700 px-2 py-0.5 rounded-full">Urgent</span>}
            <span className="ml-auto text-xs text-slate-500 shrink-0">{fmt(n.at)}</span>
          </div>
          <div className="text-xs text-slate-500 truncate">{n.reason}</div>
          {open && <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg"><div><b>To:</b> {n.to}</div><div className="mt-1">{n.reason}</div></div>}
        </div>
      </div>
    </button>
  );
}

export default function Dashboard({ auth }) {
  const [data, setData] = useState(getDashboard());
  const [msg, setMsg] = useState('');
  const [appts, setAppts] = useState(getAppointments());
  const [notes, setNotes] = useState(getNotifications());
  const load = () => {
    setData(getDashboard());
    setAppts([...getAppointments()]);
    setNotes([...getNotifications()]);
  };
  useEffect(() => {
    load();
    const t = setInterval(load, 1500);
    window.addEventListener('saath-update', load);
    return () => { clearInterval(t); window.removeEventListener('saath-update', load); };
  }, []);
  const onLog = (id, action) => {
    setMsg('');
    try { logDose(id, action, auth.name); setMsg(`Marked ${action}.`); }
    catch (e) { setMsg(e.message); }
    load();
  };
  const claim = (id) => { claimAppointment(id); load(); };

  const total = data.doses.length;
  const doneCount = data.doses.filter(d => d.status === 'taken' || d.status === 'skipped').length;
  const adherence = total ? Math.round((data.doses.filter(d=>d.status==='taken').length / total) * 100) : 0;
  const next = data.doses.find(d => d.status === 'pending');
  const appt = appts[0];

  const stats = [
    { label: 'Doses today', value: `${doneCount}/${total}`, icon: <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/> },
    { label: 'Adherence', value: `${adherence}%`, icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2"/> },
    { label: 'Alerts sent', value: `${notes.length}`, icon: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></> },
    { label: 'Next dose', value: next ? `${next.medication?.name}` : 'None', sub: next ? fmt(next.scheduledAt) : '', icon: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">{s.label}</span>
              <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
            </div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">{s.value}</div>
            {s.sub && <div className="text-sm text-slate-500">{s.sub}</div>}
          </div>
        ))}
      </div>

      {msg && <div className="p-3 rounded-xl bg-teal-50 text-[#0F766E] border border-teal-100 text-sm font-medium animate-slide-in">{msg}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Today's schedule</h2>
                <p className="text-sm text-slate-500">{greeting(data.now)}, Mrs. Sharma</p>
              </div>
            </div>
            <div className="p-5">
              <div className="space-y-0">
                {data.doses.map((d, i) => {
                  const med = d.medication || {};
                  const critical = med.priority === 'critical';
                  const last = i === data.doses.length - 1;
                  const lockedText = d.status === 'missed'
                    ? `Missed at ${fmt(d.takenAt || d.scheduledAt)}. Nobody logged this dose.`
                    : (d.status === 'taken' || d.status === 'skipped')
                      ? `Given by ${d.takenBy} at ${fmt(d.takenAt)}`
                      : '';
                  return (
                    <div key={d.id} className="flex gap-4">
                      <div className="w-14 pt-1 text-sm font-medium text-slate-500 text-right shrink-0">{fmt(d.scheduledAt)}</div>
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full mt-1.5 ring-4 ${d.status==='taken'?'bg-green-500 ring-green-50':d.status==='missed'?'bg-red-500 ring-red-50':d.status==='skipped'?'bg-slate-400 ring-slate-100':critical?'bg-red-400 ring-red-50':'bg-[#0F766E] ring-teal-50'}`}></div>
                        {!last && <div className="w-px flex-1 bg-[#E2E8F0] my-1"></div>}
                      </div>
                      <div className={`flex-1 pb-5 ${!last?'':'pb-1'}`}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-lg font-semibold text-slate-900">{med.name}</span>
                              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                <span className={`w-2 h-2 rounded-full ${critical?'bg-red-500':'bg-slate-400'}`}></span>
                                {critical ? 'Critical' : 'Normal'}
                              </span>
                              <StatusChip status={d.status} />
                            </div>
                            <div className="text-sm text-slate-500 mt-0.5">{med.dose}</div>
                          </div>
                          {d.status === 'pending' ? (
                            <div className="flex gap-2 shrink-0">
                              <button onClick={()=>onLog(d.id,'taken')} className="min-h-[52px] px-5 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-semibold rounded-xl transition duration-150 focus:outline-none focus:ring-2 focus:ring-green-300">Taken</button>
                              <button onClick={()=>onLog(d.id,'skipped')} className="min-h-[52px] px-5 bg-white border border-[#E2E8F0] hover:bg-slate-50 active:scale-95 text-slate-700 font-semibold rounded-xl transition duration-150 focus:outline-none focus:ring-2 focus:ring-slate-300">Skip</button>
                            </div>
                          ) : (
                            <div className={`text-sm font-medium ${d.status==='missed'?'text-red-600':d.status==='taken'?'text-green-700':'text-slate-500'}`}>{lockedText}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-5">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Next appointment</h3>
            {appt ? (
              <div className="flex flex-wrap items-center gap-4">
                <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-3 text-center min-w-[72px]">
                  <div className="text-[#0F766E] font-semibold text-xs uppercase">{new Date(appt.datetime).toLocaleString([], {month:'short'})}</div>
                  <div className="text-2xl font-bold text-slate-900">{new Date(appt.datetime).getDate()}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900">{appt.doctor}</div>
                  <div className="text-sm text-slate-500">{new Date(appt.datetime).toLocaleString([], {weekday:'short', hour:'2-digit', minute:'2-digit'})}</div>
                  {appt.claimedBy && <div className="text-sm text-green-700 font-medium mt-1">✓ {appt.claimedBy} will take her</div>}
                </div>
                {!appt.claimedBy ? (
                  <button onClick={()=>claim(appt.id)} className="min-h-[52px] bg-[#0F766E] hover:bg-[#115E59] active:scale-95 text-white font-semibold px-5 rounded-xl transition duration-150 focus:outline-none focus:ring-2 focus:ring-teal-300">I'll take her</button>
                ) : (
                  <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-2 rounded-lg">Confirmed</span>
                )}
              </div>
            ) : <div className="text-slate-500">No appointments.</div>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h3 className="text-base font-semibold text-slate-900">Live alerts</h3>
            </div>
            <div className="p-2 max-h-[360px] overflow-auto">
              {notes.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">All quiet. Saath will tell you if something needs attention.</div>
              ) : notes.map(n => <AlertItem key={n.id} n={n} />)}
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-5">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Care circle</h3>
            <div className="space-y-3">
              {[{ name: 'Mrs. Sharma', role: 'Elder', ini: 'MS', color: 'bg-[#0F766E]' },
                { name: 'Riya', role: 'Helper', ini: 'R', color: 'bg-slate-700' },
                { name: 'Arjun', role: 'Helper', ini: 'A', color: 'bg-slate-700' }].map(p => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${p.color} text-white flex items-center justify-center text-sm font-semibold`}>{p.ini}</div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
