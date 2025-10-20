const pool = require('../config/db');

// Get all external links
const getAllExternalLinks = async () => {
  const query = `
    SELECT 
      el.id,
      el.title,
      el.link,
      el.created_by,
      el.created_at,
      e.name as creator_name
    FROM external_links el
    LEFT JOIN employees e ON el.created_by = e.id
    ORDER BY el.created_at DESC
  `;
  
  const [rows] = await pool.query(query);
  return rows;
};

// Create a new external link
const createExternalLink = async (linkData) => {
  const { title, link, created_by } = linkData;
  
  const query = `
    INSERT INTO external_links (title, link, created_by)
    VALUES (?, ?, ?)
  `;
  
  const [result] = await pool.query(query, [title, link, created_by]);
  return result;
};

// Delete an external link
const deleteExternalLink = async (id) => {
  const query = `
    DELETE FROM external_links 
    WHERE id = ?
  `;
  
  const [result] = await pool.query(query, [id]);
  return result;
};

module.exports = {
  getAllExternalLinks,
  createExternalLink,
  deleteExternalLink
};
