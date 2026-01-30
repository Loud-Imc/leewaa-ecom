import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Registering additional banners...');

    // Ensure the first one exists or update it
    await prisma.banner.upsert({
        where: { id: 'leewaa-hero-1' },
        update: {
            title: 'Pure Water, Healthy Life',
            description: 'Discover our range of advanced water filtration systems designed for your well-being.',
            image: 'leewaa_hero_banner.png',
            link: '/products',
            position: 1,
            isActive: true,
        },
        create: {
            id: 'leewaa-hero-1',
            title: 'Pure Water, Healthy Life',
            description: 'Discover our range of advanced water filtration systems designed for your well-being.',
            image: 'leewaa_hero_banner.png',
            link: '/products',
            position: 1,
            isActive: true,
        }
    });

    await prisma.banner.upsert({
        where: { id: 'leewaa-hero-2' },
        update: {
            title: 'Smart UV-C Purification',
            description: 'Next-generation intelligent water purifiers with advanced UV-C sterilization technology.',
            image: 'leewaa_banner_uv_smart.png',
            link: '/products',
            position: 2,
            isActive: true,
        },
        create: {
            id: 'leewaa-hero-2',
            title: 'Smart UV-C Purification',
            description: 'Next-generation intelligent water purifiers with advanced UV-C sterilization technology.',
            image: 'leewaa_banner_uv_smart.png',
            link: '/products',
            position: 2,
            isActive: true,
        }
    });

    await prisma.banner.upsert({
        where: { id: 'leewaa-hero-3' },
        update: {
            title: 'Commercial Solutions',
            description: 'Reliable, high-capacity filtration for offices, hotels, and industrial needs.',
            image: 'leewaa_banner_commercial.png',
            link: '/products',
            position: 3,
            isActive: true,
        },
        create: {
            id: 'leewaa-hero-3',
            title: 'Commercial Solutions',
            description: 'Reliable, high-capacity filtration for offices, hotels, and industrial needs.',
            image: 'leewaa_banner_commercial.png',
            link: '/products',
            position: 3,
            isActive: true,
        }
    });

    console.log('Banners registered successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
