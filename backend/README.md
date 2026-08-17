# Guía de Despliegue del Backend en VPS con CWP7 (CentOS Web Panel 7)

Este directorio contiene el backend REST en **PHP 8.3** y el esquema **MySQL** para sincronizar los datos de MenuApp en tiempo real y offline-first.

---

## 1. Crear Base de Datos en CWP7
1. Ingresa a tu panel de CWP7 (`https://tu-ip:2083` o `https://tu-ip:2087`).
2. Ve a **SQL Services** -> **MySQL Manager** -> **Create Database & User**:
   - Nombre de BD: `menu_app_db`
   - Usuario: `menu_user`
   - Contraseña: `[TU_CONTRASEÑA_SEGURA]`
3. Abre **phpMyAdmin** desde CWP7, selecciona la base de datos `menu_app_db` y ejecuta el script `schema.sql`.

---

## 2. Subir Archivos PHP al Servidor
1. Sube la carpeta `api/` a la raíz pública de tu dominio o subdominio (ejemplo: `/home/usuario/public_html/api/` o `/home/usuario/menu-api/`).
2. Edita el archivo `api/config.php` con tus credenciales de MySQL:
   ```php
   $db_host = '127.0.0.1';
   $db_name = 'menu_app_db';
   $db_user = 'menu_user';
   $db_pass = 'tu_contraseña_aqui';
   ```

---

## 3. Configurar en la Aplicación
1. Abre la aplicación MenuApp.
2. Ve a la pestaña **Configuración**.
3. Ingresa tu **Código de Hogar** (ej: `HOGAR-2026`).
4. Ingresa la URL del backend (ej: `https://tu-dominio.com/api`).
5. Activa la casilla **"Activar sincronización con el VPS en la nube"**.
6. Haz clic en **Sincronizar Ahora**. ¡Listo!
