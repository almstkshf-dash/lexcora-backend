const casesService = require('./casesService');
const sessionsService = require('./sessionsService');
const memosService = require('./memosService');
const casePetitionsService = require('./casePetitionsService');
const tasksService = require('./tasksService');
const caseDocumentsModel = require('../models/caseDocumentsModel');
const memosModel = require('../models/memosModel');
const casePetitionsModel = require('../models/casePetitionsModel');
const { semanticSearch } = require('./semanticSearchService');
const db = require('../config/db');

const MAX_ROWS = 20;

const detectIntent = (text = '') => {
  if (!text || typeof text !== 'string') return null;
  const normalized = text.trim().toLowerCase();

  if (normalized.startsWith('search:')) {
    return { type: 'semantic_search', query: text.slice(text.indexOf(':') + 1).trim() };
  }

  if (
    (normalized.includes('session') || normalized.includes('hearing')) &&
    (normalized.includes('week') || normalized.includes('upcoming') || normalized.includes('next'))
  ) {
    return { type: 'sessions_week' };
  }

  if (
    normalized.includes('last session') ||
    normalized.includes('latest session') ||
    (normalized.includes('session') && normalized.includes('summary'))
  ) {
    return { type: 'session_last' };
  }

  if (
    normalized.includes('list cases') ||
    (normalized.includes('cases') && (normalized.includes('show') || normalized.includes('all') || normalized.includes('recent')))
  ) {
    return { type: 'cases_recent' };
  }

  if (normalized.includes('sessions') || normalized.includes('hearing')) {
    return { type: 'sessions_by_case' };
  }

  if (normalized.includes('memo')) {
    return { type: 'memos_by_case' };
  }

  if (normalized.includes('petition')) {
    return { type: 'petitions_by_case' };
  }

  if (normalized.includes('task') || normalized.includes('deadline') || normalized.includes('todo')) {
    return { type: 'tasks_by_case' };
  }

  if (normalized.includes('legal period') || normalized.includes('appeal') || normalized.includes('cassation')) {
    return { type: 'legal_periods' };
  }

  if (normalized.includes('party') || normalized.includes('client') || normalized.includes('opponent')) {
    return { type: 'parties_by_case' };
  }

  if (normalized.includes('document') || normalized.includes('attachment') || normalized.includes('file')) {
    return { type: 'documents_by_case' };
  }

  if (normalized.includes('case overview') || normalized.includes('case summary') || normalized.includes('case info')) {
    return { type: 'case_overview' };
  }

  return null;
};

const buildTable = (title, columns, rows) => ({
  title,
  columns,
  rows: (rows || []).slice(0, MAX_ROWS)
});

const formatSources = (items, buildId, buildTitle) =>
  (items || []).slice(0, MAX_ROWS).map((item, idx) => ({
    id: buildId ? buildId(item, idx) : item.id || idx,
    title: buildTitle ? buildTitle(item, idx) : item.title || item.name || 'item',
    url: item.url || item.document_url || '',
    snippet: item.description || item.note || item.decision || ''
  }));

const fetchLegalPeriods = async () => {
  const [rows] = await db.query('SELECT * FROM legal_periods ORDER BY created_at DESC LIMIT ?', [MAX_ROWS]);
  return rows;
};

const fetchCaseOverview = async (caseId) => {
  const caseDetails = await casesService.getCaseById(caseId);
  const allDetails = await casesService.getAllCaseDetails(caseId);

  if (!caseDetails) {
    return { answer: `Case ${caseId} not found.`, sources: [], table: [] };
  }

  const flags = [];
  if (caseDetails?.is_important) flags.push('Important');
  if (caseDetails?.is_secret) flags.push('Secret');
  if (caseDetails?.is_archived) flags.push('Archived');
  if (caseDetails?.is_pending) flags.push('Pending');

  const overviewTable = buildTable('Case overview', ['Field', 'Value'], [
    { Field: 'File #', Value: caseDetails?.file_number || '' },
    { Field: 'Case #', Value: caseDetails?.case_number || '' },
    { Field: 'Topic', Value: caseDetails?.topic || '' },
    { Field: 'Court', Value: caseDetails?.court_en || caseDetails?.court_ar || '' },
    { Field: 'Type', Value: caseDetails?.case_type_en || caseDetails?.case_type_ar || '' },
    { Field: 'Start Date', Value: caseDetails?.start_date || '' },
    { Field: 'Fees', Value: caseDetails?.fees || '' },
    { Field: 'Status Flags', Value: flags.join(', ') }
  ]);

  const partiesTable = buildTable(
    'Parties',
    ['Type', 'Name', 'Phone', 'Email', 'Nationality'],
    (allDetails?.parties || []).map((p) => ({
      Type: p.type || '',
      Name: p.party_name || '',
      Phone: p.phone || '',
      Email: p.email || '',
      Nationality: p.nationality || ''
    }))
  );

  return {
    answer: `Here is the overview for case ${caseId}.`,
    sources: formatSources([{ id: caseId, title: 'Case overview', url: '' }]),
    table: [overviewTable, partiesTable].filter((t) => t.rows.length)
  };
};

