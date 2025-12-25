
export enum UserRole {
    OWNER = 'OWNER',
    WALKER = 'WALKER',
    BUSINESS = 'BUSINESS'
}

export interface Dog {
    id: string;
    name: string;
    age: number;
    breed: string;
    distance: string;
    location: string;
    match: number;
    bio: string;
    imageUrl: string;
    traits: string[];
    is_castrated?: boolean;
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
