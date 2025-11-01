-- Create employee_expenses table
CREATE TABLE IF NOT EXISTS employee_expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE SET NULL,
  INDEX idx_employee_id (employee_id),
  INDEX idx_expense_date (expense_date),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add balance column to employees table if it doesn't exist
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS balance DECIMAL(10,2) DEFAULT 0.00 AFTER salary;

-- Add index on balance column for better query performance
CREATE INDEX IF NOT EXISTS idx_balance ON employees(balance);
