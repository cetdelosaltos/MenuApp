import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../services/firestore.service';
import { MenuService } from '../services/menu.service';
import { Dish, Ingredient, Category, DishType } from '../models/types';
import { IconComponent } from './icon.component';
import { DishEditComponent } from './dish-edit.component';
import { matchesSearch } from '../utils/string-utils';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, DishEditComponent],
  template: `
    <div class="catalog-page">
      
      <!-- Dedicated Dish/Recipe Editor View -->
      <app-dish-edit
        *ngIf="viewMode === 'edit'"
        [dish]="selectedDish"
        (saved)="onDishSaved()"
        (cancelled)="viewMode = 'list'"
      ></app-dish-edit>

      <!-- Main Catalog View (Remains rendered beneath the swipe-up modal sheet) -->
      <ng-container>
        
        <!-- Top header -->
        <div class="catalog-header">
          <div>
            <h2 class="section-title">Catálogo de Recetas e Ingredientes</h2>
            <p class="section-sub">Administra tus platos favoritos, enlaces a recetas y catálogo de ingredientes.</p>
          </div>
          <div class="header-tabs">
            <button class="tab-btn" [class.active]="activeTab === 'dishes'" (click)="activeTab = 'dishes'">
              <app-icon name="food" [size]="16"></app-icon> Platos ({{ dishes().length }})
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'ingredients'" (click)="activeTab = 'ingredients'">
              <app-icon name="tag" [size]="16"></app-icon> Ingredientes ({{ ingredients().length }})
            </button>
          </div>
        </div>

        <!-- DISHES TAB -->
        <div *ngIf="activeTab === 'dishes'" class="tab-content">
          
          <!-- Search & Filter bar -->
          <div class="search-filter-bar">
            <div class="search-box">
              <app-icon name="search" [size]="16" extraClass="text-muted"></app-icon>
              <input
                type="text"
                class="search-input"
                [(ngModel)]="searchDishQuery"
                placeholder="Buscar plato o ingrediente..."
              />
            </div>

            <!-- Sorting Button Group for Dishes -->
            <div class="btn-segmented-group" role="group" aria-label="Orden de platos">
              <button
                type="button"
                class="btn-segmented-item"
                [class.active]="dishSortOrder === 'asc'"
                (click)="dishSortOrder = 'asc'"
                title="Ordenar alfabéticamente A-Z"
              >
                A - Z
              </button>
              <button
                type="button"
                class="btn-segmented-item"
                [class.active]="dishSortOrder === 'desc'"
                (click)="dishSortOrder = 'desc'"
                title="Ordenar alfabéticamente Z-A"
              >
                Z - A
              </button>
              <button
                type="button"
                class="btn-segmented-item"
                [class.active]="dishSortOrder === 'created'"
                (click)="dishSortOrder = 'created'"
                title="Ordenar por fecha de ingreso"
              >
                Ingreso
              </button>
            </div>

            <div class="filter-type-group">
              <button class="filter-btn" [class.active]="dishTypeFilter === 'all'" (click)="dishTypeFilter = 'all'">Todos</button>
              <button class="filter-btn" [class.active]="dishTypeFilter === 'protein'" (click)="dishTypeFilter = 'protein'">Principales</button>
              <button class="filter-btn" [class.active]="dishTypeFilter === 'side'" (click)="dishTypeFilter = 'side'">Contornos</button>
              <button class="filter-btn" [class.active]="dishTypeFilter === 'breakfast'" (click)="dishTypeFilter = 'breakfast'">Desayunos</button>
              <button class="filter-btn" [class.active]="dishTypeFilter === 'dinner'" (click)="dishTypeFilter = 'dinner'">Cenas</button>
            </div>

            <button class="btn-create-dish" (click)="openCreateDish()">
              <app-icon name="plus" [size]="16"></app-icon> Nuevo Plato
            </button>
          </div>

          <!-- Dishes Continuous List (Flat iOS Style) -->
          <div class="dishes-flat-list" *ngIf="filteredDishes().length > 0">
            <div *ngFor="let dish of filteredDishes()" class="dish-flat-row">
              <div class="dish-row-top">
                <div class="dish-row-meta">
                  <span *ngFor="let t of getDishTypes(dish)" class="badge" [ngClass]="getDishBadgeClass(t)">
                    {{ getDishTypeLabel(t) }}
                  </span>
                  <a *ngIf="dish.recipeUrl" [href]="dish.recipeUrl" target="_blank" rel="noopener noreferrer" class="dish-link" title="Abrir receta externa">
                    <app-icon name="external-link" [size]="12"></app-icon>
                    <span>Receta</span>
                  </a>
                </div>
                <div class="dish-row-actions">
                  <button class="btn-dish-edit-icon" (click)="editDish(dish)" title="Editar receta">
                    <app-icon name="edit" [size]="14"></app-icon>
                    <span>Editar</span>
                  </button>
                  <button class="btn-dish-del-icon" (click)="deleteDish(dish)" title="Eliminar plato">
                    <app-icon name="trash" [size]="14"></app-icon>
                  </button>
                </div>
              </div>

              <!-- Clickable Dish Title -->
              <h3 class="dish-title-clickable" (click)="editDish(dish)" title="Clic para editar receta">
                {{ dish.name }}
              </h3>

              <!-- Assigned Ingredients Flow (No gray box, clean space optimization) -->
              <div class="dish-ings-preview">
                <span class="ings-count-label">Ingredientes ({{ (dish.ingredientIds || []).length }}):</span>
                <div class="ings-chips-flow" *ngIf="dish.ingredientIds?.length">
                  <span *ngFor="let ingName of getDishIngredientNames(dish)" class="ing-mini-chip">
                    {{ ingName }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="filteredDishes().length === 0" class="empty-state">
            <p>No se encontraron platos que coincidan con la búsqueda.</p>
            <button class="btn-create-dish" (click)="openCreateDish()">
              <app-icon name="plus" [size]="16"></app-icon> Crear Nuevo Plato
            </button>
          </div>

        </div>

        <!-- INGREDIENTS TAB -->
        <div *ngIf="activeTab === 'ingredients'" class="tab-content">
          
          <div class="search-filter-bar">
            <div class="search-box">
              <app-icon name="search" [size]="16" extraClass="text-muted"></app-icon>
              <input
                type="text"
                class="search-input"
                [(ngModel)]="searchIngQuery"
                placeholder="Buscar ingrediente (ej. queso, papas, carne)..."
              />
            </div>

            <!-- Sorting Buttons Group -->
            <div class="btn-segmented-group" role="group" aria-label="Orden de ingredientes">
              <button
                type="button"
                class="btn-segmented-item"
                [class.active]="ingSortOrder === 'asc'"
                (click)="ingSortOrder = 'asc'"
                title="Ordenar alfabéticamente A-Z"
              >
                A - Z
              </button>
              <button
                type="button"
                class="btn-segmented-item"
                [class.active]="ingSortOrder === 'desc'"
                (click)="ingSortOrder = 'desc'"
                title="Ordenar alfabéticamente Z-A"
              >
                Z - A
              </button>
              <button
                type="button"
                class="btn-segmented-item"
                [class.active]="ingSortOrder === 'created'"
                (click)="ingSortOrder = 'created'"
                title="Ordenar por fecha de ingreso"
              >
                Ingreso
              </button>
            </div>

            <!-- View Mode Group: Por Categorías o Lista Completa -->
            <div class="btn-segmented-group" role="group" aria-label="Modo de vista">
              <button
                type="button"
                class="btn-segmented-item"
                [class.active]="ingViewMode === 'grouped'"
                (click)="ingViewMode = 'grouped'"
                title="Agrupar por categorías"
              >
                Categorías
              </button>
              <button
                type="button"
                class="btn-segmented-item"
                [class.active]="ingViewMode === 'flat'"
                (click)="ingViewMode = 'flat'"
                title="Ver lista corrida de todos los ingredientes"
              >
                Lista Completa
              </button>
            </div>

            <button class="btn-create-dish" (click)="startCreateNewIng()">
              <app-icon name="plus" [size]="16"></app-icon> Nuevo Ingrediente
            </button>
          </div>

          <!-- Dedicated Global "Nuevo Ingrediente" Form (Independent from any category) -->
          <div *ngIf="isCreatingGlobalIng" class="global-new-ing-card animate-fade">
            <div class="global-new-ing-header">
              <span class="global-new-ing-title">
                <app-icon name="plus-circle" [size]="16"></app-icon> Nuevo Ingrediente
              </span>
              <button type="button" class="btn-close-form" (click)="cancelGlobalNewIng()" title="Cerrar">✕</button>
            </div>
            
            <div class="global-new-ing-body">
              <input
                type="text"
                class="global-ing-input font-bold"
                [(ngModel)]="globalIngName"
                placeholder="Nombre del ingrediente (ej. Queso Parmesano, Cilantro)..."
                (keyup.enter)="saveGlobalNewIng()"
                autofocus
              />
              <div class="global-ing-controls-row">
                <select class="global-ing-select flex-1" [(ngModel)]="globalIngCat">
                  <option *ngFor="let c of categories()" [value]="c.id">{{ c.name }}</option>
                </select>
                <button type="button" class="btn-global-cancel" (click)="cancelGlobalNewIng()">Cancelar</button>
                <button type="button" class="btn-global-save" (click)="saveGlobalNewIng()" [disabled]="!globalIngName.trim()">
                  <app-icon name="check" [size]="15"></app-icon>
                  <span>Guardar</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 1. GROUPED INGREDIENTS CONTAINER -->
          <div *ngIf="ingViewMode === 'grouped'" class="grouped-ingredients-container">
            
            <div class="category-ingredient-section" *ngFor="let group of groupedIngredients(); trackBy: trackByCat">
              
              <!-- Category Header Bar -->
              <div class="category-section-header" [style.border-left-color]="group.category.color">
                <div class="cat-header-left">
                  <span class="cat-color-dot" [style.background-color]="group.category.color"></span>
                  <div class="cat-titles-col">
                    <h3 class="cat-section-title">{{ group.category.name }}</h3>
                    <span class="cat-count-sub">{{ group.ingredients.length }} {{ group.ingredients.length === 1 ? 'ítem' : 'ítems' }}</span>
                  </div>
                </div>
                <button class="btn-add-to-cat" (click)="startCreateNewIngInCat(group.category.id)" title="Añadir ingrediente en {{ group.category.name }}">
                  <app-icon name="plus" [size]="14"></app-icon> Añadir
                </button>
              </div>

              <!-- List of Ingredients for this Category -->
              <div class="cat-ing-list">
                
                <!-- Inline New Ingredient Form (Only when adding directly inside this category) -->
                <div *ngIf="creatingCatId === group.category.id" class="ing-inline-box animate-fade">
                  <div class="ing-inline-row-top">
                    <input
                      type="text"
                      class="inline-input-name"
                      [(ngModel)]="newCatIngName"
                      (keyup.enter)="saveNewIngInCat(group.category.id)"
                      (keydown.escape)="cancelNewIngInCat()"
                      placeholder="Añadir a {{ group.category.name }}..."
                      autofocus
                    />
                  </div>
                  <div class="ing-inline-row-bottom">
                    <button class="btn-inline-save" (click)="saveNewIngInCat(group.category.id)" [disabled]="!newCatIngName.trim()" title="Guardar">
                      <app-icon name="check" [size]="15"></app-icon> Guardar
                    </button>
                    <button class="btn-inline-cancel" (click)="cancelNewIngInCat()" title="Cancelar">
                      <app-icon name="x" [size]="15"></app-icon>
                    </button>
                  </div>
                </div>

                <!-- Sorted Ingredient Rows -->
                <div
                  *ngFor="let ing of group.ingredients; trackBy: trackByIng"
                  class="ing-flat-row"
                  [class.row-editing]="editingIngredientId === ing.id"
                >
                  <!-- Read-only View -->
                  <div *ngIf="editingIngredientId !== ing.id" class="ing-row-content">
                    <div class="ing-row-main">
                      <span class="ing-title-text" (click)="startInlineEdit(ing, $event)" title="Haz clic para editar">
                        • {{ ing.name }}
                      </span>
                      <span class="ing-purchase-info">
                        {{ ing.lastPurchasedAt ? ('Última compra: ' + formatLastPurchase(ing.lastPurchasedAt)) : 'Sin compras registradas' }}
                      </span>
                    </div>

                    <div class="ing-row-actions">
                      <button class="btn-row-edit" (click)="startInlineEdit(ing, $event)" title="Editar">
                        <app-icon name="edit" [size]="14"></app-icon>
                      </button>
                      <button class="btn-row-del" (click)="deleteIngredient(ing)" title="Eliminar de BD">
                        <app-icon name="trash" [size]="14"></app-icon>
                      </button>
                    </div>
                  </div>

                  <!-- Inline Edit View -->
                  <div *ngIf="editingIngredientId === ing.id" class="ing-inline-box animate-fade">
                    <div class="ing-inline-row-top">
                      <input
                        type="text"
                        class="inline-input-name"
                        [(ngModel)]="inlineEditName"
                        (keyup.enter)="saveInlineEdit(ing)"
                        (keydown.escape)="cancelInlineEdit()"
                        placeholder="Nombre del ingrediente..."
                        autofocus
                      />
                    </div>
                    <div class="ing-inline-row-bottom">
                      <select class="inline-select-cat flex-1" [(ngModel)]="inlineEditCat">
                        <option *ngFor="let c of categories()" [value]="c.id">{{ c.name }}</option>
                      </select>
                      <button class="btn-inline-save" (click)="saveInlineEdit(ing)" title="Guardar cambios (Enter)">
                        <app-icon name="check" [size]="15"></app-icon> Guardar
                      </button>
                      <button class="btn-inline-cancel" (click)="cancelInlineEdit()" title="Cancelar (Esc)">
                        <app-icon name="x" [size]="15"></app-icon>
                      </button>
                    </div>
                  </div>

                </div>

              </div>

            </div>

            <!-- Empty State -->
            <div *ngIf="groupedIngredients().length === 0" class="empty-state">
              <app-icon name="search" [size]="32" extraClass="text-muted"></app-icon>
              <h4>No se encontraron ingredientes</h4>
              <p *ngIf="searchIngQuery">No hay ingredientes que coincidan con "{{ searchIngQuery }}".</p>
              <button class="btn-create-dish" (click)="startCreateNewIng()">+ Crear ingrediente</button>
            </div>

          </div>

          <!-- 2. FLAT INGREDIENTS CONTAINER (LISTA COMPLETA) -->
          <div *ngIf="ingViewMode === 'flat'" class="flat-ingredients-container">
            
            <div class="dishes-flat-list" *ngIf="flatIngredients().length > 0">
              <div
                *ngFor="let ing of flatIngredients(); trackBy: trackByIng"
                class="ing-flat-row"
                [class.row-editing]="editingIngredientId === ing.id"
              >
                <!-- Read-only View -->
                <div *ngIf="editingIngredientId !== ing.id" class="ing-row-content">
                  <div class="ing-row-main">
                    <div class="ing-title-line">
                      <span class="ing-title-text" (click)="startInlineEdit(ing, $event)" title="Haz clic para editar">
                        • {{ ing.name }}
                      </span>
                      <span
                        class="cat-pill-xs"
                        [style.background-color]="getCatColor(ing.categoryId) + '20'"
                        [style.color]="getCatColor(ing.categoryId)"
                      >
                        {{ getCatName(ing.categoryId) }}
                      </span>
                    </div>
                    <span class="ing-purchase-info">
                      {{ ing.lastPurchasedAt ? ('Última compra: ' + formatLastPurchase(ing.lastPurchasedAt)) : 'Sin compras registradas' }}
                    </span>
                  </div>

                  <div class="ing-row-actions">
                    <button class="btn-row-edit" (click)="startInlineEdit(ing, $event)" title="Editar">
                      <app-icon name="edit" [size]="14"></app-icon>
                    </button>
                    <button class="btn-row-del" (click)="deleteIngredient(ing)" title="Eliminar de BD">
                      <app-icon name="trash" [size]="14"></app-icon>
                    </button>
                  </div>
                </div>

                <!-- Inline Edit View -->
                <div *ngIf="editingIngredientId === ing.id" class="ing-inline-box animate-fade">
                  <div class="ing-inline-row-top">
                    <input
                      type="text"
                      class="inline-input-name"
                      [(ngModel)]="inlineEditName"
                      (keyup.enter)="saveInlineEdit(ing)"
                      (keydown.escape)="cancelInlineEdit()"
                      placeholder="Nombre del ingrediente..."
                      autofocus
                    />
                  </div>
                  <div class="ing-inline-row-bottom">
                    <select class="inline-select-cat flex-1" [(ngModel)]="inlineEditCat">
                      <option *ngFor="let c of categories()" [value]="c.id">{{ c.name }}</option>
                    </select>
                    <button class="btn-inline-save" (click)="saveInlineEdit(ing)" title="Guardar cambios (Enter)">
                      <app-icon name="check" [size]="15"></app-icon> Guardar
                    </button>
                    <button class="btn-inline-cancel" (click)="cancelInlineEdit()" title="Cancelar (Esc)">
                      <app-icon name="x" [size]="15"></app-icon>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="flatIngredients().length === 0" class="empty-state">
              <app-icon name="search" [size]="32" extraClass="text-muted"></app-icon>
              <h4>No se encontraron ingredientes</h4>
              <p *ngIf="searchIngQuery">No hay ingredientes que coincidan con "{{ searchIngQuery }}".</p>
              <button class="btn-create-dish" (click)="startCreateNewIng()">+ Crear ingrediente</button>
            </div>

          </div>

        </div>

      </ng-container>

    </div>
  `,
  styles: [`
    .catalog-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 4px;
    }

    .catalog-header {
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

    .header-tabs {
      display: flex;
      gap: 8px;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.88rem;
      background: #f1f5f9;
      color: #475569;
    }
    .tab-btn.active {
      background: #10b981;
      color: #ffffff;
    }

    .tab-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .search-filter-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      background: #ffffff;
      padding: 10px 16px;
      border-radius: 14px;
      border: 1px solid var(--border-color);
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 220px;
      background: #f8fafc;
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
    }

    .search-input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.88rem;
      width: 100%;
    }

    .filter-type-group {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      background: #f1f5f9;
      color: #475569;
    }
    .filter-btn.active {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }

    .btn-segmented-group {
      display: inline-flex;
      align-items: center;
      background: #f1f5f9;
      padding: 3px;
      border-radius: 9px;
      border: 1px solid #cbd5e1;
      gap: 2px;
      flex-shrink: 0;
    }

    .btn-segmented-item {
      padding: 6px 13px;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      color: #64748b;
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
      user-select: none;
    }

    .btn-segmented-item:hover:not(.active) {
      color: #0f172a;
      background: rgba(255, 255, 255, 0.6);
    }

    .btn-segmented-item.active {
      background: #ffffff;
      color: #059669;
      font-weight: 700;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .btn-create-dish {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #10b981;
      color: #ffffff;
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
    }
    .btn-create-dish:hover {
      background: #059669;
    }

    /* Dishes Continuous Flat List */
    .dishes-flat-list {
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }

    .dish-flat-row {
      display: flex;
      flex-direction: column;
      padding: 12px 14px;
      border-bottom: 1px solid #f1f5f9;
      background: #ffffff;
      gap: 6px;
      transition: background 0.12s;
    }
    .dish-flat-row:last-child {
      border-bottom: none;
    }
    .dish-flat-row:hover {
      background: #f8fafc;
    }

    .dish-row-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .dish-row-meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dish-row-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .dish-link {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      color: #059669;
      padding: 2px 7px;
      background: #ecfdf5;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-decoration: none;
    }
    .dish-link:hover {
      background: #d1fae5;
    }

    .btn-dish-edit-icon {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #059669;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-dish-edit-icon:hover {
      background: #d1fae5;
    }

    .btn-dish-del-icon {
      color: #94a3b8;
      padding: 4px 6px;
      border-radius: 6px;
      background: transparent;
      border: none;
      cursor: pointer;
    }
    .btn-dish-del-icon:hover {
      color: #dc2626;
      background: #fee2e2;
    }

    .dish-title-clickable {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      cursor: pointer;
      line-height: 1.25;
      transition: color 0.12s;
    }
    .dish-title-clickable:hover {
      color: #059669;
      text-decoration: underline;
    }

    .dish-ings-preview {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-top: 2px;
    }

    .ings-count-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
    }

    .ings-chips-flow {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .ing-mini-chip {
      font-size: 0.72rem;
      padding: 2px 7px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      color: #334155;
      font-weight: 500;
    }

    /* Dedicated Global New Ingredient Form */
    .global-new-ing-card {
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border: 1px solid #10b981;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 14px;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.12);
      gap: 10px;
    }

    .global-new-ing-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .global-new-ing-title {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #0f172a;
      font-size: 0.92rem;
      font-weight: 700;
    }

    .btn-close-form {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1rem;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .btn-close-form:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .global-new-ing-body {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .global-ing-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.92rem;
      color: #0f172a;
      background: #ffffff;
      outline: none;
      box-sizing: border-box;
    }
    .global-ing-input:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);
    }

    .global-ing-controls-row {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    .global-ing-select {
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.84rem;
      color: #334155;
      background: #ffffff;
      outline: none;
      box-sizing: border-box;
    }

    .btn-global-cancel {
      padding: 8px 12px;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.84rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-global-cancel:hover {
      background: #e2e8f0;
    }

    .btn-global-save {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 8px 16px;
      background: #10b981;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 0.84rem;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-global-save:hover:not(:disabled) {
      background: #059669;
    }
    .btn-global-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Ingredients List (Continuous Seamless iOS Grouped Style) */
    .grouped-ingredients-container {
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      gap: 0;
    }

    .category-ingredient-section {
      display: flex;
      flex-direction: column;
      gap: 0;
      width: 100%;
    }

    .category-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: #f8fafc;
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
      border-radius: 0;
      border-left: 4px solid #10b981;
    }
    .category-ingredient-section:first-child .category-section-header {
      border-top: none;
    }

    .cat-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }

    .cat-color-dot {
      width: 8px;
      height: 8px;
      border-radius: 9999px;
      display: inline-block;
      flex-shrink: 0;
    }

    .cat-titles-col {
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }

    .cat-section-title {
      font-size: 0.92rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      white-space: normal;
      word-break: break-word;
      line-height: 1.25;
    }

    .cat-count-sub {
      font-size: 0.72rem;
      color: #64748b;
      font-weight: 500;
    }

    .btn-add-to-cat {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: #ffffff;
      color: #059669;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      border: 1px solid #a7f3d0;
      cursor: pointer;
    }
    .btn-add-to-cat:hover {
      background: #ecfdf5;
    }

    .cat-ing-list {
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border: none;
      border-radius: 0;
      overflow: visible;
    }

    .ing-flat-row {
      display: flex;
      flex-direction: column;
      padding: 9px 12px;
      border-bottom: 1px solid #f1f5f9;
      background: #ffffff;
      transition: background 0.12s;
    }
    .ing-flat-row:last-child {
      border-bottom: none;
    }
    .ing-flat-row:hover {
      background: #f8fafc;
    }

    .ing-row-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      width: 100%;
    }

    .ing-row-main {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      min-width: 0;
    }

    .ing-title-line {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .cat-pill-xs {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 9999px;
      white-space: nowrap;
    }

    .flat-ingredients-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .ing-title-text {
      font-size: 0.92rem;
      font-weight: 600;
      color: #0f172a;
      cursor: pointer;
      white-space: normal;
      word-break: break-word;
      line-height: 1.25;
    }
    .ing-title-text:hover {
      color: #059669;
      text-decoration: underline;
    }

    .ing-purchase-info {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .ing-row-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .btn-row-edit {
      color: #64748b;
      padding: 5px 7px;
      border-radius: 6px;
      background: #f1f5f9;
      border: none;
      cursor: pointer;
    }
    .btn-row-edit:hover { color: #059669; background: #d1fae5; }

    .btn-row-del {
      color: #94a3b8;
      padding: 5px 7px;
      border-radius: 6px;
      background: #f8fafc;
      border: none;
      cursor: pointer;
    }
    .btn-row-del:hover { color: #dc2626; background: #fee2e2; }

    /* Inline Add / Edit Box */
    .ing-inline-box {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px 10px;
      background: #f0fdf4;
      border-bottom: 1px solid #a7f3d0;
    }

    .ing-inline-row-top {
      width: 100%;
    }

    .ing-inline-row-bottom {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
    }

    .inline-input-name {
      width: 100%;
      padding: 7px 10px;
      border: 1px solid #10b981;
      border-radius: 6px;
      font-size: 0.88rem;
      font-weight: 600;
      color: #0f172a;
      background: #ffffff;
      outline: none;
      box-sizing: border-box;
    }

    .inline-select-cat {
      padding: 6px 8px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.82rem;
      color: #334155;
      background: #ffffff;
      outline: none;
      box-sizing: border-box;
    }

    .flex-1 { flex: 1; min-width: 0; }

    .btn-inline-save {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #10b981;
      color: #ffffff;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 0.8rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn-inline-save:hover { background: #059669; }

    .btn-inline-cancel {
      background: #e2e8f0;
      color: #64748b;
      border-radius: 6px;
      padding: 6px 8px;
      border: none;
      cursor: pointer;
    }
    .btn-inline-cancel:hover { background: #cbd5e1; color: #0f172a; }

    .empty-state {
      padding: 30px 16px;
      text-align: center;
      background: #ffffff;
      border-radius: 8px;
      border: 1px dashed #cbd5e1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      color: #64748b;
    }

    .text-xs { font-size: 0.78rem; }
    .text-center { text-align: center; }
    .py-6 { padding-top: 24px; padding-bottom: 24px; }
  `]
})
export class CatalogComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private menuService = inject(MenuService);

  viewMode: 'list' | 'edit' = 'list';
  selectedDish: Dish | null = null;

  activeTab: 'dishes' | 'ingredients' = 'dishes';
  dishes = computed<Dish[]>(() => this.firestoreService.dishes());
  ingredients = computed<Ingredient[]>(() => this.firestoreService.ingredients());
  categories = computed<Category[]>(() => this.firestoreService.categories());

  searchDishQuery = '';
  dishTypeFilter: 'all' | 'protein' | 'side' | 'breakfast' | 'dinner' = 'all';
  dishSortOrder: 'asc' | 'desc' | 'created' = 'asc';

  searchIngQuery = '';
  ingSortOrder: 'asc' | 'desc' | 'created' = 'asc';
  ingViewMode: 'grouped' | 'flat' = 'grouped';

  // Inline editing state
  editingIngredientId: string | null = null;
  inlineEditName = '';
  inlineEditCat = 'cat_viveres';

  // Dedicated Global new ingredient state (top button)
  isCreatingGlobalIng = false;
  globalIngName = '';
  globalIngCat = 'cat_viveres';

  // In-category new ingredient state (+ Añadir button inside category)
  creatingCatId: string | null = null;
  newCatIngName = '';

  ngOnInit(): void { }

  async refreshData(): Promise<void> { }

  getDishTypes(dish: Dish): DishType[] {
    if (dish.types && dish.types.length > 0) {
      return dish.types;
    }
    return dish.type ? [dish.type] : ['protein'];
  }

  filteredDishes(): Dish[] {
    const q = this.searchDishQuery.trim();
    const result = this.dishes().filter(d => {
      let matchesQuery = true;
      if (q) {
        const matchesName = matchesSearch(d.name, q);
        const matchesIng = (d.ingredientIds || []).some(id => {
          const found = this.ingredients().find(i => i.id === id);
          return found && matchesSearch(found.name, q);
        });
        matchesQuery = matchesName || matchesIng;
      }
      const types = this.getDishTypes(d);
      const matchesType = this.dishTypeFilter === 'all' || types.includes(this.dishTypeFilter);
      return matchesQuery && matchesType;
    });

    if (this.dishSortOrder === 'asc') {
      return result.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
    } else if (this.dishSortOrder === 'desc') {
      return result.sort((a, b) => b.name.localeCompare(a.name, 'es', { sensitivity: 'base' }));
    } else {
      // 'created': sort by updatedAt or id (creation order)
      return result.sort((a, b) => {
        const dateA = a.updatedAt || '';
        const dateB = b.updatedAt || '';
        if (dateA && dateB) return dateA.localeCompare(dateB);
        return a.id.localeCompare(b.id);
      });
    }
  }

  getDishIngredientNames(dish: Dish): string[] {
    const ings = this.ingredients();
    return (dish.ingredientIds || [])
      .map(id => ings.find(i => i.id === id)?.name)
      .filter((n): n is string => !!n);
  }

  filteredIngredients(): Ingredient[] {
    const q = this.searchIngQuery.trim();
    return this.ingredients().filter(i => {
      return !q || matchesSearch(i.name, q);
    });
  }

  sortIngredientList(list: Ingredient[]): Ingredient[] {
    const copy = [...list];
    if (this.ingSortOrder === 'asc') {
      return copy.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
    } else if (this.ingSortOrder === 'desc') {
      return copy.sort((a, b) => b.name.localeCompare(a.name, 'es', { sensitivity: 'base' }));
    } else {
      // 'created': sort by updatedAt or id (creation order)
      return copy.sort((a, b) => {
        const dateA = a.updatedAt || '';
        const dateB = b.updatedAt || '';
        if (dateA && dateB) return dateA.localeCompare(dateB);
        return a.id.localeCompare(b.id);
      });
    }
  }

  /**
   * Group ingredients by category and sort according to ingSortOrder within each category
   */
  groupedIngredients(): { category: Category; ingredients: Ingredient[] }[] {
    const allCats = [...this.categories()].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    const query = this.searchIngQuery.trim();
    const allIngs = this.ingredients().filter(i => !i.deletedAt);

    const filtered = query
      ? allIngs.filter(i => matchesSearch(i.name, query))
      : allIngs;

    const groups: { category: Category; ingredients: Ingredient[] }[] = [];

    for (const cat of allCats) {
      const catIngs = this.sortIngredientList(filtered.filter(i => i.categoryId === cat.id));

      if (catIngs.length > 0 || this.creatingCatId === cat.id) {
        groups.push({
          category: cat,
          ingredients: catIngs
        });
      }
    }

    // Items with unknown/uncategorized category
    const others = this.sortIngredientList(filtered.filter(i => !allCats.some(c => c.id === i.categoryId)));

    if (others.length > 0) {
      groups.push({
        category: {
          id: 'cat_otros',
          name: 'Otros',
          icon: 'shopping-cart',
          color: '#64748b',
          orderIndex: 99
        },
        ingredients: others
      });
    }

    return groups;
  }

  /**
   * Flat list of all ingredients across all categories, sorted according to ingSortOrder
   */
  flatIngredients(): Ingredient[] {
    const query = this.searchIngQuery.trim();
    const allIngs = this.ingredients().filter(i => !i.deletedAt);
    const filtered = query
      ? allIngs.filter(i => matchesSearch(i.name, query))
      : allIngs;

    return this.sortIngredientList(filtered);
  }

  getDishBadgeClass(type: DishType): string {
    switch (type) {
      case 'protein': return 'badge-rose';
      case 'side': return 'badge-emerald';
      case 'breakfast': return 'badge-amber';
      case 'dinner': return 'badge-blue';
      default: return 'badge-gray';
    }
  }

  getDishTypeLabel(type: DishType): string {
    switch (type) {
      case 'protein': return 'Principal';
      case 'side': return 'Contorno';
      case 'breakfast': return 'Desayuno';
      case 'dinner': return 'Cena';
      default: return 'Otro';
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

  formatLastPurchase(isoStr: string): string {
    const d = new Date(isoStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  openCreateDish(): void {
    this.selectedDish = null;
    this.viewMode = 'edit';
  }

  editDish(dish: Dish): void {
    this.selectedDish = dish;
    this.viewMode = 'edit';
  }

  async onDishSaved(): Promise<void> {
    this.viewMode = 'list';
    this.selectedDish = null;
    await this.refreshData();
    await this.menuService.loadCatalog();
  }

  async deleteDish(dish: Dish): Promise<void> {
    if (confirm(`¿Eliminar "${dish.name}" del catálogo?`)) {
      await this.firestoreService.deleteDish(dish.id);
    }
  }

  // --- Global "Nuevo Ingrediente" (Top button) ---

  startCreateNewIng(): void {
    this.cancelInlineEdit();
    this.cancelNewIngInCat();
    this.globalIngName = '';
    this.globalIngCat = this.categories()[0]?.id || 'cat_viveres';
    this.isCreatingGlobalIng = true;
  }

  cancelGlobalNewIng(): void {
    this.isCreatingGlobalIng = false;
    this.globalIngName = '';
  }

  async saveGlobalNewIng(): Promise<void> {
    const name = this.globalIngName.trim();
    if (!name) return;

    await this.menuService.createOrGetIngredient(name, this.globalIngCat);
    this.cancelGlobalNewIng();
  }

  // --- In-Category "Añadir" (+ Añadir button inside category header) ---

  startCreateNewIngInCat(catId: string): void {
    this.cancelInlineEdit();
    this.cancelGlobalNewIng();
    this.creatingCatId = catId;
    this.newCatIngName = '';
  }

  cancelNewIngInCat(): void {
    this.creatingCatId = null;
    this.newCatIngName = '';
  }

  async saveNewIngInCat(catId: string): Promise<void> {
    const name = this.newCatIngName.trim();
    if (!name) return;

    await this.menuService.createOrGetIngredient(name, catId);
    this.cancelNewIngInCat();
  }

  trackByCat(index: number, group: { category: Category }): string {
    return group.category.id;
  }

  trackByIng(index: number, ing: Ingredient): string {
    return ing.id;
  }

  startInlineEdit(ing: Ingredient, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.cancelGlobalNewIng();
    this.cancelNewIngInCat();
    this.editingIngredientId = ing.id;
    this.inlineEditName = ing.name;
    this.inlineEditCat = ing.categoryId || 'cat_viveres';
  }

  cancelInlineEdit(): void {
    this.editingIngredientId = null;
    this.inlineEditName = '';
  }

  async saveInlineEdit(ing: Ingredient): Promise<void> {
    const name = this.inlineEditName.trim();
    if (!name) return;

    await this.menuService.updateIngredientCategoryGlobally(ing.id, this.inlineEditCat, name);
    this.cancelInlineEdit();
  }

  async deleteIngredient(ing: Ingredient): Promise<void> {
    if (confirm(`¿Eliminar definitivamente "${ing.name}" de la base de datos?`)) {
      await this.menuService.deleteIngredientDefinitive(ing.id);
    }
  }
}
