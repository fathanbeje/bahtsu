<#
.SYNOPSIS
    Deploy Bahtsu Klangopan Web App ke VPS (103.177.95.140) berdampingan dengan 9Router.
.DESCRIPTION
    Skrip ini melakukan build frontend, mengunggah backend dan dist ke VPS,
    serta memasang systemd service agar Bahtsu Klangopan berjalan 24/7 di VPS.
#>

$VpsHost = "103.177.95.140"
$VpsPort = 2288
$SshKey  = "C:\Users\Administrator\.ssh\vps_deploy_ed25519"
$RemoteDir = "/root/bahtsu-klangopan"
$AppPort = 20130

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "       Deploy Bahtsu Klangopan ke VPS (Port $AppPort)           " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

# 1. Build Frontend lokal
Write-Host "1. Membangun bundle produksi frontend..." -ForegroundColor Yellow
Set-Location -Path "c:\xampp\htdocs\bahtsu\web"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build frontend gagal! Periksa error di atas." -ForegroundColor Red
    exit 1
}

# 2. Buat direktori di VPS
Write-Host "2. Mempersiapkan folder di VPS..." -ForegroundColor Yellow
ssh -p $VpsPort -i $SshKey root@$VpsHost "mkdir -p $RemoteDir/web $RemoteDir/kajian"

# 3. Sinkronisasi berkas
Write-Host "3. Mengunggah berkas aplikasi ke VPS..." -ForegroundColor Yellow
scp -P $VpsPort -i $SshKey -r "c:\xampp\htdocs\bahtsu\web\dist" root@${VpsHost}:${RemoteDir}/web/
scp -P $VpsPort -i $SshKey "c:\xampp\htdocs\bahtsu\web\server.js" root@${VpsHost}:${RemoteDir}/web/
scp -P $VpsPort -i $SshKey "c:\xampp\htdocs\bahtsu\web\package.json" root@${VpsHost}:${RemoteDir}/web/
scp -P $VpsPort -i $SshKey "c:\xampp\htdocs\bahtsu\SKILL.md" root@${VpsHost}:${RemoteDir}/
scp -P $VpsPort -i $SshKey -r "c:\xampp\htdocs\bahtsu\kajian" root@${VpsHost}:${RemoteDir}/

# 4. Install dependencies di VPS & pasang systemd service
Write-Host "4. Menjalankan konfigurasi service di VPS..." -ForegroundColor Yellow
$RemoteCommands = @"
cd $RemoteDir/web
npm install --omit=dev --silent

cat << 'EOF' > /etc/systemd/system/bahtsu-klangopan.service
[Unit]
Description=Bahtsu Klangopan - Studio Bahtsul Masail Web App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$RemoteDir/web
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
Environment=PORT=$AppPort
Environment=NODE_ENV=production
Environment=ROUTER_URL=http://127.0.0.1:20128/v1
Environment=ROUTER_API_KEY=sk-b0435a91b1afbc70-18t4z6-be53e7b7
Environment=MASTER_PASSCODE=klangopan2026
Environment=DEFAULT_MODEL=gemini-2.5-pro

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable bahtsu-klangopan
systemctl restart bahtsu-klangopan
systemctl status bahtsu-klangopan --no-pager
"@

ssh -p $VpsPort -i $SshKey root@$VpsHost $RemoteCommands

Write-Host "================================================================" -ForegroundColor Green
Write-Host "  ✅ Deploy Berhasil!" -ForegroundColor Green
Write-Host "  Aplikasi aktif di VPS: http://${VpsHost}:${AppPort}" -ForegroundColor Cyan
Write-Host "  Passcode Akses: klangopan2026" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Green
