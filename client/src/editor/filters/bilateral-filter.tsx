import { convolution, BaseFilter } from "./base-filter";
import { Button, ToggleButtonGroup } from "@mui/joy";
import { useEffect, useMemo, useState } from "react";

export const BilateralFilter: BaseFilter = {
    name: "Bilateral Filter",
    Options,
    applyFilter: (imageData: ImageData, options) => {
        const { width, height } = imageData;
        const result = new ImageData(width, height);

        const { sigmaColor, sigmaSpace } = options;

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

                            const colorDist = Math.sqrt(
                                (r - imageData.data[index]) ** 2 +
                                (g - imageData.data[index + 1]) ** 2 +
                                (b - imageData.data[index + 2]) ** 2
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
                result.data[index] = Math.round(sumR / weightSum);
                result.data[index + 1] = Math.round(sumG / weightSum);
                result.data[index + 2] = Math.round(sumB / weightSum);
                result.data[index + 3] = 255;
            }
        }

        return Promise.resolve(result);
    }
};

function Options({ setOptions }) {
    const [sigmaColor, setSigmaColor] = useState<string>("25");
    const [sigmaSpace, setSigmaSpace] = useState<string>("5");

    const options = useMemo(
        () => ({
            sigmaColor: parseInt(sigmaColor, 10),
            sigmaSpace: parseInt(sigmaSpace, 10),
        }),
        [sigmaColor, sigmaSpace]
    );

    useEffect(() => {
        setOptions(options);
    }, [setOptions, options]);

    return (
        <>
            <ToggleButtonGroup
                variant="outlined"
                size="sm"
                value={sigmaColor}
                onChange={(_, value) => value && setSigmaColor(value)}
            >
                <Button value="15">Smooth</Button>
                <Button value="25">Medium</Button>
                <Button value="35">Sharp</Button>
            </ToggleButtonGroup>
            <ToggleButtonGroup
                variant="outlined"
                size="sm"
                value={sigmaSpace}
                onChange={(_, value) => value && setSigmaSpace(value)}
            >
                <Button value="3">Small</Button>
                <Button value="5">Medium</Button>
                <Button value="7">Large</Button>
            </ToggleButtonGroup>
        </>
    );
}
