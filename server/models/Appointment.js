const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  doctor: { type: String, required: true },
  datetime: { type: Date, required: true },
  claimedBy: { type: String, default: '' },
  reminded: { type: Boolean, default: false },
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
