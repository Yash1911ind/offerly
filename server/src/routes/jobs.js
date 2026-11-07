const express = require('express');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, authorize } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../utils/ApiError');

const router = express.Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const EDITABLE = ['company', 'title', 'description', 'location', 'type', 'ctc', 'minCgpa', 'eligibleBranches', 'deadline', 'status'];
const pick = (body) => Object.fromEntries(EDITABLE.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

// Returns { jobId: count } for the given job ids
async function countApplications(jobIds) {
  const rows = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    { $group: { _id: '$job', count: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((r) => [String(r._id), r.count]));
}

// GET /api/jobs?search=&type=&status=  -> public list with search & filters
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search, type, status } = req.query;
    const filter = {};
    if (search && search.trim()) {
      const rx = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ company: rx }, { title: rx }, { location: rx }];
    }
    if (type) filter.type = type;
    if (status) filter.status = status;

    const jobs = await Job.find(filter).sort({ createdAt: -1 }).populate('postedBy', 'name').lean();
    const counts = await countApplications(jobs.map((j) => j._id));
    res.json(jobs.map((j) => ({ ...j, applicationCount: counts[String(j._id)] || 0 })));
  })
);

// GET /api/jobs/:id  -> single job
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email').lean();
    if (!job) throw new ApiError(404, 'Job not found');
    const counts = await countApplications([job._id]);
    res.json({ ...job, applicationCount: counts[String(job._id)] || 0 });
  })
);

// POST /api/jobs  -> admin: publish a new job
router.post(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const job = await Job.create({ ...pick(req.body), postedBy: req.user._id });
    res.status(201).json(job);
  })
);

// PUT /api/jobs/:id  -> admin: update a job
router.put(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const job = await Job.findByIdAndUpdate(req.params.id, pick(req.body), {
      new: true,
      runValidators: true,
    });
    if (!job) throw new ApiError(404, 'Job not found');
    res.json(job);
  })
);

// DELETE /api/jobs/:id  -> admin: delete a job and all its applications
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) throw new ApiError(404, 'Job not found');
    const { deletedCount } = await Application.deleteMany({ job: job._id });
    res.json({ message: `Deleted "${job.title}" and ${deletedCount} application(s)`, id: job._id });
  })
);

module.exports = router;
