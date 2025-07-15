-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(15) NOT NULL,
  address TEXT,
  city VARCHAR(50),
  state VARCHAR(50),
  pincode VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_deleted_at (deleted_at),
  INDEX idx_created_at (created_at)
);

-- Add some sample data for testing
INSERT INTO customers (name, email, phone, address, city, state, pincode) VALUES
('Rahul Kumar', 'rahul.kumar@email.com', '9876543210', '123 Main Street', 'Mumbai', 'Maharashtra', '400001'),
('Priya Sharma', 'priya.sharma@email.com', '9876543211', '456 Park Avenue', 'Delhi', 'Delhi', '110001'),
('Amit Patel', 'amit.patel@email.com', '9876543212', '789 Lake Road', 'Bangalore', 'Karnataka', '560001'),
('Neha Singh', 'neha.singh@email.com', '9876543213', '321 Garden Street', 'Chennai', 'Tamil Nadu', '600001'),
('Vikram Malhotra', 'vikram.malhotra@email.com', '9876543214', '654 Hill View', 'Kolkata', 'West Bengal', '700001');

-- Create trigger to update updated_at timestamp
DELIMITER //
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END//
DELIMITER ; 