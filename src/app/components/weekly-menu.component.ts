import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MenuService } from '../services/menu.service';
import { ShoppingService } from '../services/shopping.service';
import { SyncService } from '../services/sync.service';
import { WeeklyMenu, PlannedDishItem } from '../models/types';
import { DishModalComponent } from './dish-modal.component';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-weekly-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, DishModalComponent, IconComponent],
  template: `
    <div class="weekly-menu-page animate-fade">
      
      <!-- Top Actions & Week Navigation Bar (Hidden on print) -->
      <div class="top-nav-bar no-print">
        
        <div class="week-header-top-row">
          <!-- Week Navigation Controls -->
          <div class="week-controls">
            <button class="nav-btn" (click)="prevWeek()" title="Semana Anterior">
              <app-icon name="chevron-left" [size]="20"></app-icon>
            </button>
            
            <div class="week-title-badge">
              <app-icon name="calendar" [size]="18" extraClass="text-emerald"></app-icon>
              <span class="week-title-text">{{ getPrintTitle() }}</span>
            </div>

            <button class="nav-btn" (click)="nextWeek()" title="Semana Siguiente">
              <app-icon name="chevron-right" [size]="20"></app-icon>
            </button>
          </div>

          <!-- Global Action Buttons -->
          <div class="top-actions">
            <!-- Sync to Shopping List button -->
            <button class="btn-action btn-sync-shopping" (click)="syncShoppingList()" title="Actualizar lista de compras con los ingredientes de esta semana">
              <app-icon name="shopping-cart" [size]="17"></app-icon>
              <span>Generar Compras</span>
            </button>

            <!-- Print button -->
            <button class="btn-action btn-print" (click)="printMenu()" title="Imprimir menú en 1 hoja carta">
              <app-icon name="printer" [size]="17"></app-icon>
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        <!-- Quick Day Tabs with Day-to-Day Arrow Navigation -->
        <div class="mobile-day-selector">
          <button
            type="button"
            class="day-arrow-nav-btn"
            (click)="prevMobileDay()"
            title="Día anterior"
          >
            <app-icon name="chevron-left" [size]="16"></app-icon>
          </button>

          <div class="mobile-day-tabs-container">
            <button
              *ngFor="let day of menuService.dayNames; let d = index"
              type="button"
              class="mobile-day-tab"
              [class.active]="selectedMobileDay === d"
              [class.is-today]="isToday(d)"
              (click)="selectMobileDay(d)"
            >
              <span class="mobile-day-short">{{ day.substring(0, 3) }}</span>
              <span class="mobile-day-mini-date">{{ getDayDateFormatted(d) }}</span>
            </button>
          </div>

          <button
            type="button"
            class="day-arrow-nav-btn"
            (click)="nextMobileDay()"
            title="Día siguiente"
          >
            <app-icon name="chevron-right" [size]="16"></app-icon>
          </button>
        </div>

      </div>

      <!-- PRINT-ONLY HEADER -->
      <div class="print-only print-title-header">
        <h1>{{ getPrintTitle() }}</h1>
        <p class="print-sub">Planificación de Menú Familiar Semanal</p>
      </div>

      <!-- MAIN INTERACTIVE WEEKLY TABLE -->
      <div class="table-card-wrapper">
        
        <!-- DESKTOP FULL 7-DAY VIEW -->
        <div class="table-responsive desktop-table-view">
          <table class="menu-table print-table">
            <thead>
              <tr>
                <th class="col-section-header">Comida / Sección</th>
                <th *ngFor="let day of menuService.dayNames; let d = index" class="col-day-header" [class.is-today]="isToday(d)">
                  <div class="day-header-content">
                    <span class="day-name">{{ day }}</span>
                    <span class="day-date">{{ getDayDateFormatted(d) }}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              
              <!-- 1. DESAYUNO -->
              <tr class="row-meal row-breakfast" cdkDropListGroup>
                <td class="row-header">
                  <div class="meal-label-block">
                    <span class="meal-badge badge-amber">Desayuno</span>
                  </div>
                </td>
                <td
                  *ngFor="let day of [0,1,2,3,4,5,6]"
                  class="meal-cell slot-drop-target"
                  cdkDropList
                  [cdkDropListData]="{ day: day, slot: 'breakfast' }"
                  (cdkDropListDropped)="onSingleSlotDrop($event)"
                  (click)="openDishModal(day, 'breakfast', 'Desayuno', menu()?.days?.[day]?.breakfast)"
                >
                  <div
                    class="cell-content draggable-dish"
                    *ngIf="menu()?.days?.[day]?.breakfast as item; else emptySlot"
                    cdkDrag
                    [cdkDragData]="{ day: day, slot: 'breakfast', item: item }"
                  >
                    <div class="dish-title-row">
                      <div class="dish-drag-handle no-print" title="Arrastrar para mover o intercambiar">
                        <app-icon name="grip" [size]="12" extraClass="text-slate-400"></app-icon>
                      </div>
                      <span class="dish-name font-bold">{{ item.name }}</span>
                      <a
                        *ngIf="item.recipeUrl"
                        [href]="item.recipeUrl"
                        target="_blank"
                        (click)="$event.stopPropagation()"
                        (mousedown)="$event.stopPropagation()"
                        (touchstart)="$event.stopPropagation()"
                        class="recipe-link"
                        title="Ver Receta"
                      >
                        <app-icon name="external-link" [size]="12"></app-icon>
                      </a>
                    </div>
                    <div *ngIf="item.ingredients?.length" class="ingredients-summary no-print">
                      <span class="ing-count-chip">{{ item.ingredients.length }} ing.</span>
                    </div>
                  </div>
                  <ng-template #emptySlot>
                    <div class="cell-placeholder no-print">
                      <app-icon name="plus" [size]="14"></app-icon>
                      <span>Planificar</span>
                    </div>
                  </ng-template>
                </td>
              </tr>

              <!-- 2. ALMUERZO PRINCIPAL (PROTEÍNA) -->
              <tr class="row-meal row-lunch-protein" cdkDropListGroup>
                <td class="row-header">
                  <div class="meal-label-block">
                    <span class="meal-badge badge-rose">Almuerzo</span>
                    <span class="meal-sub">Plato Principal</span>
                  </div>
                </td>
                <td
                  *ngFor="let day of [0,1,2,3,4,5,6]"
                  class="meal-cell slot-drop-target"
                  cdkDropList
                  [cdkDropListData]="{ day: day, slot: 'lunchProtein' }"
                  (cdkDropListDropped)="onSingleSlotDrop($event)"
                  (click)="openDishModal(day, 'lunchProtein', 'Almuerzo Principal', menu()?.days?.[day]?.lunchProtein)"
                >
                  <div
                    class="cell-content draggable-dish"
                    *ngIf="menu()?.days?.[day]?.lunchProtein as item; else emptyProteinSlot"
                    cdkDrag
                    [cdkDragData]="{ day: day, slot: 'lunchProtein', item: item }"
                  >
                    <div class="dish-title-row">
                      <div class="dish-drag-handle no-print" title="Arrastrar para mover o intercambiar">
                        <app-icon name="grip" [size]="12" extraClass="text-slate-400"></app-icon>
                      </div>
                      <span class="dish-name font-bold">{{ item.name }}</span>
                      <a
                        *ngIf="item.recipeUrl"
                        [href]="item.recipeUrl"
                        target="_blank"
                        (click)="$event.stopPropagation()"
                        (mousedown)="$event.stopPropagation()"
                        (touchstart)="$event.stopPropagation()"
                        class="recipe-link"
                        title="Ver Receta"
                      >
                        <app-icon name="external-link" [size]="12"></app-icon>
                      </a>
                    </div>
                    <div *ngIf="item.ingredients?.length" class="ingredients-summary no-print">
                      <span class="ing-count-chip chip-rose">{{ item.ingredients.length }} ingredientes</span>
                    </div>
                  </div>
                  <ng-template #emptyProteinSlot>
                    <div class="cell-placeholder no-print">
                      <app-icon name="plus" [size]="14"></app-icon>
                      <span>Principal</span>
                    </div>
                  </ng-template>
                </td>
              </tr>

              <!-- 3. ALMUERZO CONTORNOS -->
              <tr class="row-meal row-lunch-sides" cdkDropListGroup>
                <td class="row-header">
                  <div class="meal-label-block">
                    <span class="meal-badge badge-rose">Almuerzo</span>
                    <span class="meal-sub">Contornos</span>
                  </div>
                </td>
                <td *ngFor="let day of [0,1,2,3,4,5,6]" class="meal-cell sides-cell">
                  <div
                    class="sides-container sides-drop-list"
                    cdkDropList
                    [cdkDropListData]="{ day: day, slot: 'lunchSides', items: menu()?.days?.[day]?.lunchSides || [] }"
                    (cdkDropListDropped)="onSidesDrop($event)"
                  >
                    <!-- Listed sides -->
                    <div
                      *ngFor="let side of menu()?.days?.[day]?.lunchSides; let sIdx = index"
                      class="side-chip-item draggable-side"
                      cdkDrag
                      [cdkDragData]="{ day: day, slot: 'lunchSides', item: side, index: sIdx }"
                      (click)="openDishModal(day, 'lunchSides', 'Contorno: ' + side.name, side, sIdx)"
                    >
                      <div *cdkDragPlaceholder class="side-drag-placeholder"></div>
                      <div class="side-drag-handle no-print" title="Arrastrar contorno a otro día">
                        <app-icon name="grip" [size]="11" extraClass="text-emerald"></app-icon>
                      </div>
                      <div class="side-chip-content">
                        <span class="side-name">{{ side.name }}</span>
                        <a
                          *ngIf="side.recipeUrl"
                          [href]="side.recipeUrl"
                          target="_blank"
                          (click)="$event.stopPropagation()"
                          (mousedown)="$event.stopPropagation()"
                          (touchstart)="$event.stopPropagation()"
                          class="recipe-link"
                          title="Ver Receta"
                        >
                          <app-icon name="external-link" [size]="11"></app-icon>
                        </a>
                      </div>
                      <button
                        class="btn-side-remove no-print"
                        (click)="$event.stopPropagation(); removeSide(day, sIdx)"
                        (mousedown)="$event.stopPropagation()"
                        (touchstart)="$event.stopPropagation()"
                        title="Quitar contorno"
                      >
                        ✕
                      </button>
                    </div>

                    <!-- Add side button -->
                    <button class="btn-add-side no-print" (click)="openDishModal(day, 'lunchSides', 'Agregar Contorno', null)">
                      <app-icon name="plus" [size]="12"></app-icon>
                      <span>Contorno</span>
                    </button>

                  </div>
                </td>
              </tr>

              <!-- 4. OTROS / NOTAS -->
              <tr class="row-meal row-others">
                <td class="row-header">
                  <div class="meal-label-block">
                    <span class="meal-badge badge-purple">Otros</span>
                    <span class="meal-sub">Notas / Postres</span>
                  </div>
                </td>
                <td *ngFor="let day of [0,1,2,3,4,5,6]" class="meal-cell notes-cell">
                  <textarea
                    class="notes-input no-print"
                    rows="2"
                    [ngModel]="menu()?.days?.[day]?.other || ''"
                    (blur)="updateOtherNotes(day, $event)"
                    placeholder="Sopa, jugo, dulce..."
                  ></textarea>
                  <div class="print-only print-notes-text">
                    {{ menu()?.days?.[day]?.other || '' }}
                  </div>
                </td>
              </tr>

              <!-- 5. CENA -->
              <tr class="row-meal row-dinner" cdkDropListGroup>
                <td class="row-header">
                  <div class="meal-label-block">
                    <span class="meal-badge badge-blue">Cena</span>
                  </div>
                </td>
                <td
                  *ngFor="let day of [0,1,2,3,4,5,6]"
                  class="meal-cell slot-drop-target"
                  cdkDropList
                  [cdkDropListData]="{ day: day, slot: 'dinner' }"
                  (cdkDropListDropped)="onSingleSlotDrop($event)"
                  (click)="openDishModal(day, 'dinner', 'Cena', menu()?.days?.[day]?.dinner)"
                >
                  <div
                    class="cell-content draggable-dish"
                    *ngIf="menu()?.days?.[day]?.dinner as item; else emptyDinnerSlot"
                    cdkDrag
                    [cdkDragData]="{ day: day, slot: 'dinner', item: item }"
                  >
                    <div class="dish-title-row">
                      <div class="dish-drag-handle no-print" title="Arrastrar para mover o intercambiar">
                        <app-icon name="grip" [size]="12" extraClass="text-slate-400"></app-icon>
                      </div>
                      <span class="dish-name font-bold">{{ item.name }}</span>
                      <a
                        *ngIf="item.recipeUrl"
                        [href]="item.recipeUrl"
                        target="_blank"
                        (click)="$event.stopPropagation()"
                        (mousedown)="$event.stopPropagation()"
                        (touchstart)="$event.stopPropagation()"
                        class="recipe-link"
                        title="Ver Receta"
                      >
                        <app-icon name="external-link" [size]="12"></app-icon>
                      </a>
                    </div>
                    <div *ngIf="item.ingredients?.length" class="ingredients-summary no-print">
                      <span class="ing-count-chip chip-blue">{{ item.ingredients.length }} ing.</span>
                    </div>
                  </div>
                  <ng-template #emptyDinnerSlot>
                    <div class="cell-placeholder no-print">
                      <app-icon name="plus" [size]="14"></app-icon>
                      <span>Cena</span>
                    </div>
                  </ng-template>
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        <!-- MOBILE FLAT MEALS LIST (Clean flat layout with simple dividers) -->
        <div class="mobile-flat-view no-print">
          <!-- Flat Meals List for Selected Day -->
          <div class="mobile-meals-list">
            
            <!-- 1. DESAYUNO -->
            <div class="mobile-meal-row" (click)="openDishModal(selectedMobileDay, 'breakfast', 'Desayuno', menu()?.days?.[selectedMobileDay]?.breakfast)">
              <div class="meal-row-header">
                <span class="meal-badge badge-amber">Desayuno</span>
                <span *ngIf="menu()?.days?.[selectedMobileDay]?.breakfast?.ingredients?.length as count" class="ing-count-chip">
                  {{ count }} ing.
                </span>
              </div>
              <div class="meal-row-body" *ngIf="menu()?.days?.[selectedMobileDay]?.breakfast as item; else emptySlotBreakfast">
                <span class="dish-title-text">{{ item.name }}</span>
                <a *ngIf="item.recipeUrl" [href]="item.recipeUrl" target="_blank" (click)="$event.stopPropagation()" class="recipe-link" title="Ver Receta">
                  <app-icon name="external-link" [size]="14"></app-icon>
                </a>
              </div>
              <ng-template #emptySlotBreakfast>
                <div class="meal-row-placeholder">
                  <app-icon name="plus" [size]="14"></app-icon>
                  <span>Planificar Desayuno</span>
                </div>
              </ng-template>
            </div>

            <!-- 2. ALMUERZO (CONTIENE PRINCIPAL Y CONTORNOS) -->
            <div class="mobile-meal-group">
              <div class="mobile-meal-group-header">
                <span class="meal-badge badge-rose">Almuerzo</span>
              </div>

              <!-- 2a. Principal -->
              <div class="mobile-submeal-item" (click)="openDishModal(selectedMobileDay, 'lunchProtein', 'Almuerzo: Plato Principal', menu()?.days?.[selectedMobileDay]?.lunchProtein)">
                <div class="submeal-header">
                  <span class="submeal-tag">Principal:</span>
                  <span *ngIf="menu()?.days?.[selectedMobileDay]?.lunchProtein?.ingredients?.length as count" class="ing-count-chip chip-rose">
                    {{ count }} ing.
                  </span>
                </div>
                <div class="meal-row-body" *ngIf="menu()?.days?.[selectedMobileDay]?.lunchProtein as item; else emptySlotLunch">
                  <span class="dish-title-text">{{ item.name }}</span>
                  <a *ngIf="item.recipeUrl" [href]="item.recipeUrl" target="_blank" (click)="$event.stopPropagation()" class="recipe-link" title="Ver Receta">
                    <app-icon name="external-link" [size]="14"></app-icon>
                  </a>
                </div>
                <ng-template #emptySlotLunch>
                  <div class="meal-row-placeholder">
                    <app-icon name="plus" [size]="13"></app-icon>
                    <span>Asignar Principal</span>
                  </div>
                </ng-template>
              </div>

              <!-- 2b. Contornos -->
              <div class="mobile-submeal-item submeal-sides-item">
                <div class="submeal-header">
                  <span class="submeal-tag">Contornos:</span>
                  <span class="sides-counter-badge">{{ (menu()?.days?.[selectedMobileDay]?.lunchSides || []).length }} items</span>
                </div>
                <div
                  class="sides-flat-wrap"
                  cdkDropList
                  cdkDropListOrientation="horizontal"
                  [cdkDropListData]="{ day: selectedMobileDay, slot: 'lunchSides', items: menu()?.days?.[selectedMobileDay]?.lunchSides || [] }"
                  (cdkDropListDropped)="onSidesDrop($event)"
                >
                  <div
                    *ngFor="let side of menu()?.days?.[selectedMobileDay]?.lunchSides; let sIdx = index"
                    class="side-chip-flat draggable-side"
                    cdkDrag
                    [cdkDragData]="{ day: selectedMobileDay, slot: 'lunchSides', item: side, index: sIdx }"
                    (click)="openDishModal(selectedMobileDay, 'lunchSides', 'Contorno: ' + side.name, side, sIdx)"
                  >
                    <div *cdkDragPlaceholder class="side-drag-placeholder"></div>
                    <div class="side-drag-handle" title="Reordenar">
                      <app-icon name="grip" [size]="11" extraClass="text-emerald"></app-icon>
                    </div>
                    <span class="side-name">{{ side.name }}</span>
                    <a
                      *ngIf="side.recipeUrl"
                      [href]="side.recipeUrl"
                      target="_blank"
                      (click)="$event.stopPropagation()"
                      (mousedown)="$event.stopPropagation()"
                      (touchstart)="$event.stopPropagation()"
                      class="recipe-link"
                      title="Ver Receta"
                    >
                      <app-icon name="external-link" [size]="12"></app-icon>
                    </a>
                    <button
                      type="button"
                      class="btn-side-remove"
                      (click)="$event.stopPropagation(); removeSide(selectedMobileDay, sIdx)"
                      (mousedown)="$event.stopPropagation()"
                      (touchstart)="$event.stopPropagation()"
                      title="Quitar"
                    >
                      ✕
                    </button>
                  </div>

                  <button type="button" class="btn-add-side-flat" (click)="openDishModal(selectedMobileDay, 'lunchSides', 'Agregar Contorno', null)">
                    <app-icon name="plus" [size]="13"></app-icon>
                    <span>Añadir Contorno</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- 4. OTROS / NOTAS -->
            <div class="mobile-meal-row mobile-notes-row">
              <div class="meal-row-header">
                <span class="meal-badge badge-purple">Notas / Otros</span>
              </div>
              <div class="meal-row-body">
                <textarea
                  class="flat-notes-textarea"
                  rows="2"
                  [ngModel]="menu()?.days?.[selectedMobileDay]?.other || ''"
                  (blur)="updateOtherNotes(selectedMobileDay, $event)"
                  placeholder="Sopa, jugo, dulce o notas del día..."
                ></textarea>
              </div>
            </div>

            <!-- 5. CENA -->
            <div class="mobile-meal-row last-row" (click)="openDishModal(selectedMobileDay, 'dinner', 'Cena', menu()?.days?.[selectedMobileDay]?.dinner)">
              <div class="meal-row-header">
                <span class="meal-badge badge-blue">Cena</span>
                <span *ngIf="menu()?.days?.[selectedMobileDay]?.dinner?.ingredients?.length as count" class="ing-count-chip chip-blue">
                  {{ count }} ing.
                </span>
              </div>
              <div class="meal-row-body" *ngIf="menu()?.days?.[selectedMobileDay]?.dinner as item; else emptySlotDinner">
                <span class="dish-title-text">{{ item.name }}</span>
                <a *ngIf="item.recipeUrl" [href]="item.recipeUrl" target="_blank" (click)="$event.stopPropagation()" class="recipe-link" title="Ver Receta">
                  <app-icon name="external-link" [size]="14"></app-icon>
                </a>
              </div>
              <ng-template #emptySlotDinner>
                <div class="meal-row-placeholder">
                  <app-icon name="plus" [size]="14"></app-icon>
                  <span>Planificar Cena</span>
                </div>
              </ng-template>
            </div>

          </div>
        </div>

      </div>

      <!-- Dish Selection & Ingredient Editor Modal -->
      <app-dish-modal
        *ngIf="showModal"
        [dayIndex]="selectedDayIndex"
        [dayName]="menuService.dayNames[selectedDayIndex]"
        [slotType]="selectedSlotType"
        [slotTitle]="selectedSlotTitle"
        [existingItem]="selectedExistingItem"
        (save)="onSaveModalDish($event)"
        (clear)="onClearModalSlot()"
        (close)="showModal = false"
      ></app-dish-modal>

      <!-- Toast Notification for Shopping Sync -->
      <div *ngIf="showToast" class="toast-popup animate-fade">
        <app-icon name="check" [size]="18"></app-icon>
        <span>{{ toastMessage }}</span>
      </div>

    </div>
  `,
  styles: [`
    .weekly-menu-page {
      display: flex;
      flex-direction: column;
      gap: 0;
      padding: 0;
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }

    .top-nav-bar {
      display: flex;
      flex-direction: column;
      background: #ffffff;
      padding: 12px 14px;
      border: none;
      border-bottom: 1px solid var(--border-color);
      border-radius: 0;
      box-shadow: none;
      width: 100%;
      box-sizing: border-box;
      gap: 10px;
    }

    .week-header-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
      width: 100%;
    }

    .week-controls {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .nav-btn {
      width: 20px;
      height: 32px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      color: #475569;
      font-weight: bold;
      border: none;
      cursor: pointer;
      transition: all 0.12s ease;
    }
    .nav-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    .nav-btn:active {
      color: #059669;
      transform: scale(0.92);
    }

    .week-title-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 6px;
      background: transparent;
      border: none;
      border-radius: 0;
    }

    .text-emerald { color: #059669; }

    .week-title-text {
      font-family: var(--font-display);
      font-size: 0.95rem;
      font-weight: 700;
      color: #065f46;
    }

    .print-only {
      display: none !important;
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-action {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      border: none;
    }

    .btn-sync-shopping {
      background: #10b981;
      color: #ffffff;
      box-shadow: none;
    }
    .btn-sync-shopping:hover {
      background: #059669;
    }

    .btn-print {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      color: #334155;
    }
    .btn-print:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    /* Table Styles */
    .table-card-wrapper {
      background: transparent;
      border-radius: 0;
      border: none;
      box-shadow: none;
      overflow: hidden;
    }

    .table-responsive {
      overflow-x: auto;
      width: 100%;
    }

    .desktop-table-view .menu-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      min-width: 850px;
    }

    .menu-table th,
    .menu-table td {
      border: 1px solid #e2e8f0;
      padding: 8px;
      vertical-align: top;
      box-sizing: border-box;
    }

    .col-section-header {
      width: 130px;
      background: #f8fafc;
      font-size: 0.85rem;
      font-weight: 700;
      color: #475569;
      text-align: center;
      padding: 12px 8px;
    }

    .col-day-header {
      background: #f8fafc;
      padding: 10px 6px;
      text-align: center;
    }
    .col-day-header.is-today {
      background: #ecfdf5;
      border-bottom: 2px solid #10b981;
    }

    .day-header-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .day-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: #1e293b;
    }

    .day-date {
      font-size: 0.75rem;
      color: #64748b;
    }

    .row-header {
      background: #fafafa;
      text-align: center;
      vertical-align: middle !important;
    }

    .meal-label-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .meal-badge {
      font-size: 0.8rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .meal-sub {
      font-size: 0.7rem;
      color: #64748b;
      font-weight: 600;
    }

    .meal-cell {
      cursor: pointer;
      transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
      min-height: 70px;
      background: #ffffff;
      text-align: left;
    }
    .meal-cell:hover {
      background: #f0fdf4;
    }

    .cell-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      height: 100%;
      width: 100%;
      text-align: left;
    }

    .dish-title-row {
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      gap: 6px;
      width: 100%;
      text-align: left;
    }

    .dish-name {
      font-size: 0.88rem;
      color: #0f172a;
      font-weight: 600;
      line-height: 1.25;
      word-break: break-word;
      text-align: left;
      flex: 1;
    }

    .font-bold { font-weight: 700; }

    .recipe-link {
      color: #059669;
      padding: 2px;
      border-radius: 4px;
      background: #d1fae5;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      margin-left: auto;
    }
    .recipe-link:hover {
      background: #a7f3d0;
    }

    .ingredients-summary {
      margin-top: auto;
    }

    .ing-count-chip {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 600;
      background: #f1f5f9;
      color: #475569;
      padding: 1px 6px;
      border-radius: 4px;
    }
    .chip-rose { background: #ffe4e6; color: #9f1239; }
    .chip-blue { background: #dbeafe; color: #1e40af; }

    .cell-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      height: 100%;
      min-height: 50px;
      color: #94a3b8;
      font-size: 0.8rem;
      border: 1px dashed #e2e8f0;
      border-radius: 6px;
      padding: 4px;
      transition: all 0.15s;
    }
    .cell-placeholder:hover {
      border-color: #10b981;
      color: #10b981;
      background: #ffffff;
    }

    /* Sides specific */
    .sides-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 100%;
      box-sizing: border-box;
    }

    .side-chip-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 6px;
      padding: 4px 6px;
      font-size: 0.8rem;
      color: #065f46;
      font-weight: 600;
      gap: 4px;
      width: 100%;
      box-sizing: border-box;
    }
    .side-chip-item:hover {
      background: #d1fae5;
    }

    .side-chip-content {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
      min-width: 0;
    }

    .side-name {
      white-space: normal;
      word-break: break-word;
      line-height: 1.2;
    }

    .btn-side-remove {
      color: #ef4444;
      font-size: 0.85rem;
      font-weight: bold;
      padding: 2px 4px;
      border-radius: 4px;
      flex-shrink: 0;
      background: transparent;
      border: none;
      cursor: pointer;
    }
    .btn-side-remove:hover {
      background: #fee2e2;
    }

    .btn-add-side {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 4px 6px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #059669;
      background: #ffffff;
      border: 1px dashed #a7f3d0;
      border-radius: 6px;
      margin-top: 2px;
      cursor: pointer;
    }
    .btn-add-side:hover {
      background: #ecfdf5;
    }

    /* Notes / Others */
    .notes-input {
      width: 100%;
      border: none;
      background: transparent;
      resize: none;
      font-size: 0.8rem;
      color: #334155;
      outline: none;
      line-height: 1.3;
      box-sizing: border-box;
    }
    .notes-input:focus {
      background: #f8fafc;
      border-radius: 4px;
    }

    .print-sub {
      font-size: 9pt;
      color: #475569;
      margin-bottom: 6px;
    }

    .print-notes-text {
      font-size: 7.5pt;
      color: #334155;
    }

    /* Mobile Day Selector Bar with Left/Right Navigation Arrows */
    .mobile-day-selector {
      display: none;
      align-items: center;
      justify-content: space-between;
      gap: 2px;
      padding: 4px 0 0;
      margin-bottom: 2px;
      width: 100%;
      box-sizing: border-box;
    }

    .day-arrow-nav-btn {
      width: 20px;
      height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: 4px;
      color: #64748b;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.12s ease;
      padding: 0;
    }
    .day-arrow-nav-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    .day-arrow-nav-btn:active {
      color: #059669;
      background: transparent;
      transform: scale(0.92);
    }

    .mobile-day-tabs-container {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      flex: 1;
      gap: 0;
      align-items: center;
      width: 100%;
      overflow: hidden;
    }

    .mobile-day-tab {
      width: 100%;
      min-width: 0;
      padding: 4px 0;
      background: transparent;
      border: none;
      border-bottom: 2.5px solid transparent;
      border-radius: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .mobile-day-tab.active {
      border-bottom-color: #10b981;
      background: transparent;
      box-shadow: none;
    }
    .mobile-day-tab.active .mobile-day-short {
      color: #065f46;
      font-weight: 800;
    }
    .mobile-day-tab.active .mobile-day-mini-date {
      color: #059669;
      font-weight: 700;
    }

    .mobile-day-short {
      font-size: 0.76rem;
      font-weight: 700;
      color: #64748b;
      text-transform: capitalize;
    }

    .mobile-day-mini-date {
      font-size: 0.65rem;
      color: #94a3b8;
    }

    /* Mobile Flat View with Simple Dividers */
    .mobile-flat-view {
      display: none;
      width: 100%;
      box-sizing: border-box;
      flex-direction: column;
      background: #ffffff;
      border: none;
      border-radius: 0;
      overflow: hidden;
    }

    .mobile-meals-list {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .mobile-meal-group {
      display: flex;
      flex-direction: column;
      border-bottom: 1px solid #f1f5f9;
      background: #ffffff;
      gap: 2px;
    }

    .mobile-meal-group-header {
      padding: 10px 14px 4px;
      display: flex;
      align-items: center;
    }

    .mobile-submeal-item {
      padding: 6px 14px 10px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      cursor: pointer;
      transition: background 0.12s;
    }
    .mobile-submeal-item:active {
      background: #f8fafc;
    }

    .submeal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .submeal-tag {
      font-size: 0.82rem;
      font-weight: 700;
      color: #475569;
    }

    .mobile-meal-row {
      padding: 12px 14px;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      flex-direction: column;
      gap: 6px;
      cursor: pointer;
      transition: background 0.12s;
      background: #ffffff;
    }
    .mobile-meal-row:active {
      background: #f8fafc;
    }
    .mobile-meal-row.last-row {
      border-bottom: none;
    }

    .meal-row-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .meal-row-body {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dish-title-text {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.3;
    }

    .meal-row-placeholder {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #94a3b8;
      font-size: 0.86rem;
      font-weight: 500;
      padding: 2px 0;
    }

    .sides-counter-badge {
      font-size: 0.74rem;
      font-weight: 600;
      color: #059669;
      background: #ecfdf5;
      padding: 2px 8px;
      border-radius: 9999px;
    }

    .sides-flat-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
    }

    .side-chip-flat {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 8px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 6px;
      color: #065f46;
      font-size: 0.82rem;
      font-weight: 600;
    }

    .btn-add-side-flat {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 6px;
      color: #059669;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-add-side-flat:hover {
      background: #ecfdf5;
    }

    .flat-notes-textarea {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 0.85rem;
      font-family: inherit;
      color: #334155;
      background: #f8fafc;
      outline: none;
      resize: vertical;
    }
    .flat-notes-textarea:focus {
      border-color: #8b5cf6;
      background: #ffffff;
    }

    /* Media queries for Mobile vs Desktop (Screen only) */
    @media screen and (max-width: 768px) {
      .desktop-table-view {
        display: none !important;
      }
      .mobile-flat-view {
        display: flex !important;
      }
      .mobile-day-selector {
        display: flex !important;
      }

      .top-nav-bar {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }

      .week-header-top-row {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
        width: 100%;
      }

      .week-controls {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2px;
        box-sizing: border-box;
      }

      .nav-btn {
        flex-shrink: 0;
        width: 20px;
        height: 36px;
      }

      .week-title-badge {
        flex: 1;
        justify-content: center;
        padding: 4px 0;
        box-sizing: border-box;
      }

      .week-title-text {
        font-size: 0.9rem;
      }

      .top-actions {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        box-sizing: border-box;
      }

      .btn-action {
        font-size: 0.84rem;
        padding: 8px 14px;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    }

    /* Print mode: Always print the full 7-day table on 1 sheet (Strictly Black & White) */
    @media print {
      .mobile-flat-view,
      .mobile-day-selector,
      .no-print {
        display: none !important;
      }

      .print-only {
        display: block !important;
      }

      .weekly-menu-page,
      .table-card-wrapper,
      .table-responsive {
        border: none !important;
        box-shadow: none !important;
        background: transparent !important;
        overflow: visible !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
      }

      .desktop-table-view {
        display: block !important;
        width: 100% !important;
        overflow: visible !important;
      }

      .desktop-table-view .menu-table {
        min-width: 0 !important;
        width: 100% !important;
        table-layout: fixed !important;
        border-collapse: collapse !important;
        background: #ffffff !important;
        border: 1.5px solid #000000 !important;
      }

      .menu-table th,
      .menu-table td {
        border: 1px solid #000000 !important;
        background: #ffffff !important;
        color: #000000 !important;
      }

      .meal-badge {
        background: transparent !important;
        color: #000000 !important;
        border: none !important;
        padding: 0 !important;
        font-weight: bold !important;
      }

      .side-chip-item {
        background: transparent !important;
        border: none !important;
        padding: 0 !important;
        color: #000000 !important;
      }
    }

    /* Toast */
    .toast-popup {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #065f46;
      color: #ffffff;
      padding: 12px 18px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      box-shadow: var(--shadow-xl);
      z-index: 10000;
    }

    /* Drag & Drop Styles */
    .dish-drag-handle,
    .side-drag-handle {
      cursor: grab;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      padding: 2px 3px;
      border-radius: 4px;
      transition: all 0.15s ease;
      flex-shrink: 0;
      touch-action: none;
    }
    .dish-drag-handle:hover,
    .side-drag-handle:hover {
      color: #059669;
      background: #f1f5f9;
    }
    .dish-drag-handle:active,
    .side-drag-handle:active {
      cursor: grabbing;
    }

    .draggable-dish,
    .draggable-side {
      cursor: grab;
      user-select: none;
      -webkit-user-select: none;
    }
    .draggable-dish:active,
    .draggable-side:active {
      cursor: grabbing;
    }

    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 8px;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22), 0 4px 10px rgba(0, 0, 0, 0.1);
      background: #ffffff;
      opacity: 0.96;
      transform: scale(1.02);
      z-index: 10000;
    }

    .cdk-drag-preview.draggable-dish {
      padding: 8px 10px;
      border: 2px solid #10b981;
      min-width: 140px;
      max-width: 220px;
    }

    .cdk-drag-preview.side-chip-item,
    .cdk-drag-preview.side-chip-flat {
      background: #ecfdf5;
      border: 1.5px solid #059669;
      padding: 5px 8px;
      color: #065f46;
      font-weight: 600;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Hide duplicate placeholder box in single slot drop targets */
    .slot-drop-target .cdk-drag-placeholder {
      display: none !important;
    }

    .side-drag-placeholder {
      min-height: 26px;
      border: 1.5px dashed #059669;
      background: #ecfdf5;
      border-radius: 6px;
      opacity: 0.7;
      margin: 2px 0;
      box-sizing: border-box;
    }

    .cdk-drag-animating,
    .cdk-drag-preview.cdk-drag-animating {
      transition: none !important;
      animation: none !important;
    }

    .cdk-drop-list-dragging .side-chip-item:not(.cdk-drag-placeholder),
    .cdk-drop-list-dragging .draggable-dish:not(.cdk-drag-placeholder) {
      transition: transform 200ms cubic-bezier(0, 0, 0.2, 1);
    }

    .slot-drop-target.cdk-drop-list-receiving {
      background-color: #ecfdf5 !important;
      outline: 2px solid #10b981 !important;
      outline-offset: -2px;
    }

    .slot-drop-target.cdk-drop-list-receiving .cell-placeholder {
      border-color: #10b981 !important;
      color: #059669 !important;
      background: #ffffff !important;
    }

    .sides-drop-list.cdk-drop-list-receiving {
      background-color: #f0fdf4 !important;
      outline: 1.5px dashed #10b981;
      outline-offset: -1px;
      border-radius: 6px;
    }

    .sides-drop-list {
      min-height: 52px;
    }
  `]
})
export class WeeklyMenuComponent {
  menuService = inject(MenuService);
  private shoppingService = inject(ShoppingService);
  private syncService = inject(SyncService);

