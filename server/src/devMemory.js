// Development helper: runs the API against an in-memory MongoDB with demo data,
// so the project can be demoed without installing MongoDB. Data resets on restart.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-memory-secret';

const { MongoMemoryServer } = require('mongodb-memory-server');
const start = require('./server');
const seedDatabase = require('./seedData');

(async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri('placement_tracker');
  await start(uri);
  const result = await seedDatabase();
  console.log('In-memory database seeded:', result);
  console.log('Admin login:   admin@cu.edu / admin123');
  console.log('Student login: aarav@cu.edu / student123');

  const shutdown = async () => {
    await mongod.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
