# Regla de Sincronización de Versiones (Versioning Rule)

Cada vez que se introduzcan cambios importantes, nuevas funciones o se preparen nuevas compilaciones para Android o Desktop, **se debe incrementar y mantener sincronizado el número de versión** de manera uniforme en todos los archivos del proyecto:

1. **`package.json`**:
   - `"version"`: `"X.Y.Z"`

2. **`src-tauri/tauri.conf.json`**:
   - `"version"`: `"X.Y.Z"`

3. **`android/app/build.gradle`**:
   - `versionName`: `"X.Y.Z"`
   - `versionCode`: Incrementar en `+1` (ej. 2 -> 3)

4. **`src/environments/environment.ts`**:
   - `appVersion`: `'X.Y.Z'`
   - `appVersionCode`: mismo número que `versionCode` de Android

5. **`src/app/components/settings.component.ts`**:
   - `publishVersion`: valor sugerido para la siguiente versión
   - `publishVersionCode`: valor sugerido para el siguiente build

6. **Firebase Version Channel**:
   - El documento `households/SYSTEM/appConfig/version` en Firestore debe reflejar la última versión compilada para que los dispositivos instalados reciban la notificación de actualización remota.
