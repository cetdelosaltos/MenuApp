import { Injectable, inject, signal, computed } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { MenuService } from './menu.service';
import { ShoppingItem, Category, Ingredient, ShoppingItemStatus, PlannedDishItem, Dish } from '../models/types';
import { normalizeText, isSameText } from '../utils/string-utils';

export interface CategoryShoppingGroup {
  category: Category;
  items: ShoppingItem[];
  pendingCount: number;
  totalCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingService {
  private firestoreService = inject(FirestoreService);
  private menuService = inject(MenuService);

  // Real-time Firestore bindings
  items = computed<ShoppingItem[]>(() => this.firestoreService.shoppingItems());
  categories = computed<Category[]>(() => this.firestoreService.categories());
  isLoading = computed<boolean>(() => this.firestoreService.isConnecting());

  // Pending items grouped by category (only pending items, shown at the top)
  pendingGroupedItems = computed<CategoryShoppingGroup[]>(() => {
    const allCategories = this.categories();
    const pendingItems = this.items().filter(i => !i.deletedAt && i.status === 'pending');

    // Sort categories by orderIndex
    const sortedCats = [...allCategories].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    const groups: CategoryShoppingGroup[] = [];

    for (const cat of sortedCats) {
      const catItems = pendingItems.filter(i => i.categoryId === cat.id);
      if (catItems.length > 0) {
        groups.push({
          category: cat,
          items: catItems,
          pendingCount: catItems.length,
          totalCount: catItems.length
        });
      }
    }

    // Items with uncategorized / fallback category
    const uncategorizedItems = pendingItems.filter(i => !allCategories.some(c => c.id === i.categoryId));
    if (uncategorizedItems.length > 0) {
      groups.push({
        category: {
          id: 'cat_otros',
          name: 'Otros',
          icon: 'shopping-cart',
          color: '#64748b',
          orderIndex: 99
        },
        items: uncategorizedItems,
        pendingCount: uncategorizedItems.length,
        totalCount: uncategorizedItems.length
      });
    }

    return groups;
  });

  // Items marked as purchased (shown at the bottom)
  purchasedItems = computed<ShoppingItem[]>(() => {
    return this.items()
      .filter(i => !i.deletedAt && i.status === 'purchased')
      .sort((a, b) => {
        const dateA = a.lastPurchasedAt || a.updatedAt || '';
        const dateB = b.lastPurchasedAt || b.updatedAt || '';
        return dateB.localeCompare(dateA);
      });
  });

  // Grouped items alias for backwards compatibility
  groupedItems = computed<CategoryShoppingGroup[]>(() => this.pendingGroupedItems());

  // Overall statistics
  totalItemsCount = computed(() => this.items().filter(i => !i.deletedAt && i.status !== 'in_pantry').length);
  pendingItemsCount = computed(() => this.items().filter(i => !i.deletedAt && i.status === 'pending').length);
  purchasedItemsCount = computed(() => this.items().filter(i => !i.deletedAt && i.status === 'purchased').length);

  async init(): Promise<void> {
    // Realtime listeners handled by FirestoreService
  }

  async loadCategories(): Promise<void> { }
  async loadShoppingItems(): Promise<void> { }

  /**
   * Normalize unit string for standard comparisons
   */
  private normalizeUnit(unit: string): string {
    const cleaned = (unit || '').trim().toLowerCase().replace(/\.$/, '');
    if (!cleaned) return '';
    if (['u', 'unid', 'unids', 'unidad', 'unidades', 'pza', 'pzas', 'pieza', 'piezas', 'ud', 'uds'].includes(cleaned)) {
      return 'unid';
    }
    if (['kg', 'kilo', 'kilos', 'kilogramo', 'kilogramos', 'kl'].includes(cleaned)) {
      return 'kg';
    }
    if (['g', 'gr', 'grs', 'gramo', 'gramos'].includes(cleaned)) {
      return 'g';
    }
    if (['l', 'lt', 'lts', 'litro', 'litros'].includes(cleaned)) {
      return 'l';
    }
    if (['ml', 'mls', 'mililitro', 'mililitros', 'cc'].includes(cleaned)) {
      return 'ml';
    }
    if (['paq', 'paquete', 'paquetes', 'paqt', 'paq.'].includes(cleaned)) {
      return 'paq';
    }
    if (['lata', 'latas'].includes(cleaned)) {
      return 'latas';
    }
    if (['taza', 'tazas', 'tz', 'tzs'].includes(cleaned)) {
      return 'tazas';
    }
    if (['cda', 'cdas', 'cucharada', 'cucharadas'].includes(cleaned)) {
      return 'cdas';
    }
    if (['cdta', 'cdtas', 'cucharadita', 'cucharaditas'].includes(cleaned)) {
      return 'cdtas';
    }
    return cleaned;
  }

  /**
   * Parse numeric value and unit from raw input
   */
  private parseIngredientQty(quantity?: string, unit?: string): { num: number | null; unit: string; normUnit: string; raw: string } {
    const q = (quantity || '').trim();
    const u = (unit || '').trim();

    if (!q && !u) {
      return { num: null, unit: '', normUnit: '', raw: '' };
    }

    const match = q.match(/^([0-9]+(?:\.[0-9]+)?|[0-9]+,[0-9]+|[0-9]+\/[0-9]+)\s*(.*)$/i);

    if (match) {
      const numPartStr = match[1].replace(',', '.');
      let numVal: number | null = null;
      if (numPartStr.includes('/')) {
        const [num, den] = numPartStr.split('/').map(Number);
        if (den && !isNaN(num) && !isNaN(den)) {
          numVal = num / den;
        }
      } else {
        const parsed = parseFloat(numPartStr);
        if (!isNaN(parsed)) {
          numVal = parsed;
        }
      }

      const embeddedUnit = match[2].trim();
      const finalUnit = u || embeddedUnit;
      const norm = this.normalizeUnit(finalUnit);

      return {
        num: numVal,
        unit: finalUnit,
        normUnit: norm,
        raw: `${q} ${u}`.trim()
      };
    }

    const fallbackUnit = u || q;
    return {
      num: null,
      unit: fallbackUnit,
      normUnit: this.normalizeUnit(fallbackUnit),
      raw: `${q} ${u}`.trim()
    };
  }

  private formatNumberClean(n: number): string {
    const rounded = Math.round(n * 100) / 100;
    return rounded.toString();
  }

  /**
   * Sum / Aggregate quantities and units from multiple dishes
   */
  private aggregateQuantities(entries: { quantity?: string; unit?: string }[]): { quantity: string; unit: string } {
    if (!entries || entries.length === 0) {
      return { quantity: '', unit: '' };
    }

    const parsedList = entries.map(e => this.parseIngredientQty(e.quantity, e.unit));
    const activeList = parsedList.filter(p => p.num !== null || p.unit !== '' || p.raw !== '');

    if (activeList.length === 0) {
      return { quantity: '', unit: '' };
    }

    if (activeList.length === 1) {
      const single = activeList[0];
      return {
        quantity: single.num !== null ? this.formatNumberClean(single.num) : single.raw,
        unit: single.unit
      };
    }

    const allNumeric = activeList.every(p => p.num !== null);

    if (allNumeric) {
      const unitsPresent = activeList.map(p => p.unit).filter(Boolean);
      const repDisplayUnit = unitsPresent.length > 0 ? unitsPresent[0] : '';
      const normUnits = activeList.map(p => p.normUnit).filter(Boolean);
      const uniqueNormUnits = Array.from(new Set(normUnits));

      // Case A: Same unit or no units
      if (uniqueNormUnits.length <= 1) {
        const sum = activeList.reduce((acc, curr) => acc + (curr.num || 0), 0);
        return {
          quantity: this.formatNumberClean(sum),
          unit: repDisplayUnit
        };
      }

      // Case B: Convertible units (g and kg)
      const hasKg = uniqueNormUnits.includes('kg');
      const hasG = uniqueNormUnits.includes('g');
      if (uniqueNormUnits.length === 2 && hasKg && hasG) {
        let totalKg = 0;
        for (const item of activeList) {
          if (item.normUnit === 'g') {
            totalKg += (item.num || 0) / 1000;
          } else {
            totalKg += (item.num || 0);
          }
        }
        return {
          quantity: this.formatNumberClean(totalKg),
          unit: 'kg'
        };
      }

      // Case C: Convertible units (ml and l)
      const hasL = uniqueNormUnits.includes('l');
      const hasMl = uniqueNormUnits.includes('ml');
      if (uniqueNormUnits.length === 2 && hasL && hasMl) {
        let totalL = 0;
        for (const item of activeList) {
          if (item.normUnit === 'ml') {
            totalL += (item.num || 0) / 1000;
          } else {
            totalL += (item.num || 0);
          }
        }
        return {
          quantity: this.formatNumberClean(totalL),
          unit: 'litro'
        };
      }

      // Case D: Incompatible distinct units
      const unitMap = new Map<string, { sum: number; displayUnit: string }>();
      for (const item of activeList) {
        const uKey = item.normUnit || 'no_unit';
        const existing = unitMap.get(uKey) || { sum: 0, displayUnit: item.unit };
        existing.sum += (item.num || 0);
        if (!existing.displayUnit && item.unit) existing.displayUnit = item.unit;
        unitMap.set(uKey, existing);
      }

      const groupedParts: string[] = [];
      for (const [_, val] of unitMap) {
        if (val.displayUnit) {
          groupedParts.push(`${this.formatNumberClean(val.sum)} ${val.displayUnit}`.trim());
        } else {
          groupedParts.push(this.formatNumberClean(val.sum));
        }
      }

      return {
        quantity: groupedParts.join(' + '),
        unit: ''
      };
    }

    const stringParts = activeList
      .map(p => (p.num !== null ? `${this.formatNumberClean(p.num)} ${p.unit}`.trim() : p.raw))
      .filter(Boolean);

    return {
      quantity: stringParts.join(' + '),
      unit: ''
    };
  }

  /**
   * Synchronize the shopping list with the current menu items.
   * - Extracts ingredients from all meals across the week's plan.
   * - Aggregates quantities.
   * - Adds new items as 'pending' or updates quantities for existing items.
   * - NEVER deletes pending items automatically (prevents weekend list wipeout).
   * - Preserves manual items, in_pantry items, and purchased items.
   */
  async syncWithMenu(): Promise<void> {
    const menu = this.menuService.currentMenu();
    if (!menu || !menu.weekStartDate) return;

    const now = new Date();
    const currentShopping = this.items();
    const allIngredients = this.menuService.allIngredients();
    const allDishes = this.menuService.allDishes();

    const ingMap = new Map<string, Ingredient>();
    allIngredients.forEach(i => ingMap.set(normalizeText(i.name), i));

    // 1. Extract and group ingredient occurrences across all 7 days of the menu
    interface GroupedIngData {
      displayName: string;
      categoryId: string;
      ingredientId?: string;
      entries: { quantity?: string; unit?: string }[];
    }

    const groupedNeeded = new Map<string, GroupedIngData>();

    for (let day = 0; day < 7; day++) {
      const plan = menu.days[day];
      if (!plan) continue;

      const dishes: (PlannedDishItem | null)[] = [];
      if (plan.breakfast) dishes.push(plan.breakfast);
      if (plan.lunchProtein) dishes.push(plan.lunchProtein);
      if (plan.lunchSides?.length) dishes.push(...plan.lunchSides);
      if (plan.dinner) dishes.push(plan.dinner);

      for (const dish of dishes) {
        if (!dish) continue;

        // Find associated dish from the master Catalog (by ID or exact name)
        let catalogDish: Dish | undefined;
        if (dish.dishId) {
          catalogDish = allDishes.find(d => !d.deletedAt && d.id === dish.dishId);
        }
        if (!catalogDish && dish.name) {
          catalogDish = allDishes.find(d => !d.deletedAt && isSameText(d.name, dish.name));
        }

        interface ExtractedIng {
          id?: string;
          name: string;
          categoryId?: string;
          quantity?: string;
          unit?: string;
        }

        const dishIngredients: ExtractedIng[] = [];
        const seenNormNames = new Set<string>();

        // A. Add ingredients explicitly stored on the planned item (may have custom quantities/units)
        if (dish.ingredients && Array.isArray(dish.ingredients)) {
          for (const ing of dish.ingredients) {
            if (!ing || !ing.name || !ing.name.trim()) continue;
            const cleanName = ing.name.trim();
            const norm = normalizeText(cleanName);
            seenNormNames.add(norm);
            dishIngredients.push({
              id: ing.id,
              name: cleanName,
              categoryId: ing.categoryId,
              quantity: ing.quantity,
              unit: ing.unit
            });
          }
        }

        // B. ALWAYS also check the Catalog recipe to ensure 100% of declared ingredients are included!
        if (catalogDish && catalogDish.ingredientIds && catalogDish.ingredientIds.length > 0) {
          for (const ingId of catalogDish.ingredientIds) {
            const foundIng = allIngredients.find(i => !i.deletedAt && i.id === ingId);
            if (!foundIng || !foundIng.name) continue;
            const norm = normalizeText(foundIng.name);
            if (!seenNormNames.has(norm)) {
              seenNormNames.add(norm);
              dishIngredients.push({
                id: foundIng.id,
                name: foundIng.name,
                categoryId: foundIng.categoryId || 'cat_viveres',
                quantity: '',
                unit: ''
              });
            }
          }
        }

        // Group into the needed ingredients map
        for (const ing of dishIngredients) {
          const cleanName = ing.name.trim();
          const foundIng = ingMap.get(normalizeText(cleanName)) || (ing.id ? allIngredients.find(i => i.id === ing.id) : undefined);
          const groupKey = normalizeText(foundIng ? foundIng.name : cleanName);

          const existingGroup = groupedNeeded.get(groupKey);
          if (existingGroup) {
            existingGroup.entries.push({
              quantity: ing.quantity,
              unit: ing.unit
            });
          } else {
            groupedNeeded.set(groupKey, {
              displayName: foundIng ? foundIng.name : cleanName,
              categoryId: foundIng?.categoryId || ing.categoryId || 'cat_viveres',
              ingredientId: foundIng?.id || ing.id,
              entries: [{
                quantity: ing.quantity,
                unit: ing.unit
              }]
            });
          }
        }
      }
    }

    if (groupedNeeded.size === 0) return;

    // 2. Build list of items to update/insert in Firestore
    const nowIso = now.toISOString();
    const itemsToSave: ShoppingItem[] = [];

    for (const [key, group] of groupedNeeded) {
      const aggregated = this.aggregateQuantities(group.entries);
      const foundIng = ingMap.get(key);

      const matches = currentShopping.filter(item => {
        const matchesName = item.name && isSameText(item.name, group.displayName);
        const matchesId = (group.ingredientId && item.ingredientId && item.ingredientId === group.ingredientId);
        return matchesName || matchesId;
      });

      if (matches.length > 0) {
        const primaryItem = { ...matches[0] };
        primaryItem.name = group.displayName;
        primaryItem.categoryId = group.categoryId;
        primaryItem.ingredientId = group.ingredientId || primaryItem.ingredientId;
        primaryItem.quantity = aggregated.quantity;
        primaryItem.unit = aggregated.unit;

        // CRITICAL FIX: Reactivate item as 'pending' so it appears in this week's active shopping list!
        // Even if it was purchased or in pantry from past weeks, this week's menu explicitly requires it.
        primaryItem.status = 'pending';
        primaryItem.sourceType = 'menu';
        primaryItem.sourceWeekStartDate = menu.weekStartDate;
        primaryItem.deletedAt = null;
        primaryItem.updatedAt = nowIso;

        itemsToSave.push(primaryItem);

        // Limpiar cualquier registro duplicado anterior para el mismo artículo
        for (let i = 1; i < matches.length; i++) {
          const dup = { ...matches[i] };
          dup.deletedAt = nowIso;
          dup.updatedAt = nowIso;
          itemsToSave.push(dup);
        }
      } else {
        const newItem: ShoppingItem = {
          id: `shop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          householdId: this.firestoreService.householdCode(),
          name: group.displayName,
          categoryId: group.categoryId,
          ingredientId: group.ingredientId,
          quantity: aggregated.quantity,
          unit: aggregated.unit,
          status: 'pending',
          sourceType: 'menu',
          sourceWeekStartDate: menu.weekStartDate,
          lastPurchasedAt: foundIng?.lastPurchasedAt,
          updatedAt: nowIso
        };
        itemsToSave.push(newItem);
      }
    }

    if (itemsToSave.length > 0) {
      await this.firestoreService.saveShoppingItemsBatch(itemsToSave);
    }
  }

  /**
   * Action: "Hay en Casa"
   */
  async markInPantry(itemId: string): Promise<void> {
    const item = this.items().find(i => i.id === itemId);
    if (!item) return;

    const updated: ShoppingItem = {
      ...item,
      status: 'in_pantry',
      updatedAt: new Date().toISOString()
    };
    await this.firestoreService.saveShoppingItem(updated);
  }

  /**
   * Action: "Comprado"
   */
  async markPurchased(itemId: string): Promise<void> {
    const item = this.items().find(i => i.id === itemId);
    if (!item) return;

    const now = new Date().toISOString();
    const updated: ShoppingItem = {
      ...item,
      status: 'purchased',
      lastPurchasedAt: now,
      updatedAt: now
    };
    await this.firestoreService.saveShoppingItem(updated);

    // Also update ingredient's lastPurchasedAt in Firestore
    if (item.ingredientId) {
      const ing = this.menuService.allIngredients().find(i => i.id === item.ingredientId);
      if (ing) {
        await this.firestoreService.saveIngredient({
          ...ing,
          lastPurchasedAt: now,
          updatedAt: now
        });
      }
    }
  }

  /**
   * Toggle item back to pending
   */
  async markPending(itemId: string): Promise<void> {
    const item = this.items().find(i => i.id === itemId);
    if (!item) return;

    const updated: ShoppingItem = {
      ...item,
      status: 'pending',
      updatedAt: new Date().toISOString()
    };
    await this.firestoreService.saveShoppingItem(updated);
  }

  /**
   * Quick Edit Quantity & Unit
   */
  async updateQuantity(itemId: string, quantity: string, unit: string): Promise<void> {
    const item = this.items().find(i => i.id === itemId);
    if (!item) return;

    const updated: ShoppingItem = {
      ...item,
      quantity: quantity.trim(),
      unit: unit.trim(),
      updatedAt: new Date().toISOString()
    };
    await this.firestoreService.saveShoppingItem(updated);
  }

  /**
   * Add a manual item not directly linked to weekly menu
   */
  async addManualItem(name: string, categoryId: string, quantity = '', unit = ''): Promise<ShoppingItem> {
    const cleanName = name.trim();
    const foundIng = this.menuService.allIngredients().find(i => isSameText(i.name, cleanName));
    const finalCatId = categoryId || foundIng?.categoryId || 'cat_otros';

    // Si el usuario especificó una categoría diferente a la del catálogo maestro, actualizar el ingrediente globalmente
    if (foundIng && categoryId && foundIng.categoryId !== categoryId) {
      await this.menuService.updateIngredientCategoryGlobally(foundIng.id, categoryId, cleanName);
    }

    // Comprobar si ya existe un artículo en la lista de compras (activo o borrado suave)
    const existing = this.items().find(i => isSameText(i.name, cleanName) || (foundIng && i.ingredientId === foundIng.id));

    if (existing) {
      const updated: ShoppingItem = {
        ...existing,
        name: cleanName,
        categoryId: finalCatId,
        ingredientId: foundIng?.id || existing.ingredientId,
        quantity: quantity.trim() || existing.quantity,
        unit: unit.trim() || existing.unit,
        status: 'pending',
        deletedAt: null,
        updatedAt: new Date().toISOString()
      };
      await this.firestoreService.saveShoppingItem(updated);
      return updated;
    }

    const newItem: ShoppingItem = {
      id: `shop_man_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      householdId: this.firestoreService.householdCode(),
      name: cleanName,
      categoryId: finalCatId,
      ingredientId: foundIng?.id,
      quantity: quantity.trim(),
      unit: unit.trim(),
      status: 'pending',
      sourceType: 'manual',
      lastPurchasedAt: foundIng?.lastPurchasedAt,
      updatedAt: new Date().toISOString()
    };

    await this.firestoreService.saveShoppingItem(newItem);
    return newItem;
  }

  /**
   * Actualizar la categoría de un artículo directamente desde la lista de compras
   */
  async updateItemCategory(itemId: string, newCategoryId: string): Promise<void> {
    const item = this.items().find(i => i.id === itemId);
    if (!item || !newCategoryId) return;

    const updated: ShoppingItem = {
      ...item,
      categoryId: newCategoryId,
      updatedAt: new Date().toISOString()
    };
    await this.firestoreService.saveShoppingItem(updated);

    // Si está asociado a un ingrediente del catálogo, actualizarlo globalmente
    if (item.ingredientId) {
      await this.menuService.updateIngredientCategoryGlobally(item.ingredientId, newCategoryId, item.name);
    } else {
      const foundIng = this.menuService.allIngredients().find(i => isSameText(i.name, item.name));
      if (foundIng) {
        await this.menuService.updateIngredientCategoryGlobally(foundIng.id, newCategoryId, item.name);
      }
    }
  }

  /**
   * Remove item completely from shopping list
   */
  async removeItem(itemId: string): Promise<void> {
    await this.firestoreService.deleteShoppingItem(itemId);
  }

  /**
   * Clear all purchased items from shopping list
   */
  async clearAllPurchased(): Promise<void> {
    const purchased = this.items().filter(i => !i.deletedAt && i.status === 'purchased');
    for (const item of purchased) {
      await this.firestoreService.deleteShoppingItem(item.id);
    }
  }
}
