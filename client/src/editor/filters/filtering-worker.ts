import * as Comlink from "comlink";

export type Color = [number, number, number];

export type AccumulateFuncParams = {
    pixelIndex: number,
    kernelY: number,
    kernelX: number,
    input: Uint8ClampedArray,
    [key: string]: any
};

export type AccumulateFunc = (
    result: Color,
    params: AccumulateFuncParams,
    segmentData: { [key: string]: any }
) => void;

const convolution = (imageData: ImageData, kernel: number[][]): ImageData =>
    processImageBySegments(imageData, kernel.length,
        (result, { kernelY, kernelX, pixelIndex, input }) => {
            result[0] += kernel[kernelY]![kernelX]! * input[pixelIndex]!;
            result[1] += kernel[kernelY]![kernelX]! * input[pixelIndex+1]!;
            result[2] += kernel[kernelY]![kernelX]! * input[pixelIndex+2]!;
        }
    );

const gammaCorrection = (imageData: ImageData, gammaInverse: number): ImageData =>
    processImageBySegments(
        imageData, 1,
        (result, { input, pixelIndex, gammaInverse }) => {
            result[0] = Math.pow(input[pixelIndex]!   / 255, gammaInverse) * 255;
            result[1] = Math.pow(input[pixelIndex+1]! / 255, gammaInverse) * 255;
            result[2] = Math.pow(input[pixelIndex+2]! / 255, gammaInverse) * 255;
        },
        { gammaInverse }
    );

const medianFilter = (imageData: ImageData, size: number): ImageData =>
    processImageBySegments(
        imageData, size,
        (result, { input, pixelIndex }, data) => {
            if(data.r === undefined) {
                data.r = [];
                data.g = [];
                data.b = [];
            }

            data.r.push(input[pixelIndex]);
            data.g.push(input[pixelIndex+1]);
            data.b.push(input[pixelIndex+2]);

            if(data.r.length < size * size)
                return;

            const m = Math.floor(size / 2);

            result[0] = data.r.sort()[m];
            result[1] = data.g.sort()[m];
            result[2] = data.b.sort()[m];
        }
    );

const sobelEdgeDetection = (imageData: ImageData, threshold: number): ImageData => {
    const kernelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];

    const kernelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];

    const dataX = convolution(imageData, kernelX);
    const dataY = convolution(imageData, kernelY);

    const result = new Uint8ClampedArray(imageData.width * imageData.height * 4);

    for (let i = 0; i < imageData.data.length; i += 4) {
        const gx = dataX.data[i];
        const gy = dataY.data[i];
        const grad = Math.sqrt(gx * gx + gy * gy);

        const value = grad > threshold ? 255 : 0;
        result[i] = value;
        result[i + 1] = value;
        result[i + 2] = value;
        result[i + 3] = 255;
    }

    return new ImageData(result, imageData.width, imageData.height);
};

const pixelate = (imageData: ImageData, pixelSize: number): ImageData => {
    const { width, height } = imageData;
    const result = new Uint8ClampedArray(width * height * 4);

    for (let y = 0; y < height; y += pixelSize) {
        for (let x = 0; x < width; x += pixelSize) {
            const r = [], g = [], b = [];

            for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
                for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
                    const index = ((y + dy) * width + (x + dx)) * 4;
                    r.push(imageData.data[index]);
                    g.push(imageData.data[index + 1]);
                    b.push(imageData.data[index + 2]);
                }
            }

            const avgR = Math.round(r.reduce((sum, value) => sum + value, 0) / r.length);
            const avgG = Math.round(g.reduce((sum, value) => sum + value, 0) / g.length);
            const avgB = Math.round(b.reduce((sum, value) => sum + value, 0) / b.length);

            for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
                for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
                    const index = ((y + dy) * width + (x + dx)) * 4;
                    result[index] = avgR;
                    result[index + 1] = avgG;
                    result[index + 2] = avgB;
                    result[index + 3] = 255;
                }
            }
        }
    }

    return new ImageData(result, width, height);
};
    
const bilateralFilter = (imageData: ImageData, sigmaColor: number, sigmaSpace: number): ImageData => {
    const { width, height } = imageData;
    const result = new Uint8ClampedArray(width * height * 4);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sumR = 0, sumG = 0, sumB = 0, weightSum = 0;

            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    const pixelY = y + dy;
                    const pixelX = x + dx;

                    if (pixelY >= 0 && pixelY < height && pixelX >= 0 && pixelX < width) {
                        const index = (pixelY * width + pixelX) * 4;
                        const r = imageData.data[index];
                        const g = imageData.data[index + 1];
                        const b = imageData.data[index + 2];

                        const centerIndex = (y * width + x) * 4;
                        const colorDist = Math.sqrt(
                            (r - imageData.data[centerIndex]) ** 2 +
                            (g - imageData.data[centerIndex + 1]) ** 2 +
                            (b - imageData.data[centerIndex + 2]) ** 2
                        );
                        const spatialDist = Math.sqrt(dx * dx + dy * dy);

                        const weight = Math.exp(-colorDist / (2 * sigmaColor ** 2)) *
                                        Math.exp(-spatialDist / (2 * sigmaSpace ** 2));

                        sumR += imageData.data[index] * weight;
                        sumG += imageData.data[index + 1] * weight;
                        sumB += imageData.data[index + 2] * weight;
                        weightSum += weight;
                    }
                }
            }

            const index = (y * width + x) * 4;
            result[index] = Math.round(sumR / weightSum);
            result[index + 1] = Math.round(sumG / weightSum);
            result[index + 2] = Math.round(sumB / weightSum);
            result[index + 3] = 255;
        }
    }

    return new ImageData(result, width, height);
};

Comlink.expose({ convolution, gammaCorrection, medianFilter , bilateralFilter , pixelate , sobelEdgeDetection });

/// ====

function processImageBySegments(
    imageData: ImageData,
    size: number,
    accumulate: AccumulateFunc,
    customParams: { [key: string]: any } = {}
): ImageData {
    const { width, height } = imageData;
    const output = new Uint8ClampedArray(width * height * 4);

    const padding = Math.floor(size / 2);
    const params = { input: imageData.data, ...customParams } as AccumulateFuncParams;

    for(let y= padding; y < height - padding; y++) {
        for(let x= padding; x < width - padding; x++) {
            const segmentData = {};
            let result = [0, 0, 0] as Color;

            for(let dy = -padding; dy <= padding; dy++) {
                for(let dx = -padding; dx <= padding; dx++) {
                    params.kernelY = dy + padding;
                    params.kernelX = dx + padding;
                    params.pixelIndex = ((y + dy) * width + (x + dx)) * 4;

                    accumulate(result, params, segmentData);
                }
            }

            const index = (y * width + x) * 4;

            for(let i= 0; i < 3; i++)
                output[index + i] = result[i]!;

            output[index+3] = 255;
        }
    }

    return new ImageData(output, width, height);
}