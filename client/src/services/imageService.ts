interface UploadResponse {
    status: string;
    message: string;
    details: {
        original_size: number;
        filename: string;
        mock_upscale_factor: number;
    };
}

const API_URL = 'http://localhost:5000';

export const imageService = {
    async uploadImage(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    },

    async checkServerStatus(): Promise<{ status: string }> {
        try {
            const response = await fetch(`${API_URL}/status`);
            return await response.json();
        } catch (error) {
            console.error('Error checking server status:', error);
            throw error;
        }
    }
};