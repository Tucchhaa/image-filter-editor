import { bilateralFilter, BaseFilter } from "./base-filter";
import { Button, ToggleButtonGroup , Typography } from "@mui/joy";
import { useEffect, useMemo, useState } from "react";

export const BilateralFilter = {
    name: "Bilateral Filter",
    Options,
    applyFilter: (imageData: ImageData, {sigmaColor , sigmaSpace}) =>
        bilateralFilter(imageData, sigmaColor , sigmaSpace)
} as BaseFilter;


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
            <Typography level="body-sm" sx={{ mb: 1 }}>
                Color Smoothing Intensity
            </Typography>
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
            
            <Typography level="body-sm" sx={{ mt: 2, mb: 1 }}>
                Spatial Smoothing Range
            </Typography>
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