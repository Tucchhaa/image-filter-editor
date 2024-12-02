import { BaseFilter, gammaCorrection } from "./base-filter";
import { useEffect, useMemo, useState } from "react";
import { Slider } from "@mui/joy";

export const GammaCorrection = {
    name: "Gamma correction",
    Options,
    applyFilter: (imageData: ImageData, { gamma }) => {
        const inverseGamma = 1/gamma;

        return gammaCorrection(imageData, inverseGamma);
    }
} as BaseFilter;

function Options({ setOptions }) {
    const [gamma, setGamma] = useState<number>(2.2);

    const options = useMemo(() => ({ gamma }), [gamma]);

    useEffect(() => { setOptions(options); }, [setOptions, options]);

    return (
        <Slider
            value={gamma}
            step={0.05}
            min={0.05}
            max={5.0}
            valueLabelDisplay="on"
            onChange={(_, value: number) => { setGamma(value); }}
        />
    )
}
