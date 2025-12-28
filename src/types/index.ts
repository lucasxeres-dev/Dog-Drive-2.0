export enum UserRole {
    OWNER = 'owner',
    WALKER = 'walker',
    BOARDING = 'boarding',
    PETSHOP = 'petshop',
    GROOMING = 'grooming'
}

export interface UserProfile {
    id: string;
    role: UserRole;
    preferences: any;
    created_at?: string;
    // Add other fields as needed
}

export interface Dog {
    id: string;
    name: string;
    age: string;
    breed: string | null;
    gender?: 'male' | 'female' | null;
    size?: 'mini' | 'small' | 'medium' | 'large' | 'giant' | null;
    color?: string | null;
    weight?: number | null;
    is_castrated?: boolean;
    distance?: string;
    location: string;
    match?: number;
    description?: string | null;
    request_instructions?: string | null;
    image_url: string;
    traits: string | string[];
}

export interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
}

export interface ChatPreview {
    id: string;
    name: string;
    role: string;
    lastMessage: string;
    time: string;
    avatar: string;
    unreadCount: number;
    online: boolean;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
    id: string;
    service_type: 'walk' | 'boarding' | 'petshop' | 'grooming';
    status: BookingStatus;
    date: string;
    time: string;
    duration?: number; // minutes
    price: number;
    provider: {
        id: string;
        name: string;
        avatar?: string;
        role: string;
    };
    client_id: string;
    location: string;
    is_reviewed?: boolean;
}

export interface LocationUpdate {
    id: string;
    booking_id: string;
    provider_id: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    accuracy?: number;
}
