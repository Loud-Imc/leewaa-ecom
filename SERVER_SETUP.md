# Leewaa E-commerce - Server Setup Guide

## Prerequisites
- Ubuntu/Debian server with root access
- Node.js 18+ installed
- PostgreSQL 14+ installed  
- Nginx installed
- PM2 installed globally (`npm install -g pm2`)
- Git installed

---

## Step 1: Initial Server Setup

### 1.1 Create Directory Structure
```bash
cd /var/www
mkdir -p leewaa-ecom/{backend,storefront,admin}
chown -R www-data:www-data leewaa-ecom
chmod -R 755 leewaa-ecom
```

### 1.2 Clone Repository
```bash
cd /var/www/leewaa-ecom
git clone <your-github-repo-url> .
# OR if repo exists:
git init
git remote add origin <your-github-repo-url>
git pull origin main
```

---

## Step 2: Database Setup

### 2.1 Create PostgreSQL Database
```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE leewaa_ecom;
CREATE USER leewaa_user WITH ENCRYPTED PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE leewaa_ecom TO leewaa_user;
\q
```

### 2.2 Configure Backend Environment
```bash
cd /var/www/leewaa-ecom/backend
cat > .env << EOF
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://leewaa_user:strong_password_here@localhost:5432/leewaa_ecom
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=7d
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
EOF
```

### 2.3 Run Database Migrations
```bash
cd /var/www/leewaa-ecom/backend
npm install
npx prisma migrate deploy
npx prisma db seed  # If you have seed data
```

---

## Step 3: Build Applications

### 3.1 Backend
```bash
cd /var/www/leewaa-ecom/backend
npm ci --production
npm run build
```

### 3.2 Storefront
```bash
cd /var/www/leewaa-ecom/storefront
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://api.leewaa.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
EOF
npm ci --production
npm run build
```

### 3.3 Admin Panel
```bash
cd /var/www/leewaa-ecom/admin
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://api.leewaa.com
EOF
npm ci --production
npm run build
```

---

## Step 4: PM2 Process Management

### 4.1 Copy Ecosystem Config
```bash
cp ecosystem.config.js /var/www/waterfilter/
```

### 4.2 Start All Applications
```bash
cd /var/www/leewaa-ecom
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4.3 Verify Processes
```bash
pm2 status
pm2 logs
```

---

## Step 5: Nginx Configuration

### 5.1 Backend API (`/etc/nginx/sites-available/leewaa-api`)
```nginx
server {
    listen 80;
    server_name api.leewaa.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads directory
    location /uploads {
        alias /var/www/leewaa-ecom/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5.2 Storefront (`/etc/nginx/sites-available/leewaa-shop`)
```nginx
server {
    listen 80;
    server_name shop.leewaa.com www.leewaa.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5.3 Admin Panel (`/etc/nginx/sites-available/leewaa-admin`)
```nginx
server {
    listen 80;
    server_name admin.leewaa.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5.4 Enable Sites
```bash
ln -s /etc/nginx/sites-available/leewaa-api /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/leewaa-shop /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/leewaa-admin /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## Step 6: SSL Certificates (Let's Encrypt)

### 6.1 Install Certbot
```bash
apt install certbot python3-certbot-nginx -y
```

### 6.2 Generate Certificates
```bash
certbot --nginx -d api.leewaa.com
certbot --nginx -d shop.leewaa.com -d www.leewaa.com
certbot --nginx -d admin.leewaa.com
```

### 6.3 Test Auto-Renewal
```bash
certbot renew --dry-run
```

---

## Step 7: GitHub Actions Setup

### 7.1 Generate SSH Key for GitHub Actions
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy
cat ~/.ssh/github_actions_deploy.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_actions_deploy  # Copy this private key
```

### 7.2 Add GitHub Secrets
Go to GitHub Repository → Settings → Secrets and variables → Actions:

- `SERVER_SSH_KEY`: (Paste the private key from above)
- `SERVER_HOST`: Your server IP address
- `SERVER_USER`: `root` (or your SSH user)

### 7.3 Initialize Repository on Server
```bash
cd /var/www/leewaa-ecom
git config --global user.email "server@leewaa.com"
git config --global user.name "Leewaa Server"
```

---

## Step 8: File Upload Directory

### 8.1 Create Uploads Directory
```bash
mkdir -p /var/www/leewaa-ecom/backend/uploads
chown -R www-data:www-data /var/www/leewaa-ecom/backend/uploads
chmod -R 755 /var/www/leewaa-ecom/backend/uploads
```

---

## Step 9: Monitoring & Logs

### 9.1 PM2 Logs
```bash
pm2 logs --lines 100
pm2 logs leewaa-backend
pm2 logs leewaa-storefront
pm2 logs leewaa-admin
```

### 9.2 Nginx Logs
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 9.3 PM2 Monitoring
```bash
pm2 monit
```

---

## Step 10: Deployment Testing

### 10.1 Test Auto-Deployment
1. Make a small change to any file in `backend/`, `storefront/`, or `admin/`
2. Commit and push to `main` branch
3. Watch GitHub Actions workflow
4. Verify deployment on server: `pm2 logs`

### 10.2 Manual Deployment (if needed)
```bash
cd /var/www/leewaa-ecom
# Backend
cd backend && git pull && npm ci && npm run build && pm2 restart leewaa-backend
# Storefront
cd ../storefront && git pull && npm ci && npm run build && pm2 restart leewaa-storefront
# Admin
cd ../admin && git pull && npm ci && npm run build && pm2 restart leewaa-admin
```

---

## Troubleshooting

### Application Not Starting
```bash
pm2 logs <app-name>
pm2 restart <app-name>
pm2 delete <app-name>
pm2 start ecosystem.config.js
```

### Nginx 502 Bad Gateway
- Check if PM2 processes are running: `pm2 status`
- Check if ports are correct in Nginx config
- Test backend directly: `curl http://localhost:3001`

### Database Connection Issues
- Verify `DATABASE_URL` in `.env`
- Check PostgreSQL is running: `systemctl status postgresql`
- Test connection: `psql $DATABASE_URL`

### SSL Certificate Issues
```bash
certbot certificates  # List all certificates
certbot renew --force-renewal -d domain.com
```

---

## Security Checklist

- [x] Firewall configured (UFW or iptables)
- [x] SSH key authentication only (disable password auth)
- [x] SSL certificates installed
- [x] `.env` files secured (chmod 600)
- [x] PostgreSQL password strong and unique
- [x] JWT secrets randomly generated
- [x] Regular backups configured
- [x] PM2 logs rotation enabled

---

## Maintenance

### Database Backup
```bash
pg_dump -U leewaa_user leewaa_ecom > backup_$(date +%Y%m%d).sql
```

### Update Dependencies
```bash
cd /var/www/leewaa-ecom/<app>
npm audit fix
npm update
```

### Clear PM2 Logs
```bash
pm2 flush
```
