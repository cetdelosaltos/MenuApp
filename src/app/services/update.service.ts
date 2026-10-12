import { Injectable, signal, computed, inject } from '@angular/core';
import { doc, onSnapshot, setDoc, getDoc, getFirestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { AppPlatformRelease, AppVersionConfig } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  private firestore = getFirestore(getApp());
  private readonly configDocPath = 'households/SYSTEM/appConfig/version';

  readonly currentVersion = environment.appVersion;
  readonly currentVersionCode = environment.appVersionCode;

  // Platform detection
  readonly isAndroid = Capacitor.getPlatform() === 'android';
  readonly isDesktop = !this.isAndroid && (!!(window as any).__TAURI_INTERNALS__ || !!(window as any).__TAURI__);
  readonly isWeb = !this.isAndroid && !this.isDesktop;

  readonly platformKey: 'android' | 'desktop' = this.isAndroid ? 'android' : 'desktop';
  readonly platformName = this.isAndroid ? 'Android' : (this.isDesktop ? 'Windows Desktop' : 'Web');

  // Reactive state
  remoteConfig = signal<AppVersionConfig | null>(null);
  hasUpdate = signal<boolean>(false);
  availableRelease = signal<AppPlatformRelease | null>(null);
  isChecking = signal<boolean>(false);
  dismissed = signal<boolean>(false);
  lastCheckedAt = signal<string | null>(null);

  constructor() {
    this.listenToRemoteVersion();
  }

  /**
   * Listen to real-time changes of the version config in Firebase Firestore
   */
  private listenToRemoteVersion(): void {
    const ref = doc(this.firestore, this.configDocPath);
    onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as AppVersionConfig;
        this.remoteConfig.set(data);
        this.evaluateUpdate(data);
      }
    }, (err) => {
      console.warn('UpdateService: Error al escuchar actualizaciones remotas:', err.message);
    });
  }

  /**
   * Compares remote release for current platform with installed version
   */
  private evaluateUpdate(config: AppVersionConfig): void {
    const release = this.isAndroid ? config.android : config.desktop;
    if (!release || !release.version) {
      this.hasUpdate.set(false);
      this.availableRelease.set(null);
      return;
    }

    const isNewer = this.compareSemver(release.version, this.currentVersion) > 0 ||
      (this.isAndroid && release.versionCode && release.versionCode > this.currentVersionCode);

    if (isNewer) {
      this.availableRelease.set(release);
      this.hasUpdate.set(true);
    } else {
      this.hasUpdate.set(false);
      this.availableRelease.set(null);
    }
    this.lastCheckedAt.set(new Date().toISOString());
  }

  /**
   * Manual update check from UI
   */
  async checkForUpdates(): Promise<boolean> {
    this.isChecking.set(true);
    this.dismissed.set(false);
    try {
      const ref = doc(this.firestore, this.configDocPath);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as AppVersionConfig;
        this.remoteConfig.set(data);
        this.evaluateUpdate(data);
      } else {
        // Initialize default remote version doc if none exists
        await this.initializeDefaultConfig();
      }
      return this.hasUpdate();
    } catch (err) {
      console.error('Error al verificar actualización:', err);
      return false;
    } finally {
      this.isChecking.set(false);
    }
  }

  /**
   * Dismiss the update notification for the current session
   */
  dismissUpdate(): void {
    this.dismissed.set(true);
  }

  /**
   * Triggers the download of the update (APK on Android, installer on desktop)
   */
  downloadAndInstall(): void {
    const release = this.availableRelease();
    if (!release || !release.downloadUrl) return;

    // Open download link in system browser / download manager
    window.open(release.downloadUrl, '_system');
  }

  /**
   * Publish a new release in Firestore (can be executed from Settings)
   */
  async publishRelease(platform: 'android' | 'desktop', releaseData: AppPlatformRelease): Promise<void> {
    const ref = doc(this.firestore, this.configDocPath);
    const current = this.remoteConfig() || {};
    const updated: AppVersionConfig = {
      ...current,
      [platform]: {
        ...releaseData,
        publishedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    };

    await setDoc(ref, updated, { merge: true });
    this.remoteConfig.set(updated);
    this.evaluateUpdate(updated);
  }

  private async initializeDefaultConfig(): Promise<void> {
    const ref = doc(this.firestore, this.configDocPath);
    const initialConfig: AppVersionConfig = {
      android: {
        version: this.currentVersion,
        versionCode: this.currentVersionCode,
        downloadUrl: 'https://github.com/cetdelosaltos/MenuApp/releases/latest/download/MenuFamiliar.apk',
        notes: 'Versión inicial con corrección de menús y lista de compras.',
        mandatory: false,
        publishedAt: new Date().toISOString()
      },
      desktop: {
        version: this.currentVersion,
        downloadUrl: 'https://github.com/cetdelosaltos/MenuApp/releases/latest/download/MenuFamiliar-Desktop-Setup.exe',
        notes: 'Versión inicial con corrección de menús y lista de compras.',
        mandatory: false,
        publishedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    };
    await setDoc(ref, initialConfig, { merge: true });
    this.remoteConfig.set(initialConfig);
  }

  /**
   * Semantic version comparison: returns 1 if vA > vB, -1 if vA < vB, 0 if equal
   */
  private compareSemver(vA: string, vB: string): number {
    const cleanA = vA.replace(/^v/i, '').trim();
    const cleanB = vB.replace(/^v/i, '').trim();
    const partsA = cleanA.split('.').map(n => parseInt(n, 10) || 0);
    const partsB = cleanB.split('.').map(n => parseInt(n, 10) || 0);
    const len = Math.max(partsA.length, partsB.length);

    for (let i = 0; i < len; i++) {
      const a = partsA[i] || 0;
      const b = partsB[i] || 0;
      if (a > b) return 1;
      if (a < b) return -1;
    }
    return 0;
  }
}
