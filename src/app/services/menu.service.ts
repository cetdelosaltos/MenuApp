import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { WeeklyMenu, DayPlan, PlannedDishItem, Dish, Ingredient, DishType } from '../models/types';

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
    // Whenever current week starts and isn't saved yet in Firestore, auto-create
    effect(() => {
      const weekStart = this.currentWeekStartDate();
      const menus = this.firestoreService.weeklyMenus();
      const isConnecting = this.firestoreService.isConnecting();

      if (!isConnecting && menus.length > 0) {
        const found = menus.find(m => m.id === weekStart || m.weekStartDate === weekStart);
        if (!found) {
          const empty = this.createEmptyMenuObject(weekStart);
          this.firestoreService.saveWeeklyMenu(empty);
        }
      }
    });
  }

  getSundayOfWeek(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay(); // 0 = Domingo
    const diff = date.getDate() - day;
    const sunday = new Date(date.setDate(diff));
    sunday.setHours(0, 0, 0, 0);
    return sunday;
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
    // Si hoy es domingo, mostrar la semana siguiente (+7 días)
    if (today.getDay() === 0) {
      sunday.setDate(sunday.getDate() + 7);
    }
    return this.formatDateISO(sunday);
  }

  private createEmptyMenuObject(weekStartDate: string): WeeklyMenu {
    const parts = weekStartDate.split('-').map(Number);
    const sundayDate = new Date(parts[0], parts[1] - 1, parts[2]);

    return {
      id: weekStartDate,
      householdId: this.firestoreService.householdCode(),
      weekStartDate: weekStartDate,
      title: `Semana del Domingo ${this.formatDisplayDate(sundayDate)}`,
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
    const existing = this.firestoreService.weeklyMenus().find(m => m.id === weekStartDate);
    if (existing) return existing;

    const newMenu = this.createEmptyMenuObject(weekStartDate);
    await this.firestoreService.saveWeeklyMenu(newMenu);
    return newMenu;
  }

  async previousWeek(): Promise<void> {
    const current = new Date(this.currentWeekStartDate() + 'T00:00:00');
    current.setDate(current.getDate() - 7);
    const prevSundayStr = this.formatDateISO(current);
    await this.loadMenuForWeek(prevSundayStr);
  }

  async nextWeek(): Promise<void> {
    const current = new Date(this.currentWeekStartDate() + 'T00:00:00');
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
    const dish: Dish = {
      id: dishId,
      householdId: this.firestoreService.householdCode(),
      name: dishData.name || 'Sin Nombre',
      type: dishData.type || 'protein',
      recipeUrl: dishData.recipeUrl || '',
      ingredientIds: dishData.ingredientIds || [],
      updatedAt: now
    };

    await this.firestoreService.saveDish(dish);
    return dish;
  }

  async createOrGetIngredient(name: string, categoryId = 'cat_viveres'): Promise<Ingredient> {
    const cleanName = name.trim();
    const existing = this.allIngredients()
      .find(i => !i.deletedAt && i.name.toLowerCase() === cleanName.toLowerCase());

    if (existing) {
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
