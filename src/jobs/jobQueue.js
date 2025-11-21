const { v4: uuidv4 } = require('uuid');

const workers = new Map(); // type -> async function(payload)
const jobs = new Map(); // id -> job record

const JOB_STATUSES = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

const registerWorker = (type, handler) => {
  workers.set(type, handler);
};

const getJob = (id) => jobs.get(id);

const listJobs = (limit = 50) => {
  return Array.from(jobs.values())
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
};

const enqueueJob = async (type, payload = {}) => {
  if (!workers.has(type)) {
    throw new Error(`No worker registered for type "${type}"`);
  }

  const id = uuidv4();
  const job = {
    id,
    type,
    payload,
    status: JOB_STATUSES.PENDING,
    result: null,
    error: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  jobs.set(id, job);

  // process asynchronously
  queueMicrotask(async () => {
    const handler = workers.get(type);
    job.status = JOB_STATUSES.RUNNING;
    job.updatedAt = Date.now();
    try {
      const result = await handler(payload, job);
      job.result = result || null;
      job.status = JOB_STATUSES.COMPLETED;
    } catch (err) {
      job.error = err.message || 'Job failed';
      job.status = JOB_STATUSES.FAILED;
    } finally {
      job.updatedAt = Date.now();
    }
  });

  return job;
};

module.exports = {
  registerWorker,
  enqueueJob,
  getJob,
  listJobs,
  JOB_STATUSES
};
