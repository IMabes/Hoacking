-- Add missing columns to users table
-- Run this SQL script to add the required columns

ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `urole` enum('user','admin') NOT NULL DEFAULT 'user' COMMENT 'User role' AFTER `upasswd`,
ADD COLUMN IF NOT EXISTS `uis_active` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'User active status (1=active, 0=inactive)' AFTER `urole`,
ADD COLUMN IF NOT EXISTS `ulast_login` datetime DEFAULT NULL COMMENT 'Last login timestamp' AFTER `uis_active`,
ADD COLUMN IF NOT EXISTS `ucreated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation timestamp' AFTER `ulast_login`;

-- If IF NOT EXISTS is not supported, use this version instead:
-- ALTER TABLE `users` 
-- ADD COLUMN `urole` enum('user','admin') NOT NULL DEFAULT 'user' COMMENT 'User role' AFTER `upasswd`,
-- ADD COLUMN `uis_active` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'User active status (1=active, 0=inactive)' AFTER `urole`,
-- ADD COLUMN `ulast_login` datetime DEFAULT NULL COMMENT 'Last login timestamp' AFTER `uis_active`,
-- ADD COLUMN `ucreated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation timestamp' AFTER `ulast_login`;

-- Verify the columns were added
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'hoacking' 
AND TABLE_NAME = 'users' 
ORDER BY ORDINAL_POSITION;

