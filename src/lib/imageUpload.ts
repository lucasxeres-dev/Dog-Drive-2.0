import imageCompression from 'browser-image-compression';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabaseClient';

interface UploadOptions {
    bucket: 'pet-photos' | 'documents' | 'avatars';
    userId: string;
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    onProgress?: (progress: number) => void;
}

interface UploadResult {
    url: string;
    path: string;
}

/**
 * Production-grade image upload with compression, retry logic, and error handling
 * 
 * @param file - Image file to upload
 * @param options - Upload configuration
 * @returns Public URL and storage path
 */
export async function uploadImage(
    file: File,
    options: UploadOptions
): Promise<UploadResult> {
    const {
        bucket,
        userId,
        maxSizeMB = 2, // Default: compress to max 2MB
        maxWidthOrHeight = 1200, // Default: max dimension 1200px
        onProgress
    } = options;

    try {
        // Step 1: Validate file type
        if (!file.type.startsWith('image/')) {
            throw new Error('Arquivo deve ser uma imagem');
        }

        // Step 2: Compress image (critical for mobile uploads)
        onProgress?.(10);
        const compressedFile = await imageCompression(file, {
            maxSizeMB,
            maxWidthOrHeight,
            useWebWorker: true,
            fileType: 'image/jpeg', // Force JPEG for consistency
        });

        onProgress?.(40);

        // Step 3: Generate UUID-based filename (no collisions)
        const fileExt = 'jpg'; // Always JPEG after compression
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        // Step 4: Upload with retry logic (3 attempts)
        let uploadError: Error | null = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const { error } = await supabase.storage
                    .from(bucket)
                    .upload(filePath, compressedFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (!error) {
                    uploadError = null;
                    break; // Success!
                }

                uploadError = error as Error;
                if (attempt < 3) {
                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, attempt * 1000));
                }
            } catch (err) {
                uploadError = err as Error;
            }

            onProgress?.(40 + (attempt * 15));
        }

        if (uploadError) {
            throw new Error(`Falha no upload: ${uploadError.message}`);
        }

        onProgress?.(90);

        // Step 5: Get public URL
        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        if (!data.publicUrl) {
            throw new Error('Falha ao gerar URL pública');
        }

        onProgress?.(100);

        return {
            url: data.publicUrl,
            path: filePath
        };

    } catch (error) {
        // Rethrow with user-friendly message
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Erro desconhecido ao enviar imagem');
    }
}

/**
 * Delete an uploaded image
 */
export async function deleteImage(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

    if (error) {
        console.error('Delete error:', error);
        throw new Error('Falha ao deletar imagem');
    }
}
