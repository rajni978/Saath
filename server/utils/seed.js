const Profile = require('../models/Profile');
const Member = require('../models/Member');
const Medication = require('../models/Medication');
const Dose = require('../models/Dose');
const Appointment = require('../models/Appointment');
const Activity = require('../models/Activity');

async function resetAndSeed() {
  await Promise.all([
    Profile.deleteMany({}),
    Member.deleteMany({}),
    Medication.deleteMany({}),
    Dose.deleteMany({}),
    Appointment.deleteMany({}),
    Activity.deleteMany({}),
  ]);

  const profile = await Profile.create({
    elderName: 'Mrs. Sharma',
    adminCode: 'SAATH-ELDER',
    helperCode: 'SAATH-HELP',
    notifyMode: 'important',
    timeOffsetMin: 0,
  });

  await Member.create([
    { profileId: profile._id, name: 'Mrs. Sharma', email: 'elder@example.com', role: 'elder' },
    { profileId: profile._id, name: 'Riya', email: 'riya@example.com', role: 'helper' },
    { profileId: profile._id, name: 'Arjun', email: 'arjun@example.com', role: 'helper' },
  ]);

  await Medication.create([
    { profileId: profile._id, name: 'Insulin', dose: '10 units', times: ['08:00'], priority: 'critical' },
    { profileId: profile._id, name: 'BP tablet', dose: '1 tablet', times: ['13:00'], priority: 'critical' },
    { profileId: profile._id, name: 'Vitamin D', dose: '1 capsule', times: ['20:00'], priority: 'normal' },
  ]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  await Appointment.create({
    profileId: profile._id,
    doctor: 'Dr. Mehta',
    datetime: tomorrow,
    claimedBy: '',
    reminded: false,
  });

  await Activity.create({
    profileId: profile._id,
    text: 'Demo data reset and seeded for Mrs. Sharma.',
  });

  return profile;
}

module.exports = { resetAndSeed };
