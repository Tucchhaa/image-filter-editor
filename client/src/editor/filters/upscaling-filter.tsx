import { Filter } from "./filter";

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
    
            const { url } = await response.json() as UploadResponse;
            if (!url) throw new Error('No image URL returned');
    
            const imageResponse = await fetch(url, { mode: 'cors' });
            const responseBlob = await imageResponse.blob();
            const bitmap = await createImageBitmap(responseBlob);
            
            const resultCanvas = document.createElement('canvas');
            resultCanvas.width = bitmap.width;
            resultCanvas.height = bitmap.height;
            const resultCtx = resultCanvas.getContext('2d')!;
            resultCtx.drawImage(bitmap, 0, 0);
            
            return resultCtx.getImageData(0, 0, bitmap.width, bitmap.height);
    
        } catch (error) {
            console.error('Error upscaling image:', error);
            return imageData;
        }
    }
} as Filter;

function Options() {
    return (
        <>
            <i>No options available</i>
        </>
    )
}