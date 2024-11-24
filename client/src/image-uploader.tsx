import { useCallback, useContext } from "react";
import { AppContext } from "./app-context";
import { useDropzone } from "react-dropzone";
import { Box, Grid, Typography, useTheme } from "@mui/joy";
import { imageService } from "./services/imageService";

export const ImageUploader = () => {
    const { updateAppState } = useContext(AppContext);
    const theme = useTheme();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if(acceptedFiles.length === 0)
            return;

        const file = acceptedFiles[0];
        const preview = URL.createObjectURL(file);

        // First update UI with the preview
        updateAppState({ 
            image: { 
                file, 
                preview 
            } 
        });

        try {
            // Process image data
            const image = new Image();
            image.src = preview;
            
            image.onload = async () => {
                // Handle image data processing
                const { naturalWidth: width, naturalHeight: height } = image;
                const canvas = new OffscreenCanvas(width, height);
                const ctx = canvas.getContext("2d");
                ctx.drawImage(image, 0, 0);
                const imageData = ctx.getImageData(0, 0, width, height);
                updateAppState({ imageData });

                // Upload to server
                try {
                    const serverResponse = await imageService.uploadImage(file);
                    
                    // Update state with server response
                    updateAppState({ 
                        image: { 
                            file, 
                            preview,
                            serverResponse 
                        } 
                    });
                } catch (error) {
                    console.error('Upload failed:', error);
                    // You might want to add error handling UI here
                }
            };
        } catch (error) {
            console.error('Image processing failed:', error);
            // Handle image processing error
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