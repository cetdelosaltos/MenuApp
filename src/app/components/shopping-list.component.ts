import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShoppingService, CategoryShoppingGroup } from '../services/shopping.service';
import { MenuService } from '../services/menu.service';
import { ShoppingItem, Category, Ingredient } from '../models/types';
import { IconComponent } from './icon.component';
import { matchesSearch, isSameText } from '../utils/string-utils';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="shopping-page animate-fade">
      
      <!-- Top Summary & Action Bar -->
      <div class="shopping-header-card">
        <div class="header-left">
          <div class="title-with-badge">
            <h2 class="section-title">Lista de Compras</h2>
            <span class="badge badge-emerald">{{ shoppingService.pendingItemsCount() }} por comprar</span>
            <span *ngIf="shoppingService.purchasedItemsCount() > 0" class="badge badge-gray">
              {{ shoppingService.purchasedItemsCount() }} comprados
            </span>
          </div>
          <p class="section-sub">Generada automáticamente a partir del menú semanal + productos del hogar.</p>
        </div>

        <div class="header-actions">
          <!-- Refresh from menu button -->
          <button class="btn-refresh-menu" (click)="shoppingService.syncWithMenu()" title="Sincronizar con el menú semanal">
            <app-icon name="refresh" [size]="16"></app-icon>
            <span>Actualizar del Menú</span>
          </button>

          <!-- Add manual item button -->
          <button class="btn-add-manual" (click)="showAddModal = true">
            <app-icon name="plus" [size]="16"></app-icon>
            <span>+ Agregar Producto</span>
          </button>
        </div>
      </div>

      <!-- Quick Add Bar (Inline with Autocomplete / Typeahead) -->
      <div class="quick-add-bar">
        <div class="quick-input-wrapper">
          <input
            type="text"
            class="quick-input"
            [(ngModel)]="quickName"
            (input)="onQuickNameInput()"
            (focus)="onQuickNameInput()"
            (blur)="hideQuickSuggestionsWithDelay()"
            placeholder="Añadir producto rápido (ej. Leche, Café, Papel higiénico)..."
            (keyup.enter)="addQuickItem()"
          />

          <!-- Autocomplete Dropdown List -->
          <div *ngIf="showQuickSuggestions" class="quick-suggestions-dropdown animate-fade">
            <div
              *ngFor="let ing of filteredQuickIngredients; trackBy: trackByIngId"
              class="quick-suggestion-item"
              (mousedown)="selectQuickSuggestion(ing)"
            >
              <span class="suggestion-text">{{ ing.name }}</span>
              <span class="cat-pill-xs" [style.background-color]="getCatColor(ing.categoryId) + '20'" [style.color]="getCatColor(ing.categoryId)">
                {{ getCatName(ing.categoryId) }}
              </span>
            </div>
          </div>
        </div>

        <select class="quick-select" [(ngModel)]="quickCatId">
          <option *ngFor="let cat of shoppingService.categories(); trackBy: trackByCatId" [value]="cat.id">
            {{ cat.name }}
          </option>
        </select>

        <div class="quick-add-row-bottom">
          <input
            type="text"
            inputmode="decimal"
            class="quick-input-qty"
            [(ngModel)]="quickQty"
            placeholder="Cant. (1)"
            (keyup.enter)="addQuickItem()"
          />
          <input
            type="text"
            class="quick-input-unit"
            [(ngModel)]="quickUnit"
            placeholder="Unidad (kg, paq)"
            (keyup.enter)="addQuickItem()"
          />
          <button type="button" class="btn-quick-submit" (click)="addQuickItem()" [disabled]="!quickName.trim()">
            <app-icon name="plus" [size]="16"></app-icon> Agregar
          </button>
        </div>
      </div>

      <!-- SECTION 1: PENDING ITEMS (POR COMPRAR) -->
      <div class="section-container">
        
        <div class="section-heading-bar">
          <div class="heading-left">
            <span class="heading-dot dot-pending"></span>
            <h3 class="section-heading-title">Por Comprar (Pendientes)</h3>
          </div>
          <span class="badge badge-emerald">{{ shoppingService.pendingItemsCount() }} pendientes</span>
        </div>

        <!-- Empty state: When no items at all -->
        <div *ngIf="shoppingService.pendingItemsCount() === 0 && shoppingService.purchasedItemsCount() === 0" class="empty-state-card">
          <div class="empty-icon-circle">
            <app-icon name="shopping-cart" [size]="32" extraClass="text-muted"></app-icon>
          </div>
          <h3>Tu lista de compras está vacía</h3>
          <p>Haz clic en "Actualizar del Menú" para cargar los ingredientes del menú semanal o añade productos manualmente arriba.</p>
          <button type="button" class="btn-primary-action" (click)="shoppingService.syncWithMenu()">
            <app-icon name="refresh" [size]="16"></app-icon> Cargar Ingredientes del Menú
          </button>
        </div>

        <!-- All Bought Success Card (when pending = 0 but purchased > 0) -->
        <div *ngIf="shoppingService.pendingItemsCount() === 0 && shoppingService.purchasedItemsCount() > 0" class="all-bought-card">
          <div class="all-bought-icon">
            <app-icon name="check" [size]="28" extraClass="text-white"></app-icon>
          </div>
          <div class="all-bought-info">
            <h4>¡Todo comprado!</h4>
            <p>No tienes artículos pendientes en la lista de compras. Abajo puedes ver los artículos comprados o desmarcarlos si lo necesitas.</p>
          </div>
        </div>

        <!-- Pending Items Category Groups -->
        <div class="category-groups-container" *ngIf="shoppingService.pendingGroupedItems().length > 0">
          
          <div *ngFor="let group of shoppingService.pendingGroupedItems(); trackBy: trackByGroupId" class="category-card">
            
            <!-- Category Card Header -->
            <div class="category-header">
              <div class="cat-title-wrap">
                <span class="cat-color-dot" [style.background-color]="group.category.color"></span>
                <h4 class="cat-name">{{ group.category.name }}</h4>
              </div>
              <div class="cat-counters">
                <span class="cat-count-badge">{{ group.pendingCount }} item{{ group.pendingCount !== 1 ? 's' : '' }}</span>
              </div>
            </div>

            <!-- Items in Category -->
            <div class="category-items-list">
              <div
                *ngFor="let item of group.items; trackBy: trackByItemId"
                class="shopping-item-row"
              >
                
                <!-- Main Info Col: Checkbox + Name + Qty + Date -->
                <div class="item-main-col">
                  <button
                    type="button"
                    class="btn-checkbox"
                    (click)="markComprado(item, $event)"
                    title="Marcar como comprado (pasar a comprados abajo)"
                  >
                  </button>

                  <div class="item-name-meta">
                    <div class="item-title-qty-line">
                      <span class="item-name">{{ item.name }}</span>
                      
                      <!-- Normal Quantity Display with Click-to-edit -->
                      <button type="button" *ngIf="editingItemId !== item.id" class="btn-qty-display" (click)="startInlineQty(item)" title="Hacer clic para editar cantidad">
                        <span *ngIf="item.quantity || item.unit" class="qty-text">
                          {{ item.quantity }} {{ item.unit }}
                        </span>
                        <span *ngIf="!item.quantity && !item.unit" class="qty-placeholder">
                          + Cant.
                        </span>
                        <app-icon name="pencil" [size]="11" extraClass="opacity-50"></app-icon>
                      </button>
                    </div>

                    <!-- If currently editing quantity -->
                    <div *ngIf="editingItemId === item.id" class="inline-qty-editor">
                      <input
                        type="text"
                        inputmode="decimal"
                        class="qty-field"
                        [(ngModel)]="editQtyValue"
                        placeholder="1"
                        title="Cantidad numérica"
                        autofocus
                      />
                      <input
                        type="text"
                        class="unit-field"
                        [(ngModel)]="editUnitValue"
                        placeholder="Kilo/paq"
                        title="Unidad o descripción"
                      />
                      <!-- Ok button (✓) -->
                      <button type="button" class="btn-qty-ok" (click)="saveInlineQty(item)" title="Confirmar cantidad">
                        <app-icon name="check" [size]="13"></app-icon>
                      </button>
                      <!-- Cancel button (✕) -->
                      <button type="button" class="btn-qty-cancel" (click)="cancelInlineQty()" title="Cancelar">
                        <app-icon name="x" [size]="13"></app-icon>
                      </button>
                    </div>

                    <span *ngIf="item.lastPurchasedAt" class="item-last-purchase">
                      Última compra: {{ formatPurchaseDate(item.lastPurchasedAt) }}
                    </span>
                  </div>
                </div>

                <!-- ACTION BUTTONS: "Hay en Casa", "Comprado", "Eliminar" -->
                <div class="item-actions-col">
                  
                  <!-- Button: "Hay en Casa" -->
                  <button
                    type="button"
                    class="btn-pantry"
                    (click)="markHayEnCasa(item, $event)"
                    title="Hay en casa: Ocultar de la lista de compras actual sin borrar de recetas"
                  >
                    <app-icon name="home" [size]="14"></app-icon>
                    <span class="action-btn-text">En Casa</span>
                  </button>

                  <!-- Button: "Comprado" (Moves item to bottom) -->
                  <button
                    type="button"
                    class="btn-mark-bought"
                    (click)="markComprado(item, $event)"
                    title="Marcar como comprado (se traslada a la lista inferior)"
                  >
                    <app-icon name="check" [size]="14"></app-icon>
                    <span class="action-btn-text">Comprado</span>
                  </button>

                  <!-- Delete Item -->
                  <button type="button" class="btn-item-delete" (click)="removeItem(item.id, $event)" title="Quitar de la lista">
                    <app-icon name="trash" [size]="14"></app-icon>
                  </button>

                </div>

              </div>
            </div>

          </div>

        </div>

      </div>

      <!-- SECTION 2: PURCHASED ITEMS (PRODUCTOS COMPRADOS EN LA PARTE INFERIOR) -->
      <div *ngIf="shoppingService.purchasedItems().length > 0" class="purchased-section-wrapper">
        
        <div class="purchased-header" (click)="togglePurchasedExpanded()">
          <div class="purchased-header-left">
            <div class="purchased-icon-box">
              <app-icon name="check" [size]="16" extraClass="text-emerald"></app-icon>
            </div>
            <div class="purchased-titles">
              <h3 class="purchased-title">Productos Comprados</h3>
              <span class="purchased-subtitle">
                {{ shoppingService.purchasedItems().length }} producto{{ shoppingService.purchasedItems().length !== 1 ? 's' : '' }} en el carrito
              </span>
            </div>
          </div>

          <div class="purchased-header-actions" (click)="$event.stopPropagation()">
            <button type="button" class="btn-clear-purchased" (click)="confirmClearPurchased()" title="Limpiar todos los artículos comprados de la lista">
              <app-icon name="trash" [size]="14"></app-icon>
              <span>Limpiar Comprados</span>
            </button>
            <button type="button" class="btn-toggle-expand" (click)="togglePurchasedExpanded()" [title]="isPurchasedExpanded ? 'Contraer' : 'Expandir'">
              <app-icon [name]="isPurchasedExpanded ? 'chevron-left' : 'chevron-right'" [size]="16"></app-icon>
            </button>
          </div>
        </div>

        <!-- Purchased List Content -->
        <div *ngIf="isPurchasedExpanded" class="purchased-list-body">
          <div
            *ngFor="let item of shoppingService.purchasedItems(); trackBy: trackByItemId"
            class="purchased-item-row"
          >
            <!-- Checkbox: Unchecking restores item back to the top list! -->
            <div class="purchased-item-left">
              <button
                type="button"
                class="btn-checkbox checked"
                (click)="restoreToPending(item, $event)"
                title="Desmarcar y regresar a la lista de pendientes arriba"
              >
                <app-icon name="check" [size]="14"></app-icon>
              </button>

              <span class="cat-pill-sm" [style.background-color]="getCatColor(item.categoryId) + '20'" [style.color]="getCatColor(item.categoryId)">
                {{ getCatName(item.categoryId) }}
              </span>

              <div class="purchased-item-names">
                <span class="purchased-item-name">{{ item.name }}</span>
                <span *ngIf="item.quantity || item.unit" class="purchased-item-qty">
                  ({{ item.quantity }} {{ item.unit }})
                </span>
                <span *ngIf="item.lastPurchasedAt" class="purchased-date-badge">
                  ✓ {{ formatPurchaseDate(item.lastPurchasedAt) }}
                </span>
              </div>
            </div>

            <!-- Actions on purchased items -->
            <div class="purchased-item-actions">
              <button
                type="button"
                class="btn-restore-item"
                (click)="restoreToPending(item, $event)"
                title="Regresar a pendientes arriba"
              >
                <app-icon name="refresh" [size]="13"></app-icon>
                <span>Regresar a Pendientes</span>
              </button>

              <button type="button" class="btn-item-delete" (click)="removeItem(item.id, $event)" title="Eliminar de la lista">
                <app-icon name="trash" [size]="14"></app-icon>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .shopping-page {
      display: flex;
      flex-direction: column;
      gap: 0;
      padding: 0;
      padding-bottom: 40px;
    }

    .shopping-header-card {
      background: transparent;
      padding: 4px 2px 10px;
      border-radius: 0;
      border: none;
      border-bottom: 1px solid var(--border-color);
      box-shadow: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
    }

    .title-with-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .section-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
    }

    .section-sub {
      font-size: 0.82rem;
      color: #64748b;
      margin-top: 2px;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .btn-refresh-menu {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      padding: 7px 12px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
    }
    .btn-refresh-menu:hover {
      background: #d1fae5;
    }

    .btn-add-manual {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #10b981;
      color: #ffffff;
      padding: 7px 14px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      border: none;
      cursor: pointer;
    }
    .btn-add-manual:hover {
      background: #059669;
    }

    /* Quick Add Bar */
    .quick-add-bar {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: transparent;
      padding: 10px 2px;
      border-radius: 0;
      border: none;
      border-bottom: 1px solid var(--border-color);
      box-shadow: none;
    }

    .quick-input-wrapper {
      position: relative;
      width: 100%;
    }

    .quick-input-wrapper .quick-input {
      width: 100%;
      box-sizing: border-box;
      padding: 9px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.9rem;
      outline: none;
    }
    .quick-input-wrapper .quick-input:focus { border-color: #10b981; }

    .quick-suggestions-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.18);
      z-index: 1000;
      max-height: 220px;
      overflow-y: auto;
      padding: 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .quick-suggestion-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.88rem;
      transition: background 0.15s;
    }
    .quick-suggestion-item:hover {
      background: #ecfdf5;
    }

    .suggestion-text {
      font-weight: 600;
      color: #1e293b;
    }

    .cat-pill-xs {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
    }

    .quick-select {
      width: 100%;
      box-sizing: border-box;
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.85rem;
      background: #ffffff;
      outline: none;
    }
    .quick-select:focus { border-color: #10b981; }

    .quick-add-row-bottom {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    .quick-input-qty {
      flex: 1;
      min-width: 0;
      box-sizing: border-box;
      padding: 8px 6px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.85rem;
      text-align: center;
    }
    .quick-input-qty:focus { border-color: #10b981; outline: none; }

    .quick-input-unit {
      flex: 1.2;
      min-width: 0;
      box-sizing: border-box;
      padding: 8px 8px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.85rem;
    }
    .quick-input-unit:focus { border-color: #10b981; outline: none; }

    .btn-quick-submit {
      flex: 1.4;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 8px 12px;
      background: #10b981;
      color: #ffffff;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      white-space: nowrap;
      border: none;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-quick-submit:hover:not(:disabled) { background: #059669; }
    .btn-quick-submit:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Section Container */
    .section-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .section-heading-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 6px;
    }

    .heading-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .heading-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .dot-pending { background: #10b981; }

    .section-heading-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
    }

    /* All Bought Success Card */
    .all-bought-card {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border: 1.5px solid #a7f3d0;
      border-radius: 14px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .all-bought-icon {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
    }

    .all-bought-info h4 {
      font-size: 1.05rem;
      font-weight: 700;
      color: #065f46;
    }

    .all-bought-info p {
      font-size: 0.85rem;
      color: #047857;
      margin-top: 2px;
    }

    /* Ionic-Style Flat Grouped List */
    .category-groups-container {
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border: none;
      border-radius: 0;
      overflow: hidden;
      box-shadow: none;
    }

    .category-card {
      background: transparent;
      border: none;
      border-radius: 0;
      box-shadow: none;
    }

    .category-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
    }

    .category-card:first-child .category-header {
      border-top: none;
    }

    .cat-title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cat-color-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .cat-name {
      font-size: 0.82rem;
      font-weight: 800;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .cat-count-badge {
      font-size: 0.72rem;
      color: #64748b;
      font-weight: 600;
    }

    .category-items-list {
      display: flex;
      flex-direction: column;
    }

    .shopping-item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
      gap: 8px;
      width: 100%;
      box-sizing: border-box;
      transition: background-color 0.15s;
    }
    .shopping-item-row:last-child {
      border-bottom: none;
    }
    .shopping-item-row:hover {
      background: #fcfcfc;
    }

    .item-main-col {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      flex: 1;
      min-width: 0;
    }

    .btn-checkbox {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      border: 2px solid #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      color: #ffffff;
      flex-shrink: 0;
      cursor: pointer;
      margin-top: 2px;
      transition: all 0.15s ease;
    }
    .btn-checkbox:hover {
      border-color: #10b981;
      background: #ecfdf5;
    }
    .btn-checkbox.checked {
      background: #10b981;
      border-color: #10b981;
    }

    .item-name-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      min-width: 0;
    }

    .item-title-qty-line {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .item-name {
      font-size: 0.92rem;
      font-weight: 700;
      color: #1e293b;
      word-break: break-word;
      line-height: 1.25;
    }

    .item-last-purchase {
      font-size: 0.72rem;
      color: #059669;
      font-weight: 500;
    }

    .btn-qty-display {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 6px;
      background: #f1f5f9;
      border-radius: 5px;
      font-size: 0.76rem;
      font-weight: 600;
      color: #334155;
      border: 1px solid #e2e8f0;
      flex-shrink: 0;
    }
    .btn-qty-display:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .qty-placeholder {
      color: #94a3b8;
      font-style: italic;
    }

    .inline-qty-editor {
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 2px 0;
    }

    .qty-field {
      width: 42px;
      padding: 3px 5px;
      border: 1px solid #10b981;
      border-radius: 5px;
      font-size: 0.78rem;
      text-align: center;
      outline: none;
    }

    .unit-field {
      width: 60px;
      padding: 3px 5px;
      border: 1px solid #10b981;
      border-radius: 5px;
      font-size: 0.78rem;
      outline: none;
    }

    .btn-qty-ok {
      width: 24px;
      height: 24px;
      background: #10b981;
      color: #ffffff;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
    }

    .btn-qty-cancel {
      width: 24px;
      height: 24px;
      background: #f1f5f9;
      color: #64748b;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
    }

    /* Actions Column */
    .item-actions-col {
      display: flex;
      align-items: center;
      gap: 5px;
      flex-shrink: 0;
    }

    .btn-pantry {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 6px 8px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.76rem;
      font-weight: 600;
      color: #475569;
      white-space: nowrap;
      cursor: pointer;
      min-width: 32px;
      min-height: 32px;
    }
    .btn-pantry:hover {
      background: #f1f5f9;
      color: #0f172a;
      border-color: #94a3b8;
    }

    .btn-mark-bought {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 6px 8px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 6px;
      font-size: 0.76rem;
      font-weight: 600;
      color: #065f46;
      white-space: nowrap;
      cursor: pointer;
      min-width: 32px;
      min-height: 32px;
    }
    .btn-mark-bought:hover {
      background: #d1fae5;
    }

    .btn-item-delete {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      background: transparent;
      border: none;
      cursor: pointer;
      flex-shrink: 0;
    }
    .btn-item-delete:hover {
      background: #fee2e2;
      color: #dc2626;
    }

    /* Empty state */
    .empty-state-card {
      background: #ffffff;
      padding: 40px 20px;
      border-radius: 8px;
      text-align: center;
      border: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .empty-icon-circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-primary-action {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #10b981;
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 8px;
    }
    .btn-primary-action:hover {
      background: #059669;
    }

    /* SECTION 2: PURCHASED ITEMS AT THE BOTTOM */
    .purchased-section-wrapper {
      background: #ffffff;
      border-radius: 0;
      border: none;
      border-top: 1px solid var(--border-color);
      box-shadow: none;
      overflow: hidden;
      margin-top: 10px;
    }

    .purchased-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      background: #f8fafc;
      border-bottom: 1px solid #f1f5f9;
      cursor: pointer;
    }

    .purchased-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .purchased-icon-box {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #d1fae5;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .purchased-titles {
      display: flex;
      flex-direction: column;
    }

    .purchased-title {
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
    }

    .purchased-subtitle {
      font-size: 0.78rem;
      color: #64748b;
    }

    .purchased-header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-clear-purchased {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #dc2626;
      background: #fee2e2;
      border: 1px solid #fca5a5;
    }
    .btn-clear-purchased:hover {
      background: #fecaca;
    }

    .btn-toggle-expand {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      transform: rotate(90deg);
      transition: transform 0.2s ease;
    }

    .purchased-list-body {
      display: flex;
      flex-direction: column;
      max-height: 400px;
      overflow-y: auto;
    }

    .purchased-item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 18px;
      border-bottom: 1px solid #f8fafc;
      gap: 12px;
      background: #ffffff;
      transition: background 0.15s ease;
    }
    .purchased-item-row:last-child {
      border-bottom: none;
    }
    .purchased-item-row:hover {
      background: #f8fafc;
    }

    .purchased-item-left {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;
    }

    .cat-pill-sm {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
    }

    .purchased-item-names {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .purchased-item-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: #64748b;
      text-decoration: line-through;
    }

    .purchased-item-qty {
      font-size: 0.8rem;
      color: #94a3b8;
      font-weight: 500;
    }

    .purchased-date-badge {
      font-size: 0.72rem;
      color: #059669;
      font-weight: 600;
      background: #ecfdf5;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .purchased-item-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-restore-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #0369a1;
      background: #e0f2fe;
    }
    .btn-restore-item:hover {
      background: #bae6fd;
    }

    @media (max-width: 768px) {
      .action-btn-text,
      .btn-restore-item span {
        display: none !important;
      }
      .item-actions-col {
        gap: 3px;
      }
      .btn-pantry, .btn-mark-bought {
        padding: 5px 6px;
      }
    }
  `]
})
export class ShoppingListComponent {
  shoppingService = inject(ShoppingService);
  private menuService = inject(MenuService);

  // Quick Add Model
  quickName = '';
  quickCatId = 'cat_viveres';
  quickQty = '';
  quickUnit = '';

  // Typeahead / Autocomplete state
  showQuickSuggestions = false;
  filteredQuickIngredients: Ingredient[] = [];

  showAddModal = false;
  isPurchasedExpanded = true;

  // Inline Quantity Edit state
  editingItemId: string | null = null;
  editQtyValue = '';
  editUnitValue = '';

  onQuickNameInput(): void {
    const q = this.quickName.trim();
    if (!q) {
      this.showQuickSuggestions = false;
      this.filteredQuickIngredients = [];
      return;
    }

    const allIngs = this.menuService.allIngredients();
    this.filteredQuickIngredients = allIngs
      .filter(i => !i.deletedAt && matchesSearch(i.name, q))
      .slice(0, 7);

    this.showQuickSuggestions = this.filteredQuickIngredients.length > 0;

    // If exact match or first match found, auto-select its category
    const exact = allIngs.find(i => isSameText(i.name, q));
    if (exact && exact.categoryId) {
      this.quickCatId = exact.categoryId;
    }
  }

  selectQuickSuggestion(ing: Ingredient): void {
    this.quickName = ing.name;
    if (ing.categoryId) {
      this.quickCatId = ing.categoryId;
    }
    this.showQuickSuggestions = false;
  }

  hideQuickSuggestionsWithDelay(): void {
    setTimeout(() => {
      this.showQuickSuggestions = false;
    }, 250);
  }

  async addQuickItem(): Promise<void> {
    if (!this.quickName.trim()) return;

    await this.shoppingService.addManualItem(
      this.quickName.trim(),
      this.quickCatId,
      this.quickQty.trim(),
      this.quickUnit.trim()
    );

    this.quickName = '';
    this.quickQty = '';
    this.quickUnit = '';
    this.showQuickSuggestions = false;
  }

  trackByGroupId(index: number, group: CategoryShoppingGroup): string {
    return group.category.id;
  }

  trackByItemId(index: number, item: ShoppingItem): string {
    return item.id;
  }

  trackByCatId(index: number, cat: Category): string {
    return cat.id;
  }

  trackByIngId(index: number, ing: Ingredient): string {
    return ing.id;
  }

  markComprado(item: ShoppingItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
      (event.currentTarget as HTMLElement)?.blur();
      (document.activeElement as HTMLElement)?.blur();
    }
    this.shoppingService.markPurchased(item.id);
  }

  restoreToPending(item: ShoppingItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
      (event.currentTarget as HTMLElement)?.blur();
      (document.activeElement as HTMLElement)?.blur();
    }
    this.shoppingService.markPending(item.id);
  }

  markHayEnCasa(item: ShoppingItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
      (event.currentTarget as HTMLElement)?.blur();
      (document.activeElement as HTMLElement)?.blur();
    }
    this.shoppingService.markInPantry(item.id);
  }

  removeItem(itemId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
      (event.currentTarget as HTMLElement)?.blur();
      (document.activeElement as HTMLElement)?.blur();
    }
    this.shoppingService.removeItem(itemId);
  }

  startInlineQty(item: ShoppingItem): void {
    this.editingItemId = item.id;
    this.editQtyValue = item.quantity || '';
    this.editUnitValue = item.unit || '';
  }

  async saveInlineQty(item: ShoppingItem): Promise<void> {
    await this.shoppingService.updateQuantity(item.id, this.editQtyValue, this.editUnitValue);
    this.editingItemId = null;
  }

  cancelInlineQty(): void {
    this.editingItemId = null;
  }

  togglePurchasedExpanded(): void {
    this.isPurchasedExpanded = !this.isPurchasedExpanded;
  }

  async confirmClearPurchased(): Promise<void> {
    if (confirm('¿Deseas limpiar todos los productos comprados de la lista?')) {
      await this.shoppingService.clearAllPurchased();
    }
  }

  getCatColor(catId?: string): string {
    const found = this.shoppingService.categories().find(c => c.id === catId);
    return found ? found.color : '#64748b';
  }

  getCatName(catId?: string): string {
    const found = this.shoppingService.categories().find(c => c.id === catId);
    return found ? found.name : 'Víveres';
  }

  formatPurchaseDate(isoDate?: string): string {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
