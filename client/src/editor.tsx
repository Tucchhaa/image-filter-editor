import { Box, Divider, Grid, Stack, Typography } from "@mui/joy";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { useContext } from "react";
import { AppContext } from "./app-context";

const EditorItem = ({ text }) => {
    return (
        <>
            <Box
                className="filter-item"
            >
                <Typography level="title-sm">{ text }</Typography>
            </Box>
            <Divider/>
        </>
    );
}

export const Editor = () => {
    const { image } = useContext(AppContext);

    return (
        <Grid
            container
            sx={{ flexGrow: 1, height: '100%' }}
        >
            <Grid
                xs={2}
                sx={{
                    backgroundColor: 'background.level1',
                }}
            >
                <Stack
                    direction="column" spacing={0.5}
                    sx={{ padding: '10px 2px' }}
                >
                    <div className="filters-title">
                        <Typography level="title-lg">Filter</Typography>
                    </div>
                    <EditorItem text="filter 1"/>
                    <EditorItem text="filter 2"/>
                    <EditorItem text="filter 3"/>
                    <EditorItem text="filter 4"/>
                    <EditorItem text="filter 5"/>
                    <EditorItem text="filter 6"/>
                    <EditorItem text="filter 7"/>
                </Stack>
            </Grid>
            <Grid xs={10} container sx={{ alignItems: 'center' }}>
                <div className="editor-image-container">
                    <ReactCompareSlider
                        itemOne={<ReactCompareSliderImage src={image.preview}/>}
                        itemTwo={<ReactCompareSliderImage src={image.preview}/>}
                    />
                </div>
            </Grid>
        </Grid>
    );
};