const fetchSessionsByCase = async (caseId) => {
  const sessions = await sessionsService.getSessionsByCase(caseId);
  const table = buildTable(
    'Sessions',
    ['Date', 'Decision/Note', 'Ruling', 'Has Ruling', 'Link'],
    sessions.map((s) => ({
      Date: s.session_date,
      'Decision/Note': s.decision || s.note || '',
      Ruling: s.ruling || '',
      'Has Ruling': s.has_ruling ? 'Yes' : 'No',
      Link: s.link || ''
    }))
  );
  return {
    answer: `Found ${sessions.length} sessions linked to this case.`,
    sources: formatSources(sessions, (s) => s.id, (s) => `${s.session_date || ''} ${s.decision || ''}`),
    table,
    rawData: sessions
  };
};

const fetchLastSessionByCase = async (caseId) => {
  const sessions = await sessionsService.getSessionsByCase(caseId);
  if (!sessions || sessions.length === 0) {
    return { answer: 'No sessions found for this case.', sources: [], table: [], rawData: [] };
  }

  const sorted = [...sessions].sort((a, b) => new Date(b.session_date || 0) - new Date(a.session_date || 0));
  const last = sorted[0];
  let documents = [];
  try {
    documents = await sessionsService.getSessionDocuments(last.id);
  } catch (err) {
    console.warn('Could not load documents for last session', err?.message);
  }

  const summaryParts = [
    last.session_date ? `Date: ${last.session_date}` : '',
    last.decision ? `Decision: ${last.decision}` : '',
    last.ruling ? `Ruling: ${last.ruling}` : '',
    last.note ? `Notes: ${last.note}` : '',
    documents.length ? `Documents: ${documents.length}` : '',
    last.has_ruling ? 'Has ruling recorded' : ''
  ].filter(Boolean);

  const table = buildTable('Last session', ['Date', 'Decision', 'Ruling', 'Note', 'Link'], [
    {
      Date: last.session_date || '',
      Decision: last.decision || '',
      Ruling: last.ruling || '',
      Note: last.note || '',
      Link: last.link || ''
    }
  ]);

  const documentsTable =
    documents.length > 0
      ? buildTable(
          'Last session documents',
          ['Name', 'URL', 'Uploaded By', 'Created'],
          documents.map((d) => ({
            Name: d.document_name || d.name || '',
            URL: d.document_url || d.url || '',
            'Uploaded By': d.uploaded_by || '',
            Created: d.created_at || ''
          }))
        )
      : null;

  const documentSources = formatSources(
    documents,
    (d, idx) => `session-doc-${last.id}-${idx}`,
    (d) => d.document_name || d.name || 'Session document'
  );

  return {
    answer: summaryParts.length ? summaryParts.join(' | ') : 'Retrieved the most recent session.',
    sources: [...formatSources([last], (s) => s.id, (s) => `Session ${s.session_date || ''}`), ...documentSources],
    table: documentsTable ? [table, documentsTable] : [table],
    rawData: [last, ...(documents || [])]
  };
};

const fetchSessionsThisWeek = async () => {
  const sessions = await sessionsService.getSessionsInThisWeek();
  const table = buildTable(
    'Sessions (this week)',
    ['Date', 'Case', 'Decision', 'Status', 'Link'],
    (sessions || []).map((s) => ({
      Date: s.session_date || '',
      Case: s.case_number || s.file_number || s.case_id || '',
      Decision: s.decision || s.ruling || '',
      Status: s.status || (s.has_ruling ? 'has ruling' : ''),
      Link: s.link || ''
    }))
  );

  return {
    answer: `Found ${sessions?.length || 0} sessions scheduled this week.`,
    sources: formatSources(sessions, (s) => s.id, (s) => `${s.session_date || ''} ${s.decision || ''}`),
    table,
    rawData: sessions
  };
};

const fetchRecentCases = async () => {
  const result = await casesService.getAllCases({ page: 1, limit: MAX_ROWS, sortBy: 'start_date', sortOrder: 'DESC' });
  const caseRows = result?.cases || result || [];
  const table = buildTable(
    'Cases',
    ['File #', 'Case #', 'Topic', 'Start Date', 'Status'],
    caseRows.map((c) => ({
      'File #': c.file_number || '',
      'Case #': c.case_number || '',
      Topic: c.topic || '',
      'Start Date': c.start_date || '',
      Status: c.status || ''
    }))
  );

  return {
    answer: `Here are up to ${caseRows.length} recent cases.`,
    sources: formatSources(caseRows, (c) => c.id, (c) => c.case_number || c.file_number || 'Case'),
    table,
    rawData: caseRows
  };
};