  menu = this.menuService.currentMenu;

  // Selected Day for Mobile 2-column View (0 = Domingo ... 6 = Sábado)
  selectedMobileDay = new Date().getDay();

  // Modal State
  showModal = false;
  selectedDayIndex = 0;
  selectedSlotType: 'breakfast' | 'lunchProtein' | 'lunchSides' | 'dinner' = 'lunchProtein';
  selectedSlotTitle = 'Almuerzo Principal';
  selectedExistingItem: PlannedDishItem | null = null;
  selectedSideIndex?: number;

  // Toast
  showToast = false;
  toastMessage = '';

  prevWeek(): void {
    this.menuService.previousWeek();
  }

  nextWeek(): void {
    this.menuService.nextWeek();
  }

  goToCurrentWeek(): void {
    this.menuService.currentWeek();
    this.selectedMobileDay = new Date().getDay();
  }

  selectMobileDay(d: number): void {
    this.selectedMobileDay = d;
  }

  prevMobileDay(): void {
    if (this.selectedMobileDay > 0) {
      this.selectedMobileDay--;
    } else {
      this.prevWeek();
      this.selectedMobileDay = 6;
    }
  }

  nextMobileDay(): void {
    if (this.selectedMobileDay < 6) {
      this.selectedMobileDay++;
    } else {
      this.nextWeek();
      this.selectedMobileDay = 0;
    }
  }

