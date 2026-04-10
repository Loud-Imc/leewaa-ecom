const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Audit ---');

    const tables = [
        'user', 'address', 'category', 'product', 'order',
        'orderItem', 'coupon', 'referral', 'cart', 'wishlist',
        'banner', 'auditLog'
    ];

    for (const table of tables) {
        try {
            const count = await prisma[table].count();
            console.log(`${table.padEnd(15)}: ${count} records`);
        } catch (e) {
            console.log(`${table.padEnd(15)}: Error (skipping)`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
