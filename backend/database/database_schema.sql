CREATE TABLE admins(
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'Admin',
  PRIMARY KEY (id)
);

CREATE TABLE attendance (
  id INT NOT NULL AUTO_INCREMENT,
  employee_id INT NOT NULL,
  time_in DATETIME DEFAULT NULL,
  time_out DATETIME DEFAULT NULL,
  status VARCHAR(50) DEFAULT NULL,
  date DATE DEFAULT CURDATE(),
  PRIMARY KEY (id),
  KEY employee_id (employee_id),
  CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE employees (
  id INT NOT NULL AUTO_INCREMENT,
  employee_code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  position VARCHAR(100) NOT NULL,
  department VARCHAR(100) DEFAULT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  salary DECIMAL(10,2) DEFAULT NULL,
  type VARCHAR(50) DEFAULT NULL,
  resetToken VARCHAR(255) DEFAULT NULL,
  resetTokenExpiry DATETIME DEFAULT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE leave_requests (
  id INT NOT NULL AUTO_INCREMENT,
  employee_id INT NOT NULL,
  start DATE NOT NULL,
  end DATE NOT NULL,
  reason VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY employee_id (employee_id),
  CONSTRAINT fk_leave_employee FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE payroll (
  id INT NOT NULL AUTO_INCREMENT,
  employee_id INT NOT NULL,
  department VARCHAR(100) DEFAULT NULL,
  position VARCHAR(100) DEFAULT NULL,
  hours_worked DECIMAL(5,2) DEFAULT 0.00,
  leave_deductions DECIMAL(10,2) DEFAULT 0.00,
  final_salary DECIMAL(10,2) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY employee_id (employee_id),
  CONSTRAINT fk_payroll_employee FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE refresh_tokens(
  id INT NOT NULL AUTO_INCREMENT,
  employee_id INT NOT NULL,
  token TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY employee_id (employee_id),
  CONSTRAINT fk_token_employee FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE admin_refresh_tokens (
  id INT NOT NULL AUTO_INCREMENT,
  employee_id INT NOT NULL,
  token TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY employee_id (employee_id),
  CONSTRAINT fk_admin_token_employee FOREIGN KEY (employee_id) REFERENCES employees(id)
);

INSERT INTO admins (name, email, password_hash, role)
VALUES ('John Doe', 'john.doe@example.com', '$2b$10$IvcMQ2RljLaDT6VphSWOXeiG9PBIp0VtZPvruzJL9AknvrmVgu12W', 'Admin');
