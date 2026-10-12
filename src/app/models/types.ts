export type DishType = 'protein' | 'side' | 'breakfast' | 'dinner' | 'other';
export type ShoppingItemStatus = 'pending' | 'in_pantry' | 'purchased';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  orderIndex: number;
}

export interface Ingredient {
  id: string;
  householdId: string;
  name: string;
  categoryId: string;
  defaultUnit?: string;
  lastPurchasedAt?: string; // ISO string
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Dish {
  id: string;
  householdId: string;
  name: string;
  type: DishType;
  types?: DishType[]; // Multi-category assignment
  recipeUrl?: string;
  ingredientIds: string[]; // List of associated ingredient IDs
  updatedAt: string;
  deletedAt?: string | null;
}

export interface PlannedDishItem {
  id: string;
  dishId: string;
  name: string;
  recipeUrl?: string;
  ingredients: {
    id: string;
    name: string;
    quantity?: string;
    unit?: string;
    categoryId?: string;
  }[];
}

export interface DayPlan {
  breakfast: PlannedDishItem | null;
  lunchProtein: PlannedDishItem | null;
  lunchSides: PlannedDishItem[];
  other?: string;
  dinner: PlannedDishItem | null;
}

export interface WeeklyMenu {
  id: string; // usually weekStartDate e.g. '2026-08-09'
  householdId: string;
  weekStartDate: string; // ISO date format 'YYYY-MM-DD' (always Sunday)
  title: string; // e.g. "Semana del Domingo 09/08/2026"
  days: {
    [dayIndex: number]: DayPlan; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  };
  notes?: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ShoppingItem {
  id: string;
  householdId: string;
  name: string;
  categoryId: string;
  ingredientId?: string;
  quantity: string;
  unit: string;
  status: ShoppingItemStatus;
  sourceType: 'menu' | 'manual';
  sourceWeekStartDate?: string;
  lastPurchasedAt?: string; // ISO string
  updatedAt: string;
  deletedAt?: string | null;
}

export interface HouseholdConfig {
  householdCode: string;
  householdName: string;
  serverUrl: string;
  syncEnabled: boolean;
  lastSyncAt?: string;
  autoSync: boolean;
}

export interface SyncDeltaPayload {
  householdCode: string;
  clientTimestamp: string;
  changes: {
    categories?: Category[];
    ingredients?: Ingredient[];
    dishes?: Dish[];
    weeklyMenus?: WeeklyMenu[];
    shoppingItems?: ShoppingItem[];
  };
}

export interface SyncResponse {
  success: boolean;
  serverTimestamp: string;
  serverChanges: {
    categories?: Category[];
    ingredients?: Ingredient[];
    dishes?: Dish[];
    weeklyMenus?: WeeklyMenu[];
    shoppingItems?: ShoppingItem[];
  };
  message?: string;
}

export interface AppPlatformRelease {
  version: string;
  versionCode?: number;
  downloadUrl: string;
  notes: string;
  mandatory?: boolean;
  publishedAt: string;
}

export interface AppVersionConfig {
  android?: AppPlatformRelease;
  desktop?: AppPlatformRelease;
  updatedAt?: string;
}
