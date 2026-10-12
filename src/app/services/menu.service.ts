import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { WeeklyMenu, DayPlan, PlannedDishItem, Dish, Ingredient, DishType } from '../models/types';
import { isSameText } from '../utils/string-utils';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private firestoreService = inject(FirestoreService);

  currentWeekStartDate = signal<string>(this.getDefaultWeekStartDate());

  // Real-time signals from Firestore
  allDishes = computed<Dish[]>(() => this.firestoreService.dishes());
  allIngredients = computed<Ingredient[]>(() => this.firestoreService.ingredients());
  isLoading = computed<boolean>(() => this.firestoreService.isConnecting());

  currentMenu = computed<WeeklyMenu | null>(() => {
    const weekStart = this.currentWeekStartDate();
    const menus = this.firestoreService.weeklyMenus();
    const found = menus.find(m => m.id === weekStart || m.weekStartDate === weekStart);
    if (found) return found;

    // Return empty placeholder structure if not created yet
    return this.createEmptyMenuObject(weekStart);
  });

  readonly dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  constructor() {
    // Empty menus are never auto-saved to Firestore.
    // They are computed in-memory and only persisted when the user actually plans a dish.
  }

  getSundayOfWeek(d: Date): Date {
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
    const day = date.getDay(); // 0 = Domingo
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  formatDateISO(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDisplayDate(d: Date): string {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  getDefaultWeekStartDate(): string {
    const today = new Date();
    const sunday = this.getSundayOfWeek(today);
    return this.formatDateISO(sunday);
  }

  getWeekRangeDisplay(weekStartDate?: string): string {
    const startStr = weekStartDate || this.currentWeekStartDate();
    if (!startStr) return '';
    const parts = startStr.split('-').map(Number);
    const sunday = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    return `${this.formatDisplayDate(sunday)} - ${this.formatDisplayDate(saturday)}`;
  }

  private createEmptyMenuObject(weekStartDate: string): WeeklyMenu {
    const parts = weekStartDate.split('-').map(Number);
    const sundayDate = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);

    return {
      id: weekStartDate,
      householdId: this.firestoreService.householdCode(),
      weekStartDate: weekStartDate,
      title: `Semana del ${this.formatDisplayDate(sundayDate)}`,
      days: {
        0: { breakfast: null, lunchProtein: null, lunchSides: [], dinner: null },
        1: { breakfast: null, lunchProtein: null, lunchSides: [], dinner: null },
        2: { breakfast: null, lunchProtein: null, lunchSides: [], dinner: null },
        3: { breakfast: null, lunchProtein: null, lunchSides: [], dinner: null },
        4: { breakfast: null, lunchProtein: null, lunchSides: [], dinner: null },
        5: { breakfast: null, lunchProtein: null, lunchSides: [], dinner: null },
        6: { breakfast: null, lunchProtein: null, lunchSides: [], dinner: null }
      },
      updatedAt: new Date().toISOString()
    };
  }

  async loadCatalog(): Promise<void> {
    // Realtime signals auto-update from FirestoreService
  }

  async loadMenuForWeek(weekStartDate: string): Promise<WeeklyMenu> {
    this.currentWeekStartDate.set(weekStartDate);
    const existing = this.firestoreService.weeklyMenus().find(
      m => m.id === weekStartDate || m.weekStartDate === weekStartDate
    );
    if (existing) return existing;

    // Do NOT write empty menu to Firestore; return an in-memory draft
    return this.createEmptyMenuObject(weekStartDate);
  }

  async previousWeek(): Promise<void> {
    const parts = this.currentWeekStartDate().split('-').map(Number);
    const current = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    current.setDate(current.getDate() - 7);
    const prevSundayStr = this.formatDateISO(current);
    await this.loadMenuForWeek(prevSundayStr);
  }

  async nextWeek(): Promise<void> {
    const parts = this.currentWeekStartDate().split('-').map(Number);
    const current = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    current.setDate(current.getDate() + 7);
    const nextSundayStr = this.formatDateISO(current);
    await this.loadMenuForWeek(nextSundayStr);
  }

  async currentWeek(): Promise<void> {
    const targetSunday = this.getDefaultWeekStartDate();
    await this.loadMenuForWeek(targetSunday);
  }

  async saveCurrentMenu(menu: WeeklyMenu): Promise<void> {
    menu.updatedAt = new Date().toISOString();
    await this.firestoreService.saveWeeklyMenu(menu);
  }

  async setDaySlot(
    dayIndex: number,
    slot: 'breakfast' | 'lunchProtein' | 'lunchOther' | 'dinner',
    dishItem: PlannedDishItem | null | string
  ): Promise<void> {
    const menu = this.currentMenu();
    if (!menu) return;

    const updatedMenu = JSON.parse(JSON.stringify(menu)) as WeeklyMenu;
    if (!updatedMenu.days[dayIndex]) {
      updatedMenu.days[dayIndex] = { breakfast: null, lunchProtein: null, lunchSides: [], dinner: null };
    }

    if (slot === 'lunchOther') {
      updatedMenu.days[dayIndex].other = dishItem as string;
    } else {
      (updatedMenu.days[dayIndex] as any)[slot] = dishItem as PlannedDishItem | null;
    }

    await this.saveCurrentMenu(updatedMenu);
  }

  async addLunchSide(dayIndex: number, sideItem: PlannedDishItem): Promise<void> {
    const menu = this.currentMenu();
    if (!menu) return;

    const updatedMenu = JSON.parse(JSON.stringify(menu)) as WeeklyMenu;
    if (!updatedMenu.days[dayIndex]) {
      updatedMenu.days[dayIndex] = { breakfast: null, lunchProtein: null, lunchSides: [], dinner: null };
    }

    if (!updatedMenu.days[dayIndex].lunchSides) {
      updatedMenu.days[dayIndex].lunchSides = [];
    }

    updatedMenu.days[dayIndex].lunchSides.push(sideItem);
    await this.saveCurrentMenu(updatedMenu);
  }

  async removeLunchSide(dayIndex: number, sideIndex: number): Promise<void> {
    const menu = this.currentMenu();
    if (!menu || !menu.days[dayIndex]?.lunchSides) return;

    const updatedMenu = JSON.parse(JSON.stringify(menu)) as WeeklyMenu;
    updatedMenu.days[dayIndex].lunchSides.splice(sideIndex, 1);
    await this.saveCurrentMenu(updatedMenu);
  }

  async createOrUpdateDish(dishData: Partial<Dish>): Promise<Dish> {
    const now = new Date().toISOString();
    const dishId = dishData.id || `dish_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const types: DishType[] = dishData.types?.length
      ? dishData.types
      : dishData.type
        ? [dishData.type]
        : ['protein'];
    const primaryType: DishType = types[0] || 'protein';

    const dish: Dish = {
      id: dishId,
      householdId: this.firestoreService.householdCode(),
      name: dishData.name || 'Sin Nombre',
      type: primaryType,
      types: types,
      recipeUrl: dishData.recipeUrl || '',
      ingredientIds: dishData.ingredientIds || [],
      updatedAt: now
    };

    await this.firestoreService.saveDish(dish);
    return dish;
  }

  async updateIngredientCategoryGlobally(ingredientId: string, newCategoryId: string, newName?: string): Promise<void> {
    const allIngs = this.allIngredients();
    const targetIng = allIngs.find(i => i.id === ingredientId);
    const cleanName = newName ? newName.trim() : (targetIng?.name || '');
    const nowIso = new Date().toISOString();

    // 1. Actualizar el ingrediente en la colección maestra de Firestore
    if (targetIng) {
      await this.firestoreService.saveIngredient({
        ...targetIng,
        name: cleanName || targetIng.name,
        categoryId: newCategoryId,
        updatedAt: nowIso
      });
    }

    // 2. Sincronizar todos los artículos existentes en la Lista de Compras
    const shoppingItems = this.firestoreService.shoppingItems();
    const matchingShoppingItems = shoppingItems.filter(item => {
      const matchId = item.ingredientId && item.ingredientId === ingredientId;
      const matchName = cleanName && item.name && isSameText(item.name, cleanName);
      return matchId || matchName;
    });

    if (matchingShoppingItems.length > 0) {
      const updatedShoppingList = matchingShoppingItems.map(item => ({
        ...item,
        categoryId: newCategoryId,
        name: cleanName || item.name,
        ingredientId: item.ingredientId || ingredientId,
        updatedAt: nowIso
      }));
      await this.firestoreService.saveShoppingItemsBatch(updatedShoppingList);
    }

    // 3. Sincronizar los platos planificados en el menú actual (para que no conserven la categoría vieja en memoria/Firestore)
    const currentMenu = this.currentMenu();
    if (currentMenu && currentMenu.days) {
      let menuModified = false;
      const updatedMenu = JSON.parse(JSON.stringify(currentMenu)) as WeeklyMenu;

      for (let day = 0; day < 7; day++) {
        const plan = updatedMenu.days[day];
        if (!plan) continue;

        const slots = [plan.breakfast, plan.lunchProtein, plan.dinner, ...(plan.lunchSides || [])];
        for (const slot of slots) {
          if (slot && slot.ingredients && Array.isArray(slot.ingredients)) {
            for (const ing of slot.ingredients) {
              const matchId = ing.id && ing.id === ingredientId;
              const matchName = cleanName && ing.name && isSameText(ing.name, cleanName);
              if (matchId || matchName) {
                ing.categoryId = newCategoryId;
                if (cleanName) ing.name = cleanName;
                menuModified = true;
              }
            }
          }
        }
      }

      if (menuModified) {
        await this.saveCurrentMenu(updatedMenu);
      }
    }
  }

  async createOrGetIngredient(name: string, categoryId = 'cat_viveres'): Promise<Ingredient> {
    const cleanName = name.trim();
    const existing = this.allIngredients()
      .find(i => !i.deletedAt && isSameText(i.name, cleanName));

    if (existing) {
      // Si el usuario especificó una categoría diferente o explícita, actualizarla globalmente
      if (categoryId && categoryId !== existing.categoryId) {
        await this.updateIngredientCategoryGlobally(existing.id, categoryId, cleanName);
        return {
          ...existing,
          name: cleanName,
          categoryId
        };
      }
      return existing;
    }

    const newIng: Ingredient = {
      id: `ing_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      householdId: this.firestoreService.householdCode(),
      name: cleanName,
      categoryId,
      updatedAt: new Date().toISOString()
    };

    await this.firestoreService.saveIngredient(newIng);
    return newIng;
  }

  async deleteIngredientDefinitive(ingredientId: string): Promise<void> {
    await this.firestoreService.deleteIngredient(ingredientId);

    // Remove from all active dishes in Firestore
    const dishes = this.allDishes();
    for (const d of dishes) {
      if (d.ingredientIds && d.ingredientIds.includes(ingredientId)) {
        const updated = {
          ...d,
          ingredientIds: d.ingredientIds.filter(id => id !== ingredientId),
          updatedAt: new Date().toISOString()
        };
        await this.firestoreService.saveDish(updated);
      }
    }
  }

  buildPlannedItemFromDish(dish: Dish): PlannedDishItem {
    const allIngs = this.allIngredients();
    const ingredients = (dish.ingredientIds || []).map(id => {
      const found = allIngs.find(i => i.id === id);
      return {
        id: id,
        name: found ? found.name : 'Ingrediente',
        categoryId: found?.categoryId || 'cat_viveres',
        quantity: '',
        unit: ''
      };
    });

    return {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      dishId: dish.id,
      name: dish.name,
      recipeUrl: dish.recipeUrl || '',
      ingredients
    };
  }
}
