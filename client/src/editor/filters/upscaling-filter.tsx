import { BaseFilter } from "./base-filter";

interface UploadResponse {
    message?: string;
    url?: string;
}

export const Upscaling = {
    name: "Upscale",
    Options,
    applyFilter: async (imageData: ImageData) => {
        const API_URL = 'http://localhost:5100';
    
        const canvas = document.createElement('canvas');
        canvas.width = imageData.width;
        canvas.height = imageData.height;

        const ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);
    
        const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => resolve(blob!), 'image/png');
        });
    
        const formData = new FormData();
        formData.append('file', blob, 'image.png');
    
        try {
            const response = await fetch(`${API_URL}/upscale`, {
                method: 'POST',
                body: formData,
                mode: 'cors',
            });

            const json = await response.json() as { status: string; message: string; format: string; image: string };

            const mimeType = `image/${json.format.toLowerCase()}`;
            const imageDataURL = `data:${mimeType};base64,${json.image}`;

            const upscaledImage = new Image();
            upscaledImage.src = imageDataURL;

            await new Promise<void>((resolve, reject) => {
                upscaledImage.onload = () => resolve();
                upscaledImage.onerror = (err) => reject(err);
            });

            // Draw the image to a new canvas to get ImageData
            const canvas = document.createElement('canvas');
            canvas.width = upscaledImage.width;
            canvas.height = upscaledImage.height;

            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(upscaledImage, 0, 0);

            return ctx.getImageData(0, 0, upscaledImage.width, upscaledImage.height);
    
        } catch (error) {
            console.error('Error upscaling image:', error);
            return imageData;
        }
    }
} as BaseFilter;

function Options() {
    return (
        <>
            <i>No options available</i>
        </>
    )
}