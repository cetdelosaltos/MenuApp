import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Category, Ingredient, Dish, WeeklyMenu, ShoppingItem, HouseholdConfig } from '../models/types';
import { INITIAL_CATEGORIES, INITIAL_INGREDIENTS, INITIAL_DISHES } from '../data/seed-data';

export interface SyncQueueItem {
  id?: number;
  action: 'insert' | 'update' | 'delete';
  entity: 'categories' | 'ingredients' | 'dishes' | 'weeklyMenus' | 'shoppingItems';
  entityId: string;
  data: any;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class DbService extends Dexie {
  categories!: Table<Category, string>;
  ingredients!: Table<Ingredient, string>;
  dishes!: Table<Dish, string>;
  weeklyMenus!: Table<WeeklyMenu, string>;
  shoppingItems!: Table<ShoppingItem, string>;
  config!: Table<HouseholdConfig, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('MenuAppDB');

    this.version(1).stores({
      categories: 'id, orderIndex',
      ingredients: 'id, householdId, name, categoryId, updatedAt, deletedAt',
      dishes: 'id, householdId, name, type, updatedAt, deletedAt',
      weeklyMenus: 'id, householdId, weekStartDate, updatedAt, deletedAt',
      shoppingItems: 'id, householdId, status, categoryId, sourceWeekStartDate, updatedAt, deletedAt',
      config: 'householdCode',
      syncQueue: '++id, action, entity, entityId, timestamp'
    });

    this.on('ready', async () => {
      await this.seedInitialData();
    });
  }

