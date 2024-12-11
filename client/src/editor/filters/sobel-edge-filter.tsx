import { BaseFilter, sobelEdgeDetection } from "./base-filter";
import { Button, ToggleButtonGroup , Typography } from "@mui/joy";
import { useEffect, useMemo, useState } from "react";

export const SobelEdgeDetection = {
    name: "Sobel Edge Detection",
    Options,
    applyFilter: (imageData: ImageData, {threshold}) =>
        sobelEdgeDetection(imageData, threshold)
} as BaseFilter;

function Options({ setOptions }) {
    const [threshold, setThreshold] = useState<number>(50);

    const options = useMemo(() => ({ threshold }), [threshold]);

    useEffect(() => {
        setOptions(options);
    }, [setOptions, options]);

    return (
        <>
            <Typography level="body-sm" sx={{ mb: 1 }}>
                Edge Detection Sensitivity
            </Typography>
            <ToggleButtonGroup
                variant="outlined"
                size="sm"
                value={String(threshold)}
                onChange={(_, value) => setThreshold(Number(value))}
            >
                <Button value="25">Low Sensitivity</Button>
                <Button value="50">Medium Sensitivity</Button>
                <Button value="75">High Sensitivity</Button>
            </ToggleButtonGroup>
        </>
    );
}