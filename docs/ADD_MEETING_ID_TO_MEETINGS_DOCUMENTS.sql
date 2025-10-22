-- Add meeting_id column to meetings_documents table

ALTER TABLE meetings_documents
ADD COLUMN meeting_id INT NOT NULL AFTER id,
ADD FOREIGN KEY (meeting_id) REFERENCES meetings(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Add index for better query performance
CREATE INDEX idx_meetings_documents_meeting_id ON meetings_documents(meeting_id);
