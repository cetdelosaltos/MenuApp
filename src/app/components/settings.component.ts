import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SyncService } from '../services/sync.service';
import { FirestoreService } from '../services/firestore.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="settings-page animate-fade">
      
      <div class="settings-header">
        <div>
          <h2 class="section-title">Configuración y Sincronización</h2>
          <p class="section-sub">Configura tu código de hogar familiar y la sincronización instantánea en la nube.</p>
        </div>
        <div class="status-pill" [class.is-online]="syncService.isOnline()">
          <app-icon [name]="syncService.isOnline() ? 'wifi' : 'wifi-off'" [size]="16"></app-icon>
          <span>{{ syncService.isOnline() ? 'Conectado a Firebase (En Vivo)' : 'Modo Sin Conexión (Caché Local)' }}</span>
        </div>
      </div>

      <!-- Household Code Card -->
      <div class="config-card">
        <div class="card-icon-title">
          <app-icon name="home" [size]="20" extraClass="text-emerald"></app-icon>
          <div>
            <h3 class="card-title">Código de Hogar Compartido</h3>
            <p class="card-sub">Todos los miembros de la familia deben usar este mismo código en sus dispositivos para compartir el menú y la lista de compras en tiempo real.</p>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <label>Código de Hogar</label>
            <input
              type="text"
              class="form-input font-mono uppercase"
              [(ngModel)]="householdCode"
              placeholder="Ej. FAMILIA-PEREZ"
            />
          </div>
          <div class="form-group flex-1">
            <label>Nombre del Hogar</label>
            <input
              type="text"
              class="form-input"
              [(ngModel)]="householdName"
              placeholder="Ej. Casa Principal"
            />
          </div>
        </div>
      </div>

      <!-- Firebase Realtime Engine Info -->
      <div class="config-card">
        <div class="card-icon-title">
          <app-icon name="cloud" [size]="20" extraClass="text-emerald"></app-icon>
          <div>
            <h3 class="card-title">Motor en la Nube: Firebase Firestore</h3>
            <p class="card-sub">Las actualizaciones se transmiten inmediatamente (< 200 ms) a todos los dispositivos mediante WebSockets y cuentan con soporte offline nativo.</p>
          </div>
        </div>

        <div class="sync-actions-box">
          <div class="sync-info">
            <div class="info-line">
              <span class="info-label">Base de Datos:</span>
              <span class="badge badge-emerald">Firebase Cloud Firestore</span>
            </div>
            <div class="info-line">
              <span class="info-label">Estado de conexión:</span>
              <span class="badge" [class.badge-emerald]="syncService.isOnline()" [class.badge-amber]="!syncService.isOnline()">
                {{ syncService.isOnline() ? 'Suscripción Activa (En Vivo)' : 'Trabajando Offline (IndexedDB)' }}
              </span>
            </div>
            <div class="info-line">
              <span class="info-label">Última actualización:</span>
              <span class="text-muted">{{ lastSyncDisplay() }}</span>
            </div>
          </div>

          <button
            class="btn-sync-now"
            (click)="testSync()"
          >
            <app-icon name="refresh" [size]="16" [extraClass]="syncService.isSyncing() ? 'spin' : ''"></app-icon>
            <span>Verificar Conexión</span>
          </button>
        </div>

        <!-- Sync result alert -->
        <div *ngIf="syncService.lastSyncResult() as res" class="sync-alert" [class.alert-success]="res.success" [class.alert-error]="!res.success">
          <app-icon [name]="res.success ? 'check' : 'x'" [size]="16"></app-icon>
          <span>{{ res.message }}</span>
        </div>

        <!-- Firebase Permissions Instruction Box -->
        <div *ngIf="syncService.permissionError()" class="rules-card">
          <div class="rules-card-header">
            <app-icon name="alert-triangle" [size]="20" extraClass="text-red"></app-icon>
            <div>
              <h4 class="rules-card-title">Solución al Error de Permisos en Firebase</h4>
              <p class="rules-card-sub">Tu base de datos Cloud Firestore (proyecto <code>menu-app-nmg</code>) necesita actualizar sus reglas de seguridad.</p>
            </div>
          </div>

          <ol class="rules-steps">
            <li>Abre la <a href="https://console.firebase.google.com/project/menu-app-nmg/firestore/rules" target="_blank" class="rules-link">Consola Firebase &gt; Firestore &gt; pestaña Reglas (Rules)</a>.</li>
            <li>Reemplaza el contenido por las siguientes reglas y haz clic en <strong>Publicar (Publish)</strong>:</li>
          </ol>

          <pre class="rules-code"><code>rules_version = '2';

service cloud.firestore &#123;
  match /databases/&#123;database&#125;/documents &#123;
    match /households/&#123;householdId&#125;/&#123;document=**&#125; &#123;
      allow read, write: if true;
    &#125;
  &#125;
