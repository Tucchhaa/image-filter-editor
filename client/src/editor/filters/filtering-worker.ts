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
    )

Comlink.expose({ convolution, gammaCorrection, medianFilter });

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