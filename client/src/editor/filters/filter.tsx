export type Filter = {
    name: string;

    Options: ({ setOptions }) => React.JSX.Element;

    applyFilter: (image: ImageData, options: any) => Promise<ImageData>;
}

type Color = [number, number, number];

export const processImageBySegments =
    (
        imageData: ImageData, size: number,
        accumulate: (result: Color, pixelIndex: number, kernelY: number, kernelX: number, data: { [key: string]: any }) => void
    ): Promise<ImageData> =>
    new Promise(resolve => {
        const { width, height } = imageData;
        const input = imageData.data;
        const output = new Uint8ClampedArray(width * height * 4);

        const padding = Math.floor(size / 2);

        for(let y= padding; y < height - padding; y++) {
            for(let x= padding; x < width - padding; x++) {
                const data = {};
                let result = [0, 0, 0] as Color;

                for(let dy = -padding; dy <= padding; dy++) {
                    for(let dx = -padding; dx <= padding; dx++) {
                        const pixelY = y + dy;
                        const pixelX = x + dx;
                        const index = (pixelY * width + pixelX) * 4;

                        accumulate(result, index, dy + padding, dx + padding, data);
                    }
                }

                const index = (y * width + x) * 4;

                for(let i=0; i < 3; i++)
                    output[index + i] = result[i];

                output[index+3] = 255;
            }
        }

        resolve(new ImageData(output, width, height));
    });

export const convolution = (imageData: ImageData, kernel: number[][]): Promise<ImageData> =>
    processImageBySegments(imageData, kernel.length,
        (result: Color, pixelIndex, kernelY, kernelX) => {
            result[0] += kernel[kernelY][kernelX] * imageData.data[pixelIndex];
            result[1] += kernel[kernelY][kernelX] * imageData.data[pixelIndex+1];
            result[2] += kernel[kernelY][kernelX] * imageData.data[pixelIndex+2];
        }
    );