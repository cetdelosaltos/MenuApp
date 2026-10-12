const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const pkgPath = path.join(rootDir, 'package.json');
const tauriPath = path.join(rootDir, 'src-tauri', 'tauri.conf.json');
const gradlePath = path.join(rootDir, 'android', 'app', 'build.gradle');
const envPath = path.join(rootDir, 'src', 'environments', 'environment.ts');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const currentVersion = pkg.version;
const [major, minor, patch] = currentVersion.split('.').map(n => parseInt(n, 10) || 0);

const arg = (process.argv[2] || 'patch').toLowerCase();
let newVersion = '';

if (arg === 'patch') {
  newVersion = `${major}.${minor}.${patch + 1}`;
} else if (arg === 'minor') {
  newVersion = `${major}.${minor + 1}.0`;
} else if (arg === 'major') {
  newVersion = `${major + 1}.0.0`;
} else if (/^\d+\.\d+\.\d+$/.test(arg)) {
  newVersion = arg;
} else {
  console.error(`❌ Argumento no válido: "${arg}". Usa: patch, minor, major o una versión exacta como "1.2.1"`);
  process.exit(1);
}

// 1. package.json
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log(`✅ package.json: ${currentVersion} -> ${newVersion}`);

// 2. src-tauri/tauri.conf.json
if (fs.existsSync(tauriPath)) {
  const tauri = JSON.parse(fs.readFileSync(tauriPath, 'utf8'));
  tauri.version = newVersion;
  fs.writeFileSync(tauriPath, JSON.stringify(tauri, null, 2) + '\n', 'utf8');
  console.log(`✅ tauri.conf.json: ${newVersion}`);
}

// 3. android/app/build.gradle
let newVersionCode = 1;
if (fs.existsSync(gradlePath)) {
  let gradleContent = fs.readFileSync(gradlePath, 'utf8');
  const codeMatch = gradleContent.match(/versionCode\s+(\d+)/);
  if (codeMatch) {
    newVersionCode = parseInt(codeMatch[1], 10) + 1;
    gradleContent = gradleContent.replace(/versionCode\s+\d+/, `versionCode ${newVersionCode}`);
  }
  gradleContent = gradleContent.replace(/versionName\s+"[^"]+"/, `versionName "${newVersion}"`);
  fs.writeFileSync(gradlePath, gradleContent, 'utf8');
  console.log(`✅ build.gradle: versionName "${newVersion}", versionCode ${newVersionCode}`);
}

// 4. src/environments/environment.ts
if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  envContent = envContent.replace(/appVersion:\s*'[^']+'/, `appVersion: '${newVersion}'`);
  envContent = envContent.replace(/appVersionCode:\s*\d+/, `appVersionCode: ${newVersionCode}`);
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log(`✅ environment.ts: appVersion '${newVersion}', appVersionCode ${newVersionCode}`);
}

console.log(`\n🎉 Versión actualizada a ${newVersion} (Build ${newVersionCode}) en todos los archivos del proyecto!`);
console.log(`Ahora puedes compilar (Android / Desktop) y luego ejecutar 'npm run release'.\n`);
