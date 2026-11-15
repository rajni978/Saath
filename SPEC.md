# Saath: hackathon prototype spec

Stack: MERN. MongoDB (Mongoose), Express, React (Vite, in /client), Node (in /server). Tailwind CSS only for styling. No other UI library, no extra features.

BRANDING: App name "Saath" (tagline: "Care, together. Quiet until it matters."). Use in header, login page, page title, email subjects (e.g. "Saath alert: Mrs. Sharma missed her insulin"). Email sender name: "Saath Care".

CONCEPT: A shared care page where an elder and helpers (family/caretakers) manage medicines and appointments using passcodes. Critical missed doses escalate step by step, with a reason in every email. The elder chooses whether helpers hear about all missed pills or only important ones.

UI RULES: Very large text, high contrast, big green "Taken" and red "Skip" buttons, mobile-friendly, elder-friendly. Tailwind only.

MONGOOSE MODELS (server/models), exactly these six:
- Profile: elderName, adminCode, helperCode, notifyMode ('important'|'all', default 'important'), timeOffsetMin (Number, default 0)
- Member: profileId, name, email, role ('elder'|'helper')
- Medication: profileId, name, dose, times [String HH:MM], priority ('critical'|'normal'), changedAt
- Dose: medicationId, profileId, scheduledAt (Date), status ('pending'|'taken'|'skipped'|'missed'), takenBy, takenAt, stage (Number, default 0)
- Appointment: profileId, doctor, datetime, claimedBy, reminded (Boolean)
- Activity: profileId, text, createdAt

SERVER RULES:
1. Login: POST /api/login with {passcode}. Match adminCode -> role 'elder', helperCode -> role 'helper'. Return a JWT containing profileId, role and name. Middleware checks the JWT on all other routes. Only the elder can change notifyMode.
2. Time: every time check uses new Date() + profile.timeOffsetMin minutes, so Fast-forward just increases timeOffsetMin.
3. GET /api/doses/today: generate today's Dose documents from each medication's times if missing, then return them with medication details.
4. DOSE LOCK: POST /api/doses/:id/log {action: 'taken'|'skipped'}. Use an atomic findOneAndUpdate with filter {_id, status:'pending'} so a second log cannot succeed. If it fails, return 409 with "Already given by X at HH:MM" and write the blocked attempt to Activity.
5. Medicines CRUD (/api/medications), Appointments CRUD + claim (/api/appointments), GET /api/activity, PATCH /api/settings (elder only, logs the change).
6. Escalation: runTick() called by setInterval every 20 seconds and by POST /api/tick. For each pending dose late by N minutes (use 15/30/60, but 10/20/40 if the medication changedAt is within 7 days):
   - Critical: stage 1 at 15 min -> email the elder a reminder; stage 2 at 30 min -> email ONE helper with the reason; stage 3 at 60 min -> email ALL helpers. Each stage fires only once.
   - Normal: if notifyMode is 'all' -> email one helper at 30 min; if 'important' -> mark 'missed' and log quietly in Activity.
   - Every email states WHY, e.g. "Mrs. Sharma missed her insulin 30 minutes ago and hasn't responded. Please call her."
   - Appointments: remind once when within 24 hours.
7. DEMO ROUTES: POST /api/demo/fastforward {minutes} (adds to timeOffsetMin, then runs tick) and POST /api/demo/reset which wipes and reseeds Mrs. Sharma: passcodes SAATH-ELDER / SAATH-HELP, members Riya (daughter) and Arjun (son), medicines Insulin (critical, 08:00), BP tablet (critical, 13:00), Vitamin D (normal, 20:00), and one appointment with Dr. Mehta tomorrow.
8. EMAIL: nodemailer using SMTP_USER/SMTP_PASS from env. If missing, console.log the email instead of failing.

CLIENT PAGES (React Router): Login, Dashboard (today's doses with Taken/Skip), Medicines, Appointments, Activity log, Settings (elder only: notify mode toggle), and a small Demo panel with "Fast-forward 30 min" and "Reset demo" buttons. Dashboard polls /api/doses/today every 10 seconds.

WORK IN STEPS. Do only what is asked, then stop. Keep code simple and readable.
