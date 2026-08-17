import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeeklyMenuComponent } from './components/weekly-menu.component';
import { ShoppingListComponent } from './components/shopping-list.component';
import { HistoryComponent } from './components/history.component';
import { CatalogComponent } from './components/catalog.component';
import { SettingsComponent } from './components/settings.component';
import { IconComponent } from './components/icon.component';
import { SyncService } from './services/sync.service';
import { ShoppingService } from './services/shopping.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    WeeklyMenuComponent,
    ShoppingListComponent,
    HistoryComponent,
    CatalogComponent,
    SettingsComponent,
    IconComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  syncService = inject(SyncService);
  shoppingService = inject(ShoppingService);

  activeTab = signal<'menu' | 'shopping' | 'history' | 'catalog' | 'settings'>('menu');

  setTab(tab: 'menu' | 'shopping' | 'history' | 'catalog' | 'settings') {
    this.activeTab.set(tab);
  }
}
