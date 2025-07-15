-- Check subcategories table structure and data
DESCRIBE subcategories;

-- Check existing subcategories
SELECT id, name FROM subcategories ORDER BY id;

-- If no subcategories exist, insert some sample data
INSERT INTO subcategories (name) VALUES 
('Electronics - Mobile Phones'),
('Electronics - Laptops'),
('Electronics - Accessories'),
('Clothing - Men'),
('Clothing - Women'),
('Clothing - Kids'),
('Home & Garden - Furniture'),
('Home & Garden - Kitchen'),
('Sports - Fitness'),
('Sports - Outdoor'),
('Books - Fiction'),
('Books - Non-Fiction'),
('Beauty - Skincare'),
('Beauty - Makeup'),
('Automotive - Parts'),
('Automotive - Accessories')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Verify subcategories were added
SELECT id, name FROM subcategories ORDER BY id; 