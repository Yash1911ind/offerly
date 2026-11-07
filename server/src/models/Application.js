const mongoose = require('mongoose');

const STATUSES = ['applied', 'shortlisted', 'interview', 'selected', 'rejected'];

const applicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    status: {
      type: String,
      enum: { values: STATUSES, message: 'Invalid application status' },
      default: 'applied',
    },
    coverNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Cover note cannot exceed 500 characters'],
    },
    resumeLink: {
      type: String,
      trim: true,
      match: [/^https?:\/\/\S+$/, 'Resume link must be a valid http(s) URL'],
    },
    adminRemark: { type: String, trim: true, maxlength: [300, 'Remark cannot exceed 300 characters'] },
  },
  { timestamps: true }
);

// BUSINESS RULE: a student cannot apply twice to the same job.
// Enforced at the database level by a compound unique index
// (the route also checks first so it can return a friendly message).
applicationSchema.index({ student: 1, job: 1 }, { unique: true });

applicationSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('Application', applicationSchema);