const fetchMemosByCase = async (caseId) => {
  const memos = await memosService.getMemosByCaseId(caseId);
  const table = buildTable(
    'Memos',
    ['Title', 'Submission Date', 'Status', 'Created By'],
    memos.map((m) => ({
      Title: m.title,
      'Submission Date': m.submission_date,
      Status: m.status || '',
      'Created By': m.created_by_name || m.created_by || ''
    }))
  );
  return {
    answer: `Found ${memos.length} memos for this case.`,
    sources: formatSources(memos, (m) => m.id, (m) => m.title || `Memo ${m.id}`),
    table,
    rawData: memos
  };
};

const fetchPetitionsByCase = async (caseId) => {
  const petitions = await casePetitionsService.getCasePetitionsByCaseId(caseId);
  const table = buildTable(
    'Petitions',
    ['Type', 'Date', 'Decision', 'Appeal Date'],
    petitions.map((p) => ({
      Type: p.type || '',
      Date: p.date || '',
      Decision: p.decision || '',
      'Appeal Date': p.appeal_date || ''
    }))
  );
  return {
    answer: `Found ${petitions.length} petitions for this case.`,
    sources: formatSources(petitions, (p) => p.id, (p) => `${p.type || 'Petition'} ${p.date || ''}`),
    table,
    rawData: petitions
  };
};

const fetchTasksByCase = async (caseId) => {
  const tasks = await tasksService.getTasksByCaseId(caseId);
  const table = buildTable(
    'Tasks',
    ['Title', 'Status', 'Priority', 'Due Date', 'Assigned To'],
    tasks.map((t) => ({
      Title: t.title,
      Status: t.status || '',
      Priority: t.priority || '',
      'Due Date': t.due_date || '',
      'Assigned To': t.assigned_to || ''
    }))
  );
  return {
    answer: `Found ${tasks.length} tasks for this case.`,
    sources: formatSources(tasks, (t) => t.id, (t) => t.title || `Task ${t.id}`),
    table,
    rawData: tasks
  };
};

const fetchLegalPeriodsForAssistant = async () => {
  const periods = await fetchLegalPeriods();
  const table = buildTable(
    'Legal periods',
    ['Name', 'Objection Days', 'Appeal Days', 'Cassation Days'],
    periods.map((p) => ({
      Name: p.name,
      'Objection Days': p.objection_days || '',
      'Appeal Days': p.appeal_days || '',
      'Cassation Days': p.cassation_days || ''
    }))
  );
  return {
    answer: `Loaded ${periods.length} legal period configurations.`,
    sources: formatSources(periods, (p) => p.id, (p) => p.name),
    table,
    rawData: periods
  };
};

const fetchPartiesByCase = async (caseId) => {
  const details = await casesService.getAllCaseDetails(caseId);
  const parties = details?.parties || [];
  const table = buildTable(
    'Parties',
    ['Type', 'Name', 'Phone', 'Email'],
    parties.map((p) => ({
      Type: p.type || '',
      Name: p.party_name || '',
      Phone: p.phone || '',
      Email: p.email || ''
    }))
  );
  return {
    answer: `Found ${parties.length} parties linked to this case.`,
    sources: formatSources(parties, (_, idx) => `${caseId}:party:${idx}`, (p) => p.party_name || 'Party'),
    table,
    rawData: parties
  };
};

