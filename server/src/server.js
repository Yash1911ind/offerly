require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placement_tracker';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Copy server/.env.example to server/.env and set it.');
  process.exit(1);
}

async function start(uri = MONGO_URI) {
  await connectDB(uri);
  return app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}

if (require.main === module) {
  start().catch((err) => {
    console.error('Failed to start server:', err.message);
    console.error('Is MongoDB running? Try "npm run dev:memory" to use an in-memory database instead.');
    process.exit(1);
  });
}

module.exports = start;
