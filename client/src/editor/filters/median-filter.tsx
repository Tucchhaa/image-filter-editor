import { BaseFilter, medianFilter } from "./base-filter";
import { Slider } from "@mui/joy";
import { useEffect, useMemo, useState } from "react";

export const Median = {
    name: "Median",
    Options,
    applyFilter: (imageData: ImageData, { size }) =>
        medianFilter(imageData, size)
} as BaseFilter;

function Options({ setOptions }) {
    const [size, setSize] = useState(3);

    const options = useMemo(() => ({ size }), [size]);

    useEffect(() => { setOptions(options); }, [setOptions, options]);

    return (
        <Slider
            value={size}
            step={2}
            min={3}
            max={21}
            marks
            valueLabelDisplay="on"
            onChange={(_, value: number) => { setSize(value); }}
        />
    )
}
