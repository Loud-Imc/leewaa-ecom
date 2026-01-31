import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@leewaa.com' },
        update: {},
        create: {
            email: 'admin@leewaa.com',
            password: adminPassword,
            firstName: 'Admin',
            lastName: 'User',
            phone: '+911234567890',
            role: 'ADMIN',
            referralCode: 'ADMIN001',
        },
    });
    console.log('✓ Created admin user:', admin.email);

    // Create customer user
    const customerPassword = await bcrypt.hash('Customer@123', 10);
    const customer = await prisma.user.upsert({
        where: { email: 'customer@leewaa.com' },
        update: {},
        create: {
            email: 'customer@leewaa.com',
            password: customerPassword,
            firstName: 'John',
            lastName: 'Doe',
            phone: '+919876543210',
            role: 'CUSTOMER',
            referralCode: 'CUST001',
        },
    });
    console.log('✓ Created customer user:', customer.email);

    // Create referral config
    const referralConfig = await prisma.referralConfig.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            discountPercentage: 10,
            maxDiscountAmount: 500,
            minPurchaseAmount: 1000,
            referrerRewardEnabled: true,
            referredRewardEnabled: true,
        },
    });
    console.log('✓ Created referral config');

    // Create categories
    const domesticRO = await prisma.category.upsert({
        where: { slug: 'domestic-ro' },
        update: {},
        create: {
            name: 'Domestic RO',
            slug: 'domestic-ro',
            description: 'Advanced RO water purifiers for home use',
            image: '/uploads/cat-domestic-ro.png',
            isActive: true,
            position: 1,
        },
    });
    console.log('✓ Created category: Domestic RO');

    const alkalineFilters = await prisma.category.upsert({
        where: { slug: 'alkaline-filters' },
        update: {},
        create: {
            name: 'Alkaline Filters',
            slug: 'alkaline-filters',
            description: 'Water filters that provide healthy alkaline water',
            image: '/uploads/cat-alkaline.png',
            isActive: true,
            position: 2,
        },
    });
    console.log('✓ Created category: Alkaline Filters');

    const spareParts = await prisma.category.upsert({
        where: { slug: 'spare-parts' },
        update: {},
        create: {
            name: 'Spare Parts',
            slug: 'spare-parts',
            description: 'High quality spare parts for all water filters',
            image: '/uploads/cat-spare-parts.png',
            isActive: true,
            position: 3,
        },
    });
    console.log('✓ Created category: Spare Parts');

    // Create sample products
    const product1 = await prisma.product.upsert({
        where: { slug: 'reverse-osmosis-water-purifier' },
        update: {},
        create: {
            categoryId: domesticRO.id,
            name: 'Reverse Osmosis Water Purifier',
            slug: 'reverse-osmosis-water-purifier',
            description: 'Advanced RO water purifier with 7-stage filtration',
            price: 12999,
            discount: 15,
            stock: 50,
            images: ['/uploads/cat-domestic-ro.png'],
            isActive: true,
            isFeatured: true,
            metaTitle: 'Best RO Water Purifier - Leewaa',
            metaDescription: 'Buy advanced reverse osmosis water purifier with 7-stage filtration',
        },
    });
    console.log('✓ Created product:', product1.name);

    const product2 = await prisma.product.upsert({
        where: { slug: 'uv-smart-water-filter' },
        update: {},
        create: {
            categoryId: domesticRO.id,
            name: 'UV Smart Water Filter',
            slug: 'uv-smart-water-filter',
            description: 'UV technology water filter for pure drinking water',
            price: 8999,
            discount: 10,
            stock: 75,
            images: ['/uploads/cat-alkaline.png'],
            isActive: true,
            isFeatured: true,
            metaTitle: 'UV Water Filter - Leewaa',
            metaDescription: 'Advanced UV water filtration system',
        },
    });
    console.log('✓ Created product:', product2.name);

    // Create sample banners
    await prisma.banner.deleteMany({}); // Clear existing to avoid duplicate titles/positions

    const banner1 = await prisma.banner.create({
        data: {
            title: 'Pure Water for Your Family',
            description: 'Discover our advanced RO & UV purification systems',
            image: '/uploads/hero-banner.png',
            link: '/products',
            position: 1,
            isActive: true,
        },
    });
    console.log('✓ Created banner:', banner1.title);

    const banner2 = await prisma.banner.create({
        data: {
            title: 'UV Smart Purification',
            description: 'Smart tech for guaranteed water safety and mineral retention',
            image: '/uploads/uv-smart-banner.png',
            link: '/products',
            position: 2,
            isActive: true,
        },
    });
    console.log('✓ Created banner:', banner2.title);

    const banner3 = await prisma.banner.create({
        data: {
            title: 'Commercial Solutions',
            description: 'Heavy duty purifiers for offices and industries',
            image: '/uploads/commercial-banner.png',
            link: '/products',
            position: 3,
            isActive: true,
        },
    });
    console.log('✓ Created banner:', banner3.title);

    // Create sample coupon
    const coupon = await prisma.coupon.upsert({
        where: { code: 'WELCOME10' },
        update: {},
        create: {
            code: 'WELCOME10',
            type: 'PERCENTAGE',
            value: 10,
            minPurchase: 1000,
            maxDiscount: 500,
            validFrom: new Date(),
            validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
            usageLimit: 100,
            isActive: true,
        },
    });
    console.log('✓ Created coupon:', coupon.code);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDefault credentials:');
    console.log('Admin: admin@leewaa.com / Admin@123');
    console.log('Customer: customer@leewaa.com / Customer@123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
