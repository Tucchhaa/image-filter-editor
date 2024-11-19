import { useCallback, useContext } from "react";
import { AppContext } from "./app-context";
import { useDropzone } from "react-dropzone";
import { Box, Grid, Typography, useTheme } from "@mui/joy";

export const ImageUploader = () => {
    const { updateAppState } = useContext(AppContext);
    const theme = useTheme();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if(acceptedFiles.length === 0)
            return;

        const file = acceptedFiles[0];
        const blobUrl = URL.createObjectURL(file);

        const image = new Image();
        image.src = blobUrl;

        image.onload = () => {
            const { naturalWidth: width, naturalHeight: height } = image;
            const canvas = new OffscreenCanvas(width, height);
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);

            const imageData = ctx.getImageData(0, 0, width, height);
            updateAppState({ imageData });
        }
    }, [updateAppState]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/png': ['.png'],
            'image/jpeg': ['.jpeg', '.jpg']
        },
        maxFiles: 1,
    });

    return (
        <Grid container sx={{ flexGrow: 1 }} className="image-uploader">
            <Box
                className="image-uploader__container"
                sx={{
                    borderColor: theme.palette.neutral[500],
                    backgroundColor: theme.palette.primary[900],
                }}
                {...getRootProps()}
            >
                <input {...getInputProps()} />
                <Typography level="h4">
                    {isDragActive ? "Drop your image here..." : "Drag & drop an image here, or click to upload"}
                </Typography>
            </Box>
        </Grid>
    );
}
