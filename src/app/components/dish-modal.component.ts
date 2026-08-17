import { Component, EventEmitter, Input, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../services/menu.service';
import { Dish, Ingredient, PlannedDishItem, DishType } from '../models/types';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-dish-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="modal-backdrop" (click)="onClose()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="modal-header">
          <div class="header-info">
            <span class="badge" [ngClass]="getSlotBadgeClass()">{{ slotTitle }}</span>
            <h2 class="modal-title">{{ dayName }} - Planificación</h2>
          </div>
          <button class="btn-icon-close" (click)="onClose()" title="Cerrar">
            <app-icon name="x" [size]="20"></app-icon>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          
          <!-- Dish Name / Search -->
          <div class="form-group">
            <label class="form-label">Nombre del Plato / Receta</label>
            <div class="input-wrapper">
              <input
                type="text"
                class="form-input"
                [(ngModel)]="dishName"
                (input)="filterSuggestions()"
                placeholder="Ej. Caraotas Negras, Rollo de Carne, Arepa..."
                autofocus
              />
              <span *ngIf="dishName" class="clear-btn" (click)="dishName = ''; filterSuggestions()">✕</span>
            </div>

            <!-- Suggestions Dropdown -->
            <div *ngIf="showSuggestions && filteredDishes.length > 0" class="suggestions-list">
              <div
                *ngFor="let dish of filteredDishes"
                class="suggestion-item"
                (click)="selectDish(dish)"
              >
                <div class="suggestion-main">
                  <span class="suggestion-name">{{ dish.name }}</span>
                  <span *ngIf="dish.recipeUrl" class="suggestion-url">🔗 Con receta</span>
                </div>
                <span class="suggestion-meta">{{ (dish.ingredientIds || []).length }} ingredientes</span>
              </div>
            </div>
          </div>

          <!-- Recipe Link (Web or Instagram Reel) -->
          <div class="form-group">
            <label class="form-label">
              Enlace de Receta (Web, Instagram, YouTube)
              <a *ngIf="recipeUrl" [href]="recipeUrl" target="_blank" class="external-link-btn" title="Abrir enlace">
                <app-icon name="external-link" [size]="14"></app-icon> Abrir
              </a>
            </label>
            <input
              type="url"
              class="form-input"
              [(ngModel)]="recipeUrl"
              placeholder="https://www.instagram.com/reel/... o https://recetas.com/..."
            />
          </div>

          <!-- Ingredients Section -->
          <div class="ingredients-section">
            <div class="ingredients-header">
              <h3 class="section-title">Ingredientes Asociados</h3>
              <span class="badge badge-gray">{{ tempIngredients.length }} items</span>
            </div>

            <!-- Add new ingredient bar -->
            <div class="add-ing-bar">
              <input
                type="text"
                class="form-input form-input-sm"
                [(ngModel)]="newIngName"
                (input)="filterIngSuggestions()"
                placeholder="Nuevo ingrediente (ej. Cebolla, Queso)..."
                (keyup.enter)="addIngredientFromInput()"
              />
              <input
                type="text"
                class="form-input form-input-sm qty-input"
                [(ngModel)]="newIngQty"
                placeholder="Cant. (ej. 1)"
                (keyup.enter)="addIngredientFromInput()"
              />
              <input
                type="text"
                class="form-input form-input-sm unit-input"
                [(ngModel)]="newIngUnit"
                placeholder="Unidad (kg, paq)"
                (keyup.enter)="addIngredientFromInput()"
              />
              <button class="btn-add-ing" (click)="addIngredientFromInput()" title="Añadir ingrediente">
                <app-icon name="plus" [size]="16"></app-icon> Añadir
              </button>

              <!-- Ingredient suggestions -->
              <div *ngIf="showIngSuggestions && filteredIngredients.length > 0" class="suggestions-list ing-suggestions">
                <div
                  *ngFor="let ing of filteredIngredients"
                  class="suggestion-item"
                  (click)="selectIngredient(ing)"
                >
                  <span class="suggestion-name">{{ ing.name }}</span>
                  <span class="suggestion-meta">{{ getCategoryName(ing.categoryId) }}</span>
                </div>
              </div>
            </div>

            <!-- Current Ingredients List -->
            <div class="ingredients-list">
              <div *ngIf="tempIngredients.length === 0" class="empty-ingredients">
                No hay ingredientes asignados a este plato. Puedes agregar nuevos arriba.
              </div>

              <div *ngFor="let ing of tempIngredients; let i = index" class="ingredient-row">
                <div class="ing-info">
                  <span class="ing-bullet">•</span>
                  <span class="ing-name">{{ ing.name }}</span>
                </div>

                <div class="ing-qty-controls">
                  <input
                    type="text"
                    class="ing-qty-field"
                    [(ngModel)]="ing.quantity"
                    placeholder="Cant."
                    title="Cantidad"
                  />
                  <input
                    type="text"
                    class="ing-unit-field"
                    [(ngModel)]="ing.unit"
                    placeholder="Unid."
                    title="Unidad"
                  />
                </div>

                <div class="ing-actions">
                  <!-- Partial deletion: remove from this recipe only -->
                  <button
                    class="btn-ing-action btn-remove-partial"
                    (click)="removeIngredientPartial(i)"
                    title="Quitar solo de este plato (Parcial)"
                  >
                    <app-icon name="x" [size]="14"></app-icon>
                  </button>

                  <!-- Definitive deletion: delete from whole database -->
                  <button
                    class="btn-ing-action btn-remove-definitive"
                    (click)="confirmDeleteDefinitive(ing.id, ing.name)"
                    title="Eliminar DEFINITIVAMENTE de la base de datos"
                  >
                    <app-icon name="trash" [size]="14"></app-icon>
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button *ngIf="existingItem" class="btn-danger-outline" (click)="onClearSlot()">
            <app-icon name="trash" [size]="16"></app-icon> Quitar Plato
          </button>
          <div class="footer-actions">
            <button class="btn-secondary" (click)="onClose()">Cancelar</button>
            <button class="btn-primary" (click)="onSave()">
              <app-icon name="check" [size]="16"></app-icon> Guardar Plato
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      z-index: 9999;
      padding: 24px 16px;
      overflow-y: auto;
      animation: fadeIn 0.15s ease-out;
    }

    .modal-container {
      background: #ffffff;
      border-radius: 16px;
      width: 100%;
      max-width: 600px;
      max-height: calc(100vh - 48px);
      margin: auto 0;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .modal-header {
      padding: 16px 20px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f8fafc;
    }

    .header-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .modal-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #0f172a;
    }

    .btn-icon-close {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      background: #f1f5f9;
    }
    .btn-icon-close:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .modal-body {
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .external-link-btn {
      color: #059669;
      font-size: 0.8rem;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-weight: 600;
    }
    .external-link-btn:hover {
      text-decoration: underline;
    }

    .input-wrapper {
      position: relative;
    }

    .form-input {
      width: 100%;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1.5px solid #cbd5e1;
      font-size: 0.95rem;
      color: #0f172a;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-input:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
    }

    .clear-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      color: #94a3b8;
      font-size: 0.85rem;
    }

    .suggestions-list {
      position: absolute;
      top: 100%;
      left: 0; right: 0;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      margin-top: 4px;
      max-height: 180px;
      overflow-y: auto;
      z-index: 100;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }

    .suggestion-item {
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      border-bottom: 1px solid #f1f5f9;
    }
    .suggestion-item:hover {
      background: #ecfdf5;
    }

    .suggestion-name {
      font-weight: 600;
      color: #0f172a;
      font-size: 0.9rem;
    }

    .suggestion-url {
      font-size: 0.75rem;
      color: #059669;
      margin-left: 6px;
    }

    .suggestion-meta {
      font-size: 0.75rem;
      color: #64748b;
    }

    /* Ingredients Section */
    .ingredients-section {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .ingredients-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-title {
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
    }

    .add-ing-bar {
      position: relative;
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .form-input-sm {
      padding: 7px 10px;
      font-size: 0.85rem;
    }

    .qty-input { width: 80px; }
    .unit-input { width: 100px; }

    .btn-add-ing {
      display: flex;
      align-items: center;
      gap: 4px;
      background: #10b981;
      color: #ffffff;
      padding: 7px 12px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .btn-add-ing:hover {
      background: #059669;
    }

    .ing-suggestions {
      top: 100%;
    }

    .ingredients-list {
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: #f8fafc;
    }

    .empty-ingredients {
      padding: 16px;
      text-align: center;
      color: #94a3b8;
      font-size: 0.85rem;
    }

    .ingredient-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 10px;
      background: #ffffff;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      gap: 8px;
    }

    .ing-info {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      font-size: 0.88rem;
      font-weight: 600;
      color: #1e293b;
    }

    .ing-bullet {
      color: #10b981;
      font-weight: bold;
    }

    .ing-qty-controls {
      display: flex;
      gap: 4px;
    }

    .ing-qty-field, .ing-unit-field {
      padding: 4px 6px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.8rem;
      width: 55px;
      text-align: center;
    }

    .ing-actions {
      display: flex;
      gap: 4px;
    }

    .btn-ing-action {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-remove-partial {
      background: #f1f5f9;
      color: #64748b;
    }
    .btn-remove-partial:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .btn-remove-definitive {
      background: #fee2e2;
      color: #dc2626;
    }
    .btn-remove-definitive:hover {
      background: #fecaca;
    }

    /* Modal Footer */
    .modal-footer {
      padding: 14px 20px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .footer-actions {
      display: flex;
      gap: 10px;
      margin-left: auto;
    }

    .btn-secondary {
      padding: 8px 16px;
      border-radius: 10px;
      background: #e2e8f0;
      color: #334155;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .btn-secondary:hover {
      background: #cbd5e1;
    }

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      border-radius: 10px;
      background: #10b981;
      color: #ffffff;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .btn-primary:hover {
      background: #059669;
    }

    .btn-danger-outline {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 10px;
      border: 1px solid #fca5a5;
      background: #ffffff;
      color: #dc2626;
      font-weight: 600;
      font-size: 0.85rem;
    }
    .btn-danger-outline:hover {
      background: #fee2e2;
    }
  `]
})
export class DishModalComponent implements OnInit {
  @Input() dayIndex = 0;
  @Input() dayName = 'Lunes';
  @Input() slotType: 'breakfast' | 'lunchProtein' | 'lunchSides' | 'dinner' = 'lunchProtein';
  @Input() slotTitle = 'Almuerzo Principal';
  @Input() existingItem: PlannedDishItem | null = null;
  @Input() existingDishId?: string;

  @Output() save = new EventEmitter<PlannedDishItem>();
  @Output() clear = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  private menuService = inject(MenuService);

  dishName = '';
  recipeUrl = '';
  tempIngredients: { id: string; name: string; quantity: string; unit: string; categoryId?: string }[] = [];

  // Autocomplete state
  showSuggestions = false;
  filteredDishes: Dish[] = [];

  newIngName = '';
  newIngQty = '';
  newIngUnit = '';
  showIngSuggestions = false;
  filteredIngredients: Ingredient[] = [];

  ngOnInit(): void {
    if (this.existingItem) {
      this.dishName = this.existingItem.name || '';
      this.recipeUrl = this.existingItem.recipeUrl || '';
      this.tempIngredients = (this.existingItem.ingredients || []).map(i => ({ ...i, quantity: i.quantity || '', unit: i.unit || '' }));
    }
  }

  getSlotBadgeClass(): string {
    switch (this.slotType) {
      case 'breakfast': return 'badge-amber';
      case 'lunchProtein': return 'badge-rose';
      case 'lunchSides': return 'badge-emerald';
      case 'dinner': return 'badge-blue';
      default: return 'badge-gray';
    }
  }

  filterSuggestions(): void {
    if (!this.dishName.trim()) {
      this.showSuggestions = false;
      this.filteredDishes = [];
      return;
    }

    const query = this.dishName.toLowerCase().trim();
    const typeMapping: DishType = this.slotType === 'breakfast' ? 'breakfast'
      : this.slotType === 'lunchProtein' ? 'protein'
      : this.slotType === 'lunchSides' ? 'side'
      : 'dinner';

    this.filteredDishes = this.menuService.allDishes()
      .filter(d => d.name.toLowerCase().includes(query))
      .slice(0, 8);

    this.showSuggestions = this.filteredDishes.length > 0;
  }

  selectDish(dish: Dish): void {
    this.dishName = dish.name;
    this.recipeUrl = dish.recipeUrl || '';
    this.showSuggestions = false;

    // Populate associated ingredients
    const allIngs = this.menuService.allIngredients();
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

    this.tempIngredients = ingredients;
  }

  filterIngSuggestions(): void {
    if (!this.newIngName.trim()) {
      this.showIngSuggestions = false;
      this.filteredIngredients = [];
      return;
    }

    const query = this.newIngName.toLowerCase().trim();
    this.filteredIngredients = this.menuService.allIngredients()
      .filter(i => i.name.toLowerCase().includes(query))
      .slice(0, 6);

    this.showIngSuggestions = this.filteredIngredients.length > 0;
  }

  selectIngredient(ing: Ingredient): void {
    if (!this.tempIngredients.some(t => t.id === ing.id || t.name.toLowerCase() === ing.name.toLowerCase())) {
      this.tempIngredients.push({
        id: ing.id,
        name: ing.name,
        categoryId: ing.categoryId,
        quantity: this.newIngQty || '',
        unit: this.newIngUnit || ''
      });
    }
    this.newIngName = '';
    this.newIngQty = '';
    this.newIngUnit = '';
    this.showIngSuggestions = false;
  }

  async addIngredientFromInput(): Promise<void> {
    if (!this.newIngName.trim()) return;

    const ing = await this.menuService.createOrGetIngredient(this.newIngName.trim());
    this.selectIngredient(ing);
  }

  removeIngredientPartial(index: number): void {
    this.tempIngredients.splice(index, 1);
  }

  async confirmDeleteDefinitive(ingredientId: string, ingredientName: string): Promise<void> {
    if (confirm(`¿Estás seguro de eliminar "${ingredientName}" definitivamente de toda la base de datos y de todas las recetas?`)) {
      await this.menuService.deleteIngredientDefinitive(ingredientId);
      this.tempIngredients = this.tempIngredients.filter(i => i.id !== ingredientId);
    }
  }

  getCategoryName(categoryId?: string): string {
    const cats: Record<string, string> = {
      cat_carniceria: 'Carnicería',
      cat_pescaderia: 'Pescadería',
      cat_charcuteria: 'Charcutería',
      cat_verduras: 'Verduras',
      cat_frutas: 'Frutas',
      cat_viveres: 'Víveres',
      cat_limpieza: 'Limpieza',
      cat_farmacia: 'Farmacia',
      cat_otros: 'Otros'
    };
    return categoryId ? (cats[categoryId] || 'Víveres') : 'Víveres';
  }

  async onSave(): Promise<void> {
    if (!this.dishName.trim()) {
      alert('Por favor indica el nombre del plato.');
      return;
    }

    const typeMapping: DishType = this.slotType === 'breakfast' ? 'breakfast'
      : this.slotType === 'lunchProtein' ? 'protein'
      : this.slotType === 'lunchSides' ? 'side'
      : 'dinner';

    // Save or update dish in catalog
    const savedDish = await this.menuService.createOrUpdateDish({
      id: this.existingItem?.dishId,
      name: this.dishName.trim(),
      type: typeMapping,
      recipeUrl: this.recipeUrl.trim(),
      ingredientIds: this.tempIngredients.map(i => i.id)
    });

    const plannedItem: PlannedDishItem = {
      id: this.existingItem?.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      dishId: savedDish.id,
      name: savedDish.name,
      recipeUrl: savedDish.recipeUrl,
      ingredients: this.tempIngredients
    };

    this.save.emit(plannedItem);
  }

  onClearSlot(): void {
    if (confirm('¿Deseas quitar este plato del menú de este día?')) {
      this.clear.emit();
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
