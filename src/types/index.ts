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
