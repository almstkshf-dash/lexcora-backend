const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Normalize pagination and sorting inputs.
 */
const normalizePagination = (query = {}, allowedSort = []) => {
  const page = Math.max(parseInt(query.page || DEFAULT_PAGE, 10) || DEFAULT_PAGE, 1);
  const rawLimit = Math.max(parseInt(query.limit || DEFAULT_LIMIT, 10) || DEFAULT_LIMIT, 1);
  const limit = Math.min(rawLimit, MAX_LIMIT);

  let sortBy = allowedSort.includes(query.sortBy) ? query.sortBy : null;
  let sortOrder = query.sortOrder && ['asc', 'ASC', 'desc', 'DESC'].includes(query.sortOrder) ? query.sortOrder.toUpperCase() : 'DESC';

  return { page, limit, sortBy, sortOrder };
};

module.exports = {
  normalizePagination,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
};
