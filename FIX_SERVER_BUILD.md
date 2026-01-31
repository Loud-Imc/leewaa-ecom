# Fix Server Build Issue

## Problem
The `.git` directory is missing on the server, so you can't pull updates. The storefront build fails due to Next.js 15 compatibility.

## Solution: Re-clone Repository (Recommended)

This is the cleanest approach:

```bash
# Backup your .env files first
cp /var/www/leewaa-ecom/backend/.env /tmp/backend.env
cp /var/www/leewaa-ecom/storefront/.env.local /tmp/storefront.env
cp /var/www/leewaa-ecom/admin/.env.local /tmp/admin.env 2>/dev/null || true

# Remove and re-clone
cd /var/www
rm -rf leewaa-ecom
git clone https://github.com/Loud-Imc/leewaa-ecom.git leewaa-ecom
cd leewaa-ecom

# Restore .env files
cp /tmp/backend.env backend/.env
cp /tmp/storefront.env storefront/.env.local
cp /tmp/admin.env admin/.env.local 2>/dev/null || true

# Build backend
cd backend
npm ci
npx prisma migrate deploy
npm run build

# Build storefront (with the fix)
cd ../storefront
npm ci
npm run build

# Build admin
cd ../admin
npm ci
npm run build
```

## Next: Set up PM2 and Nginx

After successful builds, continue with the [SERVER_SETUP.md](./SERVER_SETUP.md) guide at **Step 7: Set Up PM2**.
