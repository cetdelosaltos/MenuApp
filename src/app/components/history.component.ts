import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../services/firestore.service';
import { MenuService } from '../services/menu.service';
import { WeeklyMenu } from '../models/types';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="history-page animate-fade">
      
      <div class="history-header">
        <div>
          <h2 class="section-title">Historial de Semanas</h2>
          <p class="section-sub">Consulta menús planificados anteriormente o duplícalos a la semana actual.</p>
        </div>
        <span class="badge badge-emerald">{{ menus().length }} semanas registradas</span>
      </div>

      <div class="menus-grid">
        <div *ngFor="let m of menus()" class="menu-card">
          
          <div class="menu-card-header">
            <div class="menu-title-wrap">
              <app-icon name="calendar" [size]="18" extraClass="text-emerald"></app-icon>
              <h3 class="menu-card-title">{{ m.title }}</h3>
            </div>
            <span class="badge badge-gray">{{ m.weekStartDate }}</span>
          </div>

          <div class="menu-card-body">
            <div *ngFor="let day of [0,1,2,3,4,5,6]" class="history-day-row">
              <span class="day-short">{{ menuService.dayNames[day].substring(0, 3) }}:</span>
              <div class="day-dishes">
                <span *ngIf="m.days?.[day]?.lunchProtein" class="history-dish protein-tag">
                  {{ m.days[day].lunchProtein?.name }}
                </span>
                <span *ngFor="let side of m.days?.[day]?.lunchSides" class="history-dish side-tag">
                  {{ side.name }}
                </span>
                <span *ngIf="!m.days?.[day]?.lunchProtein && (!m.days?.[day]?.lunchSides || m.days[day].lunchSides.length === 0)" class="no-plan">
                  Sin planificar
                </span>
              </div>
            </div>
          </div>

          <div class="menu-card-footer">
            <button class="btn-load-week" (click)="loadWeek(m.weekStartDate)">
              <app-icon name="edit" [size]="15"></app-icon> Abrir Esta Semana
            </button>
            <button class="btn-clone-week" (click)="cloneToCurrent(m)">
              <app-icon name="refresh" [size]="15"></app-icon> Copiar a Semana Actual
            </button>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .history-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 4px;
    }

    .history-header {
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

    .menus-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 16px;
    }

    .menu-card {
      background: #ffffff;
      border-radius: 14px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .menu-card-header {
      padding: 12px 16px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .menu-title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .text-emerald { color: #059669; }

    .menu-card-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #1e293b;
    }

    .menu-card-body {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }

    .history-day-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
      font-size: 0.82rem;
    }

    .day-short {
      font-weight: 700;
      color: #64748b;
      width: 32px;
    }

    .day-dishes {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      flex: 1;
    }

    .history-dish {
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 0.76rem;
      font-weight: 600;
    }

    .protein-tag {
      background: #ffe4e6;
      color: #9f1239;
    }

    .side-tag {
      background: #ecfdf5;
      color: #065f46;
    }

    .no-plan {
      color: #cbd5e1;
      font-style: italic;
    }

    .menu-card-footer {
      padding: 10px 16px;
      border-top: 1px solid #f1f5f9;
      background: #fafafa;
      display: flex;
      gap: 8px;
    }

    .btn-load-week {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 6px 12px;
      background: #10b981;
      color: #ffffff;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.82rem;
    }
    .btn-load-week:hover { background: #059669; }

    .btn-clone-week {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 6px 12px;
      background: #f1f5f9;
      color: #334155;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.82rem;
    }
    .btn-clone-week:hover { background: #e2e8f0; color: #0f172a; }
  `]
})
export class HistoryComponent {
  private firestoreService = inject(FirestoreService);
  menuService = inject(MenuService);

  menus = computed<WeeklyMenu[]>(() => {
    const list = [...this.firestoreService.weeklyMenus()];
    list.sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate));
    return list;
  });

  async loadWeek(weekStartDate: string): Promise<void> {
    await this.menuService.loadMenuForWeek(weekStartDate);
    window.location.hash = '#/menu';
  }

  async cloneToCurrent(m: WeeklyMenu): Promise<void> {
    const currentWeekStart = this.menuService.currentWeekStartDate();
    if (confirm(`¿Copiar todos los platos de "${m.title}" a la semana activa actual?`)) {
      const currentMenu = await this.menuService.loadMenuForWeek(currentWeekStart);
      currentMenu.days = JSON.parse(JSON.stringify(m.days));
      await this.menuService.saveCurrentMenu(currentMenu);
      window.location.hash = '#/menu';
    }
  }
}
