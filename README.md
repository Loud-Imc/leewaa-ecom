# Leewaa E-commerce Platform

Premium water purification e-commerce platform with customer storefront, admin panel, and backend API.

## 🏗️ Architecture

- **Backend**: NestJS API with PostgreSQL & Prisma ORM
- **Storefront**: Next.js customer-facing shop
- **Admin**: Next.js admin management panel

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone Repository
```bash
git clone <repo-url>
cd leewaa-ecom
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure your DATABASE_URL and secrets
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

### 3. Storefront Setup
```bash
cd storefront
npm install
cp .env.example .env.local  # Set NEXT_PUBLIC_API_URL
npm run dev
```

### 4. Admin Panel Setup
```bash
cd admin
npm install
cp .env.example .env.local  # Set NEXT_PUBLIC_API_URL
npm run dev
```

## 📦 Deployment

See [SERVER_SETUP.md](./SERVER_SETUP.md) for complete deployment instructions.

### Auto-Deployment via GitHub Actions
Push to `main` branch to trigger automatic deployment:
- `backend/**` → Deploys API
- `storefront/**` → Deploys customer shop
- `admin/**` → Deploys admin panel

## 🔧 Tech Stack

- **Backend**: NestJS, Prisma, PostgreSQL, JWT, Razorpay
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Deployment**: PM2, Nginx, Let's Encrypt SSL
- **CI/CD**: GitHub Actions

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/db
JWT_SECRET=your-secret
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret
```

### Storefront (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-key
```

### Admin (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🌐 Production URLs

- **Storefront**: https://shop.leewaa.com
- **Admin Panel**: https://admin.leewaa.com
- **API**: https://api.leewaa.com

## 👥 Default Admin Credentials

Create admin user via Prisma seed or direct database insert.

## 📚 Documentation

- [Deployment Plan](./deployment_plan.md)
- [Server Setup Guide](./SERVER_SETUP.md)
- [Implementation Plan](./implementation_plan.md)
- [Walkthrough](./walkthrough.md)

## 🔒 Security

- JWT-based authentication
- Role-based access control (CUSTOMER, ADMIN)
- Secure payment integration with Razorpay
- SSL/TLS encryption in production

## 📞 Support

For issues or questions, contact: support@leewaa.com
