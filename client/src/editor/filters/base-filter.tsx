// @ts-ignore
import FilteringWorker from './filtering-worker?worker'
import * as Comlink from 'comlink';
import React from 'react';

export type BaseFilter = {
    name: string;

    Options: ({ setOptions }: { setOptions: any }) => React.JSX.Element;

    applyFilter: (image: ImageData, options: any) => Promise<ImageData>;
}


const worker = new FilteringWorker();
const workerApi: Comlink.Remote<any> = Comlink.wrap(worker);

export async function convolution(imageData: ImageData, kernel: number[][]): Promise<ImageData> {
    return await workerApi.convolution(imageData, kernel);
}

export async function gammaCorrection(imageData: ImageData, gammaInverse: number): Promise<ImageData> {
    return await workerApi.gammaCorrection(imageData, gammaInverse);
}

export async function medianFilter(imageData: ImageData, size: number): Promise<ImageData> {
    return await workerApi.medianFilter(imageData, size);
}
