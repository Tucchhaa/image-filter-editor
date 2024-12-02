import { Filter, processImageBySegments } from "./filter";
import { useEffect, useMemo, useState } from "react";
import { Slider } from "@mui/joy";

export const GammaCorrection = {
    name: "Gamma correction",
    Options,
    applyFilter: (imageData: ImageData, { gamma }) => {
        gamma = 1/gamma;

        return processImageBySegments(imageData, 1, (result, pixelIndex, _1, _2) => {
            result[0] = Math.pow(imageData.data[pixelIndex] / 255, gamma) * 255;
            result[1] = Math.pow(imageData.data[pixelIndex+1] / 255, gamma) * 255;
            result[2] = Math.pow(imageData.data[pixelIndex+2] / 255, gamma) * 255;
        });
    }
} as Filter;

function Options({ setOptions }) {
    const [value, setValue] = useState<number>(2.2);

    const options = useMemo(() => ({ gamma: value }), [value]);

    useEffect(() => { setOptions(options); }, [setOptions, options]);

    return (
        <Slider
            sx={{ marginTop: '15px' }}
            value={value}
            step={0.05}
            min={0.05}
            max={5.0}
            valueLabelDisplay="on"
            onChange={(e, newValue: number) => { setValue(newValue); }}
        />
    )
}
