export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    short_description: string;
    category_id: string;
    brand?: string;
    base_price: number;
    sale_price?: number;
    stock_quantity: number;
    min_stock_alert: number;
    images: string[];
    tags: string[];
    avg_rating: number;
    review_count: number;
    sales_count: number;
    is_featured: boolean;
    is_active: boolean;
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    parent_id?: string;
    description?: string;
    icon?: string;
    image_url?: string;
    display_order: number;
    is_active: boolean;
}

export interface ProductVariant {
    id: string;
    product_id: string;
    sku: string;
    name: string;
    price_modifier: number;
    stock_quantity: number;
    attributes: Record<string, any>;
    is_active: boolean;
}

export interface CartItem {
    id: string;
    product: Product;
    variant?: ProductVariant;
    quantity: number;
}

export interface Order {
    id: string;
    user_id: string;
    order_number: string;
    status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    subtotal: number;
    shipping_cost: number;
    discount_amount: number;
    tax_amount: number;
    total: number;
    payment_method?: string;
    payment_status: string;
    shipping_address?: Record<string, any>;
    billing_address?: Record<string, any>;
    tracking_code?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    variant_id?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_snapshot: Record<string, any>;
}

export interface ProductReview {
    id: string;
    product_id: string;
    user_id: string;
    order_id?: string;
    rating: number;
    title: string;
    comment: string;
    helpful_count: number;
    verified_purchase: boolean;
    images: string[];
    created_at: string;
}

export interface Coupon {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_purchase?: number;
    max_discount?: number;
    usage_limit?: number;
    usage_count: number;
    starts_at?: string;
    expires_at?: string;
    is_active: boolean;
}

export interface PetProfile {
    id: string;
    user_id: string;
    name: string;
    species: string;
    breed?: string;
    size?: 'small' | 'medium' | 'large';
    age_years?: number;
    weight_kg?: number;
    dietary_restrictions: string[];
    preferences: Record<string, any>;
    created_at: string;
}

export interface WishlistItem {
    id: string;
    user_id: string;
    product_id: string;
    created_at: string;
}
