import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      [class]="extraClass"
    >
      <!-- Calendar -->
      <ng-container *ngIf="name === 'calendar'">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </ng-container>

      <!-- Shopping Cart / List -->
      <ng-container *ngIf="name === 'shopping-cart' || name === 'cart'">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </ng-container>

      <!-- Check / Ok -->
      <ng-container *ngIf="name === 'check' || name === 'ok'">
        <polyline points="20 6 9 17 4 12"></polyline>
      </ng-container>

      <!-- X / Close -->
      <ng-container *ngIf="name === 'x' || name === 'close'">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </ng-container>

      <!-- Plus / Add -->
      <ng-container *ngIf="name === 'plus'">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </ng-container>

      <!-- Edit / Pencil -->
      <ng-container *ngIf="name === 'edit' || name === 'pencil'">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </ng-container>

      <!-- Trash / Delete -->
      <ng-container *ngIf="name === 'trash'">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </ng-container>

      <!-- Printer -->
      <ng-container *ngIf="name === 'printer' || name === 'print'">
        <polyline points="6 9 6 2 18 2 18 9"></polyline>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
        <rect x="6" y="14" width="12" height="8"></rect>
      </ng-container>

      <!-- Chevron Left -->
      <ng-container *ngIf="name === 'chevron-left'">
        <polyline points="15 18 9 12 15 6"></polyline>
      </ng-container>

      <!-- Chevron Right -->
      <ng-container *ngIf="name === 'chevron-right'">
        <polyline points="9 18 15 12 9 6"></polyline>
      </ng-container>

      <!-- Refresh / Sync -->
      <ng-container *ngIf="name === 'refresh' || name === 'sync'">
        <polyline points="23 4 23 10 17 10"></polyline>
        <polyline points="1 20 1 14 7 14"></polyline>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
      </ng-container>

      <!-- Cloud -->
      <ng-container *ngIf="name === 'cloud'">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
      </ng-container>

      <!-- Wifi -->
      <ng-container *ngIf="name === 'wifi'">
        <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
        <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
        <line x1="12" y1="20" x2="12.01" y2="20"></line>
      </ng-container>

      <!-- Wifi Off -->
      <ng-container *ngIf="name === 'wifi-off'">
        <line x1="1" y1="1" x2="23" y2="23"></line>
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
        <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
        <line x1="12" y1="20" x2="12.01" y2="20"></line>
      </ng-container>

      <!-- External Link -->
      <ng-container *ngIf="name === 'external-link' || name === 'link'">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
      </ng-container>

      <!-- History / Book -->
      <ng-container *ngIf="name === 'history' || name === 'book'">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </ng-container>

      <!-- Home -->
      <ng-container *ngIf="name === 'home'">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </ng-container>

      <!-- Utensils / Cutlery -->
      <ng-container *ngIf="name === 'utensils' || name === 'food'">
        <path d="M18 2v20"></path>
        <path d="M21 15a3 3 0 0 1-3 3v4"></path>
        <path d="M21 2v4a3 3 0 0 1-3 3"></path>
        <path d="M6 2v7a3 3 0 0 0 3 3v10"></path>
        <path d="M3 2v7a3 3 0 0 0 3 3"></path>
      </ng-container>

      <!-- Search -->
      <ng-container *ngIf="name === 'search'">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </ng-container>

      <!-- Tag / Category -->
      <ng-container *ngIf="name === 'tag'">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
        <line x1="7" y1="7" x2="7.01" y2="7"></line>
      </ng-container>

      <!-- Settings -->
      <ng-container *ngIf="name === 'settings'">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </ng-container>

      <!-- Grip / Drag Handle -->
      <ng-container *ngIf="name === 'grip' || name === 'drag'">
        <circle cx="8" cy="6" r="1.5" fill="currentColor"></circle>
        <circle cx="8" cy="12" r="1.5" fill="currentColor"></circle>
        <circle cx="8" cy="18" r="1.5" fill="currentColor"></circle>
        <circle cx="16" cy="6" r="1.5" fill="currentColor"></circle>
        <circle cx="16" cy="12" r="1.5" fill="currentColor"></circle>
        <circle cx="16" cy="18" r="1.5" fill="currentColor"></circle>
      </ng-container>

      <!-- Alert Triangle -->
      <ng-container *ngIf="name === 'alert-triangle' || name === 'warning'">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </ng-container>

      <!-- Copy -->
      <ng-container *ngIf="name === 'copy'">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </ng-container>

      <!-- Default circle if unknown -->
      <circle *ngIf="!['calendar', 'shopping-cart', 'cart', 'check', 'ok', 'x', 'close', 'plus', 'edit', 'pencil', 'trash', 'printer', 'print', 'chevron-left', 'chevron-right', 'refresh', 'sync', 'cloud', 'wifi', 'wifi-off', 'external-link', 'link', 'history', 'book', 'home', 'utensils', 'food', 'search', 'tag', 'settings', 'grip', 'drag', 'alert-triangle', 'warning', 'copy'].includes(name)" cx="12" cy="12" r="10"></circle>
    </svg>
  `
})
export class IconComponent {
  @Input() name = 'circle';
  @Input() size = 18;
  @Input() strokeWidth = 2;
  @Input() extraClass = '';
}
