const { enqueueJob, getJob, listJobs } = require('../jobs/jobQueue');

const createJob = async (req, res) => {
  try {
    const { type, payload } = req.body || {};
    if (!type) return res.fail('Job type is required', 400, 'VALIDATION_ERROR');

    const job = await enqueueJob(type, payload || {});
    return res.created({ id: job.id, status: job.status }, 'Job queued');
  } catch (error) {
    return res.fail(error.message || 'Failed to queue job', 500, 'JOB_CREATE_ERROR');
  }
};

const getJobStatus = async (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.fail('Job not found', 404, 'NOT_FOUND');
  return res.success(job, 'Job status');
};

const listQueuedJobs = async (req, res) => {
  const jobs = listJobs();
  return res.success(jobs, 'Jobs list');
};

module.exports = {
  createJob,
  getJobStatus,
  listQueuedJobs
};
