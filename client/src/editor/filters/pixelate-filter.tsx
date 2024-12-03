import { convolution, BaseFilter } from "./base-filter";
import { Button, ToggleButtonGroup } from "@mui/joy";
import { useEffect, useMemo, useState } from "react";

export const Pixelate: BaseFilter = {
    name: "Pixelate",
    Options,
    applyFilter: (imageData: ImageData, options) => {
        const { width, height } = imageData;
        const result = new ImageData(width, height);

        const { pixelSize } = options;

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
                        result.data[index] = avgR;
                        result.data[index + 1] = avgG;
                        result.data[index + 2] = avgB;
                        result.data[index + 3] = 255;
                    }
                }
            }
        }

        return Promise.resolve(result);
    }
};

function Options({ setOptions }) {
    const [pixelSize, setPixelSize] = useState<string>("8");

    const options = useMemo(
        () => ({ pixelSize: Number(pixelSize) }),
        [pixelSize]
    );

    useEffect(() => {
        setOptions(options);
    }, [setOptions, options]);

    return (
        <ToggleButtonGroup
            variant="outlined"
            size="sm"
            value={pixelSize}
            onChange={(_, value) => value && setPixelSize(value)}
        >
            <Button value="4">Small</Button>
            <Button value="8">Medium</Button>
            <Button value="12">Large</Button>
        </ToggleButtonGroup>
    );
}
