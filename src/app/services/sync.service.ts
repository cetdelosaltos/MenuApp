import { Injectable, inject, signal, computed } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { HouseholdConfig } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private firestore = inject(FirestoreService);

  readonly serverUrl = 'Firebase Cloud Firestore (Real-Time)';

  isOnline = computed<boolean>(() => this.firestore.isOnline());
  isSyncing = computed<boolean>(() => this.firestore.isConnecting());
  permissionError = computed<boolean>(() => this.firestore.permissionError());
  pendingChangesCount = signal<number>(0);

  config = computed<HouseholdConfig>(() => ({
    householdCode: this.firestore.householdCode(),
    householdName: this.firestore.householdName(),
    serverUrl: this.serverUrl,
    syncEnabled: true,
    autoSync: true,
    lastSyncAt: this.firestore.lastSyncAt()
  }));

  lastSyncResult = computed<{ success: boolean; message: string; timestamp?: string } | null>(() => {
    if (this.firestore.permissionError()) {
      return {
        success: false,
        message: 'Error de permisos: Faltan configurar las Reglas de Seguridad en Firebase Firestore.',
        timestamp: this.firestore.lastSyncAt()
      };
    }
    return {
      success: true,
      message: 'Conectado a Firebase Firestore en tiempo real.',
      timestamp: this.firestore.lastSyncAt()
    };
  });

  async init(): Promise<void> {}

  async loadConfig(): Promise<HouseholdConfig> {
    return this.config();
  }

  async saveConfig(newConfig: Partial<HouseholdConfig>): Promise<void> {
    if (newConfig.householdCode) {
      this.firestore.setHousehold(
        newConfig.householdCode,
        newConfig.householdName || this.firestore.householdName()
      );
    }
  }

  async refreshPendingCount(): Promise<number> {
    return 0;
  }

  async syncNow(): Promise<boolean> {
    this.firestore.setHousehold(this.firestore.householdCode(), this.firestore.householdName());
    return !this.firestore.permissionError();
  }
}
