const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

// Clears the database and inserts demo users, jobs and applications
async function seedDatabase() {
  await Promise.all([User.deleteMany({}), Job.deleteMany({}), Application.deleteMany({})]);

  // create() (not insertMany) so the bcrypt pre-save hook hashes each password
  const admin = await User.create({ name: 'Placement Cell', email: 'admin@cu.edu', password: 'admin123', role: 'admin' });
  const [aarav, diya, kabir] = await Promise.all([
    User.create({ name: 'Aarav Sharma', email: 'aarav@cu.edu', password: 'student123', rollNo: '24BCS1001', branch: 'CSE', cgpa: 8.6 }),
    User.create({ name: 'Diya Patel', email: 'diya@cu.edu', password: 'student123', rollNo: '24BEC1042', branch: 'ECE', cgpa: 7.4 }),
    User.create({ name: 'Kabir Singh', email: 'kabir@cu.edu', password: 'student123', rollNo: '24BME1017', branch: 'ME', cgpa: 6.8 }),
  ]);

  const jobs = await Job.insertMany([
    {
      company: 'Infosys', title: 'Systems Engineer', type: 'Full-time', ctc: 6.5, location: 'Bengaluru',
      minCgpa: 6.5, eligibleBranches: [], deadline: daysFromNow(14), postedBy: admin._id,
      description: 'Join the Infosys Systems Engineer program. Training in full-stack development followed by project deployment. Strong fundamentals in programming and DBMS expected.',
    },
    {
      company: 'Microsoft', title: 'Software Engineer Intern', type: 'Internship', ctc: 80, location: 'Hyderabad',
      minCgpa: 8.0, eligibleBranches: ['CSE', 'IT'], deadline: daysFromNow(7), postedBy: admin._id,
      description: '12-week summer internship working with an Azure product team. Data structures, algorithms and one OOP language required. Stipend in thousand / month.',
    },
    {
      company: 'Texas Instruments', title: 'Analog Design Engineer', type: 'Full-time', ctc: 18, location: 'Bengaluru',
      minCgpa: 7.0, eligibleBranches: ['ECE', 'EE'], deadline: daysFromNow(10), postedBy: admin._id,
      description: 'Design and validate analog circuits for power management ICs. Coursework in analog electronics and circuit simulation tools preferred.',
    },
    {
      company: 'Tata Motors', title: 'Graduate Engineer Trainee', type: 'Full-time', ctc: 7.2, location: 'Pune',
      minCgpa: 6.0, eligibleBranches: ['ME', 'EE', 'Other'], deadline: daysFromNow(21), postedBy: admin._id,
      description: 'One-year rotational program across manufacturing, quality and product engineering in the passenger vehicles division.',
    },
    {
      company: 'Zomato', title: 'Frontend Developer Intern', type: 'Internship', ctc: 40, location: 'Remote',
      minCgpa: 0, eligibleBranches: [], deadline: daysFromNow(-2), status: 'closed', postedBy: admin._id,
      description: 'Build React interfaces for the restaurant partner dashboard. Applications for this cycle have closed.',
    },
  ]);

  await Application.insertMany([
    { student: aarav._id, job: jobs[0]._id, status: 'shortlisted', coverNote: 'I have built two MERN projects and enjoy backend work.' },
    { student: aarav._id, job: jobs[1]._id, status: 'applied', coverNote: 'Competitive programmer, 4-star on CodeChef.' },
    { student: diya._id, job: jobs[2]._id, status: 'interview', coverNote: 'Completed a VLSI design internship last summer.' },
    { student: kabir._id, job: jobs[3]._id, status: 'applied' },
  ]);
  await Application.syncIndexes(); // make sure the unique (student, job) index exists

  return { users: 4, jobs: jobs.length, applications: 4 };
}

module.exports = seedDatabase;
