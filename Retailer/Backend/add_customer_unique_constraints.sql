-- Add unique constraints to customers table for email and phone
ALTER TABLE customers
  ADD CONSTRAINT unique_email UNIQUE (email),
  ADD CONSTRAINT unique_phone UNIQUE (phone);
-- If already exists, ignore error (for idempotency) 