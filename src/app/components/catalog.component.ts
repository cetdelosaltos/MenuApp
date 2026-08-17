import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../services/firestore.service';
import { MenuService } from '../services/menu.service';
import { Dish, Ingredient, Category, DishType } from '../models/types';
import { IconComponent } from './icon.component';
import { DishEditComponent } from './dish-edit.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, DishEditComponent],
  template: `
    <div class="catalog-page animate-fade">
      
      <!-- Dedicated Dish/Recipe Editor View -->
      <app-dish-edit
        *ngIf="viewMode === 'edit'"
        [dish]="selectedDish"
        (saved)="onDishSaved()"
        (cancelled)="viewMode = 'list'"
      ></app-dish-edit>

      <!-- Main Catalog View -->
      <ng-container *ngIf="viewMode === 'list'">
        
        <!-- Top header -->
        <div class="catalog-header">
          <div>
            <h2 class="section-title">Catálogo de Recetas e Ingredientes</h2>
            <p class="section-sub">Administra tus platos favoritos, enlaces a recetas y catálogo de ingredientes.</p>
          </div>
          <div class="header-tabs">
            <button class="tab-btn" [class.active]="activeTab === 'dishes'" (click)="activeTab = 'dishes'">
              <app-icon name="food" [size]="16"></app-icon> Platos ({{ dishes().length }})
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'ingredients'" (click)="activeTab = 'ingredients'">
              <app-icon name="tag" [size]="16"></app-icon> Ingredientes ({{ ingredients().length }})
            </button>
          </div>
        </div>

        <!-- DISHES TAB -->
        <div *ngIf="activeTab === 'dishes'" class="tab-content">
          
          <!-- Search & Filter bar -->
          <div class="search-filter-bar">
            <div class="search-box">
              <app-icon name="search" [size]="16" extraClass="text-muted"></app-icon>
              <input
                type="text"
                class="search-input"
                [(ngModel)]="searchDishQuery"
                placeholder="Buscar plato o ingrediente..."
              />
            </div>

            <div class="filter-type-group">
              <button class="filter-btn" [class.active]="dishTypeFilter === 'all'" (click)="dishTypeFilter = 'all'">Todos</button>
              <button class="filter-btn" [class.active]="dishTypeFilter === 'protein'" (click)="dishTypeFilter = 'protein'">Proteínas</button>
              <button class="filter-btn" [class.active]="dishTypeFilter === 'side'" (click)="dishTypeFilter = 'side'">Contornos</button>
              <button class="filter-btn" [class.active]="dishTypeFilter === 'breakfast'" (click)="dishTypeFilter = 'breakfast'">Desayunos</button>
              <button class="filter-btn" [class.active]="dishTypeFilter === 'dinner'" (click)="dishTypeFilter = 'dinner'">Cenas</button>
            </div>

            <button class="btn-create-dish" (click)="openCreateDish()">
              <app-icon name="plus" [size]="16"></app-icon> Nuevo Plato
            </button>
          </div>

          <!-- Dishes Grid -->
          <div class="dishes-grid">
            <div *ngFor="let dish of filteredDishes()" class="dish-card">
              <div class="dish-card-header">
                <span class="badge" [ngClass]="getDishBadgeClass(dish.type)">{{ getDishTypeLabel(dish.type) }}</span>
                <a *ngIf="dish.recipeUrl" [href]="dish.recipeUrl" target="_blank" rel="noopener noreferrer" class="dish-link" title="Abrir receta externa">
                  <app-icon name="external-link" [size]="14"></app-icon>
                  <span>Receta</span>
                </a>
              </div>

              <h3 class="dish-card-title">{{ dish.name }}</h3>

              <!-- Assigned Ingredients preview -->
              <div class="dish-card-ings">
                <div class="ings-summary-title">
                  <app-icon name="tag" [size]="13" extraClass="text-muted"></app-icon>
                  <span class="ings-label">Ingredientes ({{ (dish.ingredientIds || []).length }}):</span>
                </div>
                <div class="ings-chips-wrap" *ngIf="dish.ingredientIds?.length; else noIngs">
                  <span *ngFor="let ingName of getDishIngredientNames(dish)" class="ing-mini-chip">
                    {{ ingName }}
                  </span>
                </div>
                <ng-template #noIngs>
                  <span class="ings-none">Sin ingredientes asignados</span>
                </ng-template>
              </div>

              <div class="dish-card-footer">
                <button class="btn-dish-edit" (click)="editDish(dish)">
                  <app-icon name="edit" [size]="14"></app-icon> Editar Receta
                </button>
                <button class="btn-dish-delete" (click)="deleteDish(dish)" title="Eliminar plato">
                  <app-icon name="trash" [size]="14"></app-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="filteredDishes().length === 0" class="empty-state">
            <p>No se encontraron platos que coincidan con la búsqueda.</p>
            <button class="btn-create-dish" (click)="openCreateDish()">
              <app-icon name="plus" [size]="16"></app-icon> Crear Nuevo Plato
            </button>
          </div>

        </div>

        <!-- INGREDIENTS TAB -->
        <div *ngIf="activeTab === 'ingredients'" class="tab-content">
          
          <div class="search-filter-bar">
            <div class="search-box">
              <app-icon name="search" [size]="16" extraClass="text-muted"></app-icon>
              <input
                type="text"
                class="search-input"
                [(ngModel)]="searchIngQuery"
                placeholder="Buscar ingrediente (ej. queso, papas, carne)..."
              />
            </div>

            <button class="btn-create-dish" (click)="showNewIngModal = true">
              <app-icon name="plus" [size]="16"></app-icon> Nuevo Ingrediente
            </button>
          </div>

          <div class="ingredients-table-card">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th>Categoría</th>
                  <th>Última Compra</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let ing of filteredIngredients()">
                  <td class="font-bold">{{ ing.name }}</td>
                  <td>
                    <span class="cat-pill" [style.background-color]="getCatColor(ing.categoryId) + '20'" [style.color]="getCatColor(ing.categoryId)">
                      {{ getCatName(ing.categoryId) }}
                    </span>
                  </td>
                  <td class="text-muted">{{ ing.lastPurchasedAt ? formatLastPurchase(ing.lastPurchasedAt) : 'Sin registro' }}</td>
                  <td>
                    <button class="btn-row-del" (click)="deleteIngredient(ing)" title="Eliminar de la base de datos">
                      <app-icon name="trash" [size]="14"></app-icon>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        <!-- Modal Create Quick Ingredient -->
        <div *ngIf="showNewIngModal" class="modal-backdrop" (click)="showNewIngModal = false">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Nuevo Ingrediente</h3>
              <button class="btn-close" (click)="showNewIngModal = false">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Nombre del Ingrediente</label>
                <input type="text" class="form-input" [(ngModel)]="quickIngName" placeholder="Ej. Tomates, Harina PAN, Queso Llanero..." autofocus />
              </div>
              <div class="form-group">
                <label>Categoría</label>
                <select class="form-input" [(ngModel)]="quickIngCat">
                  <option *ngFor="let c of categories()" [value]="c.id">{{ c.name }}</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" (click)="showNewIngModal = false">Cancelar</button>
              <button class="btn-primary" (click)="saveQuickIngredient()">Guardar Ingrediente</button>
            </div>
          </div>
        </div>

      </ng-container>

    </div>
  `,
  styles: [`
    .catalog-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 4px;
    }

    .catalog-header {
      background: #ffffff;
      padding: 16px 20px;
      border-radius: 16px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
    }

    .section-sub {
      font-size: 0.85rem;
      color: #64748b;
      margin-top: 2px;
    }

    .header-tabs {
      display: flex;
      gap: 8px;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.88rem;
      background: #f1f5f9;
      color: #475569;
    }
    .tab-btn.active {
      background: #10b981;
      color: #ffffff;
    }

    .tab-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .search-filter-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      background: #ffffff;
      padding: 10px 16px;
      border-radius: 14px;
      border: 1px solid var(--border-color);
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 220px;
      background: #f8fafc;
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
    }

    .search-input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.88rem;
      width: 100%;
    }

    .filter-type-group {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      background: #f1f5f9;
      color: #475569;
    }
    .filter-btn.active {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }

    .btn-create-dish {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #10b981;
      color: #ffffff;
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
    }
    .btn-create-dish:hover {
      background: #059669;
    }

    /* Dishes Grid */
    .dishes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .dish-card {
      background: #ffffff;
      border-radius: 14px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: all 0.2s ease;
    }
    .dish-card:hover {
      border-color: #cbd5e1;
      box-shadow: var(--shadow-md);
    }

    .dish-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .dish-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #059669;
      padding: 3px 8px;
      background: #ecfdf5;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      text-decoration: none;
    }
    .dish-link:hover {
      background: #d1fae5;
    }

    .dish-card-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #1e293b;
    }

    .dish-card-ings {
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: #f8fafc;
      padding: 10px;
      border-radius: 10px;
      border: 1px solid #f1f5f9;
    }

    .ings-summary-title {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .ings-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .ings-chips-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      max-height: 60px;
      overflow-y: auto;
    }

    .ing-mini-chip {
      font-size: 0.72rem;
      padding: 2px 7px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      color: #334155;
      font-weight: 500;
    }

    .ings-none {
      font-size: 0.75rem;
      color: #94a3b8;
      font-style: italic;
    }

    .dish-card-footer {
      margin-top: auto;
      padding-top: 10px;
      border-top: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .btn-dish-edit {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      font-weight: 700;
      color: #065f46;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 6px 12px;
      border-radius: 8px;
      flex: 1;
      justify-content: center;
    }
    .btn-dish-edit:hover {
      background: #d1fae5;
    }

    .btn-dish-delete {
      color: #94a3b8;
      padding: 6px 8px;
      border-radius: 8px;
      background: #f8fafc;
    }
    .btn-dish-delete:hover { color: #dc2626; background: #fee2e2; }

    /* Ingredients Table */
    .ingredients-table-card {
      background: #ffffff;
      border-radius: 14px;
      border: 1px solid var(--border-color);
      overflow: hidden;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th, .data-table td {
      padding: 10px 14px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.88rem;
      text-align: left;
    }

    .data-table th {
      background: #f8fafc;
      font-weight: 700;
      color: #475569;
    }

    .cat-pill {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
    }

    .btn-row-del {
      color: #94a3b8;
      padding: 4px 6px;
      border-radius: 6px;
    }
    .btn-row-del:hover { color: #dc2626; background: #fee2e2; }

    .empty-state {
      padding: 40px 20px;
      text-align: center;
      background: #ffffff;
      border-radius: 14px;
      border: 1px dashed #cbd5e1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: #64748b;
    }

    /* Modal Quick Ingredient */
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 16px;
    }

    .modal-card {
      background: #ffffff;
      border-radius: 14px;
      width: 100%;
      max-width: 440px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .modal-header {
      padding: 14px 18px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .btn-close { color: #64748b; font-size: 1.1rem; }

    .modal-body {
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
    }

    .form-input {
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.9rem;
      outline: none;
    }
    .form-input:focus { border-color: #10b981; }

    .modal-footer {
      padding: 12px 18px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .btn-secondary {
      padding: 6px 14px;
      background: #e2e8f0;
      color: #334155;
      border-radius: 8px;
      font-weight: 600;
    }

    .btn-primary {
      padding: 6px 16px;
      background: #10b981;
      color: #ffffff;
      border-radius: 8px;
      font-weight: 600;
    }
  `]
})
export class CatalogComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private menuService = inject(MenuService);

  viewMode: 'list' | 'edit' = 'list';
  selectedDish: Dish | null = null;

  activeTab: 'dishes' | 'ingredients' = 'dishes';
  dishes = computed<Dish[]>(() => this.firestoreService.dishes());
  ingredients = computed<Ingredient[]>(() => this.firestoreService.ingredients());
  categories = computed<Category[]>(() => this.firestoreService.categories());

  searchDishQuery = '';
  dishTypeFilter: 'all' | 'protein' | 'side' | 'breakfast' | 'dinner' = 'all';

  searchIngQuery = '';

  // Quick ingredient modal
  showNewIngModal = false;
  quickIngName = '';
  quickIngCat = 'cat_viveres';

  ngOnInit(): void {}

  async refreshData(): Promise<void> {}

  filteredDishes(): Dish[] {
    return this.dishes().filter(d => {
      const q = this.searchDishQuery.toLowerCase().trim();
      let matchesSearch = true;
      if (q) {
        const matchesName = d.name.toLowerCase().includes(q);
        const matchesIng = (d.ingredientIds || []).some(id => {
          const found = this.ingredients().find(i => i.id === id);
          return found && found.name.toLowerCase().includes(q);
        });
        matchesSearch = matchesName || matchesIng;
      }
      const matchesType = this.dishTypeFilter === 'all' || d.type === this.dishTypeFilter;
      return matchesSearch && matchesType;
    });
  }

  getDishIngredientNames(dish: Dish): string[] {
    const ings = this.ingredients();
    return (dish.ingredientIds || [])
      .map(id => ings.find(i => i.id === id)?.name)
      .filter((n): n is string => !!n);
  }

  filteredIngredients(): Ingredient[] {
    return this.ingredients().filter(i => {
      return !this.searchIngQuery || i.name.toLowerCase().includes(this.searchIngQuery.toLowerCase());
    });
  }

  getDishBadgeClass(type: DishType): string {
    switch (type) {
      case 'protein': return 'badge-rose';
      case 'side': return 'badge-emerald';
      case 'breakfast': return 'badge-amber';
      case 'dinner': return 'badge-blue';
      default: return 'badge-gray';
    }
  }

  getDishTypeLabel(type: DishType): string {
    switch (type) {
      case 'protein': return 'Proteína';
      case 'side': return 'Contorno';
      case 'breakfast': return 'Desayuno';
      case 'dinner': return 'Cena';
      default: return 'Otro';
    }
  }

  getCatColor(catId?: string): string {
    const found = this.categories().find(c => c.id === catId);
    return found ? found.color : '#64748b';
  }

  getCatName(catId?: string): string {
    const found = this.categories().find(c => c.id === catId);
    return found ? found.name : 'Víveres';
  }

  formatLastPurchase(isoStr: string): string {
    const d = new Date(isoStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  openCreateDish(): void {
    this.selectedDish = null;
    this.viewMode = 'edit';
  }

  editDish(dish: Dish): void {
    this.selectedDish = dish;
    this.viewMode = 'edit';
  }

  async onDishSaved(): Promise<void> {
    this.viewMode = 'list';
    this.selectedDish = null;
    await this.refreshData();
    await this.menuService.loadCatalog();
  }

  async deleteDish(dish: Dish): Promise<void> {
    if (confirm(`¿Eliminar "${dish.name}" del catálogo?`)) {
      await this.firestoreService.deleteDish(dish.id);
    }
  }

  async deleteIngredient(ing: Ingredient): Promise<void> {
    if (confirm(`¿Eliminar definitivamente "${ing.name}" de la base de datos?`)) {
      await this.menuService.deleteIngredientDefinitive(ing.id);
      await this.refreshData();
    }
  }

  async saveQuickIngredient(): Promise<void> {
    if (!this.quickIngName.trim()) return;

    await this.menuService.createOrGetIngredient(this.quickIngName.trim(), this.quickIngCat);
    this.quickIngName = '';
    this.showNewIngModal = false;
    await this.refreshData();
  }
}
