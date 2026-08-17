-- =========================================================
-- MenuApp Database Schema for MySQL 8.0+ / MariaDB
-- =========================================================

-- 1. Households (Códigos de hogar compartidos)
CREATE TABLE IF NOT EXISTS `households` (
    `id` VARCHAR(64) PRIMARY KEY,
    `code` VARCHAR(64) UNIQUE NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Categories
CREATE TABLE IF NOT EXISTS `categories` (
    `id` VARCHAR(64) PRIMARY KEY,
    `name` VARCHAR(128) NOT NULL,
    `icon` VARCHAR(64) DEFAULT 'shopping-cart',
    `color` VARCHAR(32) DEFAULT '#10b981',
    `order_index` INT DEFAULT 0,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Ingredients
CREATE TABLE IF NOT EXISTS `ingredients` (
    `id` VARCHAR(64) PRIMARY KEY,
    `household_id` VARCHAR(64) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(64) DEFAULT 'cat_viveres',
    `default_unit` VARCHAR(32) DEFAULT NULL,
    `last_purchased_at` DATETIME DEFAULT NULL,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME DEFAULT NULL,
    INDEX `idx_household_ing` (`household_id`),
    INDEX `idx_updated_ing` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Dishes (Recetas / Platos)
CREATE TABLE IF NOT EXISTS `dishes` (
    `id` VARCHAR(64) PRIMARY KEY,
    `household_id` VARCHAR(64) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('protein', 'side', 'breakfast', 'dinner', 'other') DEFAULT 'protein',
    `recipe_url` TEXT DEFAULT NULL,
    `ingredient_ids` JSON DEFAULT NULL,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME DEFAULT NULL,
    INDEX `idx_household_dish` (`household_id`),
    INDEX `idx_updated_dish` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Weekly Menus (Planificación semanal de domingo a sábado)
CREATE TABLE IF NOT EXISTS `weekly_menus` (
    `id` VARCHAR(64) PRIMARY KEY, -- formato YYYY-MM-DD del domingo
    `household_id` VARCHAR(64) NOT NULL,
    `week_start_date` DATE NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `days_data` JSON NOT NULL, -- JSON con los 7 días, platos, contornos, otros
    `notes` TEXT DEFAULT NULL,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME DEFAULT NULL,
    INDEX `idx_household_menu` (`household_id`),
    INDEX `idx_week_date` (`week_start_date`),
    INDEX `idx_updated_menu` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Shopping Items (Lista de compras)
CREATE TABLE IF NOT EXISTS `shopping_items` (
    `id` VARCHAR(64) PRIMARY KEY,
    `household_id` VARCHAR(64) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(64) DEFAULT 'cat_otros',
    `ingredient_id` VARCHAR(64) DEFAULT NULL,
    `quantity` VARCHAR(32) DEFAULT '',
    `unit` VARCHAR(32) DEFAULT '',
    `status` ENUM('pending', 'in_pantry', 'purchased') DEFAULT 'pending',
    `source_type` ENUM('menu', 'manual') DEFAULT 'menu',
    `source_week_start_date` DATE DEFAULT NULL,
    `last_purchased_at` DATETIME DEFAULT NULL,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME DEFAULT NULL,
    INDEX `idx_household_shop` (`household_id`),
    INDEX `idx_status_shop` (`status`),
    INDEX `idx_updated_shop` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar hogar inicial
INSERT INTO `households` (`id`, `code`, `name`) 
VALUES ('HOGAR-2026', 'HOGAR-2026', 'Mi Hogar')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
