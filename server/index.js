require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const api = require('./routes/api');
const { runTick } = require('./utils/tick');
const { resetAndSeed } = require('./utils/seed');
const Profile = require('./models/Profile');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', api);

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/saath';

mongoose.connect(MONGO).then(async () => {
  console.log('MongoDB connected');
  const count = await Profile.countDocuments();
  if (count === 0) {
    await resetAndSeed();
    console.log('Seeded demo data');
  }
  setInterval(() => { runTick().catch(console.error); }, 20000);
  app.listen(PORT, () => console.log('Server running on port', PORT));
}).catch(err => {
  console.error('Mongo connection error', err);
  process.exit(1);
});
