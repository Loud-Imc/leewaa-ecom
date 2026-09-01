export const FB_PIXEL_ID = '1067271849616022';

declare global {
    interface Window {
        fbq?: any;
    }
}

/**
 * Track PageView event
 */
export const pageview = () => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'PageView');
    }
};

/**
 * Track standard or custom Meta Pixel event
 */
export const event = (name: string, options: Record<string, any> = {}) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', name, options);
    }
};

/**
 * Track AddToCart event
 */
export const trackAddToCart = (product?: { id?: string; name?: string; price?: number; currency?: string }) => {
    if (product) {
        event('AddToCart', {
            content_name: product.name,
            content_ids: product.id ? [product.id] : [],
            content_type: 'product',
            value: product.price || 0,
            currency: product.currency || 'INR',
        });
    } else {
        event('AddToCart');
    }
};

/**
 * Track Purchase event
 */
export const trackPurchase = (order?: { value?: number; currency?: string; orderId?: string }) => {
    if (order) {
        event('Purchase', {
            value: order.value || 0,
            currency: order.currency || 'INR',
            content_type: 'product',
            order_id: order.orderId,
        });
    } else {
        event('Purchase');
    }
};
