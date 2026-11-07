const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [80, 'Company name cannot exceed 80 characters'],
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    location: { type: String, trim: true, default: 'On-site' },
    type: {
      type: String,
      enum: { values: ['Full-time', 'Internship'], message: 'Type must be Full-time or Internship' },
      default: 'Full-time',
    },
    // LPA for full-time roles, thousand / month for internships
    ctc: {
      type: Number,
      required: [true, 'CTC / stipend is required'],
      min: [0, 'CTC cannot be negative'],
    },
    minCgpa: {
      type: Number,
      default: 0,
      min: [0, 'Minimum CGPA cannot be below 0'],
      max: [10, 'Minimum CGPA cannot exceed 10'],
    },
    eligibleBranches: [{ type: String, trim: true }], // empty = all branches
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// A job accepts applications only while it is open and before its deadline (end of that day)
jobSchema.methods.isAcceptingApplications = function isAccepting() {
  const endOfDeadline = new Date(this.deadline);
  endOfDeadline.setHours(23, 59, 59, 999);
  return this.status === 'open' && endOfDeadline >= new Date();
};

module.exports = mongoose.model('Job', jobSchema);
