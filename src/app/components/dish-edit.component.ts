import { Component, EventEmitter, Input, OnInit, Output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../services/menu.service';
import { FirestoreService } from '../services/firestore.service';
import { Dish, Ingredient, Category, DishType } from '../models/types';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-dish-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="dish-edit-page animate-fade">
      
      <!-- Top Navigation & Actions Bar -->
      <div class="top-bar">
        <div class="top-bar-left">
          <button class="btn-back" (click)="onCancel()" title="Volver al catálogo">
            <app-icon name="chevron-left" [size]="20"></app-icon>
            <span>Volver al Catálogo</span>
          </button>
          <div class="page-title-group">
            <h2 class="page-title">
              {{ isEditing ? 'Editar Plato: ' + (dishName || 'Sin Nombre') : 'Crear Nuevo Plato / Receta' }}
            </h2>
            <p class="page-subtitle">
              {{ isEditing ? 'Modifica los detalles, enlace y lista de ingredientes de este plato.' : 'Define el nombre, tipo de plato, enlace y añade sus ingredientes.' }}
            </p>
          </div>
        </div>

        <div class="top-bar-actions">
          <button *ngIf="isEditing" class="btn-delete" (click)="onDeleteDish()" title="Eliminar este plato">
            <app-icon name="trash" [size]="16"></app-icon>
            <span>Eliminar Plato</span>
          </button>
          <button class="btn-cancel" (click)="onCancel()">Cancelar</button>
          <button class="btn-save" (click)="onSaveDish()" [disabled]="!dishName.trim()">
            <app-icon name="check" [size]="18"></app-icon>
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>

      <!-- Main Form Layout Grid -->
      <div class="form-layout-grid">
        
        <!-- Left Column: General Information -->
        <div class="form-column">
          <div class="card-section">
            <div class="section-header">
              <div class="section-icon-box bg-emerald-light">
                <app-icon name="food" [size]="20" extraClass="text-emerald"></app-icon>
              </div>
              <div>
                <h3 class="section-title">Información General</h3>
                <p class="section-desc">Detalles básicos del plato o receta</p>
              </div>
            </div>

            <!-- Dish Name -->
            <div class="form-group">
              <label class="form-label" for="dish-name-input">
                Nombre del Plato <span class="required">*</span>
              </label>
              <div class="input-container">
                <input
                  id="dish-name-input"
                  type="text"
                  class="form-input text-lg"
                  [(ngModel)]="dishName"
                  placeholder="Ej: Pollo al Horno con Papas, Caraotas Negras, Arepa Reina Pepiada..."
                  autofocus
                />
                <button *ngIf="dishName" class="btn-clear-input" (click)="dishName = ''" title="Limpiar">✕</button>
              </div>
            </div>

            <!-- Dish Type Selector (Interactive Cards/Chips) -->
            <div class="form-group">
              <label class="form-label">Tipo de Plato / Categoría de Menú</label>
              <div class="dish-type-grid">
                
                <div
                  class="type-card"
                  [class.selected]="dishType === 'protein'"
                  (click)="dishType = 'protein'"
                >
                  <div class="type-badge badge-rose">Almuerzo</div>
                  <span class="type-title">Proteína Principal</span>
                  <span class="type-desc">Pollo, Carne, Pescado, Cerdo, etc.</span>
                </div>

                <div
                  class="type-card"
                  [class.selected]="dishType === 'side'"
                  (click)="dishType = 'side'"
                >
                  <div class="type-badge badge-emerald">Almuerzo</div>
                  <span class="type-title">Contorno / Acompañante</span>
                  <span class="type-desc">Arroz, Ensalada, Tajadas, Puré, etc.</span>
                </div>

                <div
                  class="type-card"
                  [class.selected]="dishType === 'breakfast'"
                  (click)="dishType = 'breakfast'"
                >
                  <div class="type-badge badge-amber">Mañana</div>
                  <span class="type-title">Desayuno</span>
                  <span class="type-desc">Arepas, Huevos, Pancakes, etc.</span>
                </div>

                <div
                  class="type-card"
                  [class.selected]="dishType === 'dinner'"
                  (click)="dishType = 'dinner'"
                >
                  <div class="type-badge badge-blue">Noche</div>
                  <span class="type-title">Cena</span>
                  <span class="type-desc">Sándwich, Crema, Tacos, Ligero, etc.</span>
                </div>

              </div>
            </div>

            <!-- Recipe URL with Test Action -->
            <div class="form-group">
              <div class="label-with-action">
                <label class="form-label" for="recipe-url-input">
                  Enlace de Receta (Instagram, YouTube, TikTok o Web)
                </label>
                <a
                  *ngIf="recipeUrl && isValidUrl(recipeUrl)"
                  [href]="recipeUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link-preview-action"
                  title="Abrir receta en nueva pestaña"
                >
                  <app-icon name="external-link" [size]="14"></app-icon>
                  <span>Probar / Abrir Enlace</span>
                </a>
              </div>
              <div class="input-container">
                <input
                  id="recipe-url-input"
                  type="url"
                  class="form-input"
                  [(ngModel)]="recipeUrl"
                  placeholder="https://www.instagram.com/reel/... o https://youtube.com/watch?v=..."
                />
                <button *ngIf="recipeUrl" class="btn-clear-input" (click)="recipeUrl = ''" title="Limpiar">✕</button>
              </div>
              <p class="field-hint">
                💡 Guarda el link del reel o video para ver los pasos de preparación en cualquier momento.
              </p>
            </div>

          </div>
        </div>

        <!-- Right Column: Ingredients Management -->
        <div class="form-column">
          <div class="card-section">
            <div class="section-header">
              <div class="section-icon-box bg-blue-light">
                <app-icon name="shopping-cart" [size]="20" extraClass="text-blue"></app-icon>
              </div>
              <div class="header-text-with-badge">
                <div>
                  <h3 class="section-title">Ingredientes de la Receta</h3>
                  <p class="section-desc">Ingredientes necesarios para preparar este plato</p>
                </div>
                <span class="badge badge-emerald count-badge">{{ assignedIngredients.length }} ingredientes</span>
              </div>
            </div>

            <!-- Add Ingredient Box -->
            <div class="add-ingredient-box">
              <span class="box-subtitle">Añadir Ingrediente:</span>
              
              <div class="add-input-row">
                <!-- Search / Input with Suggestions Dropdown -->
                <div class="ing-input-wrapper">
                  <input
                    type="text"
                    class="form-input"
                    [(ngModel)]="newIngName"
                    (input)="filterSuggestions()"
                    (keydown.enter)="$event.preventDefault(); addIngredientFromInput()"
                    placeholder="Escribe un ingrediente (ej. Pollo, Cebolla, Papas)..."
                  />
                  
                  <!-- Suggestions Dropdown -->
                  <div *ngIf="showSuggestions && suggestions.length > 0" class="suggestions-popup">
                    <div class="suggestions-header">Sugerencias existentes:</div>
                    <div
                      *ngFor="let s of suggestions"
                      class="suggestion-item"
                      (click)="selectSuggestion(s)"
                    >
                      <div class="suggestion-info">
                        <span class="suggestion-name">{{ s.name }}</span>
                        <span class="cat-chip" [style.background-color]="getCatColor(s.categoryId) + '20'" [style.color]="getCatColor(s.categoryId)">
                          {{ getCatName(s.categoryId) }}
                        </span>
                      </div>
                      <span class="suggestion-add-hint">+ Agregar</span>
                    </div>
                  </div>
                </div>

                <!-- Category Selector for new items -->
                <div class="cat-select-wrapper">
                  <select
                    class="form-input select-category"
                    [(ngModel)]="newIngCategory"
                    title="Categoría para la lista de compras"
                  >
                    <option *ngFor="let c of categories()" [value]="c.id">{{ c.name }}</option>
                  </select>
                </div>

                <button
                  class="btn-add-ingredient"
                  (click)="addIngredientFromInput()"
                  [disabled]="!newIngName.trim()"
                  title="Añadir a la receta"
                >
                  <app-icon name="plus" [size]="16"></app-icon>
                  <span>Añadir</span>
                </button>
              </div>

            </div>

            <!-- List of Assigned Ingredients -->
            <div class="assigned-ingredients-container">
              
              <div *ngIf="assignedIngredients.length === 0" class="empty-state-card">
                <div class="empty-icon-wrap">
                  <app-icon name="tag" [size]="28" extraClass="text-light"></app-icon>
                </div>
                <h4>Sin ingredientes asignados</h4>
                <p>Usa la barra de arriba para añadir los ingredientes necesarios para este plato. Al planificar tu menú, se enviarán automáticamente a tu lista de compras.</p>
              </div>

              <div *ngIf="assignedIngredients.length > 0" class="ingredients-list">
                <div
                  *ngFor="let ing of assignedIngredients; let i = index"
                  class="ingredient-item-row"
                >
                  <div class="ing-left">
                    <span class="ing-number">{{ i + 1 }}</span>
                    <span class="cat-pill" [style.background-color]="getCatColor(ing.categoryId) + '20'" [style.color]="getCatColor(ing.categoryId)">
                      {{ getCatName(ing.categoryId) }}
                    </span>
                    <span class="ing-name-text">{{ ing.name }}</span>
                  </div>

                  <div class="ing-right-actions">
                    <!-- Remove from recipe button -->
                    <button
                      class="btn-action-icon btn-remove-from-recipe"
                      (click)="removeIngredientFromDish(i)"
                      title="Quitar de este plato"
                    >
                      <app-icon name="x" [size]="16"></app-icon>
                      <span class="btn-tooltip">Quitar</span>
                    </button>

                    <!-- Delete definitively from DB button -->
                    <button
                      class="btn-action-icon btn-delete-definitive"
                      (click)="confirmDeleteFromDb(ing.id, ing.name)"
                      title="Eliminar de toda la base de datos"
                    >
                      <app-icon name="trash" [size]="15"></app-icon>
                      <span class="btn-tooltip">Borrar de BD</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      <!-- Bottom floating save bar for mobile -->
      <div class="mobile-save-bar">
        <button class="btn-cancel-mobile" (click)="onCancel()">Cancelar</button>
        <button class="btn-save-mobile" (click)="onSaveDish()" [disabled]="!dishName.trim()">
          <app-icon name="check" [size]="18"></app-icon>
          <span>Guardar Plato</span>
        </button>
      </div>

    </div>
  `,
  styles: [`
    .dish-edit-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding-bottom: 30px;
    }

    /* Top Bar */
    .top-bar {
      background: #ffffff;
      padding: 18px 24px;
      border-radius: 16px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }

    .top-bar-left {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--primary-600);
      padding: 4px 8px;
      border-radius: 8px;
      margin-left: -8px;
      align-self: flex-start;
    }
    .btn-back:hover {
      background: var(--primary-50);
      color: var(--primary-700);
    }

    .page-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: #0f172a;
    }

    .page-subtitle {
      font-size: 0.88rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .top-bar-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-delete {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 9px 16px;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 600;
      color: #dc2626;
      background: #fee2e2;
      border: 1px solid #fca5a5;
    }
    .btn-delete:hover {
      background: #fecaca;
    }

    .btn-cancel {
      padding: 9px 18px;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 600;
      color: #475569;
      background: #f1f5f9;
      border: 1px solid var(--border-color);
    }
    .btn-cancel:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .btn-save {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 9px 22px;
      border-radius: 10px;
      font-size: 0.92rem;
      font-weight: 700;
      color: #ffffff;
      background: var(--primary-500);
      box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.25);
    }
    .btn-save:hover:not(:disabled) {
      background: var(--primary-600);
    }
    .btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Grid Layout */
    .form-layout-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      align-items: start;
    }

    @media (max-width: 900px) {
      .form-layout-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Card Section */
    .card-section {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border-color);
    }

    .header-text-with-badge {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .section-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .bg-emerald-light { background: #d1fae5; }
    .bg-blue-light { background: #dbeafe; }
    .text-emerald { color: #059669; }
    .text-blue { color: #2563eb; }

    .section-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
    }

    .section-desc {
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    .count-badge {
      font-size: 0.8rem;
      padding: 4px 10px;
    }

    /* Form controls */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      font-size: 0.9rem;
      font-weight: 700;
      color: #334155;
    }

    .required {
      color: #dc2626;
    }

    .label-with-action {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .link-preview-action {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--primary-600);
      text-decoration: none;
    }
    .link-preview-action:hover {
      text-decoration: underline;
    }

    .input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .form-input {
      width: 100%;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1.5px solid #cbd5e1;
      font-size: 0.95rem;
      color: #0f172a;
      outline: none;
      transition: all 0.2s;
      background: #ffffff;
    }
    .form-input:focus {
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
    }

    .text-lg {
      font-size: 1.05rem;
      font-weight: 600;
      padding: 12px 16px;
    }

    .btn-clear-input {
      position: absolute;
      right: 12px;
      color: #94a3b8;
      font-size: 0.85rem;
      padding: 4px 8px;
      border-radius: 6px;
    }
    .btn-clear-input:hover {
      color: #0f172a;
      background: #f1f5f9;
    }

    .field-hint {
      font-size: 0.8rem;
      color: #64748b;
      margin-top: 2px;
    }

    /* Dish Type Cards Grid */
    .dish-type-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .type-card {
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 14px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 4px;
      transition: all 0.2s ease;
      background: #f8fafc;
    }
    .type-card:hover {
      border-color: #cbd5e1;
      background: #ffffff;
    }
    .type-card.selected {
      border-color: var(--primary-500);
      background: #ecfdf5;
      box-shadow: 0 0 0 1px var(--primary-500);
    }

    .type-badge {
      align-self: flex-start;
      font-size: 0.72rem;
      padding: 2px 6px;
      border-radius: 6px;
      font-weight: 700;
    }

    .type-title {
      font-size: 0.92rem;
      font-weight: 700;
      color: #1e293b;
    }

    .type-desc {
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.2;
    }

    /* Add Ingredient Box */
    .add-ingredient-box {
      background: #f8fafc;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .box-subtitle {
      font-size: 0.82rem;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .add-input-row {
      display: flex;
      gap: 8px;
      position: relative;
    }

    .ing-input-wrapper {
      position: relative;
      flex: 1;
    }

    .cat-select-wrapper {
      width: 140px;
    }

    .select-category {
      padding: 10px 8px;
      font-size: 0.85rem;
      cursor: pointer;
    }

    .btn-add-ingredient {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      border-radius: 10px;
      background: var(--primary-500);
      color: #ffffff;
      font-weight: 700;
      font-size: 0.88rem;
      white-space: nowrap;
    }
    .btn-add-ingredient:hover:not(:disabled) {
      background: var(--primary-600);
    }
    .btn-add-ingredient:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Suggestions Popup */
    .suggestions-popup {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      box-shadow: var(--shadow-lg);
      margin-top: 4px;
      max-height: 220px;
      overflow-y: auto;
      z-index: 100;
    }

    .suggestions-header {
      padding: 6px 12px;
      font-size: 0.72rem;
      font-weight: 700;
      color: #64748b;
      background: #f1f5f9;
      text-transform: uppercase;
    }

    .suggestion-item {
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      border-bottom: 1px solid #f8fafc;
    }
    .suggestion-item:hover {
      background: #ecfdf5;
    }

    .suggestion-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .suggestion-name {
      font-weight: 600;
      color: #0f172a;
      font-size: 0.9rem;
    }

    .cat-chip {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .suggestion-add-hint {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--primary-600);
    }

    /* Assigned Ingredients List */
    .assigned-ingredients-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .empty-state-card {
      text-align: center;
      padding: 32px 16px;
      background: #f8fafc;
      border: 1.5px dashed #cbd5e1;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .empty-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 4px;
    }

    .empty-state-card h4 {
      font-size: 0.95rem;
      font-weight: 700;
      color: #334155;
    }

    .empty-state-card p {
      font-size: 0.82rem;
      color: #64748b;
      max-width: 320px;
    }

    .ingredients-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 420px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .ingredient-item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      gap: 10px;
      transition: all 0.15s ease;
    }
    .ingredient-item-row:hover {
      border-color: #cbd5e1;
      box-shadow: var(--shadow-sm);
    }

    .ing-left {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;
    }

    .ing-number {
      font-size: 0.78rem;
      font-weight: 700;
      color: #94a3b8;
      width: 18px;
    }

    .cat-pill {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      white-space: nowrap;
    }

    .ing-name-text {
      font-size: 0.92rem;
      font-weight: 600;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ing-right-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-action-icon {
      padding: 6px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .btn-remove-from-recipe {
      color: #64748b;
      background: #f1f5f9;
    }
    .btn-remove-from-recipe:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .btn-delete-definitive {
      color: #dc2626;
      background: #fee2e2;
    }
    .btn-delete-definitive:hover {
      background: #fecaca;
    }

    .btn-tooltip {
      display: none;
    }

    /* Mobile Save Bar */
    .mobile-save-bar {
      display: none;
      position: fixed;
      bottom: 60px;
      left: 0;
      right: 0;
      background: #ffffff;
      padding: 12px 16px;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
      border-top: 1px solid var(--border-color);
      z-index: 1000;
      gap: 10px;
    }

    .btn-cancel-mobile {
      flex: 1;
      padding: 10px;
      border-radius: 10px;
      font-weight: 600;
      background: #f1f5f9;
      color: #475569;
    }

    .btn-save-mobile {
      flex: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px;
      border-radius: 10px;
      font-weight: 700;
      background: var(--primary-500);
      color: #ffffff;
    }

    @media (max-width: 768px) {
      .mobile-save-bar {
        display: flex;
      }
      .top-bar-actions {
        display: none;
      }
      .add-input-row {
        flex-direction: column;
      }
      .cat-select-wrapper {
        width: 100%;
      }
    }
  `]
})
export class DishEditComponent implements OnInit {
  @Input() dish: Dish | null = null;
  @Output() saved = new EventEmitter<Dish>();
  @Output() cancelled = new EventEmitter<void>();

  private menuService = inject(MenuService);
  private firestoreService = inject(FirestoreService);

  isEditing = false;
  dishId?: string;
  dishName = '';
  dishType: DishType = 'protein';
  recipeUrl = '';
  
  assignedIngredients: Ingredient[] = [];
  categories = computed<Category[]>(() => this.firestoreService.categories());
  allDbIngredients = computed<Ingredient[]>(() => this.firestoreService.ingredients());

  // Add ingredient inputs
  newIngName = '';
  newIngCategory = 'cat_viveres';
  showSuggestions = false;
  suggestions: Ingredient[] = [];

  async ngOnInit(): Promise<void> {
    if (this.dish) {
      this.isEditing = true;
      this.dishId = this.dish.id;
      this.dishName = this.dish.name || '';
      this.dishType = this.dish.type || 'protein';
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

    const query = this.newIngName.toLowerCase().trim();
    const assignedIds = new Set(this.assignedIngredients.map(i => i.id));

    this.suggestions = this.allDbIngredients()
      .filter(i => !assignedIds.has(i.id) && i.name.toLowerCase().includes(query))
      .slice(0, 6);

    this.showSuggestions = this.suggestions.length > 0;
  }

  selectSuggestion(ing: Ingredient): void {
    if (!this.assignedIngredients.some(i => i.id === ing.id)) {
      this.assignedIngredients.push(ing);
    }
    this.newIngName = '';
    this.showSuggestions = false;
  }

  async addIngredientFromInput(): Promise<void> {
    const cleanName = this.newIngName.trim();
    if (!cleanName) return;

    if (this.assignedIngredients.some(i => i.name.toLowerCase() === cleanName.toLowerCase())) {
      this.newIngName = '';
      this.showSuggestions = false;
      return;
    }

    const ing = await this.menuService.createOrGetIngredient(cleanName, this.newIngCategory);
    this.assignedIngredients.push(ing);

    this.newIngName = '';
    this.showSuggestions = false;
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
      type: this.dishType,
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
