const Profile = require('../models/Profile');
const Member = require('../models/Member');
const Medication = require('../models/Medication');
const Dose = require('../models/Dose');
const Appointment = require('../models/Appointment');
const Activity = require('../models/Activity');
const sendEmail = require('./email');
const { getNow, startOfDay, endOfDay } = require('./time');

async function ensureTodayDoses(profile) {
  const now = await getNow(profile);
  const start = startOfDay(now);
  const end = endOfDay(now);
  const meds = await Medication.find({ profileId: profile._id });
  for (const med of meds) {
    for (const t of (med.times || [])) {
      const [h, m] = t.split(':').map(Number);
      const scheduledAt = new Date(start);
      scheduledAt.setHours(h || 0, m || 0, 0, 0);
      const exists = await Dose.findOne({ medicationId: med._id, scheduledAt: { $gte: start, $lte: end } });
      if (!exists) {
        await Dose.create({ medicationId: med._id, profileId: profile._id, scheduledAt, status: 'pending', stage: 0 });
      }
    }
  }
}

function minutesLate(now, scheduledAt) {
  return Math.floor((now - new Date(scheduledAt)) / 60000);
}

function thresholdsFor(med) {
  if (med.priority !== 'critical') return null;
  const recent = med.changedAt && (Date.now() - new Date(med.changedAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
  return recent ? [10, 20, 40] : [15, 30, 60];
}

async function runTick() {
  const profiles = await Profile.find({});
  for (const profile of profiles) {
    await ensureTodayDoses(profile);
    const now = await getNow(profile);
    const members = await Member.find({ profileId: profile._id });
    const elder = members.find(m => m.role === 'elder');
    const helpers = members.filter(m => m.role === 'helper');
    const doses = await Dose.find({ profileId: profile._id, status: 'pending' }).populate('medicationId');

    for (const dose of doses) {
      const med = dose.medicationId;
      if (!med) continue;
      const late = minutesLate(now, dose.scheduledAt);
      if (late < 0) continue;

      if (med.priority === 'critical') {
        const th = thresholdsFor(med);
        if (late >= th[0] && dose.stage < 1) {
          const subject = `Saath alert: ${profile.elderName} missed her ${med.name}`;
          const text = `${profile.elderName} missed her ${med.name} ${late} minutes ago and hasn't responded. Please check in.`;
          if (elder && elder.email) await sendEmail(elder.email, subject, text);
          dose.stage = 1;
          await dose.save();
          await Activity.create({ profileId: profile._id, text: `Critical reminder sent to elder for ${med.name} (${late} min late).` });
        } else if (late >= th[1] && dose.stage < 2) {
          const helper = helpers[0];
          const subject = `Saath alert: ${profile.elderName} missed her ${med.name}`;
          const text = `${profile.elderName} missed her ${med.name} ${late} minutes ago and hasn't responded. Please call her.`;
          if (helper && helper.email) await sendEmail(helper.email, subject, text);
          dose.stage = 2;
          await dose.save();
          await Activity.create({ profileId: profile._id, text: `Escalation: one helper notified for ${med.name} (${late} min late). Reason: elder has not responded.` });
        } else if (late >= th[2] && dose.stage < 3) {
          const subject = `Saath alert: ${profile.elderName} missed her ${med.name}`;
          const text = `${profile.elderName} missed her ${med.name} ${late} minutes ago and hasn't responded. All helpers are being notified to call her now.`;
          for (const h of helpers) {
            if (h.email) await sendEmail(h.email, subject, text);
          }
          dose.stage = 3;
          dose.status = 'missed';
          await dose.save();
          await Activity.create({ profileId: profile._id, text: `Escalation: all helpers notified for ${med.name} (${late} min late). Marked missed.` });
        }
      } else {
        if (profile.notifyMode === 'all' && late >= 30 && dose.stage < 1) {
          const helper = helpers[0];
          const subject = `Saath alert: ${profile.elderName} missed her ${med.name}`;
          const text = `${profile.elderName} missed her ${med.name} ${late} minutes ago. Notification sent because settings are set to "All Missed Pills". Please check in.`;
          if (helper && helper.email) await sendEmail(helper.email, subject, text);
          dose.stage = 1;
          dose.status = 'missed';
          await dose.save();
          await Activity.create({ profileId: profile._id, text: `Normal medicine ${med.name} missed (${late} min). Helper notified (All Missed Pills).` });
        } else if (profile.notifyMode === 'important' && late >= 30 && dose.stage < 1) {
          dose.stage = 1;
          dose.status = 'missed';
          await dose.save();
          await Activity.create({ profileId: profile._id, text: `Normal medicine ${med.name} missed (${late} min). Logged quietly (Only Important Ones).` });
        }
      }
    }

    const appointments = await Appointment.find({ profileId: profile._id, reminded: false });
    for (const appt of appointments) {
      const diff = new Date(appt.datetime) - now;
      if (diff > 0 && diff <= 24 * 60 * 60 * 1000) {
        const recipients = members.filter(m => m.email).map(m => m.email);
        const subject = `Saath reminder: appointment with ${appt.doctor}`;
        const text = `${profile.elderName} has an appointment with ${appt.doctor} within 24 hours (${new Date(appt.datetime).toLocaleString()}).`;
        for (const to of recipients) await sendEmail(to, subject, text);
        appt.reminded = true;
        await appt.save();
        await Activity.create({ profileId: profile._id, text: `Appointment reminder sent for ${appt.doctor} (within 24 hours).` });
      }
    }
  }
}

module.exports = { runTick, ensureTodayDoses };
