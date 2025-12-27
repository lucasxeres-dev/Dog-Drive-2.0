export interface Vaccination {
    id: string;
    dog_id: string;
    vaccine_name: string;
    vaccine_type?: string;
    vaccination_date: string;
    next_dose_date?: string;
    veterinarian_name?: string;
    clinic_name?: string;
    batch_number?: string;
    observations?: string;
    document_url?: string;
    created_at: string;
    updated_at: string;
}

export interface DogProfile {
    id: string;
    owner_id: string;
    name: string;
    breed?: string;
    birth_date?: string;
    age?: string;
    weight_kg?: number;
    sex?: 'male' | 'female';
    neutered?: boolean;
    microchip_number?: string;
    image_url?: string;
    traits?: string;
    request_instructions?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    created_at: string;
    updated_at: string;
}
