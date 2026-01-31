# 🔐 Leewaa E-commerce Credentials

## Default Admin Account

Use these credentials to log into the admin panel:

- **URL**: https://admin.leewaa.in
- **Email**: `admin@leewaa.com`
- **Password**: `Admin@123`
- **Role**: ADMIN

---

## Default Customer Account

Use these credentials to test the storefront:

- **URL**: https://shop.leewaa.in
- **Email**: `customer@leewaa.com`
- **Password**: `Customer@123`
- **Role**: CUSTOMER

---

## Database Access

- **Host**: localhost
- **Port**: 5432
- **Database**: leewaa_ecom
- **User**: postgres
- **Password**: (as configured in backend/.env)

---

## Payment Integration

### Razorpay (Test Mode)
- **Key ID**: `rzp_test_S65WwQ1LkzFaPc`
- **Key Secret**: (see backend/.env)
- **Mode**: TEST

---

## Important URLs

- **Storefront**: https://shop.leewaa.in
- **Admin Panel**: https://admin.leewaa.in
- **Backend API**: https://api.leewaa.in/api/v1
- **API Health**: https://api.leewaa.in/api/v1/dashboard/stats (requires auth)

---

## Security Notes

⚠️ **IMPORTANT**: Change all default credentials in production!

1. Update admin password after first login
2. Create unique admin accounts for team members
3. Delete or disable the default customer account
4. Update Razorpay keys to production mode before going live
5. Never commit `.env` files to Git

---

## Troubleshooting

### Admin Login Issues

1. Ensure backend is running on port 3002
2. Check CORS is configured correctly
3. Verify API URL in admin/.env.local: `NEXT_PUBLIC_API_URL=https://api.leewaa.in/api/v1`

### Database Seeding

If database is empty, run on server:
```bash
cd /var/www/leewaa-ecom/backend
npm run seed
```
