-- Gate Pass Management System - MySQL Schema
-- This schema encodes the strict workflow:
-- CLIENT → STORE MANAGER VERIFICATION → DIRECTOR APPROVAL → SECURITY VIEW

CREATE DATABASE IF NOT EXISTS gatepass_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gatepass_system;

-- -----------------------------------------------------
-- Roles and Users
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

INSERT IGNORE INTO roles (id, name) VALUES
  (1, 'CLIENT'),
  (2, 'STORE_MANAGER'),
  (3, 'DIRECTOR'),
  (4, 'SECURITY'),
  (5, 'ADMIN');

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- -----------------------------------------------------
-- Gate passes and related entities
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS gate_passes (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- MATERIAL or HUMAN_RESOURCE
  type ENUM('MATERIAL', 'HUMAN_RESOURCE') NOT NULL,

  requestor_id INT NOT NULL,

  gate_pass_date DATE NOT NULL,
  destination VARCHAR(255) NOT NULL,
  vehicle_plate_number VARCHAR(50) NULL,

  -- MATERIAL specific
  is_returnable TINYINT(1) NOT NULL DEFAULT 0,
  expected_return_date DATE NULL,

  -- HR specific summary (details in hr_employees)
  number_of_employees INT NULL,
  time_duration VARCHAR(100) NULL,

  -- Status machine
  status ENUM(
    'DRAFT',
    'PENDING_STORE_VERIFICATION',
    'REJECTED_BY_STORE',
    'VERIFIED_BY_STORE',
    'REJECTED_BY_DIRECTOR',
    'APPROVED_BY_DIRECTOR',
    'EXITED',
    'RETURNED'
  ) NOT NULL DEFAULT 'DRAFT',

  -- Return tracking
  return_status ENUM('NOT_APPLICABLE', 'PENDING_RETURN', 'RETURNED') NOT NULL DEFAULT 'NOT_APPLICABLE',

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_gate_passes_requestor FOREIGN KEY (requestor_id) REFERENCES users(id)
);

CREATE INDEX idx_gate_passes_status ON gate_passes(status);
CREATE INDEX idx_gate_passes_date ON gate_passes(gate_pass_date);

-- Material items for MATERIAL requests
CREATE TABLE IF NOT EXISTS material_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gate_pass_id INT NOT NULL,
  item_id VARCHAR(100) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(15,3) NOT NULL,
  unit_of_measurement VARCHAR(50) NOT NULL,
  CONSTRAINT fk_material_items_gatepass FOREIGN KEY (gate_pass_id) REFERENCES gate_passes(id)
    ON DELETE CASCADE
);

