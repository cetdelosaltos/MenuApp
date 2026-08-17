import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../services/menu.service';
import { ShoppingService } from '../services/shopping.service';
import { SyncService } from '../services/sync.service';
import { WeeklyMenu, PlannedDishItem } from '../models/types';
import { DishModalComponent } from './dish-modal.component';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-weekly-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, DishModalComponent, IconComponent],
  template: `
    <div class="weekly-menu-page animate-fade">
      
      <!-- Top Actions & Week Navigation Bar (Hidden on print) -->
      <div class="top-nav-bar no-print">
        
        <!-- Week Navigation Controls -->
        <div class="week-controls">
          <button class="nav-btn" (click)="prevWeek()" title="Semana Anterior">
            <app-icon name="chevron-left" [size]="20"></app-icon>
          </button>
          
          <div class="week-title-badge">
            <app-icon name="calendar" [size]="18" extraClass="text-emerald"></app-icon>
            <span class="week-title-text">{{ menu()?.title || 'Cargando Semana...' }}</span>
          </div>

          <button class="nav-btn" (click)="nextWeek()" title="Semana Siguiente">
            <app-icon name="chevron-right" [size]="20"></app-icon>
          </button>

          <button class="btn-today" (click)="goToCurrentWeek()" title="Ir a la Semana Actual">
            Hoy
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
            <span>Imprimir Hoja Carta</span>
          </button>
        </div>

      </div>

      <!-- PRINT-ONLY HEADER -->
      <div class="print-only print-title-header">
        <h1>{{ menu()?.title }}</h1>
        <p class="print-sub">Planificación de Menú Familiar Semanal</p>
      </div>

      <!-- MAIN INTERACTIVE WEEKLY TABLE -->
      <div class="table-card-wrapper">
        <div class="table-responsive">
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
              <tr class="row-meal row-breakfast">
                <td class="row-header">
                  <div class="meal-label-block">
                    <span class="meal-badge badge-amber">Desayuno</span>
                  </div>
                </td>
                <td *ngFor="let day of [0,1,2,3,4,5,6]" class="meal-cell" (click)="openDishModal(day, 'breakfast', 'Desayuno', menu()?.days?.[day]?.breakfast)">
                  <div class="cell-content" *ngIf="menu()?.days?.[day]?.breakfast as item; else emptySlot">
                    <div class="dish-title-row">
                      <span class="dish-name">{{ item.name }}</span>
                      <a *ngIf="item.recipeUrl" [href]="item.recipeUrl" target="_blank" (click)="$event.stopPropagation()" class="recipe-link" title="Ver Receta">
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
              <tr class="row-meal row-lunch-protein">
                <td class="row-header">
                  <div class="meal-label-block">
                    <span class="meal-badge badge-rose">Almuerzo</span>
                    <span class="meal-sub">Principal / Proteína</span>
                  </div>
                </td>
                <td *ngFor="let day of [0,1,2,3,4,5,6]" class="meal-cell" (click)="openDishModal(day, 'lunchProtein', 'Almuerzo Principal (Proteína)', menu()?.days?.[day]?.lunchProtein)">
                  <div class="cell-content" *ngIf="menu()?.days?.[day]?.lunchProtein as item; else emptySlot">
                    <div class="dish-title-row">
                      <span class="dish-name font-bold">{{ item.name }}</span>
                      <a *ngIf="item.recipeUrl" [href]="item.recipeUrl" target="_blank" (click)="$event.stopPropagation()" class="recipe-link" title="Ver Receta">
                        <app-icon name="external-link" [size]="12"></app-icon>
                      </a>
                    </div>
                    <div *ngIf="item.ingredients?.length" class="ingredients-summary no-print">
                      <span class="ing-count-chip chip-rose">{{ item.ingredients.length }} ingredientes</span>
                    </div>
                  </div>
                  <ng-template #emptySlot>
                    <div class="cell-placeholder no-print">
                      <app-icon name="plus" [size]="14"></app-icon>
                      <span>Proteína</span>
                    </div>
                  </ng-template>
                </td>
              </tr>

              <!-- 3. ALMUERZO CONTORNOS -->
              <tr class="row-meal row-lunch-sides">
                <td class="row-header">
                  <div class="meal-label-block">
                    <span class="meal-badge badge-emerald">Contornos</span>
                    <span class="meal-sub">Acompañantes</span>
                  </div>
                </td>
                <td *ngFor="let day of [0,1,2,3,4,5,6]" class="meal-cell sides-cell">
                  <div class="sides-container">
                    
                    <!-- Listed sides -->
                    <div
                      *ngFor="let side of menu()?.days?.[day]?.lunchSides; let sIdx = index"
                      class="side-chip-item"
                      (click)="openDishModal(day, 'lunchSides', 'Contorno: ' + side.name, side, sIdx)"
                    >
                      <div class="side-chip-content">
                        <span class="side-name">{{ side.name }}</span>
                        <a *ngIf="side.recipeUrl" [href]="side.recipeUrl" target="_blank" (click)="$event.stopPropagation()" class="recipe-link" title="Ver Receta">
                          <app-icon name="external-link" [size]="11"></app-icon>
                        </a>
                      </div>
                      <button class="btn-side-remove no-print" (click)="$event.stopPropagation(); removeSide(day, sIdx)" title="Quitar contorno">
                        ✕
                      </button>
                    </div>

                    <!-- Add side button -->
                    <button class="btn-add-side no-print" (click)="openDishModal(day, 'lunchSides', 'Agregar Contorno', null)">
                      <app-icon name="plus" [size]="12"></app-icon>
                      <span>+ Contorno</span>
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
              <tr class="row-meal row-dinner">
                <td class="row-header">
                  <div class="meal-label-block">
                    <span class="meal-badge badge-blue">Cena</span>
                  </div>
                </td>
                <td *ngFor="let day of [0,1,2,3,4,5,6]" class="meal-cell" (click)="openDishModal(day, 'dinner', 'Cena', menu()?.days?.[day]?.dinner)">
                  <div class="cell-content" *ngIf="menu()?.days?.[day]?.dinner as item; else emptySlot">
                    <div class="dish-title-row">
                      <span class="dish-name">{{ item.name }}</span>
                      <a *ngIf="item.recipeUrl" [href]="item.recipeUrl" target="_blank" (click)="$event.stopPropagation()" class="recipe-link" title="Ver Receta">
                        <app-icon name="external-link" [size]="12"></app-icon>
                      </a>
                    </div>
                    <div *ngIf="item.ingredients?.length" class="ingredients-summary no-print">
                      <span class="ing-count-chip chip-blue">{{ item.ingredients.length }} ing.</span>
                    </div>
                  </div>
                  <ng-template #emptySlot>
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
      gap: 16px;
      padding: 4px;
    }

    /* Top Navigation Bar */
    .top-nav-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      background: #ffffff;
      padding: 12px 18px;
      border-radius: 16px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
    }

    .week-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
      color: #334155;
      font-weight: bold;
    }
    .nav-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .week-title-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 12px;
    }

    .text-emerald { color: #059669; }

    .week-title-text {
      font-family: var(--font-display);
      font-size: 1.05rem;
      font-weight: 700;
      color: #065f46;
    }

    .btn-today {
      padding: 6px 14px;
      background: #f1f5f9;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 700;
      color: #475569;
    }
    .btn-today:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-action {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 600;
    }

    .btn-sync-shopping {
      background: #10b981;
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
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
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .menu-table {
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
      transition: background-color 0.15s ease;
      min-height: 70px;
      background: #ffffff;
    }
    .meal-cell:hover {
      background: #f0fdf4;
    }

    .cell-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      height: 100%;
    }

    .dish-title-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 4px;
    }

    .dish-name {
      font-size: 0.88rem;
      color: #0f172a;
      font-weight: 600;
      line-height: 1.25;
    }

    .font-bold { font-weight: 700; }

    .recipe-link {
      color: #059669;
      padding: 2px;
      border-radius: 4px;
      background: #d1fae5;
      display: flex;
      align-items: center;
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
    }

    .side-chip-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 6px;
      padding: 3px 6px;
      font-size: 0.8rem;
      color: #065f46;
      font-weight: 600;
      gap: 4px;
    }
    .side-chip-item:hover {
      background: #d1fae5;
    }

    .side-chip-content {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .btn-side-remove {
      color: #ef4444;
      font-size: 0.75rem;
      font-weight: bold;
      padding: 0 3px;
      border-radius: 3px;
    }
    .btn-side-remove:hover {
      background: #fee2e2;
    }

    .btn-add-side {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 3px 6px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #059669;
      background: #ffffff;
      border: 1px dashed #a7f3d0;
      border-radius: 6px;
      margin-top: 2px;
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
  `]
})
export class WeeklyMenuComponent {
  menuService = inject(MenuService);
  private shoppingService = inject(ShoppingService);
  private syncService = inject(SyncService);

