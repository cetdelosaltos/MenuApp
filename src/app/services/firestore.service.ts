import { Injectable, signal, effect } from '@angular/core';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  Unsubscribe,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { Category, Ingredient, Dish, WeeklyMenu, ShoppingItem } from '../models/types';
import { INITIAL_CATEGORIES, INITIAL_INGREDIENTS, INITIAL_DISHES } from '../data/seed-data';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore: Firestore;
  
  householdCode = signal<string>(this.getStoredHouseholdCode());
  householdName = signal<string>(this.getStoredHouseholdName());
  
  // Realtime Live Data Signals
  categories = signal<Category[]>([]);
  ingredients = signal<Ingredient[]>([]);
  dishes = signal<Dish[]>([]);
  weeklyMenus = signal<WeeklyMenu[]>([]);
  shoppingItems = signal<ShoppingItem[]>([]);
  
  isOnline = signal<boolean>(navigator.onLine);
  isConnecting = signal<boolean>(true);
  lastSyncAt = signal<string>(new Date().toISOString());

  permissionError = signal<boolean>(false);

  private unsubscribers: Unsubscribe[] = [];
  private isSeeding = false;

  constructor() {
    // 1. Initialize Firebase App
    const app = getApps().length > 0 ? getApp() : initializeApp(environment.firebase);

    // 2. Initialize Firestore with Offline Multi-tab Persistence
    try {
      this.firestore = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch (err) {
      console.warn('Firestore already initialized or persistent cache fallback:', err);
      this.firestore = getFirestore(app);
    }

    // 3. Online / Offline browser listeners
    window.addEventListener('online', () => this.isOnline.set(true));
    window.addEventListener('offline', () => this.isOnline.set(false));

    // 4. Reactively setup real-time subscriptions whenever household code changes
    effect(() => {
      const code = this.householdCode();
      if (code) {
        this.setupSubscriptions(code);
      }
    });
  }

  private getStoredHouseholdCode(): string {
    return localStorage.getItem('menuapp_household_code') || 'HOGAR-2026';
  }

  private getStoredHouseholdName(): string {
    return localStorage.getItem('menuapp_household_name') || 'Mi Hogar';
  }

  setHousehold(code: string, name: string): void {
    const cleanCode = (code || 'HOGAR-2026').trim().toUpperCase();
    const cleanName = (name || 'Mi Hogar').trim();
    localStorage.setItem('menuapp_household_code', cleanCode);
    localStorage.setItem('menuapp_household_name', cleanName);
    this.householdName.set(cleanName);
    this.householdCode.set(cleanCode);
  }

  private setupSubscriptions(householdCode: string): void {
    // Unsubscribe from previous listeners
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
    this.isConnecting.set(true);
    this.permissionError.set(false);

    const basePath = `households/${householdCode}`;

    const handleError = (context: string, err: any) => {
      console.error(`Error in ${context} snapshot:`, err);
      this.isConnecting.set(false);
      const msg = err?.message || String(err);
      if (err?.code === 'permission-denied' || msg.includes('insufficient permissions')) {
        this.permissionError.set(true);
      }
    };

    let loadedCount = 0;
    const markLoaded = () => {
      loadedCount++;
      if (loadedCount >= 4) {
        this.isConnecting.set(false);
      }
    };

    // 1. Categories Real-time Listener
    const catCol = collection(this.firestore, `${basePath}/categories`);
    const unsubCat = onSnapshot(catCol, async (snapshot) => {
      if (snapshot.empty && !this.isSeeding) {
        await this.seedCategories(householdCode);
      } else {
        const cats = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Category));
        cats.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
        this.categories.set(cats);
      }
      markLoaded();
      this.lastSyncAt.set(new Date().toISOString());
    }, (err) => handleError('categories', err));
    this.unsubscribers.push(unsubCat);

    // 2. Ingredients Real-time Listener
    const ingCol = collection(this.firestore, `${basePath}/ingredients`);
    const unsubIng = onSnapshot(ingCol, async (snapshot) => {
      if (snapshot.empty && !this.isSeeding) {
        await this.seedIngredients(householdCode);
      } else {
        const ings = snapshot.docs
          .map(d => ({ ...d.data(), id: d.id } as Ingredient))
          .filter(i => !i.deletedAt);
        this.ingredients.set(ings);
      }
      markLoaded();
      this.lastSyncAt.set(new Date().toISOString());
    }, (err) => handleError('ingredients', err));
    this.unsubscribers.push(unsubIng);

    // 3. Dishes Real-time Listener
    const dishCol = collection(this.firestore, `${basePath}/dishes`);
    const unsubDish = onSnapshot(dishCol, async (snapshot) => {
      if (snapshot.empty && !this.isSeeding) {
        await this.seedDishes(householdCode);
      } else {
        const dishes = snapshot.docs
          .map(d => ({ ...d.data(), id: d.id } as Dish))
          .filter(d => !d.deletedAt);
        this.dishes.set(dishes);
      }
      markLoaded();
      this.lastSyncAt.set(new Date().toISOString());
    }, (err) => handleError('dishes', err));
    this.unsubscribers.push(unsubDish);

    // 4. Weekly Menus Real-time Listener
    const menuCol = collection(this.firestore, `${basePath}/weeklyMenus`);
    const unsubMenu = onSnapshot(menuCol, async (snapshot) => {
      if (snapshot.empty && !this.isSeeding) {
        await this.seedSampleMenu(householdCode);
      } else {
        const menus = snapshot.docs
          .map(d => ({ ...d.data(), id: d.id } as WeeklyMenu))
          .filter(m => !m.deletedAt);
        this.weeklyMenus.set(menus);
      }
      markLoaded();
      this.lastSyncAt.set(new Date().toISOString());
    }, (err) => handleError('weeklyMenus', err));
    this.unsubscribers.push(unsubMenu);

    // 5. Shopping Items Real-time Listener
    const shopCol = collection(this.firestore, `${basePath}/shoppingItems`);
    const unsubShop = onSnapshot(shopCol, (snapshot) => {
      const items = snapshot.docs
        .map(d => ({ ...d.data(), id: d.id } as ShoppingItem))
        .filter(s => !s.deletedAt);
      this.shoppingItems.set(items);
      this.lastSyncAt.set(new Date().toISOString());
    }, (err) => handleError('shoppingItems', err));
    this.unsubscribers.push(unsubShop);
  }

  // ==================== SEED INITIAL DATA ====================

  private async seedCategories(householdCode: string): Promise<void> {
    const basePath = `households/${householdCode}`;
    const batch = writeBatch(this.firestore);
    for (const cat of INITIAL_CATEGORIES) {
      const ref = doc(this.firestore, `${basePath}/categories/${cat.id}`);
      batch.set(ref, cat);
    }
    await batch.commit();
  }

  private async seedIngredients(householdCode: string): Promise<void> {
    const basePath = `households/${householdCode}`;
    // Firestore batch limit is 500 operations
    const chunks: Ingredient[][] = [];
    for (let i = 0; i < INITIAL_INGREDIENTS.length; i += 400) {
      chunks.push(INITIAL_INGREDIENTS.slice(i, i + 400));
    }
    for (const chunk of chunks) {
      const batch = writeBatch(this.firestore);
      for (const ing of chunk) {
        const ref = doc(this.firestore, `${basePath}/ingredients/${ing.id}`);
        batch.set(ref, { ...ing, householdId: householdCode });
      }
      await batch.commit();
    }
  }

  private async seedDishes(householdCode: string): Promise<void> {
    const basePath = `households/${householdCode}`;
    const chunks: Dish[][] = [];
    for (let i = 0; i < INITIAL_DISHES.length; i += 400) {
      chunks.push(INITIAL_DISHES.slice(i, i + 400));
    }
    for (const chunk of chunks) {
      const batch = writeBatch(this.firestore);
      for (const dish of chunk) {
        const ref = doc(this.firestore, `${basePath}/dishes/${dish.id}`);
        batch.set(ref, { ...dish, householdId: householdCode });
      }
      await batch.commit();
    }
  }

  private async seedSampleMenu(householdCode: string): Promise<void> {
    if (this.weeklyMenus().length > 0) return;

    const today = new Date();
    const sunday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);
    sunday.setDate(sunday.getDate() - sunday.getDay());

    const year = sunday.getFullYear();
    const month = String(sunday.getMonth() + 1).padStart(2, '0');
    const day = String(sunday.getDate()).padStart(2, '0');
    const weekStartStr = `${year}-${month}-${day}`;

    const sampleMenu: WeeklyMenu = {
      id: weekStartStr,
      householdId: householdCode,
      weekStartDate: weekStartStr,
      title: `Semana del Domingo ${day}/${month}/${year}`,
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

    await this.saveWeeklyMenu(sampleMenu);
  }

  // ==================== CRUD OPERATIONS ====================

  async saveWeeklyMenu(menu: WeeklyMenu): Promise<void> {
    const basePath = `households/${this.householdCode()}`;
    const ref = doc(this.firestore, `${basePath}/weeklyMenus/${menu.id}`);
    const cleanedMenu = JSON.parse(JSON.stringify(menu)); // strip undefined values
    await setDoc(ref, cleanedMenu, { merge: true });
  }

  async saveDish(dish: Dish): Promise<void> {
    const basePath = `households/${this.householdCode()}`;
    const ref = doc(this.firestore, `${basePath}/dishes/${dish.id}`);
    const cleaned = JSON.parse(JSON.stringify(dish));
    await setDoc(ref, cleaned, { merge: true });
  }

  async deleteDish(dishId: string): Promise<void> {
    const basePath = `households/${this.householdCode()}`;
    const ref = doc(this.firestore, `${basePath}/dishes/${dishId}`);
    await updateDoc(ref, { deletedAt: new Date().toISOString() });
  }

  async saveIngredient(ing: Ingredient): Promise<void> {
    const basePath = `households/${this.householdCode()}`;
    const ref = doc(this.firestore, `${basePath}/ingredients/${ing.id}`);
    const cleaned = JSON.parse(JSON.stringify(ing));
    await setDoc(ref, cleaned, { merge: true });
  }

  async deleteIngredient(ingId: string): Promise<void> {
    const basePath = `households/${this.householdCode()}`;
    const ref = doc(this.firestore, `${basePath}/ingredients/${ingId}`);
    await updateDoc(ref, { deletedAt: new Date().toISOString() });
  }

  async saveShoppingItem(item: ShoppingItem): Promise<void> {
    const basePath = `households/${this.householdCode()}`;
    const ref = doc(this.firestore, `${basePath}/shoppingItems/${item.id}`);
    const cleaned = JSON.parse(JSON.stringify(item));
    await setDoc(ref, cleaned, { merge: true });
  }

  async saveShoppingItemsBatch(items: ShoppingItem[]): Promise<void> {
    if (items.length === 0) return;
    const basePath = `households/${this.householdCode()}`;
    const batch = writeBatch(this.firestore);
    for (const item of items) {
      const ref = doc(this.firestore, `${basePath}/shoppingItems/${item.id}`);
      const cleaned = JSON.parse(JSON.stringify(item));
      batch.set(ref, cleaned, { merge: true });
    }
    await batch.commit();
  }

  async deleteShoppingItem(itemId: string): Promise<void> {
    const basePath = `households/${this.householdCode()}`;
    const ref = doc(this.firestore, `${basePath}/shoppingItems/${itemId}`);
    await updateDoc(ref, { deletedAt: new Date().toISOString() });
  }
}
