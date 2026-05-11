import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding 10 premium products...');

    // Get categories or create if missing
    const categories = await prisma.category.findMany();
    if (categories.length === 0) {
        console.log('No categories found. Please run main seed first.');
        return;
    }

    const domesticId = categories.find(c => c.slug === 'domestic-ro')?.id || categories[0].id;
    const alkalineId = categories.find(c => c.slug === 'alkaline-filters')?.id || categories[0].id;

    const products = [
        {
            name: 'Leewaa Pro Max RO+UV+UF',
            slug: 'leewaa-pro-max-ro-uv-uf',
            description: 'The ultimate purification system with 9-stage filtration and smart monitoring.',
            price: 18999,
            discount: 20,
            stock: 45,
            categoryId: domesticId,
            features: [
                { id: '1', text: '9-Stage Advanced Purification', icon: 'FaDroplet' },
                { id: '2', text: 'UV LED Protection in Tank', icon: 'FaSun' },
                { id: '3', text: 'Smart Filter Life Indicator', icon: 'FaMicrochip' }
            ],
            colors: ['#FFFFFF', '#000000', '#C0C0C0'],
            images: ['/uploads/cat-domestic-ro.png']
        },
        {
            name: 'Leewaa Eco Alkaline Plus',
            slug: 'leewaa-eco-alkaline-plus',
            description: 'Balanced pH water for better health. Retains essential minerals naturally.',
            price: 14500,
            discount: 10,
            stock: 30,
            categoryId: alkalineId,
            features: [
                { id: '1', text: 'Alkaline pH 8.5-9.5', icon: 'FaVial' },
                { id: '2', text: 'Natural Mineral Fortification', icon: 'FaGem' },
                { id: '3', text: 'Eco-Friendly Water Saving', icon: 'FaLeaf' }
            ],
            colors: ['#E6F7FF', '#FFFFFF'],
            images: ['/uploads/cat-alkaline.png']
        },
        {
            name: 'Leewaa Smart IoT Purifier',
            slug: 'leewaa-smart-iot-purifier',
            description: 'Control your water purity from anywhere using the Leewaa Mobile App.',
            price: 21000,
            discount: 15,
            stock: 25,
            categoryId: domesticId,
            features: [
                { id: '1', text: 'Mobile App Integration', icon: 'FaMobile' },
                { id: '2', text: 'Real-time TDS Monitoring', icon: 'FaTv' },
                { id: '3', text: 'Auto-Service Booking', icon: 'FaBolt' }
            ],
            colors: ['#1A1A1A', '#333333'],
            images: ['/uploads/cat-domestic-ro.png']
        },
        {
            name: 'Leewaa Copper+ Zinc RO',
            slug: 'leewaa-copper-zinc-ro',
            description: 'Infuse the goodness of Copper and Zinc into your daily drinking water.',
            price: 16999,
            discount: 12,
            stock: 40,
            categoryId: domesticId,
            features: [
                { id: 'Copper1', text: 'Active Copper Technology', icon: 'FaFlask' },
                { id: 'Zinc1', text: 'Zinc Fortification', icon: 'FaMedal' },
                { id: 'Pure1', text: '100% Pure RO Water', icon: 'FaShieldHalved' }
            ],
            colors: ['#B87333', '#FFFFFF'],
            images: ['/uploads/cat-domestic-ro.png']
        },
        {
            name: 'Leewaa Under-Sink Elite',
            slug: 'leewaa-under-sink-elite',
            description: 'Sleek design that fits perfectly under your kitchen counter. No clutter.',
            price: 19500,
            discount: 5,
            stock: 15,
            categoryId: domesticId,
            features: [
                { id: 'f1', text: 'Space Saving Design', icon: 'FaFilter' },
                { id: 'f2', text: 'High Flow Rate', icon: 'FaBolt' },
                { id: 'f3', text: 'Easy Maintenance', icon: 'FaShieldHalved' }
            ],
            colors: ['#808080'],
            images: ['/uploads/cat-domestic-ro.png']
        },
        {
            name: 'Leewaa Portable UV Wand',
            slug: 'leewaa-portable-uv-wand',
            description: 'Instant sterilization for your water while traveling. Compact and powerful.',
            price: 3499,
            discount: 25,
            stock: 100,
            categoryId: alkalineId,
            features: [
                { id: 'p1', text: '99.9% Bacteria Kill', icon: 'FaSun' },
                { id: 'p2', text: 'USB Rechargeable', icon: 'FaBolt' },
                { id: 'p3', text: 'Travel Friendly', icon: 'FaLeaf' }
            ],
            colors: ['#007BFF', '#FFC107'],
            images: ['/uploads/cat-alkaline.png']
        },
        {
            name: 'Leewaa Office Ultra RO (50 LPH)',
            slug: 'leewaa-office-ultra-ro',
            description: 'Heavy-duty water purification for large offices and institutions.',
            price: 45000,
            discount: 18,
            stock: 10,
            categoryId: domesticId,
            features: [
                { id: 'o1', text: '50 Liters Per Hour', icon: 'FaBolt' },
                { id: 'o2', text: 'Double RO Membrane', icon: 'FaShieldHalved' },
                { id: 'o3', text: 'Stainless Steel Body', icon: 'FaMedal' }
            ],
            colors: ['#D3D3D3'],
            images: ['/uploads/cat-domestic-ro.png']
        },
        {
            name: 'Leewaa Home Essential RO',
            slug: 'leewaa-home-essential-ro',
            description: 'Budget-friendly RO without compromising on safety. Perfect for small families.',
            price: 9999,
            discount: 30,
            stock: 60,
            categoryId: domesticId,
            features: [
                { id: 'h1', text: '6-Stage RO Process', icon: 'FaDroplet' },
                { id: 'h2', text: 'Compact Wall Mount', icon: 'FaFilter' },
                { id: 'h3', text: 'Low Energy Consumpt', icon: 'FaBolt' }
            ],
            colors: ['#FFFFFF'],
            images: ['/uploads/cat-domestic-ro.png']
        },
        {
            name: 'Leewaa Mineral Plus+',
            slug: 'leewaa-mineral-plus',
            description: 'Enriches water with Calcium, Magnesium, and Potassium.',
            price: 12800,
            discount: 10,
            stock: 35,
            categoryId: alkalineId,
            features: [
                { id: 'm1', text: 'Mineral Retention', icon: 'FaGem' },
                { id: 'm2', text: 'TDS Controller', icon: 'FaTv' },
                { id: 'm3', text: 'Healthy Hydration', icon: 'FaVial' }
            ],
            colors: ['#F0FFF0', '#FFFFFF'],
            images: ['/uploads/cat-alkaline.png']
        },
        {
            name: 'Leewaa Nano Filtration System',
            slug: 'leewaa-nano-filtration',
            description: 'Cutting-edge nano-technology for ultra-pure drinking water.',
            price: 24999,
            discount: 5,
            stock: 12,
            categoryId: domesticId,
            features: [
                { id: 'n1', text: 'Nano-Fiber Tech', icon: 'FaMicrochip' },
                { id: 'n2', text: 'Virus & Cyst Removal', icon: 'FaShieldHalved' },
                { id: 'n3', text: 'Premium Matte Finish', icon: 'FaMedal' }
            ],
            colors: ['#2C3E50', '#7F8C8D'],
            images: ['/uploads/cat-domestic-ro.png']
        }
    ];

    for (const p of products) {
        await prisma.product.upsert({
            where: { slug: p.slug },
            update: {
                features: p.features,
                colors: p.colors,
            },
            create: {
                ...p,
                isActive: true,
                isFeatured: true,
                metaTitle: p.name + ' | Leewaa',
                metaDescription: p.description
            }
        });
        console.log(`✓ Seeded product: ${p.name}`);
    }

    console.log('\n✅ 10 Products seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