  getPrintTitle(): string {
    const currentWeekStart = this.menuService.currentWeekStartDate();
    if (!currentWeekStart) return 'Planificación de Menú';
    const parts = currentWeekStart.split('-').map(Number);
    const sunday = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    return `Semana del ${this.menuService.formatDisplayDate(sunday)}`;
  }

  isToday(dayIndex: number): boolean {
    const today = new Date();
    const currentWeekStart = this.menuService.currentWeekStartDate();
    if (!currentWeekStart) return false;
    const parts = currentWeekStart.split('-').map(Number);
    const sunday = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    const dayDate = new Date(sunday);
    dayDate.setDate(sunday.getDate() + dayIndex);

    return dayDate.toDateString() === today.toDateString();
  }

  getDayDateFormatted(dayIndex: number): string {
    const currentWeekStart = this.menuService.currentWeekStartDate();
    if (!currentWeekStart) return '';

    const parts = currentWeekStart.split('-').map(Number);
    const sunday = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    const dayDate = new Date(sunday);
    dayDate.setDate(sunday.getDate() + dayIndex);

    const d = String(dayDate.getDate()).padStart(2, '0');
    const m = String(dayDate.getMonth() + 1).padStart(2, '0');
    return `${d}/${m}`;
  }

  openDishModal(
    dayIndex: number,
    slotType: 'breakfast' | 'lunchProtein' | 'lunchSides' | 'dinner',
    slotTitle: string,
    existingItem: PlannedDishItem | null = null,
    sideIndex?: number
  ): void {
    this.selectedDayIndex = dayIndex;
    this.selectedSlotType = slotType;
    this.selectedSlotTitle = slotTitle;
    this.selectedExistingItem = existingItem;
    this.selectedSideIndex = sideIndex;
    this.showModal = true;
  }

