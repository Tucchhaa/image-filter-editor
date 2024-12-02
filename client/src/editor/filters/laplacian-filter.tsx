import { convolution, BaseFilter } from "./base-filter";
import { Button, ToggleButtonGroup } from "@mui/joy";
import { useEffect, useMemo, useState } from "react";

export const Laplacian = {
    name: "Laplacian",
    Options,
    applyFilter: (imageData: ImageData, options) => {
        const kernel = options.type === '4-connectivity'
            ? [
                [0, -1, 0],
                [-1, 5, -1],
                [0, -1, 0],
            ]
            : [
                [-1, -1, -1],
                [-1,  9, -1],
                [-1, -1, -1],
            ];

        return convolution(imageData, kernel);
    }
} as BaseFilter;

function Options({ setOptions }) {
    const [type, setType] = useState<string>('4-connectivity');

    const options = useMemo(() => ({ type }), [type]);

    useEffect(() => { setOptions(options); }, [setOptions, options]);

    return (
        <ToggleButtonGroup
            variant='outlined'
            size='sm'
            value={type}
            onChange={(_, value) => { setType(value); }}
        >
            <Button value="4-connectivity">4-connectivity</Button>
            <Button value="8-connectivity">8-connectivity</Button>
        </ToggleButtonGroup>
    )
}
