# GitHub & Deployment Setup Guide

## ✅ Completed Steps
- [x] Git repository initialized
- [x] All files staged and committed
- [x] Deployment workflows created
- [x] .gitignore configured

---

## Next Steps

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon (top right) → **"New repository"**
3. Fill in the details:
   - **Repository name**: `leewaa-ecom`
   - **Description**: "Leewaa E-commerce Platform - Water Purification Products"
   - **Visibility**: Private (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license
4. Click **"Create repository"**

### Step 2: Connect Local Repository to GitHub

After creating the repo, GitHub will show you commands. Run these in your project directory:

```powershell
# Open PowerShell in: c:\Users\kamar\OneDrive\Desktop\Loud IMC projects\WaterFilterProject\leewaa-ecom

# Add the remote repository (replace <USERNAME> with your GitHub username)
git remote add origin https://github.com/<USERNAME>/leewaa-ecom.git

# Rename branch to main (if needed)
git branch -M main

# Push code to GitHub
git push -u origin main
```

**Example:**
```powershell
git remote add origin https://github.com/LeewaaCorp/leewaa-ecom.git
git branch -M main
git push -u origin main
```

### Step 3: Configure GitHub Secrets (for Auto-Deployment)

1. In your GitHub repository, go to: **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"** for each of the following:

#### Secret 1: SERVER_SSH_KEY
- **Name**: `SERVER_SSH_KEY`
- **Value**: Your SSH private key (see "Generating SSH Key" section below)

#### Secret 2: SERVER_HOST
- **Name**: `SERVER_HOST`
- **Value**: Your server IP address (e.g., `123.456.789.0`)

#### Secret 3: SERVER_USER
- **Name**: `SERVER_USER`
- **Value**: `root` (or your SSH username)

---

## Generating SSH Key for GitHub Actions

### On Your Server (SSH into your server first):

```bash
# Generate a new SSH key specifically for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-leewaa" -f ~/.ssh/github_actions_leewaa

# Add the public key to authorized_keys
cat ~/.ssh/github_actions_leewaa.pub >> ~/.ssh/authorized_keys

# Display the PRIVATE key (copy this entire output)
cat ~/.ssh/github_actions_leewaa
```

**Copy the entire private key output** (from `-----BEGIN OPENSSH PRIVATE KEY-----` to `-----END OPENSSH PRIVATE KEY-----`) and paste it as the value for `SERVER_SSH_KEY` in GitHub Secrets.

---

## Server Setup

### Step 1: SSH into Your Server

```bash
ssh root@<your-server-ip>
```

### Step 2: Create Project Directory

```bash
cd /var/www
mkdir -p leewaa-ecom
cd leewaa-ecom
```

### Step 3: Clone Repository

```bash
# Replace <USERNAME> with your GitHub username
git clone https://github.com/<USERNAME>/leewaa-ecom.git .

# Configure git
git config user.email "server@leewaa.com"
git config user.name "Leewaa Server"
```

### Step 4: Set Up Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Run these SQL commands:
CREATE DATABASE leewaa_ecom;
CREATE USER leewaa_user WITH ENCRYPTED PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE leewaa_ecom TO leewaa_user;
\q
```

### Step 5: Configure Environment Variables

```bash
# Backend .env
cd /var/www/leewaa-ecom/backend
nano .env
```

Paste this (update the values):
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://leewaa_user:your_strong_password@localhost:5432/leewaa_ecom
JWT_SECRET=<generate-random-string>
JWT_REFRESH_SECRET=<generate-random-string>
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=7d
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Generate secure secrets:**
```bash
openssl rand -base64 32  # Run twice for JWT_SECRET and JWT_REFRESH_SECRET
```

```bash
# Storefront .env.local
cd /var/www/leewaa-ecom/storefront
nano .env.local
```

Paste:
```env
NEXT_PUBLIC_API_URL=https://api.leewaa.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
```

```bash
# Admin .env.local
cd /var/www/leewaa-ecom/admin
nano .env.local
```

Paste:
```env
NEXT_PUBLIC_API_URL=https://api.leewaa.com
```

### Step 6: Install Dependencies & Build

```bash
# Backend
cd /var/www/leewaa-ecom/backend
npm ci
npx prisma migrate deploy
npm run build

# Create uploads directory
mkdir -p uploads
chown -R www-data:www-data uploads
chmod -R 755 uploads

# Storefront
cd /var/www/leewaa-ecom/storefront
npm ci
npm run build

# Admin
cd /var/www/leewaa-ecom/admin
npm ci
npm run build
```

### Step 7: Set Up PM2

```bash
cd /var/www/leewaa-ecom
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 8: Configure Nginx

Create three nginx config files:

```bash
# Backend API
sudo nano /etc/nginx/sites-available/leewaa-api
```

Paste:
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

    location /uploads {
        alias /var/www/leewaa-ecom/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Storefront
sudo nano /etc/nginx/sites-available/leewaa-shop
```

Paste:
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

```bash
# Admin Panel
sudo nano /etc/nginx/sites-available/leewaa-admin
```

Paste:
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

Enable the sites:
```bash
sudo ln -s /etc/nginx/sites-available/leewaa-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/leewaa-shop /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/leewaa-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 9: Install SSL Certificates

```bash
sudo apt install certbot python3-certbot-nginx -y

# Generate certificates
sudo certbot --nginx -d api.leewaa.com
sudo certbot --nginx -d shop.leewaa.com -d www.leewaa.com
sudo certbot --nginx -d admin.leewaa.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Verification

### Check if everything is running:

```bash
# PM2 status
pm2 status

# PM2 logs
pm2 logs

# Check each app
curl http://localhost:3001  # Backend should respond
curl http://localhost:3000  # Storefront
curl http://localhost:3002  # Admin

# Check Nginx
sudo systemctl status nginx
```

### Access your applications:

- **Storefront**: https://shop.leewaa.com
- **Admin Panel**: https://admin.leewaa.com
- **API**: https://api.leewaa.com

---

## Testing Auto-Deployment

1. Make a small change to any file (e.g., update README.md)
2. Commit and push:
   ```powershell
   git add .
   git commit -m "Test auto-deployment"
   git push origin main
   ```
3. Watch the GitHub Actions workflow:
   - Go to your GitHub repo → **Actions** tab
   - You should see the workflow running
4. Check the server logs:
   ```bash
   pm2 logs
   ```

---

## Troubleshooting

### GitHub Push Issues
```powershell
# If authentication fails, use Personal Access Token
# GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
# Generate new token with 'repo' scope
# Use token as password when pushing
```

### PM2 Not Starting
```bash
pm2 delete all
pm2 start ecosystem.config.js
pm2 logs
```

### Nginx 502 Error
```bash
# Check if PM2 apps are running
pm2 status

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Database Connection Failed
```bash
# Verify DATABASE_URL is correct in backend/.env
# Test PostgreSQL connection
psql "postgresql://leewaa_user:password@localhost:5432/leewaa_ecom"
```

---

## 🎉 You're Done!

Once everything is set up:
- Every push to `main` branch will auto-deploy
- PM2 will auto-restart apps if they crash
- SSL certificates will auto-renew
- You can monitor everything with `pm2 monit`
