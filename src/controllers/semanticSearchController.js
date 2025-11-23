const { semanticSearch } = require('../services/semanticSearchService');

const search = async (req, res) => {
  try {
    const query = req.query.q || req.query.query;
    const caseId = req.query.caseId || req.query.case_id || null;
    const limit = Math.min(parseInt(req.query.limit || '8', 10), 25);

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.fail('query is required', 400, 'VALIDATION_ERROR');
    }

    const results = await semanticSearch(query.trim(), { caseId, limit });
    return res.success(results, 'Semantic search results');
  } catch (err) {
    console.error('Semantic search failed:', err);
    return res.fail('Search failed', 500, 'SEMANTIC_SEARCH_ERROR');
  }
};

module.exports = {
  search
};
