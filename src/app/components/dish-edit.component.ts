import { Component, EventEmitter, Input, OnInit, Output, inject, signal, computed, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../services/menu.service';
import { FirestoreService } from '../services/firestore.service';
import { Dish, Ingredient, Category, DishType } from '../models/types';
import { IconComponent } from './icon.component';
import { matchesSearch, isSameText } from '../utils/string-utils';

@Component({
  selector: 'app-dish-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="dish-sheet-overlay" (click)="onBackdropClick($event)">
      
      <div
        class="dish-sheet-container"
        [style.transform]="sheetTranslateY > 0 ? 'translateY(' + sheetTranslateY + 'px)' : ''"
        (click)="$event.stopPropagation()"
      >
        <!-- Top Drag Handle for Swipe Down to Dismiss -->
        <div
          class="sheet-handle-bar"
          (touchstart)="onTouchStart($event)"
          (touchmove)="onTouchMove($event)"
          (touchend)="onTouchEnd()"
        >
          <div class="handle-pill"></div>
        </div>

        <!-- Top Navigation & Action Header (2 rows) -->
        <div class="edit-header-bar">
          <!-- Row 1: Title (left) and Close (right) -->
          <div class="header-nav-row">
            <div class="edit-header-title">
              <h2>{{ isEditing ? 'Editar Plato' : 'Crear Plato' }}</h2>
            </div>

            <button type="button" class="btn-back-flat" (click)="onCancel()" title="Cerrar">
              <app-icon name="x" [size]="15"></app-icon>
              <span>Cerrar</span>
            </button>
          </div>

          <!-- Row 2: Action Buttons (100% width, fully visible on any screen) -->
          <div class="edit-header-actions">
            <button *ngIf="isEditing" type="button" class="btn-head-del" (click)="onDeleteDish()" title="Eliminar Plato">
              <app-icon name="trash" [size]="15"></app-icon>
              <span>Eliminar</span>
            </button>
            <button type="button" class="btn-head-cancel" (click)="onCancel()">Cancelar</button>
            <button type="button" class="btn-head-save" (click)="onSaveDish()" [disabled]="!dishName.trim()" title="Guardar">
              <app-icon name="check" [size]="16"></app-icon>
              <span>Guardar</span>
            </button>
          </div>
        </div>

        <!-- Scrollable Form Container -->
        <div class="edit-form-scroll-wrap">
          <div class="edit-form-content">
        
        <!-- SECTION 1: Nombre del Plato -->
        <div class="flat-section">
          <label class="flat-label" for="dish-name-input">Nombre del Plato *</label>
          <div class="input-wrap">
            <input
              id="dish-name-input"
              type="text"
              class="flat-input font-bold"
              [(ngModel)]="dishName"
              placeholder="Ej: Pollo al Horno con Papas..."
              autofocus
            />
            <button *ngIf="dishName" type="button" class="btn-clear" (click)="dishName = ''">✕</button>
          </div>
        </div>

        <!-- SECTION 2: Tipo de Plato (Segmented Chips Control) -->
        <!-- SECTION 2: Categorías del Plato (Multi-select Toggle Chips) -->
        <div class="flat-section">
          <label class="flat-label">Categorías del Plato (puedes marcar varias)</label>
          <div class="type-segmented-bar">
            <button
              type="button"
              class="type-segment"
              [class.active]="hasType('protein')"
              (click)="toggleType('protein')"
            >
              🥩 Principal
            </button>

            <button
              type="button"
              class="type-segment"
              [class.active]="hasType('side')"
              (click)="toggleType('side')"
            >
              🥗 Contorno
            </button>

            <button
              type="button"
              class="type-segment"
              [class.active]="hasType('breakfast')"
              (click)="toggleType('breakfast')"
            >
              🍳 Desayuno
            </button>

            <button
              type="button"
              class="type-segment"
              [class.active]="hasType('dinner')"
              (click)="toggleType('dinner')"
            >
              🥪 Cena
            </button>
          </div>
        </div>

        <!-- SECTION 3: Enlace de Receta -->
        <div class="flat-section">
          <div class="label-row">
            <label class="flat-label" for="recipe-url-input">Enlace de Receta (opcional)</label>
            <a
              *ngIf="recipeUrl && isValidUrl(recipeUrl)"
              [href]="recipeUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="flat-link-action"
            >
              <app-icon name="external-link" [size]="13"></app-icon>
              <span>Abrir Enlace</span>
            </a>
          </div>
          <div class="input-wrap">
            <input
              id="recipe-url-input"
              type="url"
              class="flat-input"
              [(ngModel)]="recipeUrl"
              placeholder="https://www.instagram.com/reel/... o https://youtube.com/..."
            />
            <button *ngIf="recipeUrl" type="button" class="btn-clear" (click)="recipeUrl = ''">✕</button>
          </div>
        </div>

        <!-- SECTION 4: Ingredientes de la Receta -->
        <div class="flat-section ings-section">
          <div class="label-row">
            <label class="flat-label">Ingredientes de la Receta</label>
            <span class="ing-count-badge">{{ assignedIngredients.length }} ingredientes</span>
          </div>

          <!-- Quick Add Bar for Ingredients -->
          <div class="quick-add-ing-bar">
            <div class="ing-input-wrap">
              <input
                type="text"
                class="flat-input"
                [(ngModel)]="newIngName"
                (input)="filterSuggestions()"
                (keydown.escape)="showSuggestions = false"
                (keydown.enter)="$event.preventDefault(); addIngredientFromInput()"
                placeholder="Escribe ingrediente (ej. Pollo, Cebolla, Sal)..."
              />
              
              <!-- Suggestions Dropdown -->
              <div *ngIf="showSuggestions && suggestions.length > 0" class="suggestions-popup">
                <div class="suggestions-header">
                  <span>Sugerencias:</span>
                  <button type="button" class="btn-close-sugg" (click)="showSuggestions = false">✕</button>
                </div>
                <div
                  *ngFor="let s of suggestions"
                  class="suggestion-item"
                  (click)="selectSuggestion(s)"
                >
                  <span class="suggestion-name">{{ s.name }}</span>
                  <span class="cat-chip" [style.background-color]="getCatColor(s.categoryId) + '20'" [style.color]="getCatColor(s.categoryId)">
                    {{ getCatName(s.categoryId) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="cat-select-and-btn-row">
              <select
                class="flat-select flex-1"
                [(ngModel)]="newIngCategory"
                title="Categoría"
              >
                <option *ngFor="let c of categories()" [value]="c.id">{{ c.name }}</option>
              </select>

              <button
                type="button"
                class="btn-add-ing-action"
                (click)="addIngredientFromInput()"
                [disabled]="!newIngName.trim()"
              >
                <app-icon name="plus" [size]="15"></app-icon>
                <span>Añadir</span>
              </button>
            </div>
          </div>

          <!-- Assigned Ingredients List -->
          <div class="assigned-ings-header-row" *ngIf="assignedIngredients.length > 1">
            <span class="assigned-header-title">Ingredientes del plato ({{ assignedIngredients.length }})</span>
            <div class="sort-mini-bar">
              <span class="sort-mini-label">Ordenar:</span>
              <button
                type="button"
                class="btn-sort-mini"
                (click)="sortAssignedIngredients('asc')"
                title="Ordenar ingredientes de la A a la Z"
              >
                A - Z
              </button>
              <button
                type="button"
                class="btn-sort-mini"
                (click)="sortAssignedIngredients('desc')"
                title="Ordenar ingredientes de la Z a la A"
              >
                Z - A
              </button>
            </div>
          </div>

          <div class="assigned-ings-list">
            <div *ngIf="assignedIngredients.length === 0" class="empty-ings-note">
              <span>No hay ingredientes asignados a este plato.</span>
            </div>

            <div
              *ngFor="let ing of assignedIngredients; let i = index"
              class="assigned-ing-row"
            >
              <div class="assigned-ing-top-line">
                <span class="assigned-ing-name">• {{ ing.name }}</span>
                <div class="assigned-ing-actions">
                  <button
                    type="button"
                    class="btn-remove-ing"
                    (click)="removeIngredientFromDish(i)"
                    title="Quitar de este plato"
                  >
                    Quitar
                  </button>
                  <button
                    type="button"
                    class="btn-del-db"
                    (click)="confirmDeleteFromDb(ing.id, ing.name)"
                    title="Eliminar de BD"
                  >
                    <app-icon name="trash" [size]="13"></app-icon>
                  </button>
                </div>
              </div>

              <div class="assigned-ing-bottom-line">
                <select
                  class="select-ing-cat"
                  [ngModel]="ing.categoryId"
                  (ngModelChange)="updateIngredientCategory(ing, $event)"
                  title="Categoría para la lista de compras"
                >
                  <option *ngFor="let c of categories()" [value]="c.id">{{ c.name }}</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        <!-- SECTION 5: In-flow Bottom Actions Row (Does not float or cover content) -->
        <div class="bottom-actions-row">
          <button type="button" class="btn-cancel-bottom" (click)="onCancel()">Cancelar</button>
          <button type="button" class="btn-save-bottom" (click)="onSaveDish()" [disabled]="!dishName.trim()">
            <app-icon name="check" [size]="16"></app-icon>
            <span>Guardar Plato</span>
          </button>
        </div>

      </div>
    </div>

  </div>
</div>
  `,
  styles: [`
    .dish-sheet-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      height: 100dvh;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(2px);
      z-index: 9999;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      margin: 0;
      padding: 0;
      animation: fadeInOverlay 0.2s ease-out;
    }

    @keyframes fadeInOverlay {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .dish-sheet-container {
      width: 100%;
      max-width: 640px;
      max-height: 90vh;
      max-height: 90dvh;
      background: #ffffff;
      border-radius: 18px 18px 0 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.25);
      animation: slideUpSheet 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      touch-action: pan-y;
      transition: transform 0.08s ease-out;
    }

    @keyframes slideUpSheet {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    .sheet-handle-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px 0 6px;
      cursor: grab;
      touch-action: none;
      background: #ffffff;
    }

    .handle-pill {
      width: 38px;
      height: 4px;
      background: #cbd5e1;
      border-radius: 9999px;
    }

    .edit-form-scroll-wrap {
      overflow-y: auto;
      flex: 1;
      max-height: calc(90dvh - 110px);
      -webkit-overflow-scrolling: touch;
      padding-bottom: 20px;
    }

    .edit-header-bar {
      display: flex;
      flex-direction: column;
      padding: 6px 14px 10px;
      border-bottom: 1px solid var(--border-color);
      background: #ffffff;
      gap: 10px;
      width: 100%;
      box-sizing: border-box;
    }

    .header-nav-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .btn-back-flat {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-size: 0.88rem;
      font-weight: 600;
      color: #059669;
      background: transparent;
      border: none;
      padding: 4px 8px;
      border-radius: 6px;
      cursor: pointer;
      line-height: 1;
    }
    .btn-back-flat:hover {
      background: #ecfdf5;
    }
    .btn-back-flat app-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .edit-header-title h2 {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .edit-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    .btn-head-del {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #ef4444;
      background: #fee2e2;
      border: none;
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-head-del:hover { background: #fecaca; }

    .btn-head-cancel {
      flex: 1;
      font-size: 0.84rem;
      font-weight: 600;
      color: #64748b;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      text-align: center;
    }
    .btn-head-cancel:hover { background: #e2e8f0; color: #0f172a; }

    .btn-head-save {
      flex: 2;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 0.86rem;
      font-weight: 700;
      color: #ffffff;
      background: #10b981;
      border: none;
      padding: 8px 14px;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-head-save:hover:not(:disabled) { background: #059669; }
    .btn-head-save:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Form Content */
    .edit-form-content {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .flat-section {
      padding: 12px 14px;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .flat-label {
      font-size: 0.82rem;
      font-weight: 700;
      color: #475569;
    }

    .label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .flat-link-action {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 0.78rem;
      font-weight: 600;
      color: #059669;
      text-decoration: none;
    }
    .flat-link-action:hover { text-decoration: underline; }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .flat-input {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.9rem;
      color: #0f172a;
      outline: none;
      box-sizing: border-box;
      background: #ffffff;
    }
    .flat-input:focus {
      border-color: #10b981;
    }
    .flat-input.font-bold {
      font-weight: 600;
    }

    .btn-clear {
      position: absolute;
      right: 8px;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 0.8rem;
      cursor: pointer;
      padding: 2px 4px;
    }

    /* Type Segmented Bar */
    .type-segmented-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      width: 100%;
    }

    @media (max-width: 600px) {
      .type-segmented-bar {
        grid-template-columns: 1fr 1fr;
      }
    }

    .type-segment {
      padding: 8px 6px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #475569;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
      text-align: center;
      transition: all 0.12s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .type-segment:hover {
      background: #ffffff;
      border-color: #cbd5e1;
    }
    .type-segment.active {
      background: #ecfdf5;
      color: #065f46;
      border-color: #10b981;
      font-weight: 700;
    }

    /* Ingredients Section */
    .ing-count-badge {
      font-size: 0.72rem;
      font-weight: 600;
      color: #059669;
      background: #ecfdf5;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .quick-add-ing-bar {
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: #f8fafc;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }

    .ing-input-wrap {
      position: relative;
      width: 100%;
    }

    .cat-select-and-btn-row {
      display: flex;
      gap: 6px;
      width: 100%;
    }

    .flat-select {
      padding: 7px 8px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.82rem;
      color: #334155;
      background: #ffffff;
      outline: none;
      box-sizing: border-box;
    }
    .flat-select:focus { border-color: #10b981; }

    .flex-1 { flex: 1; min-width: 0; }

    .btn-add-ing-action {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 7px 12px;
      background: #10b981;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn-add-ing-action:hover:not(:disabled) { background: #059669; }
    .btn-add-ing-action:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Suggestions Popup */
    .suggestions-popup {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      margin-top: 2px;
      max-height: 180px;
      overflow-y: auto;
      z-index: 100;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .suggestions-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 8px;
      font-size: 0.7rem;
      font-weight: 700;
      color: #64748b;
      background: #f1f5f9;
    }

    .btn-close-sugg {
      background: transparent;
      border: none;
      color: #ef4444;
      font-size: 0.72rem;
      cursor: pointer;
    }

    .suggestion-item {
      padding: 6px 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      border-bottom: 1px solid #f8fafc;
      font-size: 0.84rem;
    }
    .suggestion-item:hover { background: #ecfdf5; }

    .cat-chip {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 3px;
    }

    /* Assigned Ingredients */
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

    .assigned-ings-list {
      display: flex;
      flex-direction: column;
      margin-top: 4px;
    }

    .empty-ings-note {
      padding: 14px;
      text-align: center;
      color: #94a3b8;
      font-size: 0.82rem;
    }

    .assigned-ing-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .assigned-ing-top-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .assigned-ing-name {
      font-size: 0.88rem;
      font-weight: 600;
      color: #0f172a;
      white-space: normal;
      word-break: break-word;
    }

    .assigned-ing-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .btn-remove-ing {
      background: #f1f5f9;
      border: none;
      color: #64748b;
      font-size: 0.74rem;
      font-weight: 600;
      padding: 3px 7px;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-remove-ing:hover {
      background: #fee2e2;
      color: #dc2626;
    }

    .btn-del-db {
      background: transparent;
      border: none;
      color: #cbd5e1;
      padding: 3px 5px;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-del-db:hover {
      color: #ef4444;
      background: #fee2e2;
    }

    .assigned-ing-bottom-line {
      width: 100%;
    }

    .select-ing-cat {
      width: 100%;
      padding: 4px 6px;
      font-size: 0.75rem;
      font-weight: 500;
      color: #475569;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      outline: none;
      cursor: pointer;
    }
    .select-ing-cat:focus { border-color: #10b981; }

    /* Bottom in-flow action buttons (No floating/overlapping) */
    .bottom-actions-row {
      display: flex;
      gap: 10px;
      padding: 14px 14px;
      padding-bottom: max(16px, calc(10px + env(safe-area-inset-bottom, 0px)));
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      align-items: center;
    }

    .btn-cancel-bottom {
      flex: 1;
      padding: 10px 14px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.88rem;
      background: #ffffff;
      color: #475569;
      border: 1px solid #cbd5e1;
      cursor: pointer;
    }
    .btn-cancel-bottom:hover {
      background: #f1f5f9;
    }

    .btn-save-bottom {
      flex: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 18px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.9rem;
      background: #10b981;
      color: #ffffff;
      border: none;
      cursor: pointer;
    }
    .btn-save-bottom:hover:not(:disabled) {
      background: #059669;
    }
    .btn-save-bottom:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class DishEditComponent implements OnInit {
  @Input() dish: Dish | null = null;
  @Output() saved = new EventEmitter<Dish>();
  @Output() cancelled = new EventEmitter<void>();

  private menuService = inject(MenuService);
  private firestoreService = inject(FirestoreService);
  private elementRef = inject(ElementRef);

  isEditing = false;
  dishId?: string;
  dishName = '';
  selectedTypes: DishType[] = ['protein'];
  recipeUrl = '';

  assignedIngredients: Ingredient[] = [];
  categories = computed<Category[]>(() => this.firestoreService.categories());
  allDbIngredients = computed<Ingredient[]>(() => this.firestoreService.ingredients());

  hasType(type: DishType): boolean {
    return this.selectedTypes.includes(type);
  }

  toggleType(type: DishType): void {
    if (this.selectedTypes.includes(type)) {
      if (this.selectedTypes.length > 1) {
        this.selectedTypes = this.selectedTypes.filter(t => t !== type);
      }
    } else {
      this.selectedTypes = [...this.selectedTypes, type];
    }
  }

  // Add ingredient inputs
  newIngName = '';
  newIngCategory = 'cat_viveres';
  showSuggestions = false;
  suggestions: Ingredient[] = [];

  // Swipe / Drag down to dismiss state
  private touchStartY = 0;
  sheetTranslateY = 0;
  isDragging = false;

  onTouchStart(event: TouchEvent): void {
    this.touchStartY = event.touches[0].clientY;
    this.isDragging = true;
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;
    const currentY = event.touches[0].clientY;
    const deltaY = currentY - this.touchStartY;
    if (deltaY > 0) {
      this.sheetTranslateY = deltaY;
    }
  }

  onTouchEnd(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    if (this.sheetTranslateY > 100) {
      this.onCancel();
    }
    this.sheetTranslateY = 0;
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    const ingWrapper = this.elementRef.nativeElement.querySelector('.ing-input-wrapper');
    if (ingWrapper && !ingWrapper.contains(target)) {
      this.showSuggestions = false;
    }
  }

  async ngOnInit(): Promise<void> {
    if (this.dish) {
      this.isEditing = true;
      this.dishId = this.dish.id;
      this.dishName = this.dish.name || '';
      if (this.dish.types?.length) {
        this.selectedTypes = [...this.dish.types];
      } else if (this.dish.type) {
        this.selectedTypes = [this.dish.type];
      } else {
        this.selectedTypes = ['protein'];
      }
      this.recipeUrl = this.dish.recipeUrl || '';

      const allIngs = this.allDbIngredients();
      const ingIds = this.dish.ingredientIds || [];
      this.assignedIngredients = ingIds
        .map(id => allIngs.find(i => i.id === id))
        .filter((i): i is Ingredient => !!i);
    }
  }

  filterSuggestions(): void {
    if (!this.newIngName.trim()) {
      this.showSuggestions = false;
      this.suggestions = [];
      return;
    }

    const query = this.newIngName.trim();
    const assignedIds = new Set(this.assignedIngredients.map(i => i.id));

    this.suggestions = this.allDbIngredients()
      .filter(i => !i.deletedAt && !assignedIds.has(i.id) && matchesSearch(i.name, query))
      .slice(0, 6);

    this.showSuggestions = this.suggestions.length > 0;

    // Auto select category if exact match found
    const exact = this.allDbIngredients().find(i => isSameText(i.name, query));
    if (exact && exact.categoryId) {
      this.newIngCategory = exact.categoryId;
    }
  }

  sortAssignedIngredients(order: 'asc' | 'desc'): void {
    if (order === 'asc') {
      this.assignedIngredients.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
    } else {
      this.assignedIngredients.sort((a, b) => b.name.localeCompare(a.name, 'es', { sensitivity: 'base' }));
    }
  }

  selectSuggestion(ing: Ingredient): void {
    if (!this.assignedIngredients.some(i => i.id === ing.id)) {
      this.assignedIngredients.push(ing);
    }
    this.newIngName = '';
    this.newIngCategory = ing.categoryId || 'cat_viveres';
    this.showSuggestions = false;
  }

  async addIngredientFromInput(): Promise<void> {
    const cleanName = this.newIngName.trim();
    if (!cleanName) return;

    if (this.assignedIngredients.some(i => isSameText(i.name, cleanName))) {
      this.newIngName = '';
      this.showSuggestions = false;
      return;
    }

    const ing = await this.menuService.createOrGetIngredient(cleanName, this.newIngCategory);
    this.assignedIngredients.push(ing);

    this.newIngName = '';
    this.newIngCategory = 'cat_viveres';
    this.showSuggestions = false;
  }

  async updateIngredientCategory(ing: Ingredient, newCatId: string): Promise<void> {
    ing.categoryId = newCatId;
    await this.firestoreService.saveIngredient({
      ...ing,
      categoryId: newCatId,
      updatedAt: new Date().toISOString()
    });
  }

  removeIngredientFromDish(index: number): void {
    this.assignedIngredients.splice(index, 1);
  }

  async confirmDeleteFromDb(ingredientId: string, ingredientName: string): Promise<void> {
    if (confirm(`¿Estás seguro de eliminar "${ingredientName}" definitivamente de la base de datos y de todas las recetas?`)) {
      await this.menuService.deleteIngredientDefinitive(ingredientId);
      this.assignedIngredients = this.assignedIngredients.filter(i => i.id !== ingredientId);
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

  isValidUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  async onSaveDish(): Promise<void> {
    if (!this.dishName.trim()) {
      alert('Por favor ingresa un nombre para el plato.');
      return;
    }

    const savedDish = await this.menuService.createOrUpdateDish({
      id: this.dishId,
      name: this.dishName.trim(),
      type: this.selectedTypes[0] || 'protein',
      types: this.selectedTypes,
      recipeUrl: this.recipeUrl.trim(),
      ingredientIds: this.assignedIngredients.map(i => i.id)
    });

    this.saved.emit(savedDish);
  }

  async onDeleteDish(): Promise<void> {
    if (!this.dish) return;
    if (confirm(`¿Eliminar definitivamente el plato "${this.dish.name}" del catálogo?`)) {
      await this.firestoreService.deleteDish(this.dish.id);
      this.cancelled.emit();
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
