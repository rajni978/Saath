const KEY = 'saath_demo_v1';

function nowMs() {
  const s = get();
  return Date.now() + (s.offsetMin || 0) * 60000;
}
function fmtTime(d) {
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function todayAt(hhmm, offsetMin = 0) {
  const d = new Date(Date.now() + offsetMin * 60000);
  const [h, m] = hhmm.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}
function tomorrowAt10() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}

function seed() {
  const s = {
    offsetMin: 0,
    profile: { elderName: 'Mrs. Sharma', notifyMode: 'important' },
    session: null,
    medicines: [
      { id: 'm1', name: 'Insulin', dose: '10 units', time: '08:00', priority: 'critical', changedAt: new Date().toISOString() },
      { id: 'm2', name: 'BP Tablet', dose: '1 tablet', time: '13:00', priority: 'critical', changedAt: new Date().toISOString() },
      { id: 'm3', name: 'Vitamin D', dose: '1 capsule', time: '20:00', priority: 'normal', changedAt: new Date().toISOString() },
    ],
    doses: [
      { id: 'd1', medId: 'm1', scheduledAt: todayAt('08:00'), status: 'pending', takenBy: '', takenAt: '', stage: 0 },
      { id: 'd2', medId: 'm2', scheduledAt: todayAt('13:00'), status: 'pending', takenBy: '', takenAt: '', stage: 0 },
      { id: 'd3', medId: 'm3', scheduledAt: todayAt('20:00'), status: 'pending', takenBy: '', takenAt: '', stage: 0 },
    ],
    appointments: [
      { id: 'a1', doctor: 'Dr. Mehta', datetime: tomorrowAt10(), claimedBy: '', reminded: false },
    ],
    activity: [{ id: 'act0', text: 'Demo data ready for Mrs. Sharma.', at: new Date().toISOString() }],
    notifications: [],
  };
  localStorage.setItem(KEY, JSON.stringify(s));
  return s;
}

export function get() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return seed();
  try { return JSON.parse(raw); } catch { return seed(); }
}
export function save(s) { localStorage.setItem(KEY, JSON.stringify(s)); return s; }
export function reset() { localStorage.removeItem(KEY); return seed(); }

function log(s, text) {
  s.activity.unshift({ id: 'act' + Math.random().toString(36).slice(2), text, at: new Date(nowMs()).toISOString() });
}
function notify(s, to, subject, reason) {
  s.notifications.unshift({ id: 'n' + Math.random().toString(36).slice(2), to, subject, reason, at: new Date(nowMs()).toISOString() });
}

export function login(passcode) {
  const s = get();
  if (passcode === 'SAATH-ELDER') s.session = { role: 'elder', name: 'Mrs. Sharma' };
  else if (passcode === 'SAATH-HELP') s.session = { role: 'helper', name: 'Riya' };
  else throw new Error('Invalid passcode');
  log(s, `${s.session.name} logged in as ${s.session.role}.`);
  save(s);
  return { ...s.session, elderName: s.profile.elderName };
}
export function logout() { const s = get(); s.session = null; save(s); }
export function session() { return get().session; }

export function getDashboard() {
  const s = get();
  const meds = Object.fromEntries(s.medicines.map(m => [m.id, m]));
  const doses = s.doses.map(d => ({ ...d, medication: meds[d.medId] })).sort((a,b)=>a.scheduledAt.localeCompare(b.scheduledAt));
  return { elderName: s.profile.elderName, doses, now: new Date(nowMs()).toISOString() };
}

function doseLockMsg(d) {
  if (d.status === 'missed') {
    const at = d.takenAt ? fmtTime(d.takenAt) : fmtTime(d.scheduledAt);
    return `Missed at ${at}. Nobody logged this dose.`;
  }
  if (d.status === 'taken' || d.status === 'skipped') {
    return `Given by ${d.takenBy || 'someone'} at ${fmtTime(d.takenAt || d.scheduledAt)}`;
  }
  return '';
}

export function logDose(id, action, actorName) {
  const s = get();
  const d = s.doses.find(x => x.id === id);
  if (!d) throw new Error('Dose not found');
  if (d.status !== 'pending') {
    const msg = doseLockMsg(d);
    log(s, `Blocked: ${actorName} tried to log ${medName(s,d)} but already ${d.status}${d.takenBy ? ` by ${d.takenBy}` : ''}.`);
    save(s);
    throw new Error(msg || 'Already logged');
  }
  d.status = action;
  d.takenBy = actorName;
  d.takenAt = new Date(nowMs()).toISOString();
  log(s, `${actorName} marked ${medName(s,d)} as ${action}.`);
  save(s);
  return d;
}
function medName(s,d){ const m=s.medicines.find(x=>x.id===d.medId); return m?m.name:'medicine'; }

