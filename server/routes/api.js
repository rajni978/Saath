const express = require('express');
const jwt = require('jsonwebtoken');
const Profile = require('../models/Profile');
const Member = require('../models/Member');
const Medication = require('../models/Medication');
const Dose = require('../models/Dose');
const Appointment = require('../models/Appointment');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');
const { ensureTodayDoses, runTick } = require('../utils/tick');
const { resetAndSeed } = require('../utils/seed');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { passcode } = req.body;
    let profile = await Profile.findOne({ $or: [{ adminCode: passcode }, { helperCode: passcode }] });
    if (!profile) {
      // auto-seed if empty DB for demo convenience
      const count = await Profile.countDocuments();
      if (count === 0) profile = await resetAndSeed();
      profile = await Profile.findOne({ $or: [{ adminCode: passcode }, { helperCode: passcode }] });
    }
    if (!profile) return res.status(401).json({ message: 'Invalid passcode' });
    const role = passcode === profile.adminCode ? 'elder' : 'helper';
    const member = await Member.findOne({ profileId: profile._id, role });
    const name = member ? member.name : (role === 'elder' ? profile.elderName : 'Helper');
    const token = jwt.sign({ profileId: profile._id, role, name }, process.env.JWT_SECRET || 'saath_hackathon_secret', { expiresIn: '7d' });
    res.json({ token, role, name, elderName: profile.elderName, profileId: profile._id });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Profile/settings
router.get('/profile', auth, async (req, res) => {
  const profile = await Profile.findById(req.user.profileId);
  res.json(profile);
});

router.patch('/settings', auth, async (req, res) => {
  if (req.user.role !== 'elder') return res.status(403).json({ message: 'Only elder can change settings' });
  const { notifyMode } = req.body;
  const profile = await Profile.findByIdAndUpdate(req.user.profileId, { notifyMode }, { new: true });
  await Activity.create({ profileId: profile._id, text: `${req.user.name} changed notification mode to "${notifyMode}".` });
  res.json(profile);
});

// Medications
router.get('/medications', auth, async (req, res) => {
  const meds = await Medication.find({ profileId: req.user.profileId }).sort({ name: 1 });
  res.json(meds);
});

router.post('/medications', auth, async (req, res) => {
  const { name, dose, times, priority } = req.body;
  const med = await Medication.create({
    profileId: req.user.profileId,
    name, dose, times: times || [], priority: priority || 'normal', changedAt: new Date()
  });
  await Activity.create({ profileId: req.user.profileId, text: `${req.user.name} added medicine ${name}.` });
  res.json(med);
});

router.put('/medications/:id', auth, async (req, res) => {
  const { name, dose, times, priority } = req.body;
  const med = await Medication.findOneAndUpdate(
    { _id: req.params.id, profileId: req.user.profileId },
    { name, dose, times, priority, changedAt: new Date() },
    { new: true }
  );
  await Activity.create({ profileId: req.user.profileId, text: `${req.user.name} updated medicine ${name}.` });
  res.json(med);
});

router.delete('/medications/:id', auth, async (req, res) => {
  const med = await Medication.findOneAndDelete({ _id: req.params.id, profileId: req.user.profileId });
  if (med) {
    await Dose.deleteMany({ medicationId: med._id });
    await Activity.create({ profileId: req.user.profileId, text: `${req.user.name} deleted medicine ${med.name}.` });
  }
  res.json({ ok: true });
});

// Doses
router.get('/doses/today', auth, async (req, res) => {
  const profile = await Profile.findById(req.user.profileId);
  await ensureTodayDoses(profile);
  const { startOfDay, endOfDay, getNow } = require('../utils/time');
  const now = await getNow(profile);
  const doses = await Dose.find({
    profileId: req.user.profileId,
    scheduledAt: { $gte: startOfDay(now), $lte: endOfDay(now) }
  }).populate('medicationId').sort({ scheduledAt: 1 });
  res.json({ doses, now, elderName: profile.elderName });
});

router.post('/doses/:id/log', auth, async (req, res) => {
  const { action } = req.body; // taken | skipped
  const now = new Date();
  const dose = await Dose.findOneAndUpdate(
    { _id: req.params.id, profileId: req.user.profileId, status: 'pending' },
    { status: action, takenBy: req.user.name, takenAt: now },
    { new: true }
  ).populate('medicationId');
  if (!dose) {
    const existing = await Dose.findById(req.params.id).populate('medicationId');
    if (existing) {
      const t = existing.takenAt ? new Date(existing.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      await Activity.create({
        profileId: req.user.profileId,
        text: `Blocked: ${req.user.name} tried to log ${existing.medicationId?.name || 'dose'} but already ${existing.status} by ${existing.takenBy} at ${t}.`
      });
      return res.status(409).json({ message: `Already given by ${existing.takenBy} at ${t}` });
    }
    return res.status(404).json({ message: 'Dose not found' });
  }
  await Activity.create({
    profileId: req.user.profileId,
    text: `${req.user.name} marked ${dose.medicationId?.name || 'medicine'} as ${action}.`
  });
  res.json(dose);
});

// Appointments
router.get('/appointments', auth, async (req, res) => {
  const items = await Appointment.find({ profileId: req.user.profileId }).sort({ datetime: 1 });
  res.json(items);
});

router.post('/appointments', auth, async (req, res) => {
  const { doctor, datetime } = req.body;
  const appt = await Appointment.create({ profileId: req.user.profileId, doctor, datetime, claimedBy: '', reminded: false });
  await Activity.create({ profileId: req.user.profileId, text: `${req.user.name} added appointment with ${doctor}.` });
  res.json(appt);
});

router.post('/appointments/:id/claim', auth, async (req, res) => {
  const appt = await Appointment.findOneAndUpdate(
    { _id: req.params.id, profileId: req.user.profileId },
    { claimedBy: req.user.name },
    { new: true }
  );
  if (appt) await Activity.create({ profileId: req.user.profileId, text: `${req.user.name} claimed "I'll take her" for appointment with ${appt.doctor}.` });
  res.json(appt);
});

// Activity
router.get('/activity', auth, async (req, res) => {
  const items = await Activity.find({ profileId: req.user.profileId }).sort({ createdAt: -1 }).limit(100);
  res.json(items);
});

// Demo
router.post('/demo/fastforward', auth, async (req, res) => {
  const minutes = Number(req.body.minutes || 30);
  await Profile.findByIdAndUpdate(req.user.profileId, { $inc: { timeOffsetMin: minutes } });
  await runTick();
  await Activity.create({ profileId: req.user.profileId, text: `${req.user.name} fast-forwarded time by ${minutes} minutes.` });
  res.json({ ok: true });
});

router.post('/demo/reset', auth, async (req, res) => {
  await resetAndSeed();
  res.json({ ok: true });
});

router.post('/tick', auth, async (req, res) => {
  await runTick();
  res.json({ ok: true });
});

module.exports = router;
