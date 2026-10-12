import { Component, EventEmitter, Input, Output, inject, signal, computed, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../services/menu.service';
import { FirestoreService } from '../services/firestore.service';
import { Dish, Ingredient, PlannedDishItem, DishType, Category } from '../models/types';
import { IconComponent } from './icon.component';
import { matchesSearch, isSameText } from '../utils/string-utils';

@Component({
  selector: 'app-dish-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="modal-backdrop" (click)="onClose()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        
        <!-- Bottom Sheet Drag Handle (Mobile) -->
        <div class="bottom-sheet-handle-bar">
          <div class="bottom-sheet-handle"></div>
        </div>

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
            <div class="input-wrapper dish-input-wrapper">
              <input
                type="text"
                class="form-input"
                [(ngModel)]="dishName"
                (input)="filterSuggestions()"
                (keydown.escape)="showSuggestions = false"
                placeholder="Ej. Caraotas Negras, Rollo de Carne, Arepa..."
                autofocus
              />
              <span *ngIf="dishName" class="clear-btn" (click)="dishName = ''; filterSuggestions()">✕</span>

              <!-- Suggestions Dropdown -->
              <div *ngIf="showSuggestions && filteredDishes.length > 0" class="suggestions-list">
                <div class="suggestions-header-bar">
                  <span>Platos existentes sugeridos:</span>
                  <button type="button" class="btn-close-sugg" (click)="showSuggestions = false">✕ Cerrar</button>
                </div>
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

            <!-- Add new ingredient bar with Category Selection -->
            <div class="add-ing-bar">
              <div class="ing-input-wrapper">
                <input
                  type="text"
                  class="form-input form-input-sm ing-name-input"
                  [(ngModel)]="newIngName"
                  (input)="filterIngSuggestions()"
                  (keydown.escape)="showIngSuggestions = false"
                  placeholder="Nuevo ingrediente (ej. Queso, Cebolla)..."
                  (keyup.enter)="addIngredientFromInput()"
                />

                <!-- Ingredient suggestions with Category Chips -->
                <div *ngIf="showIngSuggestions && filteredIngredients.length > 0" class="suggestions-list ing-suggestions">
                  <div class="suggestions-header-bar">
                    <span>Ingredientes sugeridos:</span>
                    <button type="button" class="btn-close-sugg" (click)="showIngSuggestions = false">✕ Cerrar</button>
                  </div>
                  <div
                    *ngFor="let ing of filteredIngredients"
                    class="suggestion-item"
                    (click)="selectIngredient(ing)"
                  >
                    <div class="suggestion-main">
                      <span class="suggestion-name">{{ ing.name }}</span>
                    </div>
                    <span class="cat-pill-sm" [style.background-color]="getCatColor(ing.categoryId) + '20'" [style.color]="getCatColor(ing.categoryId)">
                      {{ getCategoryName(ing.categoryId) }}
                    </span>
                  </div>
                </div>
              </div>

              <select
                class="form-input form-input-sm cat-select-input"
                [(ngModel)]="newIngCat"
                (change)="userSelectedCategory = true"
                title="Categoría para la lista de compras"
              >
                <option *ngFor="let c of categories()" [value]="c.id">{{ c.name }}</option>
              </select>

              <div class="add-ing-qty-row">
                <input
                  type="text"
                  inputmode="decimal"
                  class="form-input form-input-sm qty-input"
                  [(ngModel)]="newIngQty"
                  placeholder="Cant."
                  (keyup.enter)="addIngredientFromInput()"
                />
                <input
                  type="text"
                  class="form-input form-input-sm unit-input"
                  [(ngModel)]="newIngUnit"
                  placeholder="Unidad"
                  (keyup.enter)="addIngredientFromInput()"
                />
                <button class="btn-add-ing" (click)="addIngredientFromInput()" title="Añadir ingrediente a la receta">
                  <app-icon name="plus" [size]="16"></app-icon> Añadir
                </button>
              </div>
            </div>

            <!-- Current Ingredients List with Editable Categories -->
            <div class="assigned-ings-header-row" *ngIf="tempIngredients.length > 1">
              <span class="assigned-header-title">Ingredientes asignados ({{ tempIngredients.length }})</span>
              <div class="sort-mini-bar">
                <span class="sort-mini-label">Ordenar:</span>
                <button
                  type="button"
                  class="btn-sort-mini"
                  (click)="sortTempIngredients('asc')"
                  title="Ordenar ingredientes de la A a la Z"
                >
                  A - Z
                </button>
                <button
                  type="button"
                  class="btn-sort-mini"
                  (click)="sortTempIngredients('desc')"
                  title="Ordenar ingredientes de la Z a la A"
                >
                  Z - A
                </button>
              </div>
            </div>

            <div class="ingredients-list">
              <div *ngIf="tempIngredients.length === 0" class="empty-ingredients">
                No hay ingredientes asignados a este plato. Puedes agregar nuevos arriba seleccionando su categoría.
              </div>

              <div *ngFor="let ing of tempIngredients; let i = index" class="ingredient-row">
                <div class="ing-header-line">
                  <div class="ing-name-wrap">
                    <span class="ing-bullet">•</span>
                    <span class="ing-name">{{ ing.name }}</span>
                  </div>
                  
                  <div class="ing-actions">
                    <!-- Partial deletion: remove from this recipe only -->
                    <button
                      type="button"
                      class="btn-ing-action btn-remove-partial"
                      (click)="removeIngredientPartial(i)"
                      title="Quitar solo de este plato (Parcial)"
                    >
                      <app-icon name="x" [size]="14"></app-icon>
                    </button>

                    <!-- Definitive deletion: delete from whole database -->
                    <button
                      type="button"
                      class="btn-ing-action btn-remove-definitive"
                      (click)="confirmDeleteDefinitive(ing.id, ing.name)"
                      title="Eliminar DEFINITIVAMENTE de la base de datos"
                    >
                      <app-icon name="trash" [size]="14"></app-icon>
                    </button>
                  </div>
                </div>

                <div class="ing-controls-line">
                  <select
                    class="ing-cat-select"
                    [(ngModel)]="ing.categoryId"
                    (change)="updateIngredientCategory(ing)"
                    title="Categoría para la lista de compras"
                  >
                    <option *ngFor="let c of categories()" [value]="c.id">{{ c.name }}</option>
                  </select>

                  <div class="ing-qty-controls">
                    <input
                      type="text"
                      inputmode="decimal"
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
      z-index: 99999;
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
      max-height: 200px;
      overflow-y: auto;
      z-index: 100;
      box-shadow: 0 10px 20px -3px rgba(0, 0, 0, 0.15);
    }

    .suggestions-header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 12px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.72rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .btn-close-sugg {
      background: transparent;
      border: none;
      color: #ef4444;
      font-weight: 700;
      font-size: 0.75rem;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .btn-close-sugg:hover {
      background: #fee2e2;
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
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }

    .ing-input-wrapper {
      position: relative;
      width: 100%;
    }

    .form-input-sm {
      padding: 8px 12px;
      font-size: 0.88rem;
    }

    .ing-name-input {
      width: 100%;
      box-sizing: border-box;
    }

    .cat-select-input {
      width: 100%;
      box-sizing: border-box;
      background: #ffffff;
      cursor: pointer;
    }

    .add-ing-qty-row {
      display: flex;
      gap: 8px;
      align-items: center;
      width: 100%;
    }

    .qty-input {
      flex: 1;
      min-width: 0;
      box-sizing: border-box;
      text-align: center;
    }

    .unit-input {
      flex: 1;
      min-width: 0;
      box-sizing: border-box;
      text-align: center;
    }

    .cat-pill-sm {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
    }

    .btn-add-ing {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: #10b981;
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 600;
      white-space: nowrap;
      border: none;
      cursor: pointer;
      flex: 1.2;
      transition: background 0.15s;
    }
    .btn-add-ing:hover {
      background: #059669;
    }

    .ing-suggestions {
      top: 100%;
    }

    .assigned-ings-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 10px;
      margin-bottom: 4px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e2e8f0;
    }

    .assigned-header-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: #475569;
    }

    .sort-mini-bar {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .sort-mini-label {
      font-size: 0.72rem;
      color: #94a3b8;
      font-weight: 600;
    }

    .btn-sort-mini {
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 0.72rem;
      font-weight: 700;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
      cursor: pointer;
      transition: all 0.1s;
    }
    .btn-sort-mini:hover {
      background: #ecfdf5;
      color: #059669;
      border-color: #a7f3d0;
    }

    .ingredients-list {
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
      display: flex;
      flex-direction: column;
      background: transparent;
    }

    .empty-ingredients {
      padding: 16px 8px;
      text-align: center;
      color: #94a3b8;
      font-size: 0.85rem;
    }

    .ingredient-row {
      display: flex;
      flex-direction: column;
      padding: 10px 0;
      border-bottom: 1px solid #f1f5f9;
      gap: 6px;
      width: 100%;
      box-sizing: border-box;
      background: transparent;
      border-radius: 0;
      box-shadow: none;
    }
    .ingredient-row:last-child {
      border-bottom: none;
    }

    .ing-header-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      width: 100%;
    }

    .ing-name-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      min-width: 0;
    }

    .ing-bullet {
      color: #10b981;
      font-weight: bold;
      font-size: 1.1rem;
      line-height: 1;
      flex-shrink: 0;
    }

    .ing-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
      word-break: break-word;
      line-height: 1.2;
    }

    .ing-controls-line {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    .ing-cat-select {
      flex: 1;
      min-width: 0;
      padding: 6px 8px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.8rem;
      color: #334155;
      background: #f8fafc;
      outline: none;
    }
    .ing-cat-select:focus {
      border-color: #10b981;
      background: #ffffff;
    }

    .ing-qty-controls {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .ing-qty-field, .ing-unit-field {
      padding: 6px 6px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.82rem;
      width: 48px;
      text-align: center;
      background: #ffffff;
    }
    .ing-qty-field:focus, .ing-unit-field:focus {
      border-color: #10b981;
      outline: none;
    }

    .ing-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .btn-ing-action {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: none;
      cursor: pointer;
      transition: background 0.15s;
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
      flex-direction: column;
      gap: 10px;
    }

    .footer-actions {
      display: flex;
      gap: 10px;
      width: 100%;
    }

    .btn-secondary {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px 16px;
      border-radius: 10px;
      background: #e2e8f0;
      color: #334155;
      font-weight: 600;
      font-size: 0.9rem;
      border: none;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-secondary:hover {
      background: #cbd5e1;
    }

    .btn-primary {
      flex: 1.4;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 16px;
      border-radius: 10px;
      background: #10b981;
      color: #ffffff;
      font-weight: 600;
      font-size: 0.9rem;
      border: none;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s;
    }
    .btn-primary:hover {
      background: #059669;
    }

    .btn-danger-outline {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 9px 14px;
      border: 1.5px solid #fecaca;
      border-radius: 10px;
      background: #ffffff;
      color: #dc2626;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-danger-outline:hover {
      background: #fee2e2;
      border-color: #f87171;
    }
    .bottom-sheet-handle-bar {
      display: none;
      justify-content: center;
      padding: 8px 0 4px;
      background: #f8fafc;
    }

    .bottom-sheet-handle {
      width: 40px;
      height: 4px;
      border-radius: 9999px;
      background: #cbd5e1;
    }

    @keyframes slideUpSheet {
      from { transform: translateY(100%); opacity: 0.8; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* Mobile Bottom-Sheet Optimization */
    @media (max-width: 640px) {
      .modal-backdrop {
        padding: 0;
        align-items: flex-end;
      }

      .modal-container {
        max-width: 100%;
        width: 100%;
        border-radius: 20px 20px 0 0;
        max-height: 92vh;
        margin: 0;
        border: none;
        border-top: 1px solid #cbd5e1;
        box-shadow: 0 -10px 35px rgba(0, 0, 0, 0.25);
        animation: slideUpSheet 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .bottom-sheet-handle-bar {
        display: flex;
      }

      .modal-header {
        padding: 10px 16px;
      }

      .modal-body {
        padding: 14px 14px 8px;
        gap: 14px;
      }

      .modal-footer {
        padding: 14px 16px max(28px, calc(18px + env(safe-area-inset-bottom, 0px)));
      }
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
  private firestoreService = inject(FirestoreService);
  private elementRef = inject(ElementRef);

  categories = computed<Category[]>(() => this.firestoreService.categories());

  dishName = '';
  recipeUrl = '';
  tempIngredients: { id: string; name: string; quantity: string; unit: string; categoryId?: string }[] = [];

  // Autocomplete state
  showSuggestions = false;
  filteredDishes: Dish[] = [];

  newIngName = '';
  newIngCat = 'cat_viveres';
  userSelectedCategory = false;
  newIngQty = '';
  newIngUnit = '';
  showIngSuggestions = false;
  filteredIngredients: Ingredient[] = [];

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    // Close dish suggestions if clicked outside dish input wrapper
    const dishWrapper = this.elementRef.nativeElement.querySelector('.dish-input-wrapper');
    if (dishWrapper && !dishWrapper.contains(target)) {
      this.showSuggestions = false;
    }

    // Close ingredient suggestions if clicked outside add-ing-bar
    const ingWrapper = this.elementRef.nativeElement.querySelector('.add-ing-bar');
    if (ingWrapper && !ingWrapper.contains(target)) {
      this.showIngSuggestions = false;
    }
  }

  ngOnInit(): void {
    if (this.existingItem) {
      this.dishName = this.existingItem.name || '';
      this.recipeUrl = this.existingItem.recipeUrl || '';
      const allIngs = this.menuService.allIngredients();
      this.tempIngredients = (this.existingItem.ingredients || []).map(i => {
        const found = allIngs.find(a => a.id === i.id || isSameText(a.name, i.name));
        return {
          ...i,
          categoryId: found?.categoryId || i.categoryId || 'cat_viveres',
          quantity: i.quantity || '',
          unit: i.unit || ''
        };
      });
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

    const query = this.dishName.trim();
    this.filteredDishes = this.menuService.allDishes()
      .filter(d => !d.deletedAt && matchesSearch(d.name, query))
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
      this.userSelectedCategory = false;
      return;
    }

    const query = this.newIngName.trim();
    this.filteredIngredients = this.menuService.allIngredients()
      .filter(i => !i.deletedAt && matchesSearch(i.name, query))
      .slice(0, 6);

    this.showIngSuggestions = this.filteredIngredients.length > 0;

    // Solo auto-seleccionar categoría si el usuario no ha elegido una manualmente
    if (!this.userSelectedCategory) {
      const exact = this.menuService.allIngredients().find(i => isSameText(i.name, query));
      if (exact && exact.categoryId) {
        this.newIngCat = exact.categoryId;
      }
    }
  }

  selectIngredient(ing: Ingredient): void {
    // Si el usuario eligió una categoría explícitamente en el selector, respetarla
    const assignedCat = (this.userSelectedCategory && this.newIngCat) ? this.newIngCat : (ing.categoryId || this.newIngCat || 'cat_viveres');
    const existing = this.tempIngredients.find(t => t.id === ing.id || isSameText(t.name, ing.name));

    if (existing) {
      // Actualizar su categoría y cantidad en lugar de ignorar silenciosamente
      existing.categoryId = assignedCat;
      if (this.newIngQty) existing.quantity = this.newIngQty;
      if (this.newIngUnit) existing.unit = this.newIngUnit;
      this.menuService.updateIngredientCategoryGlobally(ing.id, assignedCat, ing.name);
    } else {
      this.tempIngredients.push({
        id: ing.id,
        name: ing.name,
        categoryId: assignedCat,
        quantity: this.newIngQty || '',
        unit: this.newIngUnit || ''
      });
      if (assignedCat !== ing.categoryId) {
        this.menuService.updateIngredientCategoryGlobally(ing.id, assignedCat, ing.name);
      }
    }

    this.newIngName = '';
    this.newIngQty = '';
    this.newIngUnit = '';
    this.newIngCat = 'cat_viveres';
    this.userSelectedCategory = false;
    this.showIngSuggestions = false;
  }

  sortTempIngredients(order: 'asc' | 'desc'): void {
    if (order === 'asc') {
      this.tempIngredients.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
    } else {
      this.tempIngredients.sort((a, b) => b.name.localeCompare(a.name, 'es', { sensitivity: 'base' }));
    }
  }

  async addIngredientFromInput(): Promise<void> {
    const cleanName = this.newIngName.trim();
    if (!cleanName) return;

    const ing = await this.menuService.createOrGetIngredient(cleanName, this.newIngCat);
    this.selectIngredient(ing);
  }

  async updateIngredientCategory(item: { id: string; name: string; categoryId?: string }): Promise<void> {
    if (!item.id || !item.categoryId) return;
    await this.menuService.updateIngredientCategoryGlobally(item.id, item.categoryId, item.name);
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
    const found = this.categories().find(c => c.id === categoryId);
    return found ? found.name : 'Víveres';
  }

  getCatColor(categoryId?: string): string {
    const found = this.categories().find(c => c.id === categoryId);
    return found ? found.color : '#64748b';
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

    const existingDish = this.menuService.allDishes().find(d => d.id === this.existingItem?.dishId || isSameText(d.name, this.dishName.trim()));
    let types: DishType[] = [typeMapping];
    if (existingDish) {
      const existingTypes = existingDish.types?.length ? existingDish.types : (existingDish.type ? [existingDish.type] : []);
      types = Array.from(new Set([...existingTypes, typeMapping]));
    }

    // Save or update dish in catalog
    const savedDish = await this.menuService.createOrUpdateDish({
      id: existingDish?.id || this.existingItem?.dishId,
      name: this.dishName.trim(),
      type: typeMapping,
      types: types,
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
