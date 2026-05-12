export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);
}

export function calculateDiscountedPrice(price: number, discount: number): number {
    return Math.round(price * (1 - discount / 100));
}

export function getImageUrl(path: string): string {
    if (!path || path === 'placeholder-product.jpg' || path.includes('placeholder')) {
        return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
    }
    if (path.startsWith('http')) return path;

    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1')
        .replace('/api/v1', '')
        .replace(/\/+$/, ''); // Remove trailing slashes

    // If path already contains /uploads/ or uploads/, just ensure it starts with /
    if (path.startsWith('uploads/') || path.startsWith('/uploads/')) {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${baseUrl}${cleanPath}`;
    }

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}/uploads${cleanPath}`;
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}
