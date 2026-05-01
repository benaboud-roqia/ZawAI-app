# Script pour generer APK depuis dossier propre
Write-Host "Preparation du build APK..." -ForegroundColor Cyan

# 1. Creer dossier temporaire
$tempDir = "C:\ZawIA-Clean"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# 2. Copier les fichiers necessaires
Write-Host "Copie des fichiers..." -ForegroundColor Yellow
$exclude = @("node_modules", ".expo", "android", "ios", "dist", "*.log", "pnpm-workspace.yaml")
Get-ChildItem "artifacts\zawyaai" -Exclude $exclude | Copy-Item -Destination $tempDir -Recurse -Force

# 3. Aller dans le dossier
Set-Location $tempDir

# 4. Supprimer les fichiers problematiques
if (Test-Path "pnpm-workspace.yaml") { Remove-Item "pnpm-workspace.yaml" -Force }
if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" -Force }

# 5. Installer avec npm
Write-Host "Installation des dependances avec npm..." -ForegroundColor Yellow
npm install --legacy-peer-deps

# 6. Builder l'APK
Write-Host "Build de l'APK..." -ForegroundColor Green
$env:EXPO_TOKEN = "UqVrrB6zYIILqTmoys7TLVLxq-HwnoS8i9rfIwQz"
npx eas-cli@latest build -p android --profile preview --non-interactive

Write-Host "Build termine !" -ForegroundColor Green
Write-Host "Telecharge l'APK depuis le lien Expo affiche ci-dessus" -ForegroundColor Cyan

# Retour au dossier original
Set-Location "C:\Users\Roqia\Downloads\Zawya-AI-Studio\Zawya-AI-Studio"
