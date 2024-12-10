import { pixelate, BaseFilter } from "./base-filter";
import { Button, ToggleButtonGroup , Typography } from "@mui/joy";
import { useEffect, useMemo, useState } from "react";

export const Pixelate = {
    name: "Pixelate",
    Options,
    applyFilter: (imageData: ImageData, {pixelSize}) => 
        pixelate(imageData , pixelSize)
} as BaseFilter;

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
        <>
            <Typography level="body-sm" sx={{ mb: 1 }}>
                Pixel Block Size
            </Typography>
            <ToggleButtonGroup
                variant="outlined"
                size="sm"
                value={pixelSize}
                onChange={(_, value) => value && setPixelSize(value)}
            >
                <Button value="4">Small Blocks</Button>
                <Button value="8">Medium Blocks</Button>
                <Button value="12">Large Blocks</Button>
            </ToggleButtonGroup>
        </>
    );
}