  async onSaveModalDish(item: PlannedDishItem): Promise<void> {
    if (this.selectedSlotType === 'lunchSides') {
      if (this.selectedSideIndex !== undefined && this.selectedSideIndex >= 0) {
        // Replace existing side
        const menu = this.menu();
        if (menu && menu.days[this.selectedDayIndex]?.lunchSides) {
          menu.days[this.selectedDayIndex].lunchSides[this.selectedSideIndex] = item;
          await this.menuService.saveCurrentMenu(menu);
        }
      } else {
        // Add new side
        await this.menuService.addLunchSide(this.selectedDayIndex, item);
      }
    } else {
      await this.menuService.setDaySlot(this.selectedDayIndex, this.selectedSlotType, item);
    }
    this.showModal = false;
    await this.shoppingService.syncWithMenu();
  }

  async onClearModalSlot(): Promise<void> {
    if (this.selectedSlotType === 'lunchSides' && this.selectedSideIndex !== undefined) {
      await this.menuService.removeLunchSide(this.selectedDayIndex, this.selectedSideIndex);
    } else if (this.selectedSlotType !== 'lunchSides') {
      await this.menuService.setDaySlot(this.selectedDayIndex, this.selectedSlotType, null);
    }
    this.showModal = false;
    await this.shoppingService.syncWithMenu();
  }

