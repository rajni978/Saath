const mongoose = require('mongoose');

const DoseSchema = new mongoose.Schema({
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true },
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  scheduledAt: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'taken', 'skipped', 'missed'], default: 'pending' },
  takenBy: { type: String, default: '' },
  takenAt: { type: Date },
  stage: { type: Number, default: 0 },
});

module.exports = mongoose.model('Dose', DoseSchema);
