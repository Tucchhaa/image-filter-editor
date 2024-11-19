export type Filter = {
    name: string;

    Options: () => React.JSX.Element;

    applyFilter: (image: ImageData) => Promise<ImageData>;
}

export const convolution = (imageData: ImageData, kernel: number[][]): Promise<ImageData> =>
    new Promise(resolve => {
        const { width, height } = imageData;
        const input = imageData.data;
        const output = new Uint8ClampedArray(width * height * 4);

        const padding = Math.floor(kernel.length / 2);

        for(let y= padding; y < height - padding; y++) {
            for(let x= padding; x < width - padding; x++) {
                let r = 0, g = 0, b = 0;

                for(let dy = -padding; dy <= padding; dy++) {
                    for(let dx = -padding; dx <= padding; dx++) {
                        const pixelY = y + dy;
                        const pixelX = x + dx;
                        const index = (pixelY * width + pixelX) * 4;

                        const w = kernel[dy + padding][dx + padding];
                        r += input[index] * w;
                        g += input[index + 1] * w;
                        b += input[index + 2] * w;
                    }
                }

                const index = (y * width + x) * 4;
                output[index] = r;
                output[index + 1] = g;
                output[index + 2] = b;
                output[index + 3] = 255;
            }
        }

        resolve(new ImageData(output, width, height));
    });