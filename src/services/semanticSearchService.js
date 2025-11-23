const { bulkUpsert, search: searchIndex } = require('../models/semanticIndexModel');
const caseDocumentsModel = require('../models/caseDocumentsModel');
const casePetitionsModel = require('../models/casePetitionsModel');
const memosModel = require('../models/memosModel');
const sessionsService = require('./sessionsService');
const tasksService = require('./tasksService');
const { STATIC_PAGES } = require('../utils/staticContent');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const MAX_ITEMS = 25;
const MAX_TEXT_CHARS = 800;
let staticSeeded = false;

const seedStaticPages = async () => {
  if (staticSeeded) return;
  staticSeeded = true;
  const chunks = STATIC_PAGES.map((page, idx) => ({
    sourceType: 'static_page',
    sourceId: `static:${page.route}`,
    title: page.title,
    content: page.content,
    url: page.route,
    metadata: { route: page.route, type: 'static' },
    chunkIndex: idx
  }));

  await bulkUpsert(chunks);
};

const buildDocumentChunks = (documents = [], { caseId = null, type = 'document' } = {}) =>
  documents.slice(0, MAX_ITEMS).map((doc, idx) => ({
    sourceType: type,
    sourceId: `${type}:${doc.id || doc.document_url || doc.url || doc.name || idx}`,
    title: doc.document_name || doc.name || doc.title || 'Document',
    content: [
      doc.document_name || doc.name || '',
      doc.title || '',
      doc.description || '',
      doc.note || '',
      doc.status || '',
      doc.session_date || doc.date || ''
    ]
      .filter(Boolean)
      .join(' | '),
    url: doc.document_url || doc.url || '',
    metadata: { caseId, type },
    chunkIndex: idx
  }));

const indexCaseArtifacts = async (caseId) => {
  if (!caseId) return;

  const [caseDocs, petitions, memos, sessions, tasks] = await Promise.all([
    caseDocumentsModel.getCaseDocumentsByCaseId(caseId).catch(() => []),
    casePetitionsModel.getCasePetitionsByCaseId(caseId).catch(() => []),
    memosModel.getMemosByCaseId(caseId).catch(() => []),
    sessionsService.getSessionsByCase(caseId).catch(() => []),
    tasksService.getTasksByCaseId(caseId).catch(() => [])
  ]);

  const sessionDocs = [];
  for (const session of sessions.slice(0, 5)) {
    try {
      const docs = await sessionsService.getSessionDocuments(session.id);
      sessionDocs.push(
        ...docs.map((d) => ({
          ...d,
          session_date: session.session_date,
          title: session.decision || session.note
        }))
      );
    } catch (err) {
      console.warn('semantic_index: could not load session docs', err?.message);
    }
  }

  const memoDocs = [];
  for (const memo of memos.slice(0, 5)) {
    try {
      const docs = await memosModel.getDocumentsByMemoId(memo.id);
      memoDocs.push(
        ...docs.map((d) => ({
          ...d,
          document_name: d.document_name || d.name,
          title: memo.title,
          description: memo.description
        }))
      );
    } catch (err) {
      console.warn('semantic_index: could not load memo docs', err?.message);
    }
  }

  const petitionDocs = [];
  for (const petition of petitions.slice(0, 5)) {
    try {
      const docs = await casePetitionsModel.getCasePetitionDocuments(petition.id);
      petitionDocs.push(
        ...docs.map((d) => ({
          ...d,
          document_name: d.document_name || d.name,
          title: petition.type,
          description: petition.decision
        }))
      );
    } catch (err) {
      console.warn('semantic_index: could not load petition docs', err?.message);
    }
  }

  const chunks = [
    ...buildDocumentChunks(caseDocs, { caseId, type: 'case_document' }),
    ...buildDocumentChunks(sessionDocs, { caseId, type: 'session_document' }),
    ...buildDocumentChunks(memoDocs, { caseId, type: 'memo_document' }),
    ...buildDocumentChunks(petitionDocs, { caseId, type: 'petition_document' }),
    tasks
      .slice(0, MAX_ITEMS)
      .map((task, idx) => ({
        sourceType: 'task',
        sourceId: `task:${task.id || idx}`,
        title: task.title || 'Task',
        content: [task.description || '', task.status || '', task.priority || '', task.due_date || '']
          .filter(Boolean)
          .join(' | '),
        url: '',
        metadata: { caseId, type: 'task', status: task.status },
        chunkIndex: idx
      }))
  ];

  await bulkUpsert(chunks.flat());
};

const createSnippet = (content = '', query = '') => {
  if (!content) return '';
  const lower = content.toLowerCase();
  const idx = lower.indexOf((query || '').toLowerCase());
  if (idx === -1) {
    return content.slice(0, 180);
  }
  const start = Math.max(0, idx - 60);
  const end = Math.min(content.length, idx + 120);
  return content.slice(start, end);
};

const semanticSearch = async (query, { caseId = null, limit = 8 } = {}) => {
  if (!query || typeof query !== 'string') return [];
  await seedStaticPages();
  if (caseId) {
    await indexCaseArtifacts(caseId);
  }

  const results = await searchIndex(query, { limit });
  return results.map((row) => {
    let metadata = row.metadata;
    if (metadata && typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch {
        metadata = { raw: row.metadata };
      }
    }
    return {
      id: row.id,
      title: row.title,
      url: row.url,
      content: row.content,
      snippet: createSnippet(row.content, query),
      sourceType: row.source_type,
      metadata: metadata || {},
      chunk: row.chunk_index
    };
  });
};

const chunkText = (text = '', size = MAX_TEXT_CHARS) => {
  if (!text) return [];
  const clean = text.replace(/\s+/g, ' ').trim();
  const chunks = [];
  for (let i = 0; i < clean.length; i += size) {
    chunks.push(clean.slice(i, i + size));
  }
  return chunks;
};

const extractTextFromBuffer = async (buffer, ext) => {
  const lowerExt = (ext || '').toLowerCase();
  if (lowerExt === '.pdf') {
    const result = await pdfParse(buffer);
    return result.text || '';
  }
  if (lowerExt === '.docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }
  return buffer.toString('utf8');
};

const getExtension = (url = '') => {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname || '';
    const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
    return match ? `.${match[1].toLowerCase()}` : '';
  } catch {
    return '';
  }
};

const ingestAttachment = async (attachment, { caseId = null } = {}) => {
  const url = attachment.document_url || attachment.url;
  const title = attachment.document_name || attachment.name || 'Attachment';
  if (!url) return;
  const ext = getExtension(url);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch attachment: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const text = await extractTextFromBuffer(buffer, ext);
    if (!text) return;

    const chunks = chunkText(text).slice(0, MAX_ITEMS);
    const records = chunks.map((chunk, idx) => ({
      sourceType: 'attachment_text',
      sourceId: `attachment:${url}:${idx}`,
      title,
      content: chunk,
      url,
      metadata: { caseId, type: 'attachment', ext, title },
      chunkIndex: idx
    }));
    await bulkUpsert(records);
  } catch (err) {
    console.warn('semantic_index: failed to ingest attachment', title, err?.message);
  }
};

const ingestAttachments = async (attachments = [], { caseId = null } = {}) => {
  if (!Array.isArray(attachments) || attachments.length === 0) return;
  const limited = attachments.slice(0, 5); // avoid downloading too many in one call
  for (const att of limited) {
    await ingestAttachment(att, { caseId });
  }
};

module.exports = {
  semanticSearch,
  seedStaticPages,
  indexCaseArtifacts,
  ingestAttachments
};
