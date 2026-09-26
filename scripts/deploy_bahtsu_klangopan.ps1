<#
.SYNOPSIS
    Deploy Bahtsu Klangopan Web App ke VPS (103.177.95.140) pada subdomain bahtsu.mia02sgs.sch.id
.DESCRIPTION
    Skrip ini melakukan build frontend, mengunggah ke VPS, memasang service systemd,
    membuat Nginx vhost, dan menerbitkan sertifikat SSL Let's Encrypt via acme.sh.
#>

$VpsHost = "103.177.95.140"
$VpsPort = 2288
$SshKey  = "C:\Users\Administrator\.ssh\vps_deploy_ed25519"
$Domain  = "bahtsu.mia02sgs.sch.id"
$RemoteDir = "/root/bahtsu-klangopan"
$AppPort = 20130

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   Deploy Bahtsu Klangopan ke https://$Domain ($VpsHost)        " -ForegroundColor Cyan
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
ssh -p $VpsPort -i $SshKey -o StrictHostKeyChecking=no root@$VpsHost "mkdir -p $RemoteDir/web $RemoteDir/kajian /www/wwwroot/$Domain /www/server/panel/vhost/cert/$Domain"

# 3. Sinkronisasi berkas aplikasi
Write-Host "3. Mengunggah berkas aplikasi ke VPS..." -ForegroundColor Yellow
scp -P $VpsPort -i $SshKey -r "c:\xampp\htdocs\bahtsu\web\dist" root@${VpsHost}:${RemoteDir}/web/
scp -P $VpsPort -i $SshKey "c:\xampp\htdocs\bahtsu\web\server.js" root@${VpsHost}:${RemoteDir}/web/
scp -P $VpsPort -i $SshKey "c:\xampp\htdocs\bahtsu\web\package.json" root@${VpsHost}:${RemoteDir}/web/
scp -P $VpsPort -i $SshKey "c:\xampp\htdocs\bahtsu\SKILL.md" root@${VpsHost}:${RemoteDir}/
scp -P $VpsPort -i $SshKey -r "c:\xampp\htdocs\bahtsu\kajian" root@${VpsHost}:${RemoteDir}/

# 4. Konfigurasi Node.js Service & Nginx VHost dengan SSL
Write-Host "4. Mengonfigurasi Service, SSL, dan Nginx di VPS..." -ForegroundColor Yellow
$RemoteScript = @"
set -e

cd $RemoteDir/web
npm install --omit=dev --silent

# Buat Systemd Service
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
Environment=DEFAULT_MODEL=ag/gemini-3.8-flash-high

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable bahtsu-klangopan
systemctl restart bahtsu-klangopan

# Siapkan Nginx Port 80 untuk verifikasi Let's Encrypt
cat << 'EOF' > /www/server/panel/vhost/nginx/$Domain.conf
server {
    listen 80;
    server_name $Domain;
    root /www/wwwroot/$Domain;

    location ^~ /.well-known/acme-challenge/ {
        root /www/wwwroot/$Domain;
        try_files `$uri =404;
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:$AppPort;
        proxy_http_version 1.1;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_buffering off;
    }

    access_log /www/wwwlogs/$Domain.log;
    error_log /www/wwwlogs/$Domain.error.log;
}
EOF

nginx -t && nginx -s reload

# Terbitkan Sertifikat SSL jika belum ada
if [ ! -f /www/server/panel/vhost/cert/$Domain/fullchain.pem ]; then
    echo "Menerbitkan sertifikat SSL Let's Encrypt via acme.sh..."
    /root/.acme.sh/acme.sh --issue -d $Domain -w /www/wwwroot/$Domain --keylength ec-256 --force
    /root/.acme.sh/acme.sh --install-cert -d $Domain --ecc \
        --key-file       /www/server/panel/vhost/cert/$Domain/privkey.pem \
        --fullchain-file /www/server/panel/vhost/cert/$Domain/fullchain.pem \
        --reloadcmd      "nginx -s reload"
fi

# Tulis Nginx Vhost final lengkap dengan SSL & HTTP/2
cat << 'EOF' > /www/server/panel/vhost/nginx/$Domain.conf
server {
    listen 80;
    server_name $Domain;

    location ^~ /.well-known/acme-challenge/ {
        root /www/wwwroot/$Domain;
        try_files `$uri =404;
        access_log off;
    }

    location / {
        return 301 https://`$host`$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name $Domain;

    ssl_certificate     /www/server/panel/vhost/cert/$Domain/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/$Domain/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff always;
    error_page 497 https://`$host`$request_uri;

    location ^~ /.well-known/acme-challenge/ {
        root /www/wwwroot/$Domain;
        try_files `$uri =404;
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:$AppPort;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        
        # SSE & Streaming Support
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    access_log /www/wwwlogs/$Domain.log;
    error_log /www/wwwlogs/$Domain.error.log;
}
EOF

nginx -t && nginx -s reload
systemctl status bahtsu-klangopan --no-pager
"@

ssh -p $VpsPort -i $SshKey -o StrictHostKeyChecking=no root@$VpsHost $RemoteScript

Write-Host "================================================================" -ForegroundColor Green
Write-Host "  ✅ Deploy Berhasil ke VPS!" -ForegroundColor Green
Write-Host "  Aplikasi aktif: https://$Domain" -ForegroundColor Cyan
Write-Host "  Passcode Akses: klangopan2026" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Green