&#125;</code></pre>

          <div class="rules-actions">
            <button class="btn-copy-rules" (click)="copyRules()">
              <app-icon name="copy" [size]="15"></app-icon>
              <span>{{ copiedRules ? '¡Copiado con éxito!' : 'Copiar Reglas al Portapapeles' }}</span>
            </button>
            <button class="btn-retry-sync" (click)="testSync()">
              <app-icon name="refresh" [size]="15" [extraClass]="syncService.isSyncing() ? 'spin' : ''"></app-icon>
              <span>Reintentar Conexión</span>
            </button>
          </div>
        </div>

      </div>

      <!-- Save Config Button -->
      <div class="save-bar">
        <button class="btn-save-config" (click)="saveSettings()">
          <app-icon name="check" [size]="16"></app-icon> Guardar Configuración
        </button>
      </div>

    </div>
  `,
  styles: [`
    .settings-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 4px;
    }

    .settings-header {
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

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.82rem;
      font-weight: 700;
      background: #fee2e2;
      color: #991b1b;
    }
    .status-pill.is-online {
      background: #d1fae5;
      color: #065f46;
    }

    .config-card {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .card-icon-title {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .text-emerald { color: #059669; }

    .card-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #1e293b;
    }

    .card-sub {
      font-size: 0.82rem;
      color: #64748b;
      margin-top: 2px;
    }

    .form-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .flex-1 { flex: 1; min-width: 220px; }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
    }

    .form-input {
      padding: 10px 14px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 0.92rem;
      outline: none;
    }
    .form-input:focus { border-color: #10b981; }

    .font-mono { font-family: monospace; }
    .uppercase { text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px; }

    .sync-actions-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f8fafc;
      padding: 14px 18px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      flex-wrap: wrap;
      gap: 12px;
    }

    .sync-info {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 0.85rem;
    }

    .info-line {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-label { font-weight: 600; color: #475569; }

    .btn-sync-now {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      background: #10b981;
      color: #ffffff;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.88rem;
    }
    .btn-sync-now:hover:not(:disabled) { background: #059669; }

    .sync-alert {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .alert-success { background: #d1fae5; color: #065f46; }
    .alert-error { background: #fee2e2; color: #991b1b; }

    /* Rules instruction card */
    .rules-card {
      margin-top: 14px;
      padding: 16px;
      background: #fff1f2;
      border: 1px solid #fecdd3;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .rules-card-header {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }
    .rules-card-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #9f1239;
      margin: 0;
    }
    .rules-card-sub {
      font-size: 0.8rem;
      color: #be123c;
      margin: 2px 0 0 0;
    }
    .rules-steps {
      margin: 0;
      padding-left: 20px;
      font-size: 0.84rem;
      color: #881337;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .rules-link {
      color: #be123c;
      font-weight: 600;
      text-decoration: underline;
    }
    .rules-code {
      background: #1e293b;
      color: #f8fafc;
      padding: 12px 14px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 0.82rem;
      line-height: 1.4;
      overflow-x: auto;
      margin: 0;
    }
    .rules-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .btn-copy-rules {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #be123c;
      color: #ffffff;
      border: none;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .btn-copy-rules:hover {
      background: #9f1239;
    }
    .btn-retry-sync {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ffffff;
      color: #be123c;
      border: 1px solid #fecdd3;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-retry-sync:hover {
      background: #fff1f2;
    }

    .save-bar {
      display: flex;
      justify-content: flex-end;
    }

    .btn-save-config {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 24px;
      background: #10b981;
      color: #ffffff;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.95rem;
      box-shadow: 0 4px 6px rgba(16, 185, 129, 0.25);
    }
    .btn-save-config:hover { background: #059669; }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `]
})
export class SettingsComponent implements OnInit {
  syncService = inject(SyncService);
  firestoreService = inject(FirestoreService);

  householdCode = 'HOGAR-2026';
  householdName = 'Mi Hogar';
  copiedRules = false;

  async ngOnInit(): Promise<void> {
    this.householdCode = this.firestoreService.householdCode();
    this.householdName = this.firestoreService.householdName();
  }

  lastSyncDisplay(): string {
    const d = new Date(this.firestoreService.lastSyncAt());
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  async saveSettings(): Promise<void> {
    const code = this.householdCode.trim().toUpperCase() || 'HOGAR-2026';
    const name = this.householdName.trim() || 'Mi Hogar';
    this.firestoreService.setHousehold(code, name);
    alert('¡Código de hogar guardado y sincronizado con Firebase!');
  }

  async testSync(): Promise<void> {
    await this.syncService.syncNow();
  }

  copyRules(): void {
    const rules = `rules_version = '2';\n\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /households/{householdId}/{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`;
    navigator.clipboard.writeText(rules).then(() => {
      this.copiedRules = true;
      setTimeout(() => this.copiedRules = false, 3000);
    });
  }
}
