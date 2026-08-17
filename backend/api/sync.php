<?php
/**
 * Real-time delta sync endpoint for MenuApp
 * Handles push of client changes and pull of server changes
 * PHP 8.3 + MySQL
 */

require_once __DIR__ . '/config.php';

$household_code = $_SERVER['HTTP_X_HOUSEHOLD_CODE'] ?? 'HOGAR-2026';
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Cuerpo JSON inválido']);
    exit;
}

$client_timestamp = $input['clientTimestamp'] ?? '1970-01-01 00:00:00';
$changes = $input['changes'] ?? [];

try {
    $pdo->beginTransaction();

    // 1. Ensure Household exists
    $stmtH = $pdo->prepare("INSERT INTO households (id, code, name) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)");
    $stmtH->execute([$household_code, $household_code, 'Mi Hogar']);

    // 2. Process Categories Push
    if (!empty($changes['categories'])) {
        $stmt = $pdo->prepare("
            INSERT INTO categories (id, name, icon, color, order_index, updated_at)
            VALUES (:id, :name, :icon, :color, :order_index, :updated_at)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                icon = VALUES(icon),
                color = VALUES(color),
                order_index = VALUES(order_index),
                updated_at = VALUES(updated_at)
        ");
        foreach ($changes['categories'] as $c) {
            $stmt->execute([
                ':id' => $c['id'],
                ':name' => $c['name'],
                ':icon' => $c['icon'] ?? 'shopping-cart',
                ':color' => $c['color'] ?? '#10b981',
                ':order_index' => $c['orderIndex'] ?? 0,
                ':updated_at' => date('Y-m-d H:i:s')
            ]);
        }
    }

    // 3. Process Ingredients Push
    if (!empty($changes['ingredients'])) {
        $stmt = $pdo->prepare("
            INSERT INTO ingredients (id, household_id, name, category_id, default_unit, last_purchased_at, updated_at, deleted_at)
            VALUES (:id, :household_id, :name, :category_id, :default_unit, :last_purchased_at, :updated_at, :deleted_at)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                category_id = VALUES(category_id),
                default_unit = VALUES(default_unit),
                last_purchased_at = VALUES(last_purchased_at),
                updated_at = VALUES(updated_at),
                deleted_at = VALUES(deleted_at)
        ");
        foreach ($changes['ingredients'] as $i) {
            $stmt->execute([
                ':id' => $i['id'],
                ':household_id' => $household_code,
                ':name' => $i['name'],
                ':category_id' => $i['categoryId'] ?? 'cat_viveres',
                ':default_unit' => $i['defaultUnit'] ?? null,
                ':last_purchased_at' => !empty($i['lastPurchasedAt']) ? date('Y-m-d H:i:s', strtotime($i['lastPurchasedAt'])) : null,
                ':updated_at' => date('Y-m-d H:i:s', strtotime($i['updatedAt'] ?? 'now')),
                ':deleted_at' => !empty($i['deletedAt']) ? date('Y-m-d H:i:s', strtotime($i['deletedAt'])) : null
            ]);
        }
    }

    // 4. Process Dishes Push
    if (!empty($changes['dishes'])) {
        $stmt = $pdo->prepare("
            INSERT INTO dishes (id, household_id, name, type, recipe_url, ingredient_ids, updated_at, deleted_at)
            VALUES (:id, :household_id, :name, :type, :recipe_url, :ingredient_ids, :updated_at, :deleted_at)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                type = VALUES(type),
                recipe_url = VALUES(recipe_url),
                ingredient_ids = VALUES(ingredient_ids),
                updated_at = VALUES(updated_at),
                deleted_at = VALUES(deleted_at)
        ");
        foreach ($changes['dishes'] as $d) {
            $stmt->execute([
                ':id' => $d['id'],
                ':household_id' => $household_code,
                ':name' => $d['name'],
                ':type' => $d['type'] ?? 'protein',
                ':recipe_url' => $d['recipeUrl'] ?? null,
                ':ingredient_ids' => json_encode($d['ingredientIds'] ?? []),
                ':updated_at' => date('Y-m-d H:i:s', strtotime($d['updatedAt'] ?? 'now')),
                ':deleted_at' => !empty($d['deletedAt']) ? date('Y-m-d H:i:s', strtotime($d['deletedAt'])) : null
            ]);
        }
    }

    // 5. Process Weekly Menus Push
    if (!empty($changes['weeklyMenus'])) {
        $stmt = $pdo->prepare("
            INSERT INTO weekly_menus (id, household_id, week_start_date, title, days_data, notes, updated_at, deleted_at)
            VALUES (:id, :household_id, :week_start_date, :title, :days_data, :notes, :updated_at, :deleted_at)
            ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                days_data = VALUES(days_data),
                notes = VALUES(notes),
                updated_at = VALUES(updated_at),
                deleted_at = VALUES(deleted_at)
        ");
        foreach ($changes['weeklyMenus'] as $m) {
            $stmt->execute([
                ':id' => $m['id'],
                ':household_id' => $household_code,
                ':week_start_date' => $m['weekStartDate'],
                ':title' => $m['title'],
                ':days_data' => json_encode($m['days'] ?? []),
                ':notes' => $m['notes'] ?? null,
                ':updated_at' => date('Y-m-d H:i:s', strtotime($m['updatedAt'] ?? 'now')),
                ':deleted_at' => !empty($m['deletedAt']) ? date('Y-m-d H:i:s', strtotime($m['deletedAt'])) : null
            ]);
        }
    }

    // 6. Process Shopping Items Push
    if (!empty($changes['shoppingItems'])) {
        $stmt = $pdo->prepare("
            INSERT INTO shopping_items (id, household_id, name, category_id, ingredient_id, quantity, unit, status, source_type, source_week_start_date, last_purchased_at, updated_at, deleted_at)
            VALUES (:id, :household_id, :name, :category_id, :ingredient_id, :quantity, :unit, :status, :source_type, :source_week_start_date, :last_purchased_at, :updated_at, :deleted_at)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                category_id = VALUES(category_id),
                ingredient_id = VALUES(ingredient_id),
                quantity = VALUES(quantity),
                unit = VALUES(unit),
                status = VALUES(status),
                source_type = VALUES(source_type),
                last_purchased_at = VALUES(last_purchased_at),
                updated_at = VALUES(updated_at),
                deleted_at = VALUES(deleted_at)
        ");
        foreach ($changes['shoppingItems'] as $s) {
            $stmt->execute([
                ':id' => $s['id'],
                ':household_id' => $household_code,
                ':name' => $s['name'],
                ':category_id' => $s['categoryId'] ?? 'cat_otros',
                ':ingredient_id' => $s['ingredientId'] ?? null,
                ':quantity' => $s['quantity'] ?? '',
                ':unit' => $s['unit'] ?? '',
                ':status' => $s['status'] ?? 'pending',
                ':source_type' => $s['sourceType'] ?? 'menu',
                ':source_week_start_date' => !empty($s['sourceWeekStartDate']) ? $s['sourceWeekStartDate'] : null,
                ':last_purchased_at' => !empty($s['lastPurchasedAt']) ? date('Y-m-d H:i:s', strtotime($s['lastPurchasedAt'])) : null,
                ':updated_at' => date('Y-m-d H:i:s', strtotime($s['updatedAt'] ?? 'now')),
                ':deleted_at' => !empty($s['deletedAt']) ? date('Y-m-d H:i:s', strtotime($s['deletedAt'])) : null
            ]);
        }
    }

    $pdo->commit();

    // 7. Pull Changes from Server modified for this household
    $serverCategories = $pdo->query("SELECT id, name, icon, color, order_index as orderIndex, updated_at as updatedAt FROM categories")->fetchAll();
    
    $stmtIng = $pdo->prepare("SELECT id, household_id as householdId, name, category_id as categoryId, default_unit as defaultUnit, last_purchased_at as lastPurchasedAt, updated_at as updatedAt, deleted_at as deletedAt FROM ingredients WHERE household_id = ?");
    $stmtIng->execute([$household_code]);
    $serverIngredients = $stmtIng->fetchAll();

    $stmtDish = $pdo->prepare("SELECT id, household_id as householdId, name, type, recipe_url as recipeUrl, ingredient_ids as ingredientIds, updated_at as updatedAt, deleted_at as deletedAt FROM dishes WHERE household_id = ?");
    $stmtDish->execute([$household_code]);
    $serverDishes = $stmtDish->fetchAll();
    foreach ($serverDishes as &$sd) {
        $sd['ingredientIds'] = !empty($sd['ingredientIds']) ? json_decode($sd['ingredientIds'], true) : [];
    }

    $stmtMenu = $pdo->prepare("SELECT id, household_id as householdId, week_start_date as weekStartDate, title, days_data as days, notes, updated_at as updatedAt, deleted_at as deletedAt FROM weekly_menus WHERE household_id = ?");
    $stmtMenu->execute([$household_code]);
    $serverMenus = $stmtMenu->fetchAll();
    foreach ($serverMenus as &$sm) {
        $sm['days'] = !empty($sm['days']) ? json_decode($sm['days'], true) : new stdClass();
    }

    $stmtShop = $pdo->prepare("SELECT id, household_id as householdId, name, category_id as categoryId, ingredient_id as ingredientId, quantity, unit, status, source_type as sourceType, source_week_start_date as sourceWeekStartDate, last_purchased_at as lastPurchasedAt, updated_at as updatedAt, deleted_at as deletedAt FROM shopping_items WHERE household_id = ?");
    $stmtShop->execute([$household_code]);
    $serverShopping = $stmtShop->fetchAll();

    echo json_encode([
        'success' => true,
        'serverTimestamp' => date('c'),
        'serverChanges' => [
            'categories' => $serverCategories,
            'ingredients' => $serverIngredients,
            'dishes' => $serverDishes,
            'weeklyMenus' => $serverMenus,
            'shoppingItems' => $serverShopping
        ]
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error durante la sincronización: ' . $e->getMessage()
    ]);
}
