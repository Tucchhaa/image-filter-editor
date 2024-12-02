import { Filter, processImageBySegments } from "./filter";
import { Slider } from "@mui/joy";
import { useEffect, useMemo, useState } from "react";

export const Median = {
    name: "Median",
    Options,
    applyFilter: (imageData: ImageData, { size }) =>
        processImageBySegments(
            imageData, size,
            (result, pixelIndex, _1, _2, data) => {
                if(data.r === undefined) {
                    data.r = [];
                    data.g = [];
                    data.b = [];
                }

                data.r.push(imageData.data[pixelIndex]);
                data.g.push(imageData.data[pixelIndex+1]);
                data.b.push(imageData.data[pixelIndex+2]);

                if(data.r.length < size*size)
                    return;

                const m = Math.floor(size / 2);

                result[0] = data.r.sort()[m];
                result[1] = data.g.sort()[m];
                result[2] = data.b.sort()[m];
            }
        )
} as Filter;

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
