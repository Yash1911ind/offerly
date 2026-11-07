require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const seedDatabase = require('./seedData');

(async () => {
  try {
    await connectDB(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placement_tracker');
    const result = await seedDatabase();
    console.log('Seeded:', result);
    console.log('Admin login:   admin@cu.edu / admin123');
    console.log('Student login: aarav@cu.edu / student123  (also diya@, kabir@)');
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
