const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// 1. Cargar variables de entorno desde .env
function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.substring(0, eqIdx).trim();
      const val = trimmed.substring(eqIdx + 1).trim();
      env[key] = val;
    }
  });
  return env;
}

const env = loadEnv();
const token = process.env.GITHUB_TOKEN || env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPO || env.GITHUB_REPO || 'cetdelosaltos/MenuApp';

if (!token || token.trim() === '') {
  console.error('\n❌ ERROR: Falta configurar el GITHUB_TOKEN.');
  console.error('Por favor, agrega tu token en el archivo .env:\n');
  console.error('   GITHUB_TOKEN=ghp_tuTokenAqui...\n');
  console.error('Puedes crearlo en: https://github.com/settings/tokens (permiso: repo)\n');
  process.exit(1);
}

// 2. Leer versión y paquetes locales
const pkgPath = path.resolve(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version;
const tagName = `v${version}`;

const rootDir = path.resolve(__dirname, '..');
const apkPath = path.join(rootDir, 'MenuFamiliar.apk');
const exePath = path.join(rootDir, 'MenuFamiliar-Desktop-Setup.exe');

const filesToUpload = [];
if (fs.existsSync(apkPath)) {
  filesToUpload.push({ name: 'MenuFamiliar.apk', path: apkPath, contentType: 'application/vnd.android.package-archive' });
} else {
  console.warn('⚠️ No se encontró MenuFamiliar.apk en la raíz. Recuerda compilarlo antes.');
}

if (fs.existsSync(exePath)) {
  filesToUpload.push({ name: 'MenuFamiliar-Desktop-Setup.exe', path: exePath, contentType: 'application/vnd.microsoft.portable-executable' });
} else {
  console.warn('⚠️ No se encontró MenuFamiliar-Desktop-Setup.exe en la raíz.');
}

if (filesToUpload.length === 0) {
  console.error('\n❌ No hay archivos compilados para subir. Ejecuta primero la compilación.');
  process.exit(1);
}

// 3. Helper para llamadas a GitHub API
async function ghRequest(url, options = {}) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'User-Agent': 'MenuApp-Publisher',
    'Accept': 'application/vnd.github.v3+json',
    ...(options.headers || {})
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GitHub API [${res.status} ${res.statusText}]: ${errorText}`);
  }
  return res.json();
}

async function run() {
  console.log(`\n========================================`);
  console.log(`🚀 Publicando Release ${tagName} en GitHub (${repo})`);
  console.log(`========================================\n`);

  // Paso 1: Obtener o crear el Release en GitHub
  let release;
  try {
    release = await ghRequest(`https://api.github.com/repos/${repo}/releases/tags/${tagName}`);
    console.log(`ℹ️ El release ${tagName} ya existía en GitHub (ID: ${release.id}). Se actualizarán los archivos.`);
  } catch (err) {
    console.log(`📦 Creando nuevo release ${tagName} en GitHub...`);
    const releaseBody = {
      tag_name: tagName,
      target_commitish: 'main',
      name: `Menú Familiar v${version}`,
      body: `Novedades de la versión v${version}:\n- Corrección en la persistencia del menú semanal.\n- Generación completa de ingredientes en la lista de compras.\n- Soporte para actualizaciones automáticas remotas.`,
      draft: false,
      prerelease: false
    };

    release = await ghRequest(`https://api.github.com/repos/${repo}/releases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(releaseBody)
    });
    console.log(`✅ Release creado con éxito en GitHub!`);
  }

  // Paso 2: Subir cada archivo como Asset del Release
  const uploadedUrls = {};

  for (const file of filesToUpload) {
    console.log(`\n📤 Subiendo ${file.name} (${(fs.statSync(file.path).size / (1024 * 1024)).toFixed(2)} MB)...`);

    // Si ya existía un asset con ese nombre, eliminarlo primero para reemplazarlo
    if (release.assets && release.assets.length > 0) {
      const existing = release.assets.find(a => a.name === file.name);
      if (existing) {
        console.log(`   Eliminando asset anterior con el mismo nombre (ID: ${existing.id})...`);
        await fetch(`https://api.github.com/repos/${repo}/releases/assets/${existing.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'MenuApp-Publisher'
          }
        });
      }
    }

    const fileBuffer = fs.readFileSync(file.path);
    const uploadUrl = `https://uploads.github.com/repos/${repo}/releases/${release.id}/assets?name=${encodeURIComponent(file.name)}`;

    const assetRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'MenuApp-Publisher',
        'Content-Type': file.contentType,
        'Content-Length': fileBuffer.length
      },
      body: fileBuffer
    });

    if (!assetRes.ok) {
      const errTxt = await assetRes.text();
      throw new Error(`Error al subir ${file.name}: ${errTxt}`);
    }

    const asset = await assetRes.json();
    uploadedUrls[file.name] = asset.browser_download_url;
    console.log(`   ✅ ${file.name} subido con éxito!`);
    console.log(`   🔗 Enlace: ${asset.browser_download_url}`);
  }

  // Paso 3: Actualizar Firebase Firestore para que notifique a los dispositivos
  console.log(`\n🔥 Sincronizando con Firebase Firestore...`);
  const firebaseConfig = {
    apiKey: "AIzaSyD5I9FcQ22mgkJfsvjhPRAQGppl_Bw0EPg",
    authDomain: "menu-app-nmg.firebaseapp.com",
    projectId: "menu-app-nmg",
    storageBucket: "menu-app-nmg.firebasestorage.app"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const updateDoc = {
    android: {
      version: version,
      versionCode: 2,
      downloadUrl: uploadedUrls['MenuFamiliar.apk'] || `https://github.com/${repo}/releases/download/${tagName}/MenuFamiliar.apk`,
      notes: `Menú Familiar v${version}: Correcciones de menú y lista de compras.`,
      mandatory: false,
      publishedAt: new Date().toISOString()
    },
    desktop: {
      version: version,
      downloadUrl: uploadedUrls['MenuFamiliar-Desktop-Setup.exe'] || `https://github.com/${repo}/releases/download/${tagName}/MenuFamiliar-Desktop-Setup.exe`,
      notes: `Menú Familiar v${version}: Correcciones de menú y lista de compras.`,
      mandatory: false,
      publishedAt: new Date().toISOString()
    },
    updatedAt: new Date().toISOString()
  };

  const versionDocRef = doc(db, 'households/SYSTEM/appConfig/version');
  await setDoc(versionDocRef, updateDoc, { merge: true });
  console.log(`✅ Firebase actualizado! Todos los dispositivos recibirán la notificación de actualización.\n`);

  console.log(`========================================`);
  console.log(`🎉 PUBLICACIÓN COMPLETADA CON ÉXITO!`);
  console.log(`========================================`);
  console.log(`Tag: ${tagName}`);
  console.log(`Android APK: ${updateDoc.android.downloadUrl}`);
  console.log(`Desktop EXE: ${updateDoc.desktop.downloadUrl}\n`);
}

run().catch(err => {
  console.error('\n❌ ERROR durante la publicación:', err.message);
  process.exit(1);
});