const fetchDocumentsByCase = async (caseId) => {
  const [caseDocs, memos, petitions, sessions] = await Promise.all([
    caseDocumentsModel.getCaseDocumentsByCaseId(caseId).catch(() => []),
    memosModel.getMemosByCaseId(caseId).catch(() => []),
    casePetitionsModel.getCasePetitionsByCaseId(caseId).catch(() => []),
    sessionsService.getSessionsByCase(caseId).catch(() => [])
  ]);

  const memoDocs = [];
  for (const memo of memos.slice(0, MAX_ROWS)) {
    try {
      const docs = await memosModel.getDocumentsByMemoId(memo.id);
      memoDocs.push(...docs.map((d) => ({ ...d, parentTitle: memo.title })));
    } catch {
      /* ignore */
    }
  }

  const petitionDocs = [];
  for (const petition of petitions.slice(0, MAX_ROWS)) {
    try {
      const docs = await casePetitionsModel.getCasePetitionDocuments(petition.id);
      petitionDocs.push(...docs.map((d) => ({ ...d, parentTitle: petition.type })));
    } catch {
      /* ignore */
    }
  }

  const sessionDocs = [];
  for (const session of sessions.slice(0, 5)) {
    try {
      const docs = await sessionsService.getSessionDocuments(session.id);
      sessionDocs.push(
        ...docs.map((d) => ({ ...d, parentTitle: session.decision || session.note, sessionDate: session.session_date }))
      );
    } catch {
      /* ignore */
    }
  }

  const table = buildTable(
    'Documents',
    ['Type', 'Name', 'URL', 'Related To'],
    [
      ...caseDocs.map((d) => ({ Type: 'Case', Name: d.name || d.document_name, URL: d.url || d.document_url, 'Related To': 'Case' })),
      ...sessionDocs.map((d) => ({
        Type: 'Session',
        Name: d.document_name,
        URL: d.document_url,
        'Related To': d.sessionDate || ''
      })),
      ...memoDocs.map((d) => ({ Type: 'Memo', Name: d.document_name, URL: d.document_url, 'Related To': d.parentTitle || '' })),
      ...petitionDocs.map((d) => ({
        Type: 'Petition',
        Name: d.document_name,
        URL: d.document_url,
        'Related To': d.parentTitle || ''
      }))
    ].slice(0, MAX_ROWS)
  );

  const sources = [
    ...formatSources(caseDocs, (d) => d.id, (d) => d.name || d.document_name || 'Case document'),
    ...formatSources(sessionDocs, (d, idx) => `session-doc-${idx}`, (d) => d.document_name || 'Session document'),
    ...formatSources(memoDocs, (d, idx) => `memo-doc-${idx}`, (d) => d.document_name || 'Memo document'),
    ...formatSources(petitionDocs, (d, idx) => `petition-doc-${idx}`, (d) => d.document_name || 'Petition document')
  ];

  return {
    answer: `Aggregated ${sources.length} document references for this case.`,
    sources,
    table,
    rawData: {
      caseDocuments: caseDocs,
      memoDocuments: memoDocs,
      petitionDocuments: petitionDocs,
      sessionDocuments: sessionDocs
    }
  };
};

const fetchSemanticSearch = async (query, caseId) => {
  const results = await semanticSearch(query, { caseId, limit: MAX_ROWS });
  const table = buildTable(
    'Search results',
    ['Title', 'URL', 'Snippet', 'Source'],
    results.map((r) => ({
      Title: r.title,
      URL: r.url || '',
      Snippet: r.snippet || '',
      Source: r.sourceType
    }))
  );
  return {
    answer: `Search results for "${query}"`,
    sources: results.map((r) => ({
      id: r.id,
      title: r.title,
      url: r.url,
      snippet: r.snippet,
      chunk: r.chunk,
      sourceType: r.sourceType
    })),
    table,
    rawData: results
  };
};

const fetchDataForIntent = async (intent, context = {}) => {
  if (!intent) return null;
  const caseId = context.caseId || context.case_id;

  switch (intent.type) {
    case 'semantic_search':
      return fetchSemanticSearch(intent.query, caseId);
    case 'sessions_week':
      return fetchSessionsThisWeek();
    case 'cases_recent':
      return fetchRecentCases();
    case 'sessions_by_case':
      if (!caseId) return { answer: 'Provide a caseId to list sessions.', sources: [], table: [] };
      return fetchSessionsByCase(caseId);
    case 'session_last':
      if (!caseId) return { answer: 'Provide a caseId to fetch the latest session.', sources: [], table: [] };
      return fetchLastSessionByCase(caseId);
    case 'memos_by_case':
      if (!caseId) return { answer: 'Provide a caseId to list memos.', sources: [], table: [] };
      return fetchMemosByCase(caseId);
    case 'petitions_by_case':
      if (!caseId) return { answer: 'Provide a caseId to list petitions.', sources: [], table: [] };
      return fetchPetitionsByCase(caseId);
    case 'tasks_by_case':
      if (!caseId) return { answer: 'Provide a caseId to list tasks.', sources: [], table: [] };
      return fetchTasksByCase(caseId);
    case 'legal_periods':
      return fetchLegalPeriodsForAssistant();
    case 'parties_by_case':
      if (!caseId) return { answer: 'Provide a caseId to list parties.', sources: [], table: [] };
      return fetchPartiesByCase(caseId);
    case 'documents_by_case':
      if (!caseId) return { answer: 'Provide a caseId to list documents.', sources: [], table: [] };
      return fetchDocumentsByCase(caseId);
    case 'case_overview':
      if (!caseId) return { answer: 'Provide a caseId to show the case overview.', sources: [], table: [] };
      return fetchCaseOverview(caseId);
    default:
      return null;
  }
};

module.exports = {
  detectIntent,
  fetchDataForIntent
};
