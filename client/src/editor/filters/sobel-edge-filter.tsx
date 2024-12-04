import { convolution, BaseFilter } from "./base-filter";
import { Button, ToggleButtonGroup } from "@mui/joy";
import { useEffect, useMemo, useState } from "react";

export const SobelEdgeDetection: BaseFilter = {
    name: "Sobel Edge Detection",
    Options,
    applyFilter: (imageData: ImageData, options) => {
        const { threshold } = options;

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

        return Promise.all([
            convolution(imageData, kernelX),
            convolution(imageData, kernelY)
        ]).then(([dataX, dataY]) => {
            const result = new ImageData(imageData.width, imageData.height);

            for (let i = 0; i < imageData.data.length; i += 4) {
                const gx = dataX.data[i];
                const gy = dataY.data[i];
                const grad = Math.sqrt(gx * gx + gy * gy);

                result.data[i] = grad > threshold ? 255 : 0;
                result.data[i + 1] = grad > threshold ? 255 : 0;
                result.data[i + 2] = grad > threshold ? 255 : 0;
                result.data[i + 3] = 255;
            }

            return result;
        });
    }
};

function Options({ setOptions }) {
    const [threshold, setThreshold] = useState<number>(50);

    const options = useMemo(() => ({ threshold }), [threshold]);

    useEffect(() => {
        setOptions(options);
    }, [setOptions, options]);

    return (
        <ToggleButtonGroup
            variant="outlined"
            size="sm"
            value={String(threshold)}
            onChange={(_, value) => setThreshold(Number(value))}
        >
            <Button value="25">Low</Button>
            <Button value="50">Medium</Button>
            <Button value="75">High</Button>
        </ToggleButtonGroup>
    );
}