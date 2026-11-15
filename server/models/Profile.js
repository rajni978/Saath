const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  elderName: { type: String, required: true },
  adminCode: { type: String, required: true },
  helperCode: { type: String, required: true },
  notifyMode: { type: String, enum: ['important', 'all'], default: 'important' },
  timeOffsetMin: { type: Number, default: 0 },
});

module.exports = mongoose.model('Profile', ProfileSchema);