  async seedInitialData(): Promise<void> {
    const catCount = await this.categories.count();
    if (catCount === 0) {
      await this.categories.bulkAdd(INITIAL_CATEGORIES);
    }

    const ingCount = await this.ingredients.count();
    if (ingCount === 0) {
      await this.ingredients.bulkAdd(INITIAL_INGREDIENTS);
    }

    const dishCount = await this.dishes.count();
    if (dishCount === 0) {
      await this.dishes.bulkAdd(INITIAL_DISHES);
    }

    const configCount = await this.config.count();
    if (configCount === 0) {
      await this.config.add({
        householdCode: 'HOGAR-2026',
        householdName: 'Mi Hogar',
        serverUrl: 'https://menuapp.cetadev.xyz/api',
        syncEnabled: true,
        autoSync: true
      });
    }

    // Seed current week menu if empty
    const menuCount = await this.weeklyMenus.count();
    if (menuCount === 0) {
      const today = new Date();
      let currentSunday = this.getSundayOfWeek(today);
      if (today.getDay() === 0) {
        currentSunday.setDate(currentSunday.getDate() + 7);
      }
      const weekStartStr = this.formatDateISO(currentSunday);
      
      const sampleMenu: WeeklyMenu = {
        id: weekStartStr,
        householdId: 'HOGAR-2026',
        weekStartDate: weekStartStr,
        title: `Semana del Domingo ${this.formatDisplayDate(currentSunday)}`,
        days: {
          0: {
            breakfast: { id: 'd0_b', dishId: 'arepa_1', name: 'Arepas con Queso', ingredients: [{ id: 'ing_hpan', name: 'Harina PAN', quantity: '1', unit: 'paq' }, { id: 'ing_q', name: 'Queso Blanco', quantity: '500', unit: 'gr' }] },
            lunchProtein: { id: 'd0_p', dishId: 'caraotas_1', name: 'Caraotas Negras', ingredients: [{ id: 'ing_caraotas', name: 'Caraotas Negras', quantity: '500', unit: 'gr' }, { id: 'ing_aliños', name: 'Aliños surtidos', quantity: '1', unit: 'bolsa' }] },
            lunchSides: [
              { id: 'd0_s1', dishId: 'arroz_1', name: 'Arroz blanco', ingredients: [{ id: 'ing_arroz', name: 'Arroz', quantity: '1', unit: 'kg' }] },
              { id: 'd0_s2', dishId: 'tajadas_1', name: 'Tajadas de plátano', ingredients: [{ id: 'ing_platano', name: 'Plátanos Maduros', quantity: '3', unit: 'unid' }] }
            ],
            dinner: { id: 'd0_d', dishId: 'arepa_d', name: 'Arepas', ingredients: [{ id: 'ing_hpan2', name: 'Harina PAN', quantity: '1', unit: 'paq' }] }
          },
          1: {
            breakfast: { id: 'd1_b', dishId: 'empanadas_1', name: 'Empanadas de Queso', ingredients: [] },
            lunchProtein: { id: 'd1_p', dishId: 'rollo_1', name: 'Rollo de Carne', ingredients: [{ id: 'ing_carne', name: 'Carne Molida', quantity: '600', unit: 'gr' }] },
            lunchSides: [
              { id: 'd1_s1', dishId: 'papas_bravas', name: 'Papas Bravas', ingredients: [{ id: 'ing_papas', name: 'Papas', quantity: '1', unit: 'kg' }] },
              { id: 'd1_s2', dishId: 'brocoli', name: 'Brócoli Salteado', ingredients: [{ id: 'ing_brocoli', name: 'Brócoli', quantity: '1', unit: 'unid' }] }
            ],
            dinner: { id: 'd1_d', dishId: 'bollito_1', name: 'Bollitos con mantequilla y queso', ingredients: [] }
          },
          2: {
            breakfast: null,
            lunchProtein: { id: 'd2_p', dishId: 'pollo_buda', name: 'Pollo Buda', ingredients: [{ id: 'ing_pollo', name: 'Pechuga de Pollo', quantity: '1', unit: 'kg' }] },
            lunchSides: [
              { id: 'd2_s1', dishId: 'fideos', name: 'Fideos con jengibre y cebollín', ingredients: [{ id: 'ing_fideos', name: 'Fideos', quantity: '1', unit: 'paq' }] }
            ],
            dinner: { id: 'd2_d', dishId: 'sopa_fideos', name: 'Sopa de Fideos', ingredients: [] }
          },
          3: {
            breakfast: null,
            lunchProtein: { id: 'd3_p', dishId: 'albondigas', name: 'Albóndigas en salsa', ingredients: [{ id: 'ing_molida', name: 'Carne Molida', quantity: '500', unit: 'gr' }] },
            lunchSides: [
              { id: 'd3_s1', dishId: 'pure', name: 'Puré de papas', ingredients: [] },
              { id: 'd3_s2', dishId: 'ensalada_v', name: 'Ensalada Verde', ingredients: [] }
            ],
            dinner: { id: 'd3_d', dishId: 'arepa_3', name: 'Arepas', ingredients: [] }
          },
          4: {
            breakfast: null,
            lunchProtein: { id: 'd4_p', dishId: 'pollo_luisa', name: 'Pollo a la Luisa', ingredients: [] },
            lunchSides: [
              { id: 'd4_s1', dishId: 'ensalada_rusa', name: 'Ensalada Rusa', ingredients: [] },
              { id: 'd4_s2', dishId: 'chucrut', name: 'Ensalada de Falso Chucrut', ingredients: [] }
            ],
            dinner: { id: 'd4_d', dishId: 'sopa_maiz', name: 'Sopa de Maíz', ingredients: [] }
          },
          5: {
            breakfast: null,
            lunchProtein: { id: 'd5_p', dishId: 'callos', name: 'Callos a la Madrileña', ingredients: [] },
            lunchSides: [
              { id: 'd5_s1', dishId: 'arroz_5', name: 'Arroz blanco', ingredients: [] },
              { id: 'd5_s2', dishId: 'platano_h', name: 'Plátano horneado', ingredients: [] }
            ],
            dinner: { id: 'd5_d', dishId: 'sopa_pollo', name: 'Sopa de Pollo', ingredients: [] }
          },
          6: {
            breakfast: null,
            lunchProtein: { id: 'd6_p', dishId: 'pescado', name: 'Pescado frito', ingredients: [{ id: 'ing_pesc', name: 'Pescado Fresco', quantity: '1', unit: 'kg' }] },
            lunchSides: [
              { id: 'd6_s1', dishId: 'yuca', name: 'Yuca con mojo', ingredients: [] },
              { id: 'd6_s2', dishId: 'ensalada_6', name: 'Ensalada Mixta', ingredients: [] }
            ],
            dinner: null
          }
        },
        updatedAt: new Date().toISOString()
      };

      await this.weeklyMenus.add(sampleMenu);
    }
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

  onLocalChange?: () => void;

  async logChange(action: 'insert' | 'update' | 'delete', entity: SyncQueueItem['entity'], entityId: string, data: any) {
    await this.syncQueue.add({
      action,
      entity,
      entityId,
      data,
      timestamp: new Date().toISOString()
    });
    if (this.onLocalChange) {
      this.onLocalChange();
    }
  }
}
