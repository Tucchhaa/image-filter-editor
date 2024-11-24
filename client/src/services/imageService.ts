// imageService.ts
import { UploadResponse } from '../app-context';

class ImageService {
    private readonly API_URL = 'http://localhost:5000';

    async uploadImage(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        try {
            console.log('Starting upload...'); // Debug log

            const response = await fetch(`${this.API_URL}/upload`, {
                method: 'POST',
                body: formData,
                mode: 'cors',
            });

            console.log('Response status:', response.status); // Debug log

            const responseJson = await response.json();

            if (!response.ok) {
                console.error('Error response:', responseJson); // Debug log
                throw new Error(responseJson.message || 'Upload failed');
            }

            console.log('Success response:', responseJson); // Debug log
            return responseJson as UploadResponse;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }
}

export const imageService = new ImageService();
