import { convolution, Filter } from "./filter";
import { Chip, Slider } from "@mui/joy";
import { useEffect, useMemo, useState } from "react";

export const Gaussian = {
    name: "Gaussian",
    Options,
    applyFilter: (imageData: ImageData, { sigma }) => {
        const size = calcKernelSize(sigma);
        const kernel = [];

        for (let i = 0; i < size; i++) {
            kernel[i] = new Array(size);

            for(let j = 0; j < size; j++) {
                const y = i - Math.floor(size / 2);
                const x = j - Math.floor(size / 2);

                const power = -(x*x+y*y)/(2*sigma*sigma);
                const numer = Math.exp(power);
                const denom =  2*Math.PI*sigma*sigma;

                kernel[i][j] = numer/denom;
            }
        }

        // normalize kernel, so brightness will not change
        const sum = kernel.flat().reduce((a, b) => a + b, 0);

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                kernel[i][j] /= sum;
            }
        }

        return convolution(imageData, kernel);
    }
} as Filter;

function Options({ setOptions }) {
    const [sigma, setSigma] = useState<number>(2);

    const options = useMemo(() => ({ sigma }), [sigma]);

    useEffect(() => { setOptions(options); }, [setOptions, options]);

    return (
        <>
            <Slider
                sx={{ marginTop: '15px' }}
                value={sigma}
                step={0.05}
                min={0.05}
                max={5.0}
                valueLabelDisplay="on"
                onChange={(e, newValue: number) => { setSigma(newValue); }}
            />
            <div>
                <Chip variant="outlined">Kernel size: {calcKernelSize(sigma)}</Chip>
            </div>
        </>
    )
}

function calcKernelSize(sigma: number) {
    return Math.ceil(sigma * 6) | 1;
}