  async removeSide(dayIndex: number, sideIndex: number): Promise<void> {
    await this.menuService.removeLunchSide(dayIndex, sideIndex);
  }

  async updateOtherNotes(dayIndex: number, event: any): Promise<void> {
    const value = (event.target as HTMLTextAreaElement).value;
    await this.menuService.setDaySlot(dayIndex, 'lunchOther', value);
  }

  async onSingleSlotDrop(event: CdkDragDrop<any>): Promise<void> {
    const fromDay = event.previousContainer.data.day;
    const toDay = event.container.data.day;
    const slot = event.container.data.slot as 'breakfast' | 'lunchProtein' | 'dinner';

    if (fromDay === toDay) return;

    const currentMenu = this.menu();
    if (!currentMenu) return;

    const updatedMenu = JSON.parse(JSON.stringify(currentMenu)) as WeeklyMenu;

    if (!updatedMenu.days[fromDay]) {
      updatedMenu.days[fromDay] = { breakfast: null, lunchProtein: null, lunchSides: [], dinner: null };
    }
    if (!updatedMenu.days[toDay]) {
      updatedMenu.days[toDay] = { breakfast: null, lunchProtein: null, lunchSides: [], dinner: null };
    }

    const sourceItem = updatedMenu.days[fromDay][slot];
    const targetItem = updatedMenu.days[toDay][slot];

    // If target is empty, it moves it; if target is occupied, it swaps them
    updatedMenu.days[toDay][slot] = sourceItem;
    updatedMenu.days[fromDay][slot] = targetItem;

    await this.menuService.saveCurrentMenu(updatedMenu);
  }

