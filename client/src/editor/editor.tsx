import { useContext, useMemo, Fragment, useRef, useEffect } from "react";
import { ReactCompareSlider } from "react-compare-slider";
import { Divider, Stack, Typography, useTheme } from "@mui/joy";

import { Laplacian } from "./filters/laplacian-filter";
import { Upscaling } from "./filters/upscaling-filter";
import { Filter } from "./filters/filter";
import { EditorContext } from "./editor-context";
import { EditorItem } from "./editor-item";
import { GammaCorrection } from "./filters/gamma-correction";
import { Gaussian } from "./filters/gaussian-filter";

export const Editor = () => {
    const theme = useTheme();
    const { imageHistory } = useContext(EditorContext);

    const filters: Filter[] = useMemo(() => [
        Laplacian,
        Upscaling,
        GammaCorrection,
        Gaussian,
    ], []);

    return (
        <div style={{ display: "flex", height: '100%' }}>
            <div
                style={{
                    minWidth: '300px',
                    backgroundColor: theme.palette.background.level1,
                }}
            >
                <div className="filters-title" style={{
                    backgroundColor: theme.palette.background.level2,
                }}>
                    <Typography level="title-lg">Filters</Typography>
                </div>

                <Stack
                    direction="column" spacing={0.5}
                    sx={{ padding: '0 2px' }}
                >
                    {
                        filters.map((item, index) => (
                            <Fragment key={index}>
                                <EditorItem filter={item}/>
                                <Divider/>
                            </Fragment>
                        ))
                    }
                </Stack>
            </div>
            <div className="editor-image-container">
                <ReactCompareSlider
                    itemOne={<CompareSliderImage imageData={imageHistory.getPreviousImage()}/>}
                    itemTwo={<CompareSliderImage imageData={imageHistory.getCurrentImage()}/>}
                />
            </div>
        </div>
    );
};

function CompareSliderImage({ imageData }: { imageData: ImageData }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = imageData.width;
        canvas.height = imageData.height;

        ctx.putImageData(imageData, 0, 0);
    }, [imageData]);

    return (
        <canvas
            style={{
                width: '100%',
                height: '100%',
                display: 'block',
             }}
            ref={canvasRef}>
        </canvas>
    );
}
