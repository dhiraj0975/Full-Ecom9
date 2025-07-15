-- Add bank account fields to retailers table
USE retailer_db;

-- Add bank account fields
ALTER TABLE retailers 
ADD COLUMN bank_name VARCHAR(255) NULL,
ADD COLUMN account_number VARCHAR(50) NULL,
ADD COLUMN ifsc_code VARCHAR(20) NULL,
ADD COLUMN account_holder_name VARCHAR(255) NULL;

-- Verify the table structure
DESCRIBE retailers;

-- Check if bank fields were added successfully
SELECT id, name, email, bank_name, account_number, ifsc_code, account_holder_name 
FROM retailers 
LIMIT 5; 