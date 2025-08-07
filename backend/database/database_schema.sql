CREATE DATABASE IF NOT EXISTS modernTech;
USE modernTech;

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
  date DATE,
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
  admin_id INT NOT NULL,
  token TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY admin_id (admin_id),
  CONSTRAINT fk_admin_token_admin FOREIGN KEY (admin_id) REFERENCES admins(id)
);

-- Admins
INSERT INTO admins (id, name, email, password_hash, role) VALUES
  (1, 'John Doe', 'john.doe@example.com', '$2b$10$IvcMQ2RljLaDT6VphSWOXeiG9PBIp0VtZPvruzJL9AknvrmVgu12W', 'Admin');

-- Admin Refresh Tokens
INSERT INTO admin_refresh_tokens (id, admin_id, token, created_at) VALUES
  (1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTc1MzY1NzgxMSwiZXhwIjoxNzU0MjYyNjExfQ.-hhb0k92kyk9pfsZPEL5-cMhaYCoi-NBOkbU1-sMvck','2025-07-28 01:10:11'),
  (2, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTc1MzY2ODAwMiwiZXhwIjoxNzU0MjcyODAyfQ.odtZxTgONkrvSZl5LcQNXcND0shb0_yHLfvOPG9svio','2025-07-28 04:00:02'),
  (3, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsIm5hbWUiOiJKb2huIERvZSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MzY2ODk2MywiZXhwIjoxNzU0MjczNzYzfQ.cHygpUhfJUcr3PfUTD0pcw9pZBHjwgCmfYFuVJFgxw8','2025-07-28 04:16:03'),
  (4, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsIm5hbWUiOiJKb2huIERvZSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MzY3MDg1NCwiZXhwIjoxNzU0Mjc1NjU0fQ.x55gNiIkd2fQFt4IbnvjcVnsVMeDUDbIui9uJm14X5s','2025-07-28 04:47:34');

-- Employees
INSERT INTO employees (id, employee_code, name, password_hash, position, department, email, salary, type, resetToken, resetTokenExpiry) VALUES
  (1,'Emp-1753343204002','Raeesa Samaai','$2b$10$vzLnjsyV0wWU5zZL8oCnMOepyKieYSvs8gC8lOozsmoPSRKpLUc7e','Data Analyst','IT','raeesa@moderntech.com',55000.00,'Full-Time',NULL,NULL),
  (2,'Emp-1753343204003','Aadam Maroof','$2b$10$t1TqktxS9Ifhs.r9Px/auOi.DWDIGC55e9CGmoLzA/o7kor5OKRzq','Sales Representative','Sales','aadam@moderntech.com',60000.00,'Contractor',NULL,NULL),
  (3,'Emp-1753343204004','Zainul Moses','$2b$10$fZ2XV5u2M.9VPHRQhCfai.KJzHFFBS6pt8nIiE6Be9j9I52o4UfUC','Marketing Specialist','Marketing','zainul@moderntech.com',58000.00,'Full-Time',NULL,NULL),
  (4,'Emp-1753343204005','Ubaidullah Abrahams','$2b$10$RvrgEw4se6CL0z.3pBNC8ud8j37t5z7NDileG5aghn4qNt/0L8Ve2','UI/UX Designer','Design','ubaidullah@moderntech.com',65000.00,'Part-Time',NULL,NULL),
  (5,'Emp-1753343204006','Abubakr Gamiet','$2b$10$z0VvaeWFcH79XyEMFV8TvOvNHxik0oCwKvDSu.UroP2RlKBNF4hnK','DevOps Engineer','IT','abubakr@moderntech.com',72000.00,'Full-Time',NULL,NULL),
  (6,'Emp-1753343204007','Mariam Adamms','$2b$10$oX/A1lkudRE81ddhgd9t0u8Y5p4tztLuK1CSAGwjfRWIPfVYjBAfq','Content Strategist','Marketing','mariam@moderntech.com',56000.00,'Contractor',NULL,NULL),
  (7,'Emp-1753343204008','Ubdullah Aziz','$2b$10$xbeLUXbWlB2oCgb65Iy7le9iJLPDt4d/etQSlftMxk84I1kHlAg9S','Accountant','Finance','ubdullah@moderntech.com',62000.00,'Full-Time',NULL,NULL),
  (8,'Emp-1753343204009','Fatima Patel','$2b$10$7Dy05Ijb7IRBH5j0e2JFK.O/62c/iwjYvGXLkbiYjGJ.ffrv/39Xa','Customer Support Lead','Customer Service','fatima@moderntech.com',58000.00,'Part-Time',NULL,NULL),
  (34,'Emp-1753989127704','Kouthar Davids','$2b$10$2GzCukQw.WOt6D1N8QlpZ.nFIOsvi.8XgzKC5tdTJGaC1epN7jz2q','Software Engineer','IT','kouthardavids606@gmail.com',NULL,'Full-Time',NULL,NULL),
  (36,'Emp-1754052620148','shumeez','$2b$10$ef0uSo8ZT1.W.iUSvHvreufY4VV5Dz4gfi/3wLeu6T73RB.rXJ13W','Software Engineer','IT','vanschalkwykshumeez@gmail.com',NULL,'Full-Time',NULL,NULL);

-- Attendance
INSERT INTO attendance (id, employee_id, time_in, time_out, status, date) VALUES
  (57,5,NULL,NULL,'absent','2025-07-30'),
  (58,3,NULL,NULL,'leave','2025-07-30'),
  (59,5,NULL,NULL,'leave','2025-07-31'),
  (60,2,NULL,NULL,'leave','2025-07-31'),
  (61,4,NULL,NULL,'absent','2025-07-31'),
  (62,1,NULL,NULL,'absent','2025-07-31'),
  (63,1,NULL,NULL,'absent','2025-08-25'),
  (64,34,'2025-07-31 21:14:09',NULL,'present','2025-07-31'),
  (65,2,NULL,NULL,'absent','2025-07-16'),
  (67,34,'2025-08-01 07:16:43',NULL,'present','2025-08-01'),
  (69,36,'2025-08-01 14:55:10',NULL,'present','2025-08-01');

-- Leave Requests
INSERT INTO leave_requests (id, employee_id, start, end, reason, status, submission_date) VALUES
  (11,34,'2025-07-31','2025-08-02','sick','Approved','2025-07-31 21:22:32'),
  (13,34,'2025-08-12','2025-08-15','leave','Pending','2025-08-01 10:37:43'),
  (14,36,'2025-08-01','2025-08-06','vacay','Approved','2025-08-01 14:52:54');

-- Payroll
INSERT INTO payroll (id, employee_id, department, position, hours_worked, leave_deductions, final_salary, created_at) VALUES
  (8,34,NULL,NULL,7.90,2323.00,293833.00,'2025-08-01 06:34:04'),
  (9,6,NULL,NULL,6.00,2.00,9999.00,'2025-08-01 13:47:39');