  menu = this.menuService.currentMenu;

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
  }

  isToday(dayIndex: number): boolean {
    const today = new Date();
    const currentWeekStart = this.menuService.currentWeekStartDate();
    const sunday = new Date(currentWeekStart + 'T00:00:00');
    const dayDate = new Date(sunday);
    dayDate.setDate(sunday.getDate() + dayIndex);

    return dayDate.toDateString() === today.toDateString();
  }

  getDayDateFormatted(dayIndex: number): string {
    const currentWeekStart = this.menuService.currentWeekStartDate();
    if (!currentWeekStart) return '';

    const parts = currentWeekStart.split('-').map(Number);
    const sunday = new Date(parts[0], parts[1] - 1, parts[2]);
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
  }

  async onClearModalSlot(): Promise<void> {
    if (this.selectedSlotType === 'lunchSides' && this.selectedSideIndex !== undefined) {
      await this.menuService.removeLunchSide(this.selectedDayIndex, this.selectedSideIndex);
    } else if (this.selectedSlotType !== 'lunchSides') {
      await this.menuService.setDaySlot(this.selectedDayIndex, this.selectedSlotType, null);
    }
    this.showModal = false;
  }

  async removeSide(dayIndex: number, sideIndex: number): Promise<void> {
    await this.menuService.removeLunchSide(dayIndex, sideIndex);
  }

  async updateOtherNotes(dayIndex: number, event: any): Promise<void> {
    const value = (event.target as HTMLTextAreaElement).value;
    await this.menuService.setDaySlot(dayIndex, 'lunchOther', value);
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
