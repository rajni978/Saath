const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  name: { type: String, required: true },
  dose: { type: String, default: '' },
  times: [{ type: String }],
  priority: { type: String, enum: ['critical', 'normal'], default: 'normal' },
  changedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Medication', MedicationSchema);
