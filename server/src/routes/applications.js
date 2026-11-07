const express = require('express');
const mongoose = require('mongoose');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect, authorize } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../utils/ApiError');

const router = express.Router();
router.use(protect); // every application route needs a logged-in user

const JOB_FIELDS = 'company title type ctc location deadline status minCgpa';
const STUDENT_FIELDS = 'name email rollNo branch cgpa';

// POST /api/applications  -> student: apply to a job
router.post(
  '/',
  authorize('student'),
  asyncHandler(async (req, res) => {
    const { jobId, coverNote, resumeLink } = req.body;
    if (!jobId || !mongoose.isValidObjectId(jobId)) throw new ApiError(400, 'A valid jobId is required');

    const job = await Job.findById(jobId);
    if (!job) throw new ApiError(404, 'Job not found');
    if (!job.isAcceptingApplications()) throw new ApiError(400, 'This job is no longer accepting applications');

    // Eligibility checks
    const student = req.user;
    if (job.minCgpa > 0) {
      if (student.cgpa === undefined || student.cgpa === null) {
        throw new ApiError(400, 'Add your CGPA in your profile before applying to this job');
      }
      if (student.cgpa < job.minCgpa) {
        throw new ApiError(400, `Minimum CGPA for this job is ${job.minCgpa}; yours is ${student.cgpa}`);
      }
    }
    if (job.eligibleBranches?.length && !job.eligibleBranches.includes(student.branch)) {
      throw new ApiError(400, `This job is open only to: ${job.eligibleBranches.join(', ')}`);
    }

    // BUSINESS RULE: a student cannot apply twice to the same job
    // (also guaranteed by the unique index in case of simultaneous requests)
    if (await Application.exists({ student: student._id, job: job._id })) {
      throw new ApiError(409, 'You have already applied to this job');
    }

    const application = await Application.create({
      student: student._id,
      job: job._id,
      coverNote,
      resumeLink: resumeLink || undefined,
    });
    await application.populate('job', JOB_FIELDS);
    res.status(201).json(application);
  })
);

// GET /api/applications/me  -> student: my applications
router.get(
  '/me',
  authorize('student'),
  asyncHandler(async (req, res) => {
    const apps = await Application.find({ student: req.user._id })
      .populate('job', JOB_FIELDS)
      .sort({ createdAt: -1 });
    res.json(apps);
  })
);

// GET /api/applications?job=&status=  -> admin: all applications with student + job details
router.get(
  '/',
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.job) filter.job = req.query.job;
    if (req.query.status) filter.status = req.query.status;
    const apps = await Application.find(filter)
      .populate('student', STUDENT_FIELDS)
      .populate('job', JOB_FIELDS)
      .sort({ createdAt: -1 });
    res.json(apps);
  })
);

// GET /api/applications/stats  -> admin: dashboard numbers
router.get(
  '/stats',
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const [byStatus, totalJobs, openJobs] = await Promise.all([
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Job.countDocuments(),
      Job.countDocuments({ status: 'open', deadline: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
    ]);
    const statusCounts = Object.fromEntries(Application.STATUSES.map((s) => [s, 0]));
    byStatus.forEach((r) => { statusCounts[r._id] = r.count; });
    const totalApplications = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    res.json({ totalJobs, openJobs, totalApplications, statusCounts });
  })
);

// Loads an application and checks the caller may access it
async function loadOwnedOrAdmin(req) {
  const app = await Application.findById(req.params.id);
  if (!app) throw new ApiError(404, 'Application not found');
  const isOwner = String(app.student) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'Not your application');
  return { app, isOwner };
}

// GET /api/applications/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { app } = await loadOwnedOrAdmin(req);
    await app.populate([{ path: 'job', select: JOB_FIELDS }, { path: 'student', select: STUDENT_FIELDS }]);
    res.json(app);
  })
);

// PUT /api/applications/:id
//  - admin: change status / add a remark
//  - student (owner): edit cover note / resume link while still "applied"
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { app } = await loadOwnedOrAdmin(req);

    if (req.user.role === 'admin') {
      const { status, adminRemark } = req.body;
      if (status !== undefined) app.status = status;
      if (adminRemark !== undefined) app.adminRemark = adminRemark;
    } else {
      if (app.status !== 'applied') throw new ApiError(400, 'Application is already being processed and cannot be edited');
      const { coverNote, resumeLink } = req.body;
      if (coverNote !== undefined) app.coverNote = coverNote;
      if (resumeLink !== undefined) app.resumeLink = resumeLink || undefined;
    }

    await app.save();
    await app.populate([{ path: 'job', select: JOB_FIELDS }, { path: 'student', select: STUDENT_FIELDS }]);
    res.json(app);
  })
);

// DELETE /api/applications/:id
//  - student (owner): withdraw while still "applied"
//  - admin: remove any application
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { app } = await loadOwnedOrAdmin(req);
    if (req.user.role !== 'admin' && app.status !== 'applied') {
      throw new ApiError(400, 'You can only withdraw an application before it is shortlisted');
    }
    await app.deleteOne();
    res.json({ message: 'Application withdrawn', id: app._id });
  })
);

module.exports = router;