export function getMedicines() { return get().medicines; }

export function updateMedicine(id, updates) {
  const s = get();
  const med = s.medicines.find(m => m.id === id);
  if (!med) throw new Error('Medicine not found');
  const oldTime = med.time;
  med.name = updates.name;
  med.dose = updates.dose;
  med.time = updates.time;
  med.priority = updates.priority;
  med.changedAt = new Date(nowMs()).toISOString();
  if (oldTime !== updates.time) {
    const newSched = todayAt(updates.time, s.offsetMin);
    for (const d of s.doses) {
      if (d.medId === id) {
        d.scheduledAt = newSched;
      }
    }
  }
  log(s, `${s.session?.name || 'Someone'} edited medicine ${med.name} (${med.priority}).`);
  save(s);
  return med;
}

export function getAppointments() { return get().appointments; }
export function addAppointment(doctor, datetime) {
  const s = get();
  s.appointments.push({ id: 'a'+Math.random().toString(36).slice(2), doctor, datetime, claimedBy:'', reminded:false });
  log(s, `${s.session?.name||'Someone'} added appointment with ${doctor}.`);
  save(s);
}
export function claimAppointment(id) {
  const s = get();
  const a = s.appointments.find(x=>x.id===id);
  if (a) { a.claimedBy = s.session?.name || 'Helper'; log(s, `${a.claimedBy} claimed "I'll take her" for appointment with ${a.doctor}.`); save(s); }
}
export function getActivity() { return get().activity; }
export function getNotifications() { return get().notifications; }
export function getProfile() { return get().profile; }
export function setNotifyMode(mode) {
  const s = get();
  if (s.session?.role !== 'elder') throw new Error('Only elder can change settings');
  s.profile.notifyMode = mode;
  log(s, `${s.session.name} changed notification mode to "${mode}".`);
  save(s);
}

export function fastForward(minutes = 30) {
  const s = get();
  s.offsetMin = (s.offsetMin || 0) + minutes;
  const now = nowMs();
  for (const d of s.doses) {
    if (d.status !== 'pending') continue;
    const lateMin = Math.floor((now - new Date(d.scheduledAt).getTime()) / 60000);
    if (lateMin < 0) continue;
    const med = s.medicines.find(m => m.id === d.medId);
    if (!med) continue;
    if (med.priority === 'critical') {
      if (lateMin >= 30 && d.stage < 2) {
        notify(s, 'riya@example.com (one helper)', `Saath alert: Mrs. Sharma missed her ${med.name}`,
          `Mrs. Sharma missed her ${med.name} ${lateMin} minutes ago and hasn't responded. Please call her.`);
        notify(s, 'elder@example.com', `Saath alert: Mrs. Sharma missed her ${med.name}`,
          `Mrs. Sharma missed her ${med.name} ${lateMin} minutes ago and hasn't responded. Please check in.`);
        log(s, `Escalation: elder and one helper notified for ${med.name} (${lateMin} min late). Reason: no response.`);
        d.stage = 2;
      }
      if (lateMin >= 60 && d.stage < 3) {
        notify(s, 'all helpers', `Saath alert: Mrs. Sharma missed her ${med.name}`,
          `Mrs. Sharma missed her ${med.name} ${lateMin} minutes ago and hasn't responded. All helpers are being notified to call her now.`);
        log(s, `Escalation: all helpers notified for ${med.name} (${lateMin} min late). Marked missed.`);
        d.stage = 3; d.status = 'missed'; d.takenAt = new Date(now).toISOString();
      }
    } else {
      if (lateMin >= 30 && d.stage < 1) {
        if (s.profile.notifyMode === 'all') {
          notify(s, 'riya@example.com (one helper)', `Saath alert: Mrs. Sharma missed her ${med.name}`,
            `Mrs. Sharma missed her ${med.name} ${lateMin} minutes ago. Notification sent because settings are set to "All Missed Pills". Please check in.`);
          log(s, `Normal medicine ${med.name} missed (${lateMin} min). Helper notified (All Missed Pills).`);
        } else {
          log(s, `Normal medicine ${med.name} missed (${lateMin} min). Logged quietly (Only Important Ones).`);
        }
        d.stage = 1; d.status = 'missed'; d.takenAt = new Date(now).toISOString();
      }
    }
  }
  log(s, `${s.session?.name||'User'} fast-forwarded time by ${minutes} minutes.`);
  save(s);
  return s;
}
