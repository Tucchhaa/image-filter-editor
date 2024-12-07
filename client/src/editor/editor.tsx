import { useContext, useMemo, Fragment, useRef, useEffect, useState } from "react";
import { ReactCompareSlider } from "react-compare-slider";
import { Button, Chip, Divider, Stack, ToggleButtonGroup, Typography, useTheme } from "@mui/joy";

import { Laplacian } from "./filters/laplacian-filter";
import { Upscaling } from "./filters/upscaling-filter";
import { BaseFilter } from "./filters/base-filter";
import { EditorContext } from "./editor-context";
import { EditorItem } from "./editor-item";
import { GammaCorrection } from "./filters/gamma-correction";
import { Gaussian } from "./filters/gaussian-filter";
import { Median } from "./filters/median-filter";
import { EdgeGlowFilter } from "./filters/edge-glow";
import { MosaicMadnessFilter } from "./filters/mosaic-madness";
import { SobelEdgeDetection } from "./filters/sobel-edge-filter";
import { BilateralFilter } from "./filters/bilateral-filter";
import { Pixelate } from "./filters/pixelate-filter";

export const Editor = () => {
    const theme = useTheme();
    const [compareMode, setCompareMode] = useState("previous")
    const { imageHistory, setCurrentHistoryIndex } = useContext(EditorContext);

    const filters: BaseFilter[] = useMemo(() => [
        Laplacian,
        Upscaling,
        GammaCorrection,
        Gaussian,
        Median,
        EdgeGlowFilter,
        MosaicMadnessFilter,
        SobelEdgeDetection,
        BilateralFilter,
        Pixelate
    ], []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().includes('MAC');
            const isCtrlZ = isMac ? event.metaKey && event.key === 'z' : event.ctrlKey && event.key === 'z';

            if (isCtrlZ) {
                event.preventDefault();

                const newIndex = event.shiftKey ? imageHistory.currentIndex + 1 : imageHistory.currentIndex - 1;

                setCurrentHistoryIndex(newIndex);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [setCurrentHistoryIndex]);

    const currentImage = imageHistory.getCurrentImage();

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
                <div className="editor-compare-mode">
                    <Chip variant="plain">Compare mode</Chip>
                    <ToggleButtonGroup
                        variant='outlined'
                        size='sm'
                        value={compareMode}
                        onChange={(_, value) => {
                            setCompareMode(value);
                        }}
                    >
                        <Button value="previous">Previous</Button>
                        <Button value="original">Original</Button>
                    </ToggleButtonGroup>
                </div>

                <ReactCompareSlider
                    itemOne={<CompareSliderImage
                        imageData={compareMode === 'original' ? imageHistory.original : imageHistory.getPreviousImage()}/>}
                    itemTwo={<CompareSliderImage imageData={currentImage}/>}
                />

                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <Chip variant="outlined">Resolution: {currentImage.width}x{currentImage.height}</Chip>
                    <br/>
                    <Chip variant="plain">Use Ctrl+Z and Ctrl+Shift+Z to move through history</Chip>
                </div>
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
        <div>
            <canvas
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                }}
                ref={canvasRef}>
            </canvas>
        </div>
    );
}
