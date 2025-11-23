// Lightweight static content to seed the semantic index for "read any page" queries
const STATIC_PAGES = [
  {
    route: '/help/cases',
    title: 'Help: Working with cases',
    content:
      'How to create, update, and archive a case. Includes fields like case number, file number, topic, court selection, and party assignment. Covers adding sessions, petitions, memos, and documents.'
  },
  {
    route: '/help/sessions',
    title: 'Help: Sessions and hearings',
    content:
      'Scheduling and tracking hearings. Recording decisions, rulings, judgment reserved/deferred flags, legal period selection, and uploading session documents.'
  },
  {
    route: '/help/documents',
    title: 'Help: Document management',
    content:
      'Uploading case documents, court submissions, party documents, memo attachments, and petition files. Accepted formats include PDF and DOCX. Learn where files appear in the case view.'
  },
  {
    route: '/help/tasks',
    title: 'Help: Tasks and deadlines',
    content:
      'Assigning tasks to team members, setting due dates, priorities, and linking tasks to cases. Use task status to follow up on upcoming deadlines.'
  },
  {
    route: '/help/policies/data-protection',
    title: 'Policy: Data protection',
    content:
      'Internal guidance on handling client information, document confidentiality, and case access controls. Reminds users to keep attachments scoped to the relevant case.'
  }
];

module.exports = { STATIC_PAGES };
