const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  name: { type: String, required: true },
  email: { type: String, default: '' },
  role: { type: String, enum: ['elder', 'helper'], required: true },
});

module.exports = mongoose.model('Member', MemberSchema);
