import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('✅ Cloudinary initialized');
} else {
    console.warn('⚠️  Cloudinary credentials not set - file storage disabled');
}

/**
 * Generate a signature for client-side uploads
 * @param folder - The folder to upload to (optional)
 * @param publicId - Optional public ID (filename)
 */
export function generateUploadSignature(folder: string = 'clinic-care', publicId?: string) {
    const timestamp = Math.round((new Date()).getTime() / 1000);

    const params: Record<string, any> = {
        timestamp,
        folder,
    };

    if (publicId) {
        params.public_id = publicId;
    }

    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);

    return {
        timestamp,
        signature,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder,
        publicId
    };
}

/**
 * Delete a file from Cloudinary
 * @param publicId - The public ID of the file to delete
 */
export async function deleteFile(publicId: string): Promise<boolean> {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        return false;
    }
}

export { cloudinary };
