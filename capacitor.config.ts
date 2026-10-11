import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.menufamiliarnmg.app',
  appName: 'Menú Familiar',
  webDir: 'dist/menu-app/browser',
  server: {
    androidScheme: 'https'
  }
};

export default config;
