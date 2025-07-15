-- Add is_deleted column for soft delete
ALTER TABLE customers
  ADD COLUMN is_deleted TINYINT(1) DEFAULT 0; 