-- Employees for HUMAN_RESOURCE requests
CREATE TABLE IF NOT EXISTS hr_employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gate_pass_id INT NOT NULL,
  employee_id VARCHAR(100) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
  position VARCHAR(150) NOT NULL,
  time_duration VARCHAR(100) NOT NULL,
  CONSTRAINT fk_hr_employees_gatepass FOREIGN KEY (gate_pass_id) REFERENCES gate_passes(id)
    ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Approval steps and status history (audit trail)
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS approval_steps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gate_pass_id INT NOT NULL,
  step ENUM('CLIENT_SUBMIT', 'STORE_VERIFY', 'DIRECTOR_APPROVE', 'SECURITY_UPDATE') NOT NULL,
  action ENUM('SUBMITTED', 'VERIFIED', 'REJECTED', 'APPROVED', 'EXITED', 'RETURNED') NOT NULL,
  actor_user_id INT NOT NULL,
  note TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_approval_steps_gatepass FOREIGN KEY (gate_pass_id) REFERENCES gate_passes(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_approval_steps_user FOREIGN KEY (actor_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gate_pass_id INT NOT NULL,
  from_status ENUM(
    'DRAFT',
    'PENDING_STORE_VERIFICATION',
    'REJECTED_BY_STORE',
    'VERIFIED_BY_STORE',
    'REJECTED_BY_DIRECTOR',
    'APPROVED_BY_DIRECTOR',
    'EXITED',
    'RETURNED'
  ) NULL,
  to_status ENUM(
    'DRAFT',
    'PENDING_STORE_VERIFICATION',
    'REJECTED_BY_STORE',
    'VERIFIED_BY_STORE',
    'REJECTED_BY_DIRECTOR',
    'APPROVED_BY_DIRECTOR',
    'EXITED',
    'RETURNED'
  ) NOT NULL,
  actor_user_id INT NULL,
  note TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_status_history_gatepass FOREIGN KEY (gate_pass_id) REFERENCES gate_passes(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_status_history_user FOREIGN KEY (actor_user_id) REFERENCES users(id)
);

CREATE INDEX idx_status_history_gatepass ON status_history(gate_pass_id);

-- -----------------------------------------------------
-- Status transition enforcement trigger
-- -----------------------------------------------------

DELIMITER $$

CREATE TRIGGER trg_gate_passes_status_enforce
BEFORE UPDATE ON gate_passes
FOR EACH ROW
BEGIN
  DECLARE msg VARCHAR(255);

  -- Only enforce when status actually changes
  IF NOT (OLD.status <=> NEW.status) THEN

    -- DRAFT → PENDING_STORE_VERIFICATION (Client submit)
    IF OLD.status = 'DRAFT' THEN
      IF NEW.status <> 'PENDING_STORE_VERIFICATION' THEN
        SET msg = 'Invalid status transition: from DRAFT you can only go to PENDING_STORE_VERIFICATION.';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
      END IF;
    -- PENDING_STORE_VERIFICATION → VERIFIED_BY_STORE or REJECTED_BY_STORE (Store Manager)
    ELSEIF OLD.status = 'PENDING_STORE_VERIFICATION' THEN
      IF NEW.status NOT IN ('VERIFIED_BY_STORE', 'REJECTED_BY_STORE') THEN
        SET msg = 'Invalid status transition: from PENDING_STORE_VERIFICATION you can only go to VERIFIED_BY_STORE or REJECTED_BY_STORE.';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
      END IF;
    -- VERIFIED_BY_STORE → APPROVED_BY_DIRECTOR or REJECTED_BY_DIRECTOR (Director)
    ELSEIF OLD.status = 'VERIFIED_BY_STORE' THEN
      IF NEW.status NOT IN ('APPROVED_BY_DIRECTOR', 'REJECTED_BY_DIRECTOR') THEN
        SET msg = 'Invalid status transition: from VERIFIED_BY_STORE you can only go to APPROVED_BY_DIRECTOR or REJECTED_BY_DIRECTOR.';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
      END IF;
    -- APPROVED_BY_DIRECTOR → EXITED or RETURNED (Security)
    ELSEIF OLD.status = 'APPROVED_BY_DIRECTOR' THEN
      IF NEW.status NOT IN ('EXITED', 'RETURNED') THEN
        SET msg = 'Invalid status transition: from APPROVED_BY_DIRECTOR you can only go to EXITED or RETURNED.';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
      END IF;
    ELSE
      -- No further transitions allowed from terminal states
      SET msg = CONCAT('Invalid status transition: no transitions allowed from state ', OLD.status, '.');
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
    END IF;

    -- Enforce returnable logic
    IF NEW.status = 'RETURNED' THEN
      IF NEW.is_returnable <> 1 THEN
        SET msg = 'Invalid status transition: only returnable gate passes can be marked as RETURNED.';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
      END IF;
      -- Ensure return_status reflects that the item was returned
      SET NEW.return_status = 'RETURNED';
    ELSEIF NEW.status = 'APPROVED_BY_DIRECTOR' AND NEW.is_returnable = 1 THEN
      -- Once approved and returnable, mark as pending return
      SET NEW.return_status = 'PENDING_RETURN';
    END IF;

  END IF;
END$$

DELIMITER ;

