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
  pendingChangesCount = signal<number>(0);

  config = computed<HouseholdConfig>(() => ({
    householdCode: this.firestore.householdCode(),
    householdName: this.firestore.householdName(),
    serverUrl: this.serverUrl,
    syncEnabled: true,
    autoSync: true,
    lastSyncAt: this.firestore.lastSyncAt()
  }));

  lastSyncResult = signal<{ success: boolean; message: string; timestamp?: string } | null>({
    success: true,
    message: 'Conectado a Firebase Firestore en tiempo real.',
    timestamp: new Date().toISOString()
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
    this.lastSyncResult.set({
      success: true,
      message: 'Sincronizado en tiempo real con Firebase Firestore.',
      timestamp: new Date().toISOString()
    });
    return true;
  }
}
