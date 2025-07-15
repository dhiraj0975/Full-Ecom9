-- Debug retailers table
SELECT id, name, email FROM retailers WHERE id IN (4, 11);

-- Check all retailers
SELECT id, name, email FROM retailers ORDER BY id;

-- Check products with retailer info
SELECT 
    p.id,
    p.name as product_name,
    p.retailer_id,
    r.id as retailer_table_id,
    r.name as retailer_name
FROM products p
LEFT JOIN retailers r ON p.retailer_id = r.id
WHERE p.retailer_id IN (4, 11)
ORDER BY p.id;

-- Add bank account fields to retailers table
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