  async onSidesDrop(event: CdkDragDrop<any>): Promise<void> {
    const fromDay = event.previousContainer.data.day;
    const toDay = event.container.data.day;

    const currentMenu = this.menu();
    if (!currentMenu) return;

    const updatedMenu = JSON.parse(JSON.stringify(currentMenu)) as WeeklyMenu;

    if (!updatedMenu.days[fromDay]) {
      updatedMenu.days[fromDay] = { breakfast: null, lunchProtein: null, lunchSides: [], dinner: null };
    }
    if (!updatedMenu.days[toDay]) {
      updatedMenu.days[toDay] = { breakfast: null, lunchProtein: null, lunchSides: [], dinner: null };
    }
    if (!updatedMenu.days[fromDay].lunchSides) updatedMenu.days[fromDay].lunchSides = [];
    if (!updatedMenu.days[toDay].lunchSides) updatedMenu.days[toDay].lunchSides = [];

    if (event.previousContainer === event.container) {
      if (event.previousIndex !== event.currentIndex) {
        moveItemInArray(
          updatedMenu.days[fromDay].lunchSides,
          event.previousIndex,
          event.currentIndex
        );
        await this.menuService.saveCurrentMenu(updatedMenu);
      }
    } else {
      transferArrayItem(
        updatedMenu.days[fromDay].lunchSides,
        updatedMenu.days[toDay].lunchSides,
        event.previousIndex,
        event.currentIndex
      );
      await this.menuService.saveCurrentMenu(updatedMenu);
    }
  }

  async syncShoppingList(): Promise<void> {
    await this.shoppingService.syncWithMenu();
    this.showNotification('¡Lista de compras actualizada con los ingredientes de esta semana!');
  }

  printMenu(): void {
    window.print();
  }

  showNotification(msg: string): void {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3500);
  }
}
