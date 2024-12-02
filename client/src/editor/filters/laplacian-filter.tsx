import { convolution, Filter } from "./filter";
import { Button, ToggleButtonGroup } from "@mui/joy";
import { useCallback, useEffect, useMemo, useState } from "react";

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
} as Filter;

function Options({ setOptions }) {
    const [value, setValue] = useState<string>('4-connectivity');

    const onChange = useCallback((event, newValue) => {
        setValue(newValue);
    }, [value]);

    const options = useMemo(() => ({ type: value }), [value]);

    useEffect(() => { setOptions(options); }, [setOptions, options]);

    return (
        <ToggleButtonGroup
            variant='outlined'
            size='sm'
            value={value}
            onChange={onChange}
        >
            <Button value="4-connectivity">4-connectivity</Button>
            <Button value="8-connectivity">8-connectivity</Button>
        </ToggleButtonGroup>
    )
}
