const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Purge (KEEPING PRODUCTS & CATEGORIES) ---');
    console.log('WARNING: This will delete orders, customers, and other test data.');

    // 1. Delete dependent transactional data
    console.log('Deleting OrderItems...');
    await prisma.orderItem.deleteMany({});

    console.log('Deleting Orders...');
    await prisma.order.deleteMany({});

    console.log('Deleting Cart items...');
    await prisma.cart.deleteMany({});

    console.log('Deleting Wishlist items...');
    await prisma.wishlist.deleteMany({});

    console.log('Deleting Referrals...');
    await prisma.referral.deleteMany({});

    console.log('Deleting Audit Logs...');
    await prisma.auditLog.deleteMany({});

    // 2. Delete Users (Keep Admins/Super Admins)
    console.log('Deleting Non-Admin Users...');
    const deletedUsers = await prisma.user.deleteMany({
        where: {
            role: {
                notIn: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
            }
        }
    });
    console.log(`Deleted ${deletedUsers.count} customers/test users.`);

    // 3. Delete Addresses without users
    console.log('Deleting unused Addresses...');
    await prisma.address.deleteMany({
        where: {
            userId: null
        }
    });

    // 4. Optionally delete Banners if they are test data
    console.log('Deleting Banners...');
    await prisma.banner.deleteMany({});

    console.log('Purge Complete! Products and Categories are untouched.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
