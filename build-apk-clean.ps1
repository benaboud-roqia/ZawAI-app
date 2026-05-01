# Script pour builder l'APK depuis un dossier propre
Write-Host "Preparation du build APK..." -ForegroundColor Cyan

# 1. Creer un dossier temporaire propre
$tempDir = "C:\ZawIA-Build-Temp"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# 2. Copier uniquement le dossier zawyaai
Write-Host "Copie des fichiers..." -ForegroundColor Yellow
Copy-Item "artifacts\zawyaai\*" -Destination $tempDir -Recurse -Exclude @("node_modules", ".expo", "android", "ios", "dist", "*.log")

# 3. Nettoyer les references au monorepo
Write-Host "Nettoyage des references monorepo..." -ForegroundColor Yellow
Set-Location $tempDir

# Supprimer pnpm-workspace.yaml s'il existe
if (Test-Path "pnpm-workspace.yaml") {
    Remove-Item "pnpm-workspace.yaml"
}

# Supprimer package-lock.json ancien
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json"
}

# 4. Installer les dependances proprement
Write-Host "Installation des dependances..." -ForegroundColor Yellow
npm install --legacy-peer-deps

# 5. Builder l'APK
Write-Host "Build de l'APK avec EAS..." -ForegroundColor Green
$env:EXPO_TOKEN = "UqVrrB6zYIILqTmoys7TLVLxq-HwnoS8i9rfIwQz"
npx eas-cli@latest build -p android --profile preview --non-interactive

Write-Host "Build termine !" -ForegroundColor Green
Write-Host "Telecharge l'APK depuis le lien affiche ci-dessus" -ForegroundColor Cyan
