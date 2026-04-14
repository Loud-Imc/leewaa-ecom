const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Order Data Purge ---');
    console.log('WARNING: This will delete ALL orders and order items only.');
    console.log('All products, categories, users, banners, and other data will be kept.');

    // Delete order items first (foreign key dependency)
    console.log('Deleting OrderItems...');
    const deletedItems = await prisma.orderItem.deleteMany({});
    console.log(`Deleted ${deletedItems.count} order items.`);

    // Delete orders
    console.log('Deleting Orders...');
    const deletedOrders = await prisma.order.deleteMany({});
    console.log(`Deleted ${deletedOrders.count} orders.`);

    console.log('✅ Done! All orders have been cleared. All other data is untouched.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
