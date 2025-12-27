export enum UserRole {
    USER = 'user',
    OWNER = 'user',
    PROVIDER = 'provider',
    WALKER = 'provider',
    BUSINESS = 'business'
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
    age: string; // Changed to string to handle "3 anos", "2 meses" etc
    breed: string | null;
    distance: string;
    location: string;
    match: number;
    description: string | null;
    image_url: string;
    traits: string | string[]; // Can be string in DB or array in frontend
    is_castrated?: boolean;
    request_instructions?: string;